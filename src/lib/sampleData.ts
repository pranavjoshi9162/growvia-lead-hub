export type Plan = "Gold" | "Silver";
export type Potential = "High" | "Low";
export type LeadStatus =
  | "Pending"
  | "Contacted"
  | "Follow Up"
  | "Demo Scheduled"
  | "Demo Given"
  | "Qualified"
  | "Proposal Sent"
  | "Trial Started"
  | "Converted"
  | "Lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "Pending", "Contacted", "Follow Up", "Demo Scheduled", "Demo Given",
  "Qualified", "Proposal Sent", "Trial Started", "Converted", "Lost",
];

export const SOURCES = ["Website", "Referral", "WhatsApp Campaign", "Walk-in", "Instagram", "Google Ads"];
export const SALES_PEOPLE = ["Omii Jariwala", "Priya Shah", "Rahul Mehta", "Aisha Khan"];

export interface TimelineEntry {
  id: string;
  status: LeadStatus;
  substatus?: string;
  notes?: string;
  followUpDate?: string;
  timestamp: string;
}

export type BusinessType = "Restaurant" | "Salon" | "Other";
export type DemoType = "Onsite" | "Online" | "Phone";

export const BUSINESS_TYPES: BusinessType[] = ["Restaurant", "Salon", "Other"];
export const DEMO_TYPES: DemoType[] = ["Onsite", "Online", "Phone"];

export interface Lead {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  source: string;
  potential: Potential;
  status: LeadStatus;
  substatus?: string;
  nextFollowUp?: string;
  assignedTo: string;
  createdAt: string;
  notes?: string;
  timeline: TimelineEntry[];
  // Business details
  outletAddress?: string;
  outletsCount?: number;
  staffCount?: number;
  currentPlatform?: string;
  businessType?: BusinessType;
  // Notes
  clientNotes?: string;
  internalNotes?: string;
  // Demo
  demoType?: DemoType;
  demoDate?: string;
  demoOutcome?: string;
}

const today = new Date();
const d = (offset: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + offset);
  return x.toISOString();
};

