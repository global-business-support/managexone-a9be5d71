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
import { Receipt, FileText, Plus, Printer, Users, Trash2, Save, Building2, CreditCard, IndianRupee, BellRing, Truck, ShieldCheck, MessageCircle, Mail, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

interface Party {
  id: string; owner_id: string; name: string; type: string;
  gstin: string | null; pan: string | null; email: string | null; phone: string | null;
  billing_address: string | null; state: string | null; state_code: string | null; place_of_supply: string | null;
}
interface LineItem { id: string; description: string; hsn_sac: string; qty: number; rate: number; }
interface SavedInvoice {
  id: string; invoice_no: string; invoice_date: string; subtotal: number;
  cgst: number; sgst: number; igst: number; total: number; status: string; party_snapshot: any;
}

const sb = supabase as any;
const DEFAULT_STATE_CODE = "27"; // Fallback seller state code

interface SellerProfile {
  seller_name: string | null;
  seller_gstin: string | null;
  seller_pan: string | null;
  seller_address: string | null;
  seller_state: string | null;
  seller_state_code: string | null;
  seller_phone: string | null;
  seller_email: string | null;
}

const billingPlans = [
  { name: "Starter", users: "5 users", price: 4999, cycle: "Monthly", module: "Core Billing" },
  { name: "Growth", users: "25 users", price: 14999, cycle: "Monthly", module: "Billing + CRM" },
  { name: "Enterprise", users: "Unlimited", price: 49999, cycle: "Annual", module: "Full Suite" },
];

const quickServices = [
  { description: "ManageXOne Software Subscription", hsn_sac: "998314", qty: 1, rate: 14999 },
  { description: "Implementation & Onboarding", hsn_sac: "998313", qty: 1, rate: 25000 },
  { description: "Priority Support Retainer", hsn_sac: "998599", qty: 1, rate: 7500 },
];

function BillingPage() {
  const { user } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [gst, setGst] = useState("18");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", hsn_sac: "", qty: 1, rate: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState<Partial<Party>>({ type: "customer" });
  const [saving, setSaving] = useState(false);
  const [seller, setSeller] = useState<SellerProfile>({
    seller_name: null, seller_gstin: null, seller_pan: null, seller_address: null,
    seller_state: null, seller_state_code: null, seller_phone: null, seller_email: null,
  });
  const [openSeller, setOpenSeller] = useState(false);
  const [savingSeller, setSavingSeller] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [p, inv, prof] = await Promise.all([
      sb.from("parties").select("*").order("created_at", { ascending: false }),
      sb.from("invoices").select("*").order("invoice_date", { ascending: false }),
      sb.from("profiles").select("seller_name,seller_gstin,seller_pan,seller_address,seller_state,seller_state_code,seller_phone,seller_email,company_name,email,phone").eq("user_id", user.id).maybeSingle(),
    ]);
    if (p.error) toast.error(p.error.message); else setParties(p.data ?? []);
    if (!inv.error) setSavedInvoices(inv.data ?? []);
    if (prof.data) {
      const d = prof.data as any;
      setSeller({
        seller_name: d.seller_name ?? d.company_name ?? "ManageXOne",
        seller_gstin: d.seller_gstin,
        seller_pan: d.seller_pan,
        seller_address: d.seller_address,
        seller_state: d.seller_state,
        seller_state_code: d.seller_state_code,
        seller_phone: d.seller_phone ?? d.phone,
        seller_email: d.seller_email ?? d.email,
      });
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveSeller = async () => {
    if (!user) return;
    setSavingSeller(true);
    const { error } = await sb.from("profiles").update(seller).eq("user_id", user.id);
    setSavingSeller(false);
    if (error) return toast.error(error.message);
    toast.success("Company profile saved");
    setOpenSeller(false);
  };

  const selectedParty = useMemo(() => parties.find((p) => p.id === selectedPartyId) ?? null, [parties, selectedPartyId]);

  const sellerStateCode = seller.seller_state_code || DEFAULT_STATE_CODE;
  const isInterstate = useMemo(() => {
    if (!selectedParty?.state_code) return false;
    return selectedParty.state_code !== sellerStateCode;
  }, [selectedParty, sellerStateCode]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const gstPct = parseFloat(gst) || 0;
  const taxAmt = (subtotal * gstPct) / 100;
  const cgst = isInterstate ? 0 : taxAmt / 2;
  const sgst = isInterstate ? 0 : taxAmt / 2;
  const igst = isInterstate ? taxAmt : 0;
  const total = subtotal + taxAmt;
  const outstanding = savedInvoices.filter((inv) => inv.status !== "paid" && inv.status !== "cancelled").reduce((sum, inv) => sum + Number(inv.total), 0);
  const paidTotal = savedInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + Number(inv.total), 0);

  const updateItem = (id: string, patch: Partial<LineItem>) => setItems((arr) => arr.map((i) => i.id === id ? { ...i, ...patch } : i));
  const addItem = () => setItems((arr) => [...arr, { id: crypto.randomUUID(), description: "", hsn_sac: "", qty: 1, rate: 0 }]);
  const removeItem = (id: string) => setItems((arr) => arr.length > 1 ? arr.filter((i) => i.id !== id) : arr);
  const applyService = (service: Omit<LineItem, "id">) => setItems((arr) => [...arr.filter((i) => i.description), { id: crypto.randomUUID(), ...service }]);

  const saveParty = async () => {
    if (!user) return toast.error("Login required");
    if (!form.name) return toast.error("Party name is required");
    setSaving(true);
    const { data, error } = await sb.from("parties").insert({
      owner_id: user.id, name: form.name, type: form.type ?? "customer",
      gstin: form.gstin ?? null, pan: form.pan ?? null, email: form.email ?? null, phone: form.phone ?? null,
      billing_address: form.billing_address ?? null, state: form.state ?? null,
      state_code: form.state_code ?? null, place_of_supply: form.place_of_supply ?? form.state ?? null,
    }).select().single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Party added");
    setOpenCreate(false); setForm({ type: "customer" });
    await load();
    if (data) setSelectedPartyId(data.id);
  };

  const saveInvoice = async () => {
    if (!user) return toast.error("Login required");
    if (!selectedParty) return toast.error("Select a party");
    if (items.every((i) => !i.description)) return toast.error("Add at least one item");
    setSaving(true);
    const { data: inv, error } = await sb.from("invoices").insert({
      owner_id: user.id, invoice_no: invoiceNo, invoice_date: invoiceDate,
      party_id: selectedParty.id, party_snapshot: selectedParty,
      subtotal, cgst, sgst, igst, total, gst_rate: gstPct, is_interstate: isInterstate,
      status: "draft", notes: notes || null,
    }).select().single();
    if (error || !inv) { setSaving(false); return toast.error(error?.message ?? "Failed"); }
    const itemsPayload = items.filter((i) => i.description).map((i) => ({
      invoice_id: inv.id, owner_id: user.id, description: i.description,
      hsn_sac: i.hsn_sac || null, qty: i.qty, rate: i.rate, amount: i.qty * i.rate,
    }));
    const { error: ierr } = await sb.from("invoice_items").insert(itemsPayload);
    setSaving(false);
    if (ierr) return toast.error(ierr.message);
    toast.success("Invoice saved");
    setInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
    setItems([{ id: crypto.randomUUID(), description: "", hsn_sac: "", qty: 1, rate: 0 }]);
    setNotes("");
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await sb.from("invoices").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const printInvoice = () => {
    if (!selectedParty) return toast.error("Select a party first");
    window.print();
  };

  return (
    <ModulePage
      title="Billing & GST"
      description="Advanced GST invoicing, buyer company records, software subscription billing, payment tracking and reminders."
      icon={<Receipt className="h-5 w-5" />}
    >
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="h-4 w-4" />Invoices</div><div className="mt-1 text-2xl font-bold text-navy-deep">{savedInvoices.length}</div></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><IndianRupee className="h-4 w-4" />Outstanding</div><div className="mt-1 text-2xl font-bold text-amber-700">₹{outstanding.toFixed(0)}</div></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><CreditCard className="h-4 w-4" />Collected</div><div className="mt-1 text-2xl font-bold text-emerald-700">₹{paidTotal.toFixed(0)}</div></Card>
        <Card className="p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="h-4 w-4" />Buyer Companies</div><div className="mt-1 text-2xl font-bold text-navy-deep">{parties.filter((p) => p.type !== "supplier").length}</div></Card>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">Create Invoice</TabsTrigger>
          <TabsTrigger value="list">Saved Invoices ({savedInvoices.length})</TabsTrigger>
          <TabsTrigger value="plans">Software Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] print:block">
            <Card className="p-6 print:border-0 print:shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div>
                  <h3 className="font-display text-lg font-bold">Create Invoice</h3>
                  <p className="text-sm text-muted-foreground">{isInterstate ? "Inter-state supply — IGST applies" : "Intra-state supply — CGST + SGST applies"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={printInvoice}><Printer className="mr-2 h-4 w-4" />Print / PDF</Button>
                  <Button onClick={saveInvoice} disabled={saving} className="bg-gradient-hero text-white"><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Invoice"}</Button>
                </div>
              </div>

              <div className="mt-6 rounded-lg border bg-white p-6 text-foreground print:mt-0 print:border-0 print:p-0">
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gold">Tax Invoice</div>
                    <div className="font-display text-2xl font-bold text-navy-deep">{seller.seller_name || "Your Company"}</div>
                    {seller.seller_address && <div className="mt-1 whitespace-pre-line text-xs text-muted-foreground max-w-xs">{seller.seller_address}</div>}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {seller.seller_gstin && <span className="mr-3">GSTIN: <b className="text-foreground">{seller.seller_gstin}</b></span>}
                      {seller.seller_pan && <span className="mr-3">PAN: {seller.seller_pan}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {seller.seller_phone && <span className="mr-3">☎ {seller.seller_phone}</span>}
                      {seller.seller_email && <span>✉ {seller.seller_email}</span>}
                    </div>
                    <button onClick={() => setOpenSeller(true)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-deep hover:underline print:hidden">
                      <Pencil className="h-3 w-3" /> Edit Company Details (From)
                    </button>
                  </div>
                  <div className="text-right text-sm">
                    <div><span className="text-muted-foreground">Invoice #</span> <b>{invoiceNo}</b></div>
                    <div><span className="text-muted-foreground">Date:</span> {invoiceDate}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-md border bg-muted/40 p-3 text-sm">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bill To</div>
                    {selectedParty ? (
                      <>
                        <div className="font-semibold text-foreground">{selectedParty.name}</div>
                        {selectedParty.billing_address && <div className="whitespace-pre-line text-xs text-muted-foreground">{selectedParty.billing_address}</div>}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedParty.gstin && <div>GSTIN: <b className="text-foreground">{selectedParty.gstin}</b></div>}
                          {selectedParty.pan && <div>PAN: {selectedParty.pan}</div>}
                          {selectedParty.phone && <div>Phone: {selectedParty.phone}</div>}
                          {selectedParty.email && <div>Email: {selectedParty.email}</div>}
                          {selectedParty.state && <div>State: {selectedParty.state} {selectedParty.state_code && `(${selectedParty.state_code})`}</div>}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">No party selected — pick one on the right →</div>
                    )}
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Place of Supply</div>
                    <div>{selectedParty?.place_of_supply ?? selectedParty?.state ?? "—"}</div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">GST Rate &amp; Type</div>
                    <div>{gstPct}% — {isInterstate ? "IGST" : "CGST + SGST"}</div>
                  </div>
                </div>

                <table className="mt-4 w-full text-sm">
                  <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">#</th><th className="px-3 py-2">Description</th><th className="px-3 py-2">HSN/SAC</th>
                      <th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                        <td className="px-3 py-2"><Input value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} placeholder="Item / Service" className="h-8 print:border-0 print:p-0 print:shadow-none" /></td>
                        <td className="px-3 py-2"><Input value={it.hsn_sac} onChange={(e) => updateItem(it.id, { hsn_sac: e.target.value })} placeholder="998314" className="h-8 w-24 print:border-0 print:p-0 print:shadow-none" /></td>
                        <td className="px-3 py-2 text-right"><Input type="number" value={it.qty} onChange={(e) => updateItem(it.id, { qty: parseFloat(e.target.value) || 0 })} className="h-8 w-16 text-right print:border-0 print:p-0 print:shadow-none" /></td>
                        <td className="px-3 py-2 text-right"><Input type="number" value={it.rate} onChange={(e) => updateItem(it.id, { rate: parseFloat(e.target.value) || 0 })} className="h-8 w-24 text-right print:border-0 print:p-0 print:shadow-none" /></td>
                        <td className="px-3 py-2 text-right font-medium">{(it.qty * it.rate).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right print:hidden"><Button size="icon" variant="ghost" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Button onClick={addItem} variant="outline" size="sm" className="mt-3 print:hidden"><Plus className="mr-1 h-3.5 w-3.5" />Add Item</Button>

                <div className="mt-6 ml-auto w-full max-w-xs space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><b>₹{subtotal.toFixed(2)}</b></div>
                  {isInterstate ? (
                    <div className="flex justify-between"><span className="text-muted-foreground">IGST ({gstPct}%)</span><b>₹{igst.toFixed(2)}</b></div>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">CGST ({(gstPct / 2).toFixed(1)}%)</span><b>₹{cgst.toFixed(2)}</b></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">SGST ({(gstPct / 2).toFixed(1)}%)</span><b>₹{sgst.toFixed(2)}</b></div>
                    </>
                  )}
                  <div className="mt-2 flex justify-between rounded-md bg-gradient-gold px-3 py-2 text-gold-foreground"><span>Total Payable</span><b>₹{total.toFixed(2)}</b></div>
                </div>

                <div className="mt-4 print:hidden">
                  <Label className="text-xs">Notes / Terms</Label>
                  <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment due in 15 days..." />
                </div>
              </div>
            </Card>

            <div className="space-y-4 print:hidden">
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-navy-deep" /><h4 className="font-display text-base font-bold">Party</h4></div>
                  <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                    <DialogTrigger asChild><Button size="sm" className="bg-navy-deep text-white"><Plus className="mr-1 h-3.5 w-3.5" />Add</Button></DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>Create Party</DialogTitle></DialogHeader>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2"><Label>Company / Buyer Name *</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company buying the software" /></div>
                        <div className="space-y-1.5"><Label>Type</Label>
                          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="supplier">Supplier</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5"><Label>GSTIN</Label><Input value={form.gstin ?? ""} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} /></div>
                        <div className="space-y-1.5"><Label>PAN</Label><Input value={form.pan ?? ""} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} /></div>
                        <div className="space-y-1.5"><Label>Decision Maker Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Owner / Accounts contact" /></div>
                        <div className="space-y-1.5 sm:col-span-2"><Label>Billing Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="accounts@company.com" /></div>
                        <div className="space-y-1.5 sm:col-span-2"><Label>Billing Address</Label><Textarea rows={3} value={form.billing_address ?? ""} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>State</Label><Input value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label>State Code</Label><Input value={form.state_code ?? ""} onChange={(e) => setForm({ ...form, state_code: e.target.value })} placeholder="27" /></div>
                      </div>
                      <DialogFooter><Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button><Button onClick={saveParty} disabled={saving} className="bg-gradient-hero text-white">{saving ? "Saving..." : "Save Party"}</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                  <SelectTrigger><SelectValue placeholder={parties.length ? "Select party" : "No parties yet"} /></SelectTrigger>
                  <SelectContent>{parties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} {p.gstin ? `• ${p.gstin}` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </Card>

              <Card className="p-5">
                <h4 className="mb-3 font-display text-base font-bold">Invoice Details</h4>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Invoice #</Label><Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>GST %</Label><Input type="number" value={gst} onChange={(e) => setGst(e.target.value)} /></div>
                </div>
              </Card>

              <Card className="p-5">
                <h4 className="mb-3 font-display text-base font-bold">Quick Software Billing</h4>
                <div className="space-y-2">
                  {quickServices.map((service) => (
                    <button key={service.description} onClick={() => applyService(service)} className="flex w-full items-center justify-between rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted/40">
                      <span><span className="font-medium text-navy-deep">{service.description}</span><span className="block text-xs text-muted-foreground">SAC {service.hsn_sac}</span></span>
                      <span className="font-semibold text-gold">₹{service.rate.toLocaleString("en-IN")}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h4 className="mb-3 font-display text-base font-bold">Advanced Controls</h4>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><BellRing className="h-4 w-4 text-amber-600" />Payment reminder ready for unpaid invoices</div>
                  <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-blue-600" />Place-of-supply decides IGST vs CGST/SGST</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />GSTIN, PAN and state code saved in buyer snapshot</div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold"><FileText className="mr-2 inline h-4 w-4" />Saved Invoices</h3>
            <div className="mt-6 overflow-x-auto">
              {savedInvoices.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No invoices saved yet.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead>Party</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Share</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {savedInvoices.map((inv) => {
                      const partySnap = inv.party_snapshot ?? {};
                      const buyerPhone = (partySnap.phone ?? "").replace(/\D/g, "");
                      const buyerEmail = partySnap.email ?? "";
                      const message = `Hello ${partySnap.name ?? ""},%0A%0AInvoice #${inv.invoice_no} dated ${inv.invoice_date} for ₹${Number(inv.total).toFixed(2)} is ready.%0A%0AFrom: ${seller.seller_name ?? "Your Company"}%0A${seller.seller_gstin ? "GSTIN: " + seller.seller_gstin + "%0A" : ""}${seller.seller_phone ? "☎ " + seller.seller_phone : ""}%0A%0AThank you for your business.`;
                      const waLink = buyerPhone ? `https://wa.me/${buyerPhone.length === 10 ? "91" + buyerPhone : buyerPhone}?text=${message}` : "";
                      const mailSubject = encodeURIComponent(`Invoice ${inv.invoice_no} from ${seller.seller_name ?? "us"}`);
                      const mailBody = encodeURIComponent(decodeURIComponent(message.replace(/%0A/g, "\n")));
                      const mailLink = buyerEmail ? `mailto:${buyerEmail}?subject=${mailSubject}&body=${mailBody}` : "";
                      const markShared = async (col: "share_email_sent_at" | "share_whatsapp_sent_at") => {
                        await sb.from("invoices").update({ [col]: new Date().toISOString() }).eq("id", inv.id);
                      };
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs">{inv.invoice_no}</TableCell>
                          <TableCell>{inv.invoice_date}</TableCell>
                          <TableCell>{partySnap?.name ?? "—"}</TableCell>
                          <TableCell className="text-right font-bold">₹{Number(inv.total).toFixed(2)}</TableCell>
                          <TableCell>
                            <Select value={inv.status} onValueChange={(v) => updateStatus(inv.id, v)}>
                              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!waLink}
                                onClick={() => { window.open(waLink, "_blank"); markShared("share_whatsapp_sent_at"); }}
                                className="h-7 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                title={waLink ? "Share on WhatsApp" : "No buyer phone saved"}
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!mailLink}
                                onClick={() => { window.location.href = mailLink; markShared("share_email_sent_at"); }}
                                className="h-7"
                                title={mailLink ? "Email invoice" : "No buyer email saved"}
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid gap-4 md:grid-cols-3">
            {billingPlans.map((plan) => (
              <Card key={plan.name} className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-gold">{plan.module}</div>
                <h3 className="mt-2 font-display text-xl font-bold text-navy-deep">{plan.name}</h3>
                <div className="mt-3 text-3xl font-bold">₹{plan.price.toLocaleString("en-IN")}</div>
                <div className="text-sm text-muted-foreground">{plan.cycle} • {plan.users}</div>
                <Button className="mt-5 w-full bg-gradient-hero text-white" onClick={() => applyService({ description: `${plan.name} Software Subscription`, hsn_sac: "998314", qty: 1, rate: plan.price })}>Add to Invoice</Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </ModulePage>
  );
}
