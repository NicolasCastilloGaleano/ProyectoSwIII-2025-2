import type { StateCreator } from "zustand";

interface Screen {
  currentTab: number;
}

interface ScreenState {
  screen: Screen;
  setCurrentTab: (value: number) => void;
}

export interface ScreenSlice {
  screenState: ScreenState;
}

const createScreenSlice: StateCreator<ScreenSlice> = (set) => ({
  screenState: {
    screen: {
      currentTab: 0,
    },

    setCurrentTab: (value: number) =>
      set((state) => {
        if (value) {
          return {
            ...state,
            screen: { ...state.screenState.screen, currentTab: value },
          };
        }
        return state;
      }),
  },
});

export default createScreenSlice;
