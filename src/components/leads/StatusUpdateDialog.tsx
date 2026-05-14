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
  /** Pre-select main status (e.g. quick actions from row menu). */
  initialStatus?: LeadStatus;
  /** When set with initialStatus, picks this substatus if valid for that stage. */
  initialSubstatus?: string;
  title?: string;
}

function followUpInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function StatusUpdateDialog({ open, onOpenChange, lead, initialStatus, initialSubstatus, title }: Props) {
  const { setStatus } = useLeads();
  const [status, setStatusLocal] = useState<LeadStatus>("Contacted");
  const [substatus, setSubstatus] = useState("");
  const [assignedTo, setAssignedTo] = useState(SALES_PEOPLE[0]);
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
    else if (
      lead.substatus &&
      subs.includes(lead.substatus) &&
      (!initialStatus || initialStatus === lead.status)
    )
      nextSub = lead.substatus;
    else nextSub = subs[0] ?? "";
    setSubstatus(nextSub);
    setAssignedTo(lead.assignedTo || SALES_PEOPLE[0]);
    setFollowUp(followUpInputValue(lead.nextFollowUp));
    setNotes("");
  }, [open, lead, initialStatus, initialSubstatus]);

  useEffect(() => {
    if (!subOptions.length) {
      setSubstatus("");
      return;
    }
    if (!subOptions.includes(substatus)) setSubstatus(subOptions[0]);
  }, [status, subOptions, substatus]);

  if (!lead) return null;

  const dialogTitle = title ?? "Change Status";

  const submit = () => {
    if (!substatus && subOptions.length) {
      toast.error("Select a substatus");
      return;
    }
    const followIso = followUp ? new Date(followUp).toISOString() : null;
    setStatus(lead.id, status, substatus || undefined, notes || undefined, followIso, assignedTo);
    toast.success("Status updated");
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {leadStatusDisplay(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Substatus</Label>
            <Select value={substatus || undefined} onValueChange={setSubstatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select substatus" />
              </SelectTrigger>
              <SelectContent>
                {subOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned Salesperson</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALES_PEOPLE.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Follow-up Date</Label>
            <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional update notes…" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
