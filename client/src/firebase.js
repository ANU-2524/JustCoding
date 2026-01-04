// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

let app, auth, provider;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyA8_lGVxfA_O7kW25MmlUID1EWGH1QGXFU",
  authDomain: "justcoding-c34ba.firebaseapp.com",
  projectId: "justcoding-c34ba",
  storageBucket: "justcoding-c34ba.firebasestorage.app",
  messagingSenderId: "243844798756",
  appId: "1:243844798756:web:78fcbe38d579d3615b3bb1",
  measurementId: "G-NMVN0TPD8V"
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
