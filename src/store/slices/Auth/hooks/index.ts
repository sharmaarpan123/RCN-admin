import { AdminProfileData } from "@/app/master-admin/types/profile";
import { AuthProfileData } from "@/app/org-portal/types/profile";
import { StaffProfileData } from "@/app/staff-portal/types/profile";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const useStaffAuthLoginUser = () => {
  const auth = useSelector((s: RootState) => s.auth);
  return { ...auth, loginUser: auth.loginUser as StaffProfileData };
};

export const useOrganizationAuthLoginUser = () => {
  const auth = useSelector((s: RootState) => s.auth);
  return { ...auth, loginUser: auth.loginUser as AuthProfileData };
};

export const useAdminAuthLoginUser = () => {
  const auth = useSelector((s: RootState) => s.auth);
  return { ...auth, loginUser: auth.loginUser as AdminProfileData };
};