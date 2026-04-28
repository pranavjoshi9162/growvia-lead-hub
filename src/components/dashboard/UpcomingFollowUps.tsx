import { format } from "date-fns";
import { SAMPLE_LEADS } from "@/lib/sampleData";
import { Calendar } from "lucide-react";

export function UpcomingFollowUps() {
  const items = SAMPLE_LEADS
    .filter((l) => l.nextFollowUp)
    .sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime())
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold">Upcoming Follow-ups</h3>
          <p className="text-sm text-muted-foreground">Next scheduled touchpoints.</p>
        </div>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">{items.length} due</span>
      </div>
      <ul className="space-y-2">
        {items.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-secondary/40 transition">
            <div className="min-w-0">
              <div className="font-medium truncate">{l.name}</div>
              <div className="text-xs text-muted-foreground truncate">{l.business}</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(l.nextFollowUp!), "dd MMM")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
