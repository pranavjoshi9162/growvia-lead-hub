export type Plan = "Gold" | "Silver";
export type Potential = "High" | "Low";

export type LeadStatus =
  | "Cold Call"
  | "Schedule Visit"
  | "Visit Done"
  | "Demo Schedule"
  | "Demo Done"
  | "In-Progress"
  | "Free Trial"
  | "Sale Done"
  | "Closed - Dead";

export const LEAD_STATUSES: LeadStatus[] = [
  "Cold Call",
  "Schedule Visit",
  "Visit Done",
  "Demo Schedule",
  "Demo Done",
  "In-Progress",
  "Free Trial",
  "Sale Done",
  "Closed - Dead",
];

// Substatus options keyed by main status
export const SUBSTATUS_MAP: Record<LeadStatus, string[]> = {
  "Cold Call": [
    "New Lead",
    "Duplicate",
    "Invalid",
    "Connected – Interested",
    "Connected – Not Interested",
    "No Answer – Attempt 1",
    "No Answer – Attempt 2",
    "No Answer – Attempt 3",
    "Wrong Number",
    "Callback Scheduled",
    "DNC – Do Not Call",
    "Paused – Retry Later",
  ],
  "Schedule Visit": [
    "Visit Planned",
    "Visit Checked In",
    "Owner Not Available",
    "Visit Rescheduled",
  ],
  "Visit Done": ["Signed Up", "Trial Requested", "Follow-up Needed"],
  "Demo Schedule": ["Demo Scheduled", "Demo Rescheduled", "No Show"],
  "Demo Done": ["Very Interested", "Considering / Hot", "Not Interested"],
  "In-Progress": [
    "Proposal Sent",
    "Negotiating",
    "Discount Requested",
    "Waiting for Decision",
    "Proposal Rejected",
  ],
  "Free Trial": [
    "Trial Activated",
    "Trial Expired – Converted",
    "Trial Expired – Not Converted",
    "Trial Extended",
  ],
  "Sale Done": ["Active – Onboarding", "Active – Live", "Up for Renewal", "At Risk"],
  "Closed - Dead": [
    "Not Interested",
    "No Budget",
    "Chose Competitor",
    "Bad Timing",
    "Unreachable",
    "Business Closed",
  ],
};

export const SOURCES = ["Website", "Referral", "WhatsApp Campaign", "Walk-in", "Instagram", "Google Ads"];
export const SALES_PEOPLE = ["Omii Jariwala", "Priya Shah", "Rahul Mehta", "Aisha Khan"];

// ---------- Visits ----------
export type VisitType = "Cold Visit" | "Demo Visit" | "Follow-up Visit";
export type VisitStatus = "Scheduled" | "Checked In" | "Completed" | "Missed" | "Rescheduled";

export const VISIT_TYPES: VisitType[] = ["Cold Visit", "Demo Visit", "Follow-up Visit"];
export const VISIT_STATUSES: VisitStatus[] = ["Scheduled", "Checked In", "Completed", "Missed", "Rescheduled"];

export interface Visit {
  id: string;
  type: VisitType;
  date: string;
  assignedTo: string;
  status: VisitStatus;
  notes?: string;
}

// ---------- Timeline ----------
export type TimelineKind = "status" | "visit" | "call" | "demo" | "proposal" | "trial";

