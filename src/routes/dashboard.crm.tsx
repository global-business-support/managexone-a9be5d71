import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ModulePage } from "@/components/dashboard/ModulePage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban, Plus, Search, Building2, Users, TrendingUp, IndianRupee,
  Phone, Mail, Calendar, Target, Filter, Download, MoreVertical, ArrowUpRight,
  CheckCircle2, Clock, AlertCircle, Sparkles,
} from "lucide-react";
import crmBg from "@/assets/crm-bg.jpg";

const stats = [
  { label: "Total Companies", value: "24", change: "+3 this month", icon: Building2, tone: "text-navy-deep", bg: "from-blue-50 to-indigo-50" },
  { label: "Active Leads", value: "186", change: "+12.4%", icon: Users, tone: "text-emerald-700", bg: "from-emerald-50 to-teal-50" },
  { label: "Pipeline Value", value: "₹ 1.4 Cr", change: "+₹ 22L", icon: IndianRupee, tone: "text-amber-700", bg: "from-amber-50 to-yellow-50" },
  { label: "Win Rate", value: "38%", change: "+4%", icon: TrendingUp, tone: "text-rose-700", bg: "from-rose-50 to-pink-50" },
];

const pipeline = [
  { stage: "New", count: 42, value: "₹ 28L", color: "bg-blue-500" },
  { stage: "Qualified", count: 28, value: "₹ 36L", color: "bg-indigo-500" },
  { stage: "Proposal", count: 19, value: "₹ 42L", color: "bg-amber-500" },
  { stage: "Negotiation", count: 11, value: "₹ 24L", color: "bg-orange-500" },
  { stage: "Won", count: 8, value: "₹ 18L", color: "bg-emerald-500" },
];

