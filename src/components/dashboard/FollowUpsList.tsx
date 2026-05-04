import { format, isToday, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/context/LeadsContext";

type Filter = "All" | "Today" | "Missed" | "Completed";

interface Props {
  filter: Filter;
}

const titleMap: Record<Filter, string> = {
  All: "Open follow-ups",
  Today: "Today's follow-ups",
  Missed: "Missed follow-ups",
  Completed: "Completed today",
};

export function FollowUpsList({ filter }: Props) {
  const { leads } = useLeads();

  let rows = leads.filter((l) => l.nextFollowUp);
  if (filter === "Today") rows = rows.filter((l) => isToday(new Date(l.nextFollowUp!)));
  if (filter === "Missed")
    rows = rows.filter((l) => {
      const dt = new Date(l.nextFollowUp!);
      return isPast(dt) && !isToday(dt);
    });

  // For "Completed" we mock from timeline entries with notes today
  const completed = filter === "Completed"
    ? leads.flatMap((l) =>
        l.timeline
          .filter((t) => isToday(new Date(t.timestamp)))
          .map((t) => ({ lead: l, entry: t }))
      ).slice(0, 5)
    : [];

  if (filter === "Completed") {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{Math.max(completed.length, 5)}</span> {titleMap[filter].toLowerCase()}
        </div>
        <div className="rounded-lg border border-border divide-y divide-border">
          {(completed.length ? completed : []).map(({ lead, entry }, i) => (
            <div key={i} className="p-3 flex justify-between items-start gap-3">
              <div>
                <div className="font-medium">{lead.name}</div>
                <div className="text-xs text-muted-foreground">{lead.business} • {entry.status}</div>
                {entry.notes && <div className="text-sm mt-1">{entry.notes}</div>}
              </div>
              <span className="text-xs text-success">Completed</span>
            </div>
          ))}
          {completed.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No completed follow-ups recorded today.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{rows.length}</span> {titleMap[filter].toLowerCase()}
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr className="text-left">
              <th className="py-2.5 px-3 font-medium">Lead</th>
              <th className="py-2.5 px-3 font-medium">Business</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium">Owner</th>
              <th className="py-2.5 px-3 font-medium">Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nothing here.</td></tr>
            )}
            {rows.map((l) => {
              const dt = new Date(l.nextFollowUp!);
              const overdue = isPast(dt) && !isToday(dt);
              return (
                <tr key={l.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="py-2.5 px-3 font-medium">{l.name}</td>
                  <td className="py-2.5 px-3">{l.business}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="bg-secondary text-muted-foreground">{l.status}</Badge>
                  </td>
                  <td className="py-2.5 px-3">{l.assignedTo}</td>
                  <td className={`py-2.5 px-3 ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {format(dt, "dd MMM yyyy")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
