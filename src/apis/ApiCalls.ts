import AxiosInstance from "@/apis/Axios";

export const organizationSignupApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/signup", body);

/** GET /api/states — list states (e.g. for org signup address). */
export const getStatesApi = () => AxiosInstance.get("/api/states");

export const authLoginApi = (body: unknown) =>
  AxiosInstance.post("/api/auth/login", body);

export const getAuthProfileApi = () => AxiosInstance.get("/api/auth/profile");

export const authLogoutApi = (authorization?: string) =>
  AxiosInstance.post(
    "/api/auth/logout",
  
  );

/** POST /api/auth/change-password — change password for authenticated user. */
export const changePasswordApi = (body: { password: string }) =>
  AxiosInstance.post("/api/auth/change-password", body);

/** PUT /api/organization/profile — update organization and contact (org portal). */
export const updateOrganizationProfileApi = (body: unknown) =>
  AxiosInstance.put("/api/organization/profile", body);

export const organizationLoginApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/login", body);

export const adminLoginApi = (body: { email: string; password: string }) =>
  AxiosInstance.post("/api/admin/login", body);

export const authVerifyOtpApi = (body: unknown) =>
  AxiosInstance.post("/api/auth/verify-otp", body);

export const organizationVerifyOtpApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/verify-otp", body);

export const adminVerifyOtpApi = (body: unknown) =>
  AxiosInstance.post("/api/admin/verify-otp", body);

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
export const updateAdminOrganizationApi = (
  organizationId: string,
  body: unknown,
) => AxiosInstance.put(`/api/admin/organization/${organizationId}`, body);

/** PUT /api/admin/organization/toggle/:organizationId — toggle organization status (admin). */
export const putAdminOrganizationToggleApi = (organizationId: string) =>
  AxiosInstance.put(`/api/admin/organization/toggle/${organizationId}`);

/** DELETE /api/admin/organization/:id — delete organization (admin). */
export const deleteAdminOrganizationApi = (organizationId: string) =>
  AxiosInstance.delete(`/api/admin/organization/${organizationId}`);

/** POST /api/admin/organization/:organizationId/wallet/topup — top up organization wallet (admin). */
export const postAdminOrganizationWalletTopupApi = (
  organizationId: string,
  body: { amount: number },
) =>
  AxiosInstance.post(
    `/api/admin/organization/${organizationId}/wallet/topup`,
    body,
  );

/** GET /api/admin/organization/branch/:organizationId — list branches for an organization (admin). */
export const getAdminOrganizationBranchesApi = (
  organizationId: string,
  body: unknown,
) =>
  AxiosInstance.get(`/api/admin/organization/branch/${organizationId}`, {
    params: body,
  });

/** POST /api/admin/organization/branch/:organizationId — create branch (admin). */
export const createAdminOrganizationBranchApi = (
  organizationId: string,
  body: { name: string },
) =>
  AxiosInstance.post(`/api/admin/organization/branch/${organizationId}`, body);

/** PUT /api/admin/organization/branch/:branchId — update branch (admin). */
export const updateAdminOrganizationBranchApi = (
  branchId: string,
  body: { name: string },
) => AxiosInstance.put(`/api/admin/branch/${branchId}`, body);

/** PUT /api/admin/branch/toggle/:branchId — toggle branch status (admin). */
export const putAdminBranchToggleApi = (branchId: string) =>
  AxiosInstance.put(`/api/admin/branch/toggle/${branchId}`);

/** GET /api/admin/organization/department/:organizationId — list departments (admin). */
export const getAdminOrganizationDepartmentsApi = (organizationId: string) =>
  AxiosInstance.get(`/api/admin/organization/department/${organizationId}`);

/** POST /api/admin/organization/department/:organizationId — create department (admin). */
export const createAdminOrganizationDepartmentApi = (
  organizationId: string,
  body: { name: string; branch_id: string },
) =>
  AxiosInstance.post(
    `/api/admin/organization/department/${organizationId}`,
    body,
  );

