/**
 * Types for admin profile (verify OTP response / GET admin profile).
 * Admin user has no organization; role_id 1 = Super Admin, 2 = Admin.
 */

/** Permission object from roles/permissions */
export interface AdminPermission {
  _id?: string;
  key?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Admin user payload (no organization) */
export interface AdminProfileData {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  status: number;
  device_token?: string;
  device_type?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: AdminPermission[];
}

/** Admin profile API response shape */
export interface AdminProfileResponse {
  success: boolean;
  message: string;
  data: AdminProfileData;
  meta: null;
}
