import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, BookOpen, Plus, Trash2, FileSpreadsheet, TrendingUp, Building2, Landmark, ReceiptText, Scale, Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/accounting")({
  component: AccountingPage,
});

interface Account { id: string; code: string; name: string; type: string; opening_balance: number; }
interface Entry { id: string; entry_no: string; entry_date: string; narration: string | null; total_debit: number; total_credit: number; }
interface Line { id: string; entry_id: string; account_id: string; debit: number; credit: number; }
interface LineDraft { id: string; account_id: string; debit: number; credit: number; }

const sb = supabase as any;
const ACCT_TYPES = ["asset", "liability", "equity", "income", "expense"] as const;

function AccountingPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [openAcc, setOpenAcc] = useState(false);
  const [openEntry, setOpenEntry] = useState(false);
  const [acc, setAcc] = useState<Partial<Account>>({ type: "asset", opening_balance: 0 });
  const [entry, setEntry] = useState({ entry_no: `JE-${Date.now().toString().slice(-6)}`, entry_date: new Date().toISOString().slice(0, 10), narration: "" });
  const [draft, setDraft] = useState<LineDraft[]>([
    { id: crypto.randomUUID(), account_id: "", debit: 0, credit: 0 },
    { id: crypto.randomUUID(), account_id: "", debit: 0, credit: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [a, e, l] = await Promise.all([
      sb.from("chart_of_accounts").select("*").order("code"),
      sb.from("journal_entries").select("*").order("entry_date", { ascending: false }),
      sb.from("journal_lines").select("*"),
    ]);
    if (!a.error) setAccounts(a.data ?? []);
    if (!e.error) setEntries(e.data ?? []);
    if (!l.error) setLines(l.data ?? []);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  // Ledger balances
  const balances = useMemo(() => {
    const m = new Map<string, number>();
    accounts.forEach((a) => m.set(a.id, Number(a.opening_balance)));
    lines.forEach((ln) => {
      const acct = accounts.find((a) => a.id === ln.account_id);
      if (!acct) return;
      const cur = m.get(ln.account_id) ?? 0;
      // assets/expenses: debit increases; liability/equity/income: credit increases
      const signed = ["asset", "expense"].includes(acct.type)
        ? Number(ln.debit) - Number(ln.credit)
        : Number(ln.credit) - Number(ln.debit);
      m.set(ln.account_id, cur + signed);
    });
    return m;
  }, [accounts, lines]);

  const totals = useMemo(() => {
    let income = 0, expense = 0, asset = 0, liability = 0, equity = 0;
    accounts.forEach((a) => {
      const b = balances.get(a.id) ?? 0;
      if (a.type === "income") income += b;
      else if (a.type === "expense") expense += b;
      else if (a.type === "asset") asset += b;
      else if (a.type === "liability") liability += b;
      else if (a.type === "equity") equity += b;
    });
    return { income, expense, asset, liability, equity, profit: income - expense };
  }, [accounts, balances]);

  const health = useMemo(() => {
    const liquidity = accounts.filter((a) => /cash|bank/i.test(a.name)).reduce((sum, a) => sum + (balances.get(a.id) ?? 0), 0);
    const accountingEquationGap = totals.asset - (totals.liability + totals.equity + totals.profit);
    return { liquidity, accountingEquationGap };
  }, [accounts, balances, totals]);

  const seedSoftwareAccounts = () => {
    const suggestions = [
      { code: "1100", name: "Bank Account", type: "asset", opening_balance: 0 },
      { code: "1200", name: "Accounts Receivable - Software Buyers", type: "asset", opening_balance: 0 },
      { code: "2100", name: "GST Payable", type: "liability", opening_balance: 0 },
      { code: "4100", name: "Software Subscription Revenue", type: "income", opening_balance: 0 },
      { code: "5100", name: "Implementation & Support Expense", type: "expense", opening_balance: 0 },
    ];
    const next = suggestions.find((s) => !accounts.some((a) => a.code === s.code));
    if (!next) return toast.info("Software company ledger accounts already exist");
    setAcc(next as Partial<Account>);
    setOpenAcc(true);
  };

  const draftTotals = useMemo(() => {
    const d = draft.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const c = draft.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    return { d, c, balanced: d === c && d > 0 };
  }, [draft]);

  const saveAccount = async () => {
    if (!user) return;
    if (!acc.code || !acc.name) return toast.error("Code & name required");
    const { error } = await sb.from("chart_of_accounts").insert({
      owner_id: user.id, code: acc.code, name: acc.name, type: acc.type ?? "asset", opening_balance: acc.opening_balance ?? 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Account added");
    setOpenAcc(false); setAcc({ type: "asset", opening_balance: 0 });
    load();
  };

  const saveEntry = async () => {
    if (!user) return;
    if (!draftTotals.balanced) return toast.error("Debit must equal Credit");
    setSaving(true);
    const { data: je, error } = await sb.from("journal_entries").insert({
      owner_id: user.id, entry_no: entry.entry_no, entry_date: entry.entry_date,
      narration: entry.narration || null, total_debit: draftTotals.d, total_credit: draftTotals.c,
    }).select().single();
    if (error || !je) { setSaving(false); return toast.error(error?.message ?? "Failed"); }
    const linesPayload = draft.filter((l) => l.account_id && (l.debit || l.credit)).map((l) => ({
      entry_id: je.id, owner_id: user.id, account_id: l.account_id,
      debit: Number(l.debit) || 0, credit: Number(l.credit) || 0,
    }));
    const { error: lerr } = await sb.from("journal_lines").insert(linesPayload);
    setSaving(false);
    if (lerr) return toast.error(lerr.message);
    toast.success("Journal entry posted");
    setOpenEntry(false);
    setEntry({ entry_no: `JE-${Date.now().toString().slice(-6)}`, entry_date: new Date().toISOString().slice(0, 10), narration: "" });
    setDraft([{ id: crypto.randomUUID(), account_id: "", debit: 0, credit: 0 }, { id: crypto.randomUUID(), account_id: "", debit: 0, credit: 0 }]);
    load();
  };

  const removeAccount = async (id: string) => {
    if (!confirm("Delete account?")) return;
    const { error } = await sb.from("chart_of_accounts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <ModulePage
      title="Accounting"
      description="Double-entry bookkeeping — Chart of Accounts, Journal, Trial Balance, P&L, Balance Sheet."
      icon={<Calculator className="h-5 w-5" />}
      premium
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5"><div className="text-xs text-muted-foreground">Total Income</div><div className="mt-1 text-2xl font-bold text-emerald-600">₹{totals.income.toFixed(0)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground">Total Expense</div><div className="mt-1 text-2xl font-bold text-rose-600">₹{totals.expense.toFixed(0)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground">Net Profit</div><div className={`mt-1 text-2xl font-bold ${totals.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>₹{totals.profit.toFixed(0)}</div></Card>
        <Card className="p-5"><div className="text-xs text-muted-foreground">Journal Entries</div><div className="mt-1 text-2xl font-bold text-navy-deep">{entries.length}</div></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Landmark className="h-4 w-4" />Cash / Bank Liquidity</div><div className="mt-1 text-2xl font-bold text-navy-deep">₹{health.liquidity.toFixed(0)}</div></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Scale className="h-4 w-4" />Balance Check Gap</div><div className={`mt-1 text-2xl font-bold ${Math.abs(health.accountingEquationGap) < 1 ? "text-emerald-700" : "text-amber-700"}`}>₹{health.accountingEquationGap.toFixed(0)}</div></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="h-4 w-4" />Software Buyer Ledger</div><Button variant="outline" size="sm" className="mt-3" onClick={seedSoftwareAccounts}>Add suggested accounts</Button></Card>
      </div>

      <Tabs defaultValue="journal" className="mt-2">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="trial"><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />Trial Balance</TabsTrigger>
          <TabsTrigger value="pl"><TrendingUp className="mr-1.5 h-3.5 w-3.5" />P&amp;L / BS</TabsTrigger>
          <TabsTrigger value="reports"><ReceiptText className="mr-1.5 h-3.5 w-3.5" />Advanced Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="journal">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div><h3 className="font-display text-lg font-bold">Journal Entries</h3><p className="text-sm text-muted-foreground">Double-entry: every entry must have equal debit &amp; credit.</p></div>
              <Dialog open={openEntry} onOpenChange={setOpenEntry}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-hero text-white" disabled={accounts.length < 2}><Plus className="mr-2 h-4 w-4" />New Entry</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><Label>Entry #</Label><Input value={entry.entry_no} onChange={(e) => setEntry({ ...entry, entry_no: e.target.value })} /></div>
                    <div><Label>Date</Label><Input type="date" value={entry.entry_date} onChange={(e) => setEntry({ ...entry, entry_date: e.target.value })} /></div>
                    <div className="sm:col-span-3"><Label>Narration</Label><Textarea rows={2} value={entry.narration} onChange={(e) => setEntry({ ...entry, narration: e.target.value })} /></div>
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {draft.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <Select value={l.account_id} onValueChange={(v) => setDraft((arr) => arr.map((x) => x.id === l.id ? { ...x, account_id: v } : x))}>
                              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                              <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><Input type="number" value={l.debit} onChange={(e) => setDraft((arr) => arr.map((x) => x.id === l.id ? { ...x, debit: parseFloat(e.target.value) || 0, credit: 0 } : x))} className="text-right" /></TableCell>
                          <TableCell><Input type="number" value={l.credit} onChange={(e) => setDraft((arr) => arr.map((x) => x.id === l.id ? { ...x, credit: parseFloat(e.target.value) || 0, debit: 0 } : x))} className="text-right" /></TableCell>
                          <TableCell><Button size="icon" variant="ghost" onClick={() => setDraft((arr) => arr.length > 2 ? arr.filter((x) => x.id !== l.id) : arr)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" onClick={() => setDraft((arr) => [...arr, { id: crypto.randomUUID(), account_id: "", debit: 0, credit: 0 }])}><Plus className="mr-1 h-3.5 w-3.5" />Add Line</Button>
                    <div className="text-sm"><span className="mr-4">Debit: <b>₹{draftTotals.d.toFixed(2)}</b></span><span className="mr-4">Credit: <b>₹{draftTotals.c.toFixed(2)}</b></span><span className={draftTotals.balanced ? "text-emerald-600" : "text-rose-600"}>{draftTotals.balanced ? "✓ Balanced" : "✗ Not balanced"}</span></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenEntry(false)}>Cancel</Button>
                    <Button onClick={saveEntry} disabled={saving || !draftTotals.balanced} className="bg-gradient-hero text-white">{saving ? "Posting..." : "Post Entry"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-6 overflow-x-auto">
              {entries.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">{accounts.length < 2 ? "Create at least 2 accounts in Chart of Accounts first." : "No entries yet."}</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Entry #</TableHead><TableHead>Narration</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {entries.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.entry_date}</TableCell>
                        <TableCell className="font-mono text-xs">{e.entry_no}</TableCell>
                        <TableCell className="max-w-xs truncate">{e.narration ?? "—"}</TableCell>
                        <TableCell className="text-right">₹{Number(e.total_debit).toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{Number(e.total_credit).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div><h3 className="font-display text-lg font-bold"><BookOpen className="mr-2 inline h-4 w-4" />Chart of Accounts</h3><p className="text-sm text-muted-foreground">Set up your ledger accounts (asset / liability / equity / income / expense).</p></div>
              <Dialog open={openAcc} onOpenChange={setOpenAcc}>
                <DialogTrigger asChild><Button className="bg-navy-deep text-white"><Plus className="mr-2 h-4 w-4" />Add Account</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New Account</DialogTitle></DialogHeader>
                  <div className="grid gap-3">
                    <div><Label>Code *</Label><Input value={acc.code ?? ""} onChange={(e) => setAcc({ ...acc, code: e.target.value })} placeholder="1001" /></div>
                    <div><Label>Name *</Label><Input value={acc.name ?? ""} onChange={(e) => setAcc({ ...acc, name: e.target.value })} placeholder="Cash in Hand" /></div>
                    <div><Label>Type</Label>
                      <Select value={acc.type} onValueChange={(v) => setAcc({ ...acc, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ACCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Opening Balance</Label><Input type="number" value={acc.opening_balance ?? 0} onChange={(e) => setAcc({ ...acc, opening_balance: parseFloat(e.target.value) || 0 })} /></div>
                  </div>
                  <DialogFooter><Button variant="outline" onClick={() => setOpenAcc(false)}>Cancel</Button><Button onClick={saveAccount} className="bg-gradient-hero text-white">Save</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-6 overflow-x-auto">
              {accounts.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No accounts yet. Add Cash, Bank, Sales, Expenses etc.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Opening</TableHead><TableHead className="text-right">Balance</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {accounts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">{a.code}</TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell><span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{a.type}</span></TableCell>
                        <TableCell className="text-right">₹{Number(a.opening_balance).toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">₹{(balances.get(a.id) ?? 0).toFixed(2)}</TableCell>
                        <TableCell><Button size="icon" variant="ghost" onClick={() => removeAccount(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trial">
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold">Trial Balance</h3>
            <p className="text-sm text-muted-foreground">All ledger balances. Total Debit must equal Total Credit.</p>
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Account</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow></TableHeader>
                <TableBody>
                  {accounts.map((a) => {
                    const bal = balances.get(a.id) ?? 0;
                    const isDebitNature = ["asset", "expense"].includes(a.type);
                    const debit = isDebitNature ? (bal > 0 ? bal : 0) : (bal < 0 ? -bal : 0);
                    const credit = isDebitNature ? (bal < 0 ? -bal : 0) : (bal > 0 ? bal : 0);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">{a.code}</TableCell>
                        <TableCell>{a.name}</TableCell>
                        <TableCell className="text-xs capitalize text-muted-foreground">{a.type}</TableCell>
                        <TableCell className="text-right">{debit ? `₹${debit.toFixed(2)}` : "—"}</TableCell>
                        <TableCell className="text-right">{credit ? `₹${credit.toFixed(2)}` : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pl">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold">Profit &amp; Loss</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between border-b py-2"><span className="font-semibold text-emerald-700">Income</span><span className="font-bold">₹{totals.income.toFixed(2)}</span></div>
                {accounts.filter((a) => a.type === "income").map((a) => (
                  <div key={a.id} className="flex justify-between pl-4 text-muted-foreground"><span>{a.name}</span><span>₹{(balances.get(a.id) ?? 0).toFixed(2)}</span></div>
                ))}
                <div className="flex justify-between border-b py-2 pt-4"><span className="font-semibold text-rose-700">Expenses</span><span className="font-bold">₹{totals.expense.toFixed(2)}</span></div>
                {accounts.filter((a) => a.type === "expense").map((a) => (
                  <div key={a.id} className="flex justify-between pl-4 text-muted-foreground"><span>{a.name}</span><span>₹{(balances.get(a.id) ?? 0).toFixed(2)}</span></div>
                ))}
                <div className="mt-3 flex justify-between rounded-md bg-gradient-gold px-3 py-2 text-gold-foreground"><span className="font-bold">Net Profit</span><span className="font-bold">₹{totals.profit.toFixed(2)}</span></div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold">Balance Sheet</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between border-b py-2"><span className="font-semibold">Assets</span><span className="font-bold">₹{totals.asset.toFixed(2)}</span></div>
                {accounts.filter((a) => a.type === "asset").map((a) => (
                  <div key={a.id} className="flex justify-between pl-4 text-muted-foreground"><span>{a.name}</span><span>₹{(balances.get(a.id) ?? 0).toFixed(2)}</span></div>
                ))}
                <div className="flex justify-between border-b py-2 pt-4"><span className="font-semibold">Liabilities</span><span className="font-bold">₹{totals.liability.toFixed(2)}</span></div>
                {accounts.filter((a) => a.type === "liability").map((a) => (
                  <div key={a.id} className="flex justify-between pl-4 text-muted-foreground"><span>{a.name}</span><span>₹{(balances.get(a.id) ?? 0).toFixed(2)}</span></div>
                ))}
                <div className="flex justify-between border-b py-2 pt-4"><span className="font-semibold">Equity</span><span className="font-bold">₹{totals.equity.toFixed(2)}</span></div>
                {accounts.filter((a) => a.type === "equity").map((a) => (
                  <div key={a.id} className="flex justify-between pl-4 text-muted-foreground"><span>{a.name}</span><span>₹{(balances.get(a.id) ?? 0).toFixed(2)}</span></div>
                ))}
                <div className="mt-3 flex justify-between rounded-md bg-navy-deep px-3 py-2 text-white"><span className="font-bold">Liab + Equity + Profit</span><span className="font-bold">₹{(totals.liability + totals.equity + totals.profit).toFixed(2)}</span></div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">Software Company Accounting Setup</h3><Button variant="outline" size="sm" onClick={seedSoftwareAccounts}><Plus className="mr-1 h-3.5 w-3.5" />Setup</Button></div>
              <div className="mt-4 grid gap-3 text-sm">
                {["Buyer invoice posting", "GST payable tracking", "Subscription revenue ledger", "Implementation/support expense", "Bank receipt reconciliation"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-md border p-3"><span>{item}</span><span className="text-xs font-semibold text-emerald-700">Ready</span></div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">Management Snapshot</h3><Button variant="outline" size="sm"><Download className="mr-1 h-3.5 w-3.5" />Export</Button></div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2"><span>Revenue</span><b>₹{totals.income.toFixed(2)}</b></div>
                <div className="flex justify-between border-b pb-2"><span>Operating Cost</span><b>₹{totals.expense.toFixed(2)}</b></div>
                <div className="flex justify-between border-b pb-2"><span>Receivable / Assets</span><b>₹{totals.asset.toFixed(2)}</b></div>
                <div className="flex justify-between border-b pb-2"><span>Liabilities</span><b>₹{totals.liability.toFixed(2)}</b></div>
                <div className="rounded-md bg-gradient-gold px-3 py-2 text-gold-foreground"><div className="flex justify-between"><span>Net Position</span><b>₹{(totals.asset - totals.liability).toFixed(2)}</b></div></div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePage>
  );
}