/** GET /api/admin/organization/user — list organization users (admin). Params: organization_id. */
export const getAdminOrganizationUsersApi = (
  organizationId: string,
  body: unknown,
) =>
  AxiosInstance.get("/api/admin/organization/user/" + organizationId, {
    params: body,
  });

/** GET /api/admin/organization/user/:userId — get single organization user (admin). */
export const getAdminOrganizationUserApi = (userId: string) =>
  AxiosInstance.get(`/api/admin/organization/user/${userId}`);

/** POST /api/admin/organization/user/:organization_id — create organization user (admin). */
export const createAdminOrganizationUserApi = (
  organizationId: string,
  body: unknown,
) => AxiosInstance.post(`/api/admin/organization/user/${organizationId}`, body);

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

/** PUT /api/organization/user/branch/:userId — update user's branch & department assignment. Body: [{ branch_id, department_ids }, ...]. */
export const updateOrganizationUserBranchApi = (
  userId: string,
  body: { branch_id: string; department_ids: string[] }[],
) => AxiosInstance.put(`/api/organization/user/branch/${userId}`, body);

export const deleteOrganizationUserApi = (userId: string) =>
  AxiosInstance.delete(`/api/organization/user/${userId}`);

export const getOrganizationBranchesApi = (body: unknown) =>
  AxiosInstance.get("/api/organization/branch", { params: body });

export const getOrganizationBranchApi = (branchId: string) =>
  AxiosInstance.get(`/api/organization/branch/${branchId}`);

export const createOrganizationBranchApi = (body: { name: string }) =>
  AxiosInstance.post(`/api/organization/branch`, body);

export const updateOrganizationBranchApi = (
  branchId: string,
  body: { name: string },
) => AxiosInstance.put(`/api/organization/branch/${branchId}`, body);

export const deleteOrganizationBranchApi = (branchId: string) =>
  AxiosInstance.delete(`/api/organization/branch/${branchId}`);

export const getOrganizationDepartmentsApi = (params: { branch_id: string }) =>
  AxiosInstance.get("/api/organization/department", { params });

export const getOrganizationDepartmentApi = (departmentId: string) =>
  AxiosInstance.get(`/api/organization/department/${departmentId}`);

export const createOrganizationDepartmentApi = (body: {
  name: string;
  branch_id: string;
}) => AxiosInstance.post("/api/organization/department", body);

export const updateOrganizationDepartmentApi = (
  departmentId: string,
  body: { name: string; branch_id: string },
) => AxiosInstance.put(`/api/organization/department/${departmentId}`, body);

export const deleteOrganizationDepartmentApi = (departmentId: string) =>
  AxiosInstance.delete(`/api/organization/department/${departmentId}`);

/** GET /api/admin/cms — list CMS pages (admin). */
export const getAdminCmsListApi = () => AxiosInstance.get("/api/admin/cms");

/** GET /api/admin/cms/:id — get single CMS page (admin). */
export const getAdminCmsByIdApi = (id: string) =>
  AxiosInstance.get(`/api/admin/cms/${id}`);

/** POST /api/admin/cms — create CMS page (admin). */
export const createAdminCmsApi = (body: unknown) =>
  AxiosInstance.post("/api/admin/cms", body);

/** PUT /api/admin/cms/:id — update CMS page (admin). */
export const updateAdminCmsApi = (id: string, body: unknown) =>
  AxiosInstance.put(`/api/admin/cms/${id}`, body);

/** GET /api/admin/permissions/assignable — list assignable permissions (admin). */
export const getAdminAssignablePermissionsApi = () =>
  AxiosInstance.get("/api/admin/permissions/assignable");

/** GET /api/admin/roles — list roles (admin). */
export const getAdminRolesApi = () => AxiosInstance.get("/api/admin/roles");

/** POST /api/admin/roles — create role (admin). Body: { name, permission_ids }. */
export const createAdminRoleApi = (body: {
  name: string;
  permission_ids: string[];
}) => AxiosInstance.post("/api/admin/roles", body);

