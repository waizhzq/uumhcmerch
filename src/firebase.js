// Firebase is switched on when the VITE_FIREBASE_* environment variables are set
// (in Netlify: Site configuration → Environment variables). Without them the site still works.
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = config.apiKey ? initializeApp(config) : null;

let analytics = null;
if (app && config.measurementId) {
  isSupported().then((ok) => { if (ok) analytics = getAnalytics(app); }).catch(() => {});
}

// Records which jerseys people look at and when they tap "order".
export function track(name, params = {}) {
  try { if (analytics) logEvent(analytics, name, params); } catch { /* ignore */ }
}
