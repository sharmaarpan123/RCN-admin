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

export const createOrganizationUserApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/user", body);

export const updateOrganizationUserApi = (userId: string, body: unknown) =>
  AxiosInstance.put(`/api/organization/user/${userId}`, body);

export const getOrganizationBranchesApi = (body: unknown) =>
  AxiosInstance.get("/api/organization/branch" , { params: body });

export const createOrganizationBranchApi = (body: { name: string }) =>
  AxiosInstance.post(`/api/organization/branch`, body);

export const updateOrganizationBranchApi = (branchId: string, body: { name: string }) =>
  AxiosInstance.put(`/api/organization/branch/${branchId}`, body);
