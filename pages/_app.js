import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'; // Import useRouter hook
import { Provider } from "../components/ui/provider"
import { messaging } from '../firebaseConfig'; // Import messaging
import { getMessaging, getToken, onMessage } from "firebase/messaging"; // Add messaging import
import { Directions } from '@mui/icons-material';

export default function App({ Component, pageProps }) {
  const router = useRouter(); // Use useRouter to get current path

  // Create a state to track if permission has been requested
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [ntoken, setNToken] = useState("")

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if (messaging) {
          const token = await getToken(messaging, {
            vapidKey: 'BPqBEn4y5T_7aSuMcMH7glEmP_8NuNOkqVCq8E3P7HibV-Iim45tZDYRi_a8RbnHevS_xiUvZzZMdJPfl0hQV6I',
          });
          console.log('Notification permission granted. Token:', token);
          setNToken(token);
        } else {
          console.error('Firebase messaging is not initialized');
        }
      } else {
        console.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Function to handle user interaction (for example, a button click)
  const handlePermissionRequest = () => {
    if (!permissionRequested) {
      requestNotificationPermission();
      setPermissionRequested(true); // Track that permission has been requested
    }
  };

  useEffect(() => {
    // Optional: Add other logic if needed when component mounts
  }, []);

  useEffect(() => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Optional: Add other logic if needed when component mounts
  }, []); // Empty dependency array ensures this runs once when the component mounts


  // Inline CSS styles for centering the button
  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh', // Full screen height
  };

  const buttonStyle = {
    padding: '15px 30px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  };

  const buttonHoverStyle = {
    backgroundColor: '#45a049',
    transform: 'scale(1.05)',
  };


 // Only render the button on /payment page
 if (router.pathname !== '/payment') {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}

return (
  <Provider>
    <Component {...pageProps} />
    {/* Trigger permission request on button click */}
    <div style={buttonContainerStyle}>
      <button 
        style={buttonStyle}
        onClick={handlePermissionRequest}
        onMouseEnter={(e) => e.target.style = { ...buttonStyle, ...buttonHoverStyle }} // On hover
        onMouseLeave={(e) => e.target.style = buttonStyle} // Reset on mouse leave
      >
        Enable Notifications
      </button>
      <p>{ntoken}</p>
    </div>
  </Provider>
);
}
