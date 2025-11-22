import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyBXiPRfix9c6zMChCxSRFO8Gv0UXc1N5Vw",
  authDomain: "resqnet-ef7c1.firebaseapp.com",
  projectId: "resqnet-ef7c1",
  storageBucket: "resqnet-ef7c1.firebasestorage.app",
  messagingSenderId: "787881713578",
  appId: "1:787881713578:web:5c6433c03b684a4fb2d5d3",
  measurementId: "G-9FNWH4JKSZ"
};

let app;
// Check if any Firebase apps have already been initialized
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the existing app
}

// Initialize Auth with persistence
const auth = getAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { app, auth };