import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="contact" className="container mx-auto px-4 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center text-white shadow-elegant md:p-20">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, oklch(0.78 0.13 85 / 0.3), transparent 50%), radial-gradient(circle at 70% 80%, oklch(0.5 0.15 260 / 0.3), transparent 50%)" }} />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="font-display text-4xl font-bold md:text-6xl">
            Ready to Run Smarter?
          </h2>
          <p className="mt-5 text-lg text-white/75">
            14 din free trial — full features, koi credit card nahi. Aaj hi start karein aur dekho kaise ManageXOne aapka pura business chalata hai.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90">
              <Link to="/signup">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
              <Link to="/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
