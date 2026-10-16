import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  Users,
  X,
  Search,
  UserCheck,
  UserPlus,
  MapPin,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { api, resolveMediaUrl } from '../../utils/api';
import { useThemeStore } from '../../store/themeStore';

interface FollowersModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: number | string;
  initialTab?: 'followers' | 'following';
  onFollowChange?: () => void;
}

export function FollowersModal({
  visible,
  onClose,
  userId,
  initialTab = 'followers',
  onFollowChange,
}: FollowersModalProps) {
  const router = useRouter();
  const { theme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  useEffect(() => {
    if (!visible || !userId) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const endpoint = activeTab === 'followers'
          ? `/users/${userId}/followers`
          : `/users/${userId}/following`;

        const res = await api.get(endpoint);
        if (Array.isArray(res.data)) {
          setUsersList(res.data);
        } else {
          setUsersList([]);
        }
      } catch (err) {
        console.warn('Fetch followers error:', err);
        setUsersList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [visible, userId, activeTab]);

  const toggleFollow = async (targetUser: any) => {
    try {
      setActionInProgressId(targetUser.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const nextState = !targetUser.isFollowing;
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isFollowing: nextState } : u))
      );

      await api.post(`/users/${targetUser.id}/follow`);
      onFollowChange?.();
    } catch (err) {
      console.warn('Follow toggle error:', err);
      // Revert on error
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isFollowing: targetUser.isFollowing } : u))
      );
    } finally {
      setActionInProgressId(null);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.title?.toLowerCase().includes(query)
    );
  });

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View
          style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
          className="w-full h-[78%] rounded-t-3xl border-t flex-col shadow-2xl"
        >
          {/* Header */}
          <View
            style={{ borderBottomColor: theme.border }}
            className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b"
          >
            <View className="flex-row items-center gap-2">
              <Users color={theme.primary} size={20} />
              <Text style={{ color: theme.text }} className="text-[17px] font-bold">
                Connections
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: theme.surfaceBg }}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <X color={theme.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          {/* Segmented Tabs */}
          <View className="flex-row px-5 pt-3 pb-2 gap-3">
            {(['followers', 'following'] as const).map((tab) => {
              const isSelected = activeTab === tab;
              const title = tab === 'followers' ? 'Followers' : 'Following';
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab(tab);
                  }}
                  style={
                    isSelected
                      ? { backgroundColor: theme.primary, borderColor: theme.primary }
                      : { backgroundColor: theme.surfaceBg, borderColor: theme.border }
                  }
                  className="flex-1 py-2 rounded-full border items-center justify-center"
                >
                  <Text
                    style={{ color: isSelected ? '#fff' : theme.textSecondary }}
                    className="text-[13px] font-bold capitalize"
                  >
                    {title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search Bar */}
          <View className="px-5 py-2">
            <View
              style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
              className="flex-row items-center px-3.5 py-2 rounded-full border gap-2.5"
            >
              <Search color={theme.textSecondary} size={16} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search peers..."
                placeholderTextColor={theme.textSecondary}
                style={{ color: theme.text }}
                className="flex-1 text-[13px] p-0"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X color={theme.textSecondary} size={14} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* List */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={theme.primary} size="large" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-2">
              {filteredUsers.length === 0 ? (
                <View className="items-center justify-center py-16">
                  <Text style={{ color: theme.textSecondary }} className="text-[14px]">
                    No {activeTab} found.
                  </Text>
                </View>
              ) : (
                filteredUsers.map((item) => {
                  const avatarUri =
                    resolveMediaUrl(item.avatarUrl) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      item.name || item.username || 'Artist'
                    )}&background=208AEF&color=fff`;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        router.push(`/profile/${item.id}` as any);
                      }}
                      style={{ borderBottomColor: theme.border }}
                      className="flex-row items-center justify-between py-3.5 border-b"
                    >
                      <View className="flex-row items-center gap-3 flex-1 mr-3">
                        <View
                          style={{ borderColor: theme.border }}
                          className="w-12 h-12 rounded-full overflow-hidden border shadow-sm"
                        >
                          <Image source={{ uri: avatarUri }} className="w-full h-full" />
                        </View>
                        <View className="flex-1">
                          <Text
                            style={{ color: theme.text }}
                            className="text-[14px] font-bold"
                            numberOfLines={1}
                          >
                            {item.name || item.username}
                          </Text>
                          <Text
                            style={{ color: theme.textSecondary }}
                            className="text-[11px] mt-0.5"
                            numberOfLines={1}
                          >
                            @{item.username || 'talent'} {item.title ? `• ${item.title}` : ''}
                          </Text>
                          {item.location && (
                            <View className="flex-row items-center gap-1 mt-1">
                              <MapPin color={theme.textSecondary} size={10} />
                              <Text
                                style={{ color: theme.textSecondary }}
                                className="text-[10px]"
                              >
                                {item.location}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Follow Button */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={actionInProgressId === item.id}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          toggleFollow(item);
                        }}
                        style={
                          item.isFollowing
                            ? { backgroundColor: theme.surfaceBg, borderColor: theme.border }
                            : { backgroundColor: theme.primary, borderColor: theme.primary }
                        }
                        className="px-3.5 py-1.5 rounded-full border flex-row items-center gap-1.5 shadow-sm"
                      >
                        {item.isFollowing ? (
                          <>
                            <UserCheck color={theme.text} size={13} />
                            <Text
                              style={{ color: theme.text }}
                              className="text-[11px] font-semibold"
                            >
                              Following
                            </Text>
                          </>
                        ) : (
                          <>
                            <UserPlus color="#fff" size={13} />
                            <Text className="text-white text-[11px] font-bold">Follow</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
              <View className="h-10" />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
