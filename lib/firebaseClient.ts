// src/lib/firebaseClient.ts
"use client"; // This directive is crucial for Next.js to treat this as a client component

import { initializeApp, FirebaseApp } from "firebase/app"; // Import FirebaseApp type
import { getAuth, Auth } from "firebase/auth"; // Import Auth type
import { getFirestore, Firestore } from "firebase/firestore"; // Import Firestore type

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

// Check if all required environment variables are present
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
    // It's good practice to log an error if essential config is missing
    console.error(
      `Firebase Error: Missing required environment variable NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`
    );
    // You might want to throw an error or handle this more gracefully in a real app
    // e.g., if (typeof window !== 'undefined') alert("Firebase not configured correctly!");
  }
}

// Initialize Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// Get Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

console.log("Firebase Client SDK initialized.");
