import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ticket, MapPin, Calendar } from 'lucide-react-native';

export function ShowsView() {
  return (
    <View className="flex-1 bg-[#050608]">
      <ScrollView className="flex-1 pt-12" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-10 h-10 rounded-xl bg-[#E91E76]/20 items-center justify-center border border-[#E91E76]/40">
              <Ticket color="#E91E76" size={20} />
            </View>
            <Text className="text-white text-[32px] font-bold">Shows</Text>
          </View>
          <Text className="text-[#9CA3AF] text-[14px]">Live events. Real talent. Bigger stages.</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-6" contentContainerStyle={{ paddingRight: 40, gap: 10 }}>
          {['All Shows', 'Live', 'Competitions', 'Auditions'].map((tab, idx) => (
            <TouchableOpacity activeOpacity={0.7} 
              key={tab} 
              className={`h-[38px] px-5 rounded-full flex-row items-center justify-center border ${idx === 0 ? 'bg-[#E91E76]/10 border-[#E91E76]' : 'bg-[#171922] border-white/10'}`}
            >
              {tab === 'Live' && <View className="w-2 h-2 rounded-full bg-[#E91E76] mr-2" />}
              <Text className={`font-medium ${idx === 0 ? 'text-white' : 'text-[#9CA3AF]'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Card */}
        <View className="px-5">
          <View className="w-full bg-[#100C09] rounded-[24px] overflow-hidden border border-white/10 pb-5">
            <View className="w-full h-[200px] bg-[#1A1512] relative">
              <Image source={{ uri: 'https://picsum.photos/seed/shows/400/200' }} className="w-full h-full opacity-50" />
              <View className="absolute top-4 left-4 bg-[#E91E76] px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                <Text className="text-white text-[11px] font-bold tracking-widest">★ FEATURED</Text>
              </View>
            </View>
            
            <View className="px-5 -mt-16 relative z-10">
              <Text className="text-white text-[32px] font-bold leading-tight mb-2">Live at{'\n'}The Next Stage</Text>
              <Text className="text-white/80 text-[14px] mb-4">Discovered through <Text className="font-bold">talent<Text className="text-[#E91E76]">.</Text></Text></Text>
              
              <View className="flex-row items-center gap-4 mb-5">
                <View className="flex-row items-center gap-1.5">
                  <MapPin color="#E91E76" size={14} />
                  <Text className="text-white text-[13px]">Bengaluru</Text>
                </View>
                <View className="w-[1px] h-3 bg-white/20" />
                <View className="flex-row items-center gap-1.5">
                  <Calendar color="#E91E76" size={14} />
                  <Text className="text-white text-[13px]">24 Oct</Text>
                </View>
                <View className="w-[1px] h-3 bg-white/20" />
                <View className="flex-row items-center gap-1.5">
                  <Ticket color="#E91E76" size={14} />
                  <Text className="text-white text-[13px]">Ticketed</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity activeOpacity={0.7} className="flex-1 bg-[#E91E76] h-[48px] rounded-[24px] items-center justify-center flex-row gap-2">
                  <Text className="text-white font-bold">View Show</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} className="flex-1 bg-transparent border border-white/20 h-[48px] rounded-[24px] items-center justify-center flex-row gap-2">
                  <Ticket color="#fff" size={16} />
                  <Text className="text-white font-bold">Get Tickets</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
