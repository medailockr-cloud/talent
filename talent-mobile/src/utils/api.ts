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

  // Only if developer explicitly requested a local backend override:
  if (process.env.EXPO_PUBLIC_USE_LOCAL_BACKEND === 'true') {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol || 'http:';
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `${protocol}//${hostname}:3000`;
      }
    }

    const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:3000`;
      }
    }
  }

  // Default everywhere to production Google Cloud Run:
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

export const requestSignedUploadUrl = async (
  filename: string,
  contentType: string,
  folder: 'videos' | 'images' | 'avatars' = 'videos'
): Promise<{ uploadUrl: string; publicUrl: string; destinationPath: string }> => {
  const res = await api.post('/upload/signed-url', { filename, contentType, folder });
  return res.data;
};

export const uploadToStorageDirectly = async (
  uploadUrl: string,
  localUri: string,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const res = await fetch(localUri);
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during direct storage upload'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Timeout during direct storage upload'));
    };

    xhr.send(blob);
  });
};

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
