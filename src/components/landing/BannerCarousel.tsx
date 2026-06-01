import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, Receipt, Users, ChevronLeft, ChevronRight } from "lucide-react";
import bannerAccounting from "@/assets/banner-accounting.jpg";
import bannerBilling from "@/assets/banner-billing.jpg";
import bannerHris from "@/assets/banner-hris.jpg";

const SLIDES = [
  {
    img: bannerAccounting,
    icon: Calculator,
    eyebrow: "Smarter than Tally",
    title: "Advanced Accounting",
    subtitle: "Double-entry ledgers, journals, trial balance, P&L & Balance Sheet — all auto-calculated.",
    bullets: ["Chart of Accounts", "Journal Entries", "Trial Balance", "P&L + Balance Sheet"],
    cta: "/dashboard/accounting",
    overlay: "from-navy-deep/95 via-navy-deep/60 to-transparent",
    textSide: "right" as const,
  },
  {
    img: bannerBilling,
    icon: Receipt,
    eyebrow: "GST-compliant billing",
    title: "Advanced GST Invoicing",
    subtitle: "CGST / SGST / IGST auto-split, party master, HSN/SAC, e-invoice ready PDFs.",
    bullets: ["Multi-item invoices", "CGST/SGST/IGST", "HSN/SAC codes", "Saved & printable"],
    cta: "/dashboard/billing",
    overlay: "from-gold/90 via-gold/40 to-transparent",
    textSide: "left" as const,
  },
  {
    img: bannerHris,
    icon: Users,
    eyebrow: "Complete HRIS suite",
    title: "HRIS & Payroll",
    subtitle: "Employees, attendance, salary structures, EPFO / ESIC / TDS — monthly payroll in one click.",
    bullets: ["Employee Master", "Attendance Tracking", "Salary Structure", "1-Click Payroll"],
    cta: "/dashboard/hris",
    overlay: "from-navy-deep/95 via-navy-deep/55 to-transparent",
    textSide: "right" as const,
  },
];

export function BannerCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);
  const next = () => setI((p) => (p + 1) % SLIDES.length);
  const prev = () => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative bg-navy-deep">
      <div className="relative h-[460px] w-full overflow-hidden md:h-[560px]">
        {SLIDES.map((s, idx) => {
          const Icon = s.icon;
          const active = idx === i;
          const isRight = s.textSide === "right";
          return (
            <div
              key={s.title}
              className={`absolute inset-0 transition-opacity duration-700 ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <img
                src={s.img}
                alt={s.title}
                width={1920}
                height={800}
                loading={idx === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-${isRight ? "l" : "r"} ${s.overlay}`}
              />
              <div className="container relative mx-auto flex h-full items-center px-4">
                <div
                  className={`max-w-xl text-white ${isRight ? "ml-auto text-right" : ""}`}
                >
                  <div
                    className={`mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold backdrop-blur ${isRight ? "flex-row-reverse" : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {s.eyebrow}
                  </div>
                  <h2 className="font-display text-4xl font-bold leading-[1.05] md:text-5xl lg:text-6xl">
                    {s.title}
                  </h2>
                  <p className="mt-4 text-base text-white/85 md:text-lg">{s.subtitle}</p>
                  <ul
                    className={`mt-5 flex flex-wrap gap-2 text-xs ${isRight ? "justify-end" : ""}`}
                  >
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="rounded-full border border-white/25 bg-white/10 px-3 py-1 backdrop-blur"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className={`mt-7 flex gap-3 ${isRight ? "justify-end" : ""}`}>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90"
                    >
                      <Link to={s.cta}>
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* arrows */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={next}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* dots */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-gold" : "w-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
