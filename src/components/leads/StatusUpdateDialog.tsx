import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LEAD_STATUSES, LeadStatus, Lead, SUBSTATUS_MAP,
  VISIT_TYPES, VISIT_STATUSES, VisitType, VisitStatus, SALES_PEOPLE,
} from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead | null;
  initialStatus?: LeadStatus;
  title?: string;
}

const visitStatuses: LeadStatus[] = ["Schedule Visit", "Visit Done"];

export function StatusUpdateDialog({ open, onOpenChange, lead, initialStatus, title }: Props) {
  const { setStatus, scheduleVisit } = useLeads();
  const [status, setStatusVal] = useState<LeadStatus>("Cold Call");
  const [substatus, setSubstatus] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [note, setNote] = useState("");

  // visit
  const [visitType, setVisitType] = useState<VisitType>("Cold Visit");
  const [visitStatus, setVisitStatus] = useState<VisitStatus>("Scheduled");
  const [visitDate, setVisitDate] = useState("");
  const [visitAssignee, setVisitAssignee] = useState(SALES_PEOPLE[0]);
  const [visitNote, setVisitNote] = useState("");

  useEffect(() => {
    if (open && lead) {
      const s = initialStatus ?? lead.status;
      setStatusVal(s);
      setSubstatus("");
      setFollowUpDate("");
      setNote("");
      setVisitType(s === "Schedule Visit" ? "Cold Visit" : "Demo Visit");
      setVisitStatus("Scheduled");
      setVisitDate("");
      setVisitAssignee(lead.assignedTo || SALES_PEOPLE[0]);
      setVisitNote("");
    }
  }, [open, lead, initialStatus]);

  const subs = useMemo(() => SUBSTATUS_MAP[status] ?? [], [status]);
  const showVisit = visitStatuses.includes(status);

  if (!lead) return null;

  const submit = () => {
    setStatus(lead.id, status, substatus || undefined, note || undefined, followUpDate ? new Date(followUpDate).toISOString() : undefined);
    if (showVisit && visitDate) {
      scheduleVisit(lead.id, {
        type: visitType,
        date: new Date(visitDate).toISOString(),
        assignedTo: visitAssignee,
        status: visitStatus,
        notes: visitNote || undefined,
      });
    }
    toast.success("Status updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title ?? "Update Status"} — {lead.business}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Main Status</Label>
              <Select value={status} onValueChange={(v) => { setStatusVal(v as LeadStatus); setSubstatus(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Substatus</Label>
              <Select value={substatus} onValueChange={setSubstatus}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{subs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Follow-up Date</Label>
            <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Note</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Discussion summary..." />
          </div>

          {showVisit && (
            <div className="rounded-lg border border-primary/30 bg-primary/[0.03] p-3 space-y-3">
              <div className="text-sm font-semibold">Visit Details</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Visit Type</Label>
                  <Select value={visitType} onValueChange={(v) => setVisitType(v as VisitType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VISIT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Visit Status</Label>
                  <Select value={visitStatus} onValueChange={(v) => setVisitStatus(v as VisitStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VISIT_STATUSES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Visit Date</Label>
                  <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned To</Label>
                  <Select value={visitAssignee} onValueChange={setVisitAssignee}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SALES_PEOPLE.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Visit Notes</Label>
                  <Textarea rows={2} value={visitNote} onChange={(e) => setVisitNote(e.target.value)} placeholder="Notes about the visit..." />
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
