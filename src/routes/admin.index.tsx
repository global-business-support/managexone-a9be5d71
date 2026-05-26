import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, CreditCard, TrendingUp, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

interface Stats {
  total: number;
  approved: number;
  pending: number;
  paidPending: number;
  payments: number;
  revenue: number;
}

function AdminOverview() {
  const [s, setS] = useState<Stats>({ total: 0, approved: 0, pending: 0, paidPending: 0, payments: 0, revenue: 0 });
  const [recent, setRecent] = useState<Array<{ user_id: string; email: string; full_name: string | null; company_name: string | null; approved: boolean; payment_status: string; created_at: string }>>([]);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: pays }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("payments").select("amount,status"),
      ]);
      const list = profiles ?? [];
      const paid = (pays ?? []).filter((p: { status: string }) => p.status === "paid");
      setS({
        total: list.length,
        approved: list.filter((p) => p.approved).length,
        pending: list.filter((p) => !p.approved).length,
        paidPending: list.filter((p) => !p.approved && p.payment_status === "paid").length,
        payments: paid.length,
        revenue: paid.reduce((a: number, b: { amount: number }) => a + Number(b.amount ?? 0), 0),
      });
      setRecent(list.slice(0, 6));
    })();
  }, []);

  const inr = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 border-b pb-5">
        <div className="rounded-lg bg-gradient-gold p-2.5 text-gold-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-deep">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">Full system control — approvals, payments &amp; users.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Customers" value={s.total} color="text-navy-deep" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Approved Members" value={s.approved} color="text-emerald-700" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Approval" value={s.pending} color="text-amber-700" />
        <StatCard icon={<CreditCard className="h-5 w-5" />} label="Paid · Awaiting Admin" value={s.paidPending} color="text-rose-700" highlight />
        <StatCard icon={<CreditCard className="h-5 w-5" />} label="Successful Payments" value={s.payments} color="text-navy-deep" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Total Revenue" value={inr(s.revenue)} color="text-emerald-700" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/admin/pending" className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
          <Clock className="h-6 w-6 text-amber-600" />
          <div className="mt-3 font-display text-lg font-bold text-navy-deep">Review Pending</div>
          <p className="text-sm text-muted-foreground">Approve or decline access requests.</p>
        </Link>
        <Link to="/admin/users" className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
          <Users className="h-6 w-6 text-navy-deep" />
          <div className="mt-3 font-display text-lg font-bold text-navy-deep">All Users</div>
          <p className="text-sm text-muted-foreground">Manage every registered account.</p>
        </Link>
        <Link to="/admin/payments" className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
          <CreditCard className="h-6 w-6 text-emerald-700" />
          <div className="mt-3 font-display text-lg font-bold text-navy-deep">Payments</div>
          <p className="text-sm text-muted-foreground">Verify transactions and unlock access.</p>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="font-display font-bold text-navy-deep">Recent Signups</h3>
          <Link to="/admin/users" className="text-xs font-semibold text-navy-deep hover:underline">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Company</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recent.map((u) => (
              <tr key={u.user_id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{u.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.company_name ?? "—"}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={u.payment_status === "paid" ? "text-emerald-700" : "text-muted-foreground"}>
                    {u.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.approved ? <span className="text-emerald-700">Approved</span> : <span className="text-amber-700">Pending</span>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No signups yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, color, highlight }: { icon: React.ReactNode; label: string; value: string | number; color: string; highlight?: boolean }) {
  return (
    <Card className={`p-4 ${highlight ? "border-rose-300 bg-rose-50/50" : ""}`}>
      <div className={`flex items-center gap-2 ${color}`}>{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
      <div className={`mt-2 font-display text-3xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}
