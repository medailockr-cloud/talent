import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, RefreshControl, Platform } from 'react-native';
import { Search, X, ChevronLeft, ChevronRight, User as UserIcon, Video as VideoIcon, MapPin, Star, Heart, Sparkles } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api, resolveMediaUrl } from '../utils/api';
import { useThemeStore } from '../store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

interface UserResult {
  id: number;
  username: string;
  name?: string;
  avatarUrl?: string;
  title?: string;
  location?: string;
  followersCount: number;
  videosCount: number;
}

interface VideoResult {
  id: number;
  title: string;
  description?: string;
  category?: string;
  subCategory?: string;
  authorId: number;
  author: string;
  authorUsername: string;
  authorAvatar?: string;
  authorTitle?: string;
  url: string;
  likesCount: number;
  commentsCount: number;
  averageRating?: string | null;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 28 : 20);
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'talent' | 'videos'>('all');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (params.q && typeof params.q === 'string' && params.q !== searchQuery) {
      setSearchQuery(params.q);
    }
  }, [params.q]);

  const categories = ['All', 'Music', 'Singing', 'Dance', 'Guitar', 'Beatbox', 'Comedy', 'Art'];

  const fetchResults = useCallback(async () => {
    try {
      let endpoint = '/discover?';
      if (searchQuery) endpoint += `q=${encodeURIComponent(searchQuery)}&`;
      if (category && category !== 'All') endpoint += `category=${encodeURIComponent(category)}`;
      const res = await api.get(endpoint);
      setUsers(res.data.users || []);
      setVideos(res.data.videos || []);
    } catch (error) {
      console.error('Discover search error:', error);
    }
  }, [searchQuery, category]);

  useEffect(() => {
    setIsLoading(true);
    // Debounce search
    const timer = setTimeout(() => {
      fetchResults().finally(() => setIsLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchResults]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchResults();
    setIsRefreshing(false);
  };

  const totalResults = users.length + videos.length;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <View 
        style={{ borderBottomColor: theme.border, paddingTop: topInset + 6 }}
        className="px-4 pb-3 border-b flex-row items-center gap-3"
      >
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={{ backgroundColor: theme.surfaceBg }}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View 
          style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
          className="flex-1 flex-row items-center rounded-full px-4 h-11 border"
        >
          <Search color={theme.textSecondary} size={18} />
          <TextInput 
            style={{ color: theme.text }}
            className="flex-1 ml-3 font-medium text-[15px]"
            placeholder="Search talent, skills, tags (#dance)..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
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
      </View>

      {/* Category Pills */}
      <View className="py-2.5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {categories.map(cat => {
            const isSelected = (!category && cat === 'All') || category === cat;
            return (
              <TouchableOpacity 
                key={cat} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategory(cat === 'All' ? '' : cat);
                }} 
                style={isSelected ? { borderColor: theme.primary, backgroundColor: theme.primary + '20' } : { borderColor: theme.border, backgroundColor: theme.surfaceBg }}
                className="px-4 py-1.5 rounded-full border"
              >
                <Text 
                  style={{ color: isSelected ? theme.primary : theme.textSecondary }}
                  className="font-bold text-[13px]"
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Result Type Tabs */}
      <View 
        style={{ borderBottomColor: theme.border }} 
        className="flex-row px-4 border-b pb-2 gap-4"
      >
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('all');
          }}
          className="pb-1 border-b-2"
          style={{ borderBottomColor: activeTab === 'all' ? theme.primary : 'transparent' }}
        >
          <Text 
            style={{ color: activeTab === 'all' ? theme.text : theme.textSecondary }} 
            className="text-[13px] font-bold"
          >
            All ({totalResults})
          </Text>
        </TouchableOpacity>

        {users.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('talent');
            }}
            className="pb-1 border-b-2"
            style={{ borderBottomColor: activeTab === 'talent' ? theme.primary : 'transparent' }}
          >
            <Text 
              style={{ color: activeTab === 'talent' ? theme.text : theme.textSecondary }} 
              className="text-[13px] font-bold"
            >
              Talent ({users.length})
            </Text>
          </TouchableOpacity>
        )}

        {videos.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('videos');
            }}
            className="pb-1 border-b-2"
            style={{ borderBottomColor: activeTab === 'videos' ? theme.primary : 'transparent' }}
          >
            <Text 
              style={{ color: activeTab === 'videos' ? theme.text : theme.textSecondary }} 
              className="text-[13px] font-bold"
            >
              Performances ({videos.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Body */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-3"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
              progressBackgroundColor={theme.cardBg}
            />
          }
        >
          {totalResults === 0 ? (
            <View className="items-center justify-center mt-16 px-6">
              <View 
                style={{ backgroundColor: theme.surfaceBg }} 
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
              >
                <Search color={theme.textSecondary} size={28} />
              </View>
              <Text style={{ color: theme.text }} className="text-[17px] font-bold text-center">
                No matches found
              </Text>
              <Text style={{ color: theme.textSecondary }} className="text-[13px] text-center mt-1.5 leading-5">
                {searchQuery 
                  ? `We couldn't find any talent or videos matching "${searchQuery}". Try searching a different keyword or category.` 
                  : 'Start typing to discover artists, choreographers, singers, and performances.'}
              </Text>
            </View>
          ) : (
            <>
              {/* TALENT PROFILES SECTION */}
              {(activeTab === 'all' || activeTab === 'talent') && users.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-3">
                    <UserIcon color={theme.primary} size={16} />
                    <Text style={{ color: theme.textSecondary }} className="text-[12px] font-bold uppercase tracking-wider">
                      Talent ({users.length})
                    </Text>
                  </View>

                  {users.map((user) => (
                    <TouchableOpacity 
                      key={`user-${user.id}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(`/profile/${user.id}` as any);
                      }}
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                      className="flex-row items-center gap-3.5 mb-2.5 p-3 rounded-2xl border"
                    >
                      <Image 
                        source={{ uri: resolveMediaUrl(user.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || 'User')}&background=E91E76&color=fff` }} 
                        className="w-12 h-12 rounded-full" 
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text style={{ color: theme.text }} className="text-[15px] font-bold">
                            {user.name || user.username}
                          </Text>
                          <Text style={{ color: theme.textSecondary }} className="text-[12px]">
                            @{user.username}
                          </Text>
                        </View>
                        {user.title && (
                          <Text style={{ color: theme.primary }} className="text-[12px] font-semibold mt-0.5" numberOfLines={1}>
                            {user.title}
                          </Text>
                        )}
                        <View className="flex-row items-center gap-3 mt-1">
                          {user.location && (
                            <View className="flex-row items-center gap-1">
                              <MapPin color={theme.textSecondary} size={11} />
                              <Text style={{ color: theme.textSecondary }} className="text-[11px]">
                                {user.location}
                              </Text>
                            </View>
                          )}
                          <Text style={{ color: theme.textSecondary }} className="text-[11px]">
                            {user.followersCount} {user.followersCount === 1 ? 'follower' : 'followers'}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight color={theme.textSecondary} size={16} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* PERFORMANCES SECTION */}
              {(activeTab === 'all' || activeTab === 'videos') && videos.length > 0 && (
                <View className="mb-8">
                  <View className="flex-row items-center gap-2 mb-3">
                    <VideoIcon color={theme.primary} size={16} />
                    <Text style={{ color: theme.textSecondary }} className="text-[12px] font-bold uppercase tracking-wider">
                      Performances ({videos.length})
                    </Text>
                  </View>

                  {videos.map((video) => (
                    <TouchableOpacity 
                      key={`video-${video.id}`}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(`/profile/${video.authorId}` as any);
                      }}
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                      className="flex-row items-center gap-3.5 mb-2.5 p-3 rounded-2xl border"
                    >
                      <Image 
                        source={{ uri: resolveMediaUrl(video.authorAvatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.author || 'Artist')}&background=E91E76&color=fff` }} 
                        className="w-12 h-12 rounded-full" 
                      />
                      <View className="flex-1">
                        <Text style={{ color: theme.text }} className="text-[14px] font-bold" numberOfLines={1}>
                          {video.title}
                        </Text>
                        <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5">
                          by <Text style={{ color: theme.text, fontWeight: '600' }}>{video.author}</Text>
                        </Text>
                        <View className="flex-row items-center gap-3 mt-1.5">
                          {video.category && (
                            <View 
                              style={{ backgroundColor: theme.primary + '18' }} 
                              className="px-2 py-0.5 rounded-full"
                            >
                              <Text style={{ color: theme.primary }} className="text-[10px] font-bold">
                                {video.category}{video.subCategory ? ` • ${video.subCategory}` : ''}
                              </Text>
                            </View>
                          )}
                          {video.averageRating && (
                            <View className="flex-row items-center gap-1">
                              <Star color="#EAB308" size={11} fill="#EAB308" />
                              <Text style={{ color: theme.text }} className="text-[11px] font-bold">
                                {video.averageRating}
                              </Text>
                            </View>
                          )}
                          <View className="flex-row items-center gap-1">
                            <Heart color={theme.textSecondary} size={11} />
                            <Text style={{ color: theme.textSecondary }} className="text-[11px]">
                              {video.likesCount}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <ChevronRight color={theme.textSecondary} size={16} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
