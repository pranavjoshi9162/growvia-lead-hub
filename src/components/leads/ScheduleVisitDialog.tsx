import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead, SALES_PEOPLE, VISIT_TYPES, VISIT_STATUSES, VisitType, VisitStatus } from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead | null;
}

export function ScheduleVisitDialog({ open, onOpenChange, lead }: Props) {
  const { scheduleVisit } = useLeads();
  const [type, setType] = useState<VisitType>("Cold Visit");
  const [status, setStatus] = useState<VisitStatus>("Scheduled");
  const [date, setDate] = useState("");
  const [assignedTo, setAssignedTo] = useState(SALES_PEOPLE[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && lead) {
      setType("Cold Visit");
      setStatus("Scheduled");
      setDate("");
      setAssignedTo(lead.assignedTo || SALES_PEOPLE[0]);
      setNotes("");
    }
  }, [open, lead]);

  if (!lead) return null;

  const submit = () => {
    if (!date) { toast.error("Visit date is required"); return; }
    scheduleVisit(lead.id, {
      type, status,
      date: new Date(date).toISOString(),
      assignedTo,
      notes: notes || undefined,
    });
    toast.success("Visit scheduled");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Visit — {lead.business}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Visit Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as VisitType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VISIT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as VisitStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VISIT_STATUSES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visit Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Sales Person</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SALES_PEOPLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visit purpose, contact instructions..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Schedule Visit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
