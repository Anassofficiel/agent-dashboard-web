
import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType =
    | "credits"
    | "upgrade"
    | "report"
    | "disconnected"
    | "welcome"
    | "profile_created"
    | string;

interface CreateNotificationParams {
    user_id: string;
    title: string;
    message: string;
    type: NotifType;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function createNotification(
    params: CreateNotificationParams
): Promise<void> {
    const { error } = await supabase.from("notifications").insert({
        user_id: params.user_id,
        title: params.title,
        message: params.message,
        type: params.type,
        is_read: false,
    });

    if (error) {
        console.error("[sendNotification] insert error:", error);
    }
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export async function notifyProfileCreated(
    userId: string,
    profileName?: string
): Promise<void> {
    await createNotification({
        user_id: userId,
        title: "🚀 Profile created successfully",
        message: profileName
            ? `"${profileName}" is ready. Connect WhatsApp to start automating.`
            : "Your new profile is ready. Connect WhatsApp to start automating.",
        type: "profile_created",
    });
}

export async function notifyWhatsAppDisconnected(
    userId: string,
    profileName?: string
): Promise<void> {
    await createNotification({
        user_id: userId,
        title: "🔴 WhatsApp disconnected",
        message: profileName
            ? `Profile "${profileName}" lost its connection. Reconnect to restore service.`
            : "A WhatsApp profile lost its connection. Reconnect to restore service.",
        type: "disconnected",
    });
}

export async function notifyCreditsLow(
    userId: string,
    credits?: number
): Promise<void> {
    await createNotification({
        user_id: userId,
        title: "⚡ Credits running low",
        message:
            credits !== undefined
                ? `You have ${credits} credits left. Top up to keep your automations running.`
                : "Your credits are running low. Top up to keep your automations running.",
        type: "credits",
    });
}

export async function notifyUpgradeAvailable(userId: string): Promise<void> {
    await createNotification({
        user_id: userId,
        title: "👑 Upgrade available — 20% OFF",
        message:
            "Unlock 10,000 credits and 10 AI profiles. Limited-time offer on Pro Plan.",
        type: "upgrade",
    });
}

export async function notifyDailyReport(
    userId: string,
    messageCount?: number
): Promise<void> {
    await createNotification({
        user_id: userId,
        title: "📈 Daily report ready",
        message:
            messageCount !== undefined
                ? `Your automation sent ${messageCount.toLocaleString()} messages today.`
                : "Your daily automation report is ready. Check your dashboard.",
        type: "report",
    });
}