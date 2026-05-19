import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Sparkles,
  ArrowRight,
  Bot,
  CheckCircle2,
} from "lucide-react";

interface HeroSectionProps {
  onCreateClick: () => void;
}

export function HeroSection({
  onCreateClick,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border/50 bg-gradient-to-br from-white via-white to-primary/[0.03] shadow-[0_10px_60px_rgba(0,0,0,0.06)]">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />

        <div className="absolute -bottom-40 -right-32 w-[420px] h-[420px] bg-violet-500/10 rounded-full blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        {/* LEFT SIDE */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-semibold shadow-sm mb-6">
            <Sparkles size={15} />
            <span>Next-gen Autoreply System</span>
          </div>

          {/* Title */}
          <h1 className="text-[42px] leading-[1.05] sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-2xl">
            Put your WhatsApp
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              on Autopilot
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-8 max-w-xl">
            Deploy an intelligent AI assistant that
            answers questions, qualifies leads,
            captures customers, and handles support
            on your WhatsApp numbers 24/7.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-7">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border shadow-sm">
              <CheckCircle2 className="text-green-500 w-4 h-4" />
              <span className="text-sm font-medium">
                Instant Replies
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border shadow-sm">
              <CheckCircle2 className="text-green-500 w-4 h-4" />
              <span className="text-sm font-medium">
                AI Automation
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border shadow-sm">
              <CheckCircle2 className="text-green-500 w-4 h-4" />
              <span className="text-sm font-medium">
                WhatsApp Cloud API
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex justify-center sm:justify-start">
            <Button
              size="lg"
              onClick={onCreateClick}
              className="
    h-[60px]
    min-w-[240px]
    rounded-[22px]
    text-[17px]
    font-bold
    bg-gradient-to-r
    from-[#6D28D9]
    via-[#7C3AED]
    to-[#9333EA]
    text-white
    border-0
    shadow-[0_15px_45px_rgba(124,58,237,0.45)]
    hover:scale-[1.04]
    hover:shadow-[0_18px_60px_rgba(124,58,237,0.60)]
    active:scale-[0.98]
    transition-all
    duration-300
    group
    relative
    overflow-hidden
    px-8
  "
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Shine */}
              <div className="absolute top-0 left-[-120%] h-full w-[80%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[120%] transition-all duration-1000" />

              <Plus className="mr-3 h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />

              <span className="relative z-10 tracking-wide">
                Create AI Profile
              </span>
            </Button>
          </div>
        </motion.div>

        {/* RIGHT SIDE CHAT */}
        <motion.div
          className="w-full flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
          }}
        >
          <div className="relative w-full max-w-[370px]">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-violet-500/20 to-fuchsia-500/20 rounded-[40px] blur-3xl animate-pulse" />

            {/* Card */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/90 backdrop-blur-2xl shadow-[0_20px_80px_rgba(124,58,237,0.15)]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b bg-white/70">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-lg text-white">
                    <Bot size={20} />
                  </div>

                  <div>
                    <div className="font-bold text-[15px]">
                      AI WhatsApp Agent
                    </div>

                    <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Online now
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>
              {/* CHAT SECTION */}
              <div className="relative p-4 sm:p-5 bg-gradient-to-b from-white via-white to-primary/[0.03] min-h-[420px] flex flex-col justify-end overflow-hidden">

                {/* Background Glow */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-52 h-52 bg-primary/10 blur-3xl rounded-full" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-400/10 blur-3xl rounded-full" />
                </div>

                {/* Messages */}
                <div className="relative z-10 space-y-5">

                  {/* USER MESSAGE */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -40,
                      y: 30,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className="flex items-end gap-3"
                  >
                    {/* USER AVATAR */}
                    <div className="relative">
                      <img
                        src="https://i.pravatar.cc/100?img=12"
                        alt="User"
                        className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-lg"
                      />

                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                    </div>

                    {/* USER BUBBLE */}
                    <div className="bg-white border border-border/60 rounded-[24px] rounded-bl-md px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.06)] max-w-[82%]">

                      <p className="text-[14px] sm:text-[15px] leading-6 text-muted-foreground font-medium">
                        Hi 👋 I want to automate replies for my
                        WhatsApp business. Do you support AI
                        auto-responses?
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          09:41 AM
                        </span>

                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />

                        <span className="text-[10px] text-green-600 font-medium">
                          Sent
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI TYPING */}
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay: 1,
                    }}
                    className="flex items-center gap-3"
                  >
                    {/* AI AVATAR */}
                    <div className="relative">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-xl shadow-primary/30">
                        <Bot size={18} className="text-white" />
                      </div>

                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                    </div>

                    {/* TYPING */}
                    <div className="bg-white border border-border/60 rounded-full px-4 py-3 flex items-center gap-1 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />

                      <span className="ml-2 text-xs text-muted-foreground">
                        AI is typing...
                      </span>
                    </div>
                  </motion.div>

                  {/* AI MESSAGE */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 40,
                      y: 30,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.7,
                      delay: 1.8,
                    }}
                    className="flex justify-end"
                  >
                    <div className="flex items-end gap-3 max-w-[92%]">

                      {/* MESSAGE */}
                      <div className="relative overflow-hidden bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] text-white rounded-[26px] rounded-br-md px-5 py-4 shadow-[0_18px_50px_rgba(124,58,237,0.35)]">

                        {/* Glow */}
                        <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                        <p className="relative z-10 text-[14px] sm:text-[15px] leading-7 font-medium">
                          Yes 🚀 Our AI assistant can instantly
                          answer customers, automate support,
                          capture leads, qualify prospects,
                          and work 24/7 directly on WhatsApp.
                        </p>

                        <div className="relative z-10 flex items-center justify-end gap-2 mt-3">
                          <span className="text-[10px] text-white/70">
                            09:42 AM
                          </span>

                          {/* DOUBLE CHECK */}
                          <div className="flex -space-x-1">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-white/80"
                            >
                              <path
                                d="M5 13L9 17L19 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>

                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-cyan-300"
                            >
                              <path
                                d="M5 13L9 17L19 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* AI AVATAR */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-xl shadow-primary/30">
                          <Bot size={18} className="text-white" />
                        </div>

                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                      </div>
                    </div>
                  </motion.div>

                  {/* SECOND USER MESSAGE */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -40,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 2.7,
                    }}
                    className="flex items-end gap-3"
                  >
                    <img
                      src="https://i.pravatar.cc/100?img=12"
                      alt="User"
                      className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-lg"
                    />

                    <div className="bg-white border border-border/60 rounded-[24px] rounded-bl-md px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.06)] max-w-[80%]">
                      <p className="text-[14px] sm:text-[15px] leading-6 text-muted-foreground font-medium">
                        Amazing 😍 How can I get started?
                      </p>

                      <div className="mt-2 text-[10px] text-muted-foreground">
                        09:43 AM
                      </div>
                    </div>
                  </motion.div>
                </div>
                {/* INPUT */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 3.2,
                  }}
                  className="relative z-10 mt-7"
                >
                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-border/60 rounded-2xl px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Bot
                        size={18}
                        className="text-white"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Type your message..."
                      disabled
                      className="flex-1 bg-transparent outline-none text-sm text-muted-foreground placeholder:text-muted-foreground/60"
                    />

                    <motion.div
                      whileHover={{
                        scale: 1.06,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      className="w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center text-white shadow-xl shadow-primary/30 cursor-pointer"
                    >
                      <ArrowRight size={18} />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}