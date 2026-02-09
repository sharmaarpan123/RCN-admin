/** Master admin user from GET /api/admin/user list */
export type AdminUser = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  dial_code?: string;
  phone_number?: string;
  status?: number;
  role_id?: number;
  role?: { id?: number; name?: string };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
