import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABhv7m5FV4JmsgqLm5Z9g_DfCo1289zKQ",
  authDomain: "projectmanagement-42516.firebaseapp.com",
  projectId: "projectmanagement-42516",
  storageBucket: "projectmanagement-42516.firebasestorage.app",
  messagingSenderId: "965180102116",
  appId: "1:965180102116:web:84deaccaed5a31eb37e3f1",
  measurementId: "G-2SMMBWMTHP"
};

// Initialize Firebase (safely for Next.js SSR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics is client-side only
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
