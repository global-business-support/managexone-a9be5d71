import { Users, Calculator, Receipt, FileSpreadsheet, ShieldCheck, FileText, BarChart3, Building2, CreditCard, BookOpen, Briefcase, Wallet } from "lucide-react";

const modules = [
  { icon: Users, title: "HRIS", desc: "Employees, attendance, leaves, payroll & full lifecycle management." },
  { icon: Calculator, title: "Accounting", desc: "Double-entry, ledgers, journals — sab kuch ek accountant ke jaisa automated." },
  { icon: Receipt, title: "GST Billing", desc: "GSTIN auto-fill, party-wise GST amount direct invoice me reflect." },
  { icon: FileSpreadsheet, title: "EPFO File Generation", desc: "Salary basis pe EPFO ECR file ready — direct portal upload ready." },
  { icon: ShieldCheck, title: "ESIC Excel", desc: "Auto-generated ESIC contribution Excel for monthly filing." },
  { icon: FileText, title: "TDS Management", desc: "Section-wise TDS deduction, challan tracking & 26Q/24Q ready." },
  { icon: BarChart3, title: "P&L + Balance Sheet", desc: "Real-time Profit & Loss aur Balance Sheet — auto-tally banake deta hai." },
  { icon: Building2, title: "Multi-Company CRM", desc: "Ek hi login se 100+ companies handle karo — CRM type workspace." },
  { icon: CreditCard, title: "Bill Generation", desc: "Quick billing — POS, retail, hotel folios, gym packages, hospital IPD/OPD." },
  { icon: BookOpen, title: "Documentation", desc: "Centralized document vault — contracts, forms, audit trail." },
  { icon: Briefcase, title: "Vendor / Party Ledger", desc: "Party-wise outstanding, ageing reports, payment reminders." },
  { icon: Wallet, title: "Bank & Cash Book", desc: "Bank reconciliation, cash flow & daily closing automated." },
];

export function Modules() {
  return (
    <section id="modules" className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-widest text-accent">Powerful Modules</div>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Everything Your Business Needs</h2>
        <p className="mt-4 text-muted-foreground">Compliance, accounting, billing aur operations — har module deeply integrated.</p>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-elegant">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-gold opacity-0 blur-2xl transition-opacity group-hover:opacity-30" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-gold shadow-elegant">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-deep">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
