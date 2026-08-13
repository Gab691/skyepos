import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { reserveNextOrderNumber } from "@/lib/utils/orderNumber";
import {
  calculateChange,
  calculateSubtotal,
  calculateTotal,
  hasSufficientPayment,
  isValidMoneyAmount,
  isValidPrice,
  isValidQuantity,
} from "@/lib/utils/currency";
import {
  ACTIVE_ORDER_STATUSES,
  ORDER_STATUS,
  type NewOrderInput,
  type Order,
  type OrderItem,
} from "@/types/order";

export class OrderValidationError extends Error {}
export class OrderStateError extends Error {}

function toOrder(id: string, data: Record<string, unknown>): Order {
  return { id, ...(data as Omit<Order, "id">) };
}

/**
 * Re-derives and validates every financial value for an order from its raw
 * item list rather than trusting subtotal/total figures a caller supplies.
 * This is the one place order totals are computed.
 */
function buildValidatedItemsAndTotals(
  rawItems: Pick<OrderItem, "productId" | "name" | "unitPrice" | "quantity">[],
  amountReceived: number
) {
  if (rawItems.length === 0) {
    throw new OrderValidationError("An order must contain at least one item.");
  }

  const items: OrderItem[] = rawItems.map((item) => {
    if (!isValidQuantity(item.quantity)) {
      throw new OrderValidationError(`Invalid quantity for "${item.name}".`);
    }
    if (!isValidPrice(item.unitPrice)) {
      throw new OrderValidationError(`Invalid price for "${item.name}".`);
    }
    return {
      productId: item.productId,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: calculateSubtotal(item.unitPrice, item.quantity),
    };
  });

  const total = calculateTotal(items);

  if (!isValidMoneyAmount(amountReceived)) {
    throw new OrderValidationError("Invalid payment amount.");
  }
  if (!hasSufficientPayment(amountReceived, total)) {
    throw new OrderValidationError("Amount received is less than the order total.");
  }

  const change = calculateChange(amountReceived, total);
  if (change < 0) {
    throw new OrderValidationError("Change cannot be negative.");
  }

  return { items, subtotal: total, total, change };
}

export interface CreateOrderParams {
  items: Pick<OrderItem, "productId" | "name" | "unitPrice" | "quantity">[];
  amountReceived: number;
  cashierId: string;
  cashierName: string;
}

/**
 * Creates a new order atomically: reserves the next order number, validates
 * and recalculates all money values server-side-equivalent (inside the
 * transaction), and writes a single order document with status PENDING.
 * Using a transaction also protects against accidental double submission
 * producing two order numbers for one checkout click.
 */
export async function createOrder(params: CreateOrderParams): Promise<string> {
  const { items, subtotal, total, change } = buildValidatedItemsAndTotals(
    params.items,
    params.amountReceived
  );

  const ordersCollection = collection(db, COLLECTIONS.orders);

  let docId = "";

  await runTransaction(db, async (transaction) => {
    const orderNumber = await reserveNextOrderNumber(transaction);
    docId = `order_${orderNumber}`;

    const orderData: Omit<Order, "id"> = {
      orderNumber,
      items,
      subtotal,
      total,
      payment: {
        method: "cash",
        amountReceived: params.amountReceived,
        change,
      },
      status: ORDER_STATUS.PENDING,
      createdAt: serverTimestamp() as Timestamp,
      startedAt: null,
      completedAt: null,
      cashierId: params.cashierId,
      cashierName: params.cashierName,
      startedBy: null,
      completedBy: null,
    };

    const newOrderRef = doc(ordersCollection, docId);
    transaction.set(newOrderRef, orderData);
  });

  return docId;
}

/**
 * Marks an order as PREPARING. Guarded by a transaction so it can only
 * happen once, from PENDING, preventing a race between two employees.
 */
export async function startOrder(orderId: string, employeeId: string): Promise<void> {
  const orderRef = doc(db, COLLECTIONS.orders, orderId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(orderRef);
    if (!snap.exists()) {
      throw new OrderStateError("Order not found.");
    }
    const status = snap.data().status as Order["status"];
    if (status !== ORDER_STATUS.PENDING) {
      throw new OrderStateError("Order has already been started or completed.");
    }

    transaction.update(orderRef, {
      status: ORDER_STATUS.PREPARING,
      startedAt: serverTimestamp(),
      startedBy: employeeId,
    });
  });
}

