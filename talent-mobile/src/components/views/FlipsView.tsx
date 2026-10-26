import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, useWindowDimensions, FlatList, Platform, Modal, TextInput, KeyboardAvoidingView, Share as RNShare, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Search, Volume2, VolumeX, X, ArrowUpRight, Plus, Bookmark, MessageCircle, Share2, MoreHorizontal, Play, Send, User, Flag, Check } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { useKeptStore } from '../../store/keptStore';
import { useFeed } from '../../hooks/useFeed';
import { resolveMediaUrl } from '../../utils/api';
import { AppVideoPlayer } from '../ui/AppVideoPlayer';

function ApplaudIcon({ color = "#ffffff", size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2v2.5" />
      <Path d="M6.5 4.5l1.8 1.8" />
      <Path d="M17.5 4.5l-1.8 1.8" />
      <Path d="M18 12.5V10a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1.5" />
      <Path d="M14 11V8.5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3" />
      <Path d="M10 11V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5.5" />
      <Path d="M18 10a2 2 0 0 1 4 0v4a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3-3a2 2 0 0 1 2.83-2.83L8 15.5" />
    </Svg>
  );
}

const DEFAULT_FLIPS: any[] = [
  {
    id: 'spencer-x',
    name: 'Spencer X',
    title: 'Be Somebody · beatbox performance · passage 1',
    role: 'Beatbox · Sample performance',
    category: 'Beatbox',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    authorId: 'spencer-x',
    applaudCount: 42,
    comments: [
      { id: '1', author: 'Alex Rivera', text: 'Insane vocal percussion control!' },
      { id: '2', author: 'Elena Rostova', text: 'The rhythmic transitions are unreal.' }
    ]
  },
  {
    id: 'kiara-nair',
    name: 'Kiara Nair',
    title: 'Contemporary Flow in Rain',
    role: 'Dance · Contemporary routine',
    category: 'Dance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    authorId: 'kiara-nair',
    applaudCount: 38,
    comments: [
      { id: '1', author: 'Maya Lin', text: 'Stunning choreography and grace!' }
    ]
  },
  {
    id: 'rohan-sen',
    name: 'Rohan Sen',
    title: 'Midnight Fingerstyle Groove',
    role: 'Acoustic Guitar · Solo passage',
    category: 'Music',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    backupVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    authorId: 'rohan-sen',
    applaudCount: 51,
    comments: []
  }
];

export const FLIPS_DATA = DEFAULT_FLIPS;

