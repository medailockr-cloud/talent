import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  Trophy,
  X,
  Medal,
  Star,
  Flame,
  ChevronRight,
  Eye,
  Heart,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { api } from '../../utils/api';
import { useThemeStore } from '../../store/themeStore';

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ visible, onClose }: LeaderboardModalProps) {
  const router = useRouter();
  const { theme } = useThemeStore();

  const [category, setCategory] = useState('All');
  const [performers, setPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Singing', 'Dance', 'Comedy', 'Guitar', 'Beatbox'];

  useEffect(() => {
    if (!visible) return;
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leaderboard', {
          params: { category: category !== 'All' ? category : undefined },
        });
        if (Array.isArray(res.data)) {
          setPerformers(res.data);
        }
      } catch (err) {
        console.warn('Leaderboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [visible, category]);

  const top3 = performers.slice(0, 3);
  const remaining = performers.slice(3);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/85 justify-end">
        <View
          style={{ backgroundColor: theme.bg, borderTopColor: theme.border }}
          className="h-[88%] rounded-t-3xl border-t overflow-hidden"
        >
          {/* Header */}
          <View
            style={{ borderBottomColor: theme.border }}
            className="flex-row items-center justify-between p-4 border-b"
          >
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-[#EAB308]/20 items-center justify-center border border-[#EAB308]/40">
                <Trophy color="#EAB308" size={17} />
              </View>
              <View>
                <Text style={{ color: theme.text }} className="text-[17px] font-bold">
                  Weekly Top Talent
                </Text>
                <Text style={{ color: theme.textSecondary }} className="text-[11px]">
                  Ranked by community blind score & engagement
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
              style={{ backgroundColor: theme.surfaceBg }}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <X color={theme.text} size={18} />
            </TouchableOpacity>
          </View>

          {/* Category Pills */}
          <View className="py-3 px-4 border-b" style={{ borderBottomColor: theme.border }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategory(cat);
                    }}
                    style={{
                      backgroundColor: isSelected ? theme.primary : theme.surfaceBg,
                      borderColor: isSelected ? theme.primary : theme.border,
                    }}
                    className="px-4 py-1.5 rounded-full border"
                  >
                    <Text
                      style={{ color: isSelected ? '#ffffff' : theme.textSecondary }}
                      className="text-[12px] font-bold"
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={theme.primary} size="large" />
              <Text style={{ color: theme.textSecondary }} className="text-[13px] mt-3">
                Calculating leaderboards...
              </Text>
            </View>
          ) : (
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 50 }}>
              {performers.length === 0 ? (
                <View className="items-center justify-center py-20">
                  <Trophy color={theme.textSecondary} size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <Text style={{ color: theme.textSecondary }} className="text-[14px]">No leaderboard rankings yet.</Text>
                </View>
              ) : (
                <>
                  {/* TOP 3 PODIUM */}
              {top3.length > 0 && (
                <View className="flex-row items-end justify-center gap-2 mb-8 pt-4">
                  {/* 2nd Place */}
                  {top3[1] && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        router.push(`/profile/${top3[1].performer?.id}` as any);
                      }}
                      className="items-center flex-1"
                    >
                      <View className="relative mb-2">
                        <Image
                          source={{
                            uri:
                              top3[1].performer?.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[1].performer?.name || top3[1].performer?.username || 'User')}&background=94A3B8&color=000`,
                          }}
                          className="w-16 h-16 rounded-full border-2 border-[#94A3B8]"
                        />
                        <View className="absolute -bottom-1.5 self-center bg-[#94A3B8] px-2 py-0.5 rounded-full">
                          <Text className="text-black font-bold text-[10px]">#2</Text>
                        </View>
                      </View>
                      <Text style={{ color: theme.text }} className="font-bold text-[13px] text-center" numberOfLines={1}>
                        {top3[1].performer?.name || top3[1].performer?.username}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Star color="#EAB308" size={11} fill="#EAB308" />
                        <Text style={{ color: theme.primary }} className="font-bold text-[11px]">
                          {top3[1].averageRating || '8.8'}
                        </Text>
                      </View>
                      <View className="w-full h-20 bg-slate-400/20 rounded-t-xl mt-2 items-center justify-center border-t border-slate-400/30">
                        <Medal color="#94A3B8" size={24} />
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* 1st Place (Crown) */}
                  {top3[0] && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        router.push(`/profile/${top3[0].performer?.id}` as any);
                      }}
                      className="items-center flex-1 -mt-4"
                    >
                      <View className="relative mb-2">
                        <View className="absolute -top-5 self-center">
                          <Text className="text-[20px]">👑</Text>
                        </View>
                        <Image
                          source={{
                            uri:
                              top3[0].performer?.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[0].performer?.name || top3[0].performer?.username || 'User')}&background=EAB308&color=000`,
                          }}
                          className="w-20 h-20 rounded-full border-2 border-[#EAB308] shadow-lg"
                        />
                        <View className="absolute -bottom-1.5 self-center bg-[#EAB308] px-2.5 py-0.5 rounded-full">
                          <Text className="text-black font-black text-[11px]">#1</Text>
                        </View>
                      </View>
                      <Text style={{ color: theme.text }} className="font-black text-[14px] text-center" numberOfLines={1}>
                        {top3[0].performer?.name || top3[0].performer?.username}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Flame color="#EF4444" size={12} fill="#EF4444" />
                        <Text style={{ color: theme.primary }} className="font-bold text-[12px]">
                          {top3[0].averageRating || '9.6'} Score
                        </Text>
                      </View>
                      <View className="w-full h-28 bg-[#EAB308]/20 rounded-t-xl mt-2 items-center justify-center border-t border-[#EAB308]/40">
                        <Trophy color="#EAB308" size={32} />
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        router.push(`/profile/${top3[2].performer?.id}` as any);
                      }}
                      className="items-center flex-1"
                    >
                      <View className="relative mb-2">
                        <Image
                          source={{
                            uri:
                              top3[2].performer?.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[2].performer?.name || top3[2].performer?.username || 'User')}&background=CD7F32&color=fff`,
                          }}
                          className="w-16 h-16 rounded-full border-2 border-[#CD7F32]"
                        />
                        <View className="absolute -bottom-1.5 self-center bg-[#CD7F32] px-2 py-0.5 rounded-full">
                          <Text className="text-white font-bold text-[10px]">#3</Text>
                        </View>
                      </View>
                      <Text style={{ color: theme.text }} className="font-bold text-[13px] text-center" numberOfLines={1}>
                        {top3[2].performer?.name || top3[2].performer?.username}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Star color="#EAB308" size={11} fill="#EAB308" />
                        <Text style={{ color: theme.primary }} className="font-bold text-[11px]">
                          {top3[2].averageRating || '8.4'}
                        </Text>
                      </View>
                      <View className="w-full h-16 bg-amber-900/20 rounded-t-xl mt-2 items-center justify-center border-t border-[#CD7F32]/30">
                        <Medal color="#CD7F32" size={22} />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* REMAINING RANKED LIST */}
              <View className="gap-2.5">
                {performers.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onClose();
                      router.push(`/profile/${item.performer?.id}` as any);
                    }}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                    className="p-3.5 rounded-2xl border flex-row items-center gap-3"
                  >
                    <Text
                      style={{ color: idx < 3 ? theme.primary : theme.textSecondary }}
                      className="font-bold text-[15px] w-6 text-center"
                    >
                      {idx + 1}
                    </Text>

                    <Image
                      source={{
                        uri:
                          item.performer?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            item.performer?.name || item.performer?.username || 'User'
                          )}&background=E91E76&color=fff`,
                      }}
                      className="w-11 h-11 rounded-full"
                    />

                    <View className="flex-1">
                      <Text style={{ color: theme.text }} className="font-bold text-[14px]" numberOfLines={1}>
                        {item.performer?.name || item.performer?.username}
                      </Text>
                      <Text style={{ color: theme.textSecondary }} className="text-[11px]" numberOfLines={1}>
                        {item.title} • {item.category}
                      </Text>
                    </View>

                    <View className="items-end mr-1">
                      <View className="flex-row items-center gap-1 bg-[#EAB308]/15 px-2 py-0.5 rounded-md">
                        <Star color="#EAB308" size={11} fill="#EAB308" />
                        <Text className="text-[#EAB308] font-bold text-[12px]">
                          {item.averageRating || '8.5'}
                        </Text>
                      </View>
                      <Text style={{ color: theme.textSecondary }} className="text-[10px] mt-0.5">
                        {item.views || 0} views
                      </Text>
                    </View>

                    <ChevronRight color={theme.textSecondary} size={15} />
                  </TouchableOpacity>
                ))}
              </View>
                </>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
