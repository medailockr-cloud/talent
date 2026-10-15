import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  Trash2,
  User as UserIcon,
  Sparkles,
  X,
  Copy,
  CornerUpLeft,
  Edit3,
  Share2,
  Smile,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { api, BACKEND_URL } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import * as Haptics from 'expo-haptics';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = BACKEND_URL;
const QUICK_EMOJIS = ['❤️', '👍', '😂', '🔥', '😮', '👏'];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { theme } = useThemeStore();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<any | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
  const [editingMessage, setEditingMessage] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const numericTargetId = parseInt(id as string);
  const chatId = user?.id && !isNaN(numericTargetId)
    ? [user.id, numericTargetId].sort().join('_')
    : null;

  useEffect(() => {
    if (!id) return;
    const num = parseInt(id as string);
    if (!isNaN(num)) {
      AsyncStorage.getItem('active_chat_user_ids').then((raw) => {
        const ids: number[] = raw ? JSON.parse(raw) : [];
        if (!ids.includes(num)) {
          ids.push(num);
          AsyncStorage.setItem('active_chat_user_ids', JSON.stringify(ids));
        }
      }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;

    // Connect to WebSocket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      if (chatId) {
        socketRef.current.emit('join_chat', { chatId });
      }
      if (user?.id) {
        socketRef.current.emit('join_user', { userId: user.id });
      }
    });

    socketRef.current.on('receive_message', (message: any) => {
      setMessages((prev) => {
        // Prevent duplicate if already added optimistically
        if (prev.some((m) => m.id === message.id || (m.tempId && m.text === message.text && m.senderId === message.senderId))) {
          return prev.map((m) => (m.tempId && m.text === message.text ? message : m));
        }
        return [...prev, message];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socketRef.current.on('user_typing', (data: any) => {
      if (data?.userId === numericTargetId) {
        setIsOtherUserTyping(true);
      }
    });

    socketRef.current.on('user_stop_typing', (data: any) => {
      if (data?.userId === numericTargetId) {
        setIsOtherUserTyping(false);
      }
    });

    socketRef.current.on('message_deleted', (data: any) => {
      if (data?.messageId) {
        setMessages((prev) => prev.filter((m) => String(m.id) !== String(data.messageId)));
      }
    });

    socketRef.current.on('message_updated', (updated: any) => {
      if (updated?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, text: updated.text, isEdited: true } : m))
        );
      }
    });

    socketRef.current.on('message_reaction', (data: any) => {
      if (data?.messageId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
        );
      }
    });

    fetchChatData();

    return () => {
      socketRef.current?.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [id, user]);

  const fetchChatData = async () => {
    try {
      // Fetch other user's profile info
      const [profileRes, messageRes] = await Promise.all([
        api.get(`/profile/${id}`).catch(() => ({ data: null })),
        api.get(`/messages/${id}`).catch(() => ({ data: [] })),
      ]);

      if (profileRes.data) {
        setOtherUser(profileRes.data);
      }
      setMessages(Array.isArray(messageRes.data) ? messageRes.data : []);
    } catch (err) {
      console.warn('Error loading chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    // Emit typing indicator
    if (socketRef.current && chatId && user?.id) {
      socketRef.current.emit('typing', { chatId, userId: user.id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { chatId, userId: user.id });
      }, 1500);
    }
  };

  const sendMessageWithText = async (textToSend: string) => {
    if (!textToSend.trim() || !user || isNaN(numericTargetId)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const trimmed = textToSend.trim();
    const tempId = `temp_${Date.now()}`;
    const currentReply = replyingToMessage;
    setReplyingToMessage(null);

    const replySenderName = currentReply
      ? currentReply.senderId === user.id
        ? 'You'
        : (otherUser?.name || otherUser?.username || 'User')
      : undefined;

    const optimisticMessage = {
      id: tempId,
      tempId,
      text: trimmed,
      senderId: user.id,
      receiverId: numericTargetId,
      createdAt: new Date().toISOString(),
      isRead: false,
      replyToId: currentReply?.id,
      replyToText: currentReply?.text,
      replyToSender: replySenderName,
    };

    // 1. Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    // Stop typing indicator
    if (socketRef.current && chatId) {
      socketRef.current.emit('stop_typing', { chatId, userId: user.id });
    }

    // 2. Deliver via HTTP API (reliable, creates in DB and triggers socket broadcast on backend)
    try {
      setIsSending(true);
      const res = await api.post('/messages', {
        receiverId: numericTargetId,
        text: trimmed,
        replyToId: currentReply?.id,
        replyToText: currentReply?.text,
        replyToSender: replySenderName,
      });

      // Replace temporary optimistic message with real saved record
      if (res.data?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.tempId === tempId ? res.data : m))
        );
      }
    } catch (err) {
      console.warn('HTTP message delivery fallback to socket:', err);
      // Fallback: emit directly via socket if HTTP fails
      socketRef.current?.emit('send_message', {
        text: trimmed,
        senderId: user.id,
        receiverId: numericTargetId,
        chatId,
        replyToId: currentReply?.id,
        replyToText: currentReply?.text,
        replyToSender: replySenderName,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = async (msg?: any) => {
    const target = msg || selectedMessageForAction;
    if (!target?.text) return;
    try {
      await Clipboard.setStringAsync(target.text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Copied to clipboard');
      setSelectedMessageForAction(null);
    } catch (err) {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(target.text).catch(() => {});
      }
      showToast('Copied to clipboard');
      setSelectedMessageForAction(null);
    }
  };

  const handleShareMessage = async (msg?: any) => {
    const target = msg || selectedMessageForAction;
    if (!target?.text) return;
    try {
      setSelectedMessageForAction(null);
      await Share.share({
        message: target.text,
        title: 'Talent Message',
      });
    } catch (err) {
      console.error('Failed to share message:', err);
    }
  };

  const handleStartReply = (msg?: any) => {
    const target = msg || selectedMessageForAction;
    if (!target) return;
    setReplyingToMessage(target);
    setEditingMessage(null);
    setSelectedMessageForAction(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartEdit = (msg?: any) => {
    const target = msg || selectedMessageForAction;
    if (!target) return;
    setEditingMessage(target);
    setInputText(target.text);
    setReplyingToMessage(null);
    setSelectedMessageForAction(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !inputText.trim()) return;
    const msgId = editingMessage.id;
    const newText = inputText.trim();

    try {
      setIsSending(true);
      setEditingMessage(null);
      setInputText('');
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: newText, isEdited: true } : m))
      );
      await api.patch(`/messages/single/${msgId}`, { text: newText });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Message edited');
    } catch (err) {
      console.error('Failed to edit message:', err);
      Alert.alert('Error', 'Could not update message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleReaction = async (targetMsg: any, emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msgId = targetMsg?.id;
    if (!msgId || !user?.id) return;

    // Optimistic reaction update
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        let reactionsMap: Record<string, number[]> = {};
        if (m.reactions) {
          try {
            reactionsMap = typeof m.reactions === 'string' ? JSON.parse(m.reactions) : m.reactions;
          } catch (e) {
            reactionsMap = {};
          }
        }
        const currentUsers: number[] = Array.isArray(reactionsMap[emoji]) ? reactionsMap[emoji] : [];
        if (currentUsers.includes(user.id)) {
          reactionsMap[emoji] = currentUsers.filter((uid) => uid !== user.id);
          if (reactionsMap[emoji].length === 0) delete reactionsMap[emoji];
        } else {
          reactionsMap[emoji] = [...currentUsers, user.id];
        }
        return { ...m, reactions: JSON.stringify(reactionsMap) };
      })
    );

    setSelectedMessageForAction(null);

    // Call backend API if real ID
    if (typeof msgId === 'number' || (!String(msgId).startsWith('temp_') && !isNaN(Number(msgId)))) {
      try {
        await api.post(`/messages/single/${msgId}/react`, { emoji });
      } catch (err) {
        console.error('Failed to react to message:', err);
      }
    }
  };

  const handleClearChatHistory = async () => {
    try {
      setIsClearingChat(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const targetId = otherUser?.id || (!isNaN(numericTargetId) ? numericTargetId : id);
      if (targetId) {
        await api.delete(`/messages/conversation/${targetId}`).catch(async () => {
          return api.delete(`/messages/${targetId}`);
        });
      }

      setMessages([]);
      setIsClearChatModalOpen(false);
      setIsMenuOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Failed to clear chat:', err);
      setMessages([]);
      setIsClearChatModalOpen(false);
      setIsMenuOpen(false);
    } finally {
      setIsClearingChat(false);
    }
  };

  const handleDeleteSingleMessage = async () => {
    if (!selectedMessageForAction) return;
    const targetMsg = selectedMessageForAction;
    const targetMsgId = targetMsg.id;

    try {
      setIsDeletingMessage(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistic removal from local UI state
      setMessages((prev) => prev.filter((m) => String(m.id) !== String(targetMsgId)));
      setSelectedMessageForAction(null);

      // Delete from backend if persistent
      if (typeof targetMsgId === 'number' || (!String(targetMsgId).startsWith('temp_') && !isNaN(Number(targetMsgId)))) {
        try {
          await api.delete(`/messages/single/${targetMsgId}`);
        } catch (apiErr: any) {
          // If 404, the message was already deleted or not present on server, which is idempotent success
          if (apiErr?.response?.status !== 404) {
            throw apiErr;
          }
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Message deleted');
    } catch (err) {
      console.error('Failed to delete individual message:', err);
      Alert.alert('Error', 'Could not delete message. Please try again.');
    } finally {
      setIsDeletingMessage(false);
    }
  };

  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.senderId === user?.id;

    // Parse reactions map
    let reactionsMap: Record<string, number[]> = {};
    if (item.reactions) {
      try {
        reactionsMap = typeof item.reactions === 'string' ? JSON.parse(item.reactions) : item.reactions;
      } catch (e) {
        reactionsMap = {};
      }
    }
    const reactionsEntries = Object.entries(reactionsMap).filter(
      ([_, ids]) => Array.isArray(ids) && ids.length > 0
    );

    return (
      <View className={`flex-row mb-3.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <Image
            source={{
              uri:
                otherUser?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  otherUser?.name || otherUser?.username || 'User'
                )}&background=208AEF&color=fff`,
            }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            className="mr-2 self-end mb-1"
          />
        )}
        <View className="max-w-[78%]">
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectedMessageForAction(item);
            }}
            delayLongPress={250}
          >
            <View
              style={
                isMine
                  ? { backgroundColor: theme.primary }
                  : { backgroundColor: theme.surfaceBg, borderColor: theme.border, borderWidth: 1 }
              }
              className={`rounded-2xl px-4 py-2.5 ${
                isMine ? 'rounded-br-xs' : 'rounded-bl-xs'
              } shadow-sm`}
            >
              {/* Quoted Reply Preview */}
              {item.replyToText && (
                <View
                  style={{
                    backgroundColor: isMine ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.06)',
                    borderLeftColor: isMine ? '#ffffff' : theme.primary,
                    borderLeftWidth: 3,
                  }}
                  className="rounded-lg p-2 mb-2"
                >
                  <Text
                    style={{ color: isMine ? '#ffffff' : theme.primary }}
                    className="text-[11px] font-bold"
                  >
                    {item.replyToSender || 'Replying'}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{ color: isMine ? 'rgba(255,255,255,0.85)' : theme.textSecondary }}
                    className="text-[12px] mt-0.5"
                  >
                    {item.replyToText}
                  </Text>
                </View>
              )}

              <Text
                style={{ color: isMine ? '#ffffff' : theme.text }}
                className="text-[15px] leading-relaxed"
              >
                {item.text}
              </Text>
            </View>

            {/* Time, Edited & Read receipts */}
            <View
              className={`flex-row items-center gap-1 mt-1 px-1 ${
                isMine ? 'justify-end' : 'justify-start'
              }`}
            >
              {item.isEdited && (
                <Text style={{ color: theme.textSecondary }} className="text-[10px] italic">
                  edited
                </Text>
              )}
              <Text style={{ color: theme.textSecondary }} className="text-[10px]">
                {formatMessageTime(item.createdAt)}
              </Text>
              {isMine && (
                item.isRead ? (
                  <CheckCheck color={theme.primary} size={12} strokeWidth={2.5} />
                ) : (
                  <Check color={theme.textSecondary} size={12} strokeWidth={2} />
                )
              )}
            </View>
          </TouchableOpacity>

          {/* Reaction Badges */}
          {reactionsEntries.length > 0 && (
            <View className={`flex-row flex-wrap gap-1 mt-1 px-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {reactionsEntries.map(([emoji, userIds]: [string, any]) => {
                const hasReacted = userIds.includes(user?.id);
                return (
                  <TouchableOpacity
                    key={emoji}
                    activeOpacity={0.7}
                    onPress={() => handleToggleReaction(item, emoji)}
                    style={{
                      backgroundColor: hasReacted ? `${theme.primary}25` : theme.surfaceBg,
                      borderColor: hasReacted ? theme.primary : theme.border,
                      borderWidth: 1,
                    }}
                    className="flex-row items-center gap-1 px-2 py-0.5 rounded-full shadow-xs"
                  >
                    <Text className="text-[12px]">{emoji}</Text>
                    {userIds.length > 1 && (
                      <Text
                        style={{ color: hasReacted ? theme.primary : theme.textSecondary }}
                        className="text-[10px] font-bold"
                      >
                        {userIds.length}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Starter Conversation Prompt Chips
  const promptChips = [
    'Loved your recent performance! 👏',
    'Hey, open for a collab? 🎤',
    'Great work on your takes! ✨',
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <View
        style={{ borderBottomColor: theme.border, backgroundColor: theme.bg }}
        className="pt-12 pb-3.5 px-4 flex-row items-center justify-between border-b"
      >
        <View className="flex-row items-center gap-2.5 flex-1">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/messages' as any);
              }
            }}
            style={{ backgroundColor: theme.surfaceBg }}
            className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
          >
            <ChevronLeft color={theme.text} size={22} />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/profile/${id}` as any)}
              className="flex-row items-center gap-3 flex-1 mr-2"
            >
              <View className="relative">
                <Image
                  source={{
                    uri:
                      otherUser?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        otherUser?.name || otherUser?.username || 'User'
                      )}&background=208AEF&color=fff`,
                  }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
                <View
                  style={{ borderColor: theme.bg }}
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2"
                />
              </View>
              <View className="flex-1">
                <Text
                  style={{ color: theme.text }}
                  className="font-bold text-[15px]"
                  numberOfLines={1}
                >
                  {otherUser?.name || otherUser?.username || 'User'}
                </Text>
                <Text
                  style={{ color: isOtherUserTyping ? theme.primary : '#10B981' }}
                  className="text-[11px] font-medium"
                >
                  {isOtherUserTyping ? 'typing...' : 'Active now'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsMenuOpen(true)}
            style={{ backgroundColor: theme.surfaceBg }}
            className="w-9 h-9 rounded-full items-center justify-center shadow-sm"
          >
            <MoreVertical color={theme.text} size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List or Empty State */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : messages.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center mb-6">
            <Image
              source={{
                uri:
                  otherUser?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    otherUser?.name || otherUser?.username || 'User'
                  )}&background=208AEF&color=fff`,
              }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              className="mb-3 border-2 border-blue-500/30"
            />
            <Text style={{ color: theme.text }} className="text-[20px] font-bold text-center">
              {otherUser?.name || otherUser?.username}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-[13px] text-center mt-0.5">
              @{otherUser?.username} {otherUser?.title ? `• ${otherUser.title}` : ''}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-[12px] text-center mt-3 max-w-xs leading-relaxed">
              Say hello to {otherUser?.name || 'them'}! Messages between you two are direct and private.
            </Text>
          </View>

          {/* Quick starter chips */}
          <View className="w-full gap-2">
            <Text
              style={{ color: theme.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-wider text-center mb-1"
            >
              Quick Starters
            </Text>
            {promptChips.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => sendMessageWithText(chip)}
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="w-full py-3 px-4 rounded-xl border flex-row items-center justify-between active:opacity-80"
              >
                <Text style={{ color: theme.text }} className="text-[13px] font-medium">
                  {chip}
                </Text>
                <Sparkles color={theme.primary} size={15} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Typing Indicator */}
      {isOtherUserTyping && (
        <View className="px-6 py-1.5 flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <Text style={{ color: theme.textSecondary }} className="text-[12px] italic">
            {otherUser?.name || 'User'} is typing...
          </Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Active Reply Banner */}
        {replyingToMessage && (
          <View
            style={{ backgroundColor: theme.surfaceBg, borderTopColor: theme.border, borderTopWidth: 1 }}
            className="px-4 py-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5 flex-1 mr-2">
              <View style={{ backgroundColor: theme.primary }} className="w-1 h-9 rounded-full" />
              <View className="flex-1">
                <Text style={{ color: theme.primary }} className="text-[11px] font-bold">
                  Replying to {replyingToMessage.senderId === user?.id ? 'Yourself' : (otherUser?.name || otherUser?.username || 'User')}
                </Text>
                <Text numberOfLines={1} style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5">
                  {replyingToMessage.text}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingToMessage(null)}
              style={{ backgroundColor: theme.cardBg }}
              className="w-7 h-7 rounded-full items-center justify-center active:opacity-70"
            >
              <X color={theme.textSecondary} size={15} />
            </TouchableOpacity>
          </View>
        )}

        {/* Active Edit Banner */}
        {editingMessage && (
          <View
            style={{ backgroundColor: theme.surfaceBg, borderTopColor: theme.border, borderTopWidth: 1 }}
            className="px-4 py-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5 flex-1 mr-2">
              <View className="w-1 h-9 rounded-full bg-amber-500" />
              <View className="flex-1">
                <Text className="text-amber-500 text-[11px] font-bold">
                  Editing Message
                </Text>
                <Text numberOfLines={1} style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5">
                  {editingMessage.text}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditingMessage(null);
                setInputText('');
              }}
              style={{ backgroundColor: theme.cardBg }}
              className="w-7 h-7 rounded-full items-center justify-center active:opacity-70"
            >
              <X color={theme.textSecondary} size={15} />
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{ borderTopColor: theme.border, backgroundColor: theme.bg }}
          className="px-4 py-2.5 pb-7 flex-row items-center gap-2.5 border-t"
        >
          <View
            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
            className="flex-1 rounded-full flex-row items-center px-4 py-2 min-h-[44px] border"
          >
            <TextInput
              value={inputText}
              onChangeText={handleInputChange}
              placeholder={
                editingMessage
                  ? 'Edit message...'
                  : replyingToMessage
                  ? `Reply to ${replyingToMessage.senderId === user?.id ? 'yourself' : otherUser?.name || 'User'}...`
                  : `Message ${otherUser?.name ? otherUser.name.split(' ')[0] : ''}...`
              }
              placeholderTextColor={theme.textSecondary}
              style={{ color: theme.text }}
              className="flex-1 text-[14px]"
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={() => (editingMessage ? handleSaveEdit() : sendMessageWithText(inputText))}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.7}
            style={{
              backgroundColor: inputText.trim()
                ? editingMessage
                  ? '#F59E0B'
                  : theme.primary
                : theme.surfaceBg,
              opacity: inputText.trim() ? 1 : 0.6,
            }}
            className="w-11 h-11 rounded-full items-center justify-center shadow-sm"
          >
            {editingMessage ? (
              <Check color="#fff" size={18} strokeWidth={2.5} />
            ) : (
              <Send
                color={inputText.trim() ? '#fff' : theme.textSecondary}
                size={18}
                style={{ marginLeft: -1 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* More Options Modal */}
      {isMenuOpen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
            className="flex-1 bg-black/60 justify-end"
          >
            <View
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="rounded-t-[28px] p-6 pb-9 border-t shadow-2xl"
            >
              <View className="items-center mb-5">
                <View className="w-10 h-1 rounded-full bg-white/20 mb-3" />
                <Text style={{ color: theme.text }} className="text-[17px] font-bold">
                  Chat Options
                </Text>
              </View>

              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => {
                    setIsMenuOpen(false);
                    router.push(`/profile/${id}` as any);
                  }}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="flex-row items-center gap-3 p-3.5 rounded-2xl border active:opacity-80"
                >
                  <UserIcon color={theme.text} size={18} />
                  <Text style={{ color: theme.text }} className="font-semibold text-[14px]">
                    View {otherUser?.name || 'User'}'s Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsMenuOpen(false);
                    setIsClearChatModalOpen(true);
                  }}
                  style={{ backgroundColor: '#EF444415', borderColor: '#EF444430', borderWidth: 1 }}
                  className="flex-row items-center gap-3 p-3.5 rounded-2xl active:opacity-80"
                >
                  <Trash2 color="#EF4444" size={18} />
                  <Text className="text-red-500 font-semibold text-[14px]">
                    Clear Chat History
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setIsMenuOpen(false)}
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="w-full h-11 rounded-2xl items-center justify-center mt-4 border"
              >
                <Text style={{ color: theme.textSecondary }} className="font-semibold text-[13px]">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Clear Chat Confirmation Modal */}
      {isClearChatModalOpen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => !isClearingChat && setIsClearChatModalOpen(false)}
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
                Clear Chat History?
              </Text>

              <Text
                style={{ color: theme.textSecondary }}
                className="text-[13px] text-center mb-6 leading-relaxed"
              >
                All messages between you and{' '}
                <Text style={{ color: theme.text }} className="font-bold">
                  {otherUser?.name || otherUser?.username}
                </Text>{' '}
                will be permanently deleted.
              </Text>

              <View className="w-full gap-3">
                <TouchableOpacity
                  disabled={isClearingChat}
                  onPress={handleClearChatHistory}
                  style={{ backgroundColor: '#EF4444' }}
                  className="w-full h-12 rounded-xl items-center justify-center flex-row gap-2 active:opacity-90 shadow-md shadow-red-500/25"
                >
                  {isClearingChat ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Trash2 color="#fff" size={16} />
                      <Text className="text-white font-bold text-[14px]">
                        Clear All Messages
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isClearingChat}
                  onPress={() => setIsClearChatModalOpen(false)}
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

      {/* Comprehensive Individual Message Action Modal */}
      {selectedMessageForAction && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => !isDeletingMessage && setSelectedMessageForAction(null)}
        >
          <View className="flex-1 bg-black/80 items-center justify-end sm:justify-center p-4 pb-8 sm:pb-4">
            <View
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="w-full max-w-sm rounded-[28px] p-5 items-center border shadow-2xl"
            >
              {/* Quick Emoji Reaction Strip */}
              <View
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="w-full flex-row items-center justify-around py-2 px-1 rounded-2xl border mb-3.5"
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => handleToggleReaction(selectedMessageForAction, emoji)}
                    activeOpacity={0.7}
                    className="w-10 h-10 rounded-full items-center justify-center active:scale-90"
                  >
                    <Text className="text-[22px]">{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Message Quote Preview */}
              <View
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="w-full rounded-2xl p-3 mb-3.5 border"
              >
                <Text
                  style={{ color: theme.textSecondary }}
                  className="text-[10px] font-bold mb-1 uppercase tracking-wider"
                >
                  {selectedMessageForAction.senderId === user?.id
                    ? 'Your message'
                    : `${otherUser?.name || otherUser?.username || 'Their'} message`}
                </Text>
                <Text
                  numberOfLines={3}
                  style={{ color: theme.text }}
                  className="text-[13px] leading-relaxed italic"
                >
                  "{selectedMessageForAction.text}"
                </Text>
              </View>

              {/* Action Buttons List */}
              <View className="w-full gap-2">
                {/* Reply */}
                <TouchableOpacity
                  onPress={() => handleStartReply(selectedMessageForAction)}
                  style={{ backgroundColor: theme.surfaceBg }}
                  className="w-full py-3 px-4 rounded-xl flex-row items-center gap-3 active:opacity-80"
                >
                  <View className="w-8 h-8 rounded-full bg-blue-500/15 items-center justify-center">
                    <CornerUpLeft color="#3B82F6" size={17} />
                  </View>
                  <Text style={{ color: theme.text }} className="font-semibold text-[14px]">
                    Reply
                  </Text>
                </TouchableOpacity>

                {/* Copy Text */}
                <TouchableOpacity
                  onPress={() => handleCopyMessage(selectedMessageForAction)}
                  style={{ backgroundColor: theme.surfaceBg }}
                  className="w-full py-3 px-4 rounded-xl flex-row items-center gap-3 active:opacity-80"
                >
                  <View className="w-8 h-8 rounded-full bg-purple-500/15 items-center justify-center">
                    <Copy color="#A855F7" size={17} />
                  </View>
                  <Text style={{ color: theme.text }} className="font-semibold text-[14px]">
                    Copy Text
                  </Text>
                </TouchableOpacity>

                {/* Edit Message (if author) */}
                {selectedMessageForAction.senderId === user?.id && (
                  <TouchableOpacity
                    onPress={() => handleStartEdit(selectedMessageForAction)}
                    style={{ backgroundColor: theme.surfaceBg }}
                    className="w-full py-3 px-4 rounded-xl flex-row items-center gap-3 active:opacity-80"
                  >
                    <View className="w-8 h-8 rounded-full bg-amber-500/15 items-center justify-center">
                      <Edit3 color="#F59E0B" size={17} />
                    </View>
                    <Text style={{ color: theme.text }} className="font-semibold text-[14px]">
                      Edit Message
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Share */}
                <TouchableOpacity
                  onPress={() => handleShareMessage(selectedMessageForAction)}
                  style={{ backgroundColor: theme.surfaceBg }}
                  className="w-full py-3 px-4 rounded-xl flex-row items-center gap-3 active:opacity-80"
                >
                  <View className="w-8 h-8 rounded-full bg-emerald-500/15 items-center justify-center">
                    <Share2 color="#10B981" size={17} />
                  </View>
                  <Text style={{ color: theme.text }} className="font-semibold text-[14px]">
                    Share...
                  </Text>
                </TouchableOpacity>

                {/* Delete Message */}
                <TouchableOpacity
                  disabled={isDeletingMessage}
                  onPress={handleDeleteSingleMessage}
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)' }}
                  className="w-full py-3 px-4 rounded-xl flex-row items-center gap-3 active:opacity-80"
                >
                  <View className="w-8 h-8 rounded-full bg-red-500/20 items-center justify-center">
                    {isDeletingMessage ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Trash2 color="#EF4444" size={17} />
                    )}
                  </View>
                  <Text className="text-red-500 font-semibold text-[14px]">
                    Delete Message
                  </Text>
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity
                  onPress={() => setSelectedMessageForAction(null)}
                  style={{ borderColor: theme.border }}
                  className="w-full py-2.5 rounded-xl items-center justify-center border mt-1"
                >
                  <Text style={{ color: theme.textSecondary }} className="font-semibold text-[13px]">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View className="absolute top-24 left-0 right-0 items-center z-50 pointer-events-none">
          <View
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
            className="px-4 py-2 rounded-full border shadow-xl flex-row items-center gap-2"
          >
            <Check color={theme.primary} size={14} strokeWidth={2.5} />
            <Text style={{ color: theme.text }} className="text-[13px] font-semibold">
              {toastMessage}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
