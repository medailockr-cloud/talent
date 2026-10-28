import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Share as RNShare,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import {
  Volume2,
  VolumeX,
  X,
  ArrowUpRight,
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  User,
  Flag,
  Check,
  Plus,
  Search,
  Share2,
  SkipForward,
  Sparkles,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { useKeptStore } from '../../store/keptStore';
import { useFeed } from '../../hooks/useFeed';
import { api, resolveMediaUrl } from '../../utils/api';
import { AppVideoPlayer } from '../ui/AppVideoPlayer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FLIPS_DATA: any[] = [];

function ApplauseMark({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 26 26"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path
        fill={filled ? color : 'none'}
        fillOpacity={filled ? 0.22 : 0}
        d="m9 20-4-5c-1-1.4 1-3 2-1.8l1.8 1.6-3.6-6c-.9-1.6 1.3-2.8 2.2-1.2l3 4.5-2.8-6c-.7-1.7 1.6-2.6 2.3-1l3 5.7-1.8-5.5c-.5-1.7 1.9-2.4 2.4-.8l2.5 6.7c.7-1 2-1.3 2.5-.3l1.7 4c1.8 4.3-1.6 8.5-5.4 8.5-2.3 0-4.1-1.5-5.8-3.4Z"
      />
      <Path d="m19 3 1-1m1 5 2-1m-1 5h2" />
    </Svg>
  );
}

function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface FlipItem {
  id: string;
  name: string;
  title: string;
  role: string;
  category: string;
  tags: string[];
  avatar: string;
  videoUrl: string;
  backupVideoUrl: string;
  authorId: string;
  applaudCount: number;
  talentScore: number;
  isVerified: boolean;
  comments: Array<{ id: string; author: string; text: string }>;
}

function FlipSlideItem({
  item,
  isActive,
  isMuted,
  setIsMuted,
  height,
  width,
  onSkipNext,
}: {
  item: FlipItem;
  isActive: boolean;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  height: number;
  width: number;
  onSkipNext?: () => void;
}) {
  const { theme } = useThemeStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);
  const leftInset = Math.max(insets.left, 16);
  const rightInset = Math.max(insets.right, 16);

  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<any>(null);

  const isKept = useKeptStore((state) => Boolean(state.keptRecord[String(item.id)]));
  const toggleKeep = useKeptStore((state) => state.toggleKeep);

  const [applauds, setApplauds] = useState(item.applaudCount || 0);
  const [isApplauded, setIsApplauded] = useState(false);
  const [applaudBurst, setApplaudBurst] = useState(false);

  const [isBackTalentOpen, setIsBackTalentOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [backedToast, setBackedToast] = useState(false);

  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(item.comments || []);

  const [showOptions, setShowOptions] = useState(false);
  const [isCopiedToast, setIsCopiedToast] = useState(false);

  const currentVideoSrc = resolveMediaUrl(
    videoError ? item.backupVideoUrl || '' : item.videoUrl || ''
  );

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      if (isActive) {
        try {
          videoRef.current.currentTime = 0;
        } catch {}
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
        } catch {}
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
      setIsPlaying((prev) => !prev);
    }
  };

  const handleApplaud = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsApplauded(true);
    setApplauds((prev) => prev + 1);
    setApplaudBurst(true);
    setTimeout(() => setApplaudBurst(false), 1200);

    try {
      await api.post(`/videos/${item.id}/applaud`);
    } catch {}
  };

  const handleKeepToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleKeep({
      id: item.id,
      title: item.title,
      author: item.name,
      avatar: item.avatar,
      url: currentVideoSrc,
      category: item.category,
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
    } catch {}
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: 'You',
      text: commentText.trim(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  return (
    <View
      style={[
        { height, width },
        Platform.OS === 'web' &&
          ({
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
          } as any),
      ]}
      className="bg-black relative justify-between overflow-hidden"
    >
      {/* Background Video Player */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePlay}
        className="absolute inset-0 z-0 bg-black"
      >
        {currentVideoSrc ? (
          <AppVideoPlayer
            src={currentVideoSrc}
            poster={item.avatar || undefined}
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
        ) : (
          <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-zinc-500 text-[13px]">Performance preview unavailable</Text>
          </View>
        )}

        {/* Cinematic Vignette Gradients */}
        <View
          pointerEvents="none"
          className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90"
        />
        <View
          pointerEvents="none"
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent opacity-75"
        />

        {/* Center Pause Indicator */}
        {!isPlaying && (
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center z-10">
            <View className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/25 items-center justify-center shadow-2xl">
              <Play color="#fff" fill="#fff" size={26} className="ml-1" />
            </View>
          </View>
        )}

        {/* Applaud Burst Overlay */}
        {applaudBurst && (
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center z-20">
            <View
              style={{ backgroundColor: theme.primary }}
              className="px-4 py-2 rounded-full shadow-2xl flex-row items-center gap-1.5"
            >
              <Sparkles color="#fff" size={18} />
              <Text className="text-white font-bold text-[13px] tracking-wide">+1 Applaud</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Top Header */}
      <View
        style={{
          top: topInset + 6,
          left: leftInset,
          right: rightInset,
        }}
        className="absolute flex-row items-center justify-between z-20"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)')}
            className="flex-row items-baseline"
          >
            <Text
              style={{
                fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                fontWeight: '800',
                fontSize: 28,
                letterSpacing: -1.6,
                color: '#ffffff',
                lineHeight: 30,
              }}
            >
              talent
            </Text>
            <Text
              style={{
                color: theme.primary,
                fontWeight: '800',
                fontSize: 28,
                marginLeft: 0.5,
                lineHeight: 30,
              }}
            >
              .
            </Text>
          </TouchableOpacity>
          <View className="h-4 w-[1px] bg-white/45 mx-3" />
          <Text className="text-white font-normal text-[15px]">Flips</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            onPress={() => router.push('/search' as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Search color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsMuted(!isMuted);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            {isMuted ? <VolumeX color="#fff" size={20} /> : <Volume2 color={theme.primary} size={20} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <X color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Performer Identity Overlaid on Video */}
      <View
        style={{
          bottom: bottomInset + 80,
          left: leftInset,
          right: rightInset,
        }}
        className="absolute z-20 flex-row items-end justify-between"
      >
        <View className="flex-row items-center gap-3 flex-1 mr-3">
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} className="w-11 h-11 rounded-full border border-white/60" />
          ) : (
            <View
              style={{ backgroundColor: theme.primary }}
              className="w-11 h-11 rounded-full items-center justify-center border border-white/60"
            >
              <Text className="text-white font-bold text-[15px]">{getInitials(item.name)}</Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text
                className="text-white text-[19px] font-bold tracking-tight"
                style={{
                  textShadowColor: 'rgba(0,0,0,0.9)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {item.isVerified && <CheckCircle2 color="#34D399" size={17} fill="#059669" />}
            </View>
            <Text
              className="text-[#D1D5DB] text-[12px] mt-0.5"
              style={{
                textShadowColor: 'rgba(0,0,0,0.9)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
              numberOfLines={1}
            >
              {item.category} · Sample performance
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/profile/${item.authorId || item.id}` as any)}
              className="flex-row items-center gap-1 mt-1"
            >
              <Text className="text-white font-semibold text-[12px]">View portfolio</Text>
              <ArrowUpRight color="#fff" size={13} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsBackTalentOpen(true);
          }}
          style={
            backedToast
              ? { borderColor: theme.primary, backgroundColor: `${theme.primary}25` }
              : { borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(0,0,0,0.4)' }
          }
          className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border"
        >
          {backedToast ? <Check color={theme.primary} size={15} /> : <Plus color="#fff" size={15} />}
          <Text
            style={{ color: backedToast ? theme.primary : '#fff' }}
            className="font-semibold text-[12px]"
          >
            {backedToast ? 'Backing' : 'Back talent'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Bottom Actions Bar */}
      <View
        style={{
          bottom: bottomInset + 12,
          left: leftInset,
          right: rightInset,
        }}
        className="absolute z-20 flex-row items-center justify-between"
      >
        {/* Applaud */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleApplaud}
          className="items-center justify-center min-w-[50px] gap-1"
        >
          <ApplauseMark filled={isApplauded} color={isApplauded ? theme.primary : '#fff'} />
          <Text
            style={{ color: isApplauded ? theme.primary : '#e5e5e5' }}
            className="text-[11px] font-medium"
          >
            {isApplauded ? 'Applauded' : 'Applaud'}
          </Text>
        </TouchableOpacity>

        {/* Keep */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleKeepToggle}
          className="items-center justify-center min-w-[50px] gap-1"
        >
          <Bookmark
            color={isKept ? theme.primary : '#fff'}
            fill={isKept ? theme.primary : 'transparent'}
            size={22}
          />
          <Text
            style={{ color: isKept ? theme.primary : '#e5e5e5' }}
            className="text-[11px] font-medium"
          >
            {isKept ? 'Kept' : 'Keep'}
          </Text>
        </TouchableOpacity>

        {/* Talk */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsCommenting(true);
          }}
          className="items-center justify-center min-w-[50px] gap-1"
        >
          <MessageCircle color="#fff" size={22} />
          <Text className="text-white/90 text-[11px] font-medium">Talk</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleShare}
          className="items-center justify-center min-w-[50px] gap-1"
        >
          <Share2 color={isCopiedToast ? theme.primary : '#fff'} size={21} />
          <Text
            style={{ color: isCopiedToast ? theme.primary : '#e5e5e5' }}
            className="text-[11px] font-medium"
          >
            {isCopiedToast ? 'Copied' : 'Share'}
          </Text>
        </TouchableOpacity>

        {/* More */}
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          onPress={() => setShowOptions(true)}
          className="items-center justify-center min-w-[40px] pt-1"
        >
          <MoreHorizontal color="#fff" size={22} />
        </TouchableOpacity>
      </View>

      {/* Bottom Scrubber Progress Bar */}
      <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-30">
        <View
          style={{
            height: '100%',
            backgroundColor: theme.primary,
            width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`,
          }}
        />
      </View>

      {/* Toast Notification */}
      {backedToast && (
        <View className="absolute top-24 self-center z-40 py-2 px-4 rounded-xl bg-emerald-500/90 flex-row items-center gap-2">
          <Check color="#fff" size={16} strokeWidth={2.5} />
          <Text className="text-white font-bold text-[13px]">
            Backed {item.name} with ${selectedAmount}
          </Text>
        </View>
      )}

      {/* Back Talent Support Modal */}
      <Modal visible={isBackTalentOpen} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsBackTalentOpen(false)}
          className="flex-1 bg-black/75 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 12 }}
            className="bg-[#121214] border-t border-white/10 rounded-t-3xl pt-5 px-6"
          >
            <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full" />
                ) : (
                  <View
                    style={{ backgroundColor: theme.primary }}
                    className="w-10 h-10 rounded-full items-center justify-center border border-white/20"
                  >
                    <Text className="text-white font-bold text-[14px]">
                      {getInitials(item.name)}
                    </Text>
                  </View>
                )}
                <View>
                  <Text className="text-white font-bold text-[17px]">Back {item.name}</Text>
                  <Text className="text-white/60 text-[12px]">Direct artist support</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsBackTalentOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
              >
                <X color="#fff" size={16} />
              </TouchableOpacity>
            </View>

            <Text className="text-white/70 text-[13px] leading-relaxed mb-5">
              Contribute directly to fuel upcoming performances, stage equipment, and creative
              productions.
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
                    style={
                      isSelected
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : {
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            borderColor: 'rgba(255,255,255,0.15)',
                          }
                    }
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
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 12 }}
              className="bg-[#121214] border-t border-white/10 rounded-t-3xl pt-5 px-5 max-h-[70%]"
            >
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-4" />

              <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-3">
                <Text className="text-white font-bold text-[16px]">
                  Comments ({comments.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setIsCommenting(false)}
                  className="w-7 h-7 rounded-full bg-white/10 items-center justify-center"
                >
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
                  <Text className="text-white/50 text-[13px] text-center py-6">
                    Be the first to comment on this performance.
                  </Text>
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
                  style={{
                    backgroundColor: commentText.trim() ? theme.primary : 'rgba(255,255,255,0.1)',
                  }}
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
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowOptions(false)}
            className="flex-1 bg-black/75 justify-end"
          >
            <View
              style={{ paddingBottom: Math.max(insets.bottom, 24) + 12 }}
              className="bg-[#121214] border-t border-white/10 rounded-t-2xl pt-4 px-5"
            >
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
                <Send color="#fff" size={18} />
                <Text className="text-white font-medium text-[15px]">Share this flip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false);
                  Alert.alert(
                    'Reported',
                    'Thank you for keeping our community safe. Our team will review this performance.'
                  );
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
  const router = useRouter();
  const { videos: feedVideos, isLoading } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const flipsData: FlipItem[] = useMemo(() => {
    if (!feedVideos || feedVideos.length === 0) return [];
    return feedVideos.map((v, i) => ({
      id: String(v.id || `feed-${i}`),
      name:
        typeof v.author === 'object'
          ? v.author?.name || v.author?.username || 'Performer'
          : v.author || v.authorName || 'Performer',
      title: v.title || 'Live Performance Take',
      role: `${v.category || 'Artist'} · ${(v.role || 'Live performance').split('•')[0].trim()}`,
      category: v.category || 'Performance',
      tags: v.tags || [v.category || 'Performance', 'Audition Reel'],
      avatar:
        v.avatar ||
        v.authorAvatar ||
        (typeof v.author === 'object' ? v.author?.avatarUrl : null) ||
        '',
      videoUrl: v.url || v.videoUrl || '',
      backupVideoUrl: v.backupVideoUrl || '',
      authorId: v.authorId || v.author?.id || v.id,
      applaudCount: v.applauds || v.applaudCount || 0,
      talentScore: v.userRating ?? v.avgRating ?? v.rating ?? 9.2,
      isVerified: Boolean(v.isVerified ?? v.author?.isVerified ?? true),
      comments: v.comments || [],
    }));
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
      setActiveIndex((prev) => (prev !== clampedIndex ? clampedIndex : prev));
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: height,
    offset: height * index,
    index,
  });

  // Strict 1-flip-at-a-time transition on Web (Wheel + Arrow Keys)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let isThrottled = false;
    const scrollNode =
      (flatListRef.current as any)?.getScrollableNode?.() || (flatListRef.current as any);

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return;
      e.preventDefault();

      if (isThrottled) return;
      isThrottled = true;

      const current = activeIndexRef.current;
      const target =
        e.deltaY > 0
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

  const handleSkipNext = useCallback(() => {
    const current = activeIndexRef.current;
    const target = Math.min(flipsDataRef.current.length - 1, current + 1);
    if (target !== current) {
      flatListRef.current?.scrollToIndex({ index: target, animated: true });
      setActiveIndex(target);
    }
  }, []);

  const renderItem = ({ item, index }: { item: FlipItem; index: number }) => (
    <FlipSlideItem
      item={item}
      isActive={index === activeIndex}
      isMuted={isMuted}
      setIsMuted={setIsMuted}
      height={height}
      width={width}
      onSkipNext={handleSkipNext}
    />
  );

  if (isLoading && flipsData.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#E91E76" />
      </View>
    );
  }

  if (flipsData.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center mb-4">
          <Sparkles color="#E91E76" size={30} />
        </View>
        <Text className="text-white text-[18px] font-bold text-center">No Flips yet</Text>
        <Text className="text-zinc-500 text-[13px] text-center mt-1.5 max-w-[280px]">
          Short-form audition reels and live takes will appear here.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.8}
          className="mt-6 px-6 py-2.5 rounded-full bg-[#E91E76]"
        >
          <Text className="text-white font-bold text-[13px]">Explore Stage</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={flipsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
