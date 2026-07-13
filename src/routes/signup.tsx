import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Check } from "lucide-react";

interface SignupSearch {
  ref?: string;
}

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Start Free Trial — ManageXOne" }] }),
  validateSearch: (search: Record<string, unknown>): SignupSearch => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/signup" });
  const refCode = (search.ref ?? "").toUpperCase();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: name,
          company_name: company,
          ...(refCode ? { referred_by: refCode } : {}),
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Trial account created! Signing you in…");
    // Try immediate sign-in so user lands in dashboard right away
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) navigate({ to: "/login" });
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy-deep">Start Your 1-Day Free Trial</h1>
            <p className="mt-1 text-sm text-muted-foreground">No credit card required. Trial gives limited access — full access after admin approval.</p>
            {refCode && (
              <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Referred by code <b className="font-mono">{refCode}</b>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" required value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90">
            {loading ? "Creating account..." : "Create Free Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-navy-deep underline">Sign in</Link>
          </p>
        </form>
      </div>
      <div className="relative hidden flex-col justify-between bg-gradient-hero p-12 text-white md:flex">
        <Link to="/" className="flex items-center gap-2 self-end">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
            <Sparkles className="h-5 w-5 text-gold-foreground" />
          </div>
          <div className="font-display text-lg font-bold">ManageXOne</div>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Everything included in your <span className="text-gradient-gold">trial</span>
          </h2>
          <ul className="mt-6 space-y-3 text-white/80">
            {[
              "Full HRIS + Payroll",
              "GST Billing & Accounting",
              "EPFO / ESIC / TDS file generation",
              "P&L + Balance Sheet automated",
              "Multi-company CRM access",
              "Priority email support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground"><Check className="h-3 w-3" /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-xs text-white/50">© {new Date().getFullYear()} ManageXOne</div>
      </div>
    </div>
  );
}
