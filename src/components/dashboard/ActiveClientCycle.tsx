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
      bg: "linear-gradient(160deg,#D1FAE5 0%, rgba(255,255,255,0.55) 100%)",
      border: "#6EE7B7", iconBg: "#A7F3D0", accent: "#047857",
      subs: [{ k: "Monthly", v: d.active.m }, { k: "Yearly", v: d.active.y }],
    },
    {
      title: "Expired Clients", icon: UserX, main: d.expired.m + d.expired.y,
      bg: "linear-gradient(160deg,#FFE4E6 0%, rgba(255,255,255,0.55) 100%)",
      border: "#FDA4AF", iconBg: "#FECDD3", accent: "#BE123C",
      subs: [{ k: "Monthly", v: d.expired.m }, { k: "Yearly", v: d.expired.y }],
    },
    {
      title: "Plan Expiry in 7 Days", icon: AlertTriangle, main: d.expiring,
      bg: "linear-gradient(160deg,#FEF3C7 0%, rgba(255,255,255,0.55) 100%)",
      border: "#FBBF24", iconBg: "#FDE68A", accent: "#B45309",
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
          <div className="section-label !mb-0 !text-foreground">Active Client Cycle</div>
          <p className="text-sm text-[#4B5563] mt-1">Live subscriptions and renewal pipeline.</p>
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
          <div
            key={c.title}
            className="rounded-2xl border p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] h-full min-h-[7rem] flex flex-col"
            style={{ background: c.bg, borderColor: c.border }}
          >
            <div className="flex items-start justify-between gap-2 flex-1 min-h-0">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground leading-snug">{c.title}</div>
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums mt-1">{c.main}</div>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {c.subs.map((s, i) => (
                    <span key={s.k} className="inline-flex items-baseline gap-1">
                      {i > 0 ? (
                        <span className="text-foreground/25 text-xs font-normal tabular-nums pr-1.5" aria-hidden>
                          ·
                        </span>
                      ) : null}
                      <span className="text-xs text-[#4B5563]">{s.k}</span>
                      <span className="text-sm font-semibold text-foreground tabular-nums">{s.v}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: c.iconBg, color: "#374151" }}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
