import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  LEAD_STATUSES,
  LeadStatus,
  SUBSTATUS_MAP,
  SALES_PEOPLE,
  Lead,
  leadStatusDisplay,
} from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead | null;
  initialStatus?: LeadStatus;
  initialSubstatus?: string;
  title?: string;
  /** When true, edits the most recent status entry in place instead of creating a new one. */
  editLastMode?: boolean;
}

function dateInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

export function StatusUpdateDialog({ open, onOpenChange, lead, initialStatus, initialSubstatus, title, editLastMode }: Props) {
  const { setStatus, editLastStatus } = useLeads();
  const [status, setStatusLocal] = useState<LeadStatus>("Contacted");
  const [substatus, setSubstatus] = useState("");
  const [assignedTo, setAssignedTo] = useState(SALES_PEOPLE[0]);
  const [statusDate, setStatusDate] = useState(todayInput());
  const [followUp, setFollowUp] = useState("");
  const [notes, setNotes] = useState("");

  const subOptions = useMemo(() => SUBSTATUS_MAP[status] ?? [], [status]);

  useEffect(() => {
    if (!open || !lead) return;
    const st = initialStatus ?? lead.status;
    setStatusLocal(st);
    const subs = SUBSTATUS_MAP[st] ?? [];
    let nextSub = "";
    if (initialSubstatus && subs.includes(initialSubstatus)) nextSub = initialSubstatus;
    else if (lead.substatus && subs.includes(lead.substatus) && (!initialStatus || initialStatus === lead.status)) nextSub = lead.substatus;
    else nextSub = subs[0] ?? "";
    setSubstatus(nextSub);
    setAssignedTo(lead.assignedTo || SALES_PEOPLE[0]);
    setFollowUp(dateInputValue(lead.nextFollowUp));
    setNotes("");
    if (editLastMode) {
      // Default to last status entry's statusDate
      const last = [...lead.timeline].reverse().find((e) => e.kind === "status");
      setStatusDate(dateInputValue(last?.statusDate || last?.timestamp) || todayInput());
    } else {
      setStatusDate(todayInput());
    }
  }, [open, lead, initialStatus, initialSubstatus, editLastMode]);

  useEffect(() => {
    if (!subOptions.length) {
      setSubstatus("");
      return;
    }
    if (!subOptions.includes(substatus)) setSubstatus(subOptions[0]);
  }, [status, subOptions, substatus]);

  if (!lead) return null;

  const dialogTitle = title ?? (editLastMode ? "Edit Last Status" : "Change Status");

  const submit = () => {
    if (subOptions.length && !substatus) {
      toast.error("Select a substatus");
      return;
    }
    const followIso = followUp ? new Date(followUp).toISOString() : null;
    const statusIso = statusDate ? new Date(statusDate).toISOString() : new Date().toISOString();
    if (editLastMode) {
      editLastStatus(lead.id, {
        status,
        substatus: substatus || undefined,
        statusDate: statusIso,
        followUpDate: followIso,
        notes,
      });
      toast.success("Last status updated");
    } else {
      setStatus(lead.id, status, {
        substatus: substatus || undefined,
        notes,
        followUpDate: followIso,
        assignedTo,
        statusDate: statusIso,
      });
      toast.success("Status updated");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">{lead.business}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Main Status</Label>
            <Select value={status} onValueChange={(v) => setStatusLocal(v as LeadStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{leadStatusDisplay(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subOptions.length > 0 && (
            <div className="space-y-1.5">
              <Label>Substatus</Label>
              <Select value={substatus || undefined} onValueChange={setSubstatus}>
                <SelectTrigger><SelectValue placeholder="Select substatus" /></SelectTrigger>
                <SelectContent>
                  {subOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status Date</Label>
              <Input type="date" value={statusDate} onChange={(e) => setStatusDate(e.target.value)} />
              <p className="text-[11px] text-muted-foreground">When this status actually happened.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Follow-up Date <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
            </div>
          </div>

          {!editLastMode && (
            <div className="space-y-1.5">
              <Label>Assigned Salesperson</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SALES_PEOPLE.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional update notes…" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{editLastMode ? "Save Correction" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
