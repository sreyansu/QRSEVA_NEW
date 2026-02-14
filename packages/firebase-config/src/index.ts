// Firebase Configuration
import { initializeApp } from "firebase/app";

// Standard Firebase config object (placeholders for now)
const firebaseConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "demo-key",
    authDomain: "qrseva-prod.firebaseapp.com",
    projectId: "qrseva-prod",
    storageBucket: "qrseva-prod.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
// export const app = initializeApp(firebaseConfig);
export const app = null; // Placeholder to avoid runtime errors before env vars are set
