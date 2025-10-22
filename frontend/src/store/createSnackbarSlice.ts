import type { StateCreator } from "zustand";

interface Snackbar {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export interface SnackbarState {
  snackbar: Snackbar;
  showSnackbar: (message: string, severity?: Snackbar["severity"]) => void;
  closeSnackbar: () => void;
}

const createSnackbarSlice: StateCreator<SnackbarState> = (set) => ({
  snackbar: { open: false, message: "", severity: "info" },
  showSnackbar: (message, severity = "info") => {
    set({ snackbar: { open: true, message, severity } });
  },
  closeSnackbar: () => {
    set({ snackbar: { open: false, message: "", severity: "info" } });
  },
});

export default createSnackbarSlice;