const companies = [
  { name: "Acme Industries Pvt Ltd", industry: "Manufacturing", deals: 12, value: "₹ 24.5L", status: "Active", contact: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@acme.in" },
  { name: "Sunrise Hotels & Resorts", industry: "Hospitality", deals: 8, value: "₹ 18.2L", status: "Active", contact: "Priya Sharma", phone: "+91 98765 12340", email: "priya@sunrise.com" },
  { name: "FitZone Gym Network", industry: "Fitness", deals: 5, value: "₹ 9.8L", status: "Hot", contact: "Amit Patel", phone: "+91 99887 65432", email: "amit@fitzone.in" },
  { name: "CityCare Hospital", industry: "Healthcare", deals: 14, value: "₹ 32.1L", status: "Active", contact: "Dr. Neha Gupta", phone: "+91 90909 80808", email: "neha@citycare.org" },
  { name: "Urban Retail Chain", industry: "Retail", deals: 6, value: "₹ 12.4L", status: "Cold", contact: "Vikram Singh", phone: "+91 91234 56789", email: "vikram@urbanretail.in" },
];

const activities = [
  { type: "call", title: "Discovery call with Sunrise Hotels", time: "10 min ago", icon: Phone, tone: "text-blue-600 bg-blue-50" },
  { type: "deal", title: "Acme Industries — ₹ 4.5L deal moved to Proposal", time: "1 hr ago", icon: Target, tone: "text-amber-600 bg-amber-50" },
  { type: "won", title: "FitZone Gym signed annual contract", time: "3 hr ago", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
  { type: "email", title: "Follow-up email to CityCare Hospital", time: "5 hr ago", icon: Mail, tone: "text-indigo-600 bg-indigo-50" },
  { type: "task", title: "Reminder: Send proposal to Urban Retail", time: "Tomorrow", icon: Clock, tone: "text-rose-600 bg-rose-50" },
];

const statusTone: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Hot: "bg-rose-100 text-rose-700 border-rose-200",
  Cold: "bg-slate-100 text-slate-700 border-slate-200",
};

function CRMDashboard() {
  const [query, setQuery] = useState("");
  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.industry.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        <img src={crmBg} alt="" aria-hidden width={1600} height={600} className="absolute inset-0 h-full w-full object-cover opacity-70" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/80 px-3 py-1 text-xs font-semibold text-navy-deep backdrop-blur">
              <Sparkles className="h-3 w-3 text-gold" /> AI Insights
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-deep md:text-3xl">
              Your pipeline is up <span className="text-gradient-gold">12.4%</span> this month
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              5 deals are ready to close. 3 leads need a follow-up today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/80 backdrop-blur"><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />Add Company
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className={`relative overflow-hidden border-border/60 bg-gradient-to-br ${s.bg} p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                <div className={`mt-1 font-display text-3xl font-bold ${s.tone}`}>{s.value}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <ArrowUpRight className="h-3 w-3" />{s.change}
                </div>
              </div>
              <div className={`rounded-xl bg-white/80 p-2.5 ${s.tone} shadow-sm`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pipeline */}
      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-navy-deep">Sales Pipeline</h3>
            <p className="text-xs text-muted-foreground">Kanban view of deals across stages</p>
          </div>
          <Button variant="ghost" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {pipeline.map((p) => (
            <div key={p.stage} className="rounded-xl border bg-gradient-to-b from-white to-muted/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.stage}</span>
              </div>
              <div className="mt-3 font-display text-2xl font-bold text-navy-deep">{p.count}</div>
              <div className="text-xs text-muted-foreground">deals</div>
              <div className="mt-3 border-t pt-2 text-sm font-semibold text-gold">{p.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Companies + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-navy-deep">Companies</h3>
              <p className="text-xs text-muted-foreground">{filtered.length} of {companies.length} shown</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company or industry…" className="w-64 pl-9" />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 text-left font-semibold">Company</th>
                  <th className="p-3 text-left font-semibold">Contact</th>
                  <th className="p-3 text-left font-semibold">Deals</th>
                  <th className="p-3 text-left font-semibold">Value</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.name} className="border-t transition-colors hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-semibold text-navy-deep">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.industry}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{c.contact}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />{c.phone}
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{c.deals}</td>
                    <td className="p-3 font-semibold text-gold">{c.value}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={statusTone[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No companies match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-navy-deep">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Live updates from your team</p>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="space-y-3">
            {activities.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30">
                <div className={`rounded-lg p-2 ${a.tone}`}><a.icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-navy-deep">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-4 w-full">View all activity</Button>
        </Card>
      </div>

      {/* Tasks + Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-navy-deep">Today's Tasks</h3>
          <ul className="space-y-2 text-sm">
            {[
              { t: "Call with Acme Industries CFO", d: "11:30 AM", done: true },
              { t: "Send proposal to CityCare Hospital", d: "2:00 PM", done: false },
              { t: "Demo for Sunrise Hotels team", d: "4:30 PM", done: false },
              { t: "Review pipeline with sales team", d: "6:00 PM", done: false },
            ].map((task, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border p-3">
                {task.done
                  ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  : <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />}
                <div className="flex-1">
                  <div className={`font-medium ${task.done ? "text-muted-foreground line-through" : "text-navy-deep"}`}>{task.t}</div>
                  <div className="text-xs text-muted-foreground">{task.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-navy-deep to-navy p-6 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/30 blur-3xl" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3 w-3 text-gold" /> AI Recommendations
            </div>
            <h3 className="font-display text-xl font-bold">Smart Insights</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              <li className="flex gap-2"><span className="text-gold">▸</span> Reach out to <b className="text-white">Urban Retail</b> — no contact for 14 days.</li>
              <li className="flex gap-2"><span className="text-gold">▸</span> <b className="text-white">3 deals</b> in Negotiation are likely to close this week.</li>
              <li className="flex gap-2"><span className="text-gold">▸</span> Hospitality industry shows <b className="text-white">+22% growth</b> — focus here.</li>
              <li className="flex gap-2"><span className="text-gold">▸</span> Best time to call: <b className="text-white">11 AM – 1 PM</b> (62% pickup rate).</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/crm")({
  component: () => (
    <ModulePage
      title="Multi-Company CRM"
      description="Manage companies, leads, deals and pipelines with AI-powered insights."
      icon={<FolderKanban className="h-5 w-5" />}
      premium
    >
      <CRMDashboard />
    </ModulePage>
  ),
});
