"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
} from "framer-motion";
import {
    Sparkles,
    CheckIcon,
    ZapIcon,
    ArrowUpRight,
    UsersIcon,
    ShieldCheckIcon,
    StarIcon,
    Building2Icon,
    FlameIcon,
} from "lucide-react";
import { getPlans, getCurrentSubscription } from "@/lib/subscriptionApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = {
    id: string;
    slug: string;
    name: string;
    price: number;
    credits: number;
    max_profiles: number;
    features?: string[];
};

type Subscription = { plan_slug: string };

// ─── Static Enterprise fallback ───────────────────────────────────────────────

const ENTERPRISE_FALLBACK: Plan = {
    id: "enterprise-static",
    slug: "enterprise",
    name: "Enterprise",
    price: 199,
    credits: 50000,
    max_profiles: 100,
    features: ["Priority Support", "Dedicated AI", "Unlimited WhatsApp"],
};

// ─── Theme map ────────────────────────────────────────────────────────────────

type PlanTheme = {
    nameColor: string;
    topBar: string;
    cardBorder: string;
    cardBg: string;
    cardGlow: string;
    hoverGlow: string;
    iconBg: string;
    iconColor: string;
    divider: string;
    checkBg: string;
    checkColor: string;
    btnGradient: string;
    btnHoverGradient: string;
    btnGlowColor: string;
    btnLabel: string;
    particleColor: string;
    badgeBg: string;
    badgeBorder: string;
};

