// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBbhES_cDHSmeJA6OUDuPoy3fQqnPIaxPM",
  authDomain: "fertitrack-f2f46.firebaseapp.com",
  projectId: "fertitrack-f2f46",
  storageBucket: "fertitrack-f2f46.firebasestorage.app",
  messagingSenderId: "1021782099997",
  appId: "1:1021782099997:web:dd3961385e88058f3f9ef4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;