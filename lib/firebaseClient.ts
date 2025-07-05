// src/lib/firebaseClient.ts
"use client"; // This directive is crucial for Next.js to treat this as a client component

import { initializeApp, getApps, FirebaseApp } from "firebase/app"; // Import FirebaseApp type
import { getAuth, Auth } from "firebase/auth"; // Import Auth type
import { getFirestore, Firestore } from "firebase/firestore"; // Import Firestore type
import { getAnalytics, Analytics } from "firebase/analytics"; // Import Analytics type

// Define the shape of your firebaseConfig for better type safety (optional but good practice)
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Optional if you don't always use analytics
}

// Firebase configuration object
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env
    .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // This can be undefined
};

// Validate required environment variables
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
    throw new Error(errorMessage); // Throw an error to prevent app initialization
  }
}

// Initialize Firebase App (lazy initialization to avoid multiple instances)
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase Client SDK initialized.");
} else {
  app = getApps()[0]; // Use the already-initialized app
  console.log("Firebase Client SDK already initialized.");
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Optionally initialize Firebase Analytics
// export const analytics: Analytics | undefined = firebaseConfig.measurementId
//   ? getAnalytics(app)
//   : undefined;

// Export the Firebase app for reuse
export const firebaseApp = app;
