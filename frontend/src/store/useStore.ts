import createAuthSlice, {
  type AuthSlice,
} from "@/apps/auth/store/createAuthSlice";
import { create } from "zustand";
import createScreenSlice, { type ScreenSlice } from "./createScreenSlice";
import createSnackbarSlice, { type SnackbarState } from "./createSnackbarSlice";

export type UseStore = SnackbarState & AuthSlice & ScreenSlice;

const useStore = create<UseStore>((...a) => ({
  ...createAuthSlice(...a),
  ...createScreenSlice(...a),
  ...createSnackbarSlice(...a),
}));

export default useStore;
