import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_STATUSES, LeadStatus, Potential, SOURCES, SALES_PEOPLE } from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export function AddLeadDialog({ open, onOpenChange }: Props) {
  const { addLead } = useLeads();
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    business: "",
    source: SOURCES[0],
    potential: "High" as Potential,
    status: "Pending" as LeadStatus,
    substatus: "",
    nextFollowUp: "",
    assignedTo: SALES_PEOPLE[0],
    notes: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim() || !form.business.trim()) {
      toast.error("Name and Business are required");
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
      notes: form.notes || undefined,
    });
    toast.success("Lead created");
    onOpenChange(false);
    setForm({ ...form, name: "", phone: "", email: "", business: "", substatus: "", nextFollowUp: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Manual Lead</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Contact Details</div>
          </div>
          <div className="space-y-1.5">
            <Label>Lead Name *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Rahul Verma" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxx xxxxx" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@business.in" />
          </div>

          <div className="md:col-span-2 mt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Business Details</div>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Business Name *</Label>
            <Input value={form.business} onChange={(e) => update("business", e.target.value)} placeholder="Tulsi Restaurant" />
          </div>

          <div className="md:col-span-2 mt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Lead Details</div>
          </div>
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
            <Label>Pipeline Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Substatus</Label>
            <Input value={form.substatus} onChange={(e) => update("substatus", e.target.value)} placeholder="Awaiting decision" />
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
          <div className="space-y-1.5 md:col-span-2">
            <Label>Discussion Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Initial discussion summary..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
