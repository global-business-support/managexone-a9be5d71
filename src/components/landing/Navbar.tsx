import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero shadow-elegant">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-navy-deep">ManageXOne</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Smart Business Management</div>
          </div>
        </Link>
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
            <Link to="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
