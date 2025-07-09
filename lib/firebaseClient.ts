// src/lib/firebaseClient.ts
"use client"; // This directive is crucial for Next.js to treat this as a client component

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { Analytics, getAnalytics } from "firebase/analytics";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env
    .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigKeys: Array<keyof FirebaseConfig> = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key]) {
    const errorMessage = `Firebase Error: Missing required environment variable NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`;
    console.error(errorMessage);
    // In production builds, throwing here can halt the build. You might want to remove 'throw new Error' for production.
    throw new Error(errorMessage);
  }
}

let app: FirebaseApp;
// Declare a variable to hold the Analytics instance, but don't initialize it yet.
let firebaseAnalyticsInstance: Analytics | undefined;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase Client SDK initialized.");
} else {
  app = getApps()[0]; // Use the already-initialized app
  console.log(
    "Firebase Client SDK already initialized (reusing existing app)."
  );
}

// Initialize Firebase services (Auth and Firestore can initialize on server without 'window')
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
// Removed: console.log(db, "Firestore initialized."); - too verbose for production logs

// --- NEW: Function to initialize Analytics conditionally ---
// This function will be called from layout.tsx *after* cookie consent is given.
export const initializeFirebaseAnalytics = (
  firebaseApp: FirebaseApp
): Analytics | undefined => {
  // Only attempt to initialize if running in a browser environment AND measurementId is provided
  if (typeof window !== "undefined" && firebaseConfig.measurementId) {
    try {
      // Prevent re-initialization if it's already been called (e.g., during hot reload)
      if (!firebaseAnalyticsInstance) {
        firebaseAnalyticsInstance = getAnalytics(firebaseApp);
        console.log("Firebase Analytics initialized.");
      } else {
        console.log("Firebase Analytics (reused instance).");
      }
      return firebaseAnalyticsInstance;
    } catch (e) {
      console.error("Failed to initialize Firebase Analytics:", e);
      return undefined;
    }
  }
  return undefined;
};

// Export the Firebase app instance for reuse (e.g., by initializeFirebaseAnalytics)
export const firebaseApp = app;

// Removed the problematic direct analytics export:
// export const analytics: Analytics | undefined = firebaseConfig.measurementId ? getAnalytics(app) : undefined;

// If you need to access the analytics instance later, use firebaseAnalyticsInstance,
// but ensure initializeFirebaseAnalytics has been called first.
// For most use cases, you'd track events via a custom hook or directly where needed.
