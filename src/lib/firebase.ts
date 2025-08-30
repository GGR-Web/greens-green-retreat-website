import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// IMPORTANT: Replace with your own Firebase configuration from your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyAcEu86tR0wnRgRKTwe_rmxrBLxud41ShU",
  authDomain: "sanctuary-stays.firebaseapp.com",
  projectId: "sanctuary-stays",
  storageBucket: "sanctuary-stays.firebasestorage.app",
  messagingSenderId: "493520881576",
  appId: "1:493520881576:web:6979491b38818365b3bf9d"
};

// Initialize Firebases
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
