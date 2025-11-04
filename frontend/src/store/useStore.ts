import createAuthSlice, {
  type AuthSlice,
} from "@/apps/auth/store/createAuthSlice";
import { create } from "zustand";
import createMoodsSlice, {
  type MoodsSlice,
} from "../apps/moods/store/createMoodsSlice";
import createScreenSlice, { type ScreenSlice } from "./createScreenSlice";
import createSnackbarSlice, { type SnackbarState } from "./createSnackbarSlice";

export type UseStore = SnackbarState & AuthSlice & ScreenSlice & MoodsSlice;

const useStore = create<UseStore>((...a) => ({
  ...createAuthSlice(...a),
  ...createMoodsSlice(...a),
  ...createScreenSlice(...a),
  ...createSnackbarSlice(...a),
}));

export default useStore;
