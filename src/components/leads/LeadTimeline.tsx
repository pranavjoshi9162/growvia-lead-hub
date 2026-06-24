import { Lead, LeadStatus, leadStatusDisplay } from "@/lib/sampleData";
import { format } from "date-fns";
import { Check, Phone, MapPin, Monitor, FileText, Hourglass, Sparkles, ArrowRight } from "lucide-react";

const FLOW: LeadStatus[] = ["New Lead", "Contacted", "Visit", "Demo", "Negotiation", "Trial", "Converted"];

export function LeadTimeline({ lead }: { lead: Lead }) {
  const events = [...lead.timeline].sort(
    (a, b) => new Date(a.statusDate ?? a.timestamp).getTime() - new Date(b.statusDate ?? b.timestamp).getTime()
  );

  const reachedStatuses = new Set(events.filter((e) => e.status).map((e) => e.status as LeadStatus));
  const reachedIdx = Math.max(...FLOW.map((s, i) => (reachedStatuses.has(s) ? i : -1)));

  const iconFor = (kind?: string, event?: string) => {
    if (event === "created") return Sparkles;
    switch (kind) {
      case "visit": return MapPin;
      case "call": return Phone;
      case "demo": return Monitor;
      case "proposal": return FileText;
      case "trial": return Hourglass;
      default: return Check;
    }
  };

  const titleFor = (e: typeof events[number]): { title: string; diff?: { from: string; to: string } } => {
    if (e.event === "created") return { title: "Lead Created" };
    if (e.kind === "visit") {
      if (e.visitStatus === "Completed") return { title: "Visit Completed" };
      if (e.visitStatus === "Missed") return { title: "Visit Missed" };
      if (e.visitStatus === "Rescheduled") return { title: "Visit Rescheduled" };
      if (e.visitStatus === "Checked In") return { title: "Visit Checked In" };
      return { title: `Visit Scheduled${e.visitType ? ` — ${e.visitType}` : ""}` };
    }
    if (e.kind === "call") return { title: "Call Logged" };
    if (e.kind === "trial") return { title: e.substatus || "Trial Update" };
    if (e.kind === "proposal") return { title: "Proposal Shared" };
    if (e.event === "status_change" && e.status) {
      const from = `${leadStatusDisplay(e.prevStatus ?? lead.status)}${e.prevSubstatus ? ` · ${e.prevSubstatus}` : ""}`;
      const to = `${leadStatusDisplay(e.status)}${e.substatus ? ` · ${e.substatus}` : ""}`;
      return { title: "Status Changed", diff: { from, to } };
    }
    if (e.status) return { title: `${leadStatusDisplay(e.status)}${e.substatus ? ` · ${e.substatus}` : ""}` };
    return { title: "Update" };
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold mb-3">Pipeline Stage</div>
        <div className="flex flex-wrap gap-1.5">
          {FLOW.map((stage, i) => {
            const reached = i <= reachedIdx;
            return (
              <div
                key={stage}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  reached ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {leadStatusDisplay(stage)}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-3">Activity Timeline</div>
        <div className="relative">
          {events.map((e, i) => {
            const Icon = iconFor(e.kind, e.event);
            const isLast = i === events.length - 1;
            const { title, diff } = titleFor(e);
            const when = e.statusDate ?? e.timestamp;
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
                      {format(new Date(when), "dd MMM yyyy, HH:mm")}
                    </div>
                  </div>
                  {diff && (
                    <div className="flex items-center gap-1.5 text-xs mt-1">
                      <span className="text-muted-foreground">{diff.from}</span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="text-primary font-medium">{diff.to}</span>
                    </div>
                  )}
                  {e.event === "created" && lead.source && (
                    <div className="text-xs text-muted-foreground mt-0.5">Source: {lead.source}</div>
                  )}
                  {!diff && e.substatus && e.event !== "created" && e.kind !== "visit" && (
                    <div className="text-xs text-primary mt-0.5">{e.substatus}</div>
                  )}
                  {e.notes && <div className="text-sm text-muted-foreground mt-1">{e.notes}</div>}
                  {e.followUpDate && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {e.kind === "visit" ? "Visit date" : "Follow-up"}: {format(new Date(e.followUpDate), "dd MMM yyyy")}
                    </div>
                  )}
                  {e.actor && (
                    <div className="text-[11px] text-muted-foreground mt-1">by {e.actor}</div>
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
