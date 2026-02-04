import { createSlice } from "@reduxjs/toolkit";


interface OrganizationLocation {
  type: string;
  coordinates: number[];
}
interface OrganizationId {
  _id: string;
  name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  ein_number: string;
  street: string;
  location: OrganizationLocation;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  branches: unknown[];
  users: unknown[];
}

export interface OrganizationUserType {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  dial_code: string;
  phone_number: string;
  role_id: number;
  organization_id: OrganizationId;
  status: number;
  device_token: string | null;
  device_type: string | null;
}

interface authSliceState {
  loginOrgUser: OrganizationUserType | null;
  error: string | null;
  token: string | null;
  role: string | null;
  status: "idle" | "loading" | "success" | "error";
}

const initialState: authSliceState = {
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
