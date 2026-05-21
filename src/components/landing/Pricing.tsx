import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₹ 1,499",
    period: "/month",
    desc: "Small business & freelancers ke liye perfect.",
    features: ["1 Company", "Upto 10 Employees", "GST Billing", "Basic Accounting", "Email Support"],
    cta: "Start Trial",
    highlight: false,
  },
  {
    name: "Professional",
    price: "₹ 3,999",
    period: "/month",
    desc: "Growing SMEs & multi-branch ke liye.",
    features: ["5 Companies", "Upto 100 Employees", "EPFO + ESIC + TDS Files", "P&L + Balance Sheet", "Priority Support", "Multi-user Access"],
    cta: "Start Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Large organizations & chains ke liye.",
    features: ["Unlimited Companies", "Unlimited Employees", "Dedicated CRM Module", "Custom Reports", "24x7 Support + SLA", "On-site Onboarding"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-widest text-accent">Transparent Pricing</div>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Simple Plans. Powerful Features.</h2>
        <p className="mt-4 text-muted-foreground">14-day free trial. No credit card. Cancel anytime.</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
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
              <span className="font-display text-5xl font-bold">{p.price}</span>
              <span className={p.highlight ? "text-white/60" : "text-muted-foreground"}>{p.period}</span>
            </div>
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
              <Link to="/signup">{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
