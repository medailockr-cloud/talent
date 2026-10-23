import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CreateDraft {
  id: string;
  createdAt: number;
  updatedAt: number;
  mediaUri: string;
  mediaType: 'video' | 'image';
  cameraMode?: 'video' | 'photo';
  title: string;
  category: string;
  subCategory: string;
  purpose: string;
  location: string;
  allowJudging: boolean;
  allowComments: boolean;
  visibility: string;
  
  // Editor visual adjustments & effects
  activeFilter: string;
  filterIntensity: number;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
  };
  coverImageUri?: string | null;
  duration?: number;
  trimStart?: number;
  trimEnd?: number;
  
  // Audio & Soundtrack
  selectedSoundTrack: string;
  originalAudioVolume: number;
  isOriginalMuted: boolean;
  
  // Captions
  captionText: string;
  captionStyle: 'neon' | 'classic' | 'yellow' | 'minimal';
  showCaptions: boolean;
}

const DRAFTS_STORAGE_KEY = 'talent_studio_drafts_v1';

interface DraftsState {
  drafts: CreateDraft[];
  isLoading: boolean;
  loadDrafts: () => Promise<void>;
  saveDraft: (
    data: Omit<CreateDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<CreateDraft>;
  deleteDraft: (id: string) => Promise<void>;
  clearDrafts: () => Promise<void>;
  getDraft: (id: string) => CreateDraft | undefined;
}

const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error('Failed to read from storage:', e);
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (e) {
    console.error('Failed to write to storage:', e);
  }
};

export const useDraftsStore = create<DraftsState>((set, get) => ({
  drafts: [],
  isLoading: false,

  loadDrafts: async () => {
    set({ isLoading: true });
    try {
      const raw = await getStorageItem(DRAFTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Sort newest updated first
          const sorted = parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          set({ drafts: sorted, isLoading: false });
          return;
        }
      }
      set({ drafts: [], isLoading: false });
    } catch (err) {
      console.error('Error loading studio drafts:', err);
      set({ drafts: [], isLoading: false });
    }
  },

  saveDraft: async (data) => {
    const now = Date.now();
    const existing = get().drafts;
    let savedDraft: CreateDraft;

    if (data.id && existing.some((d) => d.id === data.id)) {
      // Update existing
      savedDraft = {
        ...data,
        id: data.id,
        createdAt: existing.find((d) => d.id === data.id)?.createdAt || now,
        updatedAt: now,
      };
      const updated = existing.map((d) => (d.id === data.id ? savedDraft : d));
      const sorted = updated.sort((a, b) => b.updatedAt - a.updatedAt);
      set({ drafts: sorted });
      await setStorageItem(DRAFTS_STORAGE_KEY, JSON.stringify(sorted));
    } else {
      // Create new draft
      savedDraft = {
        ...data,
        id: data.id || `draft_${now}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [savedDraft, ...existing];
      set({ drafts: updated });
      await setStorageItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    }

    return savedDraft;
  },

  deleteDraft: async (id: string) => {
    const existing = get().drafts;
    const filtered = existing.filter((d) => d.id !== id);
    set({ drafts: filtered });
    await setStorageItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
  },

  clearDrafts: async () => {
    set({ drafts: [] });
    await setStorageItem(DRAFTS_STORAGE_KEY, JSON.stringify([]));
  },

  getDraft: (id: string) => {
    return get().drafts.find((d) => d.id === id);
  },
}));
