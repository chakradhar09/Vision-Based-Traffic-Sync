import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { logger } from './utils/logger';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let auth: Auth | undefined;

// Validate Firebase configuration
const isFirebaseConfigValid = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    typeof firebaseConfig.apiKey === 'string' &&
    typeof firebaseConfig.authDomain === 'string' &&
    typeof firebaseConfig.projectId === 'string'
  );
};

try {
  // Only initialize if config is present and valid, otherwise we'll let the app handle missing firebase
  if (isFirebaseConfigValid()) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      storage = getStorage(app);
      auth = getAuth(app);
      logger.info("Firebase initialized successfully");
  } else {
      logger.warn("Firebase config missing or invalid. App will run in demo mode.");
  }
} catch (e) {
  logger.error("Firebase init error", e);
}

export { db, storage, auth };