function FlipSlideItem({
  item,
  isActive,
  isMuted,
  setIsMuted,
  height,
  width,
}: {
  item: any;
  isActive: boolean;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  height: number;
  width: number;
}) {
  const { theme } = useThemeStore();
  const router = useRouter();
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<any>(null);

  // Keep state
  const isKept = useKeptStore(state => Boolean(state.keptRecord[String(item.id)]));
  const toggleKeep = useKeptStore(state => state.toggleKeep);

  // Applaud state
  const [applauds, setApplauds] = useState(item.applaudCount || 24);
  const [isApplauded, setIsApplauded] = useState(false);
  const [applaudBurst, setApplaudBurst] = useState(false);

  // Share state
  const [isCopiedToast, setIsCopiedToast] = useState(false);

  // Modal states
  const [isBackTalentOpen, setIsBackTalentOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [backedToast, setBackedToast] = useState(false);

  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(item.comments || []);

  const [showOptions, setShowOptions] = useState(false);

  const currentVideoSrc = resolveMediaUrl(videoError
    ? (item.backupVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
    : (item.videoUrl || item.url || ''));

  // Sync muted state
  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle active slide transitions
  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      if (isActive) {
        try {
          videoRef.current.currentTime = 0;
        } catch (e) {}
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = isMuted;
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
        try {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        } catch (e) {}
      }
    }
  }, [isActive, currentVideoSrc]);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleApplaud = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsApplauded(true);
    setApplauds((prev: number) => prev + 1);
    setApplaudBurst(true);
    setTimeout(() => setApplaudBurst(false), 1200);
  };

  const handleKeepToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleKeep({
      id: item.id,
      title: item.title,
      author: item.name,
      avatar: item.avatar,
      url: currentVideoSrc,
      category: item.category
    });
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://talent.app/flips/${item.id}`;
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(shareUrl);
        setIsCopiedToast(true);
        setTimeout(() => setIsCopiedToast(false), 2000);
      } else {
        await RNShare.share({
          message: `Check out ${item.name} performing "${item.title}" on Talent: ${shareUrl}`,
          url: shareUrl,
        });
      }
    } catch (e) {
      console.warn("Share failed:", e);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newComment = {
      id: Math.random().toString(),
      author: 'You',
      text: commentText.trim(),
    };
    setComments((prev: any[]) => [...prev, newComment]);
    setCommentText('');
  };

  return (
    <View 
      style={[
        { height, width },
        Platform.OS === 'web' && ({
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
        } as any)
      ]} 
      className="bg-black relative justify-between overflow-hidden"
    >
      {/* Top Header */}
      <View className="pt-12 px-5 flex-row items-center justify-between z-20">
        <View className="flex-row items-center">
          <Text className="font-bold text-[22px] tracking-tight text-white leading-none font-serif">talent</Text>
          <Text style={{ color: theme.primary }} className="font-bold text-[22px] leading-none ml-[1px] font-serif">.</Text>
          <Text className="text-white/40 text-[18px] mx-2 font-light leading-none">|</Text>
          <Text className="text-white text-[18px] font-normal tracking-wide">Flips</Text>
        </View>

        <View className="flex-row items-center gap-5">
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/search' as any)}>
            <Search color="#fff" size={21} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? (
              <VolumeX color="#fff" size={21} strokeWidth={2} />
            ) : (
              <Volume2 color={theme.primary} size={21} strokeWidth={2} />
            )}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/' as any)}>
            <X color="#fff" size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Video Area */}
      <View className="w-full justify-center items-center my-auto">
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={togglePlay}
          className="relative w-full aspect-[16/10] bg-black overflow-hidden"
        >
          <AppVideoPlayer
            src={currentVideoSrc}
            poster={item.avatar || ''}
            isPlaying={isActive && isPlaying}
            isMuted={isMuted}
            videoRef={videoRef}
            onTimeUpdate={(t) => setCurrentTime(t)}
            onLoadedMetadata={(d) => setDuration(d)}
            onError={() => {
              if (!videoError) setVideoError(true);
            }}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Smooth Vignette Overlay */}
          <View 
            pointerEvents="none" 
            className="absolute inset-0 z-[1]"
            style={Platform.OS === 'web' ? ({
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.02) 25%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.4) 100%)'
            } as any) : undefined}
          />

          {/* Center Play Button Overlay */}
          {!isPlaying && (
            <View pointerEvents="none" className="absolute inset-0 items-center justify-center z-10">
              <View className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/25 items-center justify-center shadow-2xl">
                <Play color="#fff" fill="#fff" size={26} className="ml-1" />
              </View>
            </View>
          )}

          {/* Floating Applaud Burst Overlay */}
          {applaudBurst && (
            <View pointerEvents="none" className="absolute inset-0 items-center justify-center z-20">
              <View style={{ backgroundColor: theme.primary }} className="px-4 py-2 rounded-full shadow-2xl flex-row items-center gap-1.5 animate-bounce">
                <ApplaudIcon color="#fff" size={20} />
                <Text className="text-white font-bold text-[13px] tracking-wide">+1 Applaud</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Information & Controls */}
      <View className="z-20">
        {/* Toast confirmation for Backing */}
        {backedToast && (
          <View className="mx-5 mb-2 py-2 px-4 rounded-xl bg-emerald-500/90 flex-row items-center gap-2 self-center">
            <Check color="#fff" size={16} strokeWidth={2.5} />
            <Text className="text-white font-bold text-[13px]">Backed {item.name} with ${selectedAmount}!</Text>
          </View>
        )}

        {/* Performer Details & Back Talent Row */}
        <View className="px-5 pt-2 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push(`/profile/${item.authorId || item.id}` as any)}
              className="w-12 h-12 rounded-full overflow-hidden border border-white/20 mr-3"
            >
              <Image source={{ uri: item.avatar }} className="w-full h-full" resizeMode="cover" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-white text-[18px] font-bold tracking-tight" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-white/60 text-[13px] mt-0.5" numberOfLines={1}>
                {item.role}
              </Text>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => router.push(`/profile/${item.authorId || item.id}` as any)}
                className="flex-row items-center gap-1 mt-1 self-start"
              >
                <Text className="text-white/80 text-[13px] font-medium">View portfolio</Text>
                <ArrowUpRight color="rgba(255,255,255,0.8)" size={14} />
              </TouchableOpacity>
            </View>
          </View>

          {/* + Back Talent Button */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsBackTalentOpen(true);
            }} 
            className="rounded-full border border-white/40 px-4 py-2 flex-row items-center gap-1.5 bg-black/40"
          >
            <Plus color="#fff" size={15} strokeWidth={2.2} />
            <Text className="text-white text-[13px] font-medium">Back talent</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions Row */}
        <View className="px-6 pt-5 pb-4 flex-row items-center justify-between">
          {/* Applaud */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleApplaud} 
            className="items-center gap-1 min-w-[46px]"
          >
            <ApplaudIcon color={isApplauded ? theme.primary : "#fff"} size={24} />
            <Text style={{ color: isApplauded ? theme.primary : '#fff' }} className="text-[11px] font-medium mt-1">
              Applaud
            </Text>
          </TouchableOpacity>

          {/* Keep */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleKeepToggle} 
            className="items-center gap-1 min-w-[46px]"
          >
            <Bookmark 
              color={isKept ? theme.primary : "#fff"} 
              fill={isKept ? theme.primary : "transparent"} 
              size={24} 
              strokeWidth={1.8} 
            />
            <Text style={{ color: isKept ? theme.primary : '#fff' }} className="text-[11px] font-medium mt-1">
              {isKept ? 'Kept' : 'Keep'}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsCommenting(true);
            }} 
            className="items-center gap-1 min-w-[46px]"
          >
            <MessageCircle color="#fff" size={24} strokeWidth={1.8} />
            <Text className="text-white text-[11px] font-medium mt-1">Comment</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleShare} 
            className="items-center gap-1 min-w-[46px]"
          >
            <Share2 color={isCopiedToast ? theme.primary : "#fff"} size={24} strokeWidth={1.8} />
            <Text style={{ color: isCopiedToast ? theme.primary : '#fff' }} className="text-[11px] font-medium mt-1">
              {isCopiedToast ? 'Copied' : 'Share'}
            </Text>
          </TouchableOpacity>

          {/* Options */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowOptions(true);
            }} 
            className="items-center justify-center min-w-[36px]"
          >
            <MoreHorizontal color="#fff" size={24} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* Bottom Scrubber Progress Bar */}
        <View className="h-[3px] w-full bg-white/20 overflow-hidden">
          <View 
            style={{
              height: '100%',
              backgroundColor: theme.primary,
              width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`
            }} 
          />
        </View>
      </View>

      {/* Back Talent Support Modal */}
      <Modal visible={isBackTalentOpen} transparent animationType="slide">
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setIsBackTalentOpen(false)} 
          className="flex-1 bg-black/75 justify-end"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            className="bg-[#121214] border-t border-white/10 rounded-t-3xl pt-5 pb-8 px-6"
          >
            <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />
            
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full" />
                <View>
                  <Text className="text-white font-bold text-[17px]">Back {item.name}</Text>
                  <Text className="text-white/60 text-[12px]">Direct artist support</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsBackTalentOpen(false)} className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                <X color="#fff" size={16} />
              </TouchableOpacity>
            </View>

            <Text className="text-white/70 text-[13px] leading-relaxed mb-5">
              Contribute directly to fuel upcoming performances, stage equipment, and creative productions.
            </Text>

            {/* Amount Tiers */}
            <View className="flex-row items-center justify-between gap-2.5 mb-5">
              {[5, 10, 25, 50].map((amt) => {
                const isSelected = selectedAmount === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedAmount(amt);
                    }}
                    style={isSelected ? { backgroundColor: theme.primary, borderColor: theme.primary } : { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
                    className="flex-1 py-3 rounded-xl items-center justify-center border"
                  >
                    <Text className="text-white font-bold text-[15px]">${amt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsBackTalentOpen(false);
                setBackedToast(true);
                setTimeout(() => setBackedToast(false), 3000);
              }}
              style={{ backgroundColor: theme.primary }}
              className="w-full py-3.5 rounded-full items-center justify-center shadow-lg"
            >
              <Text className="text-white font-bold text-[15px]">Back with ${selectedAmount}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Comment Sheet Modal */}
      <Modal visible={isCommenting} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          className="flex-1"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsCommenting(false)} 
            className="flex-1 bg-black/75 justify-end"
          >
            <TouchableOpacity 
              activeOpacity={1} 
              className="bg-[#121214] border-t border-white/10 rounded-t-3xl pt-5 pb-6 px-5 max-h-[70%]"
            >
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-4" />
              
              <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-3">
                <Text className="text-white font-bold text-[16px]">Comments ({comments.length})</Text>
                <TouchableOpacity onPress={() => setIsCommenting(false)} className="w-7 h-7 rounded-full bg-white/10 items-center justify-center">
                  <X color="#fff" size={14} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments}
                keyExtractor={(c, idx) => c.id || String(idx)}
                renderItem={({ item: c }) => (
                  <View className="py-2.5 border-b border-white/5">
                    <Text className="text-white font-semibold text-[13px]">{c.author || 'Fan'}</Text>
                    <Text className="text-white/80 text-[13px] mt-0.5">{c.text}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text className="text-white/50 text-[13px] text-center py-6">Be the first to comment on this flip!</Text>
                }
                className="mb-3"
              />

              <View className="flex-row items-center gap-2 pt-2 border-t border-white/10">
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment..."
                  placeholderTextColor="#666"
                  className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-white text-[13px]"
                />
                <TouchableOpacity 
                  onPress={handleAddComment} 
                  disabled={!commentText.trim()}
                  style={{ backgroundColor: commentText.trim() ? theme.primary : 'rgba(255,255,255,0.1)' }}
                  className="w-9 h-9 rounded-full items-center justify-center"
                >
                  <Send color="#fff" size={15} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Options Menu Sheet */}
      {showOptions && (
        <Modal visible={true} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} onPress={() => setShowOptions(false)} className="flex-1 bg-black/75 justify-end">
            <View className="bg-[#121214] border-t border-white/10 rounded-t-2xl pb-8 pt-4 px-5">
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />
              <TouchableOpacity 
                onPress={() => {
                  setShowOptions(false);
                  router.push(`/profile/${item.authorId || item.id}` as any);
                }}
                className="flex-row items-center gap-3 py-3.5 border-b border-white/10"
              >
                <User color="#fff" size={18} />
                <Text className="text-white font-medium text-[15px]">View performer profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setShowOptions(false);
                  handleShare();
                }}
                className="flex-row items-center gap-3 py-3.5 border-b border-white/10"
              >
                <Share2 color="#fff" size={18} />
                <Text className="text-white font-medium text-[15px]">Share this flip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setShowOptions(false);
                  Alert.alert('Reported', 'Thank you for keeping our community safe. Our team will review this performance.');
                }}
                className="flex-row items-center gap-3 py-3.5"
              >
                <Flag color="#EF4444" size={18} />
                <Text className="text-[#EF4444] font-medium text-[15px]">Report</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export function FlipsView() {
  const { height, width } = useWindowDimensions();
  const { videos: feedVideos } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const flipsData = useMemo(() => {
    if (!feedVideos || feedVideos.length === 0) return DEFAULT_FLIPS;
    const mappedFeed = feedVideos.map((v, i) => ({
      id: String(v.id || `feed-${i}`),
      name: typeof v.author === 'object' ? (v.author?.name || v.author?.username || 'Performer') : (v.author || v.authorName || 'Performer'),
      title: v.title || 'Live Performance Take',
      role: `${v.category || 'Artist'} · ${(v.role || 'Sample performance').split('•')[0].trim()}`,
      category: v.category || 'Performance',
      avatar: v.avatar || v.authorAvatar || (typeof v.author === 'object' ? v.author?.avatarUrl : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(typeof v.author === 'object' ? (v.author?.name || 'Artist') : (v.author || 'Artist'))}&background=E91E76&color=fff`,
      videoUrl: v.url || v.videoUrl,
      backupVideoUrl: v.backupVideoUrl,
      authorId: v.authorId || v.author?.id || v.id,
      applaudCount: v.applauds || 24,
      comments: v.comments || []
    }));

    // Ensure Spencer X is always prominent as the lead performance
    const hasSpencer = mappedFeed.some(f => f.name.toLowerCase().includes('spencer'));
    return hasSpencer ? mappedFeed : [DEFAULT_FLIPS[0], ...mappedFeed];
  }, [feedVideos]);

  const flipsDataRef = useRef(flipsData);
  flipsDataRef.current = flipsData;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent?.contentOffset?.y ?? 0;
    if (height > 0) {
      const calculatedIndex = Math.round(offsetY / height);
      const clampedIndex = Math.max(0, Math.min(flipsData.length - 1, calculatedIndex));
      setActiveIndex(prev => (prev !== clampedIndex ? clampedIndex : prev));
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: height,
    offset: height * index,
    index,
  });

  // 1-flip-at-a-time transition on Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let isThrottled = false;
    const scrollNode = (flatListRef.current as any)?.getScrollableNode?.() || (flatListRef.current as any);

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return;
      e.preventDefault();

      if (isThrottled) return;
      isThrottled = true;

      const current = activeIndexRef.current;
      const target = e.deltaY > 0
        ? Math.min(flipsDataRef.current.length - 1, current + 1)
        : Math.max(0, current - 1);

      if (target !== current) {
        flatListRef.current?.scrollToIndex({ index: target, animated: true });
        setActiveIndex(target);
      }

      setTimeout(() => {
        isThrottled = false;
      }, 400);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (isThrottled) return;
        isThrottled = true;
        const current = activeIndexRef.current;
        const target = Math.min(flipsDataRef.current.length - 1, current + 1);
        if (target !== current) {
          flatListRef.current?.scrollToIndex({ index: target, animated: true });
          setActiveIndex(target);
        }
        setTimeout(() => {
          isThrottled = false;
        }, 300);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (isThrottled) return;
        isThrottled = true;
        const current = activeIndexRef.current;
        const target = Math.max(0, current - 1);
        if (target !== current) {
          flatListRef.current?.scrollToIndex({ index: target, animated: true });
          setActiveIndex(target);
        }
        setTimeout(() => {
          isThrottled = false;
        }, 300);
      }
    };

    if (scrollNode && scrollNode.addEventListener) {
      scrollNode.addEventListener('wheel', onWheel, { passive: false });
    }
    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (scrollNode && scrollNode.removeEventListener) {
        scrollNode.removeEventListener('wheel', onWheel);
      }
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [height]);

  const renderItem = ({ item, index }: { item: any, index: number }) => (
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
        ref={flatListRef}
        data={flipsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS !== 'web'}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 100);
        }}
        style={Platform.OS === 'web' ? ({ scrollSnapType: 'y mandatory' } as any) : undefined}
      />
    </View>
  );
}
