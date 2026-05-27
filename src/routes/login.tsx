import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — ManageXOne" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    // Block admin from signing in via the user portal
    const uid = data.user?.id;
    let isAdmin = false;
    if (uid) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    }
    setLoading(false);

    if (isAdmin) {
      await supabase.auth.signOut();
      toast.error("Admin accounts must sign in via the Admin portal.");
      navigate({ to: "/admin-login" });
      return;
    }

    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-hero p-12 text-white md:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
            <Sparkles className="h-5 w-5 text-gold-foreground" />
          </div>
          <div className="font-display text-lg font-bold">ManageXOne</div>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Smart Business <span className="text-gradient-gold">Management</span>
          </h2>
          <p className="mt-4 max-w-md text-white/70">Welcome back. Manage HRIS, Accounting, Billing & Compliance — all from one dashboard.</p>
        </div>
        <div className="text-xs text-white/50">© {new Date().getFullYear()} ManageXOne</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy-deep">Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Apne ManageXOne account me sign in karein.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-hero text-white hover:opacity-90">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-medium text-navy-deep underline">Start a free trial</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
