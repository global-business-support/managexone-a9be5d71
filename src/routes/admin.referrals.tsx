import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Share2, Plus, Copy, RefreshCw, Link as LinkIcon, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/referrals")({
  component: ReferralsPage,
});

interface RefCode {
  id: string;
  code: string;
  employee_name: string;
  notes: string | null;
  active: boolean;
  created_at: string;
}

interface ReferredUser {
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  referred_by: string | null;
  created_at: string;
}

function ReferralsPage() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<RefCode[]>([]);
  const [users, setUsers] = useState<ReferredUser[]>([]);
  const [employeeName, setEmployeeName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data: cs }, { data: us }] = await Promise.all([
      supabase.from("referral_codes").select("*").order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("user_id,email,full_name,company_name,referred_by,created_at")
        .not("referred_by", "is", null)
        .order("created_at", { ascending: false }),
    ]);
    setCodes((cs as RefCode[]) ?? []);
    setUsers((us as ReferredUser[]) ?? []);
    setBusy(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createCode = async () => {
    if (!employeeName.trim()) return toast.error("Employee name required");
    const code =
      (customCode || employeeName.replace(/\s+/g, "").toUpperCase().slice(0, 6) + Math.random().toString(36).slice(-4).toUpperCase());
    const { error } = await supabase.from("referral_codes").insert({
      code: code.toUpperCase(),
      employee_name: employeeName.trim(),
      notes: notes || null,
      created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success(`Code ${code} created`);
    setEmployeeName("");
    setCustomCode("");
    setNotes("");
    load();
  };

  const toggleActive = async (r: RefCode, next: boolean) => {
    const { error } = await supabase.from("referral_codes").update({ active: next }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const linkFor = (code: string) => `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${code}`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const usageCount = (code: string) => users.filter((u) => (u.referred_by ?? "").toUpperCase() === code.toUpperCase()).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-gold p-2.5 text-gold-foreground">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-deep">Employee Referrals</h1>
            <p className="text-sm text-muted-foreground">Create unique tracking links per employee — see who brought which customer.</p>
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={busy}>
          <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      <Card className="p-5">
        <h3 className="mb-3 font-display text-lg font-bold text-navy-deep">Create Referral Link</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Employee Name *</Label>
            <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Rahul Sharma" />
          </div>
          <div className="space-y-1.5">
            <Label>Custom Code (optional)</Label>
            <Input value={customCode} onChange={(e) => setCustomCode(e.target.value.toUpperCase())} placeholder="RAHUL01" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Region / campaign / anything" />
          </div>
        </div>
        <Button onClick={createCode} className="mt-4 bg-gradient-hero text-white">
          <Plus className="mr-1 h-4 w-4" /> Generate Link
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b px-5 py-3 font-display font-bold text-navy-deep">All Codes</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Signups</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Share Link</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {codes.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{r.code}</td>
                  <td className="px-4 py-3">{r.employee_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={usageCount(r.code) > 0 ? "default" : "secondary"}>{usageCount(r.code)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={r.active} onCheckedChange={(v) => toggleActive(r, v)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <code className="max-w-[240px] truncate rounded bg-muted px-2 py-1 text-xs">{linkFor(r.code)}</code>
                      <Button size="icon" variant="ghost" onClick={() => copy(linkFor(r.code))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No referral codes yet. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2 font-display font-bold text-navy-deep">
            <Users className="h-4 w-4" /> Referred Customers ({users.length})
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Ref Code</th>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const owner = codes.find((c) => c.code.toUpperCase() === (u.referred_by ?? "").toUpperCase());
                return (
                  <tr key={u.user_id}>
                    <td className="px-4 py-2">
                      <div className="font-medium">{u.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{u.company_name ?? "—"}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      <LinkIcon className="mr-1 inline h-3 w-3" />
                      {u.referred_by}
                    </td>
                    <td className="px-4 py-2">{owner?.employee_name ?? <span className="text-muted-foreground">(deleted)</span>}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No referred customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
