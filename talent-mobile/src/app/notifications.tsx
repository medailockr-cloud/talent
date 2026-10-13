import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { ChevronLeft, Bell, Heart, MessageCircle, UserPlus, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { api } from '../utils/api';
import { useThemeStore } from '../store/themeStore';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications);
      } catch (error) {
        console.error('Notifications error:', error);
      }
      setIsLoading(false);
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart color={theme.primary} fill={theme.primary} size={20} />;
      case 'COMMENT': return <MessageCircle color="#3B82F6" fill="#3B82F6" size={20} />;
      case 'FOLLOW': return <UserPlus color="#10B981" size={20} />;
      case 'RATING': return <Star color="#F59E0B" fill="#F59E0B" size={20} />;
      default: return <Bell color={theme.textSecondary} size={20} />;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <View 
        style={{ borderBottomColor: theme.border }}
        className="px-4 pt-12 pb-4 border-b flex-row items-center"
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: theme.surfaceBg }}
          className="w-10 h-10 items-center justify-center rounded-full mr-3"
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={{ color: theme.text }} className="text-[20px] font-bold">Notifications</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {notifications.length === 0 ? (
            <View className="items-center justify-center mt-20 px-6">
              <View 
                style={{ backgroundColor: theme.surfaceBg }}
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
              >
                <Bell color={theme.textSecondary} size={32} />
              </View>
              <Text style={{ color: theme.text }} className="text-[16px] font-bold mb-2">No notifications yet</Text>
              <Text style={{ color: theme.textSecondary }} className="text-[14px] text-center">When you get likes, comments or follows, they'll show up here.</Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity 
                key={notif.id}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!notif.read) {
                    // Mark as read API could go here
                  }
                  // Navigate to related content if needed
                }}
                style={{
                  borderBottomColor: theme.border,
                  backgroundColor: !notif.read ? theme.primary + '10' : 'transparent'
                }}
                className="flex-row items-start gap-4 p-4 border-b"
              >
                <View className="relative">
                  <Image source={{ uri: 'https://via.placeholder.com/150' }} className="w-12 h-12 rounded-full" />
                  <View 
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.bg }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center border-2"
                  >
                    {getIcon(notif.type)}
                  </View>
                </View>
                
                <View className="flex-1 pt-1">
                  <Text style={{ color: theme.text }} className="text-[14px] leading-5">
                    {notif.content}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
