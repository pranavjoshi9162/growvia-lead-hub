import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { Lead, LeadStatus, SAMPLE_LEADS, TimelineEntry, Visit, VisitStatus, Subscription, BillingTxn, SubscriptionEvent } from "@/lib/sampleData";
import { useAuth } from "@/context/AuthContext";

interface SetStatusOptions {
  substatus?: string;
  notes?: string;
  followUpDate?: string | null;
  assignedTo?: string;
  /** When the status actually happened (may differ from now). Defaults to now. */
  statusDate?: string;
}

interface EditLastStatusPatch {
  status?: LeadStatus;
  substatus?: string;
  statusDate?: string;
  followUpDate?: string | null;
  notes?: string;
}

interface LeadsCtx {
  leads: Lead[];
  addLead: (l: Omit<Lead, "id" | "createdAt" | "timeline"> & { notes?: string; createdAt?: string }) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  appendTimeline: (id: string, entry: Omit<TimelineEntry, "id" | "timestamp">) => void;
  setStatus: (id: string, status: LeadStatus, opts?: SetStatusOptions) => void;
  scheduleVisit: (id: string, visit: Omit<Visit, "id">) => void;
  updateVisitStatus: (leadId: string, visitId: string, status: VisitStatus, notes?: string) => void;
  /** Admin-only: correct the most recent status change in place (no new timeline record). */
  editLastStatus: (id: string, patch: EditLastStatusPatch) => void;
  /** Billing: replace or patch subscription. */
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  /** Billing: append a payment / billing transaction. */
  addBillingTxn: (id: string, txn: Omit<BillingTxn, "id">) => void;
  /** Billing: append a subscription lifecycle event. */
  addSubscriptionEvent: (id: string, event: Omit<SubscriptionEvent, "id" | "timestamp"> & { timestamp?: string }) => void;
}

const Ctx = createContext<LeadsCtx | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [allLeads, setLeads] = useState<Lead[]>(SAMPLE_LEADS);
  const { user } = useAuth();
  const actor = user?.name;

  // Role-based visibility: Sales executives only see leads assigned to them.
  const leads = useMemo(() => {
    if (!user || user.role === "super_admin") return allLeads;
    const me = user.salesName ?? user.name;
    return allLeads.filter((l) => l.assignedTo === me);
  }, [allLeads, user]);

  const addLead: LeadsCtx["addLead"] = (l) => {
    let newId = "";
    setLeads((prev) => {
      newId = `L-${1000 + prev.length + 1}`;
      const created = l.createdAt || new Date().toISOString();
      const newLead: Lead = {
        ...l,
        id: newId,
        createdAt: created,
        timeline: [
          {
            id: "t1",
            kind: "status",
            event: "created",
            status: l.status,
            substatus: l.substatus,
            statusDate: created,
            notes: l.notes,
            followUpDate: l.nextFollowUp,
            timestamp: created,
            actor,
          },
        ],
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
              timeline: [
                ...l.timeline,
                { ...entry, id: `t${l.timeline.length + 1}`, timestamp: new Date().toISOString(), actor: entry.actor ?? actor },
              ],
            }
          : l
      )
    );
  };

  const setStatus: LeadsCtx["setStatus"] = (id, status, opts = {}) => {
    const { substatus, notes, followUpDate, assignedTo, statusDate } = opts;
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const nextFollow = followUpDate === undefined ? l.nextFollowUp : followUpDate || undefined;
        const when = statusDate || new Date().toISOString();
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
              event: "status_change",
              status,
              substatus,
              statusDate: when,
              prevStatus: l.status,
              prevSubstatus: l.substatus,
              notes: notes?.trim() || undefined,
              followUpDate: nextFollow,
              timestamp: new Date().toISOString(),
              actor,
            },
          ],
        };
      })
    );
  };

  const editLastStatus: LeadsCtx["editLastStatus"] = (id, patch) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        // Find most recent status-change (or created) timeline entry
        let lastIdx = -1;
        for (let i = l.timeline.length - 1; i >= 0; i--) {
          const e = l.timeline[i];
          if (e.kind === "status") { lastIdx = i; break; }
        }
        if (lastIdx === -1) return l;
        const last = l.timeline[lastIdx];
        const newStatus = patch.status ?? last.status ?? l.status;
        const newSub = patch.substatus !== undefined ? patch.substatus : last.substatus;
        const newDate = patch.statusDate ?? last.statusDate ?? last.timestamp;
        const newFollow = patch.followUpDate === undefined ? l.nextFollowUp : patch.followUpDate || undefined;
        const updatedEntry: TimelineEntry = {
          ...last,
          status: newStatus,
          substatus: newSub,
          statusDate: newDate,
          followUpDate: newFollow,
          notes: patch.notes?.trim() || last.notes,
          timestamp: newDate,
        };
        const timeline = [...l.timeline];
        timeline[lastIdx] = updatedEntry;
        return {
          ...l,
          status: newStatus,
          substatus: newSub,
          nextFollowUp: newFollow,
          timeline,
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
              event: "visit",
              visitType: visit.type,
              visitStatus: visit.status,
              assignedTo: visit.assignedTo,
              notes: visit.notes,
              followUpDate: visit.date,
              timestamp: new Date().toISOString(),
              actor,
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
              event: "visit",
              visitType: v?.type,
              visitStatus: status,
              assignedTo: v?.assignedTo,
              notes,
              timestamp: new Date().toISOString(),
              actor,
            },
          ],
        };
      })
    );
  };

  const updateSubscription: LeadsCtx["updateSubscription"] = (id, patch) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const base: Subscription = l.subscription ?? {
          cycle: "Trial",
          planName: "—",
          outlets: 1,
          unitPrice: 0,
          amount: 0,
          paymentStatus: "Pending",
          subscriptionStatus: "Trial Active",
          history: [],
          events: [],
        };
        return { ...l, subscription: { ...base, ...patch } };
      })
    );
  };

  const addBillingTxn: LeadsCtx["addBillingTxn"] = (id, txn) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (!l.subscription || l.id !== id) return l;
        const t: BillingTxn = { ...txn, id: `b${l.subscription.history.length + 1}` };
        return { ...l, subscription: { ...l.subscription, history: [...l.subscription.history, t] } };
      })
    );
  };

  const addSubscriptionEvent: LeadsCtx["addSubscriptionEvent"] = (id, event) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (!l.subscription || l.id !== id) return l;
        const e: SubscriptionEvent = {
          ...event,
          id: `e${l.subscription.events.length + 1}`,
          timestamp: event.timestamp ?? new Date().toISOString(),
          actor: event.actor ?? actor,
        };
        return { ...l, subscription: { ...l.subscription, events: [...l.subscription.events, e] } };
      })
    );
  };

  return (
    <Ctx.Provider value={{ leads, addLead, updateLead, appendTimeline, setStatus, scheduleVisit, updateVisitStatus, editLastStatus, updateSubscription, addBillingTxn, addSubscriptionEvent }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLeads must be used inside LeadsProvider");
  return ctx;
}
