import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { hasAdminAccess } from "@/components/pages/auth/adminAccess";
import { AuthContext } from "@/components/pages/auth/auth-context";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let adminId: string | undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextAdminId = hasAdminAccess(nextSession?.user) ? nextSession?.user.id : undefined;
      if (adminId && adminId !== nextAdminId) queryClient.clear();
      adminId = nextAdminId;
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
