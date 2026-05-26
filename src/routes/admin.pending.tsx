import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, CheckCircle2, XCircle, Mail, Phone, Building2, RefreshCw, AlertCircle, CreditCard } from "lucide-react";

export const Route = createFileRoute("/admin/pending")({
  component: PendingApprovalsPage,
});

interface PendingRow {
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  payment_status: string;
  created_at: string;
  role: "admin" | "member" | "trial" | null;
  latestPayment?: { plan: string; amount: number; billing_cycle: string; status: string; transaction_id: string | null } | null;
}

function PendingApprovalsPage() {
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data: profiles }, { data: roles }, { data: payments }] = await Promise.all([
      supabase.from("profiles").select("*").eq("approved", false).order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("payments").select("user_id,plan,amount,billing_cycle,status,transaction_id,created_at").order("created_at", { ascending: false }),
    ]);
    setBusy(false);
    const roleMap = new Map<string, PendingRow["role"]>();
    (roles ?? []).forEach((r: { user_id: string; role: PendingRow["role"] }) => {
      if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, r.role);
    });
    const payMap = new Map<string, PendingRow["latestPayment"]>();
    (payments ?? []).forEach((p) => {
      if (!payMap.has(p.user_id)) payMap.set(p.user_id, p);
    });
    setRows((profiles ?? []).map((p) => ({ ...p, role: roleMap.get(p.user_id) ?? null, latestPayment: payMap.get(p.user_id) ?? null })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const accept = async (u: PendingRow) => {
    const { error } = await supabase.from("profiles").update({ approved: true }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    if (u.role === "trial") {
      await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", "trial");
      await supabase.from("user_roles").insert({ user_id: u.user_id, role: "member" });
    }
    toast.success(`✓ ${u.email} now has full access`);
    load();
  };

  const decline = async (u: PendingRow) => {
    const { error } = await supabase.from("profiles").update({ approved: false, payment_status: "declined" }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    toast.success(`${u.email} declined`);
    load();
  };

  const paidPending = rows.filter((r) => r.payment_status === "paid");
  const trialPending = rows.filter((r) => r.payment_status !== "paid");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-gold p-2.5 text-gold-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-deep">Pending Approvals</h1>
            <p className="text-sm text-muted-foreground">Even paid users need admin approval to unlock full access.</p>
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={busy}>
          <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-rose-700" />
          <h2 className="font-display text-lg font-bold text-navy-deep">Paid · Awaiting Admin Approval</h2>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">{paidPending.length}</span>
        </div>
        {paidPending.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">No paid customers waiting.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {paidPending.map((u) => <ApprovalCard key={u.user_id} u={u} onAccept={accept} onDecline={decline} priority />)}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-700" />
          <h2 className="font-display text-lg font-bold text-navy-deep">Trial / Unpaid Requests</h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{trialPending.length}</span>
        </div>
        {trialPending.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">No trial requests pending.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {trialPending.map((u) => <ApprovalCard key={u.user_id} u={u} onAccept={accept} onDecline={decline} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function ApprovalCard({ u, onAccept, onDecline, priority }: { u: PendingRow; onAccept: (u: PendingRow) => void; onDecline: (u: PendingRow) => void; priority?: boolean }) {
  return (
    <Card className={`p-5 ${priority ? "border-rose-300 bg-rose-50/40" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-bold text-navy-deep">{u.full_name ?? "Unnamed user"}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {u.email}</div>
          {u.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {u.phone}</div>}
          {u.company_name && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="h-3 w-3" /> {u.company_name}</div>}
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {u.role ?? "—"}
        </span>
      </div>

      {u.latestPayment && (
        <div className="mt-4 rounded-lg border bg-card p-3 text-xs">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold capitalize text-navy-deep">{u.latestPayment.plan} · {u.latestPayment.billing_cycle}</span>
            <span className="font-bold text-emerald-700">₹ {Number(u.latestPayment.amount).toLocaleString("en-IN")}</span>
          </div>
          <div className="text-muted-foreground">Status: <span className="capitalize">{u.latestPayment.status}</span></div>
          {u.latestPayment.transaction_id && <div className="text-muted-foreground">Txn: {u.latestPayment.transaction_id}</div>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Requested {new Date(u.created_at).toLocaleString()}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={() => onAccept(u)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="mr-1 h-4 w-4" /> Accept &amp; Grant Access
        </Button>
        <Button onClick={() => onDecline(u)} variant="outline" className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50">
          <XCircle className="mr-1 h-4 w-4" /> Decline
        </Button>
      </div>
    </Card>
  );
}
