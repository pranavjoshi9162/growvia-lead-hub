import { useState } from "react";
import { CLIENT_ACTIVITY } from "@/lib/sampleData";
import { Badge } from "@/components/ui/badge";

export function ClientActivityMonitor() {
  const [tab, setTab] = useState<"active" | "at-risk">("active");
  const rows = CLIENT_ACTIVITY.filter((c) => c.risk === tab)
    .sort((a, b) => (tab === "active" ? b.activityScore - a.activityScore : a.activityScore - b.activityScore));

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold">Client Activity Monitor</h3>
          <p className="text-sm text-muted-foreground">Engagement and revenue across active accounts.</p>
        </div>
        <div className="inline-flex rounded-lg bg-secondary p-1">
          {[
            { k: "active", l: "Top Active Clients" },
            { k: "at-risk", l: "At-Risk Clients" },
          ].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k as any)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${tab === t.k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 pr-4 font-medium">Client</th>
              <th className="py-2 pr-4 font-medium">Plan</th>
              <th className="py-2 pr-4 font-medium">Activity Score</th>
              <th className="py-2 pr-4 font-medium">Last Activity</th>
              <th className="py-2 pr-4 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.client} className="border-b border-border/60 last:border-0">
                <td className="py-3 pr-4 font-medium">{r.client}</td>
                <td className="py-3 pr-4">
                  <Badge variant="outline" className={r.plan === "Gold"
                    ? "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15"
                    : "border-muted-foreground/30 bg-secondary text-muted-foreground"}>
                    {r.plan}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${r.activityScore >= 60 ? "bg-success" : r.activityScore >= 40 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${r.activityScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold w-8">{r.activityScore}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{r.lastActivity}</td>
                <td className="py-3 pr-4 text-right font-semibold">₹{r.revenue.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
