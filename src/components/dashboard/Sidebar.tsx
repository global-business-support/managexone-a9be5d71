import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Calculator, Receipt, FileText, ShieldCheck,
  Building2, BarChart3, FolderKanban, Settings, Sparkles, LogOut, UserCog,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: typeof Users; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/hris", label: "HRIS & Payroll", icon: Users },
  { to: "/dashboard/accounting", label: "Accounting", icon: Calculator },
  { to: "/dashboard/billing", label: "Billing & GST", icon: Receipt },
  { to: "/dashboard/compliance", label: "EPFO / ESIC / TDS", icon: ShieldCheck },
  { to: "/dashboard/crm", label: "Multi-Company CRM", icon: FolderKanban },
  { to: "/dashboard/industries", label: "Industries", icon: Building2 },
  { to: "/dashboard/reports", label: "P&L / Balance Sheet", icon: BarChart3 },
  { to: "/dashboard/documents", label: "Documents", icon: FileText },
];

export function Sidebar() {
  const loc = useLocation();
  const { profile, role, isAdmin, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
          <Sparkles className="h-5 w-5 text-gold-foreground" />
        </div>
        <div>
          <div className="font-display text-lg font-bold leading-none text-navy-deep">ManageXOne</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Smart Business</div>
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
                  ? "bg-gradient-hero text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </div>
            <Link
              to="/dashboard/admin"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                loc.pathname.startsWith("/dashboard/admin")
                  ? "bg-gradient-gold text-gold-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <UserCog className="h-4 w-4" /> User Approvals
            </Link>
            <Link
              to="/dashboard/admin/settings"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                loc.pathname === "/dashboard/admin/settings"
                  ? "bg-gradient-gold text-gold-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" /> System Settings
            </Link>
          </>
        )}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 rounded-md bg-muted px-3 py-2">
          <div className="truncate text-sm font-medium text-foreground">
            {profile?.full_name ?? profile?.email}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-semibold",
                role === "admin" && "bg-gradient-gold text-gold-foreground",
                role === "member" && "bg-primary text-primary-foreground",
                role === "trial" && "bg-muted-foreground/20 text-muted-foreground"
              )}
            >
              {role ?? "—"}
            </span>
            {profile?.approved && role !== "admin" && (
              <span className="text-emerald-600">✓ approved</span>
            )}
          </div>
        </div>
        <Button onClick={() => signOut()} variant="outline" size="sm" className="w-full">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
