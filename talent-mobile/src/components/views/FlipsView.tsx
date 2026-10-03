import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MessageCircle, Bookmark, X } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export function FlipsView() {
  return (
    <View className="flex-1 bg-black">
      <View className="absolute inset-0">
        <Image source={{ uri: 'https://picsum.photos/seed/flip/400/800' }} className="w-full h-full opacity-70" />
      </View>
      
      {/* Header overlaid */}
      <View className="absolute top-12 left-0 right-0 flex-row justify-center items-center z-10">
        <View className="items-center border-b-[3px] border-[#E91E76] pb-1">
          <Text className="text-white font-bold tracking-[0.2em] text-[14px]">FLIPS</Text>
        </View>
      </View>

      {/* Info Section */}
      <View className="absolute bottom-[140px] left-4 right-24 z-10">
        <Text className="text-white text-[32px] font-bold mb-1 shadow-black shadow-md">Aarav Menon</Text>
        <Text className="text-white/90 text-[14px] mb-3 shadow-black shadow-sm">Acoustic Singer • Bengaluru</Text>
        
        <View className="flex-row gap-2">
          <View className="px-3 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md">
            <Text className="text-white text-[12px]">Original Music</Text>
          </View>
          <View className="px-3 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md">
            <Text className="text-white text-[12px]">Indie</Text>
          </View>
        </View>
      </View>

      {/* Action Sidebar */}
      <View className="absolute bottom-[140px] right-4 items-center gap-5 z-10">
        <TouchableOpacity className="items-center">
          <View className="w-[50px] h-[50px] rounded-full bg-black/40 border border-white/20 items-center justify-center mb-1 backdrop-blur-md">
            <Bookmark color="#fff" size={22} />
          </View>
          <Text className="text-white text-[10px] font-bold">KEEP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <View className="w-[50px] h-[50px] rounded-full bg-black/40 border border-white/20 items-center justify-center mb-1 backdrop-blur-md">
            <MessageCircle color="#fff" size={22} />
          </View>
          <Text className="text-white text-[10px] font-bold">TALK</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <View className="w-[50px] h-[50px] rounded-full bg-black/40 border border-white/20 items-center justify-center mb-1 backdrop-blur-md">
            <X color="#fff" size={22} />
          </View>
          <Text className="text-white text-[10px] font-bold">PASS</Text>
        </TouchableOpacity>
      </View>

      {/* Big JUDGE Button */}
      <View className="absolute bottom-24 left-0 right-0 items-center pointer-events-none z-10">
        <TouchableOpacity 
          activeOpacity={0.7}
          className="w-[85px] h-[85px] rounded-full bg-[#E91E76] items-center justify-center pointer-events-auto" 
          style={{ shadowColor: '#E91E76', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 15 }}
        >
          <Text className="text-white font-bold text-[24px] mb-1">✨</Text>
          <Text className="text-white font-bold text-[10px] tracking-wider">JUDGE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
