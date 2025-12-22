import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, connectAuthEmulator } from "firebase/auth";

// Replace this with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug log to check if variables are loaded (only in dev/browser console)
if (typeof window !== 'undefined') {
  console.log("Firebase Config Status:", {
    apiKey: firebaseConfig.apiKey ? "Loaded" : "Missing",
    authDomain: firebaseConfig.authDomain ? "Loaded" : "Missing",
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId ? "Loaded" : "Missing"
  });
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Enable verbose logging to see why 400 is happening
auth.settings.appVerificationDisabledForTesting = false; // Ensure this is false for prod

// Helper to set up Recaptcha
export function setupRecaptcha(elementId: string) {
  if (typeof window === 'undefined') return;

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      'size': 'invisible',
      'callback': () => {
        console.log("Recaptcha resolved");
      },
      'expired-callback': () => {
         console.log("Recaptcha expired");
      }
    });
  }
  return window.recaptchaVerifier;
}

// Add types for window
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}
