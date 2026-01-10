// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

let app, auth, provider;

try {
const firebaseConfig = {
  apiKey: "AIzaSyALzAZ3bWIdhlbMom29FMwweREqMg2SW_Y",
  authDomain: "justcoding-46f9f.firebaseapp.com",
  projectId: "justcoding-46f9f",
  storageBucket: "justcoding-46f9f.firebasestorage.app",
  messagingSenderId: "1024753498583",
  appId: "1:1024753498583:web:5d50f979b7f9952c3a7392",
  measurementId: "G-05MFX441MV"
};

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
} catch (err) {
  console.warn("Firebase not initialized. Landing page will still render.", err);
  auth = null;       // fallback so AuthContext doesn’t crash
  provider = null;
}

export { app, auth, provider };
