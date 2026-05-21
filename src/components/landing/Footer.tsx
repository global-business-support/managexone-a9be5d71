import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy-deep text-white/70">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>
            <div className="font-display text-lg font-bold text-white">ManageXOne</div>
          </div>
          <p className="mt-3 text-sm">Smart Business Management — Built in India.</p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Product</div>
          <ul className="space-y-2 text-sm">
            <li><a href="#modules" className="hover:text-white">Modules</a></li>
            <li><a href="#features" className="hover:text-white">Compliance</a></li>
            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Industries</div>
          <ul className="space-y-2 text-sm">
            <li>Hotels & Resorts</li>
            <li>Gyms & Fitness</li>
            <li>Hospitals</li>
            <li>Companies</li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Contact</div>
          <ul className="space-y-2 text-sm">
            <li>support@managexone.com</li>
            <li>+91 90000 00000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} ManageXOne. All rights reserved.
      </div>
    </footer>
  );
}
