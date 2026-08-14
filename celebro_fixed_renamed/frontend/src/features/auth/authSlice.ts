import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: number;
  email: string;
  username: string;
  phone_number?: string;
  role: "customer" | "planner" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
