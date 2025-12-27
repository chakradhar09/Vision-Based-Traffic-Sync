import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Firebase configuration
 * These should be set as environment variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase App
 */
export function initFirebase(): { app: FirebaseApp; db: Firestore } | null {
  try {
    // Check if Firebase config is available
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase configuration not found. Reporting feature will work in demo mode.');
      return null;
    }

    if (!app) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    }

    return { app, db: db! };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

/**
 * Get Firestore instance
 */
export function getFirestoreInstance(): Firestore | null {
  if (!db) {
    const init = initFirebase();
    return init?.db || null;
  }
  return db;
}

/**
 * Check if Firebase is available
 */
export function isFirebaseAvailable(): boolean {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId && 
         firebaseConfig.apiKey !== 'undefined' && firebaseConfig.projectId !== 'undefined';
}

