import AxiosInstance from "@/apis/Axios";

export const organizationSignupApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/signup", body);

export const authLoginApi = (body: unknown) =>
  AxiosInstance.post("/api/auth/login", body);

export const organizationLoginApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/login", body);

export const adminLoginApi = (body: { email: string; password: string }) =>
  AxiosInstance.post("/api/admin/login", body);

export const authVerifyOtpApi = (body: unknown) => AxiosInstance.post("/api/auth/verify-otp", body);

export const organizationVerifyOtpApi = (body: unknown) => AxiosInstance.post("/api/organization/verify-otp", body);

export const adminVerifyOtpApi = (body: unknown) => AxiosInstance.post("/api/admin/verify-otp", body);
