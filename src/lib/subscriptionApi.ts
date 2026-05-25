import { supabase } from "./supabase";

export async function getPlans() {
    const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price");

    if (error) throw error;

    return data;
}

export async function getCurrentSubscription() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error) return null;

    return data;
}

export async function getCredits() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

    return data;
}