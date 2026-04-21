// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

/**
 * Firebase configuration
 * NOTE: Set VITE_FIREBASE_* in client/.env for auth to work
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Check if Firebase config is valid (all required values present)
 */
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId;
};

/**
 * Initialize Firebase safely - app loads even without Firebase config
 */
let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let githubProvider = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    githubProvider.addScope("user:email");
  }
} catch (err) {
  console.warn("Firebase initialization failed:", err.message);
}

export {
  app,
  auth,
  db,
  googleProvider,
  githubProvider,
};