import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase Project Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAcF6-S7l1gBGC0ON21q5KmKDbimRmsf5s',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'myweatherapp-4678c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'myweatherapp-4678c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'myweatherapp-4678c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '162413724969',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:162413724969:web:3f4f49b5d007e35705e338',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-60F5F39NGC'
};

// Check if valid user keys are present
export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    firebaseConfig.projectId === 'myweatherapp-4678c'
  );
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
