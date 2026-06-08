import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy-deep text-white/70">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/15">
              <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                <path d="M5 25V7l6 9 5-7 5 7 6-9v18" stroke="url(#fmxg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="fmxg" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="oklch(0.82 0.14 230)" />
                    <stop offset="100%" stopColor="oklch(0.6 0.18 252)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="font-display text-lg font-bold tracking-tight text-white">
              Manage<span className="text-gradient-gold">X</span>One
            </div>
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
            <li>+91 70007 38158</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:flex-row">
          <div>© {new Date().getFullYear()} ManageXOne. All rights reserved.</div>
          <Link
            to="/admin-login"
            className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}
