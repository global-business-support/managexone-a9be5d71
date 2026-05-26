import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  plan: z.enum(["starter", "professional"]).default("starter"),
  billing: z.enum(["monthly", "yearly"]).default("monthly"),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Checkout — ManageXOne" }] }),
  component: CheckoutPage,
});

type PlanDef = { name: string; monthly: number; features: string[] };
const PLANS: Record<"starter" | "professional", PlanDef> = {
  starter: { name: "Starter", monthly: 2999, features: ["1 Company", "Up to 10 Employees", "GST Billing", "Basic Accounting"] },
  professional: { name: "Professional", monthly: 5999, features: ["5 Companies", "Up to 100 Employees", "EPFO + ESIC + TDS", "P&L + Balance Sheet"] },
};

const inr = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

function CheckoutPage() {
  const { plan, billing } = Route.useSearch() as { plan: "starter" | "professional"; billing: "monthly" | "yearly" };
  const p: PlanDef = PLANS[plan];
  const baseTotal = billing === "yearly" ? Math.round(p.monthly * 12 * 0.8) : p.monthly;
  const gst = Math.round(baseTotal * 0.18);
  const total = baseTotal + gst;

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", gstin: "" });
  const [loading, setLoading] = useState(false);

  const onPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill name, email and phone.");
      return;
    }
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setLoading(false);
      toast.error("Please sign in / sign up first to complete payment.");
      return;
    }
    const { error } = await supabase.from("payments").insert({
      user_id: uid,
      email: form.email,
      full_name: form.name,
      phone: form.phone,
      company_name: form.company || null,
      plan,
      billing_cycle: billing,
      amount: total,
      currency: "INR",
      status: "pending",
      gstin: form.gstin || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Payment recorded — awaiting admin approval after PhonePe confirmation.");
    // window.location.href = phonePeRedirectUrl;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <div className="font-display text-lg font-bold text-navy-deep">ManageXOne</div>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-deep">Complete Your Purchase</h1>
          <p className="mt-1 text-sm text-muted-foreground">Secure checkout · Pay with PhonePe (UPI, Cards, Net Banking, Wallets)</p>

          <form onSubmit={onPay} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="gstin">GSTIN (optional, for input credit)</Label>
                <Input id="gstin" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} maxLength={15} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="mb-3 text-sm font-semibold text-navy-deep">Payment Method</div>
              <div className="flex items-center gap-3 rounded-lg border-2 border-accent bg-background p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5f259f] text-xs font-bold text-white">Pe</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">PhonePe</div>
                  <div className="text-xs text-muted-foreground">UPI · Cards · Net Banking · Wallets</div>
                </div>
                <Check className="h-5 w-5 text-accent" />
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90">
              {loading ? "Processing…" : `Pay ${inr(total)} with PhonePe`}
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" /> 256-bit SSL · PCI-DSS compliant
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-6">
          <div className="text-xs uppercase tracking-widest text-accent">Order Summary</div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="font-display text-2xl font-bold text-navy-deep">{p.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{billing} billing · 1-day free trial</div>
            </div>
            {billing === "yearly" && (
              <span className="rounded-full bg-gradient-gold px-2.5 py-0.5 text-[10px] font-bold text-gold-foreground">20% OFF</span>
            )}
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({billing})</span>
              <span>{inr(baseTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>{inr(gst)}</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
              <span className="font-semibold text-navy-deep">Total</span>
              <span className="font-display text-2xl font-bold text-navy-deep">{inr(total)}</span>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            Your 1-day free trial starts immediately. You will be charged only after the trial ends. Cancel anytime.
          </div>
        </aside>
      </div>
    </div>
  );
}
