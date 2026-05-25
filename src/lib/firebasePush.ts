// src/lib/firebasePush.ts
// Centralises all Firebase Cloud Messaging logic for the client.

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
} from "firebase/messaging";
import { supabase } from "./supabase";

// ─── Firebase config (from Vite env) ─────────────────────────────────────────

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// ─── Singleton app ────────────────────────────────────────────────────────────

function getFirebaseApp(): FirebaseApp {
  return getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();
}

// ─── Messaging singleton (browser only) ──────────────────────────────────────

let _messaging: Messaging | null = null;

function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (_messaging) return _messaging;
  try {
    _messaging = getMessaging(getFirebaseApp());
    return _messaging;
  } catch (err) {
    console.warn("[FCM] getMessaging failed:", err);
    return null;
  }
}

// ─── Service Worker registration ─────────────────────────────────────────────

let _swRegistration: ServiceWorkerRegistration | null = null;

export async function registerFirebaseSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  if (_swRegistration) return _swRegistration;

  try {
    _swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );
    console.log("[FCM SW] Registered:", _swRegistration.scope);
    return _swRegistration;
  } catch (err) {
    console.error("[FCM SW] Registration failed:", err);
    return null;
  }
}

// ─── Request permission + get FCM token ──────────────────────────────────────

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") return null;

  const messaging = getFirebaseMessaging();
  if (!messaging) return null;

  const swReg = await registerFirebaseSW();

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
      serviceWorkerRegistration: swReg ?? undefined,
    });
    return token || null;
  } catch (err) {
    console.error("[FCM] getToken failed:", err);
    return null;
  }
}
// ─── Save token to Supabase ───────────────────────────────────────────────────

export async function saveFcmToken(
  userId: string,
  token: string
): Promise<void> {
  const payload = {
    user_id: userId,
    token,
    device: navigator.userAgent.slice(0, 200),
  };

  const { error } = await supabase
    .from("user_push_tokens")
    .upsert(payload, {
      onConflict: "user_id,device",
    });

  if (error) {
    console.error("[FCM] saveFcmToken error:", error);
    return;
  }

  console.log("[FCM] Token updated ✅");
}

// ─── Init push for logged-in user (call once after login) ────────────────────

export async function initPushForUser(userId: string): Promise<void> {
  const token = await requestNotificationPermission();
  if (!token) return;
  await saveFcmToken(userId, token);
}

// ─── Foreground message listener ─────────────────────────────────────────────
// Shows a browser Notification when the app IS open (FCM doesn't auto-show
// in foreground — the SW only fires when the tab is in background).

export function listenForegroundMessages(): void {
  const messaging = getFirebaseMessaging();
  if (!messaging) return;

  onMessage(messaging, (payload: MessagePayload) => {
    const title =
      payload.notification?.title ?? "WhatsApp AI Platform";
    const body = payload.notification?.body ?? "";

    // Only show if the browser supports and permission is granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/badge-72.png",
      });
    }
  });
}

// ─── Send FCM push via Supabase Edge Function ─────────────────────────────────
// Calls the "send-notification" edge function which fans out to all tokens.

export async function sendFcmPush(
  userId: string,
  title: string,
  body: string,
  type: string = "general"
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-notification", {
      body: { user_id: userId, title, body, type },
    });
    if (error) {
      console.error("[FCM] sendFcmPush edge function error:", error);
    }
  } catch (err) {
    console.error("[FCM] sendFcmPush exception:", err);
  }
}