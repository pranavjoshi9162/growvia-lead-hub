import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEAD_STATUSES, LeadStatus, Lead } from "@/lib/sampleData";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead | null;
  initialStatus?: LeadStatus;
  title?: string;
}

export function StatusUpdateDialog({ open, onOpenChange, lead, initialStatus, title }: Props) {
  const { setStatus } = useLeads();
  const [status, setStatusVal] = useState<LeadStatus>("Contacted");
  const [substatus, setSubstatus] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && lead) {
      setStatusVal(initialStatus ?? lead.status);
      setSubstatus("");
      setFollowUpDate("");
      setNote("");
    }
  }, [open, lead, initialStatus]);

  if (!lead) return null;

  const submit = () => {
    setStatus(lead.id, status, substatus || undefined, note || undefined, followUpDate ? new Date(followUpDate).toISOString() : undefined);
    toast.success("Status updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title ?? "Update Status"} — {lead.business}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>New Status</Label>
            <Select value={status} onValueChange={(v) => setStatusVal(v as LeadStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Substatus</Label>
            <Input value={substatus} onChange={(e) => setSubstatus(e.target.value)} placeholder="e.g. Awaiting decision" />
          </div>
          <div className="space-y-1.5">
            <Label>Follow-up Date</Label>
            <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Note</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Discussion summary..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
