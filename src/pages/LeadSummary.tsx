import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Users, CreditCard, Hourglass, Flame, AlertTriangle, CalendarX,
  Megaphone, PhoneCall, Monitor, CheckCircle2, XCircle,
  Briefcase, ArrowUpRight, Target, IndianRupee, ListChecks, CalendarClock, AlarmClock, CheckCheck,
  Store, CircleDot, Gift, CalendarIcon, TrendingUp, TrendingDown,
  MapPin, CalendarPlus, CheckCircle, AlertOctagon
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesFunnel } from "@/components/dashboard/SalesFunnel";
import { TrialPipeline } from "@/components/dashboard/TrialPipeline";
import { UpcomingFollowUps } from "@/components/dashboard/UpcomingFollowUps";
import { ClientActivityMonitor } from "@/components/dashboard/ClientActivityMonitor";
import { ConversionCycleChart } from "@/components/dashboard/ConversionCycleChart";
import { LeadStageBreakdown } from "@/components/dashboard/LeadStageBreakdown";
import { DrillDownDrawer } from "@/components/dashboard/DrillDownDrawer";
import { ClientsList } from "@/components/dashboard/ClientsList";
import { SalesBreakdown } from "@/components/dashboard/SalesBreakdown";
import { FollowUpsList } from "@/components/dashboard/FollowUpsList";
import { ClientStatus } from "@/lib/clientsData";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type ClientFilter = ClientStatus | "All" | "Active";
type SalesFilter = "Closed" | "TrialToPaid" | "Conversion" | "MRR";
type FollowFilter = "All" | "Today" | "Missed" | "Completed";
type RangeTab = "today" | "month" | "year" | "all";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

// KPI data per tab
const KPI_DATA: Record<RangeTab, { leads: string; sales: string; conv: string; rev: string }> = {
  today: { leads: "8", sales: "2", conv: "25%", rev: "₹4.2K" },
  month: { leads: "124", sales: "9", conv: "60%", rev: "₹36K" },
  year: { leads: "1,420", sales: "112", conv: "55%", rev: "₹4.8L" },
  all: { leads: "3,260", sales: "284", conv: "52%", rev: "₹12.6L" },
};

export default function LeadSummary() {
  const navigate = useNavigate();
  
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

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

      {/* Top KPI grouped sections (compact) */}
      <div className="space-y-2">
      {(["today", "month", "year", "all"] as RangeTab[]).map((rt) => {
        const k = KPI_DATA[rt];
        const titles: Record<RangeTab, string> = {
          today: "Today", month: "This Month", year: "This Year", all: "All Time",
        };
        const suffix = rt === "today" ? " (Today)" : "";
        return (
          <section key={rt}>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titles[rt]}</h2>
              {rt === "month" && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-6 w-[120px] bg-background text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {rt === "year" && (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-6 w-[100px] bg-background text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {rt === "all" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-6 w-[210px] justify-start text-left font-normal text-xs", !customRange && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {customRange?.from ? (
                        customRange.to ? `${format(customRange.from, "LLL d, y")} - ${format(customRange.to, "LLL d, y")}` : format(customRange.from, "LLL d, y")
                      ) : "Pick a date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={customRange} onSelect={setCustomRange} numberOfMonths={2} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MetricCard compact variant="soft" icon={Megaphone} value={k.leads} label={`Total Leads${suffix}`}
                onClick={() => goLeads("all")} />
              <MetricCard compact variant="soft" icon={Briefcase} value={k.sales} label={`Total Sales${suffix}`}
                sublabel={`${k.conv} Conversion`}
                onClick={() => openSales("Closed", "Closed Sales")} />
              <MetricCard compact variant="soft" icon={IndianRupee} value={k.rev} label={`Revenue${suffix}`}
                onClick={() => openSales("MRR", "Revenue Breakdown")} />
            </div>
          </section>
        );
      })}
      </div>

      {/* LEADS (moved to top) */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Leads with hot/cold breakdown */}
          <button
            type="button"
            onClick={() => goLeads("all")}
            className="w-full text-left rounded-xl border border-border bg-card p-4 transition-all hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:border-primary/40 cursor-pointer"
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
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
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

      {/* VISITS */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard variant="soft" icon={MapPin} value={5} label="Total Visits Today" sublabel="All types" />
          <MetricCard icon={CalendarPlus} value={3} label="Visits Scheduled Today" sublabel="Planned" />
          <MetricCard icon={CheckCircle} value={2} label="Visits Completed Today" sublabel="Done" />
          <MetricCard variant="danger" icon={AlertOctagon} value={1} label="Missed Visits" sublabel="Action needed" />
        </div>
      </section>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* PRODUCT METRICS */}
      <section>
        <div className="section-label">Product Metrics</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard variant="soft" icon={Store} value={42} label="Total Outlets" sublabel="Across all clients" />
          <MetricCard variant="soft" icon={CircleDot} value={28} label="Total Wheels" sublabel="Active campaigns" />
          <MetricCard variant="soft" icon={Gift} value="3.2K" label="Total Loyalty Cards" sublabel="Issued" />
        </div>
      </section>

      {/* SALES */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label !mb-0">Sales</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard variant="soft" icon={Briefcase} value={3} label="Closed Sales" sublabel="This month"
            onClick={() => openSales("Closed", "Closed Sales")} />
          <MetricCard variant="soft" icon={ArrowUpRight} value={6} label="Trial → Paid" sublabel="This month"
            onClick={() => openSales("TrialToPaid", "Trial → Paid Conversions")} />
          <MetricCard variant="soft" icon={Target} value="60%" label="Conversion Rate" sublabel="This month"
            onClick={() => openSales("Conversion", "Conversion Rate Breakdown")} />
          <MetricCard variant="soft" icon={IndianRupee} value="₹36K" label="Monthly Recurring Revenue" sublabel="This month"
            onClick={() => openSales("MRR", "Monthly Recurring Revenue")} />
        </div>
      </section>

      {/* FOLLOW-UPS */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* Funnels */}
      <section>
        <div className="section-label">Funnels</div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Sales Funnel</h3>
                <p className="text-sm text-muted-foreground">Leads moving toward paid accounts.</p>
              </div>
              <span className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1 rounded-full">April</span>
            </div>
            <SalesFunnel />
          </div>
          <TrialPipeline />
        </div>
      </section>

      {/* Activity + Follow-ups list */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ClientActivityMonitor />
        </div>
        <UpcomingFollowUps />
      </section>

      {/* Analytics */}
      <section>
        <div className="section-label">Analytics</div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ConversionCycleChart />
          <LeadStageBreakdown />
        </div>
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
