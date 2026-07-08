import { useMemo, useState, Fragment, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { format, isToday, isPast, isFuture } from "date-fns";
import {
  Search, Plus, ChevronDown, ChevronRight, MoreHorizontal, Edit,
  CalendarPlus, CheckCircle2, XCircle, Users, MapPin,
  Clock, CalendarCheck, Monitor, Check, X,
  ListChecks, AlertCircle, CheckCheck, SlidersHorizontal, Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { useLeads } from "@/context/LeadsContext";
import { useAuth } from "@/context/AuthContext";
import { LEAD_STATUSES, LeadStatus, SOURCES, SALES_PEOPLE, Lead, leadStatusDisplay } from "@/lib/sampleData";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { StatusUpdateDialog } from "@/components/leads/StatusUpdateDialog";
import { ScheduleVisitDialog } from "@/components/leads/ScheduleVisitDialog";
import { LeadTimeline } from "@/components/leads/LeadTimeline";
import { BillingCard } from "@/components/billing/BillingCard";
import { BillingDialog } from "@/components/billing/BillingDialog";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard, GLASS_SURFACES } from "@/components/dashboard/MetricCard";
import { DateFilter, DateRange } from "@/components/dashboard/DateFilter";

const statusColor: Record<LeadStatus, string> = {
  "New Lead": "bg-info-soft text-info border-info/30",
  Contacted: "bg-info-soft text-info border-info/30",
  Visit: "bg-warning-soft text-warning border-warning/30",
  Demo: "bg-primary/10 text-primary border-primary/30",
  Negotiation: "bg-warning-soft text-warning border-warning/30",
  Trial: "bg-success-soft text-success border-success/30",
  Converted: "bg-success-soft text-success border-success/30",
  Lost: "bg-destructive/10 text-destructive border-destructive/30",
};

const info = "bg-info-soft text-info border-info/30";

export default function AllLeads() {
  const { leads } = useLeads();
  const { user } = useAuth();
  const isAdmin = user?.role === "super_admin";
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatusF] = useState("all");
  const [potential, setPotential] = useState("all");
  const [assigned, setAssigned] = useState("all");
  const [dueToday, setDueToday] = useState(false);
  const [visitFilter, setVisitFilter] = useState<"all" | "today" | "upcoming" | "missed" | "completed">("all");
  type CardKey =
    | null
    | "total" | "high" | "low"
    | "fu-pending" | "demo-sched" | "demo-done" | "converted" | "lost"
    | "fu-total" | "fu-today" | "fu-missed" | "fu-completed"
    | "v-today" | "v-scheduled-today" | "v-completed-today" | "v-missed"
    | "d-scheduled" | "d-completed" | "d-rescheduled";
  const [cardFilter, setCardFilter] = useState<CardKey>(null);
  const [range, setRange] = useState<DateRange>("month");

  const clearAll = () => {
    setSearch(""); setSource("all"); setStatusF("all"); setPotential("all");
    setAssigned("all"); setDueToday(false); setVisitFilter("all"); setCardFilter(null);
  };

  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    lead: Lead | null;
    initial?: LeadStatus;
    initialSubstatus?: string;
    title?: string;
    editLastMode?: boolean;
  }>({ open: false, lead: null });
  const [visitDialog, setVisitDialog] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [billingDialog, setBillingDialog] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [searchParams, setSearchParams] = useSearchParams();
  const filterToolbarRef = useRef<HTMLDivElement>(null);

  const scrollToLeadTableToolbar = () => {
    queueMicrotask(() => {
      filterToolbarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const applyCardFilter = (k: CardKey) => {
    setCardFilter((prev) => {
      const next = prev === k ? null : k;
      if (next !== null) scrollToLeadTableToolbar();
      return next;
    });
  };

  useEffect(() => {
    const f = searchParams.get("filter");
    if (!f) return;
    setSource("all"); setStatusF("all"); setPotential("all"); setAssigned("all"); setDueToday(false);
    switch (f) {
      case "all": break;
      case "high": setPotential("High"); break;
      case "low": setPotential("Low"); break;
      case "follow-up": setStatusF("Contacted"); break;
      case "demo-scheduled": setStatusF("Demo"); break;
      case "demo-given": setStatusF("Demo"); break;
      case "converted": setStatusF("Converted"); break;
      case "lost": setStatusF("Lost"); break;
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
      if (cardFilter) {
        const visits = l.visits ?? [];
        const today0 = new Date(new Date().toDateString());
        const fuDate = l.nextFollowUp ? new Date(l.nextFollowUp) : null;
        switch (cardFilter) {
          case "total": break;
          case "high": if (l.potential !== "High") return false; break;
          case "low": if (l.potential !== "Low") return false; break;
          case "fu-pending": if (l.substatus !== "Follow-up Pending") return false; break;
          case "demo-sched": if (l.status !== "Demo" || l.substatus !== "Demo Scheduled") return false; break;
          case "demo-done": if (l.status !== "Demo" || l.substatus !== "Demo Completed") return false; break;
          case "converted": if (l.status !== "Converted") return false; break;
          case "lost": if (l.status !== "Lost") return false; break;
          case "fu-total": if (!fuDate) return false; break;
          case "fu-today": if (!fuDate || !isToday(fuDate)) return false; break;
          case "fu-missed": if (!fuDate || fuDate >= today0) return false; break;
          case "fu-completed": return false; // no completion tracking yet
          case "v-today": if (!visits.some((v) => isToday(new Date(v.date)))) return false; break;
          case "v-scheduled-today": if (!visits.some((v) => isToday(new Date(v.date)) && v.status === "Scheduled")) return false; break;
          case "v-completed-today": if (!visits.some((v) => isToday(new Date(v.date)) && v.status === "Completed")) return false; break;
          case "v-missed": if (!visits.some((v) => v.status === "Missed" || (isPast(new Date(v.date)) && !isToday(new Date(v.date)) && v.status === "Scheduled"))) return false; break;
          case "d-scheduled": if (l.status !== "Demo" || l.substatus !== "Demo Scheduled") return false; break;
          case "d-completed": if (l.status !== "Demo" || l.substatus !== "Demo Completed") return false; break;
          case "d-rescheduled": if (l.status !== "Demo" || l.substatus !== "Demo Rescheduled") return false; break;
        }
      }
      return true;
    });
  }, [leads, search, source, status, potential, assigned, dueToday, visitFilter, cardFilter]);

  // overview counts
  const total = leads.length;
  const high = leads.filter((l) => l.potential === "High").length;
  const low = leads.filter((l) => l.potential === "Low").length;
  const followUpPending = leads.filter((l) => l.substatus === "Follow-up Pending").length;
  const demoSched = leads.filter((l) => l.status === "Demo" && l.substatus === "Demo Scheduled").length;
  const demoGiven = leads.filter((l) => l.status === "Demo" && l.substatus === "Demo Completed").length;
  const converted = leads.filter((l) => l.status === "Converted").length;
  const lost = leads.filter((l) => l.status === "Lost").length;

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

  const demoPipeScheduled = leads.filter((l) => l.status === "Demo" && l.substatus === "Demo Scheduled").length;
  const demoPipeCompleted = leads.filter((l) => l.status === "Demo" && l.substatus === "Demo Completed").length;
  const demoPipeRescheduled = leads.filter((l) => l.status === "Demo" && l.substatus === "Demo Rescheduled").length;

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
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary/75 !mb-0">Leads Overview</div>
          {cardFilter && (
            <button onClick={() => setCardFilter(null)} className="text-xs text-primary hover:underline">Clear card filter</button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => applyCardFilter("total")}
            className={cn(
              "w-full text-left rounded-2xl border p-4 backdrop-blur-sm transition-all cursor-pointer min-h-[7rem] flex flex-col hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] active:translate-y-0",
              cardFilter === "total" && "ring-2 ring-primary shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
            )}
            style={{
              background: GLASS_SURFACES.peach.bg,
              borderColor: GLASS_SURFACES.peach.border,
            }}
          >
            <div className="flex items-start justify-between gap-2 flex-1 min-h-0">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground leading-snug truncate">Total Leads</div>
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums mt-1">{total}</div>
              </div>
              <div
                className="h-8 w-8 rounded-full grid place-items-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                style={{ background: GLASS_SURFACES.peach.iconBg, color: "#374151" }}
              >
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-foreground/10 flex items-center gap-4">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); applyCardFilter("high"); }}
                className={cn(
                  "flex items-baseline gap-1.5 text-xs hover:underline",
                  cardFilter === "high" ? "text-primary font-medium" : "text-[#4B5563]"
                )}
              >
                <span className="text-sm font-semibold text-foreground tabular-nums">{high}</span>
                <span>Hot Leads</span>
              </button>
              <span className="h-3 w-px bg-foreground/15" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); applyCardFilter("low"); }}
                className={cn(
                  "flex items-baseline gap-1.5 text-xs hover:underline",
                  cardFilter === "low" ? "text-primary font-medium" : "text-[#4B5563]"
                )}
              >
                <span className="text-sm font-semibold text-foreground tabular-nums">{low}</span>
                <span>Cold Leads</span>
              </button>
            </div>
          </button>
          <MetricCard glassSurface="amber" icon={Clock} value={followUpPending} label="Follow-up Pending" sublabel="Across pipeline" onClick={() => applyCardFilter("fu-pending")} active={cardFilter === "fu-pending"} />
          <MetricCard glassSurface="sky" icon={CalendarCheck} value={demoSched} label="Demo Scheduled" sublabel="Pipeline" onClick={() => applyCardFilter("demo-sched")} active={cardFilter === "demo-sched"} />
          <MetricCard glassSurface="indigo" icon={Monitor} value={demoGiven} label="Demo Completed" sublabel="Pipeline" onClick={() => applyCardFilter("demo-done")} active={cardFilter === "demo-done"} />
          <MetricCard glassSurface="mint" icon={Check} value={converted} label="Sale Done" sublabel="Closed won" onClick={() => applyCardFilter("converted")} active={cardFilter === "converted"} />
          <MetricCard glassSurface="rose" icon={X} value={lost} label="Lost" sublabel="Closed lost" onClick={() => applyCardFilter("lost")} active={cardFilter === "lost"} />
        </div>
      </section>

      <section>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary/75 mb-2">Follow-ups</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard glassSurface="apricot" icon={ListChecks} value={totalFu} label="Total Follow-ups" sublabel="Open" onClick={() => applyCardFilter("fu-total")} active={cardFilter === "fu-total"} />
          <MetricCard glassSurface="gold" icon={CalendarCheck} value={todayFu} label="Today's Follow-ups" sublabel="Due today" onClick={() => applyCardFilter("fu-today")} active={cardFilter === "fu-today"} />
          <MetricCard glassSurface="rose" icon={AlertCircle} value={missedFu} label="Missed Follow-ups" sublabel="Action needed" onClick={() => applyCardFilter("fu-missed")} active={cardFilter === "fu-missed"} />
          <MetricCard glassSurface="mint" icon={CheckCheck} value={completedFu} label="Completed Today" sublabel="Today" onClick={() => applyCardFilter("fu-completed")} active={cardFilter === "fu-completed"} />
        </div>
      </section>

      {/* Visits Summary */}
      <section>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary/75 mb-2">Visits</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard glassSurface="sky" icon={MapPin} value={visitsToday.length} label="Visits Today" sublabel="All visits" onClick={() => applyCardFilter("v-today")} active={cardFilter === "v-today"} />
          <MetricCard glassSurface="cerulean" icon={CalendarCheck} value={scheduledToday} label="Scheduled Today" sublabel="Pending" onClick={() => applyCardFilter("v-scheduled-today")} active={cardFilter === "v-scheduled-today"} />
          <MetricCard glassSurface="mint" icon={CheckCheck} value={completedToday} label="Completed Today" sublabel="Done" onClick={() => applyCardFilter("v-completed-today")} active={cardFilter === "v-completed-today"} />
          <MetricCard glassSurface="rose" icon={AlertCircle} value={missedVisits} label="Missed Visits" sublabel="Overdue" onClick={() => applyCardFilter("v-missed")} active={cardFilter === "v-missed"} />
        </div>
      </section>

      {/* Demos (pipeline substatus) */}
      <section>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary/75 mb-2">Demos</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard glassSurface="sky" icon={Monitor} value={demoPipeScheduled} label="Scheduled" sublabel="Main status · Demo" onClick={() => applyCardFilter("d-scheduled")} active={cardFilter === "d-scheduled"} />
          <MetricCard glassSurface="mint" icon={CheckCheck} value={demoPipeCompleted} label="Completed" sublabel="Main status · Demo" onClick={() => applyCardFilter("d-completed")} active={cardFilter === "d-completed"} />
          <MetricCard glassSurface="cerulean" icon={CalendarCheck} value={demoPipeRescheduled} label="Rescheduled" sublabel="Main status · Demo" onClick={() => applyCardFilter("d-rescheduled")} active={cardFilter === "d-rescheduled"} />
        </div>
      </section>

      {/* Mobile toolbar (search + filter sheet + add) */}
      <div ref={filterToolbarRef} className="md:hidden flex items-center gap-2 scroll-mt-[5.5rem]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-11" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 w-11 p-0 shrink-0" aria-label="Filters">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Source</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="All Sources" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={status} onValueChange={setStatusF}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{leadStatusDisplay(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Lead Potential</label>
                <Select value={potential} onValueChange={setPotential}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="All Potential" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Potential</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Assigned Salesperson</label>
                <Select value={assigned} onValueChange={setAssigned}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="All Sales" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sales</SelectItem>
                    {SALES_PEOPLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 px-3 py-3 rounded-md border border-border cursor-pointer hover:bg-secondary text-sm min-h-[44px]">
                <Checkbox checked={dueToday} onCheckedChange={(v) => setDueToday(!!v)} />
                Due Today
              </label>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={clearAll} className="h-11 flex-1">Clear all</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Button onClick={() => setAddOpen(true)} className="h-11 w-11 p-0 shrink-0" aria-label="Add lead">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex rounded-xl border border-border bg-card p-3 flex-wrap items-center gap-2 scroll-mt-[5.5rem]">
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
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {leadStatusDisplay(s)}
              </SelectItem>
            ))}
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
        <Button variant="outline" onClick={clearAll} className="gap-2 ml-auto">Clear Filters</Button>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Manual Lead
        </Button>
      </div>

      {/* Visit filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Visits:</span>
        {([
          { k: "all", label: "All" },
          { k: "today", label: "Today's Visits" },
          { k: "upcoming", label: "Upcoming" },
          { k: "missed", label: "Missed" },
          { k: "completed", label: "Completed" },
        ] as const).map((c) => (
          <button
            key={c.k}
            onClick={() => setVisitFilter(c.k)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              visitFilter === c.k
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-secondary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Mobile lead cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No leads match your filters.
          </div>
        )}
        {filtered.map((l) => {
          const v = nextVisit(l);
          return (
            <div key={l.id} className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate">{l.name}</div>
                  <div className="text-sm text-foreground/80 truncate">{l.business}</div>
                  <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-xs text-primary mt-0.5">
                    <Phone className="h-3 w-3" /> {l.phone}
                  </a>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-11 w-11 shrink-0" aria-label="Actions">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover">
                    <DropdownMenuItem onClick={() => setEditLead(l)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setVisitDialog({ open: true, lead: l })}>
                      <MapPin className="h-4 w-4 mr-2" /> Schedule Visit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setStatusDialog({ open: true, lead: l, initial: "Contacted", initialSubstatus: "Follow-up Pending", title: "Schedule Follow-up" })
                      }
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Follow-up
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => setStatusDialog({ open: true, lead: l, editLastMode: true, title: "Edit Last Status" })}
                      >
                        <History className="h-4 w-4 mr-2" /> Edit Last Status
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setStatusDialog({ open: true, lead: l, initial: "Converted", initialSubstatus: "Monthly Plan", title: "Mark Sale Done" })
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Mark Sale Done
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setStatusDialog({ open: true, lead: l, initial: "Lost", initialSubstatus: "Not Interested", title: "Mark Lost" })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2 text-destructive" /> Mark Lost
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={statusColor[l.status]}>{leadStatusDisplay(l.status)}</Badge>
                {l.substatus && (
                  <span className="text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{l.substatus}</span>
                )}
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <dt className="text-muted-foreground">Assigned</dt>
                <dd className="text-foreground text-right truncate">{l.assignedTo}</dd>
                <dt className="text-muted-foreground">Next follow-up</dt>
                <dd className="text-foreground text-right">{l.nextFollowUp ? format(new Date(l.nextFollowUp), "dd MMM") : "—"}</dd>
                <dt className="text-muted-foreground">Next visit</dt>
                <dd className="text-foreground text-right">
                  {v ? (isToday(new Date(v.date)) ? <span className="text-warning font-medium">Today</span> : format(new Date(v.date), "dd MMM")) : "—"}
                </dd>
              </dl>

              <Button
                className="mt-4 w-full h-11"
                onClick={() => setStatusDialog({ open: true, lead: l, title: "Change Status" })}
              >
                Change Status
              </Button>
            </div>
          );
        })}
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
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
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-foreground leading-tight">{l.business}</div>
                        {(l.businessType || l.outletAddress) && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {[l.businessType, l.outletAddress].filter(Boolean).join(" – ")}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4"><Badge variant="outline" className={info}>{l.source}</Badge></td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={statusColor[l.status]}>{leadStatusDisplay(l.status)}</Badge>
                          {l.substatus && <span className="text-[11px] text-muted-foreground">{l.substatus}</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {l.nextFollowUp ? format(new Date(l.nextFollowUp), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {v ? (isToday(new Date(v.date)) ? <span className="text-warning font-medium">Today · {format(new Date(v.date), "dd MMM")}</span> : format(new Date(v.date), "dd MMM yyyy")) : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {v ? (
                          <Badge variant="outline" className={
                            isToday(new Date(v.date))
                              ? "bg-warning-soft text-warning border-warning/30"
                              : v.status === "Completed" ? "bg-success-soft text-success border-success/30"
                              : v.status === "Missed" ? "bg-destructive/10 text-destructive border-destructive/30"
                              : "bg-info-soft text-info border-info/30"
                          }>
                            {isToday(new Date(v.date)) && v.status === "Scheduled" ? "Today" : v.status}
                          </Badge>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 pr-4">{l.assignedTo}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() =>
                              setStatusDialog({ open: true, lead: l, title: "Change Status" })
                            }
                          >
                            Change Status
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-popover">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditLead(l);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" /> Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setVisitDialog({ open: true, lead: l })}>
                                <MapPin className="h-4 w-4 mr-2" /> Schedule Visit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    lead: l,
                                    initial: "Contacted",
                                    initialSubstatus: "Follow-up Pending",
                                    title: "Schedule Follow-up",
                                  })
                                }
                              >
                                <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Follow-up
                              </DropdownMenuItem>
                              {isAdmin && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    setStatusDialog({ open: true, lead: l, editLastMode: true, title: "Edit Last Status" })
                                  }
                                >
                                  <History className="h-4 w-4 mr-2" /> Edit Last Status
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    lead: l,
                                    initial: "Converted",
                                    initialSubstatus: "Monthly Plan",
                                    title: "Mark Sale Done",
                                  })
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Mark Sale Done
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    lead: l,
                                    initial: "Lost",
                                    initialSubstatus: "Not Interested",
                                    title: "Mark Lost",
                                  })
                                }
                              >
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
                              <BillingCard lead={l} onOpen={() => setBillingDialog({ open: true, lead: l })} />
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

      <AddLeadDialog
        open={addOpen || editLead !== null}
        onOpenChange={(v) => {
          if (!v) {
            setAddOpen(false);
            setEditLead(null);
          }
        }}
        editingLead={editLead}
      />
      <StatusUpdateDialog
        open={statusDialog.open}
        onOpenChange={(v) =>
          setStatusDialog((s) => ({ ...s, open: v, lead: v ? s.lead : null }))
        }
        lead={statusDialog.lead}
        initialStatus={statusDialog.initial}
        initialSubstatus={statusDialog.initialSubstatus}
        title={statusDialog.title}
        editLastMode={statusDialog.editLastMode}
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
