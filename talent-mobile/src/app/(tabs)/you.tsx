import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Star, Mic2, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ProfileView } from '../../components/views/ProfileView';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function YouScreen() {
  const { user, logout, isLoading } = useAuthStore();
  const { theme } = useThemeStore();
  const router = useRouter();

  if (isLoading && !user) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: theme.bg }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <View 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          className="w-full max-w-[420px] rounded-3xl border p-8 items-center shadow-2xl"
        >
          {/* Avatar Spotlight Ring */}
          <View 
            style={{ 
              borderColor: theme.primary, 
              backgroundColor: `${theme.primary}15`,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16
            }}
            className="w-24 h-24 rounded-full border-2 items-center justify-center mb-6"
          >
            <User color={theme.primary} size={42} strokeWidth={2.2} />
          </View>

          <Text 
            className="text-[26px] font-bold text-center tracking-tight mb-2"
            style={{ color: theme.text }}
          >
            Your Artist Profile
          </Text>

          <Text 
            className="text-[14px] text-center leading-5 mb-8"
            style={{ color: theme.textSecondary }}
          >
            Step onto the stage. Sign in or register to publish your performances, receive unbiased blind judging, and build your fanbase.
          </Text>

          {/* Value Props */}
          <View className="w-full gap-3 mb-8">
            <View 
              style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
              className="flex-row items-center gap-3 p-3.5 rounded-2xl border"
            >
              <View 
                style={{ backgroundColor: `${theme.primary}20` }}
                className="w-9 h-9 rounded-xl items-center justify-center"
              >
                <Star color={theme.primary} size={18} fill={theme.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold" style={{ color: theme.text }}>
                  Blind Calibrations
                </Text>
                <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                  100% merit-based scoring with audio-first judging
                </Text>
              </View>
            </View>

            <View 
              style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
              className="flex-row items-center gap-3 p-3.5 rounded-2xl border"
            >
              <View 
                style={{ backgroundColor: `${theme.primary}20` }}
                className="w-9 h-9 rounded-xl items-center justify-center"
              >
                <Mic2 color={theme.primary} size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold" style={{ color: theme.text }}>
                  Stage Performances
                </Text>
                <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                  Publish takes, setlists, and concert schedules
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(auth)/login');
            }}
            style={{ backgroundColor: theme.primary }}
            className="w-full h-12 rounded-full flex-row items-center justify-center gap-2 mb-3 shadow-lg"
          >
            <Text className="text-white font-bold text-sm tracking-wider uppercase">
              Sign In or Register
            </Text>
            <ArrowRight color="#fff" size={16} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace('/');
            }}
            style={{ borderColor: theme.border, backgroundColor: theme.surfaceBg }}
            className="w-full h-11 rounded-full border items-center justify-center"
          >
            <Text className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
              Explore Stage Feed First
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return <ProfileView user={user} onLogout={logout} />;
}
