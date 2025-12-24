import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATxB5I8AS6Y5jvhy0MEZ-D7rcC5DN7bj0",
  authDomain: "zoom-23c40.firebaseapp.com",
  projectId: "zoom-23c40",
  storageBucket: "zoom-23c40.firebasestorage.app",
  messagingSenderId: "615236824704",
  appId: "1:615236824704:web:5d731e3571625ce4fa0065",
  measurementId: "G-X2VB1MJKJY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
