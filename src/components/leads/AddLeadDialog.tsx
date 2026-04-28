import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LEAD_STATUSES, LeadStatus, Potential, SOURCES, SALES_PEOPLE,
  BUSINESS_TYPES, BusinessType, DEMO_TYPES, DemoType,
} from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";
import { User2, Building2, Target, MessagesSquare, Monitor } from "lucide-react";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

const initial = {
  name: "", phone: "", email: "",
  business: "",
  outletAddress: "",
  outletsCount: "",
  staffCount: "",
  currentPlatform: "",
  businessType: "Restaurant" as BusinessType,
  source: SOURCES[0],
  potential: "High" as Potential,
  status: "Pending" as LeadStatus,
  substatus: "",
  nextFollowUp: "",
  assignedTo: SALES_PEOPLE[0],
  clientNotes: "",
  internalNotes: "",
  demoType: "Online" as DemoType,
  demoDate: "",
  demoOutcome: "",
};

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
  );
}

export function AddLeadDialog({ open, onOpenChange }: Props) {
  const { addLead } = useLeads();
  const [form, setForm] = useState(initial);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const showDemoFields = form.status === "Demo Scheduled" || form.status === "Demo Given";

  const submit = () => {
    if (!form.name.trim() || !form.business.trim()) {
      toast.error("Lead Name and Business Name are required");
      return;
    }
    addLead({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      business: form.business.trim(),
      source: form.source,
      potential: form.potential,
      status: form.status,
      substatus: form.substatus || undefined,
      nextFollowUp: form.nextFollowUp ? new Date(form.nextFollowUp).toISOString() : undefined,
      assignedTo: form.assignedTo,
      notes: form.clientNotes || undefined,
      outletAddress: form.outletAddress || undefined,
      outletsCount: form.outletsCount ? Number(form.outletsCount) : undefined,
      staffCount: form.staffCount ? Number(form.staffCount) : undefined,
      currentPlatform: form.currentPlatform || undefined,
      businessType: form.businessType,
      clientNotes: form.clientNotes || undefined,
      internalNotes: form.internalNotes || undefined,
      demoType: showDemoFields ? form.demoType : undefined,
      demoDate: showDemoFields && form.demoDate ? new Date(form.demoDate).toISOString() : undefined,
      demoOutcome: showDemoFields ? form.demoOutcome || undefined : undefined,
    });
    toast.success("Lead created successfully");
    onOpenChange(false);
    setForm(initial);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">Add Manual Lead</DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">Capture full business and qualification details.</p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* Contact Details */}
          <section className="rounded-xl border border-border p-5">
            <SectionHeader icon={User2} title="Contact Details" subtitle="Primary point of contact" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Lead Name *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Rahul Verma" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxx xxxxx" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@business.in" />
              </div>
            </div>
          </section>

          {/* Business Details */}
          <section className="rounded-xl border border-border p-5">
            <SectionHeader icon={Building2} title="Business Details" subtitle="Outlet & operational profile" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Business Name *</Label>
                <Input value={form.business} onChange={(e) => update("business", e.target.value)} placeholder="Tulsi Restaurant" />
              </div>
              <div className="space-y-1.5">
                <Label>Business Type</Label>
                <Select value={form.businessType} onValueChange={(v) => update("businessType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BUSINESS_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Outlet Address</Label>
                <Input value={form.outletAddress} onChange={(e) => update("outletAddress", e.target.value)} placeholder="Shop 12, MG Road, Pune" />
              </div>
              <div className="space-y-1.5">
                <Label>Number of Outlets</Label>
                <Input type="number" min="1" value={form.outletsCount} onChange={(e) => update("outletsCount", e.target.value)} placeholder="2" />
              </div>
              <div className="space-y-1.5">
                <Label>Number of Staff</Label>
                <Input type="number" min="1" value={form.staffCount} onChange={(e) => update("staffCount", e.target.value)} placeholder="15" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Current Platform Used</Label>
                <Input value={form.currentPlatform} onChange={(e) => update("currentPlatform", e.target.value)} placeholder="e.g. Petpooja, Posist, Manual register" />
              </div>
            </div>
          </section>

          {/* Lead Qualification */}
          <section className="rounded-xl border border-border p-5">
            <SectionHeader icon={Target} title="Lead Qualification & Status" subtitle="Pipeline positioning" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Lead Source</Label>
                <Select value={form.source} onValueChange={(v) => update("source", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Lead Potential</Label>
                <Select value={form.potential} onValueChange={(v) => update("potential", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Main Lead Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Substatus / Reason</Label>
                <Input value={form.substatus} onChange={(e) => update("substatus", e.target.value)} placeholder="e.g. Interested, call after 4 days" />
              </div>
              <div className="space-y-1.5">
                <Label>Follow-up Date</Label>
                <Input type="date" value={form.nextFollowUp} onChange={(e) => update("nextFollowUp", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Assigned Sales Person</Label>
                <Select value={form.assignedTo} onValueChange={(v) => update("assignedTo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SALES_PEOPLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Demo Fields (conditional) */}
          {showDemoFields && (
            <section className="rounded-xl border border-primary/30 bg-primary/[0.03] p-5">
              <SectionHeader icon={Monitor} title="Demo Details" subtitle="Required for Demo Scheduled / Demo Given" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Demo Type</Label>
                  <Select value={form.demoType} onValueChange={(v) => update("demoType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEMO_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Demo Date</Label>
                  <Input type="date" value={form.demoDate} onChange={(e) => update("demoDate", e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Demo Outcome Notes</Label>
                  <Textarea rows={3} value={form.demoOutcome} onChange={(e) => update("demoOutcome", e.target.value)} placeholder="Demo outcome, reactions, next steps..." />
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="rounded-xl border border-border p-5">
            <SectionHeader icon={MessagesSquare} title="Discussion & Notes" subtitle="Keep client and internal notes separate" />
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label>Client Discussion Notes</Label>
                <Textarea
                  rows={3}
                  value={form.clientNotes}
                  onChange={(e) => update("clientNotes", e.target.value)}
                  placeholder="Discuss what client said, pain points, objections, requirements..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Internal Admin Comments</Label>
                <Textarea
                  rows={3}
                  value={form.internalNotes}
                  onChange={(e) => update("internalNotes", e.target.value)}
                  placeholder="Internal comments, next strategy, reminders..."
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
