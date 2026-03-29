import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const isTestEnvironment = process.env.NODE_ENV === "test";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    (isTestEnvironment ? "test-api-key" : undefined),
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    (isTestEnvironment ? "test-project.firebaseapp.com" : undefined),
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    (isTestEnvironment ? "test-project" : undefined),
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (isTestEnvironment ? "test-project.firebasestorage.app" : undefined),
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    (isTestEnvironment ? "1234567890" : undefined),
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    (isTestEnvironment ? "1:1234567890:web:testappid" : undefined),
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    (isTestEnvironment ? "G-TESTMEASURE" : undefined),
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;
