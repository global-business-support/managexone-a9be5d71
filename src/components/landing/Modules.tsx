import { Users, Calculator, Receipt, FileSpreadsheet, ShieldCheck, FileText, BarChart3, Building2, CreditCard, BookOpen, Briefcase, Wallet } from "lucide-react";

const modules = [
  { icon: Users, title: "HRIS", desc: "Employees, attendance, leaves, payroll & full lifecycle management." },
  { icon: Calculator, title: "Accounting", desc: "Double-entry, ledgers, journals — everything an accountant does, fully automated." },
  { icon: Receipt, title: "GST Billing", desc: "GSTIN auto-fill and party-wise GST amounts reflected directly in the invoice." },
  { icon: FileSpreadsheet, title: "EPFO File Generation", desc: "Salary-based EPFO ECR file ready for direct portal upload." },
  { icon: ShieldCheck, title: "ESIC Excel", desc: "Auto-generated ESIC contribution Excel for monthly filing." },
  { icon: FileText, title: "TDS Management", desc: "Section-wise TDS deduction, challan tracking and 26Q / 24Q ready." },
  { icon: BarChart3, title: "P&L + Balance Sheet", desc: "Real-time Profit & Loss and Balance Sheet — auto-tallied for you." },
  { icon: Building2, title: "Multi-Company CRM", desc: "Manage 100+ companies from a single login — CRM-style workspace." },
  { icon: CreditCard, title: "Bill Generation", desc: "Quick billing — POS, retail, hotel folios, gym packages, hospital IPD/OPD." },
  { icon: BookOpen, title: "Documentation", desc: "Centralized document vault — contracts, forms, audit trail." },
  { icon: Briefcase, title: "Vendor / Party Ledger", desc: "Party-wise outstanding, ageing reports and payment reminders." },
  { icon: Wallet, title: "Bank & Cash Book", desc: "Bank reconciliation, cash flow and daily closing — all automated." },
];

export function Modules() {
  return (
    <section id="modules" className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 0%, oklch(0.85 0.13 85 / 0.25), transparent 40%), radial-gradient(circle at 90% 100%, oklch(0.78 0.11 230 / 0.2), transparent 45%)",
        }}
      />
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Powerful Modules</div>
          <h2 className="mt-3 font-display text-4xl font-bold text-navy-deep md:text-5xl">Everything Your Business Needs</h2>
          <p className="mt-4 text-muted-foreground">Compliance, accounting, billing and operations — every module deeply integrated.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-gold opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-gold shadow-elegant ring-1 ring-gold/30">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-navy-deep">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
