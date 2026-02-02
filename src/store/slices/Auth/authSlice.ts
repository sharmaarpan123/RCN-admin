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
      localStorage.setItem("customerId", action?.payload?.user?.id);
      document.cookie = `authorization=${action.payload.accessToken}; path=/;`;
      document.cookie = `role=${action.payload.role}; path=/;`;
      // state.token = action.payload.accessToken;
      // state.user = action.payload.user;
      // state.role = action.payload.role;
      // state.customerId = action.payload.user?.id;
    },
    logoutSuccess(state) {
      // state.token = null;
      // state.user = null;
    },
    updateUser(state, action) {
      // state.user = action.payload;
    },

  },

});

export const {
  loginSuccess,
  logoutSuccess,
  updateUser
} = authSlice.actions;

export default authSlice.reducer;
