import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/dashboard/ModulePage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Receipt, FileText, Plus, Printer, Users, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

interface Party {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
  billing_address: string | null;
  state: string | null;
  state_code: string | null;
  place_of_supply: string | null;
}

interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

function BillingPage() {
  const { user } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [gst, setGst] = useState("18");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", qty: 1, rate: 0 },
  ]);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState<Partial<Party>>({ type: "customer" });
  const [saving, setSaving] = useState(false);

  const loadParties = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("parties")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setParties((data as Party[]) ?? []);
  }, [user]);

  useEffect(() => { loadParties(); }, [loadParties]);

  const selectedParty = useMemo(
    () => parties.find((p) => p.id === selectedPartyId) ?? null,
    [parties, selectedPartyId],
  );

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const gstPct = parseFloat(gst) || 0;
  const tax = (subtotal * gstPct) / 100;
  const total = subtotal + tax;

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const addItem = () =>
    setItems((arr) => [...arr, { id: crypto.randomUUID(), description: "", qty: 1, rate: 0 }]);

  const removeItem = (id: string) =>
    setItems((arr) => (arr.length > 1 ? arr.filter((i) => i.id !== id) : arr));

  const saveParty = async () => {
    if (!user) return toast.error("Login required");
    if (!form.name) return toast.error("Party name is required");
    setSaving(true);
    const { data, error } = await supabase
      .from("parties")
      .insert({
        owner_id: user.id,
        name: form.name!,
        type: form.type ?? "customer",
        gstin: form.gstin ?? null,
        pan: form.pan ?? null,
        email: form.email ?? null,
        phone: form.phone ?? null,
        billing_address: form.billing_address ?? null,
        state: form.state ?? null,
        state_code: form.state_code ?? null,
        place_of_supply: form.place_of_supply ?? form.state ?? null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Party added");
    setOpenCreate(false);
    setForm({ type: "customer" });
    await loadParties();
    if (data) setSelectedPartyId((data as Party).id);
  };

  const printInvoice = () => {
    if (!selectedParty) return toast.error("Select a party first");
    window.print();
  };

  return (
    <ModulePage
      title="Billing & GST"
      description="Create GST-compliant invoices with full party details."
      icon={<Receipt className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] print:block">
        {/* Invoice builder */}
        <Card className="p-6 print:border-0 print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div>
              <h3 className="font-display text-lg font-bold">Create Invoice</h3>
              <p className="text-sm text-muted-foreground">Select a party, add line items, GST auto-calculates.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={printInvoice}>
                <Printer className="mr-2 h-4 w-4" /> Print / PDF
              </Button>
              <Button className="bg-gradient-hero text-white">
                <FileText className="mr-2 h-4 w-4" /> Save Invoice
              </Button>
            </div>
          </div>

          {/* Print-ready invoice */}
          <div className="mt-6 rounded-lg border bg-white p-6 text-foreground print:mt-0 print:border-0 print:p-0">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-gold">Tax Invoice</div>
                <div className="font-display text-2xl font-bold text-navy-deep">ManageXOne</div>
                <div className="text-xs text-muted-foreground">Smart Business Management</div>
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
                    {selectedParty.billing_address && (
                      <div className="whitespace-pre-line text-xs text-muted-foreground">{selectedParty.billing_address}</div>
                    )}
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
                <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">GST Rate</div>
                <div>{gstPct}%</div>
              </div>
            </div>

            <table className="mt-4 w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Rate (₹)</th>
                  <th className="px-3 py-2 text-right">Amount (₹)</th>
                  <th className="px-3 py-2 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={it.description}
                        onChange={(e) => updateItem(it.id, { description: e.target.value })}
                        placeholder="Item / Service"
                        className="h-8 print:border-0 print:p-0 print:shadow-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        value={it.qty}
                        onChange={(e) => updateItem(it.id, { qty: parseFloat(e.target.value) || 0 })}
                        className="h-8 w-20 text-right print:border-0 print:p-0 print:shadow-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        value={it.rate}
                        onChange={(e) => updateItem(it.id, { rate: parseFloat(e.target.value) || 0 })}
                        className="h-8 w-28 text-right print:border-0 print:p-0 print:shadow-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{(it.qty * it.rate).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right print:hidden">
                      <Button size="icon" variant="ghost" onClick={() => removeItem(it.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button onClick={addItem} variant="outline" size="sm" className="mt-3 print:hidden">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
            </Button>

            <div className="mt-6 ml-auto w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><b>₹{subtotal.toFixed(2)}</b></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST ({gstPct}%)</span><b>₹{tax.toFixed(2)}</b></div>
              <div className="mt-2 flex justify-between rounded-md bg-gradient-gold px-3 py-2 text-gold-foreground"><span>Total Payable</span><b>₹{total.toFixed(2)}</b></div>
            </div>
          </div>
        </Card>

        {/* Right column: party + meta */}
        <div className="space-y-4 print:hidden">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-navy-deep" />
                <h4 className="font-display text-base font-bold">Party</h4>
              </div>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-navy-deep text-white">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Party
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Party</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Name *</Label>
                      <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ABC Traders Pvt Ltd" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>GSTIN</Label>
                      <Input value={form.gstin ?? ""} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} placeholder="29ABCDE1234F1Z5" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>PAN</Label>
                      <Input value={form.pan ?? ""} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Email</Label>
                      <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Billing Address</Label>
                      <Textarea rows={3} value={form.billing_address ?? ""} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>State</Label>
                      <Input value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>State Code</Label>
                      <Input value={form.state_code ?? ""} onChange={(e) => setForm({ ...form, state_code: e.target.value })} placeholder="27" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button onClick={saveParty} disabled={saving} className="bg-gradient-hero text-white">
                      {saving ? "Saving..." : "Save Party"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
              <SelectTrigger>
                <SelectValue placeholder={parties.length ? "Select party" : "No parties yet — add one"} />
              </SelectTrigger>
              <SelectContent>
                {parties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.gstin ? `• ${p.gstin}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedParty && (
              <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs">
                <div className="font-semibold text-foreground">{selectedParty.name}</div>
                {selectedParty.gstin && <div>GSTIN: {selectedParty.gstin}</div>}
                {selectedParty.phone && <div>{selectedParty.phone}</div>}
                {selectedParty.email && <div>{selectedParty.email}</div>}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h4 className="mb-3 font-display text-base font-bold">Invoice Details</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Invoice #</Label>
                <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>GST %</Label>
                <Input type="number" value={gst} onChange={(e) => setGst(e.target.value)} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ModulePage>
  );
}