/** PUT /api/admin/roles/:id — update role (admin). Body: { name, permission_ids }. */
export const updateAdminRoleApi = (
  roleId: string | number,
  body: { name: string; permission_ids: string[] },
) => AxiosInstance.put(`/api/admin/roles/${roleId}`, body);

/** DELETE /api/admin/roles/:id — delete role (admin). */
export const deleteAdminRoleApi = (roleId: string | number) =>
  AxiosInstance.delete(`/api/admin/roles/${roleId}`);

/** GET /api/admin/user — list master admin users. */
export const getAdminUsersApi = () => AxiosInstance.get("/api/admin/user");

/** GET /api/admin/user/:id — get master admin user by id. */
export const getAdminUserByIdApi = (userId: string) =>
  AxiosInstance.get(`/api/admin/user/${userId}`);

/** POST /api/admin/user — create master admin user. Body: first_name, last_name, email, phone_number, dial_code, password, role_id. */
export const createAdminUserApi = (body: {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  dial_code?: string;
  password: string;
  role_id: number;
}) => AxiosInstance.post("/api/admin/user", body);

/** PUT /api/admin/user/:id — update master admin user. Body: first_name, last_name, email, phone_number, dial_code, status, role_id, optional password. */
export const updateAdminUserApi = (
  userId: string,
  body: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    dial_code?: string;
    status: number;
    role_id: number;
    password?: string;
  },
) => AxiosInstance.put(`/api/admin/user/${userId}`, body);

/** DELETE /api/admin/user/:id — delete master admin user. */
export const deleteAdminUserApi = (userId: string) =>
  AxiosInstance.delete(`/api/admin/user/${userId}`);

/** GET /api/admin/payment-settings — get payment settings (admin). */
export const getAdminPaymentSettingsApi = () =>
  AxiosInstance.get("/api/admin/payment-settings");

/** PUT /api/admin/payment-settings — update payment settings (admin). */
export const updateAdminPaymentSettingsApi = (body: unknown) =>
  AxiosInstance.put("/api/admin/payment-settings", body);

