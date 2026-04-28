import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

const data = [
  { bucket: "0–10 Days", leads: 10 },
  { bucket: "10–25 Days", leads: 25 },
  { bucket: "25+ Days", leads: 20 },
];

export function ConversionCycleChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold">Lead to Sale Conversion Cycle</h3>
          <p className="text-sm text-muted-foreground">How long leads take to convert into paid clients.</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
          <div className="text-xs text-muted-foreground">Average Cycle</div>
          <div className="text-xl font-bold text-primary">14 Days</div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="leads" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.55)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
