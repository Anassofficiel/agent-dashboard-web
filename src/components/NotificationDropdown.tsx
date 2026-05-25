"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Rocket,
    BarChart2,
    WifiOff,
    PartyPopper,
    CheckCheck,
    BellOff,
    X,
    Sparkles,
    Bell,
    Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = "credits" | "upgrade" | "report" | "disconnected" | "welcome" | string;

interface DbNotification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotifType;
    is_read: boolean;
    created_at: string;
}

// ─── Type → visual map ────────────────────────────────────────────────────────

function getVisual(type: NotifType): {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    accent: string;
} {
    switch (type) {
        case "credits":
            return {
                icon: <Zap size={14} strokeWidth={2.5} className="fill-current" />,
                iconBg: "rgba(254,243,199,0.95)",
                iconColor: "#d97706",
                accent: "#f59e0b",
            };
        case "upgrade":
            return {
                icon: <Rocket size={14} strokeWidth={2.5} />,
                iconBg: "rgba(237,233,254,0.95)",
                iconColor: "#7c3aed",
                accent: "#8b5cf6",
            };
        case "report":
            return {
                icon: <BarChart2 size={14} strokeWidth={2.5} />,
                iconBg: "rgba(219,234,254,0.95)",
                iconColor: "#2563eb",
                accent: "#3b82f6",
            };
        case "disconnected":
            return {
                icon: <WifiOff size={14} strokeWidth={2.5} />,
                iconBg: "rgba(254,226,226,0.95)",
                iconColor: "#dc2626",
                accent: "#ef4444",
            };
        case "welcome":
            return {
                icon: <PartyPopper size={14} strokeWidth={2.5} />,
                iconBg: "rgba(209,250,229,0.95)",
                iconColor: "#059669",
                accent: "#10b981",
            };
        default:
            return {
                icon: <Sparkles size={14} strokeWidth={2.5} />,
                iconBg: "rgba(243,244,246,0.95)",
                iconColor: "#6b7280",
                accent: "#9ca3af",
            };
    }
}

function formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}
// ─── Register FCM token in Supabase ──────────────────────────────────────────

async function registerPushToken(userId: string): Promise<boolean> {
    try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            return false;
        }

        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        if (!token) {
            return false;
        }

        const payload = {
            user_id: userId,
            token: token,
            device: navigator.userAgent.slice(0, 200),
        };

        const { error } = await supabase
            .from("user_push_tokens")
            .upsert(
                payload,
                {
                    onConflict: "user_id,device",
                }
            );

        if (error) {
            console.error("Push token upsert error:", error);
            return false;
        }

        console.log("[FCM] Token updated ✅");

        return true;

    } catch (err) {
        console.error("registerPushToken error:", err);
        return false;
    }
}
// ─── Allow notifications banner ───────────────────────────────────────────────

function AllowBanner({
    onAllow,
    onDismiss,
    loading,
}: {
    onAllow: () => void;
    onDismiss: () => void;
    loading: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 px-4 py-3"
            style={{
                background: "linear-gradient(135deg,rgba(237,233,254,0.9),rgba(243,232,255,0.7))",
                borderBottom: "1px solid rgba(196,181,253,0.25)",
            }}
        >
            <span
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ width: 32, height: 32, background: "rgba(237,233,254,0.95)", color: "#8b5cf6" }}
            >
                <Bell size={14} strokeWidth={2.5} />
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-800 leading-snug">
                    Enable push notifications
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                    Get alerts even when this tab is closed
                </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onAllow}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black text-white"
                    style={{
                        background: loading
                            ? "rgba(139,92,246,0.5)"
                            : "linear-gradient(135deg,#8b5cf6,#d946ef)",
                        boxShadow: loading ? "none" : "0 2px 10px rgba(139,92,246,0.35)",
                    }}
                >
                    {loading ? "..." : "Allow"}
                </motion.button>
                <button
                    onClick={onDismiss}
                    className="flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors"
                    style={{ width: 20, height: 20 }}
                >
                    <X size={11} strokeWidth={2.5} style={{ color: "#9ca3af" }} />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingState() {
    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-3 py-12 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Loader2
                size={22}
                strokeWidth={2}
                className="animate-spin"
                style={{ color: "#c4b5fd" }}
            />
            <p className="text-[11px] text-gray-400 font-medium">
                Loading notifications...
            </p>
        </motion.div>
    );
}

// ─── Single notification row ──────────────────────────────────────────────────

