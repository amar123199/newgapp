// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Firebase config (use your config here)
const firebaseConfig = {
  apiKey: "AIzaSyC8do0YsSqiNxje5sEAYOAwIPEWsZX3OVY",
  authDomain: "gym-app-7ccef.firebaseapp.com",
  projectId: "gym-app-7ccef",
  storageBucket: "gym-app-7ccef.firebasestorage.app",
  messagingSenderId: "391406419724",
  appId: "1:391406419724:web:610d8e0af37cca3b201329",
  measurementId: "G-7ELL3L3PRL"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
