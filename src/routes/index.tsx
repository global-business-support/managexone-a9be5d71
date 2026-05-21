import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Modules } from "@/components/landing/Modules";
import { Compliance } from "@/components/landing/Compliance";
import { Industries } from "@/components/landing/Industries";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ManageXOne — Smart Business Management Software" },
      { name: "description", content: "All-in-one HRIS, Accounting, GST Billing, EPFO, ESIC, TDS & multi-company CRM for Hotels, Gyms, Hospitals & businesses. 14-day free trial." },
      { property: "og:title", content: "ManageXOne — Smart Business Management" },
      { property: "og:description", content: "Run your entire business — HRIS, Accounting, Billing, Compliance — from one smart dashboard." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Modules />
        <Compliance />
        <Industries />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
