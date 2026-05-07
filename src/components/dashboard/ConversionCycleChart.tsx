import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cycleData = [
  { bucket: "0–10 Days", leads: 10, color: "hsl(var(--success))", soft: "hsl(var(--success-soft))" },
  { bucket: "10–25 Days", leads: 25, color: "hsl(var(--primary))", soft: "hsl(var(--primary-soft))" },
  { bucket: "25+ Days", leads: 20, color: "hsl(var(--destructive))", soft: "hsl(0 80% 96%)" },
];

const max = Math.max(...cycleData.map((d) => d.leads));

export function ConversionCycleChart() {
  const [range, setRange] = useState("month");
  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <h3 className="text-base font-semibold">Lead to Client Conversion Cycle</h3>
            <p className="text-sm text-muted-foreground">How long leads take to convert into paid clients.</p>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-7 w-[130px] bg-background text-xs ml-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <div>
            <div className="text-[11px] text-muted-foreground leading-tight">Average Cycle</div>
            <div className="text-base font-bold text-primary leading-tight">14 Days</div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {cycleData.map((d) => (
          <div key={d.bucket}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-sm font-medium">{d.bucket}</div>
              <div className="text-sm font-semibold tabular-nums">
                {d.leads} <span className="text-muted-foreground font-normal">leads</span>
              </div>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: d.soft }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(d.leads / max) * 100}%`, background: d.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(var(--success))" }} /> Fast cycle
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Healthy cycle
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(var(--destructive))" }} /> Stalled
        </div>
      </div>
    </div>
  );
}
