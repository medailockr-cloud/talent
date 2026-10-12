import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, useWindowDimensions, FlatList, Platform } from 'react-native';
import { Bookmark, Sparkles, Send, MoreHorizontal, CheckCircle2, ChevronUp, Volume2, VolumeX } from 'lucide-react-native';

const BASE_FLIPS_DATA = [
  { 
    id: '1', 
    name: 'Aarav Menon', 
    role: 'Acoustic Indie • Bengaluru', 
    videoUrl: 'http://localhost:3000/uploads/performer_1.mp4',
    backupVideoUrl: 'http://localhost:3000/uploads/performer_2.mp4',
    image: 'https://images.unsplash.com/photo-1516280440503-6c8c4a93883a?w=800&q=80', 
    tags: ['Original Music', 'Acoustic', 'Live Vocals'], 
    talentScore: 92,
    isVerified: true
  },
  { 
    id: '2', 
    name: 'Maya Sen', 
    role: 'Classical Violin • Mumbai', 
    videoUrl: 'http://localhost:3000/uploads/performer_2.mp4',
    backupVideoUrl: 'http://localhost:3000/uploads/performer_3.mp4',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&q=80', 
    tags: ['Classical', 'Instrumental', 'Symphony'], 
    talentScore: 88,
    isVerified: false
  },
  { 
    id: '3', 
    name: 'The Groove Crew', 
    role: 'Street Dance • Kochi', 
    videoUrl: 'http://localhost:3000/uploads/performer_3.mp4',
    backupVideoUrl: 'http://localhost:3000/uploads/performer_4.mp4',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&q=80', 
    tags: ['Hip Hop', 'Freestyle', 'Crew'], 
    talentScore: 96,
    isVerified: true
  },
  {
    id: '4',
    name: 'Kiara Nair',
    role: 'Contemporary Stage • Delhi',
    videoUrl: 'http://localhost:3000/uploads/performer_4.mp4',
    backupVideoUrl: 'http://localhost:3000/uploads/performer_5.mp4',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80',
    tags: ['Contemporary', 'Spotlight', 'Original Choreography'],
    talentScore: 95,
    isVerified: true
  },
  {
    id: '5',
    name: 'Kabir Shah',
    role: 'Studio Vocals & Beatbox • Mumbai',
    videoUrl: 'http://localhost:3000/uploads/performer_5.mp4',
    backupVideoUrl: 'http://localhost:3000/uploads/performer_1.mp4',
    image: 'https://images.unsplash.com/photo-1516280440502-a2fc9977823b?w=800&q=80',
    tags: ['Beatbox', 'Studio Take', 'Vocal Percussion'],
    talentScore: 91,
    isVerified: false
  }
];

// Export alias for backward compatibility with external imports or Hot-Reload cache
export const FLIPS_DATA = BASE_FLIPS_DATA;

