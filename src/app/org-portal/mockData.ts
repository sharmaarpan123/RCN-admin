// Mock data for Org Portal

export const US_STATES = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" }, { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" }, { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" }, { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" }, { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" }, { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" }, { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" }, { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" }, { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" }, { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" }, { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" }, { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" }, { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" }, { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" }, { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" }, { abbr: "DC", name: "District of Columbia" },
];

export interface OrgAddress {
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrgContact {
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  fax: string;
}

export interface Dept {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
  departments: Dept[];
  disabled?: boolean;
}

export interface Org {
  id: string;
  name: string;
  phone: string;
  email: string;
  ein: string;
  address: OrgAddress;
  contact: OrgContact;
  branches?: Branch[];
}

export interface OrgUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isAdmin: boolean;
  isActive: boolean;
  notes: string;
  orgAssigned: boolean;
  branchIds: string[];
  deptIds: string[];
}

export interface Referral {
  id: string;
  patient: string;
  dob?: string;
  service?: string;
  senderOrg?: string;
  receiverOrg?: string;
  status: string;
  date: string;
  branch?: string;
  department?: string;
  notes?: string;
}

export const MOCK_ORG: Org = {
  id: "org-1",
  name: "Main Organization — RCN Demo Health",
  phone: "(312) 555-0100",
  email: "admin@rcn-demohealth.com",
  ein: "",
  address: { street: "123 Main St", apt: "", city: "Chicago", state: "IL", zip: "60601" },
  contact: { firstName: "", lastName: "", email: "", tel: "", fax: "" },
  branches: [
    {
      id: "br-1",
      name: "Chicago Branch",
      departments: [
        { id: "dp-1", name: "Intake / Referrals" },
        { id: "dp-2", name: "Medical Records" },
        { id: "dp-3", name: "Billing" },
      ],
    },
    {
      id: "br-2",
      name: "North Suburbs Branch",
      departments: [
        { id: "dp-4", name: "Scheduling" },
        { id: "dp-5", name: "Clinical Review" },
      ],
    },
  ],
};

export const MOCK_USERS: OrgUser[] = [
  {
    id: "u-1",
    firstName: "Mary",
    lastName: "Johnson",
    email: "mary.johnson@demo.com",
    phone: "",
    role: "Admin",
    isAdmin: true,
    isActive: true,
    notes: "",
    orgAssigned: true,
    branchIds: ["br-1", "br-2"],
    deptIds: ["dp-1", "dp-4"],
  },
  {
    id: "u-2",
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@demo.com",
    phone: "",
    role: "User",
    isAdmin: false,
    isActive: true,
    notes: "",
    orgAssigned: true,
    branchIds: ["br-2"],
    deptIds: ["dp-4", "dp-5"],
  },
  {
    id: "u-3",
    firstName: "Aisha",
    lastName: "Patel",
    email: "aisha.patel@demo.com",
    phone: "",
    role: "Manager",
    isAdmin: false,
    isActive: false,
    notes: "Inactive — left organization",
    orgAssigned: true,
    branchIds: ["br-1"],
    deptIds: ["dp-2"],
  },
  {
    id: "u-4",
    firstName: "Unassigned",
    lastName: "User",
    email: "unassigned@demo.com",
    phone: "",
    role: "User",
    isAdmin: false,
    isActive: true,
    notes: "User exists but not assigned here.",
    orgAssigned: false,
    branchIds: [],
    deptIds: [],
  },
];

export const MOCK_REFERRALS_SENT: Referral[] = [];
export const MOCK_REFERRALS_RECEIVED: Referral[] = [];

// Helper functions
export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(16).slice(2, 8)}${Date.now().toString(16).slice(-4)}`;
}

export function isValidEmail(v: string): boolean {
  const s = (v || "").trim();
  return s.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function isLikelyZip(v: string): boolean {
  return /^\d{5}(-\d{4})?$/.test((v || "").trim());
}

export function userDisplayName(u: OrgUser): string {
  const fn = (u?.firstName || "").trim();
  const ln = (u?.lastName || "").trim();
  return [fn, ln].filter(Boolean).join(" ") || "Unnamed";
}
