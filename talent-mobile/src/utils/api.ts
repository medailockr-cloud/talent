import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use your computer's local IP address if testing on a real device, 
// or 10.0.2.2 if testing on an Android emulator.
// Since we are primarily targeting web right now, localhost is fine.
const API_URL = 'http://localhost:3000/api';

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
