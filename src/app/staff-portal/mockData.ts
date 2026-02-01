/**
 * Mock data for staff-portal pages only.
 * Replaces database.ts usage for profile and wallet.
 */

export const MOCK_SESSION = {
  userId: "staff-1",
  orgId: "org_northlake",
  role: "STAFF",
};

export interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  fax: string;
  address: string;
  role: string;
  notes: string;
  updatedAt?: string;
}

export const MOCK_STAFF_USER: StaffUser = {
  id: "staff-1",
  firstName: "Staff",
  lastName: "User",
  name: "Staff (Northlake)",
  email: "staff@northlake.org",
  phone: "",
  fax: "",
  address: "",
  role: "STAFF",
  notes: "",
  updatedAt: new Date().toISOString(),
};

export interface StaffOrg {
  id: string;
  name: string;
  walletCents: number;
  referralCredits: number;
}

export const MOCK_ORG: StaffOrg = {
  id: "org_northlake",
  name: "Northlake Medical Group",
  walletCents: 0,
  referralCredits: 5,
};

export function nowISO(): string {
  return new Date().toISOString();
}

export function moneyToCents(v: number | string): number {
  return Math.round((parseFloat(String(v || "0")) || 0) * 100);
}
