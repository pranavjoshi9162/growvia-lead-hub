import { useState } from "react";
import { Users, UserX, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RK = "month" | "quarter" | "year";

const DATA: Record<RK, { active: { m: number; y: number }; expired: { m: number; y: number }; expiring: number }> = {
  month:   { active: { m: 18, y: 84 }, expired: { m: 2, y: 11 }, expiring: 3 },
  quarter: { active: { m: 22, y: 84 }, expired: { m: 5, y: 11 }, expiring: 6 },
  year:    { active: { m: 26, y: 84 }, expired: { m: 9, y: 11 }, expiring: 9 },
};

export function ActiveClientCycle() {
  const [range, setRange] = useState<RK>("month");
  const d = DATA[range];

  const cards = [
    {
      title: "Total Active Clients", icon: Users, main: d.active.m + d.active.y,
      bg: "linear-gradient(160deg,#ECFDF5 0%, rgba(255,255,255,0.6) 100%)",
      border: "#BBF7D0", iconBg: "#D1FAE5", accent: "#047857",
      subs: [{ k: "Monthly", v: d.active.m }, { k: "Yearly", v: d.active.y }],
    },
    {
      title: "Expired Clients", icon: UserX, main: d.expired.m + d.expired.y,
      bg: "linear-gradient(160deg,#FFF1F2 0%, rgba(255,255,255,0.6) 100%)",
      border: "#FECDD3", iconBg: "#FFE4E6", accent: "#BE123C",
      subs: [{ k: "Monthly", v: d.expired.m }, { k: "Yearly", v: d.expired.y }],
    },
    {
      title: "Plan Expiry in 7 Days", icon: AlertTriangle, main: d.expiring,
      bg: "linear-gradient(160deg,#FFFBEB 0%, rgba(255,255,255,0.6) 100%)",
      border: "#FCD34D", iconBg: "#FEF3C7", accent: "#B45309",
      subs: [{ k: "Action needed", v: "Renew soon" }],
    },
  ];

  return (
    <section
      className="rounded-2xl border p-5 backdrop-blur-md"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(250,250,255,0.5) 100%)",
        borderColor: "hsl(var(--border))",
        boxShadow: "0 4px 24px -16px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold">Active Client Cycle</h2>
          <p className="text-sm text-muted-foreground">Live subscriptions and renewal pipeline.</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as RK)}>
          <SelectTrigger className="h-8 w-[140px] bg-background/70 backdrop-blur text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-fr">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] flex flex-col gap-3"
            style={{ background: c.bg, borderColor: c.border }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.accent }}>{c.title}</div>
                <div className="text-2xl font-bold tracking-tight mt-1">{c.main}</div>
              </div>
              <div className="h-9 w-9 rounded-lg grid place-items-center" style={{ background: c.iconBg, color: c.accent }}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              {c.subs.map((s) => (
                <div key={s.k} className="rounded-lg bg-white/60 backdrop-blur px-2.5 py-1.5 border border-white/80">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.k}</div>
                  <div className="text-sm font-semibold tabular-nums">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
