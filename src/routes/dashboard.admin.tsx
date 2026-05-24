import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserCog, CheckCircle2, XCircle, ShieldCheck, RefreshCw, Clock, Mail, Phone, Building2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminPage,
});

interface UserRow {
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  approved: boolean;
  trial_expires_at: string;
  created_at: string;
  role: "admin" | "member" | "trial" | null;
}

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setBusy(false);
    if (pe || re) return toast.error(pe?.message ?? re?.message ?? "Failed to load");
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

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const approve = async (u: UserRow) => {
    const { error: e1 } = await supabase.from("profiles").update({ approved: true }).eq("user_id", u.user_id);
    if (e1) return toast.error(e1.message);
    if (u.role === "trial") {
      await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", "trial");
      await supabase.from("user_roles").insert({ user_id: u.user_id, role: "member" });
    }
    toast.success(`${u.email} approved`);
    load();
  };

  const revoke = async (u: UserRow) => {
    const { error } = await supabase.from("profiles").update({ approved: false }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    toast.success(`${u.email} revoked`);
    load();
  };

  const makeAdmin = async (u: UserRow) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: u.user_id, role: "admin" });
    if (error) return toast.error(error.message);
    await supabase.from("profiles").update({ approved: true }).eq("user_id", u.user_id);
    toast.success(`${u.email} is now admin`);
    load();
  };

  if (loading || !isAdmin) return null;

  const pending = users.filter((u) => !u.approved);
  const all = users;

  const renderTable = (rows: UserRow[], emptyMsg: string) => (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((u) => (
              <tr key={u.user_id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{u.full_name ?? "—"}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {u.email}
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {u.phone}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {u.company_name ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                    {u.role ?? "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {u.approved ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                      <Clock className="h-3.5 w-3.5" /> Awaiting Approval
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {!u.approved ? (
                      <>
                        <Button size="sm" onClick={() => approve(u)} className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => revoke(u)}>
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => revoke(u)}>Revoke</Button>
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyMsg}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-gold p-2.5 text-gold-foreground">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-deep">User Approvals</h1>
            <p className="text-sm text-muted-foreground">Review pending requests and manage access.</p>
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={busy}>
          <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Pending Requests</div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-700">{pending.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Approved Members</div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700">{users.filter((u) => u.approved).length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Signups</div>
          <div className="mt-1 font-display text-2xl font-bold text-navy-deep">{users.length}</div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Requests
            {pending.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white hover:bg-amber-500">{pending.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {renderTable(pending, "No pending requests. All caught up!")}
        </TabsContent>
        <TabsContent value="all">
          {renderTable(all, "No users yet.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
