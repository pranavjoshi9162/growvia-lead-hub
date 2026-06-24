import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  LEAD_STATUSES, Lead, LeadStatus, SUBSTATUS_MAP, SOURCES, SALES_PEOPLE,
  BUSINESS_TYPES, BusinessType, VISIT_TYPES, VisitType, Potential,
  ACTIVE_SALES_TEAM, DEFAULT_LOGGED_IN_SALES_REP, leadStatusDisplay,
} from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";
import {
  Zap, FileText, User2, Building2, Settings2, MessagesSquare,
  Activity, MapPin, Plus, Trash2, ChevronsUpDown, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerSetupTab } from "./CustomerSetupTab";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** When set, dialog opens in edit mode with the full multi-tab form prefilled. */
  editingLead?: Lead | null;
}

type TabKey = "quick" | "detailed" | "sales" | "visits" | "notes" | "setup";

interface Outlet {
  name: string;
  address: string;
  mapsLink: string;
  city: string;
  state: string;
}

const newOutlet = (): Outlet => ({ name: "", address: "", mapsLink: "", city: "", state: "" });

const todayInput = () => new Date().toISOString().slice(0, 10);

const quickInitial = {
  name: "",
  phone: "",
  business: "",
  address: "",
  assignedTo: DEFAULT_LOGGED_IN_SALES_REP,
  leadDate: todayInput(),
};

const detailedInitial = {
  // basic
  name: "", phone: "", email: "",
  leadDate: todayInput(),
  // business
  business: "", businessType: "" as BusinessType | "",
  outlets: [newOutlet()] as Outlet[],
  outletsCount: "", staffCount: "",
  // operational
  currentPlatform: "", existingLoyalty: "", whatsappMarketing: "",
  monthlyCustomers: "", revenueRange: "",
  // notes
  clientNotes: "", adminNotes: "",
  // sales (create-only)
  source: SOURCES[0],
  status: "New Lead" as LeadStatus,
  substatus: "",
  nextFollowUp: "",
  assignedTo: SALES_PEOPLE[0],
  conversionStatus: "" as "" | "In Pipeline" | "converted" | "Lost",
  // visit
  visitType: "Cold Visit" as VisitType,
  visitDate: "",
  visitTime: "",
  visitAssignedTo: SALES_PEOPLE[0],
  visitNotes: "",
};

const TABS: { key: TabKey; label: string; icon: any; editOnly?: boolean; createOnly?: boolean }[] = [
  { key: "quick", label: "Quick Lead", icon: Zap },
  { key: "detailed", label: "Detailed Form", icon: FileText },
  { key: "sales", label: "Sales / Pipeline", icon: Activity, createOnly: true },
  { key: "visits", label: "Visits", icon: MapPin },
  { key: "notes", label: "Discussion & Notes", icon: MessagesSquare },
  { key: "setup", label: "Customer Setup", icon: Rocket, editOnly: true },
];

function TabHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 flex-1 text-left">
      <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
      </div>
    </div>
  );
}

function followUpInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function AssignedToCombobox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between font-normal px-3 py-2"
        >
          <span className="truncate">{value}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search team member…" className="h-9" />
          <CommandList>
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup>
              {options.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AddLeadDialog({ open, onOpenChange, editingLead }: Props) {
  const { addLead, scheduleVisit, updateLead } = useLeads();
  const [tab, setTab] = useState<TabKey>("quick");
  const [quick, setQuick] = useState(quickInitial);
  const [form, setForm] = useState(detailedInitial);
  const isEdit = !!editingLead;

  const resetAll = () => {
    setQuick(quickInitial);
    setForm(detailedInitial);
    setTab("quick");
  };

  useEffect(() => {
    if (!open) return;
    if (editingLead) {
      const primaryOutlet = editingLead.outletAddress
        ? [{ ...newOutlet(), address: editingLead.outletAddress }]
        : [newOutlet()];
      setQuick({
        name: editingLead.name,
        phone: editingLead.phone,
        business: editingLead.business,
        address: editingLead.outletAddress ?? "",
        assignedTo: editingLead.assignedTo,
        leadDate: editingLead.createdAt ? new Date(editingLead.createdAt).toISOString().slice(0, 10) : todayInput(),
      });
      const src = SOURCES.includes(editingLead.source) ? editingLead.source : SOURCES[0];
      const subs = SUBSTATUS_MAP[editingLead.status] ?? [];
      const sub =
        editingLead.substatus && subs.includes(editingLead.substatus)
          ? editingLead.substatus
          : subs[0] ?? "";
      setForm({
        ...detailedInitial,
        name: editingLead.name,
        phone: editingLead.phone,
        email: editingLead.email,
        leadDate: editingLead.createdAt ? new Date(editingLead.createdAt).toISOString().slice(0, 10) : todayInput(),
        business: editingLead.business,
        businessType: editingLead.businessType ?? "",
        outlets: primaryOutlet,
        outletsCount: editingLead.outletsCount != null ? String(editingLead.outletsCount) : "",
        staffCount: editingLead.staffCount != null ? String(editingLead.staffCount) : "",
        currentPlatform: editingLead.currentPlatform ?? "",
        source: src,
        status: editingLead.status,
        substatus: sub,
        nextFollowUp: followUpInputValue(editingLead.nextFollowUp),
        assignedTo: editingLead.assignedTo,
        clientNotes: editingLead.clientNotes ?? "",
        adminNotes: editingLead.internalNotes ?? "",
        visitType: "Cold Visit",
        visitDate: "",
        visitTime: "",
        visitAssignedTo: editingLead.assignedTo,
        visitNotes: "",
      });
      setTab("quick");
    } else {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when opening add vs edit
  }, [open, editingLead?.id]);

  const updateQ = (k: string, v: any) => setQuick((f) => ({ ...f, [k]: v }));
  const updateD = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const updateOutlet = (i: number, k: keyof Outlet, v: string) => {
    setForm((f) => {
      const outlets = f.outlets.slice();
      outlets[i] = { ...outlets[i], [k]: v };
      return { ...f, outlets };
    });
  };
  const addOutlet = () => setForm((f) => ({ ...f, outlets: [...f.outlets, newOutlet()] }));
  const removeOutlet = (i: number) => setForm((f) => ({ ...f, outlets: f.outlets.filter((_, idx) => idx !== i) }));

  const close = () => { onOpenChange(false); resetAll(); };

  const saveQuick = (goToVisit: boolean) => {
    if (!quick.name.trim() || !quick.phone.trim() || !quick.business.trim()) {
      toast.error("Client name, phone and business name are required");
      return;
    }
    if (goToVisit) {
      // Pre-fill detailed form and switch to visits tab
      setForm((f) => ({
        ...f,
        name: quick.name.trim(),
        phone: quick.phone.trim(),
        business: quick.business.trim(),
        assignedTo: quick.assignedTo,
        visitAssignedTo: quick.assignedTo,
        outlets: [{ ...newOutlet(), address: quick.address.trim() }],
      }));
      setTab("visits");
      toast.info("Now schedule the visit");
      return;
    }
    addLead({
      name: quick.name.trim(),
      phone: quick.phone.trim(),
      email: "",
      business: quick.business.trim(),
      source: "Manual Entry",
      potential: "High",
      status: "New Lead",
      substatus: "Manual Entry",
      assignedTo: quick.assignedTo,
      outletAddress: quick.address.trim() || undefined,
    });
    toast.success("Lead added — New Lead · Manual Entry");
    close();
  };

  const saveAll = () => {
    const f =
      isEdit && tab === "quick"
        ? {
            ...form,
            name: quick.name.trim(),
            phone: quick.phone.trim(),
            business: quick.business.trim(),
            assignedTo: quick.assignedTo,
            outlets: [{ ...(form.outlets[0] ?? newOutlet()), address: quick.address.trim() }],
          }
        : form;

    if (!f.name.trim() && !f.business.trim() && !f.phone.trim()) {
      toast.error("Add at least a name, phone or business");
      return;
    }
    const primary = f.outlets[0];
    const address = primary
      ? [primary.address, primary.city, primary.state].filter(Boolean).join(", ")
      : "";
    const otherOutlets = f.outlets
      .slice(1)
      .map((o, i) => `Outlet ${i + 2}: ${o.name || "—"} | ${[o.address, o.city, o.state].filter(Boolean).join(", ")}${o.mapsLink ? ` | ${o.mapsLink}` : ""}`)
      .filter(Boolean)
      .join("\n");

    const internalNotes = [
      f.adminNotes,
      otherOutlets,
      primary?.mapsLink && `Maps: ${primary.mapsLink}`,
      f.existingLoyalty && `Loyalty: ${f.existingLoyalty}`,
      f.whatsappMarketing && `WhatsApp: ${f.whatsappMarketing}`,
      f.monthlyCustomers && `Monthly customers: ${f.monthlyCustomers}`,
      f.revenueRange && `Revenue: ${f.revenueRange}`,
      f.conversionStatus &&
        `Conversion: ${f.conversionStatus === "converted" ? "Sale Done" : f.conversionStatus}`,
    ]
      .filter(Boolean)
      .join("\n") || undefined;

    const patch: Partial<Lead> = {
      name: f.name.trim() || "Unnamed Lead",
      phone: f.phone.trim(),
      email: f.email.trim(),
      business: f.business.trim() || "—",
      source: f.source,
      status: f.status,
      substatus: f.substatus || undefined,
      nextFollowUp: f.nextFollowUp ? new Date(f.nextFollowUp).toISOString() : undefined,
      assignedTo: f.assignedTo,
      outletAddress: address || undefined,
      outletsCount: f.outletsCount ? Number(f.outletsCount) : undefined,
      staffCount: f.staffCount ? Number(f.staffCount) : undefined,
      currentPlatform: f.currentPlatform || undefined,
      businessType: (f.businessType || undefined) as BusinessType | undefined,
      clientNotes: f.clientNotes || undefined,
      internalNotes,
    };

    if (isEdit && editingLead) {
      updateLead(editingLead.id, { ...patch, potential: editingLead.potential });
      if (f.visitDate) {
        const dateIso = new Date(`${f.visitDate}T${f.visitTime || "10:00"}`).toISOString();
        scheduleVisit(editingLead.id, {
          type: f.visitType,
          date: dateIso,
          assignedTo: f.visitAssignedTo,
          status: "Scheduled",
          notes: f.visitNotes || undefined,
        });
      }
      toast.success("Lead updated");
      close();
      return;
    }

    const newId = addLead({
      ...(patch as Parameters<typeof addLead>[0]),
      potential: "High" as Potential,
      notes: undefined,
    });

    if (f.visitDate) {
      const dateIso = new Date(`${f.visitDate}T${f.visitTime || "10:00"}`).toISOString();
      scheduleVisit(newId, {
        type: f.visitType,
        date: dateIso,
        assignedTo: f.visitAssignedTo,
        status: "Scheduled",
        notes: f.visitNotes || undefined,
      });
    }

    toast.success("Lead saved");
    close();
  };

  const subOptions = SUBSTATUS_MAP[form.status] ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetAll(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">{isEdit ? "Edit Lead" : "Add Lead"}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Update every section — same layout as adding a manual lead."
              : "Capture quickly, then qualify progressively across tabs."}
          </p>

          {/* Tabs */}
          <div className="mt-4 flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1 self-start">
            {TABS.filter((t) => !t.editOnly || isEdit).map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition",
                    active ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {/* QUICK LEAD */}
        {tab === "quick" && (
          <div className="px-6 py-5 space-y-5">
            <section className="rounded-xl border border-border p-5">
              <TabHeader icon={Zap} title="Quick Lead Capture" subtitle="Just the essentials — qualify later" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Client Name *</Label>
                  <Input value={quick.name} onChange={(e) => updateQ("name", e.target.value)} placeholder="Rahul Sharma" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number *</Label>
                  <Input value={quick.phone} onChange={(e) => updateQ("phone", e.target.value)} placeholder="+91 98xxx xxxxx" />
                </div>
                <div className="space-y-1.5">
                  <Label>Business Name *</Label>
                  <Input value={quick.business} onChange={(e) => updateQ("business", e.target.value)} placeholder="Spice Route Restaurant" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input value={quick.address} onChange={(e) => updateQ("address", e.target.value)} placeholder="Adajan, Surat" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assigned To</Label>
                    <AssignedToCombobox
                      value={quick.assignedTo}
                      onChange={(v) => updateQ("assignedTo", v)}
                      options={ACTIVE_SALES_TEAM}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-primary/[0.04] border border-primary/15 px-3 py-2 text-xs text-muted-foreground">
                Will auto-assign status <span className="font-medium text-foreground">New Lead</span> ·{" "}
                <span className="font-medium text-foreground">Manual Entry</span>
              </div>
            </section>
          </div>
        )}

        {/* DETAILED FORM */}
        {tab === "detailed" && (
          <div className="px-6 py-4">
            <Accordion type="single" collapsible defaultValue="basic" className="space-y-2">
              <AccordionItem value="basic" className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <TabHeader icon={User2} title="Basic Details" subtitle="Primary contact information" />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Client Name</Label><Input value={form.name} onChange={(e) => updateD("name", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Phone Number</Label><Input value={form.phone} onChange={(e) => updateD("phone", e.target.value)} /></div>
                    <div className="space-y-1.5 md:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => updateD("email", e.target.value)} /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="business" className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <TabHeader icon={Building2} title="Business Details" subtitle="Business profile and outlets" />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Business Name</Label><Input value={form.business} onChange={(e) => updateD("business", e.target.value)} /></div>
                    <div className="space-y-1.5">
                      <Label>Business Type</Label>
                      <Select value={form.businessType || undefined} onValueChange={(v) => updateD("businessType", v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{BUSINESS_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Number of Outlets</Label><Input type="number" min="1" value={form.outletsCount} onChange={(e) => updateD("outletsCount", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Number of Staff</Label><Input type="number" min="1" value={form.staffCount} onChange={(e) => updateD("staffCount", e.target.value)} /></div>
                  </div>

                  {/* Multi-outlet addresses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Outlet Addresses</Label>
                      <Button type="button" size="sm" variant="outline" onClick={addOutlet}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Outlet
                      </Button>
                    </div>

                    {form.outlets.map((o, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-primary">Outlet {i + 1}</div>
                          {form.outlets.length > 1 && (
                            <button type="button" onClick={() => removeOutlet(i)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5"><Label>Outlet Name</Label><Input value={o.name} onChange={(e) => updateOutlet(i, "name", e.target.value)} placeholder="Tulsi — Adajan" /></div>
                          <div className="space-y-1.5"><Label>Google Maps Link</Label><Input value={o.mapsLink} onChange={(e) => updateOutlet(i, "mapsLink", e.target.value)} placeholder="https://maps.google.com/..." /></div>
                          <div className="space-y-1.5 md:col-span-2"><Label>Full Address</Label><Input value={o.address} onChange={(e) => updateOutlet(i, "address", e.target.value)} /></div>
                          <div className="space-y-1.5"><Label>City</Label><Input value={o.city} onChange={(e) => updateOutlet(i, "city", e.target.value)} /></div>
                          <div className="space-y-1.5"><Label>State</Label><Input value={o.state} onChange={(e) => updateOutlet(i, "state", e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="operational" className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <TabHeader icon={Settings2} title="Operational Details" subtitle="Current tools and operations" />
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Current Platform Using</Label><Input value={form.currentPlatform} onChange={(e) => updateD("currentPlatform", e.target.value)} placeholder="Petpooja, Posist…" /></div>
                    <div className="space-y-1.5"><Label>Existing Loyalty System</Label><Input value={form.existingLoyalty} onChange={(e) => updateD("existingLoyalty", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>WhatsApp Marketing Using</Label><Input value={form.whatsappMarketing} onChange={(e) => updateD("whatsappMarketing", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Monthly Customer Volume</Label><Input value={form.monthlyCustomers} onChange={(e) => updateD("monthlyCustomers", e.target.value)} /></div>
                    <div className="space-y-1.5 md:col-span-2"><Label>Approx Revenue Range</Label><Input value={form.revenueRange} onChange={(e) => updateD("revenueRange", e.target.value)} placeholder="e.g. ₹5L–₹10L / month" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* SALES */}
        {tab === "sales" && (
          <div className="px-6 py-5">
            <section className="rounded-xl border border-border p-5">
              <TabHeader icon={Activity} title="Sales / Pipeline" subtitle="Main status, substatus, source and follow-ups" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Lead Stage</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => {
                      const ns = v as LeadStatus;
                      const opts = SUBSTATUS_MAP[ns] ?? [];
                      setForm((f) => ({ ...f, status: ns, substatus: opts[0] ?? "" }));
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{leadStatusDisplay(s)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Substatus</Label>
                  <Select value={form.substatus || undefined} onValueChange={(v) => updateD("substatus", v)}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
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
                <div className="space-y-1.5">
                  <Label>Conversion Status</Label>
                  <Select value={form.conversionStatus || undefined} onValueChange={(v) => updateD("conversionStatus", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Pipeline">In Pipeline</SelectItem>
                      <SelectItem value="converted">Sale Done</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VISITS */}
        {tab === "visits" && (
          <div className="px-6 py-5">
            <section className="rounded-xl border border-border p-5">
              <TabHeader icon={MapPin} title="Visit Details" subtitle="Field visit scheduling" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                <div className="space-y-1.5 md:col-span-2"><Label>Visit Notes</Label><Textarea rows={3} value={form.visitNotes} onChange={(e) => updateD("visitNotes", e.target.value)} placeholder="Visit purpose, contact instructions..." /></div>
              </div>
            </section>
          </div>
        )}

        {/* DISCUSSION & NOTES */}
        {tab === "notes" && (
          <div className="px-6 py-5">
            <section className="rounded-xl border border-border p-5">
              <TabHeader icon={MessagesSquare} title="Discussion & Notes" subtitle="Conversation and internal notes" />
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Client Discussion Notes</Label>
                  <Textarea rows={4} value={form.clientNotes} onChange={(e) => updateD("clientNotes", e.target.value)} placeholder="Conversation summary, requests..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Admin Internal Notes</Label>
                  <Textarea rows={4} value={form.adminNotes} onChange={(e) => updateD("adminNotes", e.target.value)} placeholder="Private notes for the team..." />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* CUSTOMER SETUP */}
        {tab === "setup" && isEdit && editingLead && (
          <CustomerSetupTab lead={editingLead} />
        )}

        {tab !== "setup" && (
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 gap-2">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            {isEdit ? (
              <Button onClick={saveAll}>Update Lead</Button>
            ) : tab === "quick" ? (
              <>
                <Button variant="secondary" onClick={() => saveQuick(true)}>
                  Save & Add Visit
                </Button>
                <Button onClick={() => saveQuick(false)}>Save Lead</Button>
              </>
            ) : (
              <Button onClick={saveAll}>Save Lead</Button>
            )}
          </DialogFooter>
        )}
        {tab === "setup" && (
          <DialogFooter className="px-6 py-4 border-t bg-muted/30">
            <Button variant="outline" onClick={close}>Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
