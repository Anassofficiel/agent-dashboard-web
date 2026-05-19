import { useEffect, useRef, useState } from "react";

import {
  Bot,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Zap,
  Crown,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";

interface Profile {
  id?: string;
  full_name?: string;
  email?: string;
  plan?: string;
  name?: string;
}

interface UserCredits {
  credits: number;
}

export function DashboardHeader() {

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [userCredits, setUserCredits] =
    useState<UserCredits | null>(null);

  const [open, setOpen] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // =========================
  // LOAD USER DATA
  // =========================

  async function loadUserData() {

    try {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // =========================
      // GET USER CREDITS
      // =========================

      let {
        data: creditsData,
        error: creditsError,
      } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      // CREATE DEFAULT CREDITS
      if (!creditsData) {

        await supabase
          .from("user_credits")
          .insert([
            {
              user_id: user.id,
              credits: 200,
              plan: "free",
            },
          ]);

        const {
          data: newCredits,
        } = await supabase
          .from("user_credits")
          .select("credits")
          .eq("user_id", user.id)
          .single();

        creditsData = newCredits;
      }

      if (creditsError) {
        console.error(
          "Credits Error:",
          creditsError
        );
      }

      setUserCredits(creditsData);

      // =========================
      // GET PROFILES
      // =========================

      const {
        data: profilesData,
        error: profilesError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id);

      if (profilesError) {
        console.error(
          "Profiles Error:",
          profilesError
        );
        return;
      }

      const activeProfile =
        localStorage.getItem(
          "active_profile"
        );

      let profileData =
        profilesData?.find(
          (p) =>
            p.name
              ?.trim()
              .toLowerCase() ===
            activeProfile
              ?.trim()
              .toLowerCase()
        );

      // FALLBACK
      if (!profileData) {
        profileData =
          profilesData?.[0];
      }

      if (profileData) {
        setProfile(profileData);
      }

    } catch (err) {

      console.error(
        "DashboardHeader Error:",
        err
      );
    }
  }

  // =========================
  // INITIAL LOAD + REFRESH
  // =========================

  useEffect(() => {

    loadUserData();

    // AUTO REFRESH CREDITS
    const interval =
      setInterval(() => {
        loadUserData();
      }, 2000);

    // CLICK OUTSIDE
    const handleClickOutside = (
      event: MouseEvent
    ) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      clearInterval(interval);

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // =========================
  // LOGOUT
  // =========================

  async function handleLogout() {

    await supabase.auth.signOut();

    localStorage.removeItem(
      "active_profile"
    );

    window.location.href =
      "/login";
  }

  // =========================
  // USERNAME
  // =========================

  const userName =
    profile?.full_name
      ?.split(" ")[0]
      ?.split(/[0-9]/)[0] ||

    profile?.email
      ?.split("@")[0]
      ?.split(/[0-9]/)[0] ||

    profile?.name
      ?.split(" ")[0] ||

    "Member";

  const firstLetter =
    userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/80 backdrop-blur-2xl">

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between gap-2">

        {/* LEFT */}

        <div className="flex items-center gap-2 lg:gap-4 min-w-0">

          <motion.div
            whileHover={{
              rotate: 6,
              scale: 1.05,
            }}
            className="w-11 h-11 lg:w-14 lg:h-14 shrink-0 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.35)]"
          >

            <Bot
              className="text-white"
              size={22}
            />

          </motion.div>

          <div className="min-w-0">

            <h1 className="text-base lg:text-[22px] font-black tracking-tight text-gray-900 leading-tight truncate">
              WhatsApp AI Platform
            </h1>

            <p className="text-[11px] lg:text-sm text-gray-500 mt-0.5 truncate">
              Smart Automation Dashboard
            </p>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2 lg:gap-4 shrink-0">

          {/* CREDITS */}

          <motion.div
            whileHover={{
              scale: 1.03,
            }}
            className="flex items-center gap-2 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg"
          >

            <Zap
              size={15}
              className="fill-white shrink-0"
            />

            <div className="flex flex-col leading-none">

              <span className="text-[10px] lg:text-xs opacity-80">
                Credits
              </span>

              <span className="text-xs lg:text-sm font-bold">
                {userCredits?.credits ?? 0}
              </span>

            </div>

          </motion.div>

          {/* UPGRADE */}

          <motion.button
            whileHover={{
              scale: 1.05,
              y: -1,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="
              flex
              items-center
              gap-1.5 lg:gap-2
              px-3 lg:px-5
              py-2 lg:py-3
              rounded-xl lg:rounded-2xl
              bg-gradient-to-r
              from-amber-400
              via-yellow-500
              to-orange-400
              text-white
              font-bold
              text-xs lg:text-sm
              shadow-[0_10px_35px_rgba(251,191,36,0.35)]
            "
          >

            <Crown size={15} />

            <span className="hidden sm:block">
              Upgrade Plan
            </span>

            <span className="sm:hidden">
              Upgrade
            </span>

          </motion.button>

          {/* NOTIFICATION */}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 transition-all h-9 w-9 lg:h-10 lg:w-10 shrink-0"
          >

            <Bell size={16} />

          </Button>

          {/* PROFILE */}

          <div
            className="relative"
            ref={dropdownRef}
          >

            <motion.button
              whileTap={{
                scale: 0.97,
              }}
              onClick={() =>
                setOpen(!open)
              }
              className="flex items-center gap-2 lg:gap-3 rounded-xl lg:rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-xl px-2 lg:px-4 py-2 shadow-sm hover:shadow-xl transition-all duration-300"
            >

              <div className="hidden md:flex flex-col items-end">

                <span className="text-sm font-bold text-gray-900 capitalize">
                  {userName}
                </span>

                <div className="flex items-center gap-2 mt-0.5">

                  <span className="relative flex h-2.5 w-2.5">

                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>

                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>

                  </span>

                  <span className="text-xs text-green-600 font-semibold">
                    Online
                  </span>

                </div>

              </div>

              <Avatar className="h-10 w-10 lg:h-11 lg:w-11 border-2 border-green-200 shadow-sm">

                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black text-sm lg:text-lg">

                  {firstLetter}

                </AvatarFallback>

              </Avatar>

              <ChevronDown
                size={15}
                className={`transition-transform duration-300 ${open
                    ? "rotate-180"
                    : ""
                  }`}
              />

            </motion.button>

            <AnimatePresence>

              {open && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 12,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 12,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                  className="absolute right-0 mt-4 w-[300px] rounded-[30px] border border-gray-200 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.12)] overflow-hidden z-50"
                >

                  <div className="p-6 border-b border-gray-100">

                    <div className="flex items-center gap-4">

                      <Avatar className="h-16 w-16 border-2 border-green-200">

                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl font-black">

                          {firstLetter}

                        </AvatarFallback>

                      </Avatar>

                      <div>

                        <p className="font-black text-gray-900 text-lg capitalize">

                          {userName}

                        </p>

                        <p className="text-sm text-gray-500 mt-0.5 break-all">

                          {profile?.email}

                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-3">

                    <button className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-gray-100 transition-all duration-200 text-left">

                      <User size={18} />

                      <span className="text-sm font-semibold">
                        My Profile
                      </span>

                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-red-50 text-red-600 transition-all duration-200 text-left"
                    >

                      <LogOut size={18} />

                      <span className="text-sm font-bold">
                        Logout
                      </span>

                    </button>

                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>

    </header>
  );
}

export default DashboardHeader;