function FlipSlideItem({
  item,
  isActive,
  isMuted,
  setIsMuted,
  height,
  width,
}: {
  item: typeof BASE_FLIPS_DATA[0];
  isActive: boolean;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  height: number;
  width: number;
}) {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<any>(null);
  const currentVideoSrc = videoError
    ? (item.backupVideoUrl || 'http://localhost:3000/uploads/performer_1.mp4')
    : (item.videoUrl || 'http://localhost:3000/uploads/performer_1.mp4');

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isMuted;
      if (isActive) {
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive, isMuted, currentVideoSrc]);

  return (
    <View style={{ height: height, width: width }} className="bg-black relative">
      {/* Main Background Media */}
      {Platform.OS === 'web' ? (
        <video 
          ref={videoRef}
          key={`${item.id}-${currentVideoSrc}`}
          src={currentVideoSrc}
          autoPlay 
          loop 
          muted={isMuted} 
          playsInline 
          poster={item.image}
          onError={() => {
            if (!videoError) setVideoError(true);
          }}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: 0.85
          }} 
        />
      ) : (
        <Image 
          source={{ uri: item.image }} 
          className="w-full h-full absolute inset-0 opacity-80"
          style={{ resizeMode: 'cover' }}
        />
      )}
        
      {/* Core UI Gradients for Cinematic Feel */}
      <View className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
      <View className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />

      {/* Top Minimalist Header */}
      <View className="absolute top-14 w-full flex-row justify-between items-center px-6 z-20">
        <View className="flex-row items-baseline opacity-80">
          <Text className="font-bold text-[22px] tracking-tight text-white leading-none font-serif">talent</Text>
          <Text className="font-bold text-[22px] text-[#E91E76] leading-none ml-[1px] font-serif">.</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => setIsMuted(!isMuted)}
            className="bg-white/10 w-8 h-8 rounded-full border border-white/20 items-center justify-center backdrop-blur-md"
          >
            {isMuted ? (
              <VolumeX color="#fff" size={14} />
            ) : (
              <Volume2 color="#E91E76" size={14} />
            )}
          </TouchableOpacity>
          <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
            <Text className="text-white font-bold tracking-[0.2em] text-[10px]">FLIPS</Text>
          </View>
        </View>
      </View>

      {/* The New "Glass Pill" Interactive Sidebar */}
      <View className="absolute right-4 bottom-32 items-center z-20 gap-4 bg-white/5 py-4 px-2.5 rounded-[30px] border border-white/10 backdrop-blur-xl">
        <TouchableOpacity className="items-center gap-1 mb-2">
          <View className="w-10 h-10 rounded-full bg-[#E91E76]/20 border border-[#E91E76]/50 items-center justify-center">
            <Sparkles color="#E91E76" size={20} fill="#E91E76" />
          </View>
          <Text className="text-white font-bold text-[10px]">{item.talentScore}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center gap-1 mb-2">
          <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10">
            <ChevronUp color="#fff" size={24} strokeWidth={3} />
          </View>
          <Text className="text-white/70 font-bold text-[9px]">HYPE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center gap-1 mb-2">
          <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10">
            <Bookmark color="#fff" size={20} />
          </View>
          <Text className="text-white/70 font-bold text-[9px]">KEEP</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center gap-1 mb-2">
          <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10">
            <Send color="#fff" size={18} />
          </View>
          <Text className="text-white/70 font-bold text-[9px]">SHARE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mt-2">
          <MoreHorizontal color="#fff" size={16} />
        </TouchableOpacity>
      </View>

      {/* Cinematic Identity Card at Bottom Left */}
      <View className="absolute bottom-28 left-5 right-24 z-20">
        {/* Tags */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {item.tags.map((tag, i) => (
            <View key={i} className="px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <Text className="text-white font-medium text-[11px] tracking-wide">{tag}</Text>
            </View>
          ))}
        </View>

        {/* Name & Title */}
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-white text-[38px] font-serif font-bold tracking-tight shadow-black shadow-lg leading-tight">
            {item.name}
          </Text>
          {item.isVerified && (
            <CheckCircle2 color="#34D399" size={24} fill="#059669" className="mt-1" />
          )}
        </View>
        
        <Text className="text-[#9CA3AF] text-[15px] font-medium tracking-wide mb-5 shadow-black shadow-sm">
          {item.role}
        </Text>

        {/* New Call to Action - "View Portfolio" replacing standard captions */}
        <TouchableOpacity className="self-start flex-row items-center gap-2 bg-white px-5 py-3 rounded-full shadow-xl">
          <Text className="text-black font-bold text-[14px]">View Full Portfolio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function FlipsView() {
  const { height, width } = useWindowDimensions();
  const [flipsData, setFlipsData] = useState(() => BASE_FLIPS_DATA);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Infinite / Unlimited Scrolling Handler
  const handleEndReached = () => {
    setFlipsData(prev => [
      ...prev,
      ...BASE_FLIPS_DATA.map((item, idx) => ({
        ...item,
        id: `${item.id}-${prev.length + idx}`
      }))
    ]);
  };
  
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: typeof BASE_FLIPS_DATA[0], index: number }) => (
    <FlipSlideItem
      item={item}
      isActive={index === activeIndex}
      isMuted={isMuted}
      setIsMuted={setIsMuted}
      height={height}
      width={width}
    />
  );

  return (
    <View className="flex-1 bg-black">
      <FlatList 
        data={flipsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        initialNumToRender={3}
        windowSize={5}
        removeClippedSubviews={true}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
