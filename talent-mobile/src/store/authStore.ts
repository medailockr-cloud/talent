import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from '../utils/api';

interface User {
  id: number;
  username: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  title?: string;
  location?: string;
  quote?: string;
  followers?: number;
  following?: number;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true, // Start in loading state until we check SecureStore

  login: async (token: string, user: User) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
    set({ token, user, isLoading: false });
  },

  logout: async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      window.location.reload();
    } else {
      await SecureStore.deleteItemAsync('token');
      set({ token: null, user: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      if (token) {
        // Verify token with backend and fetch fresh user profile
        const response = await api.get('/profile/me');
        set({ token, user: response.data, isLoading: false });
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        console.log('Session expired or user not found. Stale token cleared.');
      } else {
        console.error('Auth verification failed', error);
      }
      if (Platform.OS === 'web') {
        localStorage.removeItem('token');
      } else {
        await SecureStore.deleteItemAsync('token');
      }
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
