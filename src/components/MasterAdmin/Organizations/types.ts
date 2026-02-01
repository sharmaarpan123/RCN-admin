/** Row types for Organizations page tables */
export type OrgTableRow = {
  id: string;
  name: string;
  email: string;
  address: { state?: string; zip?: string; city?: string; street?: string };
  enabled?: boolean;
};

export type OrgUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  adminCap?: boolean;
  resetIntervalDays?: number;
  mfaEmail?: string;
  enabled?: boolean;
};

export type BranchTableRow = {
  id: string;
  name: string;
  enabled?: boolean;
};

export type DeptTableRow = {
  id: string;
  name: string;
  branchId: string;
  enabled?: boolean;
};

export type OrgModulesTab = "profile" | "branches" | "depts" | "users";

/** Shared style classes for forms and buttons */
export const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
export const BTN_CLASS =
  "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
export const BTN_SMALL_CLASS =
  "border cursor-pointer border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0] transition-colors";
export const BTN_PRIMARY_CLASS =
  "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";
