// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPhw5KF1NbZqlfP73Tsk-61dN6ItliYaI",
  authDomain: "beauty-app-43dc9.firebaseapp.com",
  projectId: "beauty-app-43dc9",
  storageBucket: "beauty-app-43dc9.appspot.com",
  messagingSenderId: "494337317243",
  appId: "1:494337317243:web:1edcb8208d40a40fd185de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
