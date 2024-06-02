
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrUGzptVRWXZdP8khcAsfOx95oBVYpXR4",
  authDomain: "educamais-escola-88941.firebaseapp.com",
  projectId: "educamais-escola-88941",
  storageBucket: "educamais-escola-88941.appspot.com",
  messagingSenderId: "1025640919466",
  appId: "1:1025640919466:web:a16248e1c831b2ab5f3bd3",
  measurementId: "G-TTX6YSYJDR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);