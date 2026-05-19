import { useEffect, useState } from "react";

import {
  Switch,
  Route,
  Router as WouterRouter,
  Redirect,
} from "wouter";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { supabase } from "@/lib/supabase";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";


const queryClient = new QueryClient();

function Router() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // CHECK SESSION
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center text-white">
        <div className="animate-pulse text-xl font-semibold">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Switch>

      {/* DASHBOARD */}
      <Route path="/">
        {session ? <Dashboard /> : <Redirect to="/login" />}
      </Route>

      {/* LOGIN */}
      <Route path="/login">
        {!session ? <Login /> : <Redirect to="/" />}
      </Route>


      {/* 404 */}
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