function NotifRow({
    notif,
    onRead,
    onRemove,
    index,
}: {
    notif: DbNotification;
    onRead: (id: string) => void;
    onRemove: (id: string) => void;
    index: number;
}) {
    const [removing, setRemoving] = useState(false);
    const visual = getVisual(notif.type);

    function handleRemove(e: React.MouseEvent) {
        e.stopPropagation();
        setRemoving(true);
        setTimeout(() => onRemove(notif.id), 260);
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 18 }}
            animate={{
                opacity: removing ? 0 : 1,
                x: removing ? 24 : 0,
                scale: removing ? 0.96 : 1,
            }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.22, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onRead(notif.id)}
            className="group relative flex items-start gap-3 px-4 py-3 cursor-pointer select-none transition-colors duration-150"
            style={{
                background: notif.is_read ? "transparent" : "rgba(248,246,255,0.55)",
                borderLeft: `2.5px solid ${notif.is_read ? "transparent" : visual.accent}`,
            }}
        >
            {/* Hover bg */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                style={{ background: "rgba(243,242,255,0.45)" }}
            />

            {/* Icon */}
            <span
                className="flex-shrink-0 flex items-center justify-center rounded-xl mt-0.5"
                style={{ width: 32, height: 32, background: visual.iconBg, color: visual.iconColor }}
            >
                {visual.icon}
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2">
                    <p
                        className="text-[12px] leading-snug truncate"
                        style={{ color: "#111827", fontWeight: notif.is_read ? 500 : 700 }}
                    >
                        {notif.title}
                    </p>
                    {!notif.is_read && (
                        <motion.span
                            layoutId={`dot-${notif.id}`}
                            className="flex-shrink-0 rounded-full"
                            style={{ width: 6, height: 6, background: visual.accent }}
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    )}
                </div>
                <p
                    className="text-[11px] leading-relaxed mt-0.5 line-clamp-2"
                    style={{ color: "#6b7280", fontWeight: 400 }}
                >
                    {notif.message}
                </p>
                <p
                    className="text-[10px] mt-1 font-semibold tracking-wide"
                    style={{ color: notif.is_read ? "#d1d5db" : visual.accent }}
                >
                    {formatTime(notif.created_at)}
                </p>
            </div>

            {/* Dismiss */}
            <button
                onClick={handleRemove}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center rounded-lg hover:bg-gray-100"
                style={{ width: 20, height: 20 }}
                aria-label="Dismiss"
            >
                <X size={11} strokeWidth={2.5} style={{ color: "#9ca3af" }} />
            </button>
        </motion.div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-3 py-12 px-6"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
            <div
                className="flex items-center justify-center rounded-2xl"
                style={{ width: 52, height: 52, background: "rgba(243,242,255,0.8)" }}
            >
                <BellOff size={22} strokeWidth={1.5} style={{ color: "#c4b5fd" }} />
            </div>
            <div className="text-center">
                <p className="text-[13px] font-bold text-gray-800">All caught up</p>
                <p className="text-[11px] text-gray-400 mt-1">No new notifications right now.</p>
            </div>
        </motion.div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function NotificationDropdown({
    open,
    onClose,
    onUnreadCountChange,
}: {
    open: boolean;
    onClose: () => void;
    onUnreadCountChange?: (count: number) => void;
}) {
    const [notifications, setNotifications] = useState<DbNotification[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Push permission state
    const [pushPermission, setPushPermission] =
        useState<NotificationPermission>("default");
    const [showBanner, setShowBanner] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);

    const unread = notifications.filter((n) => !n.is_read);
    const hasUnread = unread.length > 0;

    // ─── fetchNotifications — stable ref via useCallback ──────────────────

    const fetchNotifications = useCallback(async (uid: string) => {
        console.log("FETCH USER =", uid);

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });

        console.log("DATA =", data);
        console.log("ERROR =", error);

        if (error) {
            console.error("Notifications fetch error:", error);
            setLoading(false);
            return;
        }

        setNotifications(data ?? []);
        setLoading(false);
    }, []);

    // ─── Init: load user + notifications + push permission ────────────────

    useEffect(() => {
        async function init() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            console.log("USER =", user);

            if (!user?.id) {
                setLoading(false);
                return;
            }

            setUserId(user.id);
            await fetchNotifications(user.id);

            if ("Notification" in window) {
                const permission = Notification.permission;
                setPushPermission(permission);

                if (permission === "default") {
                    setShowBanner(true);
                }

                if (permission === "granted") {
                    await registerPushToken(user.id);
                }
            }
        }

        init();
    }, [fetchNotifications]);

    // ─── Realtime subscription — refetches on any change ──────────────────

    useEffect(() => {
        if (!userId) return;

        // Immediate fetch when userId becomes available
        fetchNotifications(userId);

        const channel = supabase
            .channel(`notif-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    // Refetch on any INSERT / UPDATE / DELETE
                    fetchNotifications(userId);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchNotifications]);

    // ─── Sync unread count to parent (header badge) ───────────────────────

    useEffect(() => {
        onUnreadCountChange?.(unread.length);
    }, [unread.length, onUnreadCountChange]);

    // ─── Handle Allow push ────────────────────────────────────────────────

    async function handleAllowPush() {
        if (!userId) return;
        setPushLoading(true);

        const success = await registerPushToken(userId);

        if (success) {
            setPushPermission("granted");
            setShowBanner(false);
        } else {
            if ("Notification" in window) {
                setPushPermission(Notification.permission);
            }
            setShowBanner(false);
        }

        setPushLoading(false);
    }

    // ─── Mark single as read ──────────────────────────────────────────────

    async function markRead(id: string) {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }

    // ─── Mark all as read ─────────────────────────────────────────────────

    async function markAllRead() {
        if (!userId) return;
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", userId)
            .eq("is_read", false);
    }

    // ─── Remove single ────────────────────────────────────────────────────

    async function remove(id: string) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        await supabase.from("notifications").delete().eq("id", id);
    }

    // ─── Clear all ────────────────────────────────────────────────────────

    async function clearAll() {
        if (!userId) return;
        setNotifications([]);
        await supabase.from("notifications").delete().eq("user_id", userId);
    }

    // ─── Render ───────────────────────────────────────────────────────────

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop (mobile) */}
                    <motion.div
                        className="fixed inset-0 z-40 sm:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 14, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-3 z-50 flex flex-col"
                        style={{
                            width: 360,
                            maxHeight: 520,
                            borderRadius: 24,
                            border: "1px solid rgba(196,181,253,0.28)",
                            background: "rgba(255,255,255,0.92)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            boxShadow:
                                "0 0 0 1px rgba(167,139,250,0.1), 0 24px 64px rgba(109,40,217,0.13), 0 4px 16px rgba(0,0,0,0.06)",
                            overflow: "hidden",
                        }}
                    >
                        {/* Allow push banner */}
                        <AnimatePresence>
                            {showBanner && pushPermission === "default" && (
                                <AllowBanner
                                    onAllow={handleAllowPush}
                                    onDismiss={() => setShowBanner(false)}
                                    loading={pushLoading}
                                />
                            )}
                        </AnimatePresence>

                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-5 py-4"
                            style={{ borderBottom: "1px solid rgba(196,181,253,0.2)" }}
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles size={13} strokeWidth={2} style={{ color: "#8b5cf6" }} />
                                <span
                                    className="text-[13px] font-black tracking-tight"
                                    style={{ color: "#111827" }}
                                >
                                    Notifications
                                </span>
                                {hasUnread && (
                                    <motion.span
                                        key={unread.length}
                                        initial={{ scale: 0.7 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                        className="inline-flex items-center justify-center rounded-full text-[10px] font-black text-white"
                                        style={{
                                            minWidth: 18,
                                            height: 18,
                                            padding: "0 5px",
                                            background: "linear-gradient(135deg,#8b5cf6,#d946ef)",
                                            boxShadow: "0 2px 8px rgba(139,92,246,0.4)",
                                        }}
                                    >
                                        {unread.length}
                                    </motion.span>
                                )}
                            </div>

                            {hasUnread && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-150 hover:bg-purple-50"
                                    style={{ color: "#8b5cf6" }}
                                >
                                    <CheckCheck size={11} strokeWidth={2.5} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List / Loading / Empty */}
                        <div
                            className="flex-1 overflow-y-auto"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <LoadingState key="loading" />
                                ) : notifications.length === 0 ? (
                                    <EmptyState key="empty" />
                                ) : (
                                    notifications.map((n, i) => (
                                        <NotifRow
                                            key={n.id}
                                            notif={n}
                                            onRead={markRead}
                                            onRemove={remove}
                                            index={i}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {!loading && notifications.length > 0 && (
                            <div
                                className="px-5 py-3 flex items-center justify-between"
                                style={{
                                    borderTop: "1px solid rgba(196,181,253,0.18)",
                                    background: "rgba(250,249,255,0.7)",
                                }}
                            >
                                <span
                                    className="text-[10px] font-semibold tracking-wide"
                                    style={{ color: "#c4b5fd" }}
                                >
                                    {unread.length > 0 ? `${unread.length} unread` : "All caught up ✓"}
                                </span>
                                <button
                                    onClick={clearAll}
                                    className="text-[10px] font-bold transition-colors duration-150 hover:text-red-500"
                                    style={{ color: "#d1d5db" }}
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}