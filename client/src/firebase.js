// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

/**
 * Firebase configuration
 * NOTE:
 * - All variables MUST exist in Vercel with VITE_ prefix
 * - No fallbacks, no silent disabling
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
 * Initialize Firebase safely (prevents double init in Vite / HMR)
 */
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

/**
 * Firebase Auth
 */
const auth = getAuth(app);

/**
 * OAuth Providers
 */
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Optional: request additional scopes (safe)
googleProvider.setCustomParameters({ prompt: "select_account" });
githubProvider.addScope("user:email");

export {
  app,
  auth,
  googleProvider,
  githubProvider,
};
