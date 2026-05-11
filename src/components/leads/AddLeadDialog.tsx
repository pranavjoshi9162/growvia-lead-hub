import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LEAD_STATUSES, LeadStatus, SUBSTATUS_MAP, SOURCES, SALES_PEOPLE,
  BUSINESS_TYPES, BusinessType, VISIT_TYPES, VisitType,
} from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";
import { Zap, FileText, User2, Building2, Settings2, Target, MessagesSquare, Activity, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

type Mode = "quick" | "detailed";

const quickInitial = {
  name: "",
  phone: "",
  business: "",
  addFollowUp: false,
  followUpDate: "",
};

const detailedInitial = {
  // basic
  name: "", phone: "", email: "",
  // business
  business: "", businessType: "" as BusinessType | "",
  outletAddress: "", city: "", state: "", pincode: "", mapsLocation: "",
  outletsCount: "", staffCount: "",
  // operational
  currentPlatform: "", existingLoyalty: "", whatsappMarketing: "",
  monthlyCustomers: "", revenueRange: "",
  // qualification
  potential: "" as "High" | "Medium" | "Cold" | "",
  decisionMaker: "", decisionMakerRole: "", budgetRange: "",
  features: { loyalty: false, wheel: false, reviews: false, whatsapp: false, fullSuite: false },
  // notes
  clientNotes: "", adminComments: "", objections: "", internalNotes: "",
  // status
  source: SOURCES[0],
  status: "Cold Call" as LeadStatus,
  substatus: "New Lead",
  nextFollowUp: "",
  assignedTo: SALES_PEOPLE[0],
  // visit
  visitRequired: false,
  visitDate: "",
  visitTime: "",
  visitAssignedTo: SALES_PEOPLE[0],
  visitNotes: "",
  visitType: "Cold Visit" as VisitType,
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
  const { addLead, scheduleVisit, leads } = useLeads() as any;
  const [mode, setMode] = useState<Mode>("quick");
  const [quick, setQuick] = useState(quickInitial);
  const [form, setForm] = useState(detailedInitial);

  const resetAll = () => { setQuick(quickInitial); setForm(detailedInitial); setMode("quick"); };

  const updateQ = (k: string, v: any) => setQuick((f) => ({ ...f, [k]: v }));
  const updateD = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const saveQuick = (withFollowUp: boolean) => {
    if (!quick.name.trim() || !quick.phone.trim() || !quick.business.trim()) {
      toast.error("Client name, phone and business name are required");
      return;
    }
    if (withFollowUp && !quick.followUpDate) {
      toast.error("Pick a follow-up date");
      return;
    }
    addLead({
      name: quick.name.trim(),
      phone: quick.phone.trim(),
      email: "",
      business: quick.business.trim(),
      source: "Walk-in",
      potential: "High",
      status: "Cold Call",
      substatus: "New Lead",
      nextFollowUp: withFollowUp && quick.followUpDate ? new Date(quick.followUpDate).toISOString() : undefined,
      assignedTo: SALES_PEOPLE[0],
    });
    toast.success("Lead added — Cold Call · New Lead");
    onOpenChange(false);
    resetAll();
  };

  const saveDetailed = () => {
    if (!form.name.trim() && !form.business.trim() && !form.phone.trim()) {
      toast.error("Add at least a name, phone or business");
      return;
    }
    const potentialMapped = form.potential === "High" ? "High" : "Low";
    const features = Object.entries(form.features).filter(([, v]) => v).map(([k]) => k).join(", ");
    const address = [form.outletAddress, form.city, form.state, form.pincode].filter(Boolean).join(", ");

    // append to lead via addLead
    const id = `L-${1000 + (leads?.length ?? 0) + 1}`;
    addLead({
      name: form.name.trim() || "Unnamed Lead",
      phone: form.phone.trim(),
      email: form.email.trim(),
      business: form.business.trim() || "—",
      source: form.source,
      potential: potentialMapped as any,
      status: form.status,
      substatus: form.substatus || undefined,
      nextFollowUp: form.nextFollowUp ? new Date(form.nextFollowUp).toISOString() : undefined,
      assignedTo: form.assignedTo,
      outletAddress: address || undefined,
      outletsCount: form.outletsCount ? Number(form.outletsCount) : undefined,
      staffCount: form.staffCount ? Number(form.staffCount) : undefined,
      currentPlatform: form.currentPlatform || undefined,
      businessType: (form.businessType || undefined) as BusinessType | undefined,
      clientNotes: form.clientNotes || undefined,
      internalNotes: [form.adminComments, form.objections, form.internalNotes, features && `Features: ${features}`,
        form.decisionMaker && `Decision Maker: ${form.decisionMaker}${form.decisionMakerRole ? ` (${form.decisionMakerRole})` : ""}`,
        form.budgetRange && `Budget: ${form.budgetRange}`,
        form.existingLoyalty && `Loyalty system: ${form.existingLoyalty}`,
        form.whatsappMarketing && `WhatsApp marketing: ${form.whatsappMarketing}`,
        form.monthlyCustomers && `Monthly customers: ${form.monthlyCustomers}`,
        form.revenueRange && `Revenue: ${form.revenueRange}`,
        form.mapsLocation && `Maps: ${form.mapsLocation}`,
      ].filter(Boolean).join("\n") || undefined,
    });

    if (form.visitRequired && form.visitDate) {
      const dateIso = new Date(`${form.visitDate}T${form.visitTime || "10:00"}`).toISOString();
      scheduleVisit?.(id, {
        type: form.visitType,
        date: dateIso,
        assignedTo: form.visitAssignedTo,
        status: "Scheduled",
        notes: form.visitNotes || undefined,
      });
    }

    toast.success("Lead saved");
    onOpenChange(false);
    resetAll();
  };

  const subOptions = SUBSTATUS_MAP[form.status] ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetAll(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            {mode === "quick" ? "Quick Lead Capture" : "Detailed Lead Form"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === "quick"
              ? "Add a lead quickly before qualification."
              : "All fields are optional — complete information gradually as the lead progresses."}
          </p>

          {/* Mode toggle */}
          <div className="mt-4 inline-flex rounded-lg border bg-muted/40 p-1 self-start">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition",
                mode === "quick" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="h-3.5 w-3.5" /> Quick Lead
            </button>
            <button
              type="button"
              onClick={() => setMode("detailed")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition",
                mode === "detailed" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" /> Detailed Form
            </button>
          </div>
        </DialogHeader>

        {mode === "quick" ? (
          <div className="px-6 py-5 space-y-5">
            <section className="rounded-xl border border-border p-5">
              <SectionHeader icon={Zap} title="Lead Snapshot" subtitle="Just the essentials — qualify later" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Client Name *</Label>
                  <Input value={quick.name} onChange={(e) => updateQ("name", e.target.value)} placeholder="Rahul Sharma" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number *</Label>
                  <Input value={quick.phone} onChange={(e) => updateQ("phone", e.target.value)} placeholder="+91 98xxx xxxxx" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Business Name *</Label>
                  <Input value={quick.business} onChange={(e) => updateQ("business", e.target.value)} placeholder="Spice Route Restaurant" />
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-primary/[0.04] border border-primary/15 px-3 py-2 text-xs text-muted-foreground">
                Will auto-assign status <span className="font-medium text-foreground">Cold Call</span> · <span className="font-medium text-foreground">New Lead</span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Checkbox id="qf" checked={quick.addFollowUp} onCheckedChange={(v) => updateQ("addFollowUp", !!v)} />
                <Label htmlFor="qf" className="cursor-pointer">Add a follow-up date</Label>
              </div>
              {quick.addFollowUp && (
                <div className="mt-2 max-w-xs">
                  <Input type="date" value={quick.followUpDate} onChange={(e) => updateQ("followUpDate", e.target.value)} />
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* Basic */}
            <section className="rounded-xl border p-5">
              <SectionHeader icon={User2} title="Basic Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Client Name</Label><Input value={form.name} onChange={(e) => updateD("name", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Phone Number</Label><Input value={form.phone} onChange={(e) => updateD("phone", e.target.value)} /></div>
                <div className="space-y-1.5 md:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => updateD("email", e.target.value)} /></div>
              </div>
            </section>

            {/* Business */}
            <section className="rounded-xl border p-5">
              <SectionHeader icon={Building2} title="Business Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Business Name</Label><Input value={form.business} onChange={(e) => updateD("business", e.target.value)} /></div>
                <div className="space-y-1.5">
                  <Label>Business Type</Label>
                  <Select value={form.businessType || undefined} onValueChange={(v) => updateD("businessType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{BUSINESS_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2"><Label>Outlet Address</Label><Input value={form.outletAddress} onChange={(e) => updateD("outletAddress", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={(e) => updateD("city", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>State</Label><Input value={form.state} onChange={(e) => updateD("state", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Pincode</Label><Input value={form.pincode} onChange={(e) => updateD("pincode", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Google Maps Location</Label><Input value={form.mapsLocation} onChange={(e) => updateD("mapsLocation", e.target.value)} placeholder="Paste maps URL" /></div>
                <div className="space-y-1.5"><Label>Number of Outlets</Label><Input type="number" min="1" value={form.outletsCount} onChange={(e) => updateD("outletsCount", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Number of Staff</Label><Input type="number" min="1" value={form.staffCount} onChange={(e) => updateD("staffCount", e.target.value)} /></div>
              </div>
            </section>

            {/* Operational */}
            <section className="rounded-xl border p-5">
              <SectionHeader icon={Settings2} title="Operational Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Current Platform Using</Label><Input value={form.currentPlatform} onChange={(e) => updateD("currentPlatform", e.target.value)} placeholder="Petpooja, Posist…" /></div>
                <div className="space-y-1.5"><Label>Existing Loyalty System</Label><Input value={form.existingLoyalty} onChange={(e) => updateD("existingLoyalty", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>WhatsApp Marketing Using</Label><Input value={form.whatsappMarketing} onChange={(e) => updateD("whatsappMarketing", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Monthly Customer Volume</Label><Input value={form.monthlyCustomers} onChange={(e) => updateD("monthlyCustomers", e.target.value)} /></div>
                <div className="space-y-1.5 md:col-span-2"><Label>Approx Revenue Range</Label><Input value={form.revenueRange} onChange={(e) => updateD("revenueRange", e.target.value)} placeholder="e.g. ₹5L–₹10L / month" /></div>
              </div>
            </section>

            {/* Qualification */}
            <section className="rounded-xl border p-5">
              <SectionHeader icon={Target} title="Sales Qualification" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lead Potential</Label>
                  <Select value={form.potential || undefined} onValueChange={(v) => updateD("potential", v)}>
                    <SelectTrigger><SelectValue placeholder="Select potential" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Budget Range</Label><Input value={form.budgetRange} onChange={(e) => updateD("budgetRange", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Decision Maker Name</Label><Input value={form.decisionMaker} onChange={(e) => updateD("decisionMaker", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Decision Maker Role</Label><Input value={form.decisionMakerRole} onChange={(e) => updateD("decisionMakerRole", e.target.value)} placeholder="Owner, Manager…" /></div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Interested Features</Label>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      ["loyalty", "Loyalty"],
                      ["wheel", "Wheel"],
                      ["reviews", "Reviews"],
                      ["whatsapp", "WhatsApp Campaign"],
                      ["fullSuite", "Full Suite"],
                    ].map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={(form.features as any)[k]}
                          onCheckedChange={(v) => updateD("features", { ...form.features, [k]: !!v })}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-xl border p-5">
              <SectionHeader icon={MessagesSquare} title="Discussion & Notes" />
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5"><Label>Client Discussion Notes</Label><Textarea rows={2} value={form.clientNotes} onChange={(e) => updateD("clientNotes", e.target.value)} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Admin Comments</Label><Textarea rows={2} value={form.adminComments} onChange={(e) => updateD("adminComments", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Objections</Label><Textarea rows={2} value={form.objections} onChange={(e) => updateD("objections", e.target.value)} /></div>
                </div>
                <div className="space-y-1.5"><Label>Internal Notes</Label><Textarea rows={2} value={form.internalNotes} onChange={(e) => updateD("internalNotes", e.target.value)} /></div>
              </div>
            </section>

            {/* Status */}
            <section className="rounded-xl border p-5">
              <SectionHeader icon={Activity} title="Status Management" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Main Status</Label>
                  <Select value={form.status} onValueChange={(v) => updateD("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Substatus</Label>
                  <Select value={form.substatus || undefined} onValueChange={(v) => updateD("substatus", v)}>
                    <SelectTrigger><SelectValue placeholder="Select substatus" /></SelectTrigger>
                    <SelectContent>{subOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Follow-up Date</Label><Input type="date" value={form.nextFollowUp} onChange={(e) => updateD("nextFollowUp", e.target.value)} /></div>
                <div className="space-y-1.5">
                  <Label>Assigned Sales Person</Label>
                  <Select value={form.assignedTo} onValueChange={(v) => updateD("assignedTo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SALES_PEOPLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Lead Source</Label>
                  <Select value={form.source} onValueChange={(v) => updateD("source", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Visit */}
            <section className="rounded-xl border p-5">
              <SectionHeader icon={MapPin} title="Visit Management" />
              <div className="flex items-center gap-2 mb-3">
                <Checkbox id="vr" checked={form.visitRequired} onCheckedChange={(v) => updateD("visitRequired", !!v)} />
                <Label htmlFor="vr" className="cursor-pointer">Visit Required</Label>
              </div>
              {form.visitRequired && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Visit Type</Label>
                    <Select value={form.visitType} onValueChange={(v) => updateD("visitType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{VISIT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assigned Sales Rep</Label>
                    <Select value={form.visitAssignedTo} onValueChange={(v) => updateD("visitAssignedTo", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SALES_PEOPLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Visit Date</Label><Input type="date" value={form.visitDate} onChange={(e) => updateD("visitDate", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Visit Time</Label><Input type="time" value={form.visitTime} onChange={(e) => updateD("visitTime", e.target.value)} /></div>
                  <div className="space-y-1.5 md:col-span-2"><Label>Visit Notes</Label><Textarea rows={2} value={form.visitNotes} onChange={(e) => updateD("visitNotes", e.target.value)} /></div>
                </div>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t bg-muted/30 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {mode === "quick" ? (
            <>
              <Button variant="secondary" onClick={() => saveQuick(true)}>Save & Add Follow-up</Button>
              <Button onClick={() => saveQuick(false)}>Save Lead</Button>
            </>
          ) : (
            <Button onClick={saveDetailed}>Save Lead</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