/**
 * Marks an order as COMPLETED (served). Allowed from PENDING or PREPARING -
 * updates the existing order document in place, it never creates a second
 * copy for Sales History (Sales History is just a filtered view of orders
 * where status === COMPLETED).
 */
export async function completeOrder(orderId: string, employeeId: string): Promise<void> {
  const orderRef = doc(db, COLLECTIONS.orders, orderId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(orderRef);
    if (!snap.exists()) {
      throw new OrderStateError("Order not found.");
    }
    const status = snap.data().status as Order["status"];
    if (status === ORDER_STATUS.COMPLETED) {
      throw new OrderStateError("Order has already been completed.");
    }

    transaction.update(orderRef, {
      status: ORDER_STATUS.COMPLETED,
      completedAt: serverTimestamp(),
      completedBy: employeeId,
    });
  });
}

/**
 * Deletes an order using a callable Cloud Function. Deletion is an admin
 * operation and cannot be performed directly from the client because Firestore
 * security rules disallow deleting orders from client-side code.
 */
export async function deleteOrder(orderId: string): Promise<void> {
  const { getFunctions, httpsCallable } = await import("firebase/functions");
  const { firebaseApp } = await import("@/lib/firebase/client");
  const functions = getFunctions(firebaseApp);
  const callable = httpsCallable(functions, "deleteOrder");
  await callable({ orderId });
}

/**
 * Real-time listener for the To-Do List: active orders only (PENDING or
 * PREPARING), oldest first so the most urgent orders surface naturally.
 */
export function subscribeToActiveOrders(
  onChange: (orders: Order[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  // Use two equality queries to avoid requiring a composite index for
  // `where(..., 'in', ...)` combined with `orderBy`.
  const qPending = query(
    collection(db, COLLECTIONS.orders),
    where("status", "==", ORDER_STATUS.PENDING),
    orderBy("createdAt", "asc")
  );

  const qPreparing = query(
    collection(db, COLLECTIONS.orders),
    where("status", "==", ORDER_STATUS.PREPARING),
    orderBy("createdAt", "asc")
  );

  let pendingDocs: Map<string, Order> = new Map();
  let preparingDocs: Map<string, Order> = new Map();

  function emitCombined() {
    const combined = Array.from(new Map([...pendingDocs, ...preparingDocs]).values());
    combined.sort((a, b) => {
      const aMs = a.createdAt && typeof (a.createdAt as any).toMillis === "function"
        ? (a.createdAt as any).toMillis()
        : new Date(a.createdAt as any).getTime();
      const bMs = b.createdAt && typeof (b.createdAt as any).toMillis === "function"
        ? (b.createdAt as any).toMillis()
        : new Date(b.createdAt as any).getTime();
      return aMs - bMs;
    });
    onChange(combined);
  }

  const unsubscribePending = onSnapshot(
    qPending,
    (snapshot) => {
      pendingDocs = new Map(snapshot.docs.map((d) => [d.id, toOrder(d.id, d.data())]));
      emitCombined();
    },
    (error) => onError(error)
  );

  const unsubscribePreparing = onSnapshot(
    qPreparing,
    (snapshot) => {
      preparingDocs = new Map(snapshot.docs.map((d) => [d.id, toOrder(d.id, d.data())]));
      emitCombined();
    },
    (error) => onError(error)
  );

  return () => {
    unsubscribePending();
    unsubscribePreparing();
  };
}

export interface SalesHistoryRange {
  start: Date;
  end: Date;
}

/**
 * Real-time listener for Sales History: completed orders only, optionally
 * scoped to a date range so we never pull the entire historical archive
 * when only a recent window is needed.
 */
export function subscribeToSalesHistory(
  onChange: (orders: Order[]) => void,
  onError: (error: Error) => void,
  range?: SalesHistoryRange
): Unsubscribe {
  const constraints = [where("status", "==", ORDER_STATUS.COMPLETED)];

  if (range) {
    constraints.push(
      where("completedAt", ">=", Timestamp.fromDate(range.start)),
      where("completedAt", "<=", Timestamp.fromDate(range.end))
    );
  }

  const q = query(collection(db, COLLECTIONS.orders), ...constraints, orderBy("completedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((d) => toOrder(d.id, d.data())));
    },
    (error) => onError(error)
  );
}
