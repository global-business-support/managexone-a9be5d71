import { Building, Dumbbell, Hotel, Stethoscope, Factory, Store } from "lucide-react";

const industries = [
  { icon: Hotel, name: "Hotels & Resorts", points: ["Room billing & folios", "Banquet & F&B", "Guest CRM"] },
  { icon: Dumbbell, name: "Gyms & Fitness", points: ["Member packages", "Trainer payroll", "Auto-renewals"] },
  { icon: Stethoscope, name: "Hospitals & Clinics", points: ["IPD / OPD billing", "Pharmacy stock", "Doctor payouts"] },
  { icon: Building, name: "Companies / Corporates", points: ["Multi-branch HRIS", "Statutory compliance", "Board-ready reports"] },
  { icon: Factory, name: "Manufacturing & Trading", points: ["Inventory & GST", "Vendor ledger", "Production costing"] },
  { icon: Store, name: "Retail & Service", points: ["POS billing", "Loyalty CRM", "Daily cashbook"] },
];

export function Industries() {
  return (
    <section id="industries" className="relative bg-navy-deep py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-widest text-gold">Built For Every Industry</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">One Platform. Every Business.</h2>
          <p className="mt-4 text-white/70">Hotels, gyms, hospitals, factories, retail — sab ke liye industry-specific workflows.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map(({ icon: Icon, name, points }) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:border-gold/40">
              <Icon className="mb-4 h-8 w-8 text-gold" />
              <h3 className="font-display text-xl font-semibold">{name}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                {points.map((p) => <li key={p}>• {p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
