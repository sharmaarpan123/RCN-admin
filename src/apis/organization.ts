import api from "@/lib/axios";

export interface OrganizationSignupPayload {
  name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  ein_number?: string;
  street?: string;
  suite?: string;
  latitude?: string;
  longitude?: string;
  city?: string;
  state: string;
  country: string;
  zip_code: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  user_dial_code?: string;
  user_phone_number?: string;
  user_fax_number?: string;
}

export const organizationSignupApi = (body: OrganizationSignupPayload) =>
  api.post("/api/organization/signup", body);