/** POST /api/users/profile/picture/upload — upload profile/banner image (common). FormData with key "file". */
export const uploadProfilePictureApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return AxiosInstance.post("/api/users/profile/picture/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** GET /api/admin/banners — list banners (admin). */
export const getAdminBannersApi = () => AxiosInstance.get("/api/admin/banners");

/** POST /api/admin/banners — create banner (admin). */
export const createAdminBannerApi = (body: unknown) =>
  AxiosInstance.post("/api/admin/banners", body);

/** PUT /api/admin/banners/:id — update banner (admin). */
export const updateAdminBannerApi = (
  bannerId: string,
  body: Record<string, unknown>,
) => AxiosInstance.put(`/api/admin/banners/${bannerId}`, body);

/** DELETE /api/admin/banners/:id — delete banner (admin). Optional body e.g. { organization_id }. */
export const deleteAdminBannerApi = (
  bannerId: string,
  body?: { organization_id?: string },
) =>
  AxiosInstance.delete(
    `/api/admin/banners/${bannerId}`,
    body ? { data: body } : undefined,
  );

/** GET /api/admin/contact — list contact queries with pagination (admin). */
export const getAdminContactListApi = (params: {
  page: number;
  limit: number;
}) => AxiosInstance.get("/api/admin/contact", { params });

/** GET /api/admin/contact/:id — get single contact query detail (admin). */
export const getAdminContactDetailApi = (contactId: string) =>
  AxiosInstance.get(`/api/admin/contact/${contactId}`);

/** DELETE /api/admin/contact/:id — delete contact query (admin). */
export const deleteAdminContactApi = (contactId: string) =>
  AxiosInstance.delete(`/api/admin/contact/${contactId}`);

// ——— Admin services / specialities ———

/** GET /api/admin/specialities — list services/specialities (admin). */
export const getAdminSpecialitiesApi = () =>
  AxiosInstance.get("/api/admin/specialities");

/** POST /api/admin/specialities — create service/speciality (admin). */
export const createAdminSpecialityApi = (body: {
  name: string;
  user_id?: string;
}) => AxiosInstance.post("/api/admin/specialities", body);

/** PUT /api/admin/specialities/:id — update service/speciality (admin). */
export const updateAdminSpecialityApi = (
  id: string,
  body: { name: string; user_id?: string },
) => AxiosInstance.put(`/api/admin/specialities/${id}`, body);

/** GET /api/admin/specialities/:id — get single service/speciality (admin). */
export const getAdminSpecialityByIdApi = (id: string) =>
  AxiosInstance.get(`/api/admin/specialities/${id}`);

/** DELETE /api/admin/specialities/:id — delete service/speciality (admin). */
export const deleteAdminSpecialityApi = (id: string) =>
  AxiosInstance.delete(`/api/admin/specialities/${id}`);

// ——— Admin reports — audit logs & financial ———

/** GET /api/admin/auth-logs — list authentication / audit logs (admin). */
export const getAdminAuthLogsApi = () =>
  AxiosInstance.get("/api/admin/auth-logs");

/** GET /api/admin/financial-report — list financial report entries (admin). */
export const getAdminFinancialReportApi = () =>
  AxiosInstance.get("/api/admin/financial-report");

// ——— Staff portal (users) ———

/** GET /api/users/organizations — list organizations for staff (e.g. referral receivers). Params: state, optional search. */
export const getStaffOrganizationsApi = (params: {
  state?: string;
  search?: string;
}) => AxiosInstance.get("/api/users/organizations", { params });

/** GET /api/users/branches — list branches available to staff users. */
export const getStaffBranchesApi = (params?: { search?: string }) =>
  AxiosInstance.get("/api/users/branches", { params: params ?? {} });

/** GET /api/users/departments — list departments available to staff users. */
export const getStaffDepartmentsApi = (params?: { search?: string }) =>
  AxiosInstance.get("/api/users/departments", { params: params ?? {} });

/** POST /api/users/branches/by-organizations — get branches for given organization ids. */
export const postStaffBranchesByOrganizationsApi = (body: {
  organization_ids: string[];
}) => AxiosInstance.post("/api/users/branches/by-organizations", body);

/** POST /api/users/departments/by-branches — get departments for given branch ids. */
export const postStaffDepartmentsByBranchesApi = (body: {
  branch_ids: string[];
}) => AxiosInstance.post("/api/users/departments/by-branches", body);

/** GET /api/users/specialities — list specialities/services for staff (e.g. referral form). Params: page, limit. */
export const getStaffSpecialitiesApi = (params?: {
  page?: number;
  limit?: number;
}) => AxiosInstance.get("/api/users/specialities", { params });

/** POST /api/organization/referral — create referral (staff portal). */
export const postOrganizationReferralApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/referral", body);

/** GET /api/organization/referral/sent — list sent referrals (staff portal, sender inbox). */
export const getOrganizationReferralSentApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) =>
  AxiosInstance.get("/api/organization/referral/sent", {
    params: params ?? {},
  });

/** GET /api/organization/referral/received — list received referrals (staff portal, receiver inbox). */
export const getOrganizationReferralReceivedApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) =>
  AxiosInstance.get("/api/organization/referral/received", {
    params: params ?? {},
  });

/** GET /api/organization/referral/:id — get referral by id (staff portal, sender detail). */
export const getOrganizationReferralByIdApi = (id: string) =>
  AxiosInstance.get(`/api/organization/referral/${id}`);

/** POST /api/organization/referral/:id/payment-summary — get payment summary for draft referral. source: "free" = sender pays, "payment" = receiver pays (requires payment_method_id). */
export const postOrganizationReferralPaymentSummaryApi = (
  referralId: string,
  body: { source: "free" | "payment"; payment_method_id?: string },
) =>
  AxiosInstance.post(
    `/api/organization/referral/${referralId}/payment-summary`,
    body,
  );

/** Request body for POST /api/organization/referral. Aligned with backend createOrUpdateReferralSchema (all optional). */
