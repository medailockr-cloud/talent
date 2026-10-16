import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeId =
  | 'light'
  | 'dark'
  | 'one_dark'
  | 'one_light'
  | 'ayu_dark'
  | 'ayu_mirage'
  | 'ayu_light'
  | 'gruvbox_dark'
  | 'gruvbox_light'
  | 'nord'
  | 'dracula'
  | 'solarized_dark'
  | 'solarized_light'
  | 'andromeda';

export interface AppTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  isDark: boolean;
  category: 'Zed' | 'Original';
  badge?: string;
  
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
  // --- Original Themes ---
  light: {
    id: 'light',
    name: 'Light Theme',
    tagline: 'Clean White Studio',
    description: 'Crisp gallery white canvas with refined borders, berry accents, and high-contrast typography.',
    icon: 'Sun',
    isDark: false,
    category: 'Original',
    badge: 'DEFAULT',
    bg: '#FFFFFF',
    cardBg: '#FAFAFA',
    surfaceBg: '#F0F0F0',
    headerBg: '#FFFFFF',
    primary: '#E91E76',
    primaryLight: '#F06292',
    primaryDark: '#C2185B',
    accent: '#FB923C',
    accentAlt: '#38BDF8',
    text: '#18181B',
    textSecondary: '#71717A',
    textMuted: '#A1A1AA',
    border: '#E4E4E7',
    borderStrong: '#D4D4D8',
    tabBg: '#FFFFFF',
    tabBorder: '#E4E4E7',
    tabActiveTint: '#E91E76',
    tabInactiveTint: '#71717A',
    badgeBg: '#E91E76',
    badgeText: '#FFFFFF',
    gradient: ['#E91E76', '#FB923C'],
    accentGlow: 'rgba(233, 30, 118, 0.3)',
  },
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    tagline: 'Signature Obsidian Stage',
    description: 'Concert stage spotlight with signature neon magenta pulse and obsidian depths.',
    icon: 'Moon',
    isDark: true,
    category: 'Original',
    badge: 'STAGE DARK',
    bg: '#050608',
    cardBg: '#12141A',
    surfaceBg: '#1A1D24',
    headerBg: '#050608',
    primary: '#E91E76',
    primaryLight: '#F06292',
    primaryDark: '#C2185B',
    accent: '#FB923C',
    accentAlt: '#38BDF8',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    tabBg: '#000000',
    tabBorder: '#222222',
    tabActiveTint: '#E91E76',
    tabInactiveTint: '#888888',
    badgeBg: '#E91E76',
    badgeText: '#FFFFFF',
    gradient: ['#E91E76', '#FB923C'],
    accentGlow: 'rgba(233, 30, 118, 0.45)',
  },

  // --- Zed Editor Built-in Themes ---
  one_dark: {
    id: 'one_dark',
    name: 'One Dark',
    tagline: 'Zed Default Dark',
    description: "Zed's iconic default dark palette with syntax cyan, violet, and balanced deep slate.",
    icon: 'Code2',
    isDark: true,
    category: 'Zed',
    badge: 'ZED DEFAULT',
    bg: '#282C34',
    cardBg: '#21252B',
    surfaceBg: '#2C313C',
    headerBg: '#21252B',
    primary: '#61AFEF',
    primaryLight: '#83C2F7',
    primaryDark: '#4D97D5',
    accent: '#C678DD',
    accentAlt: '#98C379',
    text: '#ABB2BF',
    textSecondary: '#828997',
    textMuted: '#5C6370',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    tabBg: '#21252B',
    tabBorder: '#1E2227',
    tabActiveTint: '#61AFEF',
    tabInactiveTint: '#828997',
    badgeBg: '#61AFEF',
    badgeText: '#21252B',
    gradient: ['#61AFEF', '#C678DD'],
    accentGlow: 'rgba(97, 175, 239, 0.35)',
  },
  one_light: {
    id: 'one_light',
    name: 'One Light',
    tagline: 'Zed Default Light',
    description: "Zed's clean day mode featuring balanced royal blue, magenta accents, and soft paper.",
    icon: 'Sun',
    isDark: false,
    category: 'Zed',
    badge: 'ZED LIGHT',
    bg: '#FAFAFA',
    cardBg: '#FFFFFF',
    surfaceBg: '#F0F0F0',
    headerBg: '#FFFFFF',
    primary: '#4078F2',
    primaryLight: '#6395F7',
    primaryDark: '#2458D1',
    accent: '#A626A4',
    accentAlt: '#50A14F',
    text: '#383A42',
    textSecondary: '#696C77',
    textMuted: '#A0A1A7',
    border: '#E5E5E6',
    borderStrong: '#D0D0D1',
    tabBg: '#FFFFFF',
    tabBorder: '#E5E5E6',
    tabActiveTint: '#4078F2',
    tabInactiveTint: '#696C77',
    badgeBg: '#4078F2',
    badgeText: '#FFFFFF',
    gradient: ['#4078F2', '#A626A4'],
    accentGlow: 'rgba(64, 120, 242, 0.25)',
  },
  ayu_dark: {
    id: 'ayu_dark',
    name: 'Ayu Dark',
    tagline: 'Ayu Modern Dark',
    description: 'Deep obsidian night with Ayu signature gold, warm sunset orange, and icy cyan highlights.',
    icon: 'Moon',
    isDark: true,
    category: 'Zed',
    badge: 'AYU',
    bg: '#0F1419',
    cardBg: '#14191F',
    surfaceBg: '#1A2026',
    headerBg: '#0F1419',
    primary: '#E6B450',
    primaryLight: '#F0C674',
    primaryDark: '#C29532',
    accent: '#FF8F40',
    accentAlt: '#39BAE6',
    text: '#E6E1CF',
    textSecondary: '#8A9199',
    textMuted: '#5C6773',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    tabBg: '#0A0E14',
    tabBorder: '#14191F',
    tabActiveTint: '#E6B450',
    tabInactiveTint: '#8A9199',
    badgeBg: '#E6B450',
    badgeText: '#0F1419',
    gradient: ['#E6B450', '#FF8F40'],
    accentGlow: 'rgba(230, 180, 80, 0.35)',
  },
  ayu_mirage: {
    id: 'ayu_mirage',
    name: 'Ayu Mirage',
    tagline: 'Ayu Mirage Slate',
    description: 'Muted steel-blue night with warm apricot highlights and soft dusk undertones.',
    icon: 'CloudMoon',
    isDark: true,
    category: 'Zed',
    badge: 'AYU',
    bg: '#212733',
    cardBg: '#1D222D',
    surfaceBg: '#272D38',
    headerBg: '#1D222D',
    primary: '#FFCC66',
    primaryLight: '#FFDE99',
    primaryDark: '#D9A640',
    accent: '#73D0FF',
    accentAlt: '#F07178',
    text: '#CBCCC6',
    textSecondary: '#707A8C',
    textMuted: '#5C6773',
    border: 'rgba(255, 255, 255, 0.09)',
    borderStrong: 'rgba(255, 255, 255, 0.18)',
    tabBg: '#1D222D',
    tabBorder: '#191E28',
    tabActiveTint: '#FFCC66',
    tabInactiveTint: '#707A8C',
    badgeBg: '#FFCC66',
    badgeText: '#212733',
    gradient: ['#FFCC66', '#F07178'],
    accentGlow: 'rgba(255, 204, 102, 0.35)',
  },
  ayu_light: {
    id: 'ayu_light',
    name: 'Ayu Light',
    tagline: 'Ayu Daylight Canvas',
    description: 'Clean modern daylight theme with radiant tangerine and soft ocean blue.',
    icon: 'Sun',
    isDark: false,
    category: 'Zed',
    badge: 'AYU',
    bg: '#FAFAFA',
    cardBg: '#FFFFFF',
    surfaceBg: '#F3F4F5',
    headerBg: '#FFFFFF',
    primary: '#FF9940',
    primaryLight: '#FFAE66',
    primaryDark: '#D97724',
    accent: '#55B4D4',
    accentAlt: '#86B300',
    text: '#5C6166',
    textSecondary: '#828C99',
    textMuted: '#ABB0B6',
    border: '#E6E6E6',
    borderStrong: '#D6D6D6',
    tabBg: '#FFFFFF',
    tabBorder: '#E6E6E6',
    tabActiveTint: '#FF9940',
    tabInactiveTint: '#828C99',
    badgeBg: '#FF9940',
    badgeText: '#FFFFFF',
    gradient: ['#FF9940', '#F27983'],
    accentGlow: 'rgba(255, 153, 64, 0.25)',
  },
  gruvbox_dark: {
    id: 'gruvbox_dark',
    name: 'Gruvbox Dark',
    tagline: 'Retro Groove Dark',
    description: 'Warm vintage retro groove with autumnal amber, pumpkin orange, and aged dark parchment.',
    icon: 'Flame',
    isDark: true,
    category: 'Zed',
    badge: 'GRUVBOX',
    bg: '#282828',
    cardBg: '#1D2021',
    surfaceBg: '#3C3836',
    headerBg: '#1D2021',
    primary: '#FABD2F',
    primaryLight: '#FCE082',
    primaryDark: '#D79921',
    accent: '#FE8019',
    accentAlt: '#B8BB26',
    text: '#EBDBB2',
    textSecondary: '#A89984',
    textMuted: '#7C6F64',
    border: 'rgba(235, 219, 178, 0.1)',
    borderStrong: 'rgba(235, 219, 178, 0.2)',
    tabBg: '#1D2021',
    tabBorder: '#32302F',
    tabActiveTint: '#FABD2F',
    tabInactiveTint: '#A89984',
    badgeBg: '#FABD2F',
    badgeText: '#282828',
    gradient: ['#FABD2F', '#FE8019'],
    accentGlow: 'rgba(250, 189, 47, 0.35)',
  },
  gruvbox_light: {
    id: 'gruvbox_light',
    name: 'Gruvbox Light',
    tagline: 'Retro Groove Light',
    description: 'Warm sepia-parchment library tones with earthy terracottas and antique leather.',
    icon: 'BookOpen',
    isDark: false,
    category: 'Zed',
    badge: 'GRUVBOX',
    bg: '#FBF1C7',
    cardBg: '#F9F5D7',
    surfaceBg: '#EBDBB2',
    headerBg: '#F9F5D7',
    primary: '#B57614',
    primaryLight: '#D79921',
    primaryDark: '#8F5D0A',
    accent: '#AF3A03',
    accentAlt: '#79740E',
    text: '#3C3836',
    textSecondary: '#665C54',
    textMuted: '#928374',
    border: '#D5C4A1',
    borderStrong: '#BDAE93',
    tabBg: '#F9F5D7',
    tabBorder: '#D5C4A1',
    tabActiveTint: '#AF3A03',
    tabInactiveTint: '#7C6F64',
    badgeBg: '#B57614',
    badgeText: '#FBF1C7',
    gradient: ['#B57614', '#AF3A03'],
    accentGlow: 'rgba(181, 118, 20, 0.25)',
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    tagline: 'Arctic North Cold',
    description: 'An arctic, north-bluish clean aesthetic engineered for tranquil, eye-friendly contrast.',
    icon: 'Compass',
    isDark: true,
    category: 'Zed',
    badge: 'ARCTIC',
    bg: '#2E3440',
    cardBg: '#242933',
    surfaceBg: '#3B4252',
    headerBg: '#242933',
    primary: '#88C0D0',
    primaryLight: '#A3D7E6',
    primaryDark: '#629DAE',
    accent: '#81A1C1',
    accentAlt: '#A3BE8C',
    text: '#ECEFF4',
    textSecondary: '#D8DEE9',
    textMuted: '#7B88A1',
    border: 'rgba(216, 222, 233, 0.12)',
    borderStrong: 'rgba(216, 222, 233, 0.22)',
    tabBg: '#242933',
    tabBorder: '#2E3440',
    tabActiveTint: '#88C0D0',
    tabInactiveTint: '#7B88A1',
    badgeBg: '#88C0D0',
    badgeText: '#2E3440',
    gradient: ['#88C0D0', '#81A1C1'],
    accentGlow: 'rgba(136, 192, 208, 0.35)',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    tagline: 'Gothic Neon Purple',
    description: 'Vampiric twilight palette with vibrant magenta-pink and electric purple witchcraft.',
    icon: 'Zap',
    isDark: true,
    category: 'Zed',
    badge: 'GOTHIC',
    bg: '#282A36',
    cardBg: '#1E1F29',
    surfaceBg: '#343746',
    headerBg: '#1E1F29',
    primary: '#FF79C6',
    primaryLight: '#FF92D0',
    primaryDark: '#D65C9F',
    accent: '#BD93F9',
    accentAlt: '#8BE9FD',
    text: '#F8F8F2',
    textSecondary: '#BFBFBF',
    textMuted: '#6272A4',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(189, 147, 249, 0.25)',
    tabBg: '#1E1F29',
    tabBorder: '#282A36',
    tabActiveTint: '#FF79C6',
    tabInactiveTint: '#6272A4',
    badgeBg: '#FF79C6',
    badgeText: '#282A36',
    gradient: ['#FF79C6', '#BD93F9'],
    accentGlow: 'rgba(255, 121, 198, 0.4)',
  },
  solarized_dark: {
    id: 'solarized_dark',
    name: 'Solarized Dark',
    tagline: 'Precision Marine Cyan',
    description: "Ethan Schoonover's scientifically balanced cyan and deep oceanic teal palette.",
    icon: 'Waves',
    isDark: true,
    category: 'Zed',
    badge: 'SOLAR',
    bg: '#002B36',
    cardBg: '#073642',
    surfaceBg: '#0A4252',
    headerBg: '#073642',
    primary: '#2AA198',
    primaryLight: '#4DC0B7',
    primaryDark: '#197B73',
    accent: '#B58900',
    accentAlt: '#268BD2',
    text: '#93A1A1',
    textSecondary: '#839496',
    textMuted: '#586E75',
    border: 'rgba(42, 161, 152, 0.15)',
    borderStrong: 'rgba(42, 161, 152, 0.3)',
    tabBg: '#073642',
    tabBorder: '#002B36',
    tabActiveTint: '#2AA198',
    tabInactiveTint: '#586E75',
    badgeBg: '#2AA198',
    badgeText: '#002B36',
    gradient: ['#2AA198', '#268BD2'],
    accentGlow: 'rgba(42, 161, 152, 0.35)',
  },
  solarized_light: {
    id: 'solarized_light',
    name: 'Solarized Light',
    tagline: 'Precision Solar Sand',
    description: 'Warm golden sand and sunlit amber with engineered reading ergonomics.',
    icon: 'Sun',
    isDark: false,
    category: 'Zed',
    badge: 'SOLAR',
    bg: '#FDF6E3',
    cardBg: '#FFFFFF',
    surfaceBg: '#EEE8D5',
    headerBg: '#FDF6E3',
    primary: '#2AA198',
    primaryLight: '#3BB9AF',
    primaryDark: '#1E857C',
    accent: '#B58900',
    accentAlt: '#CB4B16',
    text: '#586E75',
    textSecondary: '#657B83',
    textMuted: '#93A1A1',
    border: '#E0D8C3',
    borderStrong: '#CCC3AB',
    tabBg: '#F5EEDB',
    tabBorder: '#E0D8C3',
    tabActiveTint: '#2AA198',
    tabInactiveTint: '#93A1A1',
    badgeBg: '#2AA198',
    badgeText: '#FDF6E3',
    gradient: ['#2AA198', '#B58900'],
    accentGlow: 'rgba(42, 161, 152, 0.25)',
  },
  andromeda: {
    id: 'andromeda',
    name: 'Andromeda',
    tagline: 'Cyber Interstellar',
    description: 'Deep outer-space void illuminated with interstellar cyan, hot magenta, and stellar gold.',
    icon: 'Sparkles',
    isDark: true,
    category: 'Zed',
    badge: 'NEO-CYBER',
    bg: '#262A33',
    cardBg: '#1E222A',
    surfaceBg: '#2F343F',
    headerBg: '#1E222A',
    primary: '#00E8C6',
    primaryLight: '#38FBD8',
    primaryDark: '#00B59B',
    accent: '#F92672',
    accentAlt: '#FFE66D',
    text: '#D5DECB',
    textSecondary: '#8992A0',
    textMuted: '#5F6672',
    border: 'rgba(0, 232, 198, 0.15)',
    borderStrong: 'rgba(0, 232, 198, 0.28)',
    tabBg: '#1E222A',
    tabBorder: '#262A33',
    tabActiveTint: '#00E8C6',
    tabInactiveTint: '#8992A0',
    badgeBg: '#00E8C6',
    badgeText: '#1E222A',
    gradient: ['#00E8C6', '#F92672'],
    accentGlow: 'rgba(0, 232, 198, 0.4)',
  },
};

