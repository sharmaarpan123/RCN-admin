/** Assignable permission from GET /api/admin/permissions/assignable */
export type AssignablePermission = {
  _id: string;
  key: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

/** Role from GET /api/admin/roles — list returns permissions[] (populated), create/update send permission_ids[] */
export type AdminRole = {
  id?: number;
  _id?: string;
  name: string;
  is_system?: boolean;
  permission_ids?: string[];
  permissions?: AssignablePermission[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  [key: string]: unknown;
};

/** Row type for roles table */
export type RoleTableRow = AdminRole;

/** Unique role id for API calls (backend may use numeric id) */
export function getRoleId(role: AdminRole): string {
  if (role.id != null) return String(role.id);
  return role._id ?? "";
}

export const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
