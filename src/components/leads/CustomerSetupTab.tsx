import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AVAILABLE_PLANS, BUSINESS_TYPES, BusinessType, CustomerSetup, CustomerSetupOutlet,
  Lead, PaymentMethod, SubscriptionType,
} from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";
import {
  CreditCard, Building2, MapPin, Receipt, Rocket, CheckCircle2, Copy, Send,
  Sparkles, QrCode, IndianRupee,
} from "lucide-react";

interface Props {
  lead: Lead;
}

const emptyOutlet = (): CustomerSetupOutlet => ({ name: "", googleLocation: "", address: "" });

function SectionCard({
  icon: Icon, title, subtitle, children, right,
}: { icon: any; title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border p-4 sm:p-5 bg-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function CustomerSetupTab({ lead }: Props) {
  const { updateLead, setStatus, appendTimeline } = useLeads();
  const initial: CustomerSetup = lead.customerSetup ?? {
    status: "Pending",
    outletsPurchased: 1,
    outlets: [emptyOutlet()],
    ownerName: lead.name,
    phone: lead.phone,
    email: lead.email,
    businessName: lead.business,
    businessType: lead.businessType,
    address: lead.outletAddress,
    country: "India",
  };
  const [cs, setCs] = useState<CustomerSetup>(initial);
  const [subSaved, setSubSaved] = useState<boolean>(
    !!initial.subscriptionType &&
      (initial.subscriptionType === "Trial" ? !!initial.trialDuration : !!initial.planMode),
  );

  // Sync outlets array to outletsPurchased count
  useEffect(() => {
    const n = Math.max(1, Number(cs.outletsPurchased) || 1);
    const current = cs.outlets ?? [];
    if (current.length === n) return;
    const next = [...current];
    while (next.length < n) next.push(emptyOutlet());
    next.length = n;
    setCs((p) => ({ ...p, outlets: next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cs.outletsPurchased]);

  const set = <K extends keyof CustomerSetup>(k: K, v: CustomerSetup[K]) =>
    setCs((p) => ({ ...p, [k]: v }));

  const updateOutlet = (i: number, k: keyof CustomerSetupOutlet, v: string) => {
    const outlets = (cs.outlets ?? []).slice();
    outlets[i] = { ...(outlets[i] ?? emptyOutlet()), [k]: v };
    set("outlets", outlets);
  };

  const computedAmount = useMemo(() => {
    if (cs.subscriptionType === "Trial") return 0;
    const unit =
      cs.planMode === "New"
        ? Number(cs.newPlanPrice) || 0
        : Number(cs.planPrice) ||
          AVAILABLE_PLANS.find((p) => p.name === cs.existingPlan)?.price ||
          0;
    return unit * (Number(cs.outletsPurchased) || 1);
  }, [cs.subscriptionType, cs.planMode, cs.newPlanPrice, cs.existingPlan, cs.planPrice, cs.outletsPurchased]);

  const persist = (patch: Partial<CustomerSetup>) => {
    const merged: CustomerSetup = { ...cs, ...patch };
    setCs(merged);
    updateLead(lead.id, { customerSetup: merged });
    return merged;
  };

  const saveSubscription = () => {
    if (!cs.subscriptionType) return toast.error("Select a subscription type");
    if (cs.subscriptionType === "Trial" && !cs.trialDuration) return toast.error("Choose trial duration");
    if (cs.subscriptionType === "Trial" && cs.trialDuration === "Custom" && !cs.trialDays)
      return toast.error("Enter custom trial days");
    if (cs.subscriptionType !== "Trial" && !cs.planMode) return toast.error("Choose plan type");
    if (cs.subscriptionType !== "Trial" && cs.planMode === "Existing" && !cs.existingPlan)
      return toast.error("Pick a plan");
    if (cs.subscriptionType !== "Trial" && cs.planMode === "New" && (!cs.newPlanName || !cs.newPlanPrice))
      return toast.error("Enter plan name and price");

    const planPrice =
      cs.planMode === "Existing"
        ? AVAILABLE_PLANS.find((p) => p.name === cs.existingPlan)?.price
        : undefined;
    persist({
      planPrice,
      status: cs.status === "Pending" ? "In Progress" : cs.status,
      paymentAmount: computedAmount,
    });
    setSubSaved(true);
    toast.success("Subscription saved");
  };

  const createWorkspace = () => {
    if (!subSaved) return toast.error("Save subscription first");
    if (!cs.ownerName || !cs.email || !cs.phone || !cs.businessName)
      return toast.error("Customer information incomplete");
    const missingOutlet = (cs.outlets ?? []).some((o) => !o.name || !o.address);
    if (missingOutlet) return toast.error("Complete every outlet (name + address)");
    if (!cs.paymentMethod) return toast.error("Choose payment method");

    const workspaceName =
      (cs.businessName || lead.business || "workspace")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const tempPassword = Math.random().toString(36).slice(-10) + "!A1";
    const loginUrl = `https://${workspaceName}.growvia.app`;

    const merged = persist({
      status: "Completed",
      workspaceCreated: true,
      workspaceName,
      loginUrl,
      loginEmail: cs.email,
      tempPassword,
      paymentCompleted: cs.paymentMethod !== "Online Payment" ? true : !!cs.paymentCompleted,
      createdAt: new Date().toISOString(),
    });

    if (cs.subscriptionType === "Trial") {
      setStatus(lead.id, "Trial", "Trial Started", "Customer Setup: Trial workspace created");
    } else {
      appendTimeline(lead.id, {
        kind: "status",
        status: lead.status,
        substatus: lead.substatus,
        notes: `Workspace created — ${merged.subscriptionType} · ${merged.outletsPurchased} outlet(s)`,
      });
    }
    toast.success("Workspace created");
  };

  const copyCreds = () => {
    const text = `Workspace: ${cs.workspaceName}\nURL: ${cs.loginUrl}\nEmail: ${cs.loginEmail}\nTemp Password: ${cs.tempPassword}`;
    navigator.clipboard.writeText(text).then(() => toast.success("Credentials copied"));
  };
  const sendCreds = () => toast.success("Credentials sent to " + cs.loginEmail);

  const badgeVariant =
    cs.status === "Completed" ? "default" : cs.status === "In Progress" ? "secondary" : "outline";

  return (
    <div className="px-4 sm:px-6 py-5 space-y-4">
      {/* Status pill */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Customer Onboarding</span>
        </div>
        <Badge variant={badgeVariant as any} className="rounded-full">
          {cs.status}
        </Badge>
      </div>

      {/* 1. Subscription */}
      <SectionCard
        icon={CreditCard}
        title="Subscription Setup"
        subtitle="Decided by the sales team"
        right={subSaved ? <Badge variant="secondary" className="rounded-full">Saved</Badge> : null}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Subscription Type</Label>
            <Select
              value={cs.subscriptionType}
              onValueChange={(v: SubscriptionType) => set("subscriptionType", v)}
            >
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Trial">Trial</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cs.subscriptionType === "Trial" && (
            <>
              <div className="space-y-1.5">
                <Label>Trial Duration</Label>
                <Select value={cs.trialDuration} onValueChange={(v: any) => set("trialDuration", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 Days">7 Days</SelectItem>
                    <SelectItem value="14 Days">14 Days</SelectItem>
                    <SelectItem value="30 Days">30 Days</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {cs.trialDuration === "Custom" && (
                <div className="space-y-1.5">
                  <Label>Trial Days</Label>
                  <Input type="number" min={1} value={cs.trialDays ?? ""} onChange={(e) => set("trialDays", Number(e.target.value) || undefined)} />
                </div>
              )}
            </>
          )}

          {(cs.subscriptionType === "Monthly" || cs.subscriptionType === "Yearly") && (
            <>
              <div className="space-y-1.5">
                <Label>Plan Type</Label>
                <Select value={cs.planMode} onValueChange={(v: any) => set("planMode", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Existing">Existing Plan</SelectItem>
                    <SelectItem value="New">Create New Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cs.planMode === "Existing" && (
                <>
                  <div className="space-y-1.5">
                    <Label>Available Plan</Label>
                    <Select
                      value={cs.existingPlan}
                      onValueChange={(v) => {
                        const p = AVAILABLE_PLANS.find((x) => x.name === v);
                        setCs((prev) => ({ ...prev, existingPlan: v, planPrice: p?.price }));
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Pick plan" /></SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_PLANS.map((p) => (
                          <SelectItem key={p.name} value={p.name}>{p.name} — ₹{p.price}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Plan Price</Label>
                    <Input readOnly value={cs.planPrice ? `₹${cs.planPrice}` : ""} />
                  </div>
                </>
              )}

              {cs.planMode === "New" && (
                <>
                  <div className="space-y-1.5">
                    <Label>Plan Name</Label>
                    <Input value={cs.newPlanName ?? ""} onChange={(e) => set("newPlanName", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={cs.newPlanPrice ?? ""} onChange={(e) => set("newPlanPrice", Number(e.target.value) || undefined)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Billing Cycle</Label>
                    <Select value={cs.newPlanCycle} onValueChange={(v: any) => set("newPlanCycle", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Description (optional)</Label>
                    <Textarea rows={2} value={cs.newPlanDescription ?? ""} onChange={(e) => set("newPlanDescription", e.target.value)} />
                  </div>
                </>
              )}
            </>
          )}

          <div className="space-y-1.5">
            <Label>Number of Outlets</Label>
            <Input
              type="number"
              min={1}
              value={cs.outletsPurchased ?? 1}
              onChange={(e) => set("outletsPurchased", Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={saveSubscription}>Save Subscription</Button>
        </div>

        {subSaved && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.04] p-3 text-sm">
            <div className="font-semibold text-foreground">
              {cs.subscriptionType === "Trial"
                ? `Trial · ${cs.trialDuration === "Custom" ? `${cs.trialDays} Days` : cs.trialDuration}`
                : `${cs.planMode === "New" ? cs.newPlanName : cs.existingPlan} Plan · ${cs.subscriptionType}`}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {cs.outletsPurchased} Outlet{(cs.outletsPurchased ?? 1) > 1 ? "s" : ""}
              {cs.subscriptionType !== "Trial" && computedAmount ? ` · ₹${computedAmount}/${cs.subscriptionType === "Monthly" ? "month" : "year"}` : ""}
            </div>
          </div>
        )}
      </SectionCard>

      {/* 2. Customer Info */}
      <SectionCard icon={Building2} title="Customer Information" subtitle="Owner and business details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Owner Name *</Label><Input value={cs.ownerName ?? ""} onChange={(e) => set("ownerName", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={cs.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Phone Number *</Label><Input value={cs.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Business Name *</Label><Input value={cs.businessName ?? ""} onChange={(e) => set("businessName", e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Business Type</Label>
            <Select value={cs.businessType} onValueChange={(v: BusinessType) => set("businessType", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{BUSINESS_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Country</Label><Input value={cs.country ?? ""} onChange={(e) => set("country", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>State</Label><Input value={cs.state ?? ""} onChange={(e) => set("state", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>City</Label><Input value={cs.city ?? ""} onChange={(e) => set("city", e.target.value)} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Address</Label><Input value={cs.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Website</Label><Input value={cs.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://..." /></div>
        </div>
      </SectionCard>

      {/* 3. Outlets */}
      <SectionCard
        icon={MapPin}
        title="Outlet Setup"
        subtitle={`${cs.outletsPurchased ?? 1} outlet${(cs.outletsPurchased ?? 1) > 1 ? "s" : ""} purchased`}
      >
        <div className="space-y-3">
          {(cs.outlets ?? []).map((o, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <div className="text-xs font-semibold text-primary">Outlet {i + 1}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Outlet Name *</Label><Input value={o.name} onChange={(e) => updateOutlet(i, "name", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Google Location</Label><Input value={o.googleLocation} onChange={(e) => updateOutlet(i, "googleLocation", e.target.value)} placeholder="Search on Google Maps" /></div>
                <div className="space-y-1.5 md:col-span-2"><Label>Full Address *</Label><Input value={o.address} onChange={(e) => updateOutlet(i, "address", e.target.value)} /></div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Payment */}
      <SectionCard icon={Receipt} title="Payment" subtitle="Collect or confirm payment">
        <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
          <div><div className="text-xs text-muted-foreground">Plan</div><div className="font-medium">{cs.subscriptionType === "Trial" ? "Trial" : cs.planMode === "New" ? cs.newPlanName || "—" : cs.existingPlan || "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Billing</div><div className="font-medium">{cs.subscriptionType ?? "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Outlets</div><div className="font-medium">{cs.outletsPurchased ?? 1}</div></div>
          <div><div className="text-xs text-muted-foreground">Amount</div><div className="font-medium flex items-center gap-0.5"><IndianRupee className="h-3.5 w-3.5" />{computedAmount}</div></div>
        </div>

        <div className="space-y-1.5">
          <Label>Payment Method</Label>
          <Select value={cs.paymentMethod} onValueChange={(v: PaymentMethod) => set("paymentMethod", v)}>
            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Online Payment">Online Payment (Razorpay)</SelectItem>
              <SelectItem value="QR Payment">QR Payment</SelectItem>
              <SelectItem value="Payment Received">Payment Received (Manual)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {cs.paymentMethod === "Online Payment" && (
          <div className="mt-3 rounded-lg border p-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>Generate a Razorpay link for <span className="font-medium">₹{computedAmount}</span></div>
            <Button size="sm" variant="outline" onClick={() => { persist({ paymentCompleted: true }); toast.success("Payment link sent"); }}>
              Generate & Send
            </Button>
          </div>
        )}
        {cs.paymentMethod === "QR Payment" && (
          <div className="mt-3 rounded-lg border p-4 flex flex-col items-center gap-2">
            <div className="h-24 w-24 rounded-md bg-foreground/10 grid place-items-center text-muted-foreground">
              <QrCode className="h-10 w-10" />
            </div>
            <div className="text-sm">Amount: <span className="font-semibold">₹{computedAmount}</span></div>
            <Button size="sm" variant="outline" onClick={() => persist({ paymentCompleted: true })}>
              Mark Received
            </Button>
          </div>
        )}
        {cs.paymentMethod === "Payment Received" && (
          <div className="mt-3 rounded-lg border p-3 text-sm flex items-center justify-between">
            <span>Confirm payment was received offline.</span>
            <Button size="sm" variant="outline" onClick={() => persist({ paymentCompleted: true })}>
              Confirm Received
            </Button>
          </div>
        )}
        {cs.paymentCompleted && (
          <div className="mt-3 text-xs text-primary flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Payment recorded</div>
        )}
      </SectionCard>

      {/* 5. Create Workspace */}
      <SectionCard icon={Rocket} title="Create Workspace" subtitle="Provision customer account">
        {!cs.workspaceCreated ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Creates workspace, subscription, customer account, admin user and outlet limit.
            </p>
            <Button onClick={createWorkspace} className="sm:w-auto w-full">
              <Rocket className="h-4 w-4" /> Create Workspace
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-primary/30 bg-primary/[0.05] p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Workspace ready
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Workspace</div><div className="font-medium break-all">{cs.workspaceName}</div></div>
              <div><div className="text-xs text-muted-foreground">Login URL</div><div className="font-medium break-all">{cs.loginUrl}</div></div>
              <div><div className="text-xs text-muted-foreground">Email</div><div className="font-medium break-all">{cs.loginEmail}</div></div>
              <div><div className="text-xs text-muted-foreground">Temp Password</div><div className="font-mono">{cs.tempPassword}</div></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={copyCreds}><Copy className="h-4 w-4" /> Copy Credentials</Button>
              <Button size="sm" onClick={sendCreds}><Send className="h-4 w-4" /> Send Credentials</Button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
