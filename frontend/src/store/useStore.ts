import createAuthSlice, {
  type AuthSlice,
} from "@/apps/auth/store/createAuthSlice";
import { create } from "zustand";
import createSnackbarSlice, { type SnackbarState } from "./createSnackbarSlice";

export type UseStore = SnackbarState & AuthSlice;

const useStore = create<UseStore>((...a) => ({
  ...createSnackbarSlice(...a),
  ...createAuthSlice(...a),
}));

export default useStore;
