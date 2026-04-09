import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let cached: { db: Firestore } | null | undefined;

export function getFirebase(): { db: Firestore } | null {
  if (cached !== undefined) {
    return cached;
  }
  if (!firebaseConfig.apiKey?.trim() || !firebaseConfig.projectId?.trim()) {
    cached = null;
    return null;
  }
  const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  cached = { db: getFirestore(app) };
  return cached;
}
