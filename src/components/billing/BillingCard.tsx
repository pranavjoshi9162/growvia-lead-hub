import { useMemo } from "react";
import { format, differenceInCalendarDays, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet } from "lucide-react";
import { Lead, Subscription, BillingPaymentStatus, SubscriptionStatus } from "@/lib/sampleData";

const payColor: Record<BillingPaymentStatus, string> = {
  Paid: "bg-success-soft text-success border-success/30",
  Pending: "bg-warning-soft text-warning border-warning/30",
  Overdue: "bg-destructive/10 text-destructive border-destructive/30",
  Trial: "bg-info-soft text-info border-info/30",
};

const subColor: Record<SubscriptionStatus, string> = {
  "Trial Active": "bg-info-soft text-info border-info/30",
  "Trial Expired": "bg-destructive/10 text-destructive border-destructive/30",
  Active: "bg-success-soft text-success border-success/30",
  "Renewal Due": "bg-warning-soft text-warning border-warning/30",
  Suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

/** Derives effective statuses from dates (trial expiry, renewal overdue). */
export function deriveEffectiveStatus(s: Subscription): {
  paymentStatus: BillingPaymentStatus;
  subscriptionStatus: SubscriptionStatus;
} {
  if (s.cycle === "Trial") {
    if (s.trialEnd && isPast(new Date(s.trialEnd))) {
      return { paymentStatus: "Pending", subscriptionStatus: "Trial Expired" };
    }
    return { paymentStatus: "Trial", subscriptionStatus: "Trial Active" };
  }
  if (s.nextRenewalDate) {
    const days = differenceInCalendarDays(new Date(s.nextRenewalDate), new Date());
    if (days < 0) return { paymentStatus: "Overdue", subscriptionStatus: "Renewal Due" };
    if (days <= 5 && s.paymentStatus !== "Paid") return { paymentStatus: s.paymentStatus, subscriptionStatus: "Renewal Due" };
  }
  return { paymentStatus: s.paymentStatus, subscriptionStatus: s.subscriptionStatus };
}

export function BillingCard({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
  const s = lead.subscription;
  const effective = useMemo(() => (s ? deriveEffectiveStatus(s) : null), [s]);

  if (!s) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Billing & Subscription</div>
        </div>
        <p className="text-xs text-muted-foreground">
          No subscription yet. Complete Customer Onboarding to activate billing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" /> Billing & Subscription
        </div>
        <Badge variant="outline" className={subColor[effective!.subscriptionStatus]}>
          {effective!.subscriptionStatus}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <dt className="text-muted-foreground">Subscription</dt>
        <dd className="text-foreground text-right">{s.cycle}</dd>

        <dt className="text-muted-foreground">Plan</dt>
        <dd className="text-foreground text-right truncate">{s.planName}</dd>

        <dt className="text-muted-foreground">Outlets</dt>
        <dd className="text-foreground text-right">{s.outlets} {s.outlets === 1 ? "Outlet" : "Outlets"}</dd>

        <dt className="text-muted-foreground">Amount</dt>
        <dd className="text-foreground text-right tabular-nums">₹{s.amount.toLocaleString("en-IN")}</dd>

        <dt className="text-muted-foreground">Payment</dt>
        <dd className="text-right">
          <Badge variant="outline" className={payColor[effective!.paymentStatus]}>{effective!.paymentStatus}</Badge>
        </dd>

        {s.cycle === "Trial" ? (
          <>
            <dt className="text-muted-foreground">Trial Start</dt>
            <dd className="text-foreground text-right">{s.trialStart ? format(new Date(s.trialStart), "dd MMM yyyy") : "—"}</dd>
            <dt className="text-muted-foreground">Trial End</dt>
            <dd className="text-foreground text-right">{s.trialEnd ? format(new Date(s.trialEnd), "dd MMM yyyy") : "—"}</dd>
          </>
        ) : (
          <>
            <dt className="text-muted-foreground">Started</dt>
            <dd className="text-foreground text-right">{s.subscriptionStart ? format(new Date(s.subscriptionStart), "dd MMM yyyy") : "—"}</dd>
            <dt className="text-muted-foreground">Next Renewal</dt>
            <dd className="text-foreground text-right">{s.nextRenewalDate ? format(new Date(s.nextRenewalDate), "dd MMM yyyy") : "—"}</dd>
          </>
        )}
      </dl>

      <Button className="mt-4 w-full h-10" onClick={onOpen}>
        <Wallet className="h-4 w-4" /> Open Billing
      </Button>
    </div>
  );
}
