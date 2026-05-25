import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HeroSection } from "@/components/HeroSection";
import { ProfileGrid } from "@/components/ProfileGrid";
import { CreateProfileModal } from "@/components/modals/CreateProfileModal";
import { ConnectWhatsAppModal } from "@/components/modals/ConnectWhatsAppModal";
import { ConfigureAssistantModal } from "@/components/modals/ConfigureAssistantModal";
import { Profile, AssistantConfig } from "@/types";
import { useToast } from "@/hooks/use-toast";
import SubscriptionSection from "@/components/SubscriptionSection";

import { notifyUpgradeAvailable, notifyDailyReport } from "@/lib/sendNotification";
import { supabase } from "@/lib/supabase";
import {
  getProfiles,
  createProfile,
  deleteProfile,
  saveAssistantConfig,
  connectWhatsApp,
  disconnectWhatsApp,
} from "@/lib/profileApi";

type SupabaseAssistantConfigRow = {
  profile_id: string;
  assistant_name: string;
  assistant_type: string;
  ai_provider: string;
  system_prompt: string;
  knowledge_base: string | null;
  voice_enabled: boolean;
  is_active: boolean;
};

type SupabaseWhatsAppSessionRow = {
  profile_id: string;
  session_id: string | null;
  status: string;
  qr_code: string | null;
  connected_at: string | null;
  updated_at: string;
};

type SupabaseProfileRow = {
  id: string;
  name: string;
  connection_status: string;
  phone_number: string | null;
  created_at: string;
  assistant_configs?: SupabaseAssistantConfigRow | SupabaseAssistantConfigRow[] | null;
  whatsapp_sessions?: SupabaseWhatsAppSessionRow | SupabaseWhatsAppSessionRow[] | null;
};

function mapSupabaseProfiles(data: SupabaseProfileRow[]): Profile[] {
  return (data || []).map((item) => {
    const rawConfig = Array.isArray(item.assistant_configs)
      ? item.assistant_configs[0]
      : item.assistant_configs || null;

    const rawSession = Array.isArray(item.whatsapp_sessions)
      ? item.whatsapp_sessions[0]
      : item.whatsapp_sessions || null;

    const isConnected =
      rawSession?.status === "connected" ||
      item.connection_status === "connected";

    const assistantConfig = rawConfig
      ? {
        name: rawConfig.assistant_name,
        type: rawConfig.assistant_type,
        provider: rawConfig.ai_provider,
        systemPrompt: rawConfig.system_prompt,
        knowledgeBase: rawConfig.knowledge_base || "",
        voiceResponse: rawConfig.voice_enabled,
        isActive: rawConfig.is_active,
      }
      : undefined;

    return {
      id: item.id,
      name: item.name,
      status:
        assistantConfig?.isActive && isConnected
          ? "ai_active"
          : isConnected
            ? "connected"
            : "not_connected",
      assistantConfig,
    } satisfies Profile;
  });
}

