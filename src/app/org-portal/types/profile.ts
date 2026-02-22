/**
 * Types for GET /api/auth/profile response.
 */

/** GeoJSON Point: [longitude, latitude] */
export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface ProfileDepartment {
  _id: string;
  name: string;
  organization_id: string;
  branch_id: string;
  status: number;
  createdAt: string;
  updatedAt: string;

}

export interface ProfileBranch {
  _id: string;
  name: string;
  organization_id: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  departments?: ProfileDepartment[];
}

export interface ProfileOrgUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  fax_number?: string;
  role_id: number;
  organization_id: string;
  status: number;
  notes?: string;
  device_type?: string;
  createdAt: string;
  updatedAt: string;

}

export interface ProfileOrganization {
  _id: string;
  name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  ein_number: string;
  street: string;
  apt?: string;
  suite?: string;
  location?: GeoPoint;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  createdAt: string;
  updatedAt: string;

  branches?: ProfileBranch[];
  users?: ProfileOrgUser[];
}

/** Logged-in user + organization (payload under response.data) */
export interface AuthProfileData {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  fax_number?: string;
  role_id: number;
  organization_id: ProfileOrganization;
  status: number;
  device_token?: string;
  device_type?: string;
  createdAt: string;
  updatedAt: string;
  organization: ProfileOrganization;
  user_branches: unknown[];
  user_departments: unknown[];
}

