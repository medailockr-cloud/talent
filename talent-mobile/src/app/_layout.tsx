import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { checkAuth, token, isLoading } = useAuthStore();
  const { loadTheme, theme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Promise.all([checkAuth(), loadTheme()]).finally(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // Redirect away from login if already authenticated
      router.replace('/');
    }
  }, [token, isReady, isLoading, segments]);

  if (!isReady || isLoading) return null; // Or a splash loading screen

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme.isDark ? DarkTheme : DefaultTheme}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <Slot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

