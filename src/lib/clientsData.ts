export type ClientStatus = "Paid" | "Trial" | "TrialExpiring" | "Overdue" | "PlanExpiry";

export interface ClientRecord {
  id: string;
  name: string;
  owner: string;
  plan: "Gold" | "Silver";
  status: ClientStatus;
  outlets: number;
  mrr: number;
  startedAt: string;
  nextDate?: string; // trial end / next billing / plan expiry
  note?: string;
}

const today = new Date();
const d = (off: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + off);
  return x.toISOString();
};

export const CLIENTS: ClientRecord[] = [
  { id: "C-201", name: "Tulsi Restaurant", owner: "Rahul Verma", plan: "Gold", status: "Paid", outlets: 3, mrr: 8999, startedAt: d(-90), nextDate: d(20) },
  { id: "C-202", name: "Spice Route", owner: "Sneha Reddy", plan: "Gold", status: "Paid", outlets: 2, mrr: 8999, startedAt: d(-60), nextDate: d(15) },
  { id: "C-203", name: "Cafe Amara", owner: "Meera Iyer", plan: "Silver", status: "Paid", outlets: 1, mrr: 4999, startedAt: d(-45), nextDate: d(10) },
  { id: "C-204", name: "The Curry Leaf", owner: "Vikram Joshi", plan: "Gold", status: "Paid", outlets: 2, mrr: 8999, startedAt: d(-120), nextDate: d(25) },
  { id: "C-205", name: "Biryani House", owner: "Karan Singh", plan: "Gold", status: "Trial", outlets: 1, mrr: 0, startedAt: d(-10), nextDate: d(4), note: "Day 10 of 14" },
  { id: "C-206", name: "Green Bowl", owner: "Anita Desai", plan: "Silver", status: "Trial", outlets: 1, mrr: 0, startedAt: d(-3), nextDate: d(11), note: "Just started" },
  { id: "C-207", name: "Urban Thali", owner: "Arjun Kapoor", plan: "Silver", status: "TrialExpiring", outlets: 1, mrr: 0, startedAt: d(-12), nextDate: d(2), note: "Trial expiring in 2 days" },
  { id: "C-208", name: "Mango Leaf Cafe", owner: "Pooja Nair", plan: "Silver", status: "TrialExpiring", outlets: 1, mrr: 0, startedAt: d(-13), nextDate: d(1), note: "Trial expiring tomorrow" },
  { id: "C-209", name: "Royal Tandoor", owner: "Imran Sheikh", plan: "Gold", status: "Overdue", outlets: 2, mrr: 8999, startedAt: d(-150), nextDate: d(-7), note: "7 days overdue" },
  { id: "C-210", name: "Coastal Kitchen", owner: "Divya Nair", plan: "Silver", status: "Overdue", outlets: 1, mrr: 4999, startedAt: d(-200), nextDate: d(-3), note: "3 days overdue" },
  { id: "C-211", name: "Punjabi Dhaba", owner: "Harpreet Singh", plan: "Gold", status: "PlanExpiry", outlets: 2, mrr: 8999, startedAt: d(-340), nextDate: d(8), note: "Annual plan ending" },
  { id: "C-212", name: "Dosa Junction", owner: "Suresh Pillai", plan: "Silver", status: "PlanExpiry", outlets: 1, mrr: 4999, startedAt: d(-355), nextDate: d(5), note: "Renewal due" },
];

export interface SalesRecord {
  id: string;
  client: string;
  plan: "Gold" | "Silver";
  amount: number;
  closedAt: string;
  owner: string;
  type: "New" | "Trial→Paid" | "Renewal";
}

export const SALES: SalesRecord[] = [
  { id: "S-501", client: "Tulsi Restaurant", plan: "Gold", amount: 8999, closedAt: d(-3), owner: "Omii Jariwala", type: "New" },
  { id: "S-502", client: "Spice Route", plan: "Gold", amount: 8999, closedAt: d(-9), owner: "Aisha Khan", type: "Trial→Paid" },
  { id: "S-503", client: "Cafe Amara", plan: "Silver", amount: 4999, closedAt: d(-15), owner: "Priya Shah", type: "Trial→Paid" },
  { id: "S-504", client: "The Curry Leaf", plan: "Gold", amount: 8999, closedAt: d(-20), owner: "Aisha Khan", type: "Renewal" },
  { id: "S-505", client: "Royal Tandoor", plan: "Gold", amount: 8999, closedAt: d(-22), owner: "Omii Jariwala", type: "Trial→Paid" },
  { id: "S-506", client: "Punjabi Dhaba", plan: "Gold", amount: 8999, closedAt: d(-25), owner: "Rahul Mehta", type: "New" },
];
