import { createContext, useContext, useState, ReactNode } from "react";
import { Lead, LeadStatus, SAMPLE_LEADS, TimelineEntry, Visit, VisitStatus } from "@/lib/sampleData";

interface LeadsCtx {
  leads: Lead[];
  addLead: (l: Omit<Lead, "id" | "createdAt" | "timeline"> & { notes?: string }) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  appendTimeline: (id: string, entry: Omit<TimelineEntry, "id" | "timestamp">) => void;
  setStatus: (
    id: string,
    status: LeadStatus,
    substatus?: string,
    notes?: string,
    followUpDate?: string | null,
    assignedTo?: string
  ) => void;
  scheduleVisit: (id: string, visit: Omit<Visit, "id">) => void;
  updateVisitStatus: (leadId: string, visitId: string, status: VisitStatus, notes?: string) => void;
}

const Ctx = createContext<LeadsCtx | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS);

  const addLead: LeadsCtx["addLead"] = (l) => {
    let newId = "";
    setLeads((prev) => {
      newId = `L-${1000 + prev.length + 1}`;
      const created = new Date().toISOString();
      const newLead: Lead = {
        ...l,
        id: newId,
        createdAt: created,
        timeline: [{ id: "t1", kind: "status", status: l.status, substatus: l.substatus, notes: l.notes, followUpDate: l.nextFollowUp, timestamp: created }],
      };
      return [newLead, ...prev];
    });
    return newId;
  };

  const updateLead: LeadsCtx["updateLead"] = (id, patch) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const appendTimeline: LeadsCtx["appendTimeline"] = (id, entry) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              timeline: [...l.timeline, { ...entry, id: `t${l.timeline.length + 1}`, timestamp: new Date().toISOString() }],
            }
          : l
      )
    );
  };

  const setStatus: LeadsCtx["setStatus"] = (id, status, substatus, notes, followUpDate, assignedTo) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const nextFollow =
          followUpDate === undefined ? l.nextFollowUp : followUpDate || undefined;
        return {
          ...l,
          status,
          substatus,
          nextFollowUp: nextFollow,
          assignedTo: assignedTo ?? l.assignedTo,
          notes: notes?.trim() ? notes.trim() : l.notes,
          timeline: [
            ...l.timeline,
            {
              id: `t${l.timeline.length + 1}`,
              kind: "status",
              status,
              substatus,
              notes: notes?.trim() || undefined,
              followUpDate: nextFollow,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const scheduleVisit: LeadsCtx["scheduleVisit"] = (id, visit) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const vid = `v${(l.visits?.length ?? 0) + 1}`;
        const newVisit: Visit = { ...visit, id: vid };
        return {
          ...l,
          visits: [...(l.visits ?? []), newVisit],
          timeline: [
            ...l.timeline,
            {
              id: `t${l.timeline.length + 1}`,
              kind: "visit",
              visitType: visit.type,
              visitStatus: visit.status,
              assignedTo: visit.assignedTo,
              notes: visit.notes,
              followUpDate: visit.date,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const updateVisitStatus: LeadsCtx["updateVisitStatus"] = (leadId, visitId, status, notes) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const visits = (l.visits ?? []).map((v) => (v.id === visitId ? { ...v, status, notes: notes ?? v.notes } : v));
        const v = visits.find((x) => x.id === visitId);
        return {
          ...l,
          visits,
          timeline: [
            ...l.timeline,
            {
              id: `t${l.timeline.length + 1}`,
              kind: "visit",
              visitType: v?.type,
              visitStatus: status,
              assignedTo: v?.assignedTo,
              notes,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  return (
    <Ctx.Provider value={{ leads, addLead, updateLead, appendTimeline, setStatus, scheduleVisit, updateVisitStatus }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLeads must be used inside LeadsProvider");
  return ctx;
}
