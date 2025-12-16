import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, runTransaction, child, update } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Configuration uses environment variables for security and flexibility.
// If these are not set, it falls back to placeholders which will likely fail authentication.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://your-project-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
      alert("Firebase Configuration Error: Please check your environment variables (FIREBASE_API_KEY, etc).");
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// Database Functions

export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/credits`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // New user gets 0 credits initially
      return 0;
    }
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
};

export const addCredits = async (userId: string, amount: number) => {
  const userRef = ref(db, `users/${userId}/credits`);
  await runTransaction(userRef, (currentCredits) => {
    return (currentCredits || 0) + amount;
  });
};

export const deductCredits = async (userId: string, amount: number): Promise<boolean> => {
  const userRef = ref(db, `users/${userId}/credits`);
  let success = false;
  
  await runTransaction(userRef, (currentCredits) => {
    if ((currentCredits || 0) >= amount) {
      success = true;
      return currentCredits - amount;
    }
    return currentCredits; // Abort if insufficient
  });
  
  return success;
};

export const checkFreeTrialEligibility = async (userId: string): Promise<boolean> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/hasUsedFreeTrial`));
    // If key doesn't exist, they are eligible. If it is false, eligible.
    return !snapshot.exists() || snapshot.val() === false;
  } catch (error) {
    console.error("Error checking free trial:", error);
    // If DB is down or config is wrong, assume not eligible to prevent abuse
    return false; 
  }
};

export const markFreeTrialUsed = async (userId: string) => {
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, { hasUsedFreeTrial: true });
};

export const logUsage = (userId: string, cost: number, details: any) => {
  const logRef = ref(db, `logs/${userId}/${Date.now()}`);
  set(logRef, {
    cost,
    ...details
  });
};