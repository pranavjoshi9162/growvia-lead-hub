export type Plan = "Gold" | "Silver";
export type Potential = "High" | "Low";

export type LeadStatus =
  | "New Lead"
  | "Contacted"
  | "Visit"
  | "Demo"
  | "Negotiation"
  | "Trial"
  | "Converted"
  | "Lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "New Lead",
  "Contacted",
  "Visit",
  "Demo",
  "Negotiation",
  "Trial",
  "Converted",
  "Lost",
];

export const SUBSTATUS_MAP: Record<LeadStatus, string[]> = {
  // "New Lead" has no substatus — the Source is the channel of origin
  // and stays permanent on the lead. Avoid duplicating it as a substatus.
  "New Lead": [],
  Contacted: [
    "Cold Call",
    "Callback Later",
    "No Answer",
    "Interested",
    "Follow-up Pending",
  ],
  Visit: [
    "Visit Scheduled",
    "Visit Completed",
    "Visit Rescheduled",
    "Owner Unavailable",
    "Visit Missed",
  ],
  Demo: [
    "Demo Scheduled",
    "Demo Completed",
    "Demo Rescheduled",
    "No Show",
    "Follow-up Needed",
  ],
  Negotiation: [
    "Proposal Shared",
    "Pricing Discussion",
    "Discount Requested",
    "Decision Pending",
  ],
  Trial: ["Trial Started", "Trial Active", "Trial Extended", "Trial Expired"],
  Converted: ["Monthly Plan", "Yearly Plan", "Onboarding", "Renewal Pending"],
  Lost: [
    "No Budget",
    "Competitor Chosen",
    "No Response",
    "Not Interested",
    "Business Closed",
  ],
};

/** Lead source / inquiry channel (aligned with New Lead substatuses where applicable). */
export const SOURCES = [
  "Website Inquiry",
  "Referral",
  "SEO Lead",
  "Instagram Lead",
  "YouTube Lead",
  "Manual Entry",
  "WhatsApp Campaign",
  "Walk-in",
  "Google Ads",
];
export const SALES_PEOPLE = ["Omii Jariwala", "Priya Shah", "Rahul Mehta", "Aisha Khan"];

/** Active reps shown in assignee pickers (subset when backend provides it). */
export const ACTIVE_SALES_TEAM = SALES_PEOPLE;

/** Default logged-in rep for Quick Lead until auth is wired. */
export const DEFAULT_LOGGED_IN_SALES_REP = SALES_PEOPLE[0];

/** UI label for pipeline status; backend / data still use `Converted`. */
export function leadStatusDisplay(status: LeadStatus): string {
  return status === "Converted" ? "Sale Done" : status;
}

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
  /** "created" marker for the Lead Created event, distinct from a status change. */
  event?: "created" | "status_change" | "visit" | "note";
  status?: LeadStatus;
  substatus?: string;
  /** When this status / event actually happened (may differ from `timestamp` which is record time). */
  statusDate?: string;
  /** Previous status / substatus, populated on status changes for human-readable diffs. */
  prevStatus?: LeadStatus;
  prevSubstatus?: string;
  notes?: string;
  followUpDate?: string;
  visitType?: VisitType;
  visitStatus?: VisitStatus;
  assignedTo?: string;
  /** Name of the user who logged this entry. */
  actor?: string;
}

export type BusinessType = "Restaurant" | "Salon" | "Bar" | "Cafe" | "Gym" | "Other";
export type DemoType = "Onsite" | "Online" | "Phone";

export const BUSINESS_TYPES: BusinessType[] = ["Restaurant", "Salon", "Bar", "Cafe", "Gym", "Other"];
export const DEMO_TYPES: DemoType[] = ["Onsite", "Online", "Phone"];

export type SubscriptionType = "Trial" | "Monthly" | "Yearly";
export type CustomerSetupStatus = "Pending" | "In Progress" | "Completed";
export type PaymentMethod = "Online Payment" | "QR Payment" | "Payment Received";

export interface CustomerSetupOutlet {
  name: string;
  googleLocation: string;
  address: string;
}

export interface CustomerSetup {
  status: CustomerSetupStatus;
  subscriptionType?: SubscriptionType;
  trialDuration?: "7 Days" | "14 Days" | "30 Days" | "Custom";
  trialDays?: number;
  planMode?: "Existing" | "New";
  existingPlan?: string;
  planPrice?: number;
  newPlanName?: string;
  newPlanPrice?: number;
  newPlanCycle?: "Monthly" | "Yearly";
  newPlanDescription?: string;
  outletsPurchased?: number;
  ownerName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  businessType?: BusinessType;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  website?: string;
  outlets?: CustomerSetupOutlet[];
  paymentMethod?: PaymentMethod;
  paymentAmount?: number;
  paymentCompleted?: boolean;
  workspaceCreated?: boolean;
  workspaceName?: string;
  loginUrl?: string;
  loginEmail?: string;
  tempPassword?: string;
  createdAt?: string;
}

