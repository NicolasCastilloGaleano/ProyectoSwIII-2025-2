import type { User } from "@/apps/users/services/users.interfaces";
import type { StateCreator } from "zustand";

export interface Auth {
  currentUser: User | null;
  isLoading: boolean;
  token: string | null;
}

interface AuthState {
  auth: Auth;
  clearSession: () => void;
  setCurrentUser: (currentUser: User) => void;
  setIsAuthLoading: (isLoading: boolean) => void;
  setToken: (token: string | null) => void;
}

export interface AuthSlice {
  authState: AuthState;
}

const initialState: Auth = {
  currentUser: null,
  isLoading: false,
  token: null,
};

const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  authState: {
    auth: initialState,

    setCurrentUser: (currentUser) => {
      set((state) => ({
        authState: {
          ...state.authState,
          auth: { ...state.authState.auth, currentUser },
        },
      }));
    },

    setIsAuthLoading: (isLoading) => {
      set((state) => ({
        authState: {
          ...state.authState,
          auth: { ...state.authState.auth, isLoading },
        },
      }));
    },

    setToken: (token) => {
      set((state) => ({
        authState: {
          ...state.authState,
          auth: { ...state.authState.auth, token },
        },
      }));
    },

    clearSession: () => {
      set((state) => ({
        authState: { ...state.authState, auth: initialState },
      }));
    },
  },
});

export default createAuthSlice;