const PLAN_THEMES: Record<string, PlanTheme> = {
    free: {
        nameColor: "#7c3aed",
        topBar: "linear-gradient(90deg,#c4b5fd,#a78bfa,#c4b5fd)",
        cardBorder: "rgba(196,181,253,0.4)",
        cardBg: "rgba(250,249,255,0.80)",
        cardGlow: "0 0 0 1px rgba(167,139,250,0.12), 0 4px 18px rgba(167,139,250,0.08)",
        hoverGlow: "0 0 0 2px rgba(167,139,250,0.2), 0 12px 36px rgba(167,139,250,0.14)",
        iconBg: "rgba(237,233,254,0.8)",
        iconColor: "#7c3aed",
        divider: "rgba(196,181,253,0.28)",
        checkBg: "rgba(220,252,231,0.9)",
        checkColor: "#16a34a",
        btnGradient: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
        btnHoverGradient: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
        btnGlowColor: "rgba(139,92,246,0.35)",
        btnLabel: "Get Started",
        particleColor: "167,139,250",
        badgeBg: "rgba(237,233,254,0.9)",
        badgeBorder: "rgba(167,139,250,0.3)",
    },
    starter: {
        nameColor: "#2563eb",
        topBar: "linear-gradient(90deg,#93c5fd,#60a5fa,#818cf8,#93c5fd)",
        cardBorder: "rgba(147,197,253,0.45)",
        cardBg: "rgba(248,250,255,0.82)",
        cardGlow: "0 0 0 1px rgba(96,165,250,0.1), 0 4px 18px rgba(96,165,250,0.08)",
        hoverGlow: "0 0 0 2px rgba(96,165,250,0.2), 0 12px 36px rgba(99,102,241,0.14)",
        iconBg: "rgba(219,234,254,0.8)",
        iconColor: "#2563eb",
        divider: "rgba(147,197,253,0.3)",
        checkBg: "rgba(220,252,231,0.9)",
        checkColor: "#16a34a",
        btnGradient: "linear-gradient(135deg,#3b82f6,#6366f1)",
        btnHoverGradient: "linear-gradient(135deg,#2563eb,#4f46e5)",
        btnGlowColor: "rgba(59,130,246,0.35)",
        btnLabel: "Upgrade",
        particleColor: "96,165,250",
        badgeBg: "rgba(219,234,254,0.9)",
        badgeBorder: "rgba(96,165,250,0.3)",
    },
    pro: {
        nameColor: "#7c3aed",
        topBar: "linear-gradient(90deg,#a855f7,#d946ef,#7c3aed,#c026d3,#a855f7)",
        cardBorder: "rgba(192,132,252,0.65)",
        cardBg: "rgba(254,252,255,0.97)",
        cardGlow:
            "0 0 0 1.5px rgba(192,132,252,0.35), 0 8px 40px rgba(168,85,247,0.22), 0 2px 10px rgba(168,85,247,0.12)",
        hoverGlow:
            "0 0 0 2px rgba(192,132,252,0.5), 0 24px 60px rgba(168,85,247,0.32), 0 4px 16px rgba(168,85,247,0.18)",
        iconBg: "rgba(243,232,255,0.85)",
        iconColor: "#9333ea",
        divider: "rgba(216,180,254,0.4)",
        checkBg: "rgba(220,252,231,0.95)",
        checkColor: "#16a34a",
        btnGradient: "linear-gradient(135deg,#7c3aed,#a855f7,#d946ef)",
        btnHoverGradient: "linear-gradient(135deg,#6d28d9,#9333ea,#c026d3)",
        btnGlowColor: "rgba(168,85,247,0.55)",
        btnLabel: "Upgrade to Pro",
        particleColor: "192,132,252",
        badgeBg: "rgba(243,232,255,0.95)",
        badgeBorder: "rgba(192,132,252,0.5)",
    },
    business: {
        nameColor: "#b45309",
        topBar: "linear-gradient(90deg,#fbbf24,#f59e0b,#d97706,#fbbf24)",
        cardBorder: "rgba(252,211,77,0.5)",
        cardBg: "rgba(255,254,247,0.85)",
        cardGlow: "0 0 0 1px rgba(234,179,8,0.1), 0 4px 18px rgba(234,179,8,0.08)",
        hoverGlow: "0 0 0 2px rgba(234,179,8,0.2), 0 12px 36px rgba(251,191,36,0.16)",
        iconBg: "rgba(254,252,232,0.85)",
        iconColor: "#b45309",
        divider: "rgba(252,211,77,0.3)",
        checkBg: "rgba(220,252,231,0.9)",
        checkColor: "#16a34a",
        btnGradient: "linear-gradient(135deg,#f59e0b,#d97706)",
        btnHoverGradient: "linear-gradient(135deg,#d97706,#b45309)",
        btnGlowColor: "rgba(245,158,11,0.4)",
        btnLabel: "Upgrade",
        particleColor: "251,191,36",
        badgeBg: "rgba(254,252,232,0.9)",
        badgeBorder: "rgba(234,179,8,0.35)",
    },
    enterprise: {
        nameColor: "#047857",
        topBar: "linear-gradient(90deg,#34d399,#10b981,#059669,#34d399)",
        cardBorder: "rgba(52,211,153,0.45)",
        cardBg: "rgba(248,255,253,0.85)",
        cardGlow: "0 0 0 1px rgba(52,211,153,0.1), 0 4px 18px rgba(16,185,129,0.08)",
        hoverGlow: "0 0 0 2px rgba(52,211,153,0.22), 0 12px 36px rgba(16,185,129,0.15)",
        iconBg: "rgba(209,250,229,0.85)",
        iconColor: "#047857",
        divider: "rgba(52,211,153,0.28)",
        checkBg: "rgba(209,250,229,0.9)",
        checkColor: "#047857",
        btnGradient: "linear-gradient(135deg,#10b981,#059669)",
        btnHoverGradient: "linear-gradient(135deg,#059669,#047857)",
        btnGlowColor: "rgba(16,185,129,0.4)",
        btnLabel: "Get Enterprise",
        particleColor: "52,211,153",
        badgeBg: "rgba(209,250,229,0.9)",
        badgeBorder: "rgba(52,211,153,0.35)",
    },
};

const DEFAULT_THEME = PLAN_THEMES.free;
function getTheme(slug: string): PlanTheme {
    return PLAN_THEMES[slug] ?? DEFAULT_THEME;
}

// ─── Particle ─────────────────────────────────────────────────────────────────