export const SAMPLE_LEADS: Lead[] = [
  {
    id: "L-1001",
    name: "Rahul Verma",
    business: "Tulsi Restaurant",
    phone: "+91 98200 12345",
    email: "rahul@tulsirestaurant.in",
    source: "Website",
    potential: "High",
    status: "Demo Scheduled",
    substatus: "Confirmed for Friday",
    nextFollowUp: d(2),
    assignedTo: "Omii Jariwala",
    createdAt: d(-12),
    notes: "Owner is keen on loyalty + WhatsApp campaign module.",
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-12), notes: "Came from website contact form." },
      { id: "t2", status: "Contacted", timestamp: d(-10), notes: "Intro call done, sent pricing." },
      { id: "t3", status: "Follow Up", substatus: "Awaiting decision", timestamp: d(-6), followUpDate: d(-3) },
      { id: "t4", status: "Demo Scheduled", substatus: "Confirmed for Friday", timestamp: d(-1), followUpDate: d(2) },
    ],
  },
  {
    id: "L-1002",
    name: "Meera Iyer",
    business: "Cafe Amara",
    phone: "+91 90040 55667",
    email: "hello@cafeamara.in",
    source: "Referral",
    potential: "High",
    status: "Demo Given",
    substatus: "Evaluating with team",
    nextFollowUp: d(1),
    assignedTo: "Priya Shah",
    createdAt: d(-20),
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-20) },
      { id: "t2", status: "Contacted", timestamp: d(-18), notes: "Referred by Tulsi Restaurant." },
      { id: "t3", status: "Demo Scheduled", timestamp: d(-10) },
      { id: "t4", status: "Demo Given", substatus: "Evaluating with team", timestamp: d(-2), followUpDate: d(1) },
    ],
  },
  {
    id: "L-1003",
    name: "Arjun Kapoor",
    business: "Urban Thali",
    phone: "+91 99876 11221",
    email: "arjun@urbanthali.com",
    source: "WhatsApp Campaign",
    potential: "Low",
    status: "Follow Up",
    substatus: "Budget concern",
    nextFollowUp: d(0),
    assignedTo: "Rahul Mehta",
    createdAt: d(-8),
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-8) },
      { id: "t2", status: "Contacted", timestamp: d(-6) },
      { id: "t3", status: "Follow Up", substatus: "Budget concern", timestamp: d(-2), followUpDate: d(0) },
    ],
  },
  {
    id: "L-1004",
    name: "Sneha Reddy",
    business: "Spice Route",
    phone: "+91 97000 88991",
    email: "sneha@spiceroute.in",
    source: "Instagram",
    potential: "High",
    status: "Converted",
    substatus: "Gold plan signed",
    assignedTo: "Aisha Khan",
    createdAt: d(-35),
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-35) },
      { id: "t2", status: "Contacted", timestamp: d(-33) },
      { id: "t3", status: "Demo Given", timestamp: d(-25) },
      { id: "t4", status: "Trial Started", timestamp: d(-18) },
      { id: "t5", status: "Converted", substatus: "Gold plan signed", timestamp: d(-3), notes: "Onboarded successfully." },
    ],
  },
  {
    id: "L-1005",
    name: "Karan Singh",
    business: "Biryani House",
    phone: "+91 98989 77665",
    email: "karan@biryanihouse.in",
    source: "Google Ads",
    potential: "High",
    status: "Qualified",
    nextFollowUp: d(3),
    assignedTo: "Omii Jariwala",
    createdAt: d(-5),
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-5) },
      { id: "t2", status: "Contacted", timestamp: d(-3) },
      { id: "t3", status: "Qualified", timestamp: d(-1), followUpDate: d(3) },
    ],
  },
  {
    id: "L-1006",
    name: "Divya Nair",
    business: "Coastal Kitchen",
    phone: "+91 90909 22113",
    email: "divya@coastalkitchen.in",
    source: "Walk-in",
    potential: "Low",
    status: "Lost",
    substatus: "Chose competitor",
    assignedTo: "Priya Shah",
    createdAt: d(-40),
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-40) },
      { id: "t2", status: "Contacted", timestamp: d(-38) },
      { id: "t3", status: "Lost", substatus: "Chose competitor", timestamp: d(-15) },
    ],
  },
  {
    id: "L-1007",
    name: "Vikram Joshi",
    business: "The Curry Leaf",
    phone: "+91 99887 66554",
    email: "vikram@curryleaf.in",
    source: "Referral",
    potential: "High",
    status: "Trial Started",
    substatus: "Day 4 of trial",
    nextFollowUp: d(4),
    assignedTo: "Aisha Khan",
    createdAt: d(-15),
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-15) },
      { id: "t2", status: "Demo Given", timestamp: d(-8) },
      { id: "t3", status: "Trial Started", substatus: "Day 4 of trial", timestamp: d(-4), followUpDate: d(4) },
    ],
  },
  {
    id: "L-1008",
    name: "Anita Desai",
    business: "Green Bowl",
    phone: "+91 98123 45678",
    email: "anita@greenbowl.in",
    source: "Website",
    potential: "Low",
    status: "Pending",
    nextFollowUp: d(0),
    assignedTo: "Rahul Mehta",
    createdAt: d(-1),
    timeline: [
      { id: "t1", status: "Pending", timestamp: d(-1), followUpDate: d(0) },
    ],
  },
];

export interface ClientActivity {
  client: string;
  plan: Plan;
  activityScore: number;
  lastActivity: string;
  revenue: number;
  risk: "active" | "at-risk";
}

export const CLIENT_ACTIVITY: ClientActivity[] = [
  { client: "Tulsi Restaurant", plan: "Gold", activityScore: 92, lastActivity: "2h ago", revenue: 8999, risk: "active" },
  { client: "Spice Route", plan: "Gold", activityScore: 88, lastActivity: "5h ago", revenue: 8999, risk: "active" },
  { client: "Cafe Amara", plan: "Silver", activityScore: 81, lastActivity: "1d ago", revenue: 4999, risk: "active" },
  { client: "The Curry Leaf", plan: "Gold", activityScore: 76, lastActivity: "1d ago", revenue: 8999, risk: "active" },
  { client: "Urban Thali", plan: "Silver", activityScore: 34, lastActivity: "12d ago", revenue: 4999, risk: "at-risk" },
  { client: "Coastal Kitchen", plan: "Silver", activityScore: 22, lastActivity: "21d ago", revenue: 4999, risk: "at-risk" },
  { client: "Biryani House", plan: "Gold", activityScore: 41, lastActivity: "9d ago", revenue: 8999, risk: "at-risk" },
];
