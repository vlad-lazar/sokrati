// src/utils/auth.ts
"use client"; // Essential for client-side Firebase operations and Next.js hooks

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut, // Renamed to avoid conflict with our exported signOut
  updateProfile,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  sendPasswordResetEmail, // No need to import 'type User' specifically, just 'User'
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp, deleteDoc } from "firebase/firestore"; // Import Timestamp
import { auth, db } from "./firebaseClient"; // Ensure correct path to your Firebase client config
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { setCookie, destroyCookie } from "nookies"; // Import nookies

/**
 * Helper function to set the Firebase ID token cookie.
 * This cookie is used for potential server-side authentication checks.
 */
const setAuthCookie = async (user: User) => {
  try {
    const token = await user.getIdToken();
    setCookie(null, "firebaseIdToken", token, {
      path: "/", // Make cookie available across the entire site
      httpOnly: false, // Set to true if you were only reading it server-side. For client JS access, it must be false.
      // For true server-side protection, httpOnly: true is highly recommended
      // and then you'd need server actions/middleware to read it.
      // For a purely client-side approach, this being false is fine.
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "lax", // 'Strict' is more secure, 'Lax' allows it on top-level navigations
      // 'None' requires secure: true and works across origins (e.g., for iframes)
    });
    console.log("Auth cookie 'firebaseIdToken' set successfully.");
  } catch (error) {
    console.error("Error setting auth cookie:", error);
    // Depending on your error handling strategy, you might not want to re-throw here
    // as it could prevent navigation. For critical failures, re-throwing is fine.
    throw new Error("Failed to set authentication cookie.");
  }
};

/**
 * Sign up a new user with email and password, update profile, create Firestore document,
 * set authentication cookie, and navigate to the welcome page.
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  router: AppRouterInstance
): Promise<User> => {
  // Explicitly promise a User
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName,
    });

    // Create a user document in Firestore
    // Using serverTimestamp() for consistency in createAt field is often better
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: Timestamp.now(), // Use Firestore Timestamp for server-side consistency
      // You might add roles, etc. here
    });

    // Set the Firebase ID token cookie
    await setAuthCookie(user);

    // Navigate to the welcome page
    router.push("/");

    console.log(`User signed up successfully: ${user.uid} (${user.email})`);
    return user;
  } catch (error: any) {
    console.error("Error during sign-up:", error);
    throw new Error(error.message || "Failed to sign up.");
  }
};

/**
 * Sign in an existing user with email and password, set authentication cookie,
 * and navigate to the welcome page.
 */
export const signIn = async (
  email: string,
  password: string,
  router: AppRouterInstance
): Promise<User> => {
  // Explicitly promise a User
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Set the Firebase ID token cookie
    await setAuthCookie(user);

    // Navigate to the welcome page
    router.push("/");

    console.log(`User signed in successfully: ${user.uid} (${user.email})`);
    return user;
  } catch (error: any) {
    console.error("Error during sign-in:", error);
    throw new Error(error.message || "Failed to sign in.");
  }
};

/**
 * Sign in with Google using a popup, create Firestore document if new user,
 * set authentication cookie, and navigate to the welcome page.
 */
export const signInWithGoogle = async (
  router: AppRouterInstance
): Promise<User> => {
  // Explicitly promise a User
  console.log("signInWithGoogle function called.");
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists, if not create one
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      console.log(
        "Creating new user document in Firestore after Google sign-in."
      );
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: Timestamp.now(), // Use Firestore Timestamp
        // You might add roles, etc. here
      });
    } else {
      console.log("User document already exists for Google sign-in.");
    }

    // Set the Firebase ID token cookie
    await setAuthCookie(user);

    // Navigate to the welcome page
    router.push("/");

    console.log(
      `User signed in with Google successfully: ${user.uid} (${user.email})`
    );
    return user;
  } catch (error: any) {
    console.error("Error during Google sign-in:", error);
    throw new Error(error.message || "Failed to sign in with Google.");
  }
};

/**
 * Sign out the current user, destroy the authentication cookie,
 * and navigate to the login page.
 */
export const signOut = async (router: AppRouterInstance): Promise<void> => {
  try {
    await firebaseSignOut(auth); // Use the renamed signOut from Firebase

    // Destroy the Firebase ID token cookie
    destroyCookie(null, "firebaseIdToken", { path: "/" });

    // Navigate to the login page after signing out
    router.push("/login");

    console.log("User signed out successfully.");
  } catch (error: any) {
    console.error("Error during sign-out:", error);
    throw new Error(error.message || "Failed to sign out.");
  }
};

/**
 * Get the current user from Firebase Auth.
 * Note: For real-time updates, use onAuthStateChanged from AuthContext.
 */
export const getCurrentUser = (): User | null => {
  const user = auth.currentUser;
  // console.log("Current user (from getCurrentUser):", user?.uid || "None"); // Log UID for less clutter
  return user;
};

export const deleteUserAccount = async (
  router: AppRouterInstance,
  reauthToken?: string // For email/password users, this would be their password
): Promise<void> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.warn("No user is currently authenticated to delete.");
    throw new Error("No user is logged in.");
  }

  try {
    // Attempt to delete the user. This might throw 'auth/requires-recent-login'.
    await deleteUser(currentUser);

    // If deletion is successful, also delete the user's document from Firestore
    await deleteDoc(doc(db, "users", currentUser.uid));

    // Destroy the Firebase ID token cookie
    destroyCookie(null, "firebaseIdToken", { path: "/" });

    // Navigate to the login page after successful deletion
    router.push("/login");

    console.log(
      `User account ${currentUser.uid} and associated data deleted successfully.`
    );
  } catch (error: any) {
    console.error("Error deleting user account:", error);

    // Handle re-authentication requirement
    if (error.code === "auth/requires-recent-login") {
      console.warn("User requires recent re-authentication to delete account.");

      if (reauthToken) {
        // Attempt to re-authenticate with provided credentials
        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          reauthToken
        );
        try {
          await reauthenticateWithCredential(currentUser, credential);
          console.log(
            "User re-authenticated successfully. Retrying account deletion..."
          );
          // After successful re-authentication, retry the deletion
          await deleteUser(currentUser);
          await deleteDoc(doc(db, "users", currentUser.uid)); // Delete Firestore doc
          destroyCookie(null, "firebaseIdToken", { path: "/" });
          router.push("/login");
          console.log(
            `User account ${currentUser.uid} deleted successfully after re-authentication.`
          );
        } catch (reauthError: any) {
          console.error("Re-authentication failed:", reauthError);
          // Specific error for re-authentication attempt
          throw new Error(
            reauthError.message ||
              "Failed to re-authenticate. Please check your credentials."
          );
        }
      } else {
        // If no reauthToken provided, inform the caller about the requirement
        throw new Error(
          "This operation requires recent authentication. Please sign in again or provide credentials."
        );
      }
    } else {
      // Handle other deletion errors
      throw new Error(error.message || "Failed to delete account.");
    }
  }
};
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log(`Password reset email sent to ${email}`);
  } catch (error: any) {
    // Consider refining error type as unknown and narrowing
    console.error("Error sending password reset email:", error);
    // Firebase auth errors have specific codes (e.g., 'auth/user-not-found')
    let errorMessage = "Failed to send password reset email.";
    if (error.code) {
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No user found with that email address.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }
};
