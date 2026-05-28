import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Sparkles } from "lucide-react";

const ADMIN_EMAIL = "jeet0731@gmail.com";
const ADMIN_PASSWORD = "welcome4U@";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Sign In — ManageXOne" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error && email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: { full_name: "Administrator", company_name: "ManageXOne" },
        },
      });
      if (!signUpErr) {
        const retry = await supabase.auth.signInWithPassword({ email, password });
        error = retry.error;
        signInData = retry.data;
      } else if (!/already/i.test(signUpErr.message)) {
        error = signUpErr;
      }
    }

    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    // Verify admin role before navigating — prevents racing with profile load
    const uid = signInData?.user?.id;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid!);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    setLoading(false);

    if (!isAdmin) {
      await supabase.auth.signOut();
      return toast.error("Yeh account admin nahi hai.");
    }

    toast.success("Admin session active");
    window.location.assign("/admin");
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
            Approve members, manage subscriptions, and configure system-wide settings for every connected company.
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
            {loading ? "Verifying..." : "Sign In as Admin"}
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
