import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send, Phone, Video, Info } from 'lucide-react-native';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import * as Haptics from 'expo-haptics';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Make sure this matches your backend

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const chatId = user?.id && id ? [user.id, parseInt(id as string)].sort().join('_') : null;

  useEffect(() => {
    if (!id || !user) return;
    
    // Connect to WebSocket
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      if (chatId) {
        socketRef.current.emit('join_chat', { chatId });
      }
    });

    socketRef.current.on('receive_message', (message: any) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    fetchChatData();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id, user]);

  const fetchChatData = async () => {
    try {
      // Fetch other user's profile info
      const profileRes = await api.get(`/profile/${id}`);
      setOtherUser(profileRes.data);

      // Fetch message history
      const messageRes = await api.get(`/messages/${id}`);
      setMessages(messageRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim() || !user || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const messageData = {
      text: inputText.trim(),
      senderId: user.id,
      receiverId: parseInt(id as string),
      chatId
    };

    // Emit to socket
    socketRef.current?.emit('send_message', messageData);
    
    setInputText('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.senderId === user?.id;

    return (
      <View className={`flex-row mb-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <Image
            source={{ uri: otherUser?.avatarUrl || 'https://via.placeholder.com/150' }}
            className="w-8 h-8 rounded-full mr-2 self-end"
          />
        )}
        <View className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMine ? 'bg-[#E91E76] rounded-br-sm' : 'bg-white/10 rounded-bl-sm'}`}>
          <Text className="text-white text-[15px]">{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#050608]">
      {/* Header */}
      <View className="pt-12 pb-4 px-5 flex-row items-center justify-between border-b border-white/5">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center -ml-2"
        >
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        
        {loading ? (
           <ActivityIndicator size="small" color="#E91E76" />
        ) : (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push(`/profile/${id}` as any)}
            className="flex-row items-center gap-3"
          >
            <Image
              source={{ uri: otherUser?.avatarUrl || 'https://via.placeholder.com/150' }}
              className="w-9 h-9 rounded-full"
            />
            <View>
              <Text className="text-white font-bold text-[16px]">{otherUser?.name || otherUser?.username}</Text>
              <Text className="text-[#9CA3AF] text-[12px]">@{otherUser?.username}</Text>
            </View>
          </TouchableOpacity>
        )}

        <View className="flex-row items-center gap-4">
          <TouchableOpacity activeOpacity={0.7}>
            <Phone color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Video color="#fff" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="px-5 py-3 pb-8 flex-row items-center gap-3 border-t border-white/5 bg-[#050608]">
          <View className="flex-1 bg-white/10 rounded-full flex-row items-center px-4 py-3 min-h-[44px]">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-white text-[15px]"
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
            className={`w-11 h-11 rounded-full items-center justify-center ${inputText.trim() ? 'bg-[#E91E76]' : 'bg-white/10'}`}
          >
            <Send color={inputText.trim() ? "#fff" : "#9CA3AF"} size={18} style={{ marginLeft: -2, transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
