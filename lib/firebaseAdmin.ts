// src/lib/firebaseAdmin.ts
// This file runs on the server (Node.js runtime)
import admin from "firebase-admin";

import { App } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

interface ServiceAccountKey {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

const serviceAccountKey: ServiceAccountKey = {
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") as string,
};

function isValidServiceAccount(config: ServiceAccountKey): boolean {
  return (
    typeof config.projectId === "string" &&
    config.projectId.length > 0 &&
    typeof config.clientEmail === "string" &&
    config.clientEmail.length > 0 &&
    typeof config.privateKey === "string" &&
    config.privateKey.length > 0
  );
}

// Declare variables outside the function to maintain state
let cachedAdminApp: admin.app.App | undefined; // Use admin.app.App for type
let cachedAdminDb: admin.firestore.Firestore | undefined;

export function getFirebaseAdmin(): {
  adminApp: admin.app.App | undefined;
  adminDb: admin.firestore.Firestore | undefined;
} {
  if (cachedAdminApp && cachedAdminDb) {
    return { adminApp: cachedAdminApp, adminDb: cachedAdminDb };
  }

  if (!admin.apps.length) {
    if (isValidServiceAccount(serviceAccountKey)) {
      try {
        const app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountKey),
        });
        cachedAdminApp = app;
        cachedAdminDb = admin.firestore(app);
        console.log("Firebase Admin SDK initialized successfully.");
      } catch (error: any) {
        console.error("Error initializing Firebase Admin SDK:", error);
        console.debug("Service Account Config attempted:", {
          projectId: serviceAccountKey.projectId,
          clientEmail: serviceAccountKey.clientEmail,
          privateKeyFirst50: serviceAccountKey.privateKey?.substring(0, 50),
          privateKeyLast50: serviceAccountKey.privateKey?.slice(-50),
          privateKeyLength: serviceAccountKey.privateKey?.length,
        });
        cachedAdminApp = undefined;
        cachedAdminDb = undefined;
      }
    } else {
      console.error(
        "Firebase Admin SDK: Missing or invalid service account environment variables."
      );
      console.debug("Service Account Config attempted:", {
        projectId: serviceAccountKey.projectId,
        clientEmail: serviceAccountKey.clientEmail,
        privateKeyFirst50: serviceAccountKey.privateKey?.substring(0, 50),
        privateKeyLast50: serviceAccountKey.privateKey?.slice(-50),
        privateKeyLength: serviceAccountKey.privateKey?.length,
      });
      cachedAdminApp = undefined;
      cachedAdminDb = undefined;
    }
  } else {
    cachedAdminApp = admin.app();
    cachedAdminDb = admin.firestore(cachedAdminApp);
    console.log(
      "Firebase Admin SDK already initialized (reusing existing app)."
    );
  }

  return { adminApp: cachedAdminApp, adminDb: cachedAdminDb };
}

// Export the initialized services and the admin namespace
export const { adminApp, adminDb } = getFirebaseAdmin();
export { admin }; // <--- Make sure this line is here to export the admin namespace