export const ORDERED_THEME_IDS: ThemeId[] = [
  'light',
  'dark',
  'one_dark',
  'one_light',
  'ayu_dark',
  'ayu_mirage',
  'ayu_light',
  'gruvbox_dark',
  'gruvbox_light',
  'nord',
  'dracula',
  'solarized_dark',
  'solarized_light',
  'andromeda',
];

// Backwards compatibility aliases
THEMES.talent = THEMES.dark;
THEMES.tiktok = THEMES.dark;
THEMES.instagram = THEMES.dark;
THEMES.instagram_light = THEMES.light;
THEMES['One Dark'] = THEMES.one_dark;
THEMES['One Light'] = THEMES.one_light;
THEMES['Ayu Dark'] = THEMES.ayu_dark;
THEMES['Ayu Mirage'] = THEMES.ayu_mirage;
THEMES['Ayu Light'] = THEMES.ayu_light;
THEMES['Gruvbox Dark'] = THEMES.gruvbox_dark;
THEMES['Gruvbox Light'] = THEMES.gruvbox_light;
THEMES['Nord'] = THEMES.nord;
THEMES['Dracula'] = THEMES.dracula;
THEMES['Solarized Dark'] = THEMES.solarized_dark;
THEMES['Solarized Light'] = THEMES.solarized_light;
THEMES['Andromeda'] = THEMES.andromeda;

const normalizeThemeId = (rawId: string | null | undefined): ThemeId => {
  if (rawId && rawId in THEMES && THEMES[rawId]?.id) {
    return THEMES[rawId].id;
  }
  if (rawId === 'dark') return 'dark';
  return 'light';
};

const THEME_STORAGE_KEY = 'talent_app_theme_id_v2';

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

// Initialize web styling with default light theme immediately
syncWebStyles(THEMES.light);

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeId: 'light',
  theme: THEMES.light,

  setTheme: async (id: ThemeId) => {
    const normId = normalizeThemeId(id);
    const newTheme = THEMES[normId] || THEMES.light;
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
      const activeTheme = THEMES[normId] || THEMES.light;
      set({ themeId: normId, theme: activeTheme });
      syncWebStyles(activeTheme);
    } catch (e) {
      console.error('Failed to load saved theme:', e);
      syncWebStyles(get().theme);
    }
  },
}));
