// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

let app = null;
let auth = null;
let provider = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate basic config presence before initializing Firebase.
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  } catch (err) {
    // Log error but keep fallbacks so app can render without Firebase
    // (e.g., when env vars are missing in production builds)
    // eslint-disable-next-line no-console
    console.warn("Firebase not initialized. Landing page will still render.", err);
    app = null;
    auth = null;
    provider = null;
  }
} else {
  // Missing config — likely not provided in deployed environment. Keep null fallbacks.
  // eslint-disable-next-line no-console
  console.warn('Firebase config incomplete; skipping initialization.');
}

export { app, auth, provider, firebaseConfig };
export default firebaseConfig;
