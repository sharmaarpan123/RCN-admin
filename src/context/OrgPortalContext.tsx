"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";

const ORG_ID = "org-1";
const DEFAULT_ORG_NAME = "Main Organization — RCN Demo Health";
const STORAGE_KEY = "rcn_org_portal_demo_v10_refdash";

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

// --- Types ---
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
  branches: Branch[];
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

export type InboxRefMode = "sent" | "received";

// --- Demo seed ---
function demoSeed(): { org: Org; users: OrgUser[]; referralsSent: Referral[]; referralsReceived: Referral[] } {
  return {
    org: {
      id: ORG_ID,
      name: DEFAULT_ORG_NAME,
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
    },
    referralsSent: [],
    referralsReceived: [],
    users: [
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
    ],
  };
}

function loadState(): { org: Org; users: OrgUser[]; referralsSent: Referral[]; referralsReceived: Referral[] } {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return demoSeed();
    const data = JSON.parse(raw);
    if (!data || !data.org || !Array.isArray(data.users)) return demoSeed();

    data.org.branches = Array.isArray(data.org.branches) ? data.org.branches : [];
    data.org.phone = typeof data.org.phone === "string" ? data.org.phone : "";
    data.org.email = typeof data.org.email === "string" ? data.org.email : "";
    data.org.ein = typeof data.org.ein === "string" ? data.org.ein : "";

    const a = data.org.address && typeof data.org.address === "object" ? data.org.address : {};
    data.org.address = {
      street: typeof a.street === "string" ? a.street : "",
      apt: typeof a.apt === "string" ? a.apt : "",
      city: typeof a.city === "string" ? a.city : "",
      state: typeof a.state === "string" ? a.state : "",
      zip: typeof a.zip === "string" ? a.zip : "",
    };

    data.org.contact =
      data.org.contact && typeof data.org.contact === "object"
        ? data.org.contact
        : { firstName: "", lastName: "", email: "", tel: "", fax: "" };

    data.referralsSent = Array.isArray(data.referralsSent) ? data.referralsSent : [];
    data.referralsReceived = Array.isArray(data.referralsReceived) ? data.referralsReceived : [];

    data.users.forEach((u: OrgUser) => {
      u.branchIds = Array.isArray(u.branchIds) ? u.branchIds : [];
      u.deptIds = Array.isArray(u.deptIds) ? u.deptIds : [];
      u.orgAssigned = !!u.orgAssigned;
      if (typeof u.firstName !== "string") u.firstName = "";
      if (typeof u.lastName !== "string") u.lastName = "";
    });

    return data;
  } catch {
    return demoSeed();
  }
}

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

// --- Context ---
interface OrgPortalContextType {
  org: Org;
  users: OrgUser[];
  referralsSent: Referral[];
  referralsReceived: Referral[];
  inboxRefMode: InboxRefMode;
  setInboxRefMode: (m: InboxRefMode) => void;
  // Helpers
  branches: () => Branch[];
  findBranch: (id: string) => Branch | null;
  userDisplayName: (u: OrgUser) => string;
  deptBelongsToAssignedBranches: (u: OrgUser, deptId: string) => boolean;
  // Persist
  saveState: () => void;
  // Actions
  saveOrgName: (name: string) => void;
  saveOrgSettings: (data: Partial<Org>) => boolean;
  resetDemo: () => void;
  createUser: () => OrgUser;
  saveUser: (u: OrgUser, data: Partial<OrgUser>) => boolean;
  updatePassword: (u: OrgUser, _opts?: { forceChange?: boolean; sendEmail?: boolean }) => void;
  toggleUserActive: (u: OrgUser) => void;
  removeUserFromOrg: (u: OrgUser) => void;
  deleteUser: (u: OrgUser) => boolean;
  addBranch: (name: string) => void;
  renameBranch: (branchId: string, name: string) => void;
  addDepartment: (branchId: string, name: string) => void;
  renameDepartment: (branchId: string, deptId: string, name: string) => void;
  saveUserBranches: (u: OrgUser, branchIds: string[]) => void;
  saveUserDepts: (u: OrgUser, branchIdsFilter: string[], deptIds: string[]) => void;
  seedReferrals: () => void;
  setReferralStatus: (mode: InboxRefMode, id: string, status: string) => void;
  // Toast
  toast: (title: string, body: string) => void;
  setToast: (fn: (title: string, body: string) => void) => void;
}

const OrgPortalContext = createContext<OrgPortalContextType | undefined>(undefined);

export function useOrgPortal() {
  const ctx = useContext(OrgPortalContext);
  if (!ctx) throw new Error("useOrgPortal must be used within OrgPortalProvider");
  return ctx;
}