export default function Dashboard() {
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [connectModalProfileId, setConnectModalProfileId] = useState<string | null>(null);
  const [configModalProfileId, setConfigModalProfileId] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // ─── Load profiles ─────────────────────────────────────────────────────────

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoadingProfiles(true);
      const data = (await getProfiles()) as SupabaseProfileRow[];
      console.log("Profiles from Supabase:", data);
      setProfiles(mapSupabaseProfiles(data || []));
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles from Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // ─── Daily report notification (fires once per calendar day per user) ───────

  useEffect(() => {
    async function maybeSendDailyReport() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fire at most once per calendar day
        const key = `daily_report_sent_${user.id}`;
        const lastSent = localStorage.getItem(key);
        const today = new Date().toDateString();
        if (lastSent === today) return;

        // Count messages sent today (adjust table name to match your schema)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("message_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString());

        const messageCount = count ?? 0;
        if (messageCount > 0) {
          await notifyDailyReport(user.id, messageCount);
        }

        localStorage.setItem(key, today);
      } catch (err) {
        console.warn("Daily report notification skipped:", err);
      }
    }

    maybeSendDailyReport();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateProfile = async (name: string) => {
    try {
      const created = await createProfile(name);
      // 🚀 notifyProfileCreated() fired inside createProfile() in profileApi.ts
      await loadProfiles();
      setCreateModalOpen(false);
      toast({
        title: "Profile Created 🎉",
        description: `WhatsApp profile "${created.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating profile:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create profile.";
      toast({ title: "Error", description: message, variant: "destructive" });
      throw error;
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Profile Deleted", description: "The profile has been removed successfully." });
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({ title: "Error", description: "Failed to delete profile.", variant: "destructive" });
    }
  };

  const handleDisconnectWhatsApp = async (id: string) => {
    try {
      await disconnectWhatsApp(id);
      // 🔴 notifyWhatsAppDisconnected() fired inside disconnectWhatsApp() in profileApi.ts
      await loadProfiles();
      toast({
        title: "WhatsApp Disconnected",
        description: "The WhatsApp account has been disconnected from the dashboard.",
      });
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      toast({ title: "Error", description: "Failed to disconnect WhatsApp.", variant: "destructive" });
    }
  };

  const handleSaveConfig = async (id: string, config: AssistantConfig) => {
    try {
      const selectedProfile = profiles.find((p) => p.id === id);
      if (!selectedProfile) throw new Error("Profile not found.");

      if (selectedProfile.status === "not_connected") {
        throw new Error("Connect WhatsApp first before activating the assistant.");
      }

      await saveAssistantConfig(id, config);
      await loadProfiles();
      setConfigModalProfileId(null);

      if (config.isActive) {
        toast({ title: "AI Activated 🚀", description: "Your assistant is now ready to reply automatically." });
      } else {
        toast({ title: "Configuration Saved", description: "Assistant settings updated." });
      }
    } catch (error) {
      console.error("Error saving assistant config:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save assistant configuration.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  // ─── Upgrade click — scrolls to section AND sends upgrade push ────────────

  const handleUpgradeClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 👑 Upgrade available notification
        notifyUpgradeAvailable(user.id).catch(console.error);
      }
    } catch {
      // non-critical
    }
    document
      .getElementById("subscription-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <DashboardHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-12 z-0">
        <HeroSection onCreateClick={() => setCreateModalOpen(true)} />

        <ProfileGrid
          profiles={profiles}
          onCreateClick={() => setCreateModalOpen(true)}
          onConnectClick={(id) => {
            const selectedProfile = profiles.find((p) => p.id === id);
            if (!selectedProfile) return;
            localStorage.setItem("active_profile", selectedProfile.name);
            console.log("ACTIVE PROFILE:", selectedProfile.name);
            setConnectModalProfileId(id);
          }}
          onConfigClick={(id) => {
            const selectedProfile = profiles.find((p) => p.id === id);
            if (!selectedProfile) return;
            localStorage.setItem("active_profile", selectedProfile.name);
            console.log("ACTIVE PROFILE:", selectedProfile.name);

            if (selectedProfile.status === "not_connected") {
              toast({
                title: "Connect WhatsApp First",
                description: "You need to connect WhatsApp before configuring the assistant.",
                variant: "destructive",
              });
              return;
            }

            setConfigModalProfileId(id);
          }}
          onDeleteClick={handleDeleteProfile}
          onDisconnectClick={handleDisconnectWhatsApp}
        />

        {/* Subscription section — target of DashboardHeader Upgrade button */}
        <div id="subscription-section" className="mt-28">
          <SubscriptionSection />
        </div>

        {isLoadingProfiles && (
          <div className="text-sm text-muted-foreground px-1">Syncing profiles...</div>
        )}
      </main>

      <CreateProfileModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProfile}
      />

      <ConnectWhatsAppModal
        isOpen={!!connectModalProfileId}
        profileId={connectModalProfileId}
        onClose={() => setConnectModalProfileId(null)}
        onConnected={async () => {
          setConnectModalProfileId(null);
          await loadProfiles();
          toast({
            title: "WhatsApp Connected ✅",
            description: "Your WhatsApp account is now linked successfully.",
          });
        }}
      />

      {configModalProfileId && (
        <ConfigureAssistantModal
          isOpen={!!configModalProfileId}
          onClose={() => setConfigModalProfileId(null)}
          profile={profiles.find((p) => p.id === configModalProfileId)}
          onSave={(config) => handleSaveConfig(configModalProfileId, config)}
        />
      )}
    </div>
  );
}