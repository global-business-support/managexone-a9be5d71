import { Link } from "@tanstack/react-router";
import { Users, Calculator, Receipt, ArrowRight } from "lucide-react";

const quickItems = [
  {
    icon: Users,
    title: "HRIS",
    desc: "Employees, attendance, payroll, EPFO & ESIC — all in one workspace.",
    to: "/dashboard/hris",
  },
  {
    icon: Calculator,
    title: "Accounting",
    desc: "Ledger, journal, P&L, balance sheet — full accountant-grade books.",
    to: "/dashboard/accounting",
  },
  {
    icon: Receipt,
    title: "Bill Generation",
    desc: "Create GST invoices, add parties with GSTIN and print-ready bills.",
    to: "/dashboard/billing",
  },
];

export function QuickAccess() {
  return (
    <section className="border-y bg-muted/40 py-14">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Quick Access</div>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy-deep md:text-4xl">
            Jump straight into work
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Launch the most-used modules with one click after signing in.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {quickItems.map((q) => (
            <Link
              key={q.title}
              to={q.to}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground">
                <q.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-navy-deep">{q.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{q.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-deep group-hover:text-gold">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
