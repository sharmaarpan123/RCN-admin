import { createSlice } from "@reduxjs/toolkit";
import type { AuthProfileData } from "@/app/org-portal/types/profile";
import type { AdminProfileData } from "@/app/master-admin/types/profile";
import type { StaffProfileData } from "@/app/staff-portal/types/profile";

/** Logged-in user: org (AuthProfileData), admin (AdminProfileData), or staff (StaffProfileData). */
export type LoggedInUser = AuthProfileData | AdminProfileData | StaffProfileData;

export type OrganizationUserType = AuthProfileData;
export type StaffUserType = StaffProfileData;

export interface LoginSuccessPayload {
  token: string | null;
  role: string | null;
  loginUser: LoggedInUser | null;
}

interface AuthSliceState {
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
    loginSuccess(state, action: { payload: LoginSuccessPayload }) {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.loginUser = action.payload.loginUser;
    },
    logoutSuccess(state) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      document.cookie = "authorization=; path=/;";
      document.cookie = "role=; path=/;";
      state.loginUser = null;
    },
    updateLoginUser(state, action: { payload: LoggedInUser }) {
      state.loginUser = action.payload;
    },
  },

});

export const {
  loginSuccess,
  logoutSuccess,
  updateLoginUser
} = authSlice.actions;

export default authSlice.reducer;
