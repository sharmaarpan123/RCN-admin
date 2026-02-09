import AxiosInstance from "@/apis/Axios";

export const organizationSignupApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/signup", body);

export const authLoginApi = (body: unknown) =>
  AxiosInstance.post("/api/auth/login", body);

export const getAuthProfileApi = () =>
  AxiosInstance.get("/api/auth/profile");

/** PUT /api/organization/profile — update organization and contact (org portal). */
export const updateOrganizationProfileApi = (body: unknown) => AxiosInstance.put("/api/organization/profile", body);

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

/** PUT /api/admin/organization/toggle/:organizationId — toggle organization status (admin). */
export const putAdminOrganizationToggleApi = (organizationId: string) =>
  AxiosInstance.put(`/api/admin/organization/toggle/${organizationId}`);

/** DELETE /api/admin/organization/:id — delete organization (admin). */
export const deleteAdminOrganizationApi = (organizationId: string) =>
  AxiosInstance.delete(`/api/admin/organization/${organizationId}`);

/** GET /api/admin/organization/branch/:organizationId — list branches for an organization (admin). */
export const getAdminOrganizationBranchesApi = (organizationId: string, body: unknown) =>
  AxiosInstance.get(`/api/admin/organization/branch/${organizationId}`, { params: body });

/** POST /api/admin/organization/branch/:organizationId — create branch (admin). */
export const createAdminOrganizationBranchApi = (organizationId: string, body: { name: string }) =>
  AxiosInstance.post(`/api/admin/organization/branch/${organizationId}`, body);

/** PUT /api/admin/organization/branch/:branchId — update branch (admin). */
export const updateAdminOrganizationBranchApi = (branchId: string, body: { name: string }) =>
  AxiosInstance.put(`/api/admin/branch/${branchId}`, body);

/** PUT /api/admin/branch/toggle/:branchId — toggle branch status (admin). */
export const putAdminBranchToggleApi = (branchId: string) =>
  AxiosInstance.put(`/api/admin/branch/toggle/${branchId}`);

/** GET /api/admin/organization/department/:organizationId — list departments (admin). */
export const getAdminOrganizationDepartmentsApi = (organizationId: string) =>
  AxiosInstance.get(`/api/admin/organization/department/${organizationId}`);

/** POST /api/admin/organization/department/:organizationId — create department (admin). */
export const createAdminOrganizationDepartmentApi = (
  organizationId: string,
  body: { name: string; branch_id: string }
) =>
  AxiosInstance.post(`/api/admin/organization/department/${organizationId}`, body);

/** GET /api/admin/organization/user — list organization users (admin). Params: organization_id. */
export const getAdminOrganizationUsersApi = (organizationId: string, body: unknown) =>
  AxiosInstance.get("/api/admin/organization/user/" + organizationId, { params: body });

/** GET /api/admin/organization/user/:userId — get single organization user (admin). */
export const getAdminOrganizationUserApi = (userId: string) =>
  AxiosInstance.get(`/api/admin/organization/user/${userId}`);

/** POST /api/admin/organization/user/:organization_id — create organization user (admin). */
export const createAdminOrganizationUserApi = (organizationId: string, body: unknown) =>
  AxiosInstance.post(`/api/admin/organization/user/${organizationId}`, body);

/** PUT /api/admin/department/toggle/:departmentId — toggle department status (admin). */
export const putAdminDepartmentToggleApi = (departmentId: string) =>
  AxiosInstance.put(`/api/admin/department/toggle/${departmentId}`);

export const getOrganizationUsersApi = (params?: { search?: string }) =>
  AxiosInstance.get("/api/organization/user", { params });

/** GET /api/organization/user/:userId — get organization user detail. */
export const getOrganizationUserApi = (userId: string) =>
  AxiosInstance.get(`/api/organization/user/${userId}`);

export const createOrganizationUserApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/user", body);

/** PUT /api/organization/user/:userId — update organization user (body: first_name, last_name, dial_code, phone_number, fax_number, notes, etc.). */
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

/** GET /api/admin/cms — list CMS pages (admin). */
export const getAdminCmsListApi = () =>
  AxiosInstance.get("/api/admin/cms");

/** GET /api/admin/cms/:id — get single CMS page (admin). */
export const getAdminCmsByIdApi = (id: string) =>
  AxiosInstance.get(`/api/admin/cms/${id}`);

/** POST /api/admin/cms — create CMS page (admin). */
export const createAdminCmsApi = (body: unknown) =>
  AxiosInstance.post("/api/admin/cms", body);

/** PUT /api/admin/cms/:id — update CMS page (admin). */
export const updateAdminCmsApi = (id: string, body: unknown) =>
  AxiosInstance.put(`/api/admin/cms/${id}`, body);
