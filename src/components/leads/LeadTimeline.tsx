import { Lead, LeadStatus } from "@/lib/sampleData";
import { format } from "date-fns";
import { Check, Circle } from "lucide-react";

const FLOW: LeadStatus[] = ["Pending", "Contacted", "Follow Up", "Demo Scheduled", "Demo Given", "Qualified", "Converted"];

export function LeadTimeline({ lead }: { lead: Lead }) {
  // map last entry per status from timeline
  const byStatus = new Map<string, typeof lead.timeline[number]>();
  lead.timeline.forEach((t) => byStatus.set(t.status, t));

  const reachedIdx = Math.max(...FLOW.map((s, i) => (byStatus.has(s) ? i : -1)));

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold mb-3">Lead Timeline</div>
      <div className="relative">
        {FLOW.map((stage, i) => {
          const entry = byStatus.get(stage);
          const reached = i <= reachedIdx;
          const isCurrent = i === reachedIdx;
          return (
            <div key={stage} className="flex gap-4 pb-5 last:pb-0 relative">
              {i < FLOW.length - 1 && (
                <span className={`absolute left-[14px] top-7 bottom-0 w-px ${reached ? "bg-primary/40" : "bg-border"}`} />
              )}
              <div className={`relative h-7 w-7 rounded-full grid place-items-center shrink-0 ${
                reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              } ${isCurrent ? "ring-4 ring-primary/15" : ""}`}>
                {reached ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-medium text-sm">{stage}</div>
                  {entry && (
                    <div className="text-xs text-muted-foreground">{format(new Date(entry.timestamp), "dd MMM yyyy, HH:mm")}</div>
                  )}
                </div>
                {entry?.substatus && <div className="text-xs text-primary mt-0.5">{entry.substatus}</div>}
                {entry?.notes && <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>}
                {entry?.followUpDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Follow-up: {format(new Date(entry.followUpDate), "dd MMM yyyy")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
