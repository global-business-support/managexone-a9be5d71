import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Sparkles } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — ManageXOne" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Reset link sent! Check your email.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-deep">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="font-display text-lg font-bold text-navy-deep">ManageXOne</div>
        </Link>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-deep">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
            ✅ Reset link sent to <b>{email}</b>. Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-navy-deep text-white hover:bg-navy-deep/90">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <div className="mt-6 flex justify-between text-sm">
          <Link to="/login" className="text-navy-deep underline">← User Login</Link>
          <Link to="/admin-login" className="text-navy-deep underline">Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
