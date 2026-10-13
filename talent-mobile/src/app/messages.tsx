import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Edit } from 'lucide-react-native';
import { api } from '../utils/api';
import { useThemeStore } from '../store/themeStore';
import * as Haptics from 'expo-haptics';

export default function MessagesScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/chat/${item.user.id}` as any);
      }}
      style={{ borderBottomColor: theme.border }}
      className="flex-row items-center gap-4 py-4 border-b"
    >
      <Image
        source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/150' }}
        className="w-14 h-14 rounded-full"
      />
      <View className="flex-1">
        <Text style={{ color: theme.text }} className="font-bold text-[16px]">{item.user.name || item.user.username}</Text>
        <Text style={{ color: theme.textSecondary }} className="text-[14px] mt-1" numberOfLines={1}>
          {item.lastMessage ? item.lastMessage.text : 'Start a conversation'}
        </Text>
      </View>
      {item.lastMessage && (
        <Text style={{ color: theme.textSecondary }} className="text-[12px]">
          {new Date(item.lastMessage.createdAt).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 px-5 pt-12" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between pb-6">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={{ backgroundColor: theme.surfaceBg }}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={{ color: theme.text }} className="text-[20px] font-bold">Messages</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {}}
          style={{ backgroundColor: theme.surfaceBg }}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Edit color={theme.text} size={20} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: theme.textSecondary }} className="text-[16px]">No messages yet.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
