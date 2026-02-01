// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDp8S7TaKua_a-vKkS7sUx6bGoyqamx-UQ",
  authDomain: "heal-link-558bb.firebaseapp.com",
  projectId: "heal-link-558bb",
  storageBucket: "heal-link-558bb.firebasestorage.app",
  messagingSenderId: "672232958460",
  appId: "1:672232958460:web:b956b228ef9560fa6b6a79",
  measurementId: "G-HD3NT1MZ4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;