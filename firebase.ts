import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, runTransaction, child } from "firebase/database";

// TODO: REPLACE WITH YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Simple User ID management (Persist in LocalStorage)
export const getUserId = () => {
  let uid = localStorage.getItem('streamslicer_uid');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('streamslicer_uid', uid);
  }
  return uid;
};

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

export const logUsage = (userId: string, cost: number, details: any) => {
  const logRef = ref(db, `logs/${userId}/${Date.now()}`);
  set(logRef, {
    cost,
    ...details
  });
};