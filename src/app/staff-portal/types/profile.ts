/**
 * Types for staff-portal auth (login / verify OTP response user).
 * Matches the "user" object in POST /api/auth/verify-otp response.
 */

/** GeoJSON Point: [longitude, latitude] */
export interface StaffGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

/** Organization as nested in staff login user */
export interface StaffProfileOrganization {
  _id: string;
  name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  ein_number: string;
  street: string;
  location?: StaffGeoPoint;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  createdAt: string;
  updatedAt: string;
}

/** Branch as in user_branches or nested in user_departments[].branch */
export interface StaffProfileBranch {
  _id: string;
  name: string;
  organization_id: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Department with nested branch (user_departments item) */
export interface StaffProfileDepartment {
  _id: string;
  name: string;
  organization_id: string;
  branch_id: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  branch: StaffProfileBranch;
}

/** Logged-in staff user (payload under response.data.user) */
export interface StaffProfileData {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  role_id: number;
  organization_id: string;
  status: number;
  device_type?: string;
  profile_picture?: string | null;
  stripe_customer_id?: string | null;
  createdAt: string;
  updatedAt: string;
  device_token?: string;
  organization: StaffProfileOrganization;
  user_branches: StaffProfileBranch[];
  user_departments: StaffProfileDepartment[];
  user_credits: number;
  branch_credits: number;
}

/** Staff login/verify response data shape */
export interface StaffAuthResponseData {
  refreshToken?: string;
  accessToken?: string;
  user: StaffProfileData;
}
