import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SALES } from "@/lib/clientsData";

type Filter = "Closed" | "TrialToPaid" | "Conversion" | "MRR";

interface Props {
  filter: Filter;
}

export function SalesBreakdown({ filter }: Props) {
  const rows = filter === "TrialToPaid" ? SALES.filter((s) => s.type === "Trial→Paid") : SALES;

  const totalAmount = rows.reduce((s, r) => s + r.amount, 0);
  const trialToPaid = SALES.filter((s) => s.type === "Trial→Paid").length;
  const totalLeads = 124;
  const conversionRate = ((6 / 10) * 100).toFixed(0);

  return (
    <div className="space-y-5">
      {filter === "Conversion" && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Leads" value={totalLeads} />
          <Stat label="Trials" value={10} />
          <Stat label="Sales Done" value={6} />
          <div className="col-span-3 rounded-lg border border-primary/20 bg-soft-gradient p-4">
            <div className="text-xs text-muted-foreground">Lead → Paid Conversion</div>
            <div className="text-3xl font-bold text-primary mt-1">{conversionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">From trials closed this month</div>
          </div>
        </div>
      )}

      {filter === "MRR" && (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Active MRR" value="₹36,000" />
          <Stat label="New MRR" value="₹17,998" />
          <Stat label="Gold Plans" value={4} />
          <Stat label="Silver Plans" value={2} />
        </div>
      )}

      <div>
        <div className="text-sm font-semibold mb-2">
          {filter === "TrialToPaid" ? "Trial → Paid Conversions" : "Recent Sales"}
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr className="text-left">
                <th className="py-2.5 px-3 font-medium">Client</th>
                <th className="py-2.5 px-3 font-medium">Plan</th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th className="py-2.5 px-3 font-medium">Closed</th>
                <th className="py-2.5 px-3 font-medium">Owner</th>
                <th className="py-2.5 px-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="py-2.5 px-3 font-medium">{s.client}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className={s.plan === "Gold"
                      ? "border-warning/40 bg-warning/10 text-warning"
                      : "border-muted-foreground/30 bg-secondary text-muted-foreground"}>{s.plan}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{s.type}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{format(new Date(s.closedAt), "dd MMM")}</td>
                  <td className="py-2.5 px-3">{s.owner}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">₹{s.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-secondary/40">
                <td colSpan={5} className="py-2.5 px-3 font-medium">Total</td>
                <td className="py-2.5 px-3 text-right font-bold text-primary">₹{totalAmount.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
