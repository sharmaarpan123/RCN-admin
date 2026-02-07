import { createSlice } from "@reduxjs/toolkit";
import type { AuthProfileData } from "@/app/org-portal/types/profile";
import type { AdminProfileData } from "@/app/master-admin/types/profile";

/** Logged-in user: org (with organization) or admin (no organization). */
export type LoggedInUser = AuthProfileData | AdminProfileData;

export type OrganizationUserType = AuthProfileData;

interface AuthSliceState {
  /** Org user (AuthProfileData) or admin user (AdminProfileData) depending on role. */
  loginUser: LoggedInUser | null;
  error: string | null;
  token: string | null;
  role: string | null;
  status: "idle" | "loading" | "success" | "error";
}

const initialState: AuthSliceState = {
  loginUser: null,
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
      state.loginUser = action.payload.organization;
    },
    logoutSuccess(state) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      document.cookie = "authorization=; path=/;";
      document.cookie = "role=; path=/;";
      state.loginUser = null;
    },
  },

});

export const {
  loginSuccess,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