export const AVAILABLE_PLANS: { name: string; price: number }[] = [
  { name: "Silver", price: 2999 },
  { name: "Gold", price: 7999 },
  { name: "Platinum", price: 14999 },
];

// ---------- Billing & Subscription ----------
export type BillingCycle = "Trial" | "Monthly" | "Yearly";
export type BillingPaymentStatus = "Pending" | "Paid" | "Overdue" | "Trial";
export type SubscriptionStatus =
  | "Trial Active"
  | "Trial Expired"
  | "Active"
  | "Renewal Due"
  | "Suspended";
export type BillingPaymentMethod =
  | "Razorpay"
  | "QR Payment"
  | "Cash"
  | "Bank Transfer";

export const BILLING_PAYMENT_METHODS: BillingPaymentMethod[] = [
  "Razorpay",
  "QR Payment",
  "Cash",
  "Bank Transfer",
];

export interface BillingTxn {
  id: string;
  date: string;
  description: string;
  amount: number;
  method?: BillingPaymentMethod;
  status: "Paid" | "Pending" | "Failed";
  reference?: string;
}

export interface SubscriptionEvent {
  id: string;
  timestamp: string;
  event: string;
  actor?: string;
  notes?: string;
}

export interface Subscription {
  cycle: BillingCycle;
  planName: string;
  outlets: number;
  unitPrice: number;
  amount: number;
  paymentStatus: BillingPaymentStatus;
  subscriptionStatus: SubscriptionStatus;
  paymentMethod?: BillingPaymentMethod;
  lastPaidDate?: string;
  lastReference?: string;
  trialStart?: string;
  trialEnd?: string;
  subscriptionStart?: string;
  nextRenewalDate?: string;
  history: BillingTxn[];
  events: SubscriptionEvent[];
}


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
  outletAddress?: string;
  outletsCount?: number;
  staffCount?: number;
  currentPlatform?: string;
  businessType?: BusinessType;
  clientNotes?: string;
  internalNotes?: string;
  demoType?: DemoType;
  demoDate?: string;
  demoOutcome?: string;
  customerSetup?: CustomerSetup;
  subscription?: Subscription;

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
    businessType: "Restaurant",
    outletAddress: "Adajan, Surat",
    phone: "+91 98200 12345",
    email: "rahul@tulsirestaurant.in",
    source: "Website Inquiry",
    potential: "High",
    status: "Demo",
    substatus: "Demo Scheduled",
    nextFollowUp: d(2),
    assignedTo: "Omii Jariwala",
    createdAt: d(-12),
    notes: "Owner is keen on loyalty + WhatsApp campaign module.",
    visits: [
      { id: "v1", type: "Demo Visit", date: d(2), assignedTo: "Omii Jariwala", status: "Scheduled", notes: "Demo at outlet" },
    ],
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-12), notes: "Came from website contact form." },
      { id: "t2", kind: "call", status: "Contacted", substatus: "Interested", timestamp: d(-10), notes: "Intro call done, sent pricing." },
      { id: "t3", kind: "status", status: "Demo", substatus: "Demo Scheduled", timestamp: d(-1), followUpDate: d(2) },
      { id: "t4", kind: "visit", visitType: "Demo Visit", visitStatus: "Scheduled", assignedTo: "Omii Jariwala", timestamp: d(-1), notes: "Demo scheduled at outlet" },
    ],
  },
  {
    id: "L-1002",
    name: "Meera Iyer",
    business: "Cafe Amara",
    businessType: "Cafe",
    outletAddress: "Vesu, Surat",
    phone: "+91 90040 55667",
    email: "hello@cafeamara.in",
    source: "Referral",
    potential: "High",
    status: "Demo",
    substatus: "Follow-up Needed",
    nextFollowUp: d(1),
    assignedTo: "Priya Shah",
    createdAt: d(-20),
    visits: [
      { id: "v1", type: "Demo Visit", date: d(-2), assignedTo: "Priya Shah", status: "Completed", notes: "Owner liked loyalty module" },
    ],
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-20) },
      { id: "t2", kind: "call", status: "Contacted", substatus: "Interested", timestamp: d(-18), notes: "Referred by Tulsi Restaurant." },
      { id: "t3", kind: "status", status: "Demo", substatus: "Demo Scheduled", timestamp: d(-10) },
      { id: "t4", kind: "visit", visitType: "Demo Visit", visitStatus: "Completed", assignedTo: "Priya Shah", timestamp: d(-2), notes: "Demo done at cafe" },
      { id: "t5", kind: "status", status: "Demo", substatus: "Follow-up Needed", timestamp: d(-2), followUpDate: d(1) },
    ],
  },
  {
    id: "L-1003",
    name: "Arjun Kapoor",
    business: "Urban Thali",
    businessType: "Restaurant",
    outletAddress: "Bandra, Mumbai",
    phone: "+91 99876 11221",
    email: "arjun@urbanthali.com",
    source: "WhatsApp Campaign",
    potential: "Low",
    status: "Contacted",
    substatus: "Follow-up Pending",
    nextFollowUp: d(0),
    assignedTo: "Rahul Mehta",
    createdAt: d(-8),
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-8) },
      { id: "t2", kind: "call", status: "Contacted", substatus: "Follow-up Pending", timestamp: d(-2), followUpDate: d(0), notes: "Budget concern, callback today" },
    ],
  },
  {
    id: "L-1004",
    name: "Sneha Reddy",
    business: "Spice Route",
    businessType: "Restaurant",
    outletAddress: "Indiranagar, Bengaluru",
    phone: "+91 97000 88991",
    email: "sneha@spiceroute.in",
    source: "Instagram Lead",
    potential: "High",
    status: "Converted",
    substatus: "Onboarding",
    assignedTo: "Aisha Khan",
    createdAt: d(-35),
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-35) },
      { id: "t2", kind: "status", status: "Demo", substatus: "Demo Completed", timestamp: d(-25) },
      { id: "t3", kind: "trial", status: "Trial", substatus: "Trial Started", timestamp: d(-18) },
      { id: "t4", kind: "status", status: "Converted", substatus: "Onboarding", timestamp: d(-3), notes: "Onboarded successfully." },
    ],
    subscription: {
      cycle: "Monthly",
      planName: "Gold",
      outlets: 2,
      unitPrice: 7999,
      amount: 15998,
      paymentStatus: "Paid",
      subscriptionStatus: "Active",
      paymentMethod: "Razorpay",
      lastPaidDate: d(-3),
      lastReference: "rzp_9AK12N4",
      subscriptionStart: d(-3),
      nextRenewalDate: d(27),
      history: [
        { id: "b1", date: d(-18), description: "Trial Started (14 Days)", amount: 0, status: "Paid" },
        { id: "b2", date: d(-3), description: "Trial Converted · Monthly · Gold × 2 outlets", amount: 15998, method: "Razorpay", status: "Paid", reference: "rzp_9AK12N4" },
      ],
      events: [
        { id: "e1", timestamp: d(-18), event: "Trial Started", notes: "14 day trial" },
        { id: "e2", timestamp: d(-3), event: "Trial Converted", actor: "Aisha Khan", notes: "Monthly · Gold" },
      ],
    },
  },
  {
    id: "L-1005",
    name: "Karan Singh",
    business: "Biryani House",
    businessType: "Restaurant",
    outletAddress: "Charminar, Hyderabad",
    phone: "+91 98989 77665",
    email: "karan@biryanihouse.in",
    source: "Google Ads",
    potential: "High",
    status: "Visit",
    substatus: "Visit Scheduled",
    nextFollowUp: d(3),
    assignedTo: "Omii Jariwala",
    createdAt: d(-5),
    visits: [
      { id: "v1", type: "Cold Visit", date: d(1), assignedTo: "Omii Jariwala", status: "Scheduled", notes: "First visit" },
    ],
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-5) },
      { id: "t2", kind: "status", status: "Visit", substatus: "Visit Scheduled", timestamp: d(-1), followUpDate: d(3) },
      { id: "t3", kind: "visit", visitType: "Cold Visit", visitStatus: "Scheduled", assignedTo: "Omii Jariwala", timestamp: d(-1), notes: "Visit planned" },
    ],
  },
  {
    id: "L-1006",
    name: "Divya Nair",
    business: "Coastal Kitchen",
    businessType: "Cafe",
    outletAddress: "Panjim, Goa",
    phone: "+91 90909 22113",
    email: "divya@coastalkitchen.in",
    source: "Walk-in",
    potential: "Low",
    status: "Lost",
    substatus: "Competitor Chosen",
    assignedTo: "Priya Shah",
    createdAt: d(-40),
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-40) },
      { id: "t2", kind: "status", status: "Lost", substatus: "Competitor Chosen", timestamp: d(-15) },
    ],
  },
  {
    id: "L-1007",
    name: "Vikram Joshi",
    business: "The Curry Leaf",
    businessType: "Restaurant",
    outletAddress: "Andheri, Mumbai",
    phone: "+91 99887 66554",
    email: "vikram@curryleaf.in",
    source: "Referral",
    potential: "High",
    status: "Trial",
    substatus: "Trial Active",
    nextFollowUp: d(4),
    assignedTo: "Aisha Khan",
    createdAt: d(-15),
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-15) },
      { id: "t2", kind: "status", status: "Demo", substatus: "Demo Completed", timestamp: d(-8) },
      { id: "t3", kind: "trial", status: "Trial", substatus: "Trial Active", timestamp: d(-4), followUpDate: d(4) },
    ],
  },
  {
    id: "L-1008",
    name: "Anita Desai",
    business: "Green Bowl",
    businessType: "Cafe",
    outletAddress: "Koregaon Park, Pune",
    phone: "+91 98123 45678",
    email: "anita@greenbowl.in",
    source: "Website Inquiry",
    potential: "Low",
    status: "New Lead",
    nextFollowUp: d(0),
    assignedTo: "Rahul Mehta",
    createdAt: d(-1),
    timeline: [
      { id: "t1", kind: "status", status: "New Lead", timestamp: d(-1), followUpDate: d(0) },
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
