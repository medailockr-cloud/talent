import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const CLOUD_RUN_BACKEND_URL = 'https://talent-git-186968698522.asia-south1.run.app';

// Determine the base backend URL dynamically:
export const getBackendBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }

  // When running in production or standalone native build (e.g. EAS build APK), default to Cloud Run
  if (!__DEV__) {
    return CLOUD_RUN_BACKEND_URL;
  }

  // On Web (browser) in development:
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:3000`;
    }
  }

  // On Native (Expo Go in development):
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000`;
    }
  }

  // Default fallback for preview/standalone builds and Cloud Run production:
  return CLOUD_RUN_BACKEND_URL;
};

export const BACKEND_URL = getBackendBaseUrl();
export const API_URL = `${BACKEND_URL}/api`;

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  const base = getBackendBaseUrl();
  if (url.startsWith('/')) {
    return `${base}${url}`;
  }
  return url.replace(
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?/,
    base
  );
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Interceptor to automatically attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
