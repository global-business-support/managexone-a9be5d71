import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MailCheck, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Sign In — ManageXOne" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [mode, setMode] = useState<"login" | "request">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "request") {
      const signUpRes = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-login`,
          data: { full_name: fullName, company_name: companyName, phone },
        },
      });

      if (signUpRes.error && !/already registered|already been registered/i.test(signUpRes.error.message)) {
        setLoading(false);
        return toast.error(signUpRes.error.message);
      }

      // Ensure an active session (handles both new signup and existing account)
      let session = signUpRes.data.session;
      if (!session) {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        if (signInRes.error) {
          setLoading(false);
          return toast.error(signInRes.error.message);
        }
        session = signInRes.data.session;
      }

      // Instantly grant admin role — no email approval required
      const { error: rpcError } = await supabase.rpc("self_register_admin");
      if (rpcError) {
        setLoading(false);
        return toast.error(rpcError.message);
      }

      setLoading(false);
      toast.success("Admin account ready. Redirecting...");
      window.location.assign("/admin");
      return;
    }


    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    const uid = signInData?.user?.id;
    const [{ data: roles }, { data: request }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid!),
      supabase.from("admin_requests").select("status").eq("user_id", uid!).maybeSingle(),
    ]);

    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    setLoading(false);

    if (!isAdmin) {
      await supabase.auth.signOut();
      if (request?.status === "pending") {
        return toast.error("Aapki admin request pending hai. Approval ke baad hi access milega.");
      }
      if (request?.status === "rejected") {
        return toast.error("Aapki admin request reject ho chuki hai.");
      }
      return toast.error("Admin access ke liye pehle registration request bhejein.");
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
            Admin aur user access ab alag hai. Pehle admin request submit hogi, phir jeet0731@gmail.com confirmation ke baad hi admin panel access milega.
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
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded px-3 py-2 text-sm font-medium ${mode === "login" ? "bg-navy-deep text-white" : "text-muted-foreground"}`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setMode("request")}
              className={`rounded px-3 py-2 text-sm font-medium ${mode === "request" ? "bg-navy-deep text-white" : "text-muted-foreground"}`}
            >
              Admin Registration
            </button>
          </div>
          {mode === "request" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mode === "request" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Approval Reason</Label>
              <Textarea id="reason" required rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Admin access kis kaam ke liye chahiye?" />
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-navy-deep text-white hover:bg-navy-deep/90">
            {loading ? "Processing..." : mode === "login" ? "Sign In as Admin" : "Request Admin Access"}
          </Button>
          {mode === "request" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Request submit hone ke baad jeet0731@gmail.com ke liye confirmation mail draft open hoga. Approval ke baad hi aap admin panel me login kar payenge.</p>
              </div>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <Link to="/login" className="font-medium text-navy-deep underline">User Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
