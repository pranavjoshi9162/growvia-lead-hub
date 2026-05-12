import { useState } from "react";
import { format } from "date-fns";
import {
  Users, MapPin, Monitor, Hourglass, CheckCircle2, XCircle,
  LayoutGrid, LineChart as LineChartIcon, Calendar as CalendarIcon,
} from "lucide-react";
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

type RangeKey = "today" | "month" | "fy" | "all";
type View = "kpi" | "graph";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const FYS = ["FY 2026-27","FY 2025-26","FY 2024-25","FY 2023-24"];

// ---- Stage palette (glassmorphic soft) ----
type StageKey = "leads" | "visits" | "demo" | "trial" | "sales" | "lost";
const STAGES: Record<StageKey, {
  label: string; icon: any; bg: string; border: string; iconBg: string; accent: string; progress: string; chart: string;
}> = {
  leads:  { label: "Leads",  icon: Users,        bg: "#FFF8E8", border: "#F6D58B", iconBg: "#FFE7B3", accent: "#B45309", progress: "#F59E0B", chart: "#F59E0B" },
  visits: { label: "Visits", icon: MapPin,       bg: "#F0F9FF", border: "#BAE6FD", iconBg: "#DDF2FF", accent: "#0369A1", progress: "#10B981", chart: "#0EA5E9" },
  demo:   { label: "Demo",   icon: Monitor,      bg: "#FFF1E8", border: "#FFCBA8", iconBg: "#FFE0CC", accent: "#D65A00", progress: "#F97316", chart: "#FB7C2D" },
  trial:  { label: "Trial",  icon: Hourglass,    bg: "#EEF2FF", border: "#C7D2FE", iconBg: "#DDE5FF", accent: "#304FFE", progress: "#4361EE", chart: "#4F6BFF" },
  sales:  { label: "Sales",  icon: CheckCircle2, bg: "#ECFDF5", border: "#BBF7D0", iconBg: "#D1FAE5", accent: "#047857", progress: "#10B981", chart: "#10B981" },
  lost:   { label: "Lost",   icon: XCircle,      bg: "#FFF1F2", border: "#FECDD3", iconBg: "#FFE4E6", accent: "#BE123C", progress: "#F43F5E", chart: "#F43F5E" },
};

// ---- KPI dataset per range ----
type Sub = { label: string; value: string | number };
type Card = {
  stage: StageKey;
  main: string;
  subs: Sub[];
  target?: number | string;
  pct?: number; // 0..100
  noProgress?: boolean;
};

const KPI: Record<RangeKey, Card[]> = {
  today: [
    { stage: "leads",  main: "8",  subs: [{label:"Hot",value:3},{label:"Cold",value:2},{label:"Follow-up",value:3}], target: 15, pct: 53 },
    { stage: "visits", main: "5",  subs: [{label:"Scheduled",value:3},{label:"Completed",value:2},{label:"Missed",value:1}], target: 8, pct: 63 },
    { stage: "demo",   main: "4",  subs: [{label:"Scheduled",value:2},{label:"Completed",value:2},{label:"Missed",value:1}], target: 6, pct: 67 },
    { stage: "trial",  main: "3",  subs: [{label:"Active",value:2},{label:"Expired",value:1}], target: 5, pct: 60 },
    { stage: "sales",  main: "4 / ₹4.2K", subs: [{label:"Monthly",value:"4 / ₹4.2K"},{label:"Yearly",value:"0 / ₹0"}], target: "₹6K", pct: 70 },
    { stage: "lost",   main: "2",  subs: [{label:"Revenue Lost",value:"₹1.8K"}], noProgress: true },
  ],
  month: [
    { stage: "leads",  main: "124", subs: [{label:"Hot",value:48},{label:"Cold",value:32},{label:"Follow-up",value:44}], target: 150, pct: 83 },
    { stage: "visits", main: "86",  subs: [{label:"Scheduled",value:28},{label:"Completed",value:52},{label:"Missed",value:6}], target: 100, pct: 86 },
    { stage: "demo",   main: "42",  subs: [{label:"Scheduled",value:12},{label:"Completed",value:26},{label:"Missed",value:4}], target: 50, pct: 84 },
    { stage: "trial",  main: "18",  subs: [{label:"Active",value:12},{label:"Expired",value:6}], target: 25, pct: 72 },
    { stage: "sales",  main: "9 / ₹36K", subs: [{label:"Monthly",value:"9 / ₹36K"},{label:"Yearly",value:"0 / —"}], target: "₹50K", pct: 72 },
    { stage: "lost",   main: "14",  subs: [{label:"Revenue Lost",value:"₹12K"}], noProgress: true },
  ],
  fy: [
    { stage: "leads",  main: "1,420", subs: [{label:"Hot",value:480},{label:"Cold",value:360},{label:"Follow-up",value:580}], target: 1800, pct: 79 },
    { stage: "visits", main: "960",   subs: [{label:"Scheduled",value:220},{label:"Completed",value:680},{label:"Missed",value:60}], target: 1200, pct: 80 },
    { stage: "demo",   main: "420",   subs: [{label:"Scheduled",value:80},{label:"Completed",value:310},{label:"Missed",value:30}], target: 500, pct: 84 },
    { stage: "trial",  main: "188",   subs: [{label:"Active",value:96},{label:"Expired",value:92}], target: 250, pct: 75 },
    { stage: "sales",  main: "38 / ₹4.8L", subs: [{label:"Monthly",value:"0 / —"},{label:"Yearly",value:"38 / ₹4.8L"}], target: "₹6L", pct: 80 },
    { stage: "lost",   main: "124",   subs: [{label:"Revenue Lost",value:"₹98K"}], noProgress: true },
  ],
  all: [
    { stage: "leads",  main: "3,260", subs: [{label:"Hot",value:1100},{label:"Cold",value:820},{label:"Follow-up",value:1340}], target: 4000, pct: 81 },
    { stage: "visits", main: "2,180", subs: [{label:"Scheduled",value:520},{label:"Completed",value:1540},{label:"Missed",value:120}], target: 2500, pct: 87 },
    { stage: "demo",   main: "980",   subs: [{label:"Scheduled",value:160},{label:"Completed",value:740},{label:"Missed",value:80}], target: 1200, pct: 82 },
    { stage: "trial",  main: "420",   subs: [{label:"Active",value:210},{label:"Expired",value:210}], target: 500, pct: 84 },
    { stage: "sales",  main: "284 / ₹12.6L", subs: [{label:"Monthly",value:"—"},{label:"Yearly",value:"284 / ₹12.6L"}], target: "₹15L", pct: 84 },
    { stage: "lost",   main: "318",   subs: [{label:"Revenue Lost",value:"₹2.1L"}], noProgress: true },
  ],
};

