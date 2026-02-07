import AxiosInstance from "@/apis/Axios";

export const organizationSignupApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/signup", body);

export const authLoginApi = (body: unknown) =>
  AxiosInstance.post("/api/auth/login", body);

export const getAuthProfileApi = () =>
  AxiosInstance.get("/api/auth/profile");

export const organizationLoginApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/login", body);

export const adminLoginApi = (body: { email: string; password: string }) =>
  AxiosInstance.post("/api/admin/login", body);

export const authVerifyOtpApi = (body: unknown) => AxiosInstance.post("/api/auth/verify-otp", body);

export const organizationVerifyOtpApi = (body: unknown) => AxiosInstance.post("/api/organization/verify-otp", body);

export const adminVerifyOtpApi = (body: unknown) => AxiosInstance.post("/api/admin/verify-otp", body);

/** GET /api/admin/organization — list organizations (admin). */
export const getAdminOrganizationsApi = () =>
  AxiosInstance.get("/api/admin/organization");

/** GET /api/admin/organization/:id — get single organization (admin). */
export const getAdminOrganizationApi = (organizationId: string) =>
  AxiosInstance.get(`/api/admin/organization/${organizationId}`);

/** POST /api/admin/organization — create organization (admin). */
export const createAdminOrganizationApi = (body: unknown) =>
  AxiosInstance.post("/api/admin/organization", body);

/** PUT /api/admin/organization/:id — update organization (admin). */
export const updateAdminOrganizationApi = (organizationId: string, body: unknown) =>
  AxiosInstance.put(`/api/admin/organization/${organizationId}`, body);

export const getOrganizationUsersApi = (params?: { search?: string }) =>
  AxiosInstance.get("/api/organization/user", { params });

export const getOrganizationUserApi = (userId: string) =>
  AxiosInstance.get(`/api/organization/user/${userId}`);

export const createOrganizationUserApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/user", body);

export const updateOrganizationUserApi = (userId: string, body: unknown) =>
  AxiosInstance.put(`/api/organization/user/${userId}`, body);

export const deleteOrganizationUserApi = (userId: string) =>
  AxiosInstance.delete(`/api/organization/user/${userId}`);

export const getOrganizationBranchesApi = (body: unknown) =>
  AxiosInstance.get("/api/organization/branch", { params: body });

export const getOrganizationBranchApi = (branchId: string) =>
  AxiosInstance.get(`/api/organization/branch/${branchId}`);

export const createOrganizationBranchApi = (body: { name: string }) =>
  AxiosInstance.post(`/api/organization/branch`, body);

export const updateOrganizationBranchApi = (branchId: string, body: { name: string }) =>
  AxiosInstance.put(`/api/organization/branch/${branchId}`, body);

export const deleteOrganizationBranchApi = (branchId: string) =>
  AxiosInstance.delete(`/api/organization/branch/${branchId}`);

export const getOrganizationDepartmentsApi = (params: { branch_id: string }) =>
  AxiosInstance.get("/api/organization/department", { params });

export const getOrganizationDepartmentApi = (departmentId: string) =>
  AxiosInstance.get(`/api/organization/department/${departmentId}`);

export const createOrganizationDepartmentApi = (body: { name: string; branch_id: string }) =>
  AxiosInstance.post("/api/organization/department", body);

export const updateOrganizationDepartmentApi = (departmentId: string, body: { name: string; branch_id: string }) =>
  AxiosInstance.put(`/api/organization/department/${departmentId}`, body);

export const deleteOrganizationDepartmentApi = (departmentId: string) =>
  AxiosInstance.delete(`/api/organization/department/${departmentId}`);
