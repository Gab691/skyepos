import type { Timestamp } from "firebase/firestore";

/**
 * Centralized order status. Do not use arbitrary strings for order status
 * anywhere else in the app - always reference this type / the ORDER_STATUS
 * constants below.
 */
export type OrderStatus = "PENDING" | "PREPARING" | "COMPLETED" | "CANCELED";

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PREPARING: "PREPARING",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const satisfies Record<OrderStatus, OrderStatus>;

/** Statuses that still belong on the operational To-Do List. */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["PENDING", "PREPARING"];

export type PaymentMethod = "cash";

/**
 * A snapshot of a purchased item at the time of sale. This is intentionally
 * decoupled from the live Product record - historical orders must not change
 * if the product's current price/name changes later.
 */
export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  amountReceived: number;
  change: number;
}

export interface Order {
  id: string;
  orderNumber: string;

  items: OrderItem[];

  subtotal: number;
  total: number;

  payment: OrderPayment;

  status: OrderStatus;

  createdAt: Timestamp;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;

  cashierId: string;
  cashierName: string;

  startedBy: string | null;
  completedBy: string | null;

  // Cancellation / soft-delete auditing
  canceledAt?: Timestamp | null;
  canceledBy?: string | null;
  cancelReason?: string | null;
}

/** Shape used when creating a new order, before Firestore assigns an id. */
export type NewOrderInput = Omit<
  Order,
  "id" | "orderNumber" | "createdAt" | "startedAt" | "completedAt" | "startedBy" | "completedBy" | "status" | "canceledAt" | "canceledBy" | "cancelReason"
>;

/** Urgency levels shown on the To-Do List, derived from elapsed waiting time. */
export type UrgencyLevel = "normal" | "attention" | "urgent" | "critical";

export const URGENCY_THRESHOLDS_MINUTES = {
  attention: 3,
  urgent: 5,
  critical: 10,
} as const;
