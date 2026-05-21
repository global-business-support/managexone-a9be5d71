import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type Billing = "monthly" | "yearly";

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: 2999,
    desc: "Perfect for small businesses & freelancers.",
    features: ["1 Company", "Up to 10 Employees", "GST Billing", "Basic Accounting", "Email Support"],
    cta: "Start Trial",
    highlight: false,
  },
  {
    id: "professional",
    name: "Professional",
    monthly: 5999,
    desc: "For growing SMEs & multi-branch businesses.",
    features: ["5 Companies", "Up to 100 Employees", "EPFO + ESIC + TDS Files", "P&L + Balance Sheet", "Priority Support", "Multi-user Access"],
    cta: "Start Trial",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    desc: "For large organizations & chains.",
    features: ["Unlimited Companies", "Unlimited Employees", "Dedicated CRM Module", "Custom Reports", "24x7 Support + SLA", "On-site Onboarding"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const inr = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-widest text-accent">Transparent Pricing</div>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Simple Plans. Powerful Features.</h2>
        <p className="mt-4 text-muted-foreground">1-day free trial. No credit card. Cancel anytime.</p>

        <div className="mt-8 inline-flex items-center rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              billing === "monthly" ? "bg-navy-deep text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
              billing === "yearly" ? "bg-navy-deep text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground">SAVE 20%</span>
          </button>
        </div>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const yearlyTotal = p.monthly ? Math.round(p.monthly * 12 * 0.8) : null;
          const yearlyPerMonth = p.monthly ? Math.round((p.monthly * 12 * 0.8) / 12) : null;
          const priceLabel = p.monthly === null
            ? "Custom"
            : billing === "monthly" ? inr(p.monthly) : inr(yearlyPerMonth!);
          const period = p.monthly === null ? "" : "/month";

          return (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                p.highlight
                  ? "border-accent bg-gradient-hero text-white shadow-elegant md:-translate-y-4"
                  : "border-border bg-card hover:border-accent/40"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-gold px-4 py-1 text-xs font-semibold text-gold-foreground shadow-gold">
                  MOST POPULAR
                </div>
              )}
              <div className="font-display text-2xl font-bold">{p.name}</div>
              <p className={`mt-1 text-sm ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{priceLabel}</span>
                <span className={p.highlight ? "text-white/60" : "text-muted-foreground"}>{period}</span>
              </div>
              {billing === "yearly" && yearlyTotal && (
                <div className={`mt-1 text-xs ${p.highlight ? "text-gold" : "text-accent"}`}>
                  {inr(yearlyTotal)} billed yearly · 20% off
                </div>
              )}
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-gold" : "text-accent"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-8 w-full ${
                  p.highlight
                    ? "bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90"
                    : "bg-navy-deep text-white hover:bg-navy"
                }`}
              >
                {p.monthly === null ? (
                  <a href="#contact">{p.cta}</a>
                ) : (
                  <Link to="/checkout" search={{ plan: p.id, billing }}>{p.cta}</Link>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
