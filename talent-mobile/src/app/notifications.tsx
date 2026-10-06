import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { ChevronLeft, Bell, Heart, MessageCircle, UserPlus, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { api } from '../utils/api';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const router = useRouter();
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
      case 'LIKE': return <Heart color="#E91E76" fill="#E91E76" size={20} />;
      case 'COMMENT': return <MessageCircle color="#3B82F6" fill="#3B82F6" size={20} />;
      case 'FOLLOW': return <UserPlus color="#10B981" size={20} />;
      case 'RATING': return <Star color="#F59E0B" fill="#F59E0B" size={20} />;
      default: return <Bell color="#9CA3AF" size={20} />;
    }
  };

  return (
    <View className="flex-1 bg-[#050608]">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-white/5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-white/5 rounded-full mr-3">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-[20px] font-bold">Notifications</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E91E76" size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {notifications.length === 0 ? (
            <View className="items-center justify-center mt-20">
              <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
                <Bell color="#4B5563" size={32} />
              </View>
              <Text className="text-white text-[16px] font-bold mb-2">No notifications yet</Text>
              <Text className="text-[#9CA3AF] text-[14px]">When you get likes, comments or follows, they'll show up here.</Text>
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
                className={`flex-row items-start gap-4 p-4 border-b border-white/5 ${!notif.read ? 'bg-[#E91E76]/5' : ''}`}
              >
                <View className="relative">
                  <Image source={{ uri: 'https://via.placeholder.com/150' }} className="w-12 h-12 rounded-full" />
                  <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1A1D24] items-center justify-center border-2 border-[#050608]">
                    {getIcon(notif.type)}
                  </View>
                </View>
                
                <View className="flex-1 pt-1">
                  <Text className="text-white text-[14px] leading-5">
                    {notif.content}
                  </Text>
                  <Text className="text-[#6B7280] text-[12px] mt-1">
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