export interface TimelineEntry {
  id: string;
  timestamp: string;
  kind?: TimelineKind;
  status?: LeadStatus;
  substatus?: string;
  notes?: string;
  followUpDate?: string;
  // visit fields
  visitType?: VisitType;
  visitStatus?: VisitStatus;
  assignedTo?: string;
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
  visits?: Visit[];
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
    status: "Demo Schedule",
    substatus: "Demo Scheduled",
    nextFollowUp: d(2),
    assignedTo: "Omii Jariwala",
    createdAt: d(-12),
    notes: "Owner is keen on loyalty + WhatsApp campaign module.",
    visits: [
      { id: "v1", type: "Demo Visit", date: d(2), assignedTo: "Omii Jariwala", status: "Scheduled", notes: "Demo at outlet" },
    ],
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", substatus: "New Lead", timestamp: d(-12), notes: "Came from website contact form." },
      { id: "t2", kind: "call", status: "Cold Call", substatus: "Connected – Interested", timestamp: d(-10), notes: "Intro call done, sent pricing." },
      { id: "t3", kind: "status", status: "Demo Schedule", substatus: "Demo Scheduled", timestamp: d(-1), followUpDate: d(2) },
      { id: "t4", kind: "visit", visitType: "Demo Visit", visitStatus: "Scheduled", assignedTo: "Omii Jariwala", timestamp: d(-1), notes: "Demo scheduled at outlet" },
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
    status: "Demo Done",
    substatus: "Considering / Hot",
    nextFollowUp: d(1),
    assignedTo: "Priya Shah",
    createdAt: d(-20),
    visits: [
      { id: "v1", type: "Demo Visit", date: d(-2), assignedTo: "Priya Shah", status: "Completed", notes: "Owner liked loyalty module" },
    ],
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", substatus: "New Lead", timestamp: d(-20) },
      { id: "t2", kind: "call", status: "Cold Call", substatus: "Connected – Interested", timestamp: d(-18), notes: "Referred by Tulsi Restaurant." },
      { id: "t3", kind: "status", status: "Demo Schedule", substatus: "Demo Scheduled", timestamp: d(-10) },
      { id: "t4", kind: "visit", visitType: "Demo Visit", visitStatus: "Completed", assignedTo: "Priya Shah", timestamp: d(-2), notes: "Demo done at cafe" },
      { id: "t5", kind: "status", status: "Demo Done", substatus: "Considering / Hot", timestamp: d(-2), followUpDate: d(1) },
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
    status: "Cold Call",
    substatus: "Callback Scheduled",
    nextFollowUp: d(0),
    assignedTo: "Rahul Mehta",
    createdAt: d(-8),
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", substatus: "New Lead", timestamp: d(-8) },
      { id: "t2", kind: "call", status: "Cold Call", substatus: "Callback Scheduled", timestamp: d(-2), followUpDate: d(0), notes: "Budget concern, callback today" },
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
    status: "Sale Done",
    substatus: "Active – Live",
    assignedTo: "Aisha Khan",
    createdAt: d(-35),
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", timestamp: d(-35) },
      { id: "t2", kind: "status", status: "Demo Done", timestamp: d(-25) },
      { id: "t3", kind: "trial", status: "Free Trial", substatus: "Trial Activated", timestamp: d(-18) },
      { id: "t4", kind: "status", status: "Sale Done", substatus: "Active – Live", timestamp: d(-3), notes: "Onboarded successfully." },
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
    status: "Schedule Visit",
    substatus: "Visit Planned",
    nextFollowUp: d(3),
    assignedTo: "Omii Jariwala",
    createdAt: d(-5),
    visits: [
      { id: "v1", type: "Cold Visit", date: d(1), assignedTo: "Omii Jariwala", status: "Scheduled", notes: "First visit" },
    ],
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", substatus: "New Lead", timestamp: d(-5) },
      { id: "t2", kind: "status", status: "Schedule Visit", substatus: "Visit Planned", timestamp: d(-1), followUpDate: d(3) },
      { id: "t3", kind: "visit", visitType: "Cold Visit", visitStatus: "Scheduled", assignedTo: "Omii Jariwala", timestamp: d(-1), notes: "Visit planned" },
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
    status: "Closed - Dead",
    substatus: "Chose Competitor",
    assignedTo: "Priya Shah",
    createdAt: d(-40),
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", timestamp: d(-40) },
      { id: "t2", kind: "status", status: "Closed - Dead", substatus: "Chose Competitor", timestamp: d(-15) },
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
    status: "Free Trial",
    substatus: "Trial Activated",
    nextFollowUp: d(4),
    assignedTo: "Aisha Khan",
    createdAt: d(-15),
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", timestamp: d(-15) },
      { id: "t2", kind: "status", status: "Demo Done", timestamp: d(-8) },
      { id: "t3", kind: "trial", status: "Free Trial", substatus: "Trial Activated", timestamp: d(-4), followUpDate: d(4) },
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
    status: "Cold Call",
    substatus: "New Lead",
    nextFollowUp: d(0),
    assignedTo: "Rahul Mehta",
    createdAt: d(-1),
    timeline: [
      { id: "t1", kind: "status", status: "Cold Call", substatus: "New Lead", timestamp: d(-1), followUpDate: d(0) },
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
