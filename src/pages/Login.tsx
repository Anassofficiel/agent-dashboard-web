import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

import { motion, AnimatePresence } from "framer-motion";

import {
    Mail,
    Lock,
    ArrowRight,
    Sparkles,
    AlertCircle,
    Bot,
    ShieldCheck,
} from "lucide-react";

export default function Login() {

    const [, setLocation] = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    // CREATE USER CREDITS
    const createUserCredits = async (
        userId: string
    ) => {

        const { data: existingCredits } =
            await supabase
                .from("user_credits")
                .select("id")
                .eq("user_id", userId)
                .maybeSingle();

        // إذا ماكايناش credits
        if (!existingCredits) {

            await supabase
                .from("user_credits")
                .insert([
                    {
                        user_id: userId,
                        credits: 200,
                        plan: "free",
                    },
                ]);
        }
    };

    // LOGIN
    const handleLogin = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        try {

            setLoading(true);

            setErrorMessage("");
            setSuccessMessage("");

            const { data, error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (error) {

                setErrorMessage(
                    "Incorrect email or password"
                );

                return;
            }

            // CREATE CREDITS IF NOT EXISTS
            if (data.user) {

                await createUserCredits(
                    data.user.id
                );
            }

            setSuccessMessage(
                "Successfully logged into your account"
            );

            setTimeout(() => {

                setLocation("/");

            }, 1200);

        } catch (err) {

            console.error(err);

            setErrorMessage(
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };

    // GOOGLE LOGIN
    const handleGoogleLogin = async () => {

        try {

            setErrorMessage("");

            const { data, error } =
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                });

            if (error) {

                setErrorMessage(
                    "Google login failed"
                );

                return;
            }

        } catch (err) {

            console.error(err);

            setErrorMessage(
                "Google login failed"
            );
        }
    };

    return (

        <div className="min-h-screen bg-[#f4f7fb] relative overflow-hidden flex items-center justify-center px-6 py-10">

            {/* BACKGROUND */}

            <div className="absolute inset-0 overflow-hidden">

                <motion.div
                    animate={{
                        x: [0, 120, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                    }}
                    className="absolute top-[-150px] left-[-120px] w-[420px] h-[420px] rounded-full bg-purple-400/20 blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, -60, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                    }}
                    className="absolute bottom-[-150px] right-[-120px] w-[420px] h-[420px] rounded-full bg-fuchsia-400/20 blur-[120px]"
                />

            </div>

            {/* CARD */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 40,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                }}
                className="relative z-10 w-full max-w-[520px]"
            >

                <div className="bg-white border border-gray-200 rounded-[36px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden">

                    {/* TOP */}

                    <div className="relative p-10 pb-8">

                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />

                        {/* LOGO */}

                        <motion.div
                            whileHover={{
                                scale: 1.05,
                            }}
                            className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_10px_40px_rgba(168,85,247,0.35)] mx-auto"
                        >

                            <Bot className="w-12 h-12 text-white" />

                        </motion.div>

                        {/* BADGE */}

                        <div className="flex justify-center mt-6">

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">

                                <Sparkles className="w-4 h-4" />

                                AI WhatsApp Platform

                            </div>

                        </div>

                        {/* TITLE */}

                        <div className="text-center mt-6">

                            <h1 className="text-[52px] leading-none font-black tracking-tight text-gray-900">

                                Welcome
                                <br />
                                Back

                            </h1>

                            <p className="mt-5 text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">

                                Login to manage your AI WhatsApp
                                agents, automation and customers.

                            </p>

                        </div>

                    </div>

                    {/* FORM */}

                    <div className="px-10 pb-10">

                        {/* ERROR */}

                        <AnimatePresence>

                            {errorMessage && (

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -10,
                                    }}
                                    className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
                                >

                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

                                    <div>

                                        <h3 className="font-semibold text-red-700">

                                            Login Failed

                                        </h3>

                                        <p className="text-sm text-red-600 mt-1">

                                            {errorMessage}

                                        </p>

                                    </div>

                                </motion.div>
                            )}

                        </AnimatePresence>

                        {/* SUCCESS */}

                        <AnimatePresence>

                            {successMessage && (

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -10,
                                    }}
                                    className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"
                                >

                                    <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />

                                    <div>

                                        <h3 className="font-semibold text-green-700">

                                            Success

                                        </h3>

                                        <p className="text-sm text-green-600 mt-1">

                                            {successMessage}

                                        </p>

                                    </div>

                                </motion.div>
                            )}

                        </AnimatePresence>

                        {/* FORM */}

                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >

                            {/* EMAIL */}

                            <div>

                                <label className="text-sm font-semibold text-gray-700 mb-2 block">

                                    Email Address

                                </label>

                                <div className="relative">

                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full h-16 rounded-2xl bg-[#f8fafc] border border-gray-200 pl-14 pr-5 text-gray-800 outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                                    />

                                </div>

                            </div>

                            {/* PASSWORD */}

                            <div>

                                <label className="text-sm font-semibold text-gray-700 mb-2 block">

                                    Password

                                </label>

                                <div className="relative">

                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="w-full h-16 rounded-2xl bg-[#f8fafc] border border-gray-200 pl-14 pr-5 text-gray-800 outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                                    />

                                </div>

                            </div>

                            {/* BUTTON */}

                            <motion.button
                                whileHover={{
                                    scale: 1.015,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                disabled={loading}
                                type="submit"
                                className="w-full h-16 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white text-lg font-bold flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(168,85,247,0.35)] hover:opacity-95 transition-all"
                            >

                                {loading ? (
                                    "Signing In..."
                                ) : (
                                    <>
                                        Login To Dashboard
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}

                            </motion.button>

                        </form>

                        {/* DIVIDER */}

                        <div className="flex items-center gap-4 my-8">

                            <div className="flex-1 h-px bg-gray-200"></div>

                            <span className="text-sm font-medium text-gray-400">

                                OR CONTINUE WITH

                            </span>

                            <div className="flex-1 h-px bg-gray-200"></div>

                        </div>

                        {/* GOOGLE */}

                        <motion.button
                            whileHover={{
                                scale: 1.015,
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            onClick={handleGoogleLogin}
                            className="w-full h-16 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3 font-semibold text-gray-700"
                        >

                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                className="w-6 h-6"
                            />

                            Continue with Google

                        </motion.button>

                    </div>

                </div>

            </motion.div>

        </div>
    );
}