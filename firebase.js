import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvGTD6Kcyms_tBHDdFB4C8xC5oV-XJdHE",
  authDomain: "shwshawaty-asya.firebaseapp.com",
  projectId: "shwshawaty-asya",
  storageBucket: "shwshawaty-asya.firebasestorage.app",
  messagingSenderId: "753212644426",
  appId: "1:753212644426:web:23ca447829cb6585aedab3",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
