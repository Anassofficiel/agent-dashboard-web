// src/lib/firebase.ts

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging, getToken } from "firebase/messaging";
import { supabase } from "./supabase";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
console.log("FIREBASE CONFIG =", firebaseConfig);
// ─── Singleton app ────────────────────────────────────────────────────────────

const app: FirebaseApp =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// ─── Messaging — synchronous singleton (browser only) ────────────────────────
// getMessaging() is synchronous and safe to call at module load time in
// browsers that support the Push API. It will throw in SSR / Node — guard with
// typeof window. The consumer (NotificationDropdown) already guards with
// "Notification" in window before ever calling getToken().

let messaging: Messaging;

if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    // Unsupported browser (e.g. Safari < 16) — messaging stays undefined.
    console.warn("[Firebase] Messaging not supported:", err);
  }
}

export { messaging };

// ─── Service Worker registration ─────────────────────────────────────────────
// Call once at app startup from main.tsx.

export async function registerFirebaseSW(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
    console.log("[Firebase SW] Registered");
  } catch (err) {
    console.error("[Firebase SW] Registration failed:", err);
  }
}
export async function enablePush(userId:string) {
const permission =
await Notification.requestPermission();

if (permission !== "granted") {
return;
}

const messaging =
getMessaging();

const token =
await getToken(
messaging,
{
vapidKey:
import.meta.env.VITE_FIREBASE_VAPID_KEY
}
);

if (!token) return;

await supabase 
.from("user_push_tokens")
.upsert({
user_id:userId,
token,
device:navigator.userAgent
});

console.log("Push Saved");
}
