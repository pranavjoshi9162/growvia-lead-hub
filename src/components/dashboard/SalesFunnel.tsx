import { Megaphone, Monitor, Hourglass, CheckCircle2 } from "lucide-react";

const stages = [
  { label: "Leads", value: 25, pct: 100, icon: Megaphone },
  { label: "Demos", value: 9, pct: 36, icon: Monitor },
  { label: "Trials", value: 5, pct: 56, icon: Hourglass },
  { label: "Paid Clients", value: 3, pct: 60, icon: CheckCircle2 },
];

export function SalesFunnel() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stages.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
              <s.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-primary">{s.pct}%</span>
          </div>
          <div className="mt-3 text-2xl font-bold">{s.value}</div>
          <div className="text-sm text-muted-foreground">{s.label}</div>
          <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
