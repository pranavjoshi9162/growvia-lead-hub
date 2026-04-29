import { useMemo, useState, Fragment } from "react";
import { format, isToday } from "date-fns";
import {
  Search, Plus, ChevronDown, ChevronRight, MoreHorizontal, Edit, RefreshCcw,
  CalendarPlus, CheckCircle2, XCircle, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLeads } from "@/context/LeadsContext";
import { LEAD_STATUSES, LeadStatus, SOURCES, SALES_PEOPLE, Lead } from "@/lib/sampleData";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { StatusUpdateDialog } from "@/components/leads/StatusUpdateDialog";
import { LeadTimeline } from "@/components/leads/LeadTimeline";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DateFilter, DateRange } from "@/components/dashboard/DateFilter";
import {
  TrendingUp, TrendingDown, Clock, CalendarCheck, Monitor, Check, X,
  ListChecks, AlertCircle, CheckCheck
} from "lucide-react";

const statusColor: Record<LeadStatus, string> = {
  "Pending": "bg-secondary text-muted-foreground border-border",
  "Contacted": "bg-info-soft text-info border-info/30",
  "Follow Up": "bg-warning-soft text-warning border-warning/30",
  "Demo Scheduled": "bg-primary/10 text-primary border-primary/30",
  "Demo Given": "bg-primary/15 text-primary border-primary/30",
  "Qualified": "bg-success-soft text-success border-success/30",
  "Proposal Sent": "bg-info-soft text-info border-info/30",
  "Trial Started": "bg-warning-soft text-warning border-warning/30",
  "Converted": "bg-success-soft text-success border-success/30",
  "Lost": "bg-destructive/10 text-destructive border-destructive/30",
};

const info = "bg-info-soft text-info border-info/30";

