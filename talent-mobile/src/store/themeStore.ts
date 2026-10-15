import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeId = 'dark' | 'light';

export interface AppTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isDark: boolean;
  
  // Core colors
  bg: string;
  cardBg: string;
  surfaceBg: string;
  headerBg: string;
  
  // Accents
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentAlt?: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Borders & Dividers
  border: string;
  borderStrong: string;
  
  // Tab Bar
  tabBg: string;
  tabBorder: string;
  tabActiveTint: string;
  tabInactiveTint: string;
  
  // UI Badges & Accents
  badgeBg: string;
  badgeText: string;
  gradient: [string, string, ...string[]];
  accentGlow: string;
}

export const THEMES: Record<ThemeId, AppTheme> & Record<string, AppTheme> = {
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    tagline: 'Signature Obsidian Stage',
    description: 'Concert stage spotlight with signature scarlet red pulse and obsidian depths.',
    icon: 'Moon',
    isDark: true,
    bg: '#050608',
    cardBg: '#12141A',
    surfaceBg: '#1A1D24',
    headerBg: '#050608',
    primary: '#E50914',
    primaryLight: '#FF3B30',
    primaryDark: '#B91C1C',
    accent: '#FB923C',
    accentAlt: '#38BDF8',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    tabBg: '#000000',
    tabBorder: '#222222',
    tabActiveTint: '#E50914',
    tabInactiveTint: '#888888',
    badgeBg: '#E50914',
    badgeText: '#FFFFFF',
    gradient: ['#E50914', '#FB923C'],
    accentGlow: 'rgba(229, 9, 20, 0.45)',
  },
  light: {
    id: 'light',
    name: 'Light Theme',
    tagline: 'Clean White Studio',
    description: 'Crisp gallery white canvas with refined borders, crimson red accents, and high-contrast typography.',
    icon: 'Sun',
    isDark: false,
    bg: '#FFFFFF',
    cardBg: '#FAFAFA',
    surfaceBg: '#F0F0F0',
    headerBg: '#FFFFFF',
    primary: '#E50914',
    primaryLight: '#FF3B30',
    primaryDark: '#B91C1C',
    accent: '#FB923C',
    accentAlt: '#38BDF8',
    text: '#18181B',
    textSecondary: '#71717A',
    textMuted: '#A1A1AA',
    border: '#E4E4E7',
    borderStrong: '#D4D4D8',
    tabBg: '#FFFFFF',
    tabBorder: '#E4E4E7',
    tabActiveTint: '#E50914',
    tabInactiveTint: '#71717A',
    badgeBg: '#E50914',
    badgeText: '#FFFFFF',
    gradient: ['#E50914', '#FB923C'],
    accentGlow: 'rgba(229, 9, 20, 0.3)',
  },
};

// Backwards compatibility aliases for any previously cached theme IDs
THEMES.talent = THEMES.dark;
THEMES.tiktok = THEMES.dark;
THEMES.instagram = THEMES.dark;
THEMES.instagram_light = THEMES.light;

const normalizeThemeId = (rawId: string | null | undefined): ThemeId => {
  if (rawId === 'light' || rawId === 'instagram_light' || rawId === 'white') return 'light';
  return 'dark';
};

const THEME_STORAGE_KEY = 'talent_app_theme_id';

interface ThemeState {
  themeId: ThemeId;
  theme: AppTheme;
  setTheme: (id: ThemeId) => Promise<void>;
  loadTheme: () => Promise<void>;
}

const syncWebStyles = (theme: AppTheme) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-card', theme.cardBg);
    root.style.setProperty('--theme-surface', theme.surfaceBg);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-border', theme.border);
    if (document.body) {
      document.body.style.backgroundColor = theme.bg;
      document.body.style.color = theme.text;
    }
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeId: 'dark',
  theme: THEMES.dark,

  setTheme: async (id: ThemeId) => {
    const normId = normalizeThemeId(id);
    const newTheme = THEMES[normId] || THEMES.dark;
    set({ themeId: normId, theme: newTheme });
    syncWebStyles(newTheme);

    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(THEME_STORAGE_KEY, normId);
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, normId);
      }
    } catch (e) {
      console.error('Failed to persist theme:', e);
    }
  },

  loadTheme: async () => {
    try {
      let savedId: string | null = null;
      if (Platform.OS === 'web') {
        savedId = localStorage.getItem(THEME_STORAGE_KEY);
      } else {
        savedId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      }

      const normId = normalizeThemeId(savedId);
      const activeTheme = THEMES[normId] || THEMES.dark;
      set({ themeId: normId, theme: activeTheme });
      syncWebStyles(activeTheme);
    } catch (e) {
      console.error('Failed to load saved theme:', e);
      syncWebStyles(get().theme);
    }
  },
}));