interface OrgPortalProviderProps {
  children: ReactNode;
}

export function OrgPortalProvider({ children }: OrgPortalProviderProps) {
  const [data, setData] = useState<{
    org: Org;
    users: OrgUser[];
    referralsSent: Referral[];
    referralsReceived: Referral[];
  }>(demoSeed);

  const isFirstPersist = useRef(true);
  const [inboxRefMode, setInboxRefMode] = useState<InboxRefMode>("received");

  useEffect(() => {
    setData(loadState());
  }, []);

  useEffect(() => {
    if (isFirstPersist.current) {
      isFirstPersist.current = false;
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const [toastFn, setToastFn] = useState<((t: string, b: string) => void) | null>(null);
  const toast = useCallback((title: string, body: string) => {
    toastFn?.(title, body);
  }, [toastFn]);

  const saveState = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const branches = useCallback(() => data.org.branches || [], [data.org.branches]);
  const findBranch = useCallback(
    (id: string) => branches().find((b) => b.id === id) || null,
    [branches]
  );
  const userDisplayName = useCallback((u: OrgUser) => {
    const fn = (u?.firstName || "").trim();
    const ln = (u?.lastName || "").trim();
    return [fn, ln].filter(Boolean).join(" ") || "Unnamed";
  }, []);
  const deptBelongsToAssignedBranches = useCallback(
    (u: OrgUser, deptId: string) => {
      for (const brId of u.branchIds || []) {
        const br = findBranch(brId);
        if (br?.departments?.some((d) => d.id === deptId)) return true;
      }
      return false;
    },
    [findBranch]
  );

  const saveOrgName = useCallback(
    (name: string) => {
      const n = (name || "").trim() || DEFAULT_ORG_NAME;
      setData((d) => ({ ...d, org: { ...d.org, name: n } }));
      toast("Saved", "Organization name updated.");
    },
    [toast]
  );

  const saveOrgSettings = useCallback(
    (input: Partial<Org>): boolean => {
      const o = data.org;
      const phone = (input.phone ?? o.phone ?? "").trim();
      const email = (input.email ?? o.email ?? "").trim();
      const a = input.address ?? o.address ?? { street: "", apt: "", city: "", state: "", zip: "" };
      if (!phone) {
        toast("Missing required field", "Organization Phone is required.");
        return false;
      }
      if (!email) {
        toast("Missing required field", "Organization Email is required.");
        return false;
      }
      if (!isValidEmail(email)) {
        toast("Invalid email", "Please enter a valid Organization Email.");
        return false;
      }
      if (!(a.street || "").trim()) {
        toast("Missing address", "Street is required.");
        return false;
      }
      if (!(a.city || "").trim()) {
        toast("Missing address", "City is required.");
        return false;
      }
      if (!(a.state || "").trim()) {
        toast("Missing address", "State is required.");
        return false;
      }
      if (!(a.zip || "").trim()) {
        toast("Missing address", "Zip is required.");
        return false;
      }
      if (!isLikelyZip(a.zip)) {
        toast("Invalid zip", "Zip must be 5 digits (or ZIP+4).");
        return false;
      }
      const c = input.contact ?? o.contact ?? { firstName: "", lastName: "", email: "", tel: "", fax: "" };
      if ((c.email || "").trim() && !isValidEmail(c.email)) {
        toast("Invalid contact email", "Please enter a valid Contact Person Email (or leave blank).");
        return false;
      }
      setData((d) => ({
        ...d,
        org: {
          ...d.org,
          name: (input.name ?? d.org.name ?? "").trim() || DEFAULT_ORG_NAME,
          phone,
          email,
          ein: (input.ein ?? d.org.ein ?? "").trim(),
          address: { street: (a.street || "").trim(), apt: (a.apt || "").trim(), city: (a.city || "").trim(), state: (a.state || "").trim(), zip: (a.zip || "").trim() },
          contact: c,
        },
      }));
      toast("Organization saved", "Organization profile updated.");
      return true;
    },
    [data.org, toast]
  );

  const resetDemo = useCallback(() => {
    setData(demoSeed());
    toast("Demo reset", "Organization data restored.");
  }, [toast]);

  const createUser = useCallback((): OrgUser => {
    const u: OrgUser = {
      id: uid("u"),
      firstName: "New",
      lastName: "User",
      email: `new.user.${Math.floor(Math.random() * 1000)}@demo.com`,
      phone: "",
      role: "User",
      isAdmin: false,
      isActive: true,
      notes: "",
      orgAssigned: true,
      branchIds: [],
      deptIds: [],
    };
    setData((d) => ({ ...d, users: [u, ...d.users] }));
    toast("User created", "User created.");
    return u;
  }, [toast]);

  const saveUser = useCallback(
    (u: OrgUser, input: Partial<OrgUser>): boolean => {
      const firstName = (input.firstName ?? u.firstName ?? "").trim();
      const lastName = (input.lastName ?? u.lastName ?? "").trim();
      const email = ((input.email ?? u.email) ?? "").trim().toLowerCase();
      if (!firstName) {
        toast("Missing first name", "First Name is required.");
        return false;
      }
      if (!lastName) {
        toast("Missing last name", "Last Name is required.");
        return false;
      }
      if (!email || !email.includes("@")) {
        toast("Invalid email", "Please enter a valid email.");
        return false;
      }
      const dup = data.users.some((x) => x.id !== u.id && (x.email || "").toLowerCase() === email);
      if (dup) {
        toast("Duplicate email", "Another user already has that email.");
        return false;
      }
      setData((d) => ({
        ...d,
        users: d.users.map((x) =>
          x.id === u.id
            ? {
                ...x,
                firstName,
                lastName,
                email,
                phone: (input.phone ?? x.phone ?? "").trim(),
                role: input.role ?? x.role,
                isAdmin: !!input.isAdmin,
                isActive: input.isActive !== undefined ? !!input.isActive : x.isActive,
                notes: (input.notes ?? x.notes ?? "").trim(),
              }
            : x
        ),
      }));
      toast("User saved", "User profile updated.");
      return true;
    },
    [data.users, toast]
  );

  const updatePassword = useCallback((_u: OrgUser, _opts?: { forceChange?: boolean; sendEmail?: boolean }) => {
    toast("Password updated", "Password reset prepared (demo).");
  }, [toast]);

  const toggleUserActive = useCallback(
    (u: OrgUser) => {
      setData((d) => ({
        ...d,
        users: d.users.map((x) => (x.id === u.id ? { ...x, isActive: !x.isActive } : x)),
      }));
      toast(u.isActive ? "User deactivated" : "User activated", "Status updated.");
    },
    [toast]
  );

  const removeUserFromOrg = useCallback(
    (u: OrgUser) => {
      if (!u.orgAssigned) {
        toast("Nothing to remove", "User is already unassigned in this organization.");
        return;
      }
      setData((d) => ({
        ...d,
        users: d.users.map((x) =>
          x.id === u.id ? { ...x, orgAssigned: false, branchIds: [], deptIds: [] } : x
        ),
      }));
      toast("Removed", "User unassigned from this organization.");
    },
    [toast]
  );

  const deleteUser = useCallback(
    (u: OrgUser): boolean => {
      setData((d) => ({ ...d, users: d.users.filter((x) => x.id !== u.id) }));
      toast("User deleted", "User permanently deleted.");
      return true;
    },
    [toast]
  );

  const addBranch = useCallback(
    (name: string) => {
      const n = (name || "").trim();
      if (!n) return;
      setData((d) => ({
        ...d,
        org: {
          ...d.org,
          branches: [...d.org.branches, { id: uid("br"), name: n, departments: [] }],
        },
      }));
      toast("Branch created", "Branch added.");
    },
    [toast]
  );

  const renameBranch = useCallback(
    (branchId: string, name: string) => {
      const n = (name || "").trim();
      if (!n) return;
      setData((d) => ({
        ...d,
        org: {
          ...d.org,
          branches: d.org.branches.map((b) => (b.id === branchId ? { ...b, name: n } : b)),
        },
      }));
      toast("Branch updated", "Branch renamed.");
    },
    [toast]
  );

  const addDepartment = useCallback(
    (branchId: string, name: string) => {
      const n = (name || "").trim();
      if (!n) return;
      setData((d) => ({
        ...d,
        org: {
          ...d.org,
          branches: d.org.branches.map((b) =>
            b.id === branchId ? { ...b, departments: [...(b.departments || []), { id: uid("dp"), name: n }] } : b
          ),
        },
      }));
      toast("Department created", "Department added.");
    },
    [toast]
  );

  const renameDepartment = useCallback(
    (branchId: string, deptId: string, name: string) => {
      const n = (name || "").trim();
      if (!n) return;
      setData((d) => ({
        ...d,
        org: {
          ...d.org,
          branches: d.org.branches.map((b) =>
            b.id === branchId
              ? { ...b, departments: (b.departments || []).map((dp) => (dp.id === deptId ? { ...dp, name: n } : dp)) }
              : b
          ),
        },
      }));
      toast("Department updated", "Department renamed.");
    },
    [toast]
  );

  const saveUserBranches = useCallback(
    (u: OrgUser, branchIds: string[]) => {
      const deptBelongs = (dpId: string) => {
        for (const brId of branchIds) {
          const br = data.org.branches.find((b) => b.id === brId);
          if (br?.departments?.some((d) => d.id === dpId)) return true;
        }
        return false;
      };
      setData((d) => ({
        ...d,
        users: d.users.map((x) =>
          x.id === u.id
            ? {
                ...x,
                branchIds,
                deptIds: (x.deptIds || []).filter(deptBelongs),
                orgAssigned: branchIds.length > 0 || (x.deptIds || []).filter(deptBelongs).length > 0,
              }
            : x
        ),
      }));
      toast("Branches saved", branchIds.length ? "User assigned to selected branches." : "Branches cleared.");
    },
    [data.org.branches, toast]
  );

  const saveUserDepts = useCallback(
    (u: OrgUser, branchIdsFilter: string[], deptIds: string[]) => {
      const deptBelongs = (dpId: string) => {
        for (const brId of branchIdsFilter) {
          const br = data.org.branches.find((b) => b.id === brId);
          if (br?.departments?.some((d) => d.id === dpId)) return true;
        }
        return false;
      };
      const filtered = deptIds.filter(deptBelongs);
      const newBranchIds = Array.from(new Set([...(u.branchIds || []), ...branchIdsFilter]));
      setData((d) => ({
        ...d,
        users: d.users.map((x) =>
          x.id === u.id
            ? { ...x, branchIds: newBranchIds, deptIds: filtered, orgAssigned: newBranchIds.length > 0 || filtered.length > 0 }
            : x
        ),
      }));
      toast("Departments saved", filtered.length ? "User assigned to selected departments." : "Departments cleared.");
    },
    [data.org.branches, toast]
  );

  const seedReferrals = useCallback(() => {
    const today = new Date();
    const d = (daysAgo: number) => {
      const x = new Date(today);
      x.setDate(x.getDate() - daysAgo);
      return x.toISOString();
    };
    const sent: Referral[] = [
      { id: uid("r"), patient: "Judy Leonard", dob: "09/16/1944", service: "Hospice Eval", receiverOrg: "North Suburbs Branch — Clinical Review", status: "Pending", date: d(0) },
      { id: uid("r"), patient: "Irene Felton", dob: "05/02/1945", service: "Home Health", receiverOrg: "Chicago Branch — Intake / Referrals", status: "Accepted", date: d(2) },
      { id: uid("r"), patient: "John Doe", dob: "01/11/1959", service: "Wound Care", receiverOrg: "Chicago Branch — Medical Records", status: "Completed", date: d(7) },
    ];
    const received: Referral[] = [
      { id: uid("r"), patient: "Cassidy Lancaster", dob: "08/03/1980", service: "Neurology Consult", senderOrg: "West Suburbs Clinic", status: "Pending", date: d(1) },
      { id: uid("r"), patient: "Eric Lancaster", dob: "04/14/1974", service: "Internal Medicine", senderOrg: "Urgent Care — Elmhurst", status: "Rejected", date: d(3) },
      { id: uid("r"), patient: "Aisha Patel", dob: "02/05/1970", service: "Pulmonology", senderOrg: "North Suburbs Branch — Scheduling", status: "Paid/Unlocked", date: d(5) },
    ];
    setData((d) => ({ ...d, referralsSent: sent, referralsReceived: received }));
    toast("Loaded", "Demo referrals added.");
  }, [toast]);

  const setReferralStatus = useCallback(
    (mode: InboxRefMode, id: string, status: string) => {
      setData((d) => {
        const key = mode === "received" ? "referralsReceived" : "referralsSent";
        const arr = [...(d[key] || [])];
        const i = arr.findIndex((x) => x.id === id);
        if (i >= 0) arr[i] = { ...arr[i], status };
        return { ...d, [key]: arr };
      });
      toast("Updated", `Status set to ${status}.`);
    },
    [toast]
  );

  const setToast = useCallback((fn: (title: string, body: string) => void) => {
    setToastFn(() => fn);
  }, []);

  const value: OrgPortalContextType = {
    org: data.org,
    users: data.users,
    referralsSent: data.referralsSent,
    referralsReceived: data.referralsReceived,
    inboxRefMode,
    setInboxRefMode,
    branches,
    findBranch,
    userDisplayName,
    deptBelongsToAssignedBranches,
    saveState,
    saveOrgName,
    saveOrgSettings,
    resetDemo,
    createUser,
    saveUser,
    updatePassword,
    toggleUserActive,
    removeUserFromOrg,
    deleteUser,
    addBranch,
    renameBranch,
    addDepartment,
    renameDepartment,
    saveUserBranches,
    saveUserDepts,
    seedReferrals,
    setReferralStatus,
    toast,
    setToast,
  };

  return <OrgPortalContext.Provider value={value}>{children}</OrgPortalContext.Provider>;
}
