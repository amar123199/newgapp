// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging"; // Add messaging import
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8do0YsSqiNxje5sEAYOAwIPEWsZX3OVY",
  authDomain: "gym-app-7ccef.firebaseapp.com",
  projectId: "gym-app-7ccef",
  storageBucket: "gym-app-7ccef.firebasestorage.app",
  messagingSenderId: "391406419724",
  appId: "1:391406419724:web:610d8e0af37cca3b201329",
  measurementId: "G-7ELL3L3PRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Ensure Firebase Messaging is only initialized on the client-side
// let messaging;
// if (typeof window !== "undefined") {
//   messaging = getMessaging(app); // Initialize messaging only in the browser
// }

export { db,   };