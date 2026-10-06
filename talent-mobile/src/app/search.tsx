import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { api } from '../utils/api';
import * as Haptics from 'expo-haptics';

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <View className="flex-1 bg-[#050608]">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-white/5 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-white/5 rounded-full">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-[#13151C] rounded-full px-4 h-11 border border-white/5">
          <Search color="#6B7280" size={18} />
          <TextInput 
            className="flex-1 ml-3 text-white font-medium text-[15px]"
            placeholder="Search talent, skills, tags..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <X color="#9CA3AF" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity 
            onPress={() => setCategory('')} 
            className={`px-5 py-2 rounded-full border ${!category ? 'border-[#E91E76] bg-[#E91E76]/20' : 'border-white/10 bg-[#13151C]'}`}
          >
            <Text className={`font-bold text-[13px] ${!category ? 'text-[#E91E76]' : 'text-white'}`}>All</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setCategory(cat)} 
              className={`px-5 py-2 rounded-full border ${category === cat ? 'border-[#E91E76] bg-[#E91E76]/20' : 'border-white/10 bg-[#13151C]'}`}
            >
              <Text className={`font-bold text-[13px] ${category === cat ? 'text-[#E91E76]' : 'text-white'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E91E76" size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4">
          <Text className="text-[#6B7280] text-[12px] font-bold uppercase tracking-wider mb-4">Results ({results.length})</Text>
          {results.length === 0 ? (
            <View className="items-center justify-center mt-10">
              <Text className="text-[#9CA3AF] text-[15px]">No results found.</Text>
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
                className="flex-row items-center gap-4 mb-4 bg-[#0A0C10] p-3 rounded-2xl border border-white/5"
              >
                <Image source={{ uri: video.authorAvatar || 'https://via.placeholder.com/150' }} className="w-12 h-12 rounded-full" />
                <View className="flex-1">
                  <Text className="text-white text-[15px] font-bold">{video.author}</Text>
                  <Text className="text-[#9CA3AF] text-[12px] mt-0.5">{video.title}</Text>
                </View>
                <ChevronRight color="#4B5563" size={16} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
