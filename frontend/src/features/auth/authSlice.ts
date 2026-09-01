import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "@/services/api/types";

type AuthStatus = "restoring" | "authenticated" | "unauthenticated";

type AuthState = {
  user: User | null;
  status: AuthStatus;
};

const initialState: AuthState = {
  user: null,
  status: "restoring",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    signedOut(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;
