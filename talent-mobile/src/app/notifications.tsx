import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  ChevronLeft,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  CheckCheck,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { api, resolveMediaUrl } from '../utils/api';
import { useThemeStore } from '../store/themeStore';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (Array.isArray(res.data?.notifications)) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.warn('Notifications fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await api.put('/notifications/read', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationPress = async (notif: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!notif.isRead) {
      try {
        await api.put('/notifications/read', { notificationId: notif.id });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.warn('Mark read error:', err);
      }
    }

    if (notif.actor?.id) {
      router.push(`/profile/${notif.actor.id}` as any);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart color={theme.primary} fill={theme.primary} size={13} />;
      case 'COMMENT':
        return <MessageCircle color="#3B82F6" fill="#3B82F6" size={13} />;
      case 'FOLLOW':
        return <UserPlus color="#10B981" size={13} strokeWidth={2.5} />;
      case 'RATING':
        return <Star color="#F59E0B" fill="#F59E0B" size={13} />;
      default:
        return <Bell color={theme.primary} size={13} />;
    }
  };

  const formatNotificationText = (notif: any) => {
    if (notif.content) return notif.content;
    const actorName = notif.actor?.name || notif.actor?.username || 'An artist';
    const videoTitle = notif.video?.title ? `"${notif.video.title}"` : 'your performance';

    switch (notif.type) {
      case 'LIKE':
        return `${actorName} saved ${videoTitle} to their Kept vault.`;
      case 'COMMENT':
        return `${actorName} left feedback on ${videoTitle}.`;
      case 'FOLLOW':
        return `${actorName} started following your audition journey.`;
      case 'RATING':
        return `${actorName} scored ${videoTitle} with a top judge rating!`;
      default:
        return `${actorName} interacted with your profile.`;
    }
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <View
        style={{ borderBottomColor: theme.border, backgroundColor: theme.bg }}
        className="px-5 pt-12 pb-4 border-b flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            style={{ backgroundColor: theme.surfaceBg }}
            className="w-10 h-10 items-center justify-center rounded-full mr-3 shadow-sm"
          >
            <ChevronLeft color={theme.text} size={22} />
          </TouchableOpacity>
          <Text style={{ color: theme.text }} className="text-[20px] font-bold">
            Activity
          </Text>
        </View>

        {hasUnread && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMarkAllRead}
            disabled={isMarkingAll}
            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
          >
            <CheckCheck color={theme.primary} size={14} />
            <Text style={{ color: theme.text }} className="text-[11px] font-bold">
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {notifications.length === 0 ? (
            <View className="items-center justify-center mt-24 px-6">
              <View
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="w-16 h-16 rounded-full items-center justify-center mb-4 border"
              >
                <Bell color={theme.textSecondary} size={28} />
              </View>
              <Text style={{ color: theme.text }} className="text-[17px] font-bold mb-1.5">
                No activity yet
              </Text>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-[13px] text-center max-w-[260px] leading-5"
              >
                When judges rate your takes or peers collaborate, notifications will appear here.
              </Text>
            </View>
          ) : (
            notifications.map((notif) => {
              const avatarUri =
                resolveMediaUrl(notif.actor?.avatarUrl) ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  notif.actor?.name || notif.actor?.username || 'Artist'
                )}&background=E50914&color=fff`;

              return (
                <TouchableOpacity
                  key={notif.id}
                  activeOpacity={0.75}
                  onPress={() => handleNotificationPress(notif)}
                  style={{
                    borderBottomColor: theme.border,
                    backgroundColor: !notif.isRead ? theme.primary + '12' : 'transparent',
                  }}
                  className="flex-row items-center gap-3.5 px-5 py-4 border-b"
                >
                  {/* Avatar + Badge */}
                  <View className="relative">
                    <View
                      style={{ borderColor: theme.border }}
                      className="w-12 h-12 rounded-full overflow-hidden border shadow-sm"
                    >
                      <Image source={{ uri: avatarUri }} className="w-full h-full" />
                    </View>
                    <View
                      style={{ backgroundColor: theme.surfaceBg, borderColor: theme.bg }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 shadow-sm"
                    >
                      {getIcon(notif.type)}
                    </View>
                  </View>

                  {/* Body Text */}
                  <View className="flex-1">
                    <Text
                      style={{ color: theme.text }}
                      className={`text-[13px] leading-5 ${!notif.isRead ? 'font-semibold' : 'font-normal'}`}
                    >
                      {formatNotificationText(notif)}
                    </Text>
                    <Text
                      style={{ color: theme.textSecondary }}
                      className="text-[11px] mt-1 font-medium"
                    >
                      {formatTimeAgo(notif.createdAt)}
                    </Text>
                  </View>

                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <View
                      style={{ backgroundColor: theme.primary }}
                      className="w-2 h-2 rounded-full mr-1 shadow-sm"
                    />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