const TITLES: Record<RangeKey, string> = {
  today: "Today", month: "This Month", fy: "Financial Year", all: "All Time",
};

// ---- Graph datasets ----
const TODAY_GRAPH = ["9a","11a","1p","3p","5p","7p"].map((h, i) => ({
  label: h, leads: [2,3,4,5,6,8][i], visits: [1,2,2,3,4,5][i], demo: [0,1,2,3,3,4][i],
  trial: [0,1,1,2,3,3][i], sales: [0,0,1,2,3,4][i], lost: [0,0,1,1,2,2][i],
}));
const MONTH_GRAPH = [
  { label: "Wk 1", leads: 28, visits: 18, demo: 9,  trial: 4, sales: 2, revenue: 8,  lost: 3 },
  { label: "Wk 2", leads: 34, visits: 22, demo: 11, trial: 5, sales: 3, revenue: 12, lost: 4 },
  { label: "Wk 3", leads: 31, visits: 24, demo: 12, trial: 5, sales: 2, revenue: 9,  lost: 3 },
  { label: "Wk 4", leads: 31, visits: 22, demo: 10, trial: 4, sales: 2, revenue: 7,  lost: 4 },
];
const FY_GRAPH = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m, i) => ({
  label: m,
  leads: [110,138,152,168,160,175,182,170,165,150,142,158][i],
  visits: [70,92,105,118,112,125,130,118,116,108,98,110][i],
  demo: [38,46,52,58,55,62,65,58,56,50,46,52][i],
  trial: [16,20,24,26,24,28,30,26,25,22,20,24][i],
  sales: [6,8,9,12,10,13,15,12,11,9,8,10][i],
  lost: [10,12,14,15,13,16,18,15,14,12,11,13][i],
}));
const ALL_GRAPH = [
  { label: "2022", leads: 820,  visits: 540, demo: 240, trial: 120, sales: 64,  lost: 80 },
  { label: "2023", leads: 1080, visits: 720, demo: 320, trial: 160, sales: 88,  lost: 110 },
  { label: "2024", leads: 1320, visits: 880, demo: 410, trial: 200, sales: 110, lost: 130 },
  { label: "2025", leads: 1540, visits: 1020,demo: 480, trial: 230, sales: 138, lost: 150 },
  { label: "2026", leads: 1420, visits: 960, demo: 420, trial: 188, sales: 112, lost: 124 },
];

