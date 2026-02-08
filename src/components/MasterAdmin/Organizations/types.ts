/** Raw item from GET /api/admin/organization response (use as-is, no shaping). */
export type AdminOrganizationListItem = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  dial_code?: string;
  phone_number?: string;
  fax_number?: string;
  role_id?: number;
  organization_id: string;
  status?: number;
  organization?: {
    _id: string;
    name?: string;
    email?: string;
    dial_code?: string;
    phone_number?: string;
    ein_number?: string;
    street?: string;
    suite?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    latitude?: string;
    longitude?: string;
    location?: { type?: string; coordinates?: number[] };
    branches?: unknown[];
    users?: unknown[];
  };
};

/** Row type for organizations table when using raw API response. */
export type OrgTableRow = AdminOrganizationListItem;

export type OrgUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  adminCap?: boolean;
  resetIntervalDays?: number;
  mfaEmail?: boolean;
  enabled?: boolean;
};

/** Raw item from GET /api/admin/organization/branch/:organizationId (use as-is). */
export type AdminBranchListItem = {
  _id: string;
  name?: string;
  organization_id?: string;
  status?: number;
  departments?: unknown[];
  [key: string]: unknown;
};

/** Embedded branch object (e.g. branch_id in department response). */
export type AdminBranchEmbedded = {
  _id: string;
  name?: string;
  organization_id?: string;
  status?: number;
  credits_used?: number;
  createdAt?: string;
  updatedAt?: string;
};

/** Row type for branches table when using raw API response. */
export type BranchTableRow = AdminBranchListItem;

/** Raw item from GET /api/admin/organization/department/:orgId/:branchId (use as-is). */
export type AdminDepartmentListItem = {
  _id: string;
  name?: string;
  organization_id?: string;
  branch_id?: AdminBranchEmbedded;
  status?: number;
  [key: string]: unknown;
};

export type DeptTableRow = AdminDepartmentListItem

export type BranchListBody = {
  page: number;
  limit: number;
  search: string;
};

export type OrgModulesTab = "profile" | "branches" | "depts" | "users";

export type AdminOrgModal = {
  isOpen: boolean;
  mode: string;
  editId?: string | null;
};

/** Shared style classes for forms and buttons */
export const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
export const BTN_CLASS =
  "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
export const BTN_SMALL_CLASS =
  "border cursor-pointer border-rcn-border bg-white px-2.5 py-2 rounded-xl text-xs font-semibold hover:border-[#c9ddd0] transition-colors";
export const BTN_PRIMARY_CLASS =
  "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";
