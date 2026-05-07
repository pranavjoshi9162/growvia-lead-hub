import { useState } from "react";
import { format } from "date-fns";
import { LayoutGrid, LineChart as LineChartIcon, Calendar as CalendarIcon } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type RangeTab = "today" | "month" | "year" | "all";
type View = "kpi" | "graph";
type GraphRange = "month" | "year" | "all";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const KPI_DATA: Record<RangeTab, { leads: string; sales: string; conv: string; rev: string }> = {
  today: { leads: "8", sales: "2", conv: "25%", rev: "₹4.2K" },
  month: { leads: "124", sales: "9", conv: "60%", rev: "₹36K" },
  year: { leads: "1,420", sales: "112", conv: "55%", rev: "₹4.8L" },
  all: { leads: "3,260", sales: "284", conv: "52%", rev: "₹12.6L" },
};

const TITLES: Record<RangeTab, string> = {
  today: "Today", month: "This Month", year: "This Year", all: "All Time",
};

// Graph datasets keyed per range
const MONTH_DATA = [
  { label: "Wk 1", leads: 28, sales: 2, revenue: 8 },
  { label: "Wk 2", leads: 34, sales: 3, revenue: 12 },
  { label: "Wk 3", leads: 31, sales: 2, revenue: 9 },
  { label: "Wk 4", leads: 31, sales: 2, revenue: 7 },
];
const YEAR_DATA = [
  { label: "Jan", leads: 78, sales: 6, revenue: 18 },
  { label: "Feb", leads: 92, sales: 8, revenue: 22 },
  { label: "Mar", leads: 110, sales: 9, revenue: 28 },
  { label: "Apr", leads: 145, sales: 12, revenue: 38 },
  { label: "May", leads: 138, sales: 10, revenue: 34 },
  { label: "Jun", leads: 152, sales: 13, revenue: 42 },
  { label: "Jul", leads: 168, sales: 15, revenue: 48 },
];
const ALL_DATA = [
  { label: "2022", leads: 820, sales: 64, revenue: 220 },
  { label: "2023", leads: 1080, sales: 88, revenue: 320 },
  { label: "2024", leads: 1320, sales: 110, revenue: 410 },
  { label: "2025", leads: 1540, sales: 138, revenue: 520 },
  { label: "2026", leads: 1420, sales: 112, revenue: 480 },
];

export function BusinessOverview() {
  const [view, setView] = useState<View>("kpi");
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [graphRange, setGraphRange] = useState<GraphRange>("year");
  const [show, setShow] = useState({ leads: true, sales: true, revenue: true });

  const data = graphRange === "month" ? MONTH_DATA : graphRange === "year" ? YEAR_DATA : ALL_DATA;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold">Business {view === "graph" ? "Growth " : ""}Overview</h2>
          <p className="text-sm text-muted-foreground">Track leads, sales and revenue performance over time.</p>
        </div>
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-secondary">
          <button
            onClick={() => setView("kpi")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              view === "kpi" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> KPI View
          </button>
          <button
            onClick={() => setView("graph")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              view === "graph" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LineChartIcon className="h-3.5 w-3.5" /> Graph View
          </button>
        </div>
      </div>

      {view === "kpi" ? (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {(["today", "month", "year", "all"] as RangeTab[]).map((rt) => {
            const k = KPI_DATA[rt];
            return (
              <div key={rt} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-primary">{TITLES[rt]}</h3>
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
                <div className="grid grid-cols-3 divide-x divide-border rounded-md bg-soft-gradient">
                  <div className="px-4 py-2">
                    <div className="text-xl font-bold tracking-tight">{k.leads}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Leads</div>
                  </div>
                  <div className="px-4 py-2">
                    <div className="text-xl font-bold tracking-tight">{k.sales}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Sales</div>
                    <div className="text-[11px] font-semibold text-primary mt-0.5">{k.conv} Conversion</div>
                  </div>
                  <div className="px-4 py-2">
                    <div className="text-xl font-bold tracking-tight">{k.rev}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Revenue</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Toggle pressed={show.leads} onPressedChange={(v) => setShow((s) => ({ ...s, leads: v }))} size="sm" className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary h-7 px-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-primary mr-1.5" /> Leads
              </Toggle>
              <Toggle pressed={show.sales} onPressedChange={(v) => setShow((s) => ({ ...s, sales: v }))} size="sm" className="data-[state=on]:bg-info/10 data-[state=on]:text-info h-7 px-2 text-xs">
                <span className="h-2 w-2 rounded-full mr-1.5" style={{ background: "hsl(var(--info))" }} /> Sales
              </Toggle>
              <Toggle pressed={show.revenue} onPressedChange={(v) => setShow((s) => ({ ...s, revenue: v }))} size="sm" className="data-[state=on]:bg-success/10 data-[state=on]:text-success h-7 px-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-success mr-1.5" /> Revenue
              </Toggle>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-border p-0.5 bg-secondary">
                {(["month","year","all"] as GraphRange[]).map((r) => (
                  <button key={r} onClick={() => setGraphRange(r)}
                    className={cn(
                      "px-2.5 py-1 rounded text-[11px] font-medium",
                      graphRange === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    )}>
                    {r === "month" ? "Month" : r === "year" ? "Year" : "All Time"}
                  </button>
                ))}
              </div>
              {graphRange === "month" && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-7 w-[120px] bg-background text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {graphRange === "year" && (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-7 w-[100px] bg-background text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {graphRange === "all" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-7 w-[210px] justify-start text-left font-normal text-xs", !customRange && "text-muted-foreground")}>
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
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {show.leads && <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2.2} fill="url(#gLeads)" />}
                {show.sales && <Area type="monotone" dataKey="sales" stroke="hsl(var(--info))" strokeWidth={2.2} fill="url(#gSales)" />}
                {show.revenue && <Area type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2.2} fill="url(#gRev)" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
