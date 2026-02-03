import { createSlice } from "@reduxjs/toolkit";

interface User {
  name: string;
}

interface authSliceState {
  adminUser: User | null;  // user data
  orgAdminUser: User | null;  // user data
  staffUser: User | null;  // user data
  error: string | null;
  status: "idle" | "loading" | "success" | "error";
}

const initialState: authSliceState = {
  adminUser: null,
  orgAdminUser: null,
  staffUser: null,
  error: "",
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      localStorage.setItem("authToken", action.payload.accessToken);
      localStorage.setItem("role", action.payload.role);
      document.cookie = `authorization=${action.payload.accessToken}; path=/;`;
      document.cookie = `role=${action.payload.role}; path=/;`;
    },
    logoutSuccess(state) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      document.cookie = "authorization=; path=/;";
      document.cookie = "role=; path=/;";
    },
  },

});

export const {
  loginSuccess,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
