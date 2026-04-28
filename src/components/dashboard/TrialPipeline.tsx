import { Hourglass, Flame, CheckCircle2, Clock } from "lucide-react";

const items = [
  { label: "Active Trials", sub: "Healthy pipeline", value: 7, icon: Hourglass, soft: false },
  { label: "Trials Expiring in 7 Days", sub: "Needs follow-up", value: 2, icon: Flame, soft: true },
  { label: "Converted Trials", sub: "This month", value: 6, icon: CheckCircle2, soft: false },
  { label: "Dropped Trials", sub: "Last 30 days", value: 1, icon: Clock, soft: false },
];

export function TrialPipeline() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <h3 className="text-base font-semibold">Trial Pipeline</h3>
      <p className="text-sm text-muted-foreground mb-4">Keep trials moving before they expire.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className={`rounded-xl border p-4 ${it.soft ? "border-primary/30 bg-[var(--gradient-soft)]" : "border-border"}`}>
            <div className="flex items-start justify-between">
              <div className={`h-8 w-8 rounded-lg grid place-items-center ${it.soft ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <it.icon className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold">{it.value}</span>
            </div>
            <div className="mt-3 text-sm font-medium">{it.label}</div>
            <div className="text-xs text-muted-foreground">{it.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
