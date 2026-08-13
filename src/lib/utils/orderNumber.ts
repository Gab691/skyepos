import { doc, runTransaction, type Transaction } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

const COUNTER_DOC_PATH = "counters/orders";

/**
 * Atomically reserves the next order number inside an existing Firestore
 * transaction, so order creation and numbering happen as a single atomic
 * operation (no gaps caused by a failed write, no duplicate numbers from
 * concurrent cashiers).
 */
export async function reserveNextOrderNumber(transaction: Transaction): Promise<string> {
  const counterRef = doc(db, COUNTER_DOC_PATH);
  const counterSnap = await transaction.get(counterRef);

  const current = counterSnap.exists() ? (counterSnap.data().value as number) : 0;
  const next = current + 1;

  transaction.set(counterRef, { value: next }, { merge: true });

  return String(next).padStart(4, "0");
}

export async function peekNextOrderNumber(): Promise<string> {
  // Best-effort read for display purposes only; the authoritative value is
  // always reserved transactionally at creation time.
  let result = "001";
  await runTransaction(db, async (transaction) => {
    const counterRef = doc(db, COUNTER_DOC_PATH);
    const snap = await transaction.get(counterRef);
    const current = snap.exists() ? (snap.data().value as number) : 0;
    result = String(current + 1).padStart(4, "0");
  });
  return result;
}