function FunnelCard({ card }: { card: Card }) {
  const s = STAGES[card.stage];
  const Icon = s.icon;
  return (
    <div
      className="rounded-2xl border p-3.5 flex flex-col gap-2.5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
      style={{
        background: `linear-gradient(160deg, ${s.bg} 0%, rgba(255,255,255,0.55) 100%)`,
        borderColor: s.border,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.accent }}>{s.label}</div>
          <div className="text-[20px] leading-tight font-bold tracking-tight text-foreground mt-0.5 truncate">{card.main}</div>
        </div>
        <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0" style={{ background: s.iconBg, color: s.accent }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Subs */}
      <div className="space-y-1">
        {card.subs.map((sub) => (
          <div key={sub.label} className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{sub.label}</span>
            <span className="font-semibold text-foreground tabular-nums">{sub.value}</span>
          </div>
        ))}
      </div>

      {/* Progress (skip for lost) */}
      {!card.noProgress && card.pct !== undefined && (
        <div className="mt-auto pt-1">
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: `${s.progress}22` }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${card.pct}%`, background: s.progress }} />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px]">
            <span className="text-muted-foreground">Target {card.target}</span>
            <span className="font-bold" style={{ color: s.accent }}>{card.pct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SalesFunnelOverview() {
  const [view, setView] = useState<View>("kpi");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [fy, setFy] = useState(FYS[0]);
  const [allRange, setAllRange] = useState<DateRange | undefined>();

  // Graph state
  const [graphRange, setGraphRange] = useState<RangeKey>("month");
  const [show, setShow] = useState<Record<StageKey, boolean>>({
    leads: true, visits: true, demo: false, trial: false, sales: true, lost: false,
  });
  const data = graphRange === "today" ? TODAY_GRAPH
             : graphRange === "month" ? MONTH_GRAPH
             : graphRange === "fy" ? FY_GRAPH : ALL_GRAPH;

  return (
    <section
      className="rounded-2xl border p-5 backdrop-blur-md"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(250,250,255,0.5) 100%)",
        borderColor: "hsl(var(--border))",
        boxShadow: "0 4px 24px -16px rgba(0,0,0,0.08)",
      }}
    >
      {/* Top header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold">Business Overview</h2>
          <p className="text-sm text-muted-foreground">End-to-end sales funnel performance.</p>
        </div>
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-secondary/70 backdrop-blur">
          <button onClick={() => setView("kpi")}
            className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              view === "kpi" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <LayoutGrid className="h-3.5 w-3.5" /> KPI View
          </button>
          <button onClick={() => setView("graph")}
            className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              view === "graph" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <LineChartIcon className="h-3.5 w-3.5" /> Graph View
          </button>
        </div>
      </div>

      {view === "kpi" ? (
        <div className="space-y-5">
          {(["today","month","fy","all"] as RangeKey[]).map((rk) => (
            <div key={rk}>
              <div className="flex items-center gap-2 mb-2.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary">{TITLES[rk]}</h3>
                {rk === "month" && (
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-6 w-[110px] bg-background/70 backdrop-blur text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                {rk === "fy" && (
                  <Select value={fy} onValueChange={setFy}>
                    <SelectTrigger className="h-6 w-[130px] bg-background/70 backdrop-blur text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{FYS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                {rk === "all" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn("h-6 w-[200px] justify-start text-left font-normal text-xs bg-background/70", !allRange && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {allRange?.from ? (allRange.to
                          ? `${format(allRange.from, "LLL d, y")} - ${format(allRange.to, "LLL d, y")}`
                          : format(allRange.from, "LLL d, y")) : "Date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="range" selected={allRange} onSelect={setAllRange} numberOfMonths={2} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 auto-rows-fr">
                {KPI[rk].map((c) => <FunnelCard key={c.stage} card={c} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Chip filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(Object.keys(STAGES) as StageKey[]).map((k) => {
                const s = STAGES[k];
                const on = show[k];
                return (
                  <Toggle key={k} pressed={on} onPressedChange={(v) => setShow((p) => ({ ...p, [k]: v }))} size="sm"
                    className="h-7 px-2.5 text-xs rounded-full border data-[state=on]:shadow-sm"
                    style={on ? { background: `${s.chart}1A`, color: s.accent, borderColor: `${s.chart}55` }
                              : { background: "transparent", borderColor: "hsl(var(--border))" }}>
                    <span className="h-2 w-2 rounded-full mr-1.5" style={{ background: s.chart }} /> {s.label}
                  </Toggle>
                );
              })}
            </div>
            <div className="inline-flex rounded-md border border-border p-0.5 bg-secondary/70 backdrop-blur">
              {(["today","month","fy","all"] as RangeKey[]).map((r) => (
                <button key={r} onClick={() => setGraphRange(r)}
                  className={cn("px-2.5 py-1 rounded text-[11px] font-medium",
                    graphRange === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                  {r === "today" ? "Today" : r === "month" ? "Month" : r === "fy" ? "FY" : "All"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  {(Object.keys(STAGES) as StageKey[]).map((k) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={STAGES[k].chart} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={STAGES[k].chart} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12, fontSize: 12,
                  boxShadow: "0 8px 24px -8px rgba(0,0,0,0.12)",
                }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(Object.keys(STAGES) as StageKey[]).map((k) =>
                  show[k] ? (
                    <Area key={k} type="monotone" dataKey={k} name={STAGES[k].label}
                      stroke={STAGES[k].chart} strokeWidth={2.2} fill={`url(#g-${k})`} />
                  ) : null
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
