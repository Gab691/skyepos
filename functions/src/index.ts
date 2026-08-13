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
export const deleteOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in.');
  }

  const uid = context.auth.uid;

  // Validate input
  const orderId = data && data.orderId;
  if (!orderId || typeof orderId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing orderId');
  }

  // Check caller's role in the users collection
  const userSnap = await db.doc(`users/${uid}`).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError('permission-denied', 'User profile not found');
  }

  const role = (userSnap.data() as any).role;
  if (role !== 'MANAGER' && role !== 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  const orderRef = db.doc(`orders/${orderId}`);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found');
  }

  try {
    await orderRef.delete();
    return { success: true };
  } catch (err: any) {
    throw new functions.https.HttpsError('internal', err.message || 'Failed to delete order');
  }
});
