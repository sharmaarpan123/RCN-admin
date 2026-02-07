import { createSlice } from "@reduxjs/toolkit";
import type { AuthProfileData } from "@/app/org-portal/types/profile";

/** @deprecated Use AuthProfileData from @/app/org-portal/types/profile */
export type OrganizationUserType = AuthProfileData;

interface AuthSliceState {
  loginOrgUser: AuthProfileData | null;
  error: string | null;
  token: string | null;
  role: string | null;
  status: "idle" | "loading" | "success" | "error";
}

const initialState: AuthSliceState = {
  loginOrgUser: null,
  token: null,
  role: null,
  error: "",
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.loginOrgUser = action.payload.organization;
    },
    logoutSuccess(state) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      document.cookie = "authorization=; path=/;";
      document.cookie = "role=; path=/;";
      state.loginOrgUser = null;
    },
  },

});

export const {
  loginSuccess,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
