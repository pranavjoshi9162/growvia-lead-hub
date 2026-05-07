import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CreditCard, Hourglass, Flame, AlertTriangle, CalendarX,
  Megaphone, PhoneCall, Monitor, CheckCircle2, XCircle,
  ListChecks, CalendarClock, AlarmClock, CheckCheck,
  Store, CircleDot, Gift,
  TrendingUp, TrendingDown,
  MapPin, CalendarPlus, CheckCircle, AlertOctagon
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesFunnel } from "@/components/dashboard/SalesFunnel";
import { BusinessOverview } from "@/components/dashboard/BusinessOverview";
import { UpcomingFollowUps } from "@/components/dashboard/UpcomingFollowUps";
import { ClientActivityMonitor } from "@/components/dashboard/ClientActivityMonitor";
import { ConversionCycleChart } from "@/components/dashboard/ConversionCycleChart";
import { DrillDownDrawer } from "@/components/dashboard/DrillDownDrawer";
import { ClientsList } from "@/components/dashboard/ClientsList";
import { SalesBreakdown } from "@/components/dashboard/SalesBreakdown";
import { FollowUpsList } from "@/components/dashboard/FollowUpsList";
import { ClientStatus } from "@/lib/clientsData";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ClientFilter = ClientStatus | "All" | "Active";
type SalesFilter = "Closed" | "TrialToPaid" | "Conversion" | "MRR";
type FollowFilter = "All" | "Today" | "Missed" | "Completed";

