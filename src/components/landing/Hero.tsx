import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Check } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-white">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.78 0.13 85 / 0.25), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.4 0.1 255 / 0.4), transparent 50%)" }} />
      <div className="container relative mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:py-28 lg:py-32">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 text-xs font-medium text-gold backdrop-blur">
            <Zap className="h-3.5 w-3.5" /> All-In-One Business Suite — 14 Day Free Trial
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
            Run Your Entire <span className="text-gradient-gold">Business</span> From One Smart Dashboard
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            ManageXOne ek hi platform me HRIS, Accounting, GST Billing, EPFO &amp; ESIC compliance, P&amp;L, Balance Sheet aur multi-company CRM deta hai — Hotels, Gyms, Hospitals aur har business ke liye.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90">
              <Link to="/signup">Start 14-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
              <a href="#modules">Explore Modules</a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {["No credit card", "GST & TDS ready", "Multi-company", "Cloud secured"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> {t}</li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-gold opacity-20 blur-3xl" />
          <div className="relative rounded-2xl border border-white/10 bg-navy-deep/60 p-6 shadow-elegant backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-gold">Live Dashboard</div>
                <div className="font-display text-2xl font-semibold">Acme Industries Pvt Ltd</div>
              </div>
              <ShieldCheck className="h-6 w-6 text-gold" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { label: "Revenue (MTD)", value: "₹ 48.2L", trend: "+12.4%" },
                { label: "GST Payable", value: "₹ 3.8L", trend: "Filed" },
                { label: "Employees", value: "247", trend: "EPFO ✓" },
                { label: "Invoices", value: "1,284", trend: "This Month" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">{s.label}</div>
                  <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-gold">{s.trend}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex justify-between text-xs text-white/60"><span>P&amp;L Snapshot</span><span>FY 2025-26</span></div>
              <div className="flex h-24 items-end gap-2">
                {[40, 65, 50, 75, 90, 70, 95, 80, 110, 95, 130, 120].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-gold" style={{ height: `${h * 0.7}%`, opacity: 0.4 + i * 0.05 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
