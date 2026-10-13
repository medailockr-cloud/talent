import { create } from 'zustand';

interface UIState {
  isTabBarHidden: boolean;
  setIsTabBarHidden: (hidden: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTabBarHidden: false,
  setIsTabBarHidden: (hidden) => set({ isTabBarHidden: hidden }),
}));
