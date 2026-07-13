import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Users, CheckCircle2, XCircle, ShieldCheck, RefreshCw, Mail, Phone, Building2, Search, Clock, Power } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AllUsersPage,
});

interface UserRow {
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  approved: boolean;
  active: boolean;
  payment_status: string;
  trial_expires_at: string;
  created_at: string;
  referred_by: string | null;
  role: "admin" | "member" | "trial" | null;
}

function AllUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data: profiles, error: pe }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setBusy(false);
    if (pe) return toast.error(pe.message);
    const roleMap = new Map<string, UserRow["role"]>();
    (roles ?? []).forEach((r: { user_id: string; role: UserRow["role"] }) => {
      const prev = roleMap.get(r.user_id);
      const rank = { admin: 3, member: 2, trial: 1 } as const;
      if (!prev || rank[r.role as keyof typeof rank] > rank[prev as keyof typeof rank]) {
        roleMap.set(r.user_id, r.role);
      }
    });
    setUsers((profiles ?? []).map((p: Omit<UserRow, "role">) => ({ ...p, role: roleMap.get(p.user_id) ?? null })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (u: UserRow) => {
    const { error } = await supabase.from("profiles").update({ approved: true }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    if (u.role === "trial") {
      await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", "trial");
      await supabase.from("user_roles").insert({ user_id: u.user_id, role: "member" });
    }
    toast.success(`${u.email} approved — full access granted`);
    load();
  };

  const decline = async (u: UserRow) => {
    const { error } = await supabase.from("profiles").update({ approved: false }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    toast.success(`${u.email} access declined`);
    load();
  };

  const makeAdmin = async (u: UserRow) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: u.user_id, role: "admin" });
    if (error) return toast.error(error.message);
    await supabase.from("profiles").update({ approved: true }).eq("user_id", u.user_id);
    toast.success(`${u.email} promoted to admin`);
    load();
  };

  const toggleActive = async (u: UserRow, next: boolean) => {
    const { error } = await supabase.from("profiles").update({ active: next }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    toast.success(next ? `${u.email} activated` : `${u.email} deactivated — dashboard access blocked`);
    load();
  };

  const filtered = users
    .filter((u) => filter === "all" || (filter === "approved" ? u.approved : !u.approved))
    .filter((u) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return (u.email + (u.full_name ?? "") + (u.company_name ?? "") + (u.phone ?? "")).toLowerCase().includes(s);
    });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-gold p-2.5 text-gold-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-deep">All Users</h1>
            <p className="text-sm text-muted-foreground">Complete registry — accept, decline or promote.</p>
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={busy}>
          <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, name, company, phone…" className="pl-9" />
        </div>
        <div className="flex gap-1 rounded-md border bg-card p-1">
          {(["all", "pending", "approved"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded px-3 py-1.5 text-xs font-medium capitalize ${filter === k ? "bg-navy-deep text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <tr key={u.user_id} className={`hover:bg-muted/30 ${!u.active ? "bg-rose-50/40" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{u.full_name ?? "—"}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {u.email}</div>
                    {u.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {u.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {u.company_name ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role ?? "—"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.referred_by ? <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-800">{u.referred_by}</span> : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span className={u.payment_status === "paid" ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
                      {u.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.approved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Approved</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800"><Clock className="h-3.5 w-3.5" /> Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={u.active} onCheckedChange={(v) => toggleActive(u, v)} disabled={u.role === "admin"} />
                      <span className={`text-xs font-medium ${u.active ? "text-emerald-700" : "text-rose-700"}`}>
                        {u.active ? "Active" : "Suspended"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {!u.approved ? (
                        <>
                          <Button size="sm" onClick={() => approve(u)} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => decline(u)}>
                            <XCircle className="mr-1 h-3.5 w-3.5" /> Decline
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => decline(u)}>Revoke</Button>
                      )}
                      {u.role !== "admin" && u.active && (
                        <Button size="sm" variant="outline" onClick={() => toggleActive(u, false)} className="border-rose-300 text-rose-700 hover:bg-rose-50">
                          <Power className="mr-1 h-3.5 w-3.5" /> Deactivate
                        </Button>
                      )}
                      {u.role !== "admin" && !u.active && (
                        <Button size="sm" variant="outline" onClick={() => toggleActive(u, true)} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                          <Power className="mr-1 h-3.5 w-3.5" /> Activate
                        </Button>
                      )}
                      {u.role !== "admin" && (
                        <Button size="sm" variant="outline" onClick={() => makeAdmin(u)}>
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Make Admin
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No users match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
