import type { Session } from "@supabase/supabase-js";

import { createContext, useContext } from "react";

import type { supabase } from "@/lib/supabase";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
