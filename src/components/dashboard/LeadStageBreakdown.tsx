import { Megaphone, PhoneCall, Monitor, Hourglass, CheckCircle2 } from "lucide-react";

const stages = [
  { label: "Leads", value: 100, icon: Megaphone },
  { label: "Contacted", value: 70, icon: PhoneCall },
  { label: "Demo completed", value: 35, icon: Monitor },
  { label: "Trial", value: 15, icon: Hourglass },
  { label: "Sale Done", value: 8, icon: CheckCircle2 },
];

export function LeadStageBreakdown() {
  const top = stages[0].value;
  const overall = ((stages[stages.length - 1].value / top) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold">Lead Stage Conversion Breakdown</h3>
          <p className="text-sm text-muted-foreground">Drop-off at each pipeline stage.</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
          <div className="text-[11px] text-muted-foreground leading-tight">Overall Conversion</div>
          <div className="text-base font-bold text-primary leading-tight">{overall}%</div>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((s, i) => {
          const widthPct = (s.value / top) * 100;
          const prev = i === 0 ? s.value : stages[i - 1].value;
          const dropPct = i === 0 ? 100 : Math.round((s.value / prev) * 100);
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-32 shrink-0 flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-primary/10 grid place-items-center text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium truncate">{s.label}</span>
              </div>
              <div className="flex-1 relative h-9 rounded-lg bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(22 95% 62%) 100%)`,
                  }}
                >
                  <span className="text-xs font-semibold text-primary-foreground tabular-nums">{s.value}</span>
                </div>
              </div>
              <div className="w-16 shrink-0 text-right">
                <span className={`text-xs font-semibold tabular-nums ${i === 0 ? "text-muted-foreground" : dropPct >= 50 ? "text-success" : "text-destructive"}`}>
                  {dropPct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-[11px] text-muted-foreground">Biggest Drop-off</div>
          <div className="text-sm font-semibold mt-0.5">Demo → Trial</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-[11px] text-muted-foreground">Best Stage</div>
          <div className="text-sm font-semibold mt-0.5">Leads → Contacted (70%)</div>
        </div>
      </div>
    </div>
  );
}
