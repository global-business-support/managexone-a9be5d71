import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "member" | "trial";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  approved: boolean;
  trial_expires_at: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  trialExpired: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((p as Profile) ?? null);
    const roles = (r ?? []).map((x: { role: AppRole }) => x.role);
    const top: AppRole | null = roles.includes("admin")
      ? "admin"
      : roles.includes("member")
      ? "member"
      : roles.includes("trial")
      ? "trial"
      : null;
    setRole(top);
    setLoading(false);
  };

  const refresh = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, s) => {
      setLoading(true);
      setSession(s);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const isAdmin = role === "admin";
  const isApproved = !!profile?.approved || isAdmin;
  const trialExpired =
    role === "trial" && !!profile && new Date(profile.trial_expires_at).getTime() < Date.now();

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, role, loading, isAdmin, isApproved, trialExpired, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
