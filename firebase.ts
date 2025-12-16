import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, set, runTransaction, child, update } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsFxXqVR-sVB3q5AifvZDl41P17mgGrtU",
  authDomain: "fitness-app-c19f0.firebaseapp.com",
  databaseURL: "https://fitness-app-c19f0-default-rtdb.firebaseio.com",
  projectId: "fitness-app-c19f0",
  storageBucket: "fitness-app-c19f0.firebasestorage.app",
  messagingSenderId: "469356591287",
  appId: "1:469356591287:web:847fb8b66d75ad4f63b532",
  measurementId: "G-CSBK484PPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
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
      alert("Firebase Configuration Error: Please check your Firebase project setup.");
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