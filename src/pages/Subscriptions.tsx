import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { supabase } from "@/lib/supabase";

type Plan = {
    id: string;
    name: string;
    slug: string;
    price: number;
    credits: number;
    max_profiles: number;
    features: string[];
};

export default function Subscriptions() {
    const [, navigate] = useLocation();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [credits, setCredits] = useState(0);
    const [currentPlan, setCurrentPlan] =
        useState("free");

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const plansRes =
            await supabase
                .from("subscription_plans")
                .select("*")
                .eq("is_active", true);

        const sub =
            await supabase
                .from("user_subscriptions")
                .select("*")
                .eq("user_id", user.id)
                .single();

        if (plansRes.data)
            setPlans(plansRes.data);

        if (sub.data) {
            setCredits(sub.data.credits);
            setCurrentPlan(
                sub.data.plan_slug
            );
        }
    }

    return (
        <div className="min-h-screen bg-[#07070A] text-white">

            <div className="max-w-7xl mx-auto p-10">

                <button
                    onClick={() => navigate("/")}
                    className="mb-8 text-purple-400"
                >
                    ← Dashboard
                </button>

                <div className="mb-10">

                    <h1 className="text-5xl font-bold">
                        Upgrade Your Plan
                    </h1>

                    <p className="text-zinc-400 mt-3">
                        Unlock more credits and
                        create more AI profiles
                    </p>

                </div>

                <div
                    className="
          bg-gradient-to-r
          from-violet-600
          to-purple-700
          rounded-3xl
          p-8
          mb-10
          shadow-2xl
        "
                >

                    <div className="text-sm">
                        Available Credits
                    </div>

                    <div className="text-6xl font-bold">
                        {credits}
                    </div>

                    <div className="opacity-80">
                        Current Plan:
                        {" "}
                        {currentPlan.toUpperCase()}
                    </div>

                </div>

                <div
                    className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-8
        "
                >

                    {plans.map((plan) => {

                        const active =
                            plan.slug === currentPlan;

                        return (
                            <div
                                key={plan.id}
                                className={`
                  rounded-[32px]
                  p-8
                  border
                  transition
                  hover:scale-[1.03]

                  ${active
                                        ? `
                    bg-gradient-to-b
                    from-purple-600
                    to-violet-800
                    border-purple-400
                  `
                                        : `
                    bg-zinc-900
                    border-zinc-800
                  `
                                    }
                `}
                            >

                                <div className="flex justify-between">

                                    <h2 className="text-3xl font-bold">
                                        {plan.name}
                                    </h2>

                                    {active && (
                                        <div
                                            className="
                      bg-white
                      text-black
                      rounded-full
                      px-3
                      py-1
                      text-xs
                    "
                                        >
                                            CURRENT
                                        </div>
                                    )}

                                </div>

                                <div className="mt-8">

                                    <div
                                        className="
                    text-5xl
                    font-bold
                  "
                                    >
                                        ${plan.price}
                                    </div>

                                    <div
                                        className="
                    text-zinc-300
                    mt-2
                  "
                                    >
                                        /month
                                    </div>

                                </div>

                                <div className="mt-10">

                                    <div>
                                        ⚡ {plan.credits}
                                        {" "}
                                        Credits
                                    </div>

                                    <div className="mt-3">
                                        🤖
                                        {" "}
                                        {plan.max_profiles}
                                        {" "}
                                        Profiles
                                    </div>

                                </div>

                                <div className="mt-10 space-y-3">

                                    {plan.features?.map(
                                        (
                                            f,
                                            i
                                        ) => (
                                            <div key={i}>
                                                ✓ {f}
                                            </div>
                                        )
                                    )}

                                </div>

                                <button
                                    disabled={active}
                                    className={`
                    mt-10
                    w-full
                    h-14
                    rounded-2xl
                    font-bold

                    ${active
                                            ? `
                      bg-white
                      text-black
                    `
                                            : `
                      bg-gradient-to-r
                      from-purple-600
                      to-violet-600
                    `
                                        }
                  `}
                                >
                                    {active
                                        ? "Current Plan"
                                        : "Upgrade"}
                                </button>

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}