import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../utils/api';
import { useThemeStore } from '../store/themeStore';
import * as Haptics from 'expo-haptics';

export default function DiscoverScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.q && typeof params.q === 'string' && params.q !== searchQuery) {
      setSearchQuery(params.q);
    }
  }, [params.q]);

  const categories = ['Singers', 'Guitarists', 'Dancers', 'Comedians', 'Bands'];

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        let endpoint = '/discover?';
        if (searchQuery) endpoint += `q=${encodeURIComponent(searchQuery)}&`;
        if (category) endpoint += `category=${encodeURIComponent(category)}`;
        const res = await api.get(endpoint);
        setResults(res.data.videos || []);
      } catch (error) {
        console.error('Discover error:', error);
      }
      setIsLoading(false);
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, category]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <View 
        style={{ borderBottomColor: theme.border }}
        className="px-4 pt-12 pb-4 border-b flex-row items-center gap-3"
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
            placeholder="Search talent, skills, tags..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <X color={theme.textSecondary} size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity 
            onPress={() => setCategory('')} 
            style={!category ? { borderColor: theme.primary, backgroundColor: theme.primary + '20' } : { borderColor: theme.border, backgroundColor: theme.surfaceBg }}
            className="px-5 py-2 rounded-full border"
          >
            <Text 
              style={{ color: !category ? theme.primary : theme.textSecondary }}
              className="font-bold text-[13px]"
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setCategory(cat)} 
              style={category === cat ? { borderColor: theme.primary, backgroundColor: theme.primary + '20' } : { borderColor: theme.border, backgroundColor: theme.surfaceBg }}
              className="px-5 py-2 rounded-full border"
            >
              <Text 
                style={{ color: category === cat ? theme.primary : theme.textSecondary }}
                className="font-bold text-[13px]"
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
          <Text style={{ color: theme.textSecondary }} className="text-[12px] font-bold uppercase tracking-wider mb-4">Results ({results.length})</Text>
          {results.length === 0 ? (
            <View className="items-center justify-center mt-10">
              <Text style={{ color: theme.textSecondary }} className="text-[15px]">No results found.</Text>
            </View>
          ) : (
            results.map((video) => (
              <TouchableOpacity 
                key={video.id}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const userId = video.authorId || video.author?.id || video.id;
                  if (userId) {
                     router.push(`/profile/${userId}` as any);
                  }
                }}
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                className="flex-row items-center gap-4 mb-4 p-3 rounded-2xl border"
              >
                <Image source={{ uri: video.authorAvatar || 'https://via.placeholder.com/150' }} className="w-12 h-12 rounded-full" />
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-[15px] font-bold">{video.author}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5">{video.title}</Text>
                </View>
                <ChevronRight color={theme.textSecondary} size={16} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
