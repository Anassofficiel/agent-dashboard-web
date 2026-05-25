import { useEffect, useState } from "react";

import {
  Switch,
  Route,
  Router as WouterRouter,
  Redirect,
} from "wouter";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { supabase } from "@/lib/supabase";
import { initPushForUser } from "@/lib/firebasePush";

import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setLoading(false);

        // On first load, if already logged in, init push
        if (s?.user?.id) {
          initPushForUser(s.user.id).catch(console.error);
        }
      });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s);

        // Init push every time a new session starts (login)
        if (s?.user?.id) {
          initPushForUser(s.user.id).catch(console.error);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {session ? <Dashboard /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login">
        {!session ? <Login /> : <Redirect to="/" />}
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;