export default function AllLeads() {
  const { leads, updateLead, setStatus } = useLeads();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatusF] = useState("all");
  const [potential, setPotential] = useState("all");
  const [assigned, setAssigned] = useState("all");
  const [dueToday, setDueToday] = useState(false);
  const [range, setRange] = useState<DateRange>("month");

  const [addOpen, setAddOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; lead: Lead | null; initial?: LeadStatus; title?: string }>({ open: false, lead: null });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) =>
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (search && !`${l.name} ${l.business} ${l.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (source !== "all" && l.source !== source) return false;
      if (status !== "all" && l.status !== status) return false;
      if (potential !== "all" && l.potential !== potential) return false;
      if (assigned !== "all" && l.assignedTo !== assigned) return false;
      if (dueToday && (!l.nextFollowUp || !isToday(new Date(l.nextFollowUp)))) return false;
      return true;
    });
  }, [leads, search, source, status, potential, assigned, dueToday]);

  // overview counts
  const total = leads.length;
  const high = leads.filter((l) => l.potential === "High").length;
  const low = leads.filter((l) => l.potential === "Low").length;
  const followUp = leads.filter((l) => l.status === "Follow Up").length;
  const demoSched = leads.filter((l) => l.status === "Demo Scheduled").length;
  const demoGiven = leads.filter((l) => l.status === "Demo Given").length;
  const converted = leads.filter((l) => l.status === "Converted").length;
  const lost = leads.filter((l) => l.status === "Lost").length;

  const totalFu = leads.filter((l) => l.nextFollowUp).length;
  const todayFu = leads.filter((l) => l.nextFollowUp && isToday(new Date(l.nextFollowUp))).length;
  const missedFu = leads.filter((l) => l.nextFollowUp && new Date(l.nextFollowUp) < new Date(new Date().toDateString())).length;
  const completedFu = 5;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Sales & Lead CRM</div>
          <h1 className="text-3xl font-bold mt-1">All Leads / Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage incoming inquiries from website, manual entries and campaigns.</p>
        </div>
        <DateFilter value={range} onChange={setRange} />
      </div>

      {/* Overview cards */}
      <section>
        <div className="section-label">Leads Overview</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard variant="soft" icon={Users} value={total} label="Total Leads" sublabel="This month" />
          <MetricCard icon={TrendingUp} value={high} label="High Potential" sublabel="Hot Leads" />
          <MetricCard icon={TrendingDown} value={low} label="Low Potential" sublabel="Cold Leads" />
          <MetricCard icon={Clock} value={followUp} label="Follow-up Leads" sublabel="Awaiting" />
          <MetricCard icon={CalendarCheck} value={demoSched} label="Demo Scheduled" sublabel="This month" />
          <MetricCard icon={Monitor} value={demoGiven} label="Demo Given" sublabel="This month" />
          <MetricCard icon={Check} value={converted} label="Converted" sublabel="Closed won" />
          <MetricCard icon={X} value={lost} label="Lost" sublabel="Closed lost" />
        </div>
      </section>

      <section>
        <div className="section-label">Follow-ups</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={ListChecks} value={totalFu} label="Total Follow-ups" sublabel="Open" />
          <MetricCard variant="soft" icon={CalendarCheck} value={todayFu} label="Today's Follow-ups" sublabel="Due today" />
          <MetricCard variant="danger" icon={AlertCircle} value={missedFu} label="Missed Follow-ups" sublabel="Action needed" />
          <MetricCard icon={CheckCheck} value={completedFu} label="Completed Today" sublabel="Today" />
        </div>
      </section>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search leads, business, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatusF}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={potential} onValueChange={setPotential}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Potential" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Potential</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigned} onValueChange={setAssigned}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Sales" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sales</SelectItem>
            {SALES_PEOPLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border cursor-pointer hover:bg-secondary text-sm">
          <Checkbox checked={dueToday} onCheckedChange={(v) => setDueToday(!!v)} />
          Due Today
        </label>
        <Button onClick={() => setAddOpen(true)} className="ml-auto gap-2">
          <Plus className="h-4 w-4" /> Add Manual Lead
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr className="text-left text-muted-foreground">
                <th className="py-3 pl-4 pr-2 w-8"></th>
                <th className="py-3 pr-4 font-medium">Lead</th>
                <th className="py-3 pr-4 font-medium">Business</th>
                <th className="py-3 pr-4 font-medium">Source</th>
                <th className="py-3 pr-4 font-medium">Potential</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Next Follow-up</th>
                <th className="py-3 pr-4 font-medium">Assigned To</th>
                <th className="py-3 pr-4 font-medium">Created</th>
                <th className="py-3 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-10 text-center text-muted-foreground">No leads match your filters.</td></tr>
              )}
              {filtered.map((l) => {
                const isExp = expanded.has(l.id);
                return (
                  <Fragment key={l.id}>
                    <tr key={l.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="py-3 pl-4 pr-2">
                        <button onClick={() => toggleExpand(l.id)} className="text-muted-foreground hover:text-foreground">
                          {isExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.phone}</div>
                      </td>
                      <td className="py-3 pr-4">{l.business}</td>
                      <td className="py-3 pr-4"><Badge variant="outline" className={info}>{l.source}</Badge></td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className={l.potential === "High"
                          ? "bg-success-soft text-success border-success/30"
                          : "bg-secondary text-muted-foreground"}>
                          {l.potential}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4"><Badge variant="outline" className={statusColor[l.status]}>{l.status}</Badge></td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {l.nextFollowUp ? format(new Date(l.nextFollowUp), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="py-3 pr-4">{l.assignedTo}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{format(new Date(l.createdAt), "dd MMM")}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-8"
                            onClick={() => setStatusDialog({ open: true, lead: l, title: "Add Status Update" })}>
                            Status Update
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-popover">
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, title: "Edit Lead" })}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, title: "Update Status" })}>
                                <RefreshCcw className="h-4 w-4 mr-2" /> Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, initial: "Follow Up", title: "Schedule Follow-up" })}>
                                <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Follow-up
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, initial: "Converted", title: "Mark Converted" })}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Mark Converted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, initial: "Lost", title: "Mark Lost" })}>
                                <XCircle className="h-4 w-4 mr-2 text-destructive" /> Mark Lost
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                    {isExp && (
                      <tr className="bg-secondary/20 border-t border-border">
                        <td colSpan={10} className="p-5">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                              <LeadTimeline lead={l} />
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4 h-fit">
                              <div className="text-sm font-semibold mb-3">Lead Details</div>
                              <dl className="space-y-2 text-sm">
                                <Row k="Email" v={l.email} />
                                <Row k="Phone" v={l.phone} />
                                <Row k="Source" v={l.source} />
                                <Row k="Substatus" v={l.substatus ?? "—"} />
                                <Row k="Notes" v={l.notes ?? "—"} />
                              </dl>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} />
      <StatusUpdateDialog
        open={statusDialog.open}
        onOpenChange={(v) => setStatusDialog((s) => ({ ...s, open: v }))}
        lead={statusDialog.lead}
        initialStatus={statusDialog.initial}
        title={statusDialog.title}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}
