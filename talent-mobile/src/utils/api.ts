import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Determine the base backend URL dynamically:
export const getBackendBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }

  // On Web (browser):
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    // If opening from phone browser via LAN (e.g. 192.168.1.9:8081), hostname is 192.168.1.9
    return `${protocol}//${hostname}:3000`;
  }

  // On Native (Expo Go / Android):
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:3000`;
    }
  }

  // Fallback to local machine Wi-Fi IP
  return 'http://192.168.1.9:3000';
};

export const BACKEND_URL = getBackendBaseUrl();
export const API_URL = `${BACKEND_URL}/api`;

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  const base = getBackendBaseUrl();
  return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):3000/, base);
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
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
