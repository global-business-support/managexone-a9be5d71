import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, LayoutDashboard, Users, Clock, CreditCard, LogOut, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/pending", label: "Pending Approvals", icon: Clock },
  { to: "/admin/users", label: "All Users", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
];

export function AdminSidebar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-navy-deep/40 bg-navy-deep text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
          <ShieldCheck className="h-5 w-5 text-gold-foreground" />
        </div>
        <div>
          <div className="font-display text-lg font-bold leading-none text-gold">Admin Console</div>
          <div className="text-[10px] uppercase tracking-wider text-white/60">ManageXOne</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-gradient-gold text-gold-foreground shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}

        <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Switch
        </div>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeftRight className="h-4 w-4" /> User Dashboard
        </button>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 rounded-md bg-white/5 px-3 py-2">
          <div className="truncate text-sm font-medium text-white">{profile?.full_name ?? "Administrator"}</div>
          <div className="truncate text-xs text-white/60">{profile?.email}</div>
        </div>
        <Button onClick={() => signOut()} variant="outline" size="sm" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
