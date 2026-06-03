import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

interface PaymentRow {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  plan: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string | null;
  upi_ref: string | null;
  payment_method: string | null;
  screenshot_url: string | null;
  gstin: string | null;
  created_at: string;
}

function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    setBusy(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as PaymentRow[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const mark = async (p: PaymentRow, status: "paid" | "failed" | "refunded") => {
    const { error } = await supabase.from("payments").update({ status }).eq("id", p.id);
    if (error) return toast.error(error.message);
    if (status === "paid") {
      await supabase.from("profiles").update({ payment_status: "paid", approved: true, active: true }).eq("user_id", p.user_id);
      // Promote trial to member
      await supabase.from("user_roles").delete().eq("user_id", p.user_id).eq("role", "trial");
      await supabase.from("user_roles").insert({ user_id: p.user_id, role: "member" });
    }
    toast.success(`Payment marked ${status}`);
    load();
  };

  const viewScreenshot = async (path: string) => {
    const { data, error } = await supabase.storage.from("payment-screenshots").createSignedUrl(path, 300);
    if (error || !data) return toast.error("Could not load screenshot");
    window.open(data.signedUrl, "_blank");
  };

  const totalRevenue = rows.filter((r) => r.status === "paid").reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-gold p-2.5 text-gold-foreground">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-deep">Payments</h1>
            <p className="text-sm text-muted-foreground">All transactions · Verify and unlock access.</p>
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={busy}>
          <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><div className="text-xs uppercase text-muted-foreground">Total Transactions</div><div className="mt-1 font-display text-2xl font-bold text-navy-deep">{rows.length}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase text-muted-foreground">Successful</div><div className="mt-1 font-display text-2xl font-bold text-emerald-700">{rows.filter((r) => r.status === "paid").length}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase text-muted-foreground">Revenue</div><div className="mt-1 font-display text-2xl font-bold text-emerald-700">₹ {totalRevenue.toLocaleString("en-IN")}</div></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">UPI Ref / Txn ID</th>
                <th className="px-4 py-3">Proof</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                    {p.phone && <div className="text-xs text-muted-foreground">{p.phone}</div>}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <div className="font-medium">{p.plan}</div>
                    <div className="text-xs text-muted-foreground">{p.billing_cycle}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">₹ {Number(p.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-xs capitalize">
                    <span className="rounded-md bg-muted px-2 py-1 font-medium">{p.payment_method ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.upi_ref ?? p.transaction_id ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.screenshot_url ? (
                      <Button size="sm" variant="outline" onClick={() => viewScreenshot(p.screenshot_url!)}>
                        View
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      p.status === "paid" ? "bg-emerald-100 text-emerald-800"
                      : p.status === "failed" ? "bg-rose-100 text-rose-800"
                      : p.status === "refunded" ? "bg-slate-200 text-slate-700"
                      : "bg-amber-100 text-amber-800"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status !== "paid" && (
                        <Button size="sm" onClick={() => mark(p, "paid")} className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve & Unlock
                        </Button>
                      )}
                      {p.status !== "failed" && (
                        <Button size="sm" variant="outline" onClick={() => mark(p, "failed")}>
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
