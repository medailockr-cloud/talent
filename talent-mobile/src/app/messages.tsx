import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  Edit,
  Search,
  X,
  MessageSquare,
  Trash2,
  UserPlus,
  Check,
  CheckCheck,
} from 'lucide-react-native';
import { api } from '../utils/api';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import * as Haptics from 'expo-haptics';

export default function MessagesScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user: currentUser } = useAuthStore();

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Message Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Delete Conversation Modal State
  const [selectedConversationToDelete, setSelectedConversationToDelete] = useState<any>(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

  // Auto-refresh conversations whenever user navigates back to this screen
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const checkFallbackConversations = async (existing: any[] = []) => {
    try {
      const raw = await AsyncStorage.getItem('active_chat_user_ids');
      const storedIds: number[] = raw ? JSON.parse(raw) : [];
      // Candidates include stored chat IDs and seeded artists
      const candidateIds = Array.from(new Set([...storedIds, 2, 1, 3]));

      const fallbackList: any[] = [...existing];
      const existingUserIds = new Set(existing.map((c) => c.user?.id));

      await Promise.all(
        candidateIds.map(async (candidateId) => {
          if (existingUserIds.has(candidateId) || candidateId === currentUser?.id) return;
          try {
            const [msgRes, profileRes] = await Promise.all([
              api.get(`/messages/${candidateId}`).catch(() => ({ data: [] })),
              api.get(`/profile/${candidateId}`).catch(() => ({ data: null })),
            ]);

            const msgs = Array.isArray(msgRes.data) ? msgRes.data : [];
            if (msgs.length > 0 && profileRes.data) {
              fallbackList.push({
                user: profileRes.data,
                lastMessage: msgs[msgs.length - 1],
                unreadCount: 0,
              });
            }
          } catch (e) {}
        })
      );

      fallbackList.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setConversations(fallbackList);
    } catch (e) {
      console.warn('Fallback error:', e);
      setConversations(existing);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setConversations(res.data);
        return;
      }
      // If server returned empty, check fallback
      await checkFallbackConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.warn('Could not load conversations from server, checking fallback:', err?.message || err);
      await checkFallbackConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  // Search users when compose modal is open
  const searchUsers = useCallback(async (query: string) => {
    try {
      setSearchLoading(true);
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const openComposeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserSearchQuery('');
    setIsComposeOpen(true);
    searchUsers('');
  };

  const handleSelectUserToChat = (targetUser: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsComposeOpen(false);
    router.push(`/chat/${targetUser.id}` as any);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversationToDelete) return;
    try {
      setIsDeletingConversation(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await api.delete(`/messages/conversation/${selectedConversationToDelete.user.id}`);
      setConversations((prev) =>
        prev.filter((c) => c.user.id !== selectedConversationToDelete.user.id)
      );
      setSelectedConversationToDelete(null);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      Alert.alert('Error', 'Could not delete conversation. Please try again.');
    } finally {
      setIsDeletingConversation(false);
    }
  };

  // Relative Time Formatter
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (c.user?.name || '').toLowerCase();
    const username = (c.user?.username || '').toLowerCase();
    const text = (c.lastMessage?.text || '').toLowerCase();
    return name.includes(q) || username.includes(q) || text.includes(q);
  });

  const renderConversationItem = ({ item }: { item: any }) => {
    const isSentByMe = item.lastMessage?.senderId === currentUser?.id;
    const hasUnread = Boolean(item.unreadCount && item.unreadCount > 0);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/chat/${item.user.id}` as any);
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setSelectedConversationToDelete(item);
        }}
        style={{ borderBottomColor: theme.border }}
        className="flex-row items-center gap-3.5 py-3.5 border-b"
      >
        {/* User Avatar with Status Indicator */}
        <View className="relative">
          <Image
            source={{
              uri:
                item.user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  item.user.name || item.user.username || 'User'
                )}&background=208AEF&color=fff`,
            }}
            className="w-13 h-13 rounded-full"
            style={{ width: 52, height: 52, borderRadius: 26 }}
          />
          <View
            style={{ borderColor: theme.bg }}
            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2"
          />
        </View>

        {/* Content */}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              style={{ color: theme.text }}
              className={`text-[15px] ${hasUnread ? 'font-bold' : 'font-semibold'}`}
              numberOfLines={1}
            >
              {item.user.name || item.user.username}
            </Text>
            {item.lastMessage && (
              <Text
                style={{ color: hasUnread ? theme.primary : theme.textSecondary }}
                className={`text-[11px] ${hasUnread ? 'font-bold' : 'font-medium'}`}
              >
                {formatTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1 flex-1 mr-2">
              {isSentByMe && item.lastMessage && (
                <Text style={{ color: theme.textSecondary }} className="text-[13px] font-medium">
                  You:
                </Text>
              )}
              <Text
                style={{ color: hasUnread ? theme.text : theme.textSecondary }}
                className={`text-[13px] flex-1 ${hasUnread ? 'font-semibold' : ''}`}
                numberOfLines={1}
              >
                {item.lastMessage ? item.lastMessage.text : 'Start a conversation'}
              </Text>
            </View>

            {/* Unread Badge */}
            {hasUnread && (
              <View
                style={{ backgroundColor: theme.primary }}
                className="min-w-[20px] h-[20px] px-1.5 rounded-full items-center justify-center shadow-sm"
              >
                <Text className="text-white text-[11px] font-bold">
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 px-5 pt-12" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between pb-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={{ backgroundColor: theme.surfaceBg }}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
        >
          <ChevronLeft color={theme.text} size={22} />
        </TouchableOpacity>

        <Text style={{ color: theme.text }} className="text-[19px] font-bold">
          Direct Messages
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openComposeModal}
          style={{ backgroundColor: theme.primary }}
          className="w-10 h-10 rounded-full items-center justify-center shadow-md shadow-blue-500/20"
        >
          <Edit color="#fff" size={18} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
        className="flex-row items-center px-3.5 py-2.5 rounded-2xl border mb-3 mt-1"
      >
        <Search color={theme.textSecondary} size={16} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search messages or people..."
          placeholderTextColor={theme.textSecondary}
          style={{ color: theme.text }}
          className="flex-1 ml-2.5 text-[14px]"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            className="p-1"
          >
            <X color={theme.textSecondary} size={16} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} size="large" />
          <Text className="text-[13px] mt-3 font-medium" style={{ color: theme.textSecondary }}>
            Loading conversations...
          </Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <View
            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
            className="w-20 h-20 rounded-full items-center justify-center mb-4 border shadow-sm"
          >
            <MessageSquare color={theme.primary} size={32} />
          </View>
          <Text style={{ color: theme.text }} className="text-[18px] font-bold text-center mb-1.5">
            {searchQuery ? 'No matching conversations' : 'No messages yet'}
          </Text>
          <Text
            style={{ color: theme.textSecondary }}
            className="text-[13px] text-center mb-6 leading-relaxed max-w-xs"
          >
            {searchQuery
              ? `We couldn't find any chats matching "${searchQuery}".`
              : 'Direct message artists, judges, and creators to collaborate, share feedback, or connect!'}
          </Text>

          <TouchableOpacity
            onPress={openComposeModal}
            style={{ backgroundColor: theme.primary }}
            className="px-6 py-3.5 rounded-full flex-row items-center gap-2 shadow-lg shadow-blue-500/25 active:opacity-90"
          >
            <UserPlus color="#fff" size={16} />
            <Text className="text-white font-bold text-[13px] tracking-wide uppercase">
              Start a Conversation
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.user.id.toString()}
          renderItem={renderConversationItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      {/* New Message (Compose) Modal */}
      <Modal
        visible={isComposeOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsComposeOpen(false)}
      >
        <View className="flex-1 px-5 pt-6" style={{ backgroundColor: theme.bg }}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between pb-4">
            <Text style={{ color: theme.text }} className="text-[20px] font-bold">
              New Message
            </Text>
            <TouchableOpacity
              onPress={() => setIsComposeOpen(false)}
              style={{ backgroundColor: theme.surfaceBg }}
              className="w-9 h-9 rounded-full items-center justify-center shadow-sm"
            >
              <X color={theme.text} size={18} />
            </TouchableOpacity>
          </View>

          {/* User Search Input */}
          <View
            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
            className="flex-row items-center px-3.5 py-3 rounded-2xl border mb-4"
          >
            <Search color={theme.textSecondary} size={18} />
            <TextInput
              value={userSearchQuery}
              onChangeText={(text) => {
                setUserSearchQuery(text);
                searchUsers(text);
              }}
              placeholder="Search by name or @username..."
              placeholderTextColor={theme.textSecondary}
              style={{ color: theme.text }}
              className="flex-1 ml-2.5 text-[15px]"
              autoFocus
            />
            {userSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setUserSearchQuery('');
                  searchUsers('');
                }}
                className="p-1"
              >
                <X color={theme.textSecondary} size={16} />
              </TouchableOpacity>
            )}
          </View>

          {/* User Results Header */}
          <Text
            className="text-[12px] font-bold uppercase tracking-wider mb-2 ml-1"
            style={{ color: theme.textSecondary }}
          >
            {userSearchQuery ? 'Search Results' : 'Suggested Creators & Artists'}
          </Text>

          {/* Search Results List */}
          {searchLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : searchResults.length === 0 ? (
            <View className="py-16 items-center justify-center">
              <Text style={{ color: theme.textSecondary }} className="text-[14px]">
                No users found.
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectUserToChat(item)}
                  style={{ borderBottomColor: theme.border }}
                  className="flex-row items-center gap-3.5 py-3.5 border-b"
                >
                  <Image
                    source={{
                      uri:
                        item.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          item.name || item.username || 'User'
                        )}&background=208AEF&color=fff`,
                    }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="text-[15px] font-bold">
                      {item.name || item.username}
                    </Text>
                    <Text style={{ color: theme.textSecondary }} className="text-[12px]">
                      @{item.username} {item.title ? `• ${item.title}` : ''}
                    </Text>
                  </View>
                  <View
                    style={{ backgroundColor: theme.primary }}
                    className="px-3.5 py-1.5 rounded-full"
                  >
                    <Text className="text-white text-[12px] font-bold">Chat</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Delete Conversation Confirmation Modal */}
      {selectedConversationToDelete && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() =>
            !isDeletingConversation && setSelectedConversationToDelete(null)
          }
        >
          <View className="flex-1 bg-black/80 items-center justify-center p-6">
            <View
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="w-full max-w-sm rounded-[24px] p-6 items-center border shadow-2xl"
            >
              <View className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center mb-4">
                <Trash2 color="#EF4444" size={26} />
              </View>

              <Text style={{ color: theme.text }} className="text-[18px] font-bold text-center mb-2">
                Delete Conversation?
              </Text>

              <Text
                style={{ color: theme.textSecondary }}
                className="text-[13px] text-center mb-6 leading-relaxed"
              >
                Are you sure you want to delete all messages with{' '}
                <Text style={{ color: theme.text }} className="font-bold">
                  {selectedConversationToDelete.user.name ||
                    selectedConversationToDelete.user.username}
                </Text>
                ? This will permanently remove the chat history.
              </Text>

              <View className="w-full gap-3">
                <TouchableOpacity
                  disabled={isDeletingConversation}
                  onPress={handleDeleteConversation}
                  style={{ backgroundColor: '#EF4444' }}
                  className="w-full h-12 rounded-xl items-center justify-center flex-row gap-2 active:opacity-90 shadow-md shadow-red-500/25"
                >
                  {isDeletingConversation ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Trash2 color="#fff" size={16} />
                      <Text className="text-white font-bold text-[14px]">
                        Delete Conversation
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isDeletingConversation}
                  onPress={() => setSelectedConversationToDelete(null)}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="w-full h-12 rounded-xl items-center justify-center border"
                >
                  <Text style={{ color: theme.text }} className="font-semibold text-[14px]">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
