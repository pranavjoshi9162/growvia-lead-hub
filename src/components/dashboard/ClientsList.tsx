import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CLIENTS, ClientStatus } from "@/lib/clientsData";

interface Props {
  filter: ClientStatus | "All" | "Active";
}

const titleMap: Record<string, string> = {
  All: "Total Clients",
  Active: "Active Accounts",
  Paid: "Paid Clients",
  Trial: "Trial Clients",
  TrialExpiring: "Trial Expiring",
  Overdue: "Payment Overdue",
  PlanExpiry: "Plan Expiry",
};

export function ClientsList({ filter }: Props) {
  const rows = CLIENTS.filter((c) => {
    if (filter === "All") return true;
    if (filter === "Active") return c.status !== "Overdue";
    if (filter === "Paid") return c.status === "Paid";
    return c.status === filter;
  });

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{rows.length}</span> {titleMap[filter]?.toLowerCase()}
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr className="text-left">
              <th className="py-2.5 px-3 font-medium">Client</th>
              <th className="py-2.5 px-3 font-medium">Plan</th>
              <th className="py-2.5 px-3 font-medium">Outlets</th>
              <th className="py-2.5 px-3 font-medium">{filter === "TrialExpiring" || filter === "Trial" ? "Trial Ends" : filter === "Overdue" ? "Overdue Since" : filter === "PlanExpiry" ? "Plan Expires" : "Next Billing"}</th>
              <th className="py-2.5 px-3 font-medium text-right">MRR</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No clients in this segment.</td></tr>
            )}
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-secondary/30">
                <td className="py-2.5 px-3">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.owner}</div>
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className={c.plan === "Gold"
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-muted-foreground/30 bg-secondary text-muted-foreground"}>
                    {c.plan}
                  </Badge>
                </td>
                <td className="py-2.5 px-3">{c.outlets}</td>
                <td className="py-2.5 px-3 text-muted-foreground">
                  {c.nextDate ? format(new Date(c.nextDate), "dd MMM yyyy") : "—"}
                  {c.note && <div className="text-xs">{c.note}</div>}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold">
                  {c.mrr ? `₹${c.mrr.toLocaleString("en-IN")}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