function Particle({ color, delay, isPro }: { color: string; delay: number; isPro: boolean }) {
    const x = Math.random() * 100;
    const size = isPro ? 2 + Math.random() * 3 : 2 + Math.random() * 2;
    const duration = (isPro ? 3.5 : 5) + Math.random() * 4;
    const rise = isPro ? 70 + Math.random() * 70 : 50 + Math.random() * 50;
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size,
                height: size,
                left: `${x}%`,
                bottom: "-6px",
                background: `rgba(${color},${isPro ? 0.65 : 0.45})`,
                filter: "blur(0.4px)",
            }}
            animate={{ y: [0, -rise], opacity: [0, isPro ? 0.8 : 0.6, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
        />
    );
}

// ─── Animated ring for PRO ────────────────────────────────────────────────────

function ProRing() {
    return (
        <>
            {/* Slow rotating dashed ring — behind card via zIndex:-1 */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    inset: -5,
                    borderRadius: 24,
                    border: "1.5px dashed rgba(168,85,247,0.18)",
                    zIndex: -1,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            />
            {/* Slower counter-rotate ring — also behind */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    inset: -2,
                    borderRadius: 23,
                    border: "1px solid rgba(192,132,252,0.13)",
                    zIndex: -1,
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
            />
        </>
    );
}

// ─── Spotlight under PRO card ─────────────────────────────────────────────────

function ProSpotlight() {
    return (
        <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
                bottom: -36,
                left: "50%",
                transform: "translateX(-50%)",
                width: 220,
                height: 70,
                background:
                    "radial-gradient(ellipse at center, rgba(168,85,247,0.22) 0%, transparent 70%)",
                filter: "blur(6px)",
                zIndex: -1,
            }}
        />
    );
}

// ─── TiltCard ─────────────────────────────────────────────────────────────────

function TiltCard({
    children,
    theme,
    active,
    isPro,
}: {
    children: React.ReactNode;
    theme: PlanTheme;
    active: boolean;
    isPro: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 180, damping: 26 });
    const springY = useSpring(rawY, { stiffness: 180, damping: 26 });
    const rotateX = useTransform(springY, [-0.5, 0.5], [isPro ? "5deg" : "4deg", isPro ? "-5deg" : "-4deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [isPro ? "-5deg" : "-4deg", isPro ? "5deg" : "4deg"]);
    const [hovered, setHovered] = useState(false);

    const handleMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const el = ref.current;
            if (!el) return;
            const { left, top, width, height } = el.getBoundingClientRect();
            rawX.set((e.clientX - left) / width - 0.5);
            rawY.set((e.clientY - top) / height - 0.5);
        },
        [rawX, rawY]
    );

    const handleLeave = useCallback(() => {
        rawX.set(0);
        rawY.set(0);
        setHovered(false);
    }, [rawX, rawY]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 900,
                boxShadow: hovered && !active ? theme.hoverGlow : theme.cardGlow,
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                scale: isPro ? 1.07 : 1,
                zIndex: isPro ? 10 : 1,
            }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            whileHover={!active ? { scale: isPro ? 1.10 : 1.025 } : undefined}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col rounded-2xl overflow-visible"
        >
            {/* PRO rings stay behind card via zIndex:-1 */}
            {isPro && <ProRing />}
            {isPro && <ProSpotlight />}

            {/* Card inner — rounded but NOT overflow:hidden so nothing clips */}
            <div className="relative flex flex-col flex-1 rounded-2xl" style={{ overflow: "visible" }}>
                {children}
            </div>

            {/* Particles clipped to card bounds */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ overflow: "hidden" }}>
                {Array.from({ length: isPro ? 5 : 3 }).map((_, i) => (
                    <Particle key={i} color={theme.particleColor} delay={i * (isPro ? 0.9 : 1.4)} isPro={isPro} />
                ))}
            </div>
        </motion.div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubscriptionSection() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [current, setCurrent] = useState<Subscription | null>(null);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const [fetchedPlans, sub] = await Promise.all([
            getPlans(),
            getCurrentSubscription(),
        ]);
        const hasEnterprise = fetchedPlans.some((p: Plan) => p.slug === "enterprise");
        setPlans(hasEnterprise ? fetchedPlans : [...fetchedPlans, ENTERPRISE_FALLBACK]);
        setCurrent(sub);
    }

    return (
        <section
            ref={sectionRef}
            id="subscription-section"
            className="relative max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-10 py-20 scroll-mt-24"
            style={{ fontFamily: "'Space Grotesk','Sora','Inter',system-ui,sans-serif" }}
        >
            {/* Ambient bg orbs */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
                <div
                    className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[360px] rounded-full"
                    style={{
                        background: "radial-gradient(ellipse,rgba(167,139,250,0.12) 0%,transparent 70%)",
                        filter: "blur(2px)",
                    }}
                />
                {/* PRO spotlight from above */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px]"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%,rgba(168,85,247,0.10) 0%,transparent 70%)",
                    }}
                />
                <div
                    className="absolute bottom-10 right-1/4 w-[320px] h-[240px] rounded-full"
                    style={{
                        background: "radial-gradient(ellipse,rgba(52,211,153,0.08) 0%,transparent 70%)",
                    }}
                />
            </div>

            {/* Header */}
            <motion.div
                className="mb-12 flex flex-col items-start gap-3"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase"
                    style={{
                        background: "rgba(237,233,254,0.9)",
                        color: "#7c3aed",
                        border: "1px solid rgba(167,139,250,0.3)",
                    }}
                >
                    <Sparkles size={10} strokeWidth={2.5} />
                    Subscription
                </div>
                <h2
                    className="text-3xl sm:text-4xl leading-tight"
                    style={{ fontWeight: 800, color: "#0f0a1e", letterSpacing: "-0.03em" }}
                >
                    Unlock More Power
                </h2>
                <p
                    className="text-sm max-w-sm leading-relaxed"
                    style={{ color: "#6b7280", fontWeight: 400 }}
                >
                    Scale your credits and AI profiles. Upgrade anytime, cancel whenever.
                </p>
            </motion.div>

            {/* Cards grid — py-10 gives rings + scale breathing room without clipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 items-center py-10">
                <AnimatePresence>
                    {plans.map((plan, i) => {
                        const active = current?.plan_slug === plan.slug;
                        const isPro = plan.slug === "pro";
                        const theme = getTheme(plan.slug);

                        return (
                            <motion.div
                                key={plan.id}
                                className="flex flex-col"
                                style={{
                                    position: "relative",
                                    zIndex: isPro ? 10 : 1,
                                }}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: isPro ? -4 : 0 }}
                                viewport={{ once: true, margin: "-30px" }}
                                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <TiltCard theme={theme} active={active} isPro={isPro}>
                                    {/* Top gradient bar */}
                                    <div
                                        className="flex-shrink-0"
                                        style={{
                                            height: isPro ? 4 : 3,
                                            background: theme.topBar,
                                        }}
                                    />

                                    {/* PRO featured badge — inside card, sits at top of content */}
                                    {isPro && (
                                        <div className="flex justify-center pt-4 pb-0">
                                            <motion.div
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase whitespace-nowrap"
                                                style={{
                                                    background: "linear-gradient(135deg,#7c3aed,#a855f7,#d946ef)",
                                                    color: "#fff",
                                                    boxShadow: "0 2px 14px rgba(168,85,247,0.40)",
                                                    letterSpacing: "0.06em",
                                                }}
                                                animate={{
                                                    boxShadow: [
                                                        "0 2px 12px rgba(168,85,247,0.35)",
                                                        "0 3px 20px rgba(168,85,247,0.58)",
                                                        "0 2px 12px rgba(168,85,247,0.35)",
                                                    ],
                                                }}
                                                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <FlameIcon size={9} strokeWidth={2.5} />
                                                Most Chosen
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* Active pulse ring */}
                                    {active && (
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl pointer-events-none"
                                            animate={{
                                                boxShadow: [
                                                    `0 0 0 2px ${theme.cardBorder}`,
                                                    `0 0 0 4px ${theme.cardBorder}`,
                                                    `0 0 0 2px ${theme.cardBorder}`,
                                                ],
                                            }}
                                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    )}

                                    <div
                                        className="relative flex flex-col flex-1 gap-4"
                                        style={{ padding: isPro ? "8px 20px 20px" : "16px 16px 16px" }}
                                    >
                                        {/* Header row */}
                                        <div className="flex items-start justify-between gap-2" style={{ minHeight: 28 }}>
                                            <span
                                                className="text-[11px] font-bold uppercase tracking-widest"
                                                style={{ color: theme.nameColor }}
                                            >
                                                {plan.name}
                                            </span>

                                            <div className="flex flex-col items-end gap-1">
                                                {isPro && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                                                        style={{
                                                            background: theme.badgeBg,
                                                            color: theme.nameColor,
                                                            border: `1px solid ${theme.badgeBorder}`,
                                                        }}
                                                    >
                                                        <StarIcon size={8} strokeWidth={2.5} />
                                                        Best Value
                                                    </span>
                                                )}
                                                {plan.slug === "enterprise" && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                                                        style={{
                                                            background: theme.badgeBg,
                                                            color: theme.nameColor,
                                                            border: `1px solid ${theme.badgeBorder}`,
                                                        }}
                                                    >
                                                        <Building2Icon size={8} strokeWidth={2.5} />
                                                        Premium
                                                    </span>
                                                )}
                                                {active && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                                                        style={{
                                                            background: "rgba(209,250,229,0.9)",
                                                            color: "#047857",
                                                            border: "1px solid rgba(52,211,153,0.3)",
                                                        }}
                                                    >
                                                        <motion.span
                                                            className="inline-block rounded-full"
                                                            style={{ width: 6, height: 6, background: "#10b981" }}
                                                            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                                                            transition={{ duration: 1.8, repeat: Infinity }}
                                                        />
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-end gap-1">
                                            <span
                                                style={{
                                                    fontSize: isPro ? 42 : 36,
                                                    fontWeight: 800,
                                                    lineHeight: 1,
                                                    letterSpacing: "-0.04em",
                                                    color: "#0f0a1e",
                                                }}
                                            >
                                                ${plan.price}
                                            </span>
                                            <span
                                                className="pb-1.5 text-[11px]"
                                                style={{ color: "#9ca3af", fontWeight: 500 }}
                                            >
                                                /mo
                                            </span>
                                        </div>

                                        {/* PRO social proof */}
                                        {isPro && (
                                            <p
                                                className="text-[10px] -mt-2"
                                                style={{ color: "#9333ea", fontWeight: 600, letterSpacing: "0.02em" }}
                                            >
                                                ✦ Used by most customers
                                            </p>
                                        )}

                                        {/* Divider */}
                                        <div className="h-px" style={{ background: theme.divider }} />

                                        {/* Quotas */}
                                        <div className="flex flex-col gap-1.5">
                                            <QuotaRow
                                                icon={<ZapIcon size={10} strokeWidth={2.5} />}
                                                label={`${plan.credits.toLocaleString()} credits`}
                                                iconBg={theme.iconBg}
                                                iconColor={theme.iconColor}
                                            />
                                            <QuotaRow
                                                icon={<UsersIcon size={10} strokeWidth={2.5} />}
                                                label={`${plan.max_profiles} profiles`}
                                                iconBg={theme.iconBg}
                                                iconColor={theme.iconColor}
                                            />
                                        </div>

                                        {/* Features */}
                                        {plan.features && plan.features.length > 0 && (
                                            <ul className="flex flex-col gap-1.5">
                                                {plan.features.map((feat) => (
                                                    <li key={feat} className="flex items-start gap-2">
                                                        <span
                                                            className="mt-[2px] flex-shrink-0 flex items-center justify-center rounded-full"
                                                            style={{
                                                                width: 13,
                                                                height: 13,
                                                                background: theme.checkBg,
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                size={8}
                                                                strokeWidth={3.5}
                                                                style={{ color: theme.checkColor }}
                                                            />
                                                        </span>
                                                        <span
                                                            className="text-[11px] leading-snug"
                                                            style={{ color: "#6b7280", fontWeight: 450 }}
                                                        >
                                                            {feat}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="flex-1" />

                                        {/* CTA */}
                                        <UpgradeButton active={active} theme={theme} isPro={isPro} />
                                    </div>
                                </TiltCard>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.p
                className="mt-6 text-center text-[11px] tracking-wide"
                style={{ color: "#9ca3af" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                All plans include SSL security · Cancel anytime · No hidden fees
            </motion.p>
        </section>
    );
}

// ─── QuotaRow ─────────────────────────────────────────────────────────────────

function QuotaRow({
    icon,
    label,
    iconBg,
    iconColor,
}: {
    icon: React.ReactNode;
    label: string;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                className="flex items-center justify-center rounded-md flex-shrink-0"
                style={{ width: 18, height: 18, background: iconBg, color: iconColor }}
            >
                {icon}
            </span>
            <span className="text-[11px]" style={{ color: "#374151", fontWeight: 600 }}>
                {label}
            </span>
        </div>
    );
}

// ─── UpgradeButton ────────────────────────────────────────────────────────────

function UpgradeButton({
    active,
    theme,
    isPro,
}: {
    active: boolean;
    theme: PlanTheme;
    isPro: boolean;
}) {
    const [hovered, setHovered] = useState(false);

    if (active) {
        return (
            <button
                disabled
                className="w-full rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-default"
                style={{
                    height: isPro ? 40 : 36,
                    background: "#f3f4f6",
                    color: "#9ca3af",
                    border: "1px solid #e5e7eb",
                    fontWeight: 600,
                }}
            >
                <ShieldCheckIcon size={11} strokeWidth={2} style={{ color: "#d1d5db" }} />
                Current Plan
            </button>
        );
    }

    return (
        <motion.button
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ scale: isPro ? 1.04 : 1.025 }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full rounded-xl text-[11px] text-white overflow-hidden flex items-center justify-center gap-1 focus-visible:outline-none"
            style={{
                height: isPro ? 40 : 36,
                fontWeight: 700,
                boxShadow: hovered
                    ? `0 6px 24px ${theme.btnGlowColor}, 0 2px 8px ${theme.btnGlowColor}`
                    : isPro
                        ? `0 2px 12px ${theme.btnGlowColor}`
                        : "none",
                transition: "box-shadow 0.3s ease",
            }}
        >
            {/* Base */}
            <span
                aria-hidden
                className="absolute inset-0 transition-opacity duration-300"
                style={{ background: theme.btnGradient, opacity: hovered ? 0 : 1 }}
            />
            {/* Hover */}
            <span
                aria-hidden
                className="absolute inset-0 transition-opacity duration-300"
                style={{ background: theme.btnHoverGradient, opacity: hovered ? 1 : 0 }}
            />
            {/* Shine sweep */}
            <motion.span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.32) 50%,transparent 70%)",
                    translateX: hovered ? "200%" : "-100%",
                }}
                animate={hovered ? { translateX: ["−100%", "200%"] } : { translateX: "-100%" }}
                transition={{ duration: 0.52, ease: "easeInOut" }}
            />
            {/* PRO pulse ring */}
            {isPro && (
                <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={
                        hovered
                            ? {
                                boxShadow: [
                                    `inset 0 0 0 0px rgba(255,255,255,0.0)`,
                                    `inset 0 0 0 2px rgba(255,255,255,0.22)`,
                                    `inset 0 0 0 0px rgba(255,255,255,0.0)`,
                                ],
                            }
                            : { boxShadow: "inset 0 0 0 0px rgba(255,255,255,0)" }
                    }
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                />
            )}
            <span className="relative flex items-center gap-1">
                {theme.btnLabel}
                <motion.span
                    animate={hovered ? { x: 2, y: -2 } : { x: 0, y: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <ArrowUpRight size={11} strokeWidth={2.5} />
                </motion.span>
            </span>
        </motion.button>
    );
}