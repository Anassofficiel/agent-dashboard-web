// @ts-nocheck
/// <reference lib="deno.ns" />

// supabase/functions/send-notification/index.ts
// Deploy: supabase functions deploy send-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SendPayload {
  user_id: string;
  title: string;
  body: string;
  type?: string; // stored in notifications table
}

interface FcmTokenRow {
  fcm_token: string;
}

// ─── Firebase JWT helper (service account → access token) ─────────────────────

async function getFirebaseAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(
    Deno.env.get("FIREBASE_SERVICE_ACCOUNT") ?? "{}"
  );

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  // Encode JWT header + payload
  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signingInput = `${header}.${body}`;

  // Import private key
  const privateKey = serviceAccount.private_key
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");

  const binaryKey = Uint8Array.from(atob(privateKey), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${signingInput}.${sigB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

// ─── Send single FCM message ──────────────────────────────────────────────────

async function sendFcmMessage(
  token: string,
  title: string,
  body: string,
  accessToken: string
): Promise<void> {
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          webpush: {
            notification: {
              title,
              body,
              icon: "/icon-192.png",
              badge: "/badge-72.png",
              vibrate: [200, 100, 200],
              requireInteraction: false,
            },
            fcmOptions: { link: "/" },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    // Token expired / unregistered — caller can clean it up
    if (
      err?.error?.details?.[0]?.errorCode === "UNREGISTERED" ||
      err?.error?.code === 404
    ) {
      console.warn("Stale FCM token:", token.slice(0, 20));
    } else {
      console.error("FCM send error:", JSON.stringify(err));
    }
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const payload: SendPayload = await req.json();
    const { user_id, title, body, type = "general" } = payload;

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: "user_id, title, body are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Supabase admin client ──────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── 1. Save notification to table ─────────────────────────────────────
    const { error: insertError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        title,
        message: body,
        type,
        is_read: false,
      });

    if (insertError) {
      console.error("Insert notification error:", insertError);
    }

    // ── 2. Fetch all FCM tokens for this user ─────────────────────────────
    const { data: tokenRows, error: tokenError } = await supabase
      .from("user_push_tokens")
      .select("fcm_token")
      .eq("user_id", user_id);

    if (tokenError) {
      console.error("Fetch tokens error:", tokenError);
      return new Response(
        JSON.stringify({ ok: true, pushed: 0, note: "Token fetch failed" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!tokenRows || tokenRows.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, pushed: 0, note: "No FCM tokens registered" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── 3. Get Firebase access token once, then fan out ───────────────────
    const accessToken = await getFirebaseAccessToken();

    const results = await Promise.allSettled(
      (tokenRows as FcmTokenRow[]).map((row) =>
        sendFcmMessage(row.fcm_token, title, body, accessToken)
      )
    );

    const pushed = results.filter((r) => r.status === "fulfilled").length;

    return new Response(
      JSON.stringify({ ok: true, pushed, total: tokenRows.length }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("send-notification error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});