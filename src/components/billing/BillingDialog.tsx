import { useMemo, useState, useEffect } from "react";
import { format, addDays, addMonths, addYears, differenceInCalendarDays, isPast } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Lead, Subscription, BillingCycle, BillingPaymentMethod, BILLING_PAYMENT_METHODS,
  AVAILABLE_PLANS,
} from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  CreditCard, Receipt, RefreshCw, Layers, MapPin, History, CalendarClock,
  Sparkles, IndianRupee,
} from "lucide-react";
import { deriveEffectiveStatus } from "./BillingCard";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead | null;
}

function Section({
  icon: Icon, title, subtitle, children,
}: { icon: any; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}

const payBadge: Record<string, string> = {
  Paid: "bg-success-soft text-success border-success/30",
  Pending: "bg-warning-soft text-warning border-warning/30",
  Overdue: "bg-destructive/10 text-destructive border-destructive/30",
  Trial: "bg-info-soft text-info border-info/30",
  Failed: "bg-destructive/10 text-destructive border-destructive/30",
};

const subBadge: Record<string, string> = {
  "Trial Active": "bg-info-soft text-info border-info/30",
  "Trial Expired": "bg-destructive/10 text-destructive border-destructive/30",
  Active: "bg-success-soft text-success border-success/30",
  "Renewal Due": "bg-warning-soft text-warning border-warning/30",
  Suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

export function BillingDialog({ open, onOpenChange, lead }: Props) {
  const { updateSubscription, addBillingTxn, addSubscriptionEvent } = useLeads();
  const { user } = useAuth();

  if (!lead) return null;
  const s = lead.subscription;
  if (!s) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Billing & Subscription</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            No subscription exists for this customer yet. Complete Customer Onboarding first.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Billing & Subscription
            <span className="text-sm font-normal text-muted-foreground ml-2 truncate">
              {lead.business}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          <BillingBody lead={lead} s={s} />
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BillingBody({ lead, s }: { lead: Lead; s: Subscription }) {
  const { updateSubscription, addBillingTxn, addSubscriptionEvent } = useLeads();
  const { user } = useAuth();
  const effective = deriveEffectiveStatus(s);

  // Trial extend
  const [extendDays, setExtendDays] = useState<number>(7);
  // Convert to paid
  const [convertCycle, setConvertCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [convertPlan, setConvertPlan] = useState<string>(s.planName in Object.fromEntries(AVAILABLE_PLANS.map(p => [p.name, p])) ? s.planName : AVAILABLE_PLANS[0].name);
  const convertUnit = useMemo(
    () => AVAILABLE_PLANS.find(p => p.name === convertPlan)?.price ?? s.unitPrice,
    [convertPlan, s.unitPrice]
  );

  // Collect payment
  const [payAmount, setPayAmount] = useState<number>(s.amount);
  const [payMethod, setPayMethod] = useState<BillingPaymentMethod>(s.paymentMethod ?? "Razorpay");
  const [payRef, setPayRef] = useState<string>("");
  useEffect(() => setPayAmount(s.amount), [s.amount]);

  // Plan management
  const [planName, setPlanName] = useState<string>(s.planName);
  const [planUnit, setPlanUnit] = useState<number>(s.unitPrice);
  const [planCycle, setPlanCycle] = useState<BillingCycle>(s.cycle === "Trial" ? "Monthly" : s.cycle);
  const [outlets, setOutlets] = useState<number>(s.outlets);
  const projected = Math.max(0, planUnit) * Math.max(1, outlets);

  const daysLeft = s.trialEnd ? differenceInCalendarDays(new Date(s.trialEnd), new Date()) : null;

  // ---- Actions ----
  const extendTrial = () => {
    if (!extendDays || extendDays < 1) return toast.error("Enter days to extend");
    const base = s.trialEnd && !isPast(new Date(s.trialEnd)) ? new Date(s.trialEnd) : new Date();
    const newEnd = addDays(base, extendDays).toISOString();
    updateSubscription(lead.id, {
      trialEnd: newEnd,
      subscriptionStatus: "Trial Active",
      paymentStatus: "Trial",
    });
    addSubscriptionEvent(lead.id, { event: "Trial Extended", notes: `Extended by ${extendDays} days · new end ${format(new Date(newEnd), "dd MMM yyyy")}` });
    toast.success("Trial extended");
  };

  const convertToPaid = () => {
    const unit = AVAILABLE_PLANS.find(p => p.name === convertPlan)?.price ?? s.unitPrice;
    const amount = unit * s.outlets;
    const start = new Date().toISOString();
    const next = (convertCycle === "Yearly" ? addYears(new Date(), 1) : addMonths(new Date(), 1)).toISOString();
    updateSubscription(lead.id, {
      cycle: convertCycle,
      planName: convertPlan,
      unitPrice: unit,
      amount,
      subscriptionStart: start,
      nextRenewalDate: next,
      subscriptionStatus: "Active",
      paymentStatus: "Pending",
    });
    addSubscriptionEvent(lead.id, { event: "Trial Converted", notes: `${convertCycle} · ${convertPlan}` });
    toast.success("Converted to paid subscription — collect payment to activate");
  };

  const collectPayment = () => {
    if (!payAmount || payAmount <= 0) return toast.error("Enter amount");
    const now = new Date().toISOString();
    const nextRenewal = s.cycle === "Yearly"
      ? addYears(new Date(), 1).toISOString()
      : s.cycle === "Monthly"
        ? addMonths(new Date(), 1).toISOString()
        : s.nextRenewalDate;
    addBillingTxn(lead.id, {
      date: now,
      description: s.cycle === "Trial" ? "Trial Payment Collected" : `${s.cycle} Renewal · ${s.planName} × ${s.outlets}`,
      amount: payAmount,
      method: payMethod,
      status: "Paid",
      reference: payRef || undefined,
    });
    updateSubscription(lead.id, {
      paymentStatus: "Paid",
      subscriptionStatus: "Active",
      paymentMethod: payMethod,
      lastPaidDate: now,
      lastReference: payRef || undefined,
      nextRenewalDate: nextRenewal,
      cycle: s.cycle === "Trial" ? "Monthly" : s.cycle,
      subscriptionStart: s.subscriptionStart ?? now,
    });
    addSubscriptionEvent(lead.id, { event: s.cycle === "Trial" ? "Trial Payment Collected" : "Payment Collected", notes: `₹${payAmount.toLocaleString("en-IN")} · ${payMethod}` });
    setPayRef("");
    toast.success("Payment recorded");
  };

  const collectRenewal = () => {
    if (s.cycle === "Trial") return toast.error("Not on a paid cycle");
    const now = new Date().toISOString();
    const nextRenewal = (s.cycle === "Yearly" ? addYears(new Date(), 1) : addMonths(new Date(), 1)).toISOString();
    addBillingTxn(lead.id, {
      date: now,
      description: `${s.cycle} Renewal · ${s.planName} × ${s.outlets}`,
      amount: s.amount,
      method: s.paymentMethod ?? "Razorpay",
      status: "Paid",
    });
    updateSubscription(lead.id, {
      paymentStatus: "Paid",
      subscriptionStatus: "Active",
      lastPaidDate: now,
      nextRenewalDate: nextRenewal,
    });
    addSubscriptionEvent(lead.id, { event: "Renewal Completed", notes: `${s.cycle} · ₹${s.amount.toLocaleString("en-IN")}` });
    toast.success("Renewal collected");
  };

  const applyPlanChanges = () => {
    const amount = Math.max(0, planUnit) * Math.max(1, outlets);
    const prevPlan = s.planName;
    const prevOutlets = s.outlets;
    const prevCycle = s.cycle;
    const changes: string[] = [];
    if (prevPlan !== planName) changes.push(`Plan ${prevPlan} → ${planName}`);
    if (prevOutlets !== outlets) changes.push(`Outlets ${prevOutlets} → ${outlets}`);
    if (prevCycle !== planCycle) changes.push(`Cycle ${prevCycle} → ${planCycle}`);
    if (!changes.length) return toast.info("No changes to apply");

    updateSubscription(lead.id, {
      planName,
      unitPrice: planUnit,
      cycle: planCycle,
      outlets,
      amount,
      paymentStatus: "Pending",
      subscriptionStatus: "Renewal Due",
    });
    if (prevPlan !== planName) addSubscriptionEvent(lead.id, { event: "Plan Upgraded", notes: `${prevPlan} → ${planName}` });
    if (prevOutlets !== outlets && outlets > prevOutlets) addSubscriptionEvent(lead.id, { event: `Added ${outlets - prevOutlets} Outlet(s)`, notes: `Now ${outlets} outlets` });
    if (prevOutlets !== outlets && outlets < prevOutlets) addSubscriptionEvent(lead.id, { event: `Removed ${prevOutlets - outlets} Outlet(s)`, notes: `Now ${outlets} outlets` });
    if (prevCycle !== planCycle) addSubscriptionEvent(lead.id, { event: `Switched to ${planCycle}`, notes: `Was ${prevCycle}` });
    toast.success("Subscription updated — collect payment to activate");
  };

  return (
    <>
      {/* Subscription Details */}
      <Section icon={Sparkles} title="Subscription Details" subtitle={`${s.cycle} · ${s.planName}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><div className="text-xs text-muted-foreground">Plan</div><div className="font-medium">{s.planName}</div></div>
          <div><div className="text-xs text-muted-foreground">Billing Cycle</div><div className="font-medium">{s.cycle}</div></div>
          <div><div className="text-xs text-muted-foreground">Outlets</div><div className="font-medium">{s.outlets}</div></div>
          <div><div className="text-xs text-muted-foreground">Amount</div><div className="font-medium flex items-center gap-0.5"><IndianRupee className="h-3.5 w-3.5" />{s.amount.toLocaleString("en-IN")}</div></div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={subBadge[effective.subscriptionStatus]}>{effective.subscriptionStatus}</Badge>
          <Badge variant="outline" className={payBadge[effective.paymentStatus]}>Payment: {effective.paymentStatus}</Badge>
        </div>
      </Section>

      {/* Trial Info */}
      {s.cycle === "Trial" && (
        <Section icon={CalendarClock} title="Trial Information" subtitle="Trial period and actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Trial Start</div><div className="font-medium">{s.trialStart ? format(new Date(s.trialStart), "dd MMM yyyy") : "—"}</div></div>
            <div><div className="text-xs text-muted-foreground">Trial End</div><div className="font-medium">{s.trialEnd ? format(new Date(s.trialEnd), "dd MMM yyyy") : "—"}</div></div>
            <div><div className="text-xs text-muted-foreground">Days Remaining</div><div className="font-medium">{daysLeft === null ? "—" : daysLeft < 0 ? <span className="text-destructive">Expired</span> : `${daysLeft} days`}</div></div>
            <div><div className="text-xs text-muted-foreground">Status</div><div><Badge variant="outline" className={subBadge[effective.subscriptionStatus]}>{effective.subscriptionStatus}</Badge></div></div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs font-semibold mb-2">Extend Trial</div>
              <div className="flex items-center gap-2">
                <Input type="number" min={1} value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value) || 0)} className="h-9 w-24" />
                <span className="text-xs text-muted-foreground">days</span>
                <Button size="sm" variant="outline" className="ml-auto" onClick={extendTrial}>Extend</Button>
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs font-semibold mb-2">Convert to Paid</div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={convertCycle} onValueChange={(v: any) => setConvertCycle(v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={convertPlan} onValueChange={setConvertPlan}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PLANS.map((p) => (
                      <SelectItem key={p.name} value={p.name}>{p.name} — ₹{p.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">≈ ₹{(convertUnit * s.outlets).toLocaleString("en-IN")} / {convertCycle === "Yearly" ? "year" : "month"}</div>
                <Button size="sm" onClick={convertToPaid}>Convert</Button>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Payment */}
      <Section icon={Receipt} title="Payment" subtitle="Collect or record a payment">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
          <div><div className="text-xs text-muted-foreground">Status</div><div><Badge variant="outline" className={payBadge[effective.paymentStatus]}>{effective.paymentStatus}</Badge></div></div>
          <div><div className="text-xs text-muted-foreground">Last Paid</div><div className="font-medium">{s.lastPaidDate ? format(new Date(s.lastPaidDate), "dd MMM yyyy") : "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Method</div><div className="font-medium">{s.paymentMethod ?? "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Reference</div><div className="font-medium truncate">{s.lastReference ?? "—"}</div></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Amount (₹)</Label>
            <Input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={payMethod} onValueChange={(v: BillingPaymentMethod) => setPayMethod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BILLING_PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Transaction Ref (optional)</Label>
            <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="rzp_XXXX / UTR" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={collectPayment}><Receipt className="h-4 w-4" /> Collect Payment</Button>
        </div>
      </Section>

      {/* Renewal */}
      {s.cycle !== "Trial" && (
        <Section icon={RefreshCw} title="Renewal" subtitle={`${s.cycle} subscription`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Current Start</div><div className="font-medium">{s.subscriptionStart ? format(new Date(s.subscriptionStart), "dd MMM yyyy") : "—"}</div></div>
            <div><div className="text-xs text-muted-foreground">Next Renewal</div><div className="font-medium">{s.nextRenewalDate ? format(new Date(s.nextRenewalDate), "dd MMM yyyy") : "—"}</div></div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div>
                {effective.subscriptionStatus === "Renewal Due"
                  ? <Badge variant="outline" className={payBadge.Overdue}>Due</Badge>
                  : <Badge variant="outline" className={payBadge.Paid}>Upcoming</Badge>}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={collectRenewal}><RefreshCw className="h-4 w-4" /> Collect Renewal</Button>
          </div>
        </Section>
      )}

      {/* Plan Management */}
      <Section icon={Layers} title="Plan Management" subtitle="Change plan, cycle or outlet count">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select
              value={AVAILABLE_PLANS.some(p => p.name === planName) ? planName : "__custom__"}
              onValueChange={(v) => {
                if (v === "__custom__") return;
                const p = AVAILABLE_PLANS.find(x => x.name === v);
                setPlanName(v);
                if (p) setPlanUnit(p.price);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AVAILABLE_PLANS.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                <SelectItem value="__custom__">Custom Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Unit Price (₹)</Label>
            <Input type="number" value={planUnit} onChange={(e) => setPlanUnit(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label>Billing Cycle</Label>
            <Select value={planCycle} onValueChange={(v: BillingCycle) => setPlanCycle(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Outlets</Label>
            <Input type="number" min={1} value={outlets} onChange={(e) => setOutlets(Math.max(1, Number(e.target.value) || 1))} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
          <div className="text-muted-foreground">New Amount</div>
          <div className="font-semibold flex items-center gap-0.5"><IndianRupee className="h-4 w-4" />{projected.toLocaleString("en-IN")}<span className="text-xs text-muted-foreground ml-1">/{planCycle === "Yearly" ? "year" : "month"}</span></div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={applyPlanChanges}><Layers className="h-4 w-4" /> Apply Changes</Button>
        </div>
      </Section>

      {/* Payment History */}
      <Section icon={History} title="Payment History" subtitle={`${s.history.length} transactions`}>
        {s.history.length === 0 ? (
          <div className="text-xs text-muted-foreground">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Description</th>
                  <th className="py-2 pr-3 font-medium text-right">Amount</th>
                  <th className="py-2 pr-3 font-medium">Method</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...s.history].reverse().map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="py-2 pr-3">{format(new Date(t.date), "dd MMM yyyy")}</td>
                    <td className="py-2 pr-3">{t.description}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">₹{t.amount.toLocaleString("en-IN")}</td>
                    <td className="py-2 pr-3">{t.method ?? "—"}</td>
                    <td className="py-2 pr-3"><Badge variant="outline" className={payBadge[t.status]}>{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Subscription Timeline */}
      <Section icon={CalendarClock} title="Subscription Timeline" subtitle="Lifecycle events">
        {s.events.length === 0 ? (
          <div className="text-xs text-muted-foreground">No events yet.</div>
        ) : (
          <ul className="space-y-2">
            {[...s.events].reverse().map((e) => (
              <li key={e.id} className="border border-border rounded-md p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{e.event}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(e.timestamp), "dd MMM yyyy · HH:mm")}
                  </span>
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {e.actor ? `By ${e.actor}` : ""}{e.notes ? `${e.actor ? " · " : ""}${e.notes}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
