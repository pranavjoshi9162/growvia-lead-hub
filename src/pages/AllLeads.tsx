import { useMemo, useState, Fragment, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format, isToday, isPast, isFuture } from "date-fns";
import {
  Search, Plus, ChevronDown, ChevronRight, MoreHorizontal, Edit, RefreshCcw,
  CalendarPlus, CheckCircle2, XCircle, Users, MapPin
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
import { ScheduleVisitDialog } from "@/components/leads/ScheduleVisitDialog";
import { LeadTimeline } from "@/components/leads/LeadTimeline";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DateFilter, DateRange } from "@/components/dashboard/DateFilter";
import {
  TrendingUp, TrendingDown, Clock, CalendarCheck, Monitor, Check, X,
  ListChecks, AlertCircle, CheckCheck
} from "lucide-react";

const statusColor: Record<LeadStatus, string> = {
  "Cold Call": "bg-info-soft text-info border-info/30",
  "Schedule Visit": "bg-warning-soft text-warning border-warning/30",
  "Visit Done": "bg-warning-soft text-warning border-warning/30",
  "Demo Schedule": "bg-primary/10 text-primary border-primary/30",
  "Demo Done": "bg-primary/15 text-primary border-primary/30",
  "In-Progress": "bg-warning-soft text-warning border-warning/30",
  "Free Trial": "bg-success-soft text-success border-success/30",
  "Sale Done": "bg-success-soft text-success border-success/30",
  "Closed - Dead": "bg-destructive/10 text-destructive border-destructive/30",
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
  const [visitFilter, setVisitFilter] = useState<"all" | "today" | "upcoming" | "missed" | "completed">("all");
  const [range, setRange] = useState<DateRange>("month");

  const [addOpen, setAddOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; lead: Lead | null; initial?: LeadStatus; title?: string }>({ open: false, lead: null });
  const [visitDialog, setVisitDialog] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const f = searchParams.get("filter");
    if (!f) return;
    setSource("all"); setStatusF("all"); setPotential("all"); setAssigned("all"); setDueToday(false);
    switch (f) {
      case "all": break;
      case "high": setPotential("High"); break;
      case "low": setPotential("Low"); break;
      case "follow-up": setStatusF("Cold Call"); break;
      case "demo-scheduled": setStatusF("Demo Schedule"); break;
      case "demo-given": setStatusF("Demo Done"); break;
      case "converted": setStatusF("Sale Done"); break;
      case "lost": setStatusF("Closed - Dead"); break;
    }
    const next = new URLSearchParams(searchParams);
    next.delete("filter");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("filter")]);

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
      if (visitFilter !== "all") {
        const visits = l.visits ?? [];
        const match = visits.some((v) => {
          const dt = new Date(v.date);
          if (visitFilter === "today") return isToday(dt) && (v.status === "Scheduled" || v.status === "Checked In");
          if (visitFilter === "upcoming") return isFuture(dt) && v.status === "Scheduled";
          if (visitFilter === "missed") return v.status === "Missed" || (isPast(dt) && !isToday(dt) && v.status === "Scheduled");
          if (visitFilter === "completed") return v.status === "Completed";
          return true;
        });
        if (!match) return false;
      }
      return true;
    });
  }, [leads, search, source, status, potential, assigned, dueToday, visitFilter]);

  // overview counts
  const total = leads.length;
  const high = leads.filter((l) => l.potential === "High").length;
  const low = leads.filter((l) => l.potential === "Low").length;
  const followUp = leads.filter((l) => l.status === "Cold Call").length;
  const demoSched = leads.filter((l) => l.status === "Demo Schedule").length;
  const demoGiven = leads.filter((l) => l.status === "Demo Done").length;
  const converted = leads.filter((l) => l.status === "Sale Done").length;
  const lost = leads.filter((l) => l.status === "Closed - Dead").length;

  const totalFu = leads.filter((l) => l.nextFollowUp).length;
  const todayFu = leads.filter((l) => l.nextFollowUp && isToday(new Date(l.nextFollowUp))).length;
  const missedFu = leads.filter((l) => l.nextFollowUp && new Date(l.nextFollowUp) < new Date(new Date().toDateString())).length;
  const completedFu = 5;

  // Visit metrics
  const allVisits = leads.flatMap((l) => (l.visits ?? []).map((v) => ({ v, lead: l })));
  const visitsToday = allVisits.filter(({ v }) => isToday(new Date(v.date)));
  const scheduledToday = visitsToday.filter(({ v }) => v.status === "Scheduled" || v.status === "Checked In").length;
  const completedToday = visitsToday.filter(({ v }) => v.status === "Completed").length;
  const missedVisits = allVisits.filter(({ v }) => v.status === "Missed" || (isPast(new Date(v.date)) && !isToday(new Date(v.date)) && v.status === "Scheduled")).length;

  const nextVisit = (l: Lead) => {
    const upcoming = (l.visits ?? [])
      .filter((v) => v.status === "Scheduled" || v.status === "Checked In" || v.status === "Rescheduled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    return upcoming;
  };

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
          <MetricCard icon={Clock} value={followUp} label="Cold Call" sublabel="In progress" />
          <MetricCard icon={CalendarCheck} value={demoSched} label="Demo Schedule" sublabel="This month" />
          <MetricCard icon={Monitor} value={demoGiven} label="Demo Done" sublabel="This month" />
          <MetricCard icon={Check} value={converted} label="Sale Done" sublabel="Closed won" />
          <MetricCard icon={X} value={lost} label="Closed - Dead" sublabel="Closed lost" />
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
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
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
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Next Follow-up</th>
                <th className="py-3 pr-4 font-medium">Next Visit</th>
                <th className="py-3 pr-4 font-medium">Visit Status</th>
                <th className="py-3 pr-4 font-medium">Assigned To</th>
                <th className="py-3 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-10 text-center text-muted-foreground">No leads match your filters.</td></tr>
              )}
              {filtered.map((l) => {
                const isExp = expanded.has(l.id);
                const v = nextVisit(l);
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
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={statusColor[l.status]}>{l.status}</Badge>
                          {l.substatus && <span className="text-[11px] text-muted-foreground">{l.substatus}</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {l.nextFollowUp ? format(new Date(l.nextFollowUp), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {v ? format(new Date(v.date), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {v ? <Badge variant="outline" className="bg-warning-soft text-warning border-warning/30">{v.status}</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 pr-4">{l.assignedTo}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-8"
                            onClick={() => setStatusDialog({ open: true, lead: l, title: "Add Status Update" })}>
                            Status Update
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1"
                            onClick={() => setVisitDialog({ open: true, lead: l })}>
                            <MapPin className="h-3.5 w-3.5" /> Visit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-popover">
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, title: "Edit Lead" })}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, title: "Update Status" })}>
                                <RefreshCcw className="h-4 w-4 mr-2" /> Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setVisitDialog({ open: true, lead: l })}>
                                <MapPin className="h-4 w-4 mr-2" /> Schedule Visit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, initial: "Cold Call", title: "Schedule Follow-up" })}>
                                <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Follow-up
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, initial: "Sale Done", title: "Mark Sale Done" })}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Mark Sale Done
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatusDialog({ open: true, lead: l, initial: "Closed - Dead", title: "Mark Closed - Dead" })}>
                                <XCircle className="h-4 w-4 mr-2 text-destructive" /> Mark Closed - Dead
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
                            <div className="space-y-4">
                              <div className="rounded-lg border border-border bg-card p-4">
                                <div className="text-sm font-semibold mb-3">Lead Details</div>
                                <dl className="space-y-2 text-sm">
                                  <Row k="Email" v={l.email} />
                                  <Row k="Phone" v={l.phone} />
                                  <Row k="Source" v={l.source} />
                                  <Row k="Substatus" v={l.substatus ?? "—"} />
                                  <Row k="Notes" v={l.notes ?? "—"} />
                                </dl>
                              </div>
                              <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-sm font-semibold">Visits</div>
                                  <Button size="sm" variant="outline" className="h-7 gap-1"
                                    onClick={() => setVisitDialog({ open: true, lead: l })}>
                                    <MapPin className="h-3.5 w-3.5" /> Schedule
                                  </Button>
                                </div>
                                {(l.visits ?? []).length === 0 ? (
                                  <div className="text-xs text-muted-foreground">No visits yet.</div>
                                ) : (
                                  <ul className="space-y-2">
                                    {l.visits!.map((vv) => (
                                      <li key={vv.id} className="text-xs border border-border rounded-md p-2">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">{vv.type}</span>
                                          <Badge variant="outline" className="bg-warning-soft text-warning border-warning/30">{vv.status}</Badge>
                                        </div>
                                        <div className="text-muted-foreground mt-1">
                                          {format(new Date(vv.date), "dd MMM yyyy")} · {vv.assignedTo}
                                        </div>
                                        {vv.notes && <div className="text-muted-foreground mt-1">{vv.notes}</div>}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
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
      <ScheduleVisitDialog
        open={visitDialog.open}
        onOpenChange={(v) => setVisitDialog((s) => ({ ...s, open: v }))}
        lead={visitDialog.lead}
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
