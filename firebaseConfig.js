// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
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
//const analytics = getAnalytics(app);

export { db };