export default function LeadSummary() {
  const navigate = useNavigate();

  const [clientDrawer, setClientDrawer] = useState<{ open: boolean; filter: ClientFilter; title: string }>({
    open: false, filter: "All", title: "",
  });
  const [salesDrawer, setSalesDrawer] = useState<{ open: boolean; filter: SalesFilter; title: string }>({
    open: false, filter: "Closed", title: "",
  });
  const [followDrawer, setFollowDrawer] = useState<{ open: boolean; filter: FollowFilter; title: string }>({
    open: false, filter: "All", title: "",
  });

  const goLeads = (filter: string) => navigate(`/leads?filter=${encodeURIComponent(filter)}`);
  const openClients = (filter: ClientFilter, title: string) => setClientDrawer({ open: true, filter, title });
  const openSales = (filter: SalesFilter, title: string) => setSalesDrawer({ open: true, filter, title });
  const openFollow = (filter: FollowFilter, title: string) => setFollowDrawer({ open: true, filter, title });

  return (
    <div className="space-y-5 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Sales & Lead Overview</div>
          <h1 className="text-2xl font-bold mt-1">Main Dashboard</h1>
        </div>
      </div>

      {/* 1. Business Overview (KPI / Graph) */}
      <BusinessOverview />

      {/* 2. LEADS */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label !mb-0">Leads</div>
          <Select defaultValue="this-month">
            <SelectTrigger className="h-7 w-[140px] bg-background text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
          <button
            type="button"
            onClick={() => goLeads("all")}
            className="h-full w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:border-primary/40 cursor-pointer flex flex-col"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-2xl font-bold tracking-tight text-foreground">124</div>
                <div className="text-sm font-medium text-foreground mt-1">Total Leads</div>
                <div className="text-xs text-muted-foreground mt-0.5">This month</div>
              </div>
              <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-secondary text-muted-foreground">
                <Megaphone className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-auto pt-3 border-t border-border grid grid-cols-2 gap-2">
              <div
                role="button"
                onClick={(e) => { e.stopPropagation(); goLeads("high"); }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-primary/5 cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <div>
                  <div className="text-sm font-semibold leading-none">48</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Hot Leads</div>
                </div>
              </div>
              <div
                role="button"
                onClick={(e) => { e.stopPropagation(); goLeads("low"); }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer"
              >
                <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-semibold leading-none">32</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Cold Leads</div>
                </div>
              </div>
            </div>
          </button>

          <MetricCard icon={PhoneCall} value={9} label="Follow-up Leads" sublabel="Awaiting"
            onClick={() => goLeads("follow-up")} />
          <MetricCard icon={CalendarClock} value={4} label="Demo Schedule" sublabel="This week"
            onClick={() => goLeads("demo-scheduled")} />
          <MetricCard icon={Monitor} value={7} label="Demo Done" sublabel="This month"
            onClick={() => goLeads("demo-given")} />
          <MetricCard icon={CheckCircle2} value={6} label="Sale Done" sublabel="Closed won"
            onClick={() => goLeads("converted")} />
          <MetricCard icon={XCircle} value={3} label="Closed - Dead" sublabel="Closed lost"
            onClick={() => goLeads("lost")} />
        </div>
      </section>

      {/* 3. CLIENTS */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label !mb-0">Clients</div>
          <Select defaultValue="this-month">
            <SelectTrigger className="h-7 w-[140px] bg-background text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 auto-rows-fr">
          <MetricCard variant="soft" icon={Users} value={18} label="Total Clients" sublabel="This month"
            onClick={() => openClients("All", "Total Clients")} />
          <MetricCard variant="soft" icon={CreditCard} value={11} label="Paid Clients" sublabel="This month"
            onClick={() => openClients("Paid", "Paid Clients")} />
          <MetricCard variant="soft" icon={Hourglass} value={7} label="Trial Clients" sublabel="Today"
            onClick={() => openClients("Trial", "Trial Clients")} />
          <MetricCard variant="warning" icon={Flame} value={3} label="Trial Expiring" sublabel="Next 7 days"
            onClick={() => openClients("TrialExpiring", "Trial Expiring Clients")} />
          <MetricCard variant="danger" icon={AlertTriangle} value={2} label="Payment Overdue" sublabel="Needs action"
            onClick={() => openClients("Overdue", "Payment Overdue Clients")} />
          <MetricCard variant="warning" icon={CalendarX} value={4} label="Plan Expiry" sublabel="This month"
            onClick={() => openClients("PlanExpiry", "Plan Expiry Clients")} />
        </div>
      </section>

      {/* 4. VISITS */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label !mb-0">Visits</div>
          <Select defaultValue="today">
            <SelectTrigger className="h-7 w-[140px] bg-background text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
          <MetricCard variant="soft" icon={MapPin} value={5} label="Total Visits Today" sublabel="All types" />
          <MetricCard icon={CalendarPlus} value={3} label="Visits Scheduled Today" sublabel="Planned" />
          <MetricCard icon={CheckCircle} value={2} label="Visits Completed Today" sublabel="Done" />
          <MetricCard variant="danger" icon={AlertOctagon} value={1} label="Missed Visits" sublabel="Action needed" />
        </div>
      </section>

      {/* 5. FOLLOW-UPS */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label !mb-0">Follow-ups</div>
          <Select defaultValue="this-month">
            <SelectTrigger className="h-7 w-[140px] bg-background text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
          <MetricCard icon={ListChecks} value={6} label="Total Follow-ups" sublabel="Open"
            onClick={() => openFollow("All", "Total Follow-ups")} />
          <MetricCard icon={CalendarClock} value={3} label="Today's Follow-ups" sublabel="Due today" variant="soft"
            onClick={() => openFollow("Today", "Today's Follow-ups")} />
          <MetricCard icon={AlarmClock} value={2} label="Missed Follow-ups" sublabel="Action needed" variant="danger"
            onClick={() => openFollow("Missed", "Missed Follow-ups")} />
          <MetricCard icon={CheckCheck} value={5} label="Completed Today" sublabel="Today"
            onClick={() => openFollow("Completed", "Completed Follow-ups Today")} />
        </div>
      </section>

      {/* 6. PRODUCT METRICS */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label !mb-0">Product Metrics</div>
          <Select defaultValue="this-month">
            <SelectTrigger className="h-7 w-[140px] bg-background text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
          <MetricCard variant="soft" icon={Store} value={42} label="Total Outlets" sublabel="Across all clients" />
          <MetricCard variant="soft" icon={CircleDot} value={28} label="Total Wheels" sublabel="Active campaigns" />
          <MetricCard variant="soft" icon={Gift} value="3.2K" label="Total Loyalty Cards" sublabel="Issued" />
        </div>
      </section>

      {/* 7. Funnels (Sales Funnel only, full width) */}
      <section>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold">Sales Funnel</h3>
              <p className="text-sm text-muted-foreground">Leads moving toward paid accounts.</p>
            </div>
            <Select defaultValue="month">
              <SelectTrigger className="h-7 w-[140px] bg-background text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SalesFunnel />
        </div>
      </section>

      {/* 8. Activity + Follow-ups list */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ClientActivityMonitor />
        </div>
        <UpcomingFollowUps />
      </section>

      {/* 9. Analytics — Conversion Cycle (full width, no Lead Stage Breakdown) */}
      <section>
        <ConversionCycleChart />
      </section>

      {/* Drawers */}
      <DrillDownDrawer
        open={clientDrawer.open}
        onOpenChange={(v) => setClientDrawer((s) => ({ ...s, open: v }))}
        title={clientDrawer.title}
        description="Filtered client list"
      >
        <ClientsList filter={clientDrawer.filter} />
      </DrillDownDrawer>

      <DrillDownDrawer
        open={salesDrawer.open}
        onOpenChange={(v) => setSalesDrawer((s) => ({ ...s, open: v }))}
        title={salesDrawer.title}
        description="Sales breakdown"
      >
        <SalesBreakdown filter={salesDrawer.filter} />
      </DrillDownDrawer>

      <DrillDownDrawer
        open={followDrawer.open}
        onOpenChange={(v) => setFollowDrawer((s) => ({ ...s, open: v }))}
        title={followDrawer.title}
        description="Follow-up activity"
      >
        <FollowUpsList filter={followDrawer.filter} />
      </DrillDownDrawer>
    </div>
  );
}
