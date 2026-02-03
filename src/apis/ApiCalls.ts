import AxiosInstance from "@/apis/Axios";

export const organizationSignupApi = (body: unknown) =>
  AxiosInstance.post("/api/organization/signup", body);
