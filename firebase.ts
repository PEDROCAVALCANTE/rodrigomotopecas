import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBf-aJ8vCO0vFyR75J7uUiHokOzM8Y7TyA",
  authDomain: "rodrigo-moto-96844.firebaseapp.com",
  projectId: "rodrigo-moto-96844",
  storageBucket: "rodrigo-moto-96844.firebasestorage.app",
  messagingSenderId: "270046185312",
  appId: "1:270046185312:web:34ac228060baef60630005"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);