import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  router: AppRouterInstance
) => {
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
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
    });

    // Navigate to the welcome page
    router.push("/welcome");

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string,
  router: AppRouterInstance
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Navigate to the welcome page
    router.push("/welcome");

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with Google
export const signInWithGoogle = async (router: AppRouterInstance) => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists, if not create one
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });
    }

    // Navigate to the welcome page
    router.push("/welcome");

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out
export const signOut = async (router: AppRouterInstance) => {
  try {
    await firebaseSignOut(auth);

    // Navigate to the login page after signing out
    router.push("/login");
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
