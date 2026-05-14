import { Lead, LeadStatus, leadStatusDisplay } from "@/lib/sampleData";
import { format } from "date-fns";
import { Check, Circle, Phone, MapPin, Monitor, FileText, Hourglass } from "lucide-react";

const FLOW: LeadStatus[] = [
  "New Lead",
  "Contacted",
  "Visit",
  "Demo",
  "Negotiation",
  "Trial",
  "Converted",
];

export function LeadTimeline({ lead }: { lead: Lead }) {
  // Build chronological timeline (all entries, not just status)
  const events = [...lead.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const reachedStatuses = new Set(events.filter((e) => e.status).map((e) => e.status as LeadStatus));
  const reachedIdx = Math.max(...FLOW.map((s, i) => (reachedStatuses.has(s) ? i : -1)));

  const iconFor = (kind?: string) => {
    switch (kind) {
      case "visit": return MapPin;
      case "call": return Phone;
      case "demo": return Monitor;
      case "proposal": return FileText;
      case "trial": return Hourglass;
      default: return Check;
    }
  };

  return (
    <div className="space-y-5">
      {/* Stage flow */}
      <div>
        <div className="text-sm font-semibold mb-3">Pipeline Stage</div>
        <div className="flex flex-wrap gap-1.5">
          {FLOW.map((stage, i) => {
            const reached = i <= reachedIdx;
            return (
              <div
                key={stage}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  reached
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {leadStatusDisplay(stage)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological timeline */}
      <div>
        <div className="text-sm font-semibold mb-3">Activity Timeline</div>
        <div className="relative">
          {events.map((e, i) => {
            const Icon = iconFor(e.kind);
            const isLast = i === events.length - 1;
            const title =
              e.kind === "visit"
                ? `Visit ${e.visitStatus ?? ""}${e.visitType ? ` — ${e.visitType}` : ""}`
                : e.kind === "call"
                ? "Call Attempt"
                : e.kind === "trial"
                ? "Trial Update"
                : e.kind === "proposal"
                ? "Proposal"
                : e.status
                ? leadStatusDisplay(e.status)
                : "Update";
            return (
              <div key={e.id} className="flex gap-3 pb-4 last:pb-0 relative">
                {!isLast && <span className="absolute left-[14px] top-7 bottom-0 w-px bg-border" />}
                <div className="relative h-7 w-7 rounded-full grid place-items-center shrink-0 bg-primary text-primary-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="font-medium text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(e.timestamp), "dd MMM yyyy, HH:mm")}
                    </div>
                  </div>
                  {e.substatus && <div className="text-xs text-primary mt-0.5">{e.substatus}</div>}
                  {e.assignedTo && e.kind === "visit" && (
                    <div className="text-xs text-muted-foreground mt-0.5">Assigned: {e.assignedTo}</div>
                  )}
                  {e.notes && <div className="text-sm text-muted-foreground mt-1">{e.notes}</div>}
                  {e.followUpDate && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {e.kind === "visit" ? "Visit date" : "Follow-up"}: {format(new Date(e.followUpDate), "dd MMM yyyy")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
