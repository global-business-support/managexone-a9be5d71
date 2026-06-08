import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

function BrandLogo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-hero shadow-elegant ring-1 ring-white/10">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 30% 25%, oklch(0.7 0.16 235 / 0.6), transparent 60%)" }} />
        <svg viewBox="0 0 32 32" className="relative h-5 w-5" fill="none">
          <path d="M5 25V7l6 9 5-7 5 7 6-9v18" stroke="url(#mxg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="mxg" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="oklch(0.82 0.14 230)" />
              <stop offset="100%" stopColor="oklch(0.55 0.18 252)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-bold tracking-tight text-navy-deep">
          Manage<span className="text-gradient-gold">X</span>One
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Smart Business Suite</div>
      </div>
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <BrandLogo />

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground">Features</a>
          <a href="#modules" className="text-sm font-medium text-foreground/80 hover:text-foreground">Modules</a>
          <a href="#industries" className="text-sm font-medium text-foreground/80 hover:text-foreground">Industries</a>
          <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground">Pricing</a>
          <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-foreground">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90">
            <Link to="/signup">Start 1-Day Trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
