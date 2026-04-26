import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let cached: { db: Firestore; auth: Auth } | null | undefined;

export function getFirebase(): { db: Firestore; auth: Auth } | null {
  if (cached !== undefined) {
    return cached;
  }
  if (!firebaseConfig.apiKey?.trim() || !firebaseConfig.projectId?.trim()) {
    cached = null;
    return null;
  }
  const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  let auth: Auth;
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/already-initialized') {
        auth = getAuth(app);
      } else {
        throw e;
      }
    }
  }
  cached = { db: getFirestore(app), auth };
  return cached;
}
