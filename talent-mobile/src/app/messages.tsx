import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Edit } from 'lucide-react-native';
import { api } from '../utils/api';
import * as Haptics from 'expo-haptics';

export default function MessagesScreen() {
  const router = useRouter();
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
      className="flex-row items-center gap-4 py-4 border-b border-white/5"
    >
      <Image
        source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/150' }}
        className="w-14 h-14 rounded-full"
      />
      <View className="flex-1">
        <Text className="text-white font-bold text-[16px]">{item.user.name || item.user.username}</Text>
        <Text className="text-[#9CA3AF] text-[14px] mt-1" numberOfLines={1}>
          {item.lastMessage ? item.lastMessage.text : 'Start a conversation'}
        </Text>
      </View>
      {item.lastMessage && (
        <Text className="text-[#6B7280] text-[12px]">
          {new Date(item.lastMessage.createdAt).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#050608] px-5 pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-6">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center"
        >
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-[20px] font-bold">Messages</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {}}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center"
        >
          <Edit color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E91E76" />
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#9CA3AF] text-[16px]">No messages yet.</Text>
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
