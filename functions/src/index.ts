import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize the Admin SDK once for Cloud Functions.
admin.initializeApp();

const db = admin.firestore();

/**
 * Callable function to delete an order. Only users with role MANAGER or ADMIN
 * may delete orders. This runs with Admin privileges so it bypasses client
 * Firestore security rules.
 */
export const deleteOrder = functions.https.onCall(async (data: { orderId?: unknown; reason?: unknown }, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in.');
  }

  const uid = context.auth.uid;

  // Validate input
  const rawOrderId = data && (data.orderId as unknown);
  const orderId = typeof rawOrderId === 'string' ? rawOrderId : undefined;
  const rawReason = data && (data.reason as unknown);
  const reason = typeof rawReason === 'string' && rawReason.trim() ? rawReason.trim() : null;

  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing orderId');
  }

  // Check caller's role in the users collection
  const userSnap = await db.doc(`users/${uid}`).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError('permission-denied', 'User profile not found');
  }

  const role = (userSnap.data() as { role?: unknown }).role as string | undefined;
  if (role !== 'MANAGER' && role !== 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  const orderRef = db.doc(`orders/${orderId}`);

  try {
    // Use a transaction to check order state and update atomically so we
    // never cancel an order that has already been completed or canceled.
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(orderRef);
      if (!snap.exists) {
        throw new functions.https.HttpsError('not-found', 'Order not found');
      }

      const currentStatus = (snap.data() as any).status as string | undefined;

      if (currentStatus === 'COMPLETED') {
        throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel a completed order.');
      }
      if (currentStatus === 'CANCELED') {
        throw new functions.https.HttpsError('failed-precondition', 'Order has already been canceled.');
      }

      transaction.update(orderRef, {
        status: 'CANCELED',
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
        canceledBy: uid,
        cancelReason: reason,
      });

      // Write an audit record for easier queries on canceled items.
      const auditRef = db.collection('orderAudit').doc();
      transaction.set(auditRef, {
        orderId,
        action: 'CANCELED',
        reason,
        performedBy: uid,
        performedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // If the thrown error is an HttpsError, rethrow it so Firebase returns the proper status.
    if (err && typeof (err as any).code === 'string') {
      throw err;
    }
    throw new functions.https.HttpsError('internal', message || 'Failed to cancel order');
  }
});

