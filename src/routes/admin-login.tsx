import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const ADMIN_EMAIL = "jeet0731@gmail.com";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Sign In — ManageXOne" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { refresh, loading: authLoading, isAdmin, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.email?.toLowerCase() === ADMIN_EMAIL && isAdmin) {
      navigate({ to: "/admin", replace: true });
    }
  }, [authLoading, isAdmin, navigate, user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setLoading(false);
      return toast.error("Access denied. Only the authorized admin email can sign in.");
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setLoading(false);
      return toast.error("Admin login failed. Please retry with the authorized account.");
    }

    const uid = signInData?.user?.id;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid!);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");

    if (!isAdmin) {
      setLoading(false);
      await supabase.auth.signOut();
      return toast.error("This account does not have admin access.");
    }

    await refresh();
    setLoading(false);
    toast.success("Admin session active");
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-navy-deep p-12 text-white md:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
            <Sparkles className="h-5 w-5 text-gold-foreground" />
          </div>
          <div className="font-display text-lg font-bold">ManageXOne</div>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> Restricted Area
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight">
            Admin <span className="text-gradient-gold">Control Center</span>
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Admin access is restricted to the authorized account only. Registration is disabled.
          </p>
        </div>
        <div className="text-xs text-white/50">© {new Date().getFullYear()} ManageXOne</div>
      </div>
      <div className="flex items-center justify-center bg-background p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-navy-deep/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-navy-deep">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-navy-deep">Administrator Sign In</h1>
            <p className="mt-1 text-sm text-muted-foreground">Authorized personnel only.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-navy-deep text-white hover:bg-navy-deep/90">
            {loading ? "Signing in..." : "Sign In as Admin"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <Link to="/login" className="font-medium text-navy-deep underline">User Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
