import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Client-side Firebase config. These NEXT_PUBLIC_ values are safe to expose
 * in the browser bundle - they identify the project, they do not grant
 * privileged access. Actual access control lives in Firestore security
 * rules (see /firestore.rules), never in this file.
 *
 * Do NOT add a service account key or any Admin SDK credential here.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};



function assertConfigured() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const message =
      `[firebase] Missing config values: ${missing.join(", ")}. ` +
      "Copy .env.local.example to .env.local and fill in your Firebase project settings.";

    if (process.env.NODE_ENV !== "test") {
      // eslint-disable-next-line no-console
      console.error(message);
    }

    throw new Error(message);
  }
}

assertConfigured();

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
