import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgzGflErXB61oSlYHHyErb3Y6Sys3iRU8",
  authDomain: "foodcalorie-563bf.firebaseapp.com",
  projectId: "foodcalorie-563bf",
  storageBucket: "foodcalorie-563bf.firebasestorage.app",
  messagingSenderId: "834401162247",
  appId: "1:834401162247:web:77a55a0dc6208640f5c6a2",
  measurementId: "G-EQQV7HTREG",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
