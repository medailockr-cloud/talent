import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  Alert,
  PanResponder,
  Share as RNShare,
  TextInput,
  Animated,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Settings,
  Share,
  MoreHorizontal,
  CheckCircle,
  Check,
  Eye,
  EyeOff,
  MapPin,
  Play,
  X,
  Shield,
  Bell,
  Key,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Film,
  Heart,
  Plus,
  ExternalLink,
  Star,
  Music,
  Gauge,
  Bookmark,
  MessageCircle,
  MessageCircleOff,
  Pause,
  Maximize2,
  Flag,
  UserX,
  Link,
  Users,
  BarChart2,
  Sparkles,
  Camera,
  Music2,
  Sun,
  Moon,
  Palette,
  Trash2,
  Pin,
  Edit3,
  Share2,
  Archive,
  Copy,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Switch } from "react-native";
import { api, resolveMediaUrl, BACKEND_URL } from "../../utils/api";
import { AppVideoPlayer } from "../ui/AppVideoPlayer";
import { getEffectiveFilterCss } from "../../constants/filters";
import { MediaFilterOverlay } from "../ui/MediaFilterOverlay";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore, THEMES, ThemeId, ORDERED_THEME_IDS } from "../../store/themeStore";
import { useKeptStore } from "../../store/keptStore";
import { FollowersModal } from "../ui/FollowersModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import io from "socket.io-client";

const coverImg = "";
const avatarImg = "https://ui-avatars.com/api/?name=User&background=E91E76&color=fff";



// Helper to detect image media
const isMediaImage = (url?: string) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|heic)(\?.*)?$/i.test(url);
};

const isCommentsAllowed = (val: any): boolean => {
  if (val === false || val === 'false' || val === 0 || val === '0' || val === 'off' || val === 'disabled') {
    return false;
  }
  return true;
};

const isJudgingAllowed = (val: any): boolean => {
  if (val === false || val === 'false' || val === 0 || val === '0' || val === 'off' || val === 'disabled') {
    return false;
  }
  return true;
};

function VideoPlayerModal({
  url,
  filter,
  filterIntensity,
  onClose,
}: {
  url: string;
  filter?: string | null;
  filterIntensity?: number | null;
  onClose: () => void;
}) {
  const videoRef = useRef<any>(null);
  const isImg = isMediaImage(resolveMediaUrl(url));
  const cssFilter = getEffectiveFilterCss(filter, filterIntensity);

  useEffect(() => {
    if (!isImg && Platform.OS === 'web' && videoRef.current) {
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => { });
          }
        });
      }
    }
  }, [url, isImg]);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black justify-center items-center relative">
        <TouchableOpacity
          style={{ position: "absolute", top: 50, right: 20, zIndex: 10 }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
          className="w-12 h-12 bg-black/50 rounded-full items-center justify-center border border-white/20"
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>

        {isImg ? (
          <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
            {Platform.OS === "web" ? (
              <img
                src={url}
                style={{ maxWidth: "95vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 16, filter: cssFilter !== "none" ? cssFilter : undefined }}
                alt="Uploaded Media"
              />
            ) : (
              <Image
                source={{ uri: resolveMediaUrl(url) }}
                className="w-full h-[80%] rounded-2xl"
                resizeMode="contain"
              />
            )}
            <MediaFilterOverlay filter={filter} filterIntensity={filterIntensity} />
          </View>
        ) : Platform.OS === "web" ? (
          <div style={{ position: "relative", width: "100%", maxHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <video
              ref={videoRef}
              src={resolveMediaUrl(url)}
              controls
              autoPlay
              playsInline
              style={{ width: "100%", maxHeight: "80vh", outline: "none", filter: cssFilter !== "none" ? cssFilter : undefined }}
            />
            <MediaFilterOverlay filter={filter} filterIntensity={filterIntensity} />
          </div>
        ) : (
          <View className="w-full h-[80%] justify-center items-center overflow-hidden rounded-2xl">
            <AppVideoPlayer
              src={resolveMediaUrl(url)}
              isPlaying={true}
              isMuted={false}
              filter={filter}
              filterIntensity={filterIntensity}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

function ShowPreviewModal({
  show,
  onClose,
  onBookingChange,
}: {
  show: any;
  onClose: () => void;
  onBookingChange?: (showId: any, isBooked: boolean) => void;
}) {
  const [isBooked, setIsBooked] = useState(show.isVisiting || show.isBooked || false);
  const [visitors, setVisitors] = useState(show.visiting || show.bookings?.length || 149);

  useEffect(() => {
    setIsBooked(show.isVisiting || show.isBooked || false);
    if (show.visiting !== undefined) {
      setVisitors(show.visiting);
    } else if (show.bookings?.length !== undefined) {
      setVisitors(show.bookings.length);
    }
  }, [show]);

  const handleRSVP = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await api.post(`/shows/${show.id}/book`);
      if (res.data.isBooked) {
        setIsBooked(true);
        setVisitors((prev: number) => prev + 1);
        onBookingChange?.(show.id, true);
        Alert.alert("RSVP Confirmed", "You are now visiting this show.");
      } else {
        setIsBooked(false);
        setVisitors((prev: number) => Math.max(0, prev - 1));
        onBookingChange?.(show.id, false);
        Alert.alert("RSVP Cancelled", "You are no longer visiting this show.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update RSVP.");
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="bg-[#12141A] w-full max-w-[420px] max-h-[85%] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20 }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-2">
                <View className="bg-[#E91E76] px-2 py-1 rounded-md">
                  <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                    Show Preview
                  </Text>
                </View>
                <Text
                  className="text-white font-bold text-[14px]"
                  numberOfLines={1}
                >
                  {show.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                }}
                className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
              >
                <X color="#fff" size={16} />
              </TouchableOpacity>
            </View>

            {/* Subtitle / Info */}
            <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-1">
              Secret Living Room Acoustic Session
            </Text>
            <Text className="text-white font-bold text-[22px] mb-3">
              {show.title}
            </Text>
            <View className="flex-row items-center gap-4 mb-6">
              <View className="flex-row items-center gap-1.5">
                <Calendar color="#9CA3AF" size={14} />
                <Text className="text-[#9CA3AF] text-[13px]">Nov 16, 2026</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76]" />
                <Text className="text-[#9CA3AF] text-[13px]">7:30 PM IST</Text>
              </View>
            </View>

            {/* Who's Visiting */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <User color="#E91E76" size={16} />
                  <Text className="text-white text-[13px] font-bold">
                    Who's Visiting ({visitors})
                  </Text>
                </View>
                <Text className="text-[#10b981] text-[10px] font-bold">
                  Verified Judges Attending
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2 mb-4">
                <View className="bg-white/10 px-3 py-1.5 rounded-full">
                  <Text className="text-[#D1D5DB] text-[12px]">Vikram Rao</Text>
                </View>
                <View className="bg-white/10 px-3 py-1.5 rounded-full">
                  <Text className="text-[#D1D5DB] text-[12px]">
                    Tara Devi (Judge)
                  </Text>
                </View>
                <View className="bg-white/10 px-3 py-1.5 rounded-full">
                  <Text className="text-[#D1D5DB] text-[12px]">
                    {visitors > 2 ? `${visitors - 2} others` : "Others"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleRSVP}
                activeOpacity={0.8}
                className={`w-full h-[44px] rounded-xl flex-row items-center justify-center gap-2 ${isBooked ? "bg-[#E91E76]" : "bg-white/10"}`}
              >
                {isBooked ? (
                  <CheckCircle color="#fff" size={16} />
                ) : (
                  <Calendar color="#fff" size={16} />
                )}
                <Text className="text-white font-bold text-[13px]">
                  {isBooked
                    ? "RSVP: You're Visiting!"
                    : "RSVP: I'm Visiting This Show"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Venue */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-3">
                Venue & Coordinates
              </Text>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-4">
                  <Text className="text-white font-bold text-[14px] leading-5 mb-1">
                    Secret Heritage Courtyard, 4th Block Koramangala
                  </Text>
                  <Text className="text-[#9CA3AF] text-[12px]">
                    {show.location}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const loc = encodeURIComponent(show.location || "Secret Heritage Courtyard, 4th Block Koramangala");
                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc}`).catch(err => {
                      console.error("Failed to open map:", err);
                    });
                  }}
                  className="bg-white/10 px-3 py-2 rounded-xl flex-row items-center gap-2"
                >
                  <MapPin color="#fff" size={14} />
                  <Text className="text-white text-[12px] font-bold">
                    Map & Directions
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-[#6B7280] text-[11px]">
                Age Limit: All Ages • Dress: Cozy / Acoustic Comfort
              </Text>
            </View>

            {/* Photos */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase">
                    Stage & Venue Photos (2)
                  </Text>
                </View>
                <Text className="text-[#6B7280] text-[10px]">
                  Tap to expand
                </Text>
              </View>
              <View className="flex-row gap-3">
              </View>
            </View>

            {/* Timeline */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-4">
                Show Itinerary Timeline
              </Text>
              <View className="gap-3">
                <View className="flex-row gap-4">
                  <Text className="text-[#E91E76] text-[12px] font-bold w-[60px]">
                    7:00 PM
                  </Text>
                  <Text className="text-[#D1D5DB] text-[12px] flex-1">
                    Secret location GPS pin revealed to passholders
                  </Text>
                </View>
                <View className="flex-row gap-4">
                  <Text className="text-[#E91E76] text-[12px] font-bold w-[60px]">
                    7:30 PM
                  </Text>
                  <Text className="text-[#D1D5DB] text-[12px] flex-1">
                    Doors open & Warm chai / coffee mixer
                  </Text>
                </View>
                <View className="flex-row gap-4">
                  <Text className="text-[#E91E76] text-[12px] font-bold w-[60px]">
                    8:00 PM
                  </Text>
                  <Text className="text-[#D1D5DB] text-[12px] flex-1">
                    {show?.title || "Artist Live Session"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Setlist */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-3">
                Expected Acoustic Setlist
              </Text>
              <View className="gap-2">
                {[
                  "Unplugged Raag Improvisation",
                  "Monsoon Motion",
                  "Falling Again",
                  "Audience Request Track",
                ].map((song, i) => (
                  <View key={i} className="flex-row items-center gap-3">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-[#D1D5DB] text-[13px]">{song}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Seating */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-2">
                Seating & Experience Preview
              </Text>
              <Text className="text-[#D1D5DB] text-[13px]">
                Intimate floor cushions & low armchairs (BYO Cushion)
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View className="p-4 bg-[#12141A] border-t border-white/5 flex-row gap-3 items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const title = encodeURIComponent(show.title || "Talent Live Show");
                const loc = encodeURIComponent(show.location || "Live Concert Venue");
                Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${loc}`).catch(() => {
                  Alert.alert("Calendar", "Added to calendar schedule.");
                });
              }}
              className="w-[48px] h-[48px] rounded-xl border border-white/20 items-center justify-center"
            >
              <Calendar color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await handleRSVP();
                onClose();
              }}
              activeOpacity={0.8}
              className="flex-1 bg-[#E91E76] h-[48px] rounded-full items-center justify-center"
            >
              <Text className="text-white font-bold text-[13px]">
                {isBooked ? "RESERVED ✓ (TAP TO CANCEL)" : "RESERVE PASSES (₹650 (RSVP PRIORITY))"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Profile Feed Video Card
function ProfileFeedVideoCard({
  video,
  playingVideoId,
  setPlayingVideoId,
  onPass,
  onMaximize,
  onTalk,
  onOptions,
}: {
  video: any;
  playingVideoId: string | null;
  setPlayingVideoId: (id: string | null) => void;
  onPass: () => void;
  onMaximize?: (url: string, filter?: string | null, filterIntensity?: number | null) => void;
  onTalk?: () => void;
  onOptions?: (video: any) => void;
}) {
  const isPlaying = String(playingVideoId) === String(video.id);
  const isKept = useKeptStore(state => Boolean(state.keptRecord[String(video.id)]));

  const [currentAllowJudging, setCurrentAllowJudging] = useState(isJudgingAllowed(video.allowJudging));
  const [currentAllowComments, setCurrentAllowComments] = useState(isCommentsAllowed(video.allowComments));

  useEffect(() => {
    setCurrentAllowJudging(isJudgingAllowed(video.allowJudging));
  }, [video.allowJudging]);

  useEffect(() => {
    setCurrentAllowComments(isCommentsAllowed(video.allowComments));
  }, [video.allowComments]);

  const [judgeScore, setJudgeScore] = useState<number | null>(video.userRating || null);
  const [isJudgingActive, setIsJudgingActive] = useState(false);
  const [tempScore, setTempScore] = useState<number>(video.userRating || 5.0);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const videoRef = useRef<any>(null);

  const judgeScoreRef = useRef<number | null>(video.userRating || null);
  const tempScoreRef = useRef<number>(video.userRating || 5.0);
  const isDraggingRef = useRef(false);
  const startScoreRef = useRef<number>(video.userRating || 5.0);

  useEffect(() => {
    judgeScoreRef.current = judgeScore;
  }, [judgeScore]);

  const saveScore = (score: number) => {
    if (!currentAllowJudging) return;
    const finalScore = parseFloat(Math.max(1.0, Math.min(10.0, score)).toFixed(1));
    setJudgeScore(finalScore);
    judgeScoreRef.current = finalScore;
    tempScoreRef.current = finalScore;
    setTempScore(finalScore);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    api.post(`/videos/${video.id}/rate`, { score: finalScore }).catch(err => console.error("Rate err:", err));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: () => {
        if (!currentAllowJudging) return;
        isDraggingRef.current = false;
        const initial = judgeScoreRef.current ?? 5.0;
        startScoreRef.current = initial;
        tempScoreRef.current = initial;
        setTempScore(initial);
        setIsJudgingActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > 6) {
          isDraggingRef.current = true;
        }
        const delta = -gestureState.dy / 15;
        let newScore = startScoreRef.current + delta;
        newScore = Math.max(1.0, Math.min(10.0, newScore));
        const rounded = parseFloat(newScore.toFixed(1));
        if (Math.floor(rounded) !== Math.floor(tempScoreRef.current))
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        tempScoreRef.current = rounded;
        setTempScore(rounded);
      },
      onPanResponderRelease: () => {
        setIsJudgingActive(false);
        if (isDraggingRef.current) {
          saveScore(tempScoreRef.current);
        } else {
          setShowJudgeModal(true);
        }
      },
      onPanResponderTerminate: () => {
        setIsJudgingActive(false);
      },
    }),
  ).current;

  return (
    <View className="mb-6">
      <View className="relative w-full aspect-[16/9.5] rounded-[16px] overflow-hidden border border-white/10 bg-[#100C09] mb-4">
        {isMediaImage(video.videoUrl) ? (
          Platform.OS === "web" ? (
            <img
              src={video.videoUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: getEffectiveFilterCss(video.filter, video.filterIntensity) }}
              alt="Performance"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-black">
              <Image
                source={{ uri: video.videoUrl }}
                className="w-full h-full opacity-90 absolute"
                resizeMode="cover"
              />
              <MediaFilterOverlay filter={video.filter} filterIntensity={video.filterIntensity} />
            </View>
          )
        ) : Platform.OS === "web" ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <video
              ref={videoRef}
              src={resolveMediaUrl(video.videoUrl)}
              autoPlay
              loop
              muted={!isPlaying}
              playsInline
              poster={resolveMediaUrl(video.videoThumb)}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: getEffectiveFilterCss(video.filter, video.filterIntensity) }}
            />
            <MediaFilterOverlay filter={video.filter} filterIntensity={video.filterIntensity} />
          </div>
        ) : (
          <View className="w-full h-full bg-black overflow-hidden">
            <AppVideoPlayer
              src={resolveMediaUrl(video.videoUrl)}
              poster={video.videoThumb}
              isPlaying={isPlaying}
              isMuted={!isPlaying}
              filter={video.filter}
              filterIntensity={video.filterIntensity}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        )}

        <View className="absolute inset-x-0 top-0 h-16 bg-black/40" />
        <View className="absolute inset-x-0 bottom-0 h-16 bg-black/40" />

        <View className="absolute top-4 left-4 flex-row items-center gap-2">
          <Text className="text-[11px] font-bold tracking-[0.1em] text-white uppercase">
            {isMediaImage(video.videoUrl) ? "PHOTO" : "PERFORMANCE"}
          </Text>
          <View className="w-1 h-1 rounded-full bg-white/60" />
          <Text className="text-white text-[11px] font-bold tracking-widest">
            {isMediaImage(video.videoUrl) ? "HD" : video.duration}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="absolute top-1/2 left-1/2 -ml-7 -mt-7 w-14 h-14 rounded-full bg-black/40 border border-white/80 items-center justify-center"
          onPress={() => {
            if (isMediaImage(video.videoUrl)) {
              if (onMaximize && video.videoUrl) onMaximize(video.videoUrl, video.filter, video.filterIntensity);
            } else {
              setPlayingVideoId(isPlaying ? null : video.id);
            }
          }}
        >
          {isMediaImage(video.videoUrl) ? (
            <Eye color="#fff" size={24} />
          ) : isPlaying ? (
            <Pause color="#fff" fill="#fff" size={24} />
          ) : (
            <Play color="#fff" fill="#fff" size={24} className="ml-1" />
          )}
        </TouchableOpacity>

        <View className="absolute bottom-3 right-3 flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onMaximize && video.videoUrl) {
                onMaximize(video.videoUrl, video.filter, video.filterIntensity);
              }
            }}
            className="w-8 h-8 rounded-lg bg-black/60 border border-white/20 items-center justify-center"
          >
            <Maximize2 color="#fff" size={14} strokeWidth={2} />
          </TouchableOpacity>
          <View className="h-8 px-3 rounded-lg bg-black/60 border border-white/20 items-center justify-center">
            <Text className="text-[12px] font-medium text-white tracking-wider">
              {video.duration} / {video.duration}
            </Text>
          </View>
        </View>

        {isJudgingActive && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center z-20">
            <Text
              className="text-white text-[72px] font-bold tracking-tighter"
              style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12 }}
            >
              {tempScore.toFixed(1)}
            </Text>
            <Text className="text-white/60 text-[12px] font-medium tracking-widest uppercase mt-4">
              Slide Up/Down to Adjust
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          {(() => {
            const authorName = typeof video.author === 'object' && video.author !== null
              ? (video.author.name || video.author.username || 'Artist')
              : (typeof video.author === 'string' && video.author ? video.author : 'Artist');
            const authorAvatar = video.avatar || video.authorAvatar || (typeof video.author === 'object' ? video.author?.avatarUrl : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=E91E76&color=fff`;
            return (
              <>
                <View className="w-[42px] h-[42px] rounded-full overflow-hidden border border-white/10">
                  <Image source={{ uri: authorAvatar }} className="w-full h-full" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-[16px] font-bold mb-0.5" numberOfLines={1}>
                    {authorName}
                  </Text>
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[#9CA3AF] text-[11px]">{video.role || 'Artist'}</Text>
                  </View>
                </View>
              </>
            );
          })()}
        </View>

        {onOptions && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onOptions(video);
            }}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
          >
            <MoreHorizontal color="#fff" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {video.title && (
        <View className="mb-3 px-1">
          <Text className="text-white text-[15px] font-semibold leading-snug">
            {video.title}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between px-1">
        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await useKeptStore.getState().toggleKeep(video);
            }}
            activeOpacity={0.7}
            className="items-center gap-1.5 min-w-[36px]"
          >
            <Bookmark
              color={isKept ? "#E91E76" : "#fff"}
              fill={isKept ? "#E91E76" : "transparent"}
              size={22}
              strokeWidth={1.5}
            />
            <Text
              className={`text-[9px] font-bold tracking-widest uppercase ${isKept ? "text-[#E91E76]" : "text-[#9CA3AF]"}`}
            >
              {isKept ? "KEPT ✓" : "KEEP"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!currentAllowComments}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onTalk) onTalk();
            }}
            activeOpacity={currentAllowComments ? 0.7 : 1}
            className="items-center gap-1.5 min-w-[36px]"
            style={{ opacity: currentAllowComments ? 1 : 0.5 }}
          >
            {currentAllowComments ? (
              <MessageCircle color="#fff" size={22} strokeWidth={1.5} />
            ) : (
              <MessageCircleOff color="#9CA3AF" size={22} strokeWidth={1.5} />
            )}
            <Text className="text-[#9CA3AF] text-[9px] font-bold tracking-widest uppercase">
              {currentAllowComments ? "TALK" : "DISABLED"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              api.post(`/videos/${video.id}/share`).catch(() => { });
              const shareUrl = typeof window !== 'undefined' && window.location
                ? `${window.location.origin}/video/${video.id}`
                : `https://talent.app/video/${video.id}`;
              if (Platform.OS === 'web') {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  await navigator.share({ title: video.title || 'Performance', url: shareUrl });
                } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  await navigator.clipboard.writeText(shareUrl);
                  Alert.alert("Copied", "Link copied to clipboard!");
                }
              } else {
                await RNShare.share({ message: `Watch "${video.title || 'Performance'}" on Talent!\n${shareUrl}`, url: shareUrl });
              }
            }}
            activeOpacity={0.7}
            className="items-center gap-1.5 min-w-[36px]"
          >
            <Share2 color="#fff" size={21} strokeWidth={1.5} />
            <Text className="text-[#9CA3AF] text-[9px] font-bold tracking-widest uppercase">
              SHARE
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-col items-end pt-1">
          {currentAllowJudging && (
            <View {...panResponder.panHandlers}>
              <View
                className={`rounded-full h-[32px] px-3.5 flex-row items-center gap-1.5 mb-2 cursor-pointer ${judgeScore !== null ? "bg-[#E91E76]/15 border border-[#E91E76]" : "bg-[#E91E76]"}`}
              >
                <Gauge color={judgeScore !== null ? "#E91E76" : "#fff"} size={13} />
                <Text
                  className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${judgeScore !== null ? "text-[#E91E76]" : "text-white"}`}
                >
                  {judgeScore !== null ? `${judgeScore.toFixed(1)} ★` : "JUDGE"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <View className="w-full h-[1px] bg-white/5 mt-5" />

      {/* Interactive Judging Sheet / Modal */}
      {showJudgeModal && currentAllowJudging && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowJudgeModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowJudgeModal(false)} className="flex-1 bg-black/75 justify-end items-center">
            <TouchableOpacity activeOpacity={1} onPress={(e: any) => e.stopPropagation?.()} className="bg-[#171922] w-full max-w-md rounded-t-3xl pb-10 pt-5 px-6 border-t border-white/10">
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />

              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Gauge color="#E91E76" size={20} />
                  <Text className="text-white text-lg font-bold">Judge Performance</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowJudgeModal(false)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  className="p-1"
                >
                  <X color="#9CA3AF" size={20} />
                </TouchableOpacity>
              </View>

              <Text className="text-[#9CA3AF] text-xs mb-5">Rate this performance on a scale of 1.0 to 10.0</Text>

              {/* Big Score Display */}
              <View className="items-center justify-center my-2">
                <View className="w-28 h-28 rounded-full bg-[#E91E76]/10 border-2 border-[#E91E76] items-center justify-center shadow-lg shadow-[#E91E76]/30">
                  <Text className="text-white text-4xl font-extrabold tracking-tight">
                    {tempScore.toFixed(1)}
                  </Text>
                  <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mt-0.5">SCORE</Text>
                </View>
              </View>

              {/* Score Stepper Controls (- / +) */}
              <View className="flex-row items-center justify-center gap-4 my-4">
                <TouchableOpacity
                  onPress={() => {
                    const next = Math.max(1.0, parseFloat((tempScore - 0.5).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-12 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">-0.5</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const next = Math.max(1.0, parseFloat((tempScore - 0.1).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">-0.1</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const next = Math.min(10.0, parseFloat((tempScore + 0.1).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">+0.1</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const next = Math.min(10.0, parseFloat((tempScore + 0.5).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-12 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">+0.5</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Preset Buttons */}
              <View className="flex-row items-center justify-center gap-1.5 mb-6 flex-wrap">
                {[6.0, 7.0, 8.0, 8.5, 9.0, 9.5, 10.0].map((val) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => {
                      setTempScore(val);
                      tempScoreRef.current = val;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`px-3 py-1.5 rounded-lg border ${tempScore === val ? 'bg-[#E91E76] border-[#E91E76]' : 'bg-white/5 border-white/10'}`}
                  >
                    <Text className={`text-xs font-semibold ${tempScore === val ? 'text-white' : 'text-[#9CA3AF]'}`}>{val.toFixed(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => {
                  saveScore(tempScore);
                  setShowJudgeModal(false);
                }}
                className="w-full bg-[#E91E76] h-12 rounded-xl items-center justify-center shadow-lg shadow-[#E91E76]/40"
              >
                <Text className="text-white font-bold text-base tracking-wide">
                  Confirm Rating • {tempScore.toFixed(1)} ★
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export function ProfileView({
  user,
  onLogout,
  onBack,
}: {
  user?: any;
  onLogout?: () => void;
  onBack?: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 28 : 20);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingView, setActiveSettingView] = useState<string | null>(
    null,
  );

  // App State
  const [activeTab, setActiveTab] = useState<
    "Performances" | "Kept" | "Shows" | "About"
  >("Performances");
  const savedPerformances = useKeptStore(state => state.keptVideos);
  const isLoadingSaved = useKeptStore(state => state.isLoading);

  useEffect(() => {
    if (activeTab === "Kept") {
      useKeptStore.getState().fetchKept();
    }
  }, [activeTab]);
  const [activeVideoMedia, setActiveVideoMedia] = useState<{ url: string; filter?: string | null; filterIntensity?: number | null } | null>(null);
  const activeVideoUrl = activeVideoMedia?.url || null;
  const setActiveVideoUrl = (url: string | null) => {
    setActiveVideoMedia(url ? { url } : null);
  };
  const [activeShowModal, setActiveShowModal] = useState<any | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isScoreBreakdownOpen, setIsScoreBreakdownOpen] = useState(false);
  const [isFansModalOpen, setIsFansModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');
  const [showTicketsModal, setShowTicketsModal] = useState<string | null>(null);
  const [ticketTier, setTicketTier] = useState<string>("General");
  const [ticketQty, setTicketQty] = useState<number>(1);
  const [ticketConfirmed, setTicketConfirmed] = useState<boolean>(false);
  const [isProfileFeedOpen, setIsProfileFeedOpen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>("0");
  const [backed, setBacked] = useState(false);

  // Privacy Settings State
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [isBlindModeEnabled, setIsBlindModeEnabled] = useState(true);

  // Profile Data State
  const [profileData, setProfileData] = useState<any>(null);
  const [shows, setShows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user: authUser, checkAuth } = useAuthStore();
  const { theme, themeId, setTheme } = useThemeStore();
  const [themeFilter, setThemeFilter] = useState<'all' | 'zed' | 'light' | 'dark'>('all');
  const isOwnProfile = Boolean(authUser?.id) && (
    (!user?.id && Boolean(profileData?.id))
      ? String(profileData?.id) === String(authUser?.id)
      : String(user?.id || profileData?.id) === String(authUser?.id)
  );

  // Performance / Post Options State
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<any | null>(null);
  const [isPostOptionsModalVisible, setIsPostOptionsModalVisible] = useState(false);
  const [isEditCaptionModalVisible, setIsEditCaptionModalVisible] = useState(false);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editAllowJudging, setEditAllowJudging] = useState(true);
  const [editAllowComments, setEditAllowComments] = useState(true);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isSavingPostEdit, setIsSavingPostEdit] = useState(false);
  const [deletedVideoIds, setDeletedVideoIds] = useState<Set<string>>(new Set());
  const [pinnedVideoId, setPinnedVideoId] = useState<string | null>(null);
  const [editedTitles, setEditedTitles] = useState<Record<string, string>>({});
  const [archivedVideoIds, setArchivedVideoIds] = useState<Set<string>>(new Set());

  const openPostOptions = (post: any) => {
    setSelectedPostForOptions(post);
    setEditPostTitle(editedTitles[post.id] || post.title || "");
    setIsPostOptionsModalVisible(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPostForOptions) return;
    setIsDeletingPost(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const postId = selectedPostForOptions.id;

    try {
      if (
        typeof postId === "number" ||
        (!isNaN(Number(postId)) && !String(postId).startsWith("dummy") && !String(postId).startsWith("featured"))
      ) {
        await api.delete(`/videos/${postId}`);
      }

      setDeletedVideoIds((prev) => new Set([...prev, String(postId)]));
      setProfileData((prev: any) => {
        if (!prev) return prev;
        const updatedVideos = (prev.videos || []).filter((v: any) => String(v.id) !== String(postId));
        return {
          ...prev,
          videos: updatedVideos,
          videosCount: Math.max(0, (prev.videosCount || (prev.videos?.length || 1)) - 1),
        };
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Deleted", "Performance post has been permanently deleted.");
    } catch (error) {
      console.error("Failed to delete video:", error);
      setDeletedVideoIds((prev) => new Set([...prev, String(postId)]));
      Alert.alert("Deleted", "Performance post removed from your profile.");
    } finally {
      setIsDeletingPost(false);
      setIsDeleteConfirmModalVisible(false);
      setIsPostOptionsModalVisible(false);
      setSelectedPostForOptions(null);
    }
  };

  const handleSavePostEdit = async () => {
    if (!selectedPostForOptions || !editPostTitle.trim()) return;
    setIsSavingPostEdit(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const postId = selectedPostForOptions.id;
    const newTitle = editPostTitle.trim();

    try {
      if (
        typeof postId === "number" ||
        (!isNaN(Number(postId)) && !String(postId).startsWith("dummy") && !String(postId).startsWith("featured"))
      ) {
        await api.put(`/videos/${postId}`, {
          title: newTitle,
          allowJudging: editAllowJudging,
          allowComments: editAllowComments
        });
      }

      setEditedTitles((prev) => ({ ...prev, [String(postId)]: newTitle }));
      setProfileData((prev: any) => {
        if (!prev) return prev;
        const updatedVideos = (prev.videos || []).map((v: any) =>
          String(v.id) === String(postId)
            ? { ...v, title: newTitle, allowJudging: editAllowJudging, allowComments: editAllowComments }
            : v
        );
        return { ...prev, videos: updatedVideos };
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Updated", "Performance details updated successfully.");
      setIsEditCaptionModalVisible(false);
    } catch (error) {
      console.error("Failed to update video:", error);
      setEditedTitles((prev) => ({ ...prev, [String(postId)]: newTitle }));
      setProfileData((prev: any) => {
        if (!prev) return prev;
        const updatedVideos = (prev.videos || []).map((v: any) =>
          String(v.id) === String(postId)
            ? { ...v, title: newTitle, allowJudging: editAllowJudging, allowComments: editAllowComments }
            : v
        );
        return { ...prev, videos: updatedVideos };
      });
      Alert.alert("Updated", "Performance details updated locally.");
      setIsEditCaptionModalVisible(false);
    } finally {
      setIsSavingPostEdit(false);
      setSelectedPostForOptions(null);
    }
  };

  const handleTogglePinPost = () => {
    if (!selectedPostForOptions) return;
    const postId = String(selectedPostForOptions.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (pinnedVideoId === postId) {
      setPinnedVideoId(null);
      Alert.alert("Unpinned", "Performance unpinned from the top of your profile.");
    } else {
      setPinnedVideoId(postId);
      Alert.alert("Pinned", "Performance is now pinned as your Featured Performance!");
    }
    setIsPostOptionsModalVisible(false);
  };

  const handleSharePost = async () => {
    if (!selectedPostForOptions) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const title = editedTitles[selectedPostForOptions.id] || selectedPostForOptions.title || "Performance";
      await RNShare.share({
        message: `Watch "${title}" by ${profileData?.name || "Artist"} on Talent App! https://talent.app/video/${selectedPostForOptions.id}`,
        title: title,
      });
    } catch (e) {
      console.error("Share error:", e);
    } finally {
      setIsPostOptionsModalVisible(false);
    }
  };

  const handleCopyLink = async () => {
    if (!selectedPostForOptions) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`https://talent.app/video/${selectedPostForOptions.id}`).catch(() => { });
    }
    Alert.alert("Copied", "Link copied to clipboard!");
    setIsPostOptionsModalVisible(false);
  };

  const handleArchivePost = () => {
    if (!selectedPostForOptions) return;
    const postId = String(selectedPostForOptions.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setArchivedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        Alert.alert("Visible", "Performance is now public on your profile.");
      } else {
        next.add(postId);
        Alert.alert("Archived", "Performance is archived and hidden from public view.");
      }
      return next;
    });
    setIsPostOptionsModalVisible(false);
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [editAvatarFilter, setEditAvatarFilter] = useState("Original");

  const avatarFilterStyles: Record<string, string> = {
    Original: "none",
    Stage: "contrast(1.25) saturate(1.4) hue-rotate(-8deg)",
    Noir: "grayscale(1) contrast(1.35)",
    Studio: "contrast(1.15) brightness(1.08) saturate(1.15)",
    Golden: "brightness(1.06) saturate(1.2) sepia(0.25)",
    Neon: "saturate(1.6) contrast(1.25) hue-rotate(20deg)",
  };

  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSaveProfile = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const formData = new FormData();
      formData.append("name", editName);
      formData.append("bio", editBio);
      formData.append("title", editTitle);
      formData.append("location", editLocation);
      formData.append("quote", editQuote);

      if (editAvatarUrl && (editAvatarUrl.startsWith("file://") || editAvatarUrl.startsWith("blob:") || editAvatarUrl.startsWith("data:"))) {
        if (Platform.OS === "web") {
          const response = await fetch(editAvatarUrl);
          const blob = await response.blob();
          formData.append("avatar", blob, "avatar.jpg");
        } else {
          const filename = editAvatarUrl.split("/").pop();
          const match = /\.(\w+)$/.exec(filename || "");
          const type = match ? `image/${match[1]}` : `image`;
          formData.append("avatar", {
            uri: editAvatarUrl,
            name: filename || "avatar.jpg",
            type,
          } as any);
        }
      }

      const res = await api.put("/profile/me", formData);

      const updatedProfile = res.data;
      setProfileData({ ...profileData, ...updatedProfile });

      if (checkAuth) {
        await checkAuth();
      }

      setIsEditingProfile(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const fetchProfile = useCallback(async () => {
    const isViewingSelf = !user?.id || (authUser?.id && String(user?.id) === String(authUser?.id));
    const endpoint = isViewingSelf ? "/profile/me" : `/profile/${user.id}`;

    try {
      setIsLoading(true);
      if (!user?.id && !authUser) {
        setIsLoading(false);
        return;
      }

      const response = await api.get(endpoint);
      setProfileData(response.data);
      if (response.data?.isFollowing !== undefined) {
        setBacked(response.data.isFollowing);
      }
      setEditName(response.data?.name || "");
      setEditBio(response.data?.bio || "");
      setEditAvatarUrl(response.data?.avatarUrl || "");
      setEditTitle(response.data?.title || "");
      setEditLocation(response.data?.location || "");
      setEditQuote(response.data?.quote || "");

      // Fetch shows
      const userId = response.data?.id;
      if (userId) {
        try {
          const showsRes = await api.get(`/shows/${userId}`);
          setShows(showsRes.data || []);
        } catch (e: any) {
          console.warn("Failed to fetch shows:", e?.message || e);
        }
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401 || status === 404) {
        console.log(`Profile fetch (${endpoint}): status ${status} (unauthenticated or removed).`);
        if (isViewingSelf) {
          useAuthStore.getState().logout().catch(() => { });
        }
        setProfileData(null);
      } else {
        console.warn("Could not load profile:", error.message || error);
        setProfileData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, authUser?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await fetchProfile();
      if (activeTab === "Kept") {
        await useKeptStore.getState().fetchKept();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProfile, activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  // Live real-time WebSocket listener for follower count updates
  useEffect(() => {
    const targetUserId = profileData?.id || user?.id;
    if (!targetUserId) return;

    const socket = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      socket.emit('join_profile', { profileUserId: targetUserId });
      if (authUser?.id) {
        socket.emit('join_user', { userId: authUser.id });
      }
    });

    socket.on('follower_count_updated', (data: any) => {
      if (data?.userId === targetUserId) {
        setProfileData((prev: any) =>
          prev ? { ...prev, followers: data.followersCount } : prev
        );
        if (data.actorId === authUser?.id && data.isFollowing !== undefined) {
          setBacked(data.isFollowing);
        }
      }
    });

    socket.on('following_count_updated', (data: any) => {
      if (data?.userId === targetUserId) {
        setProfileData((prev: any) =>
          prev ? { ...prev, following: data.followingCount } : prev
        );
      }
    });

    return () => {
      socket.emit('leave_profile', { profileUserId: targetUserId });
      socket.disconnect();
    };
  }, [profileData?.id, user?.id, authUser?.id]);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const name = profileData?.name || (isOwnProfile ? "My Profile" : "Artist");
      const id = profileData?.id || user?.id || "";
      const shareUrl = typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/profile/${id}`
        : `https://talent.app/profile/${id}`;
      await RNShare.share({
        message: `Check out ${name} on Talent App! ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBackTalent = async () => {
    try {
      const targetUserId = profileData?.id || user?.id || 1;
      if (!backed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Optimistic update
        setBacked(true);
        setProfileData((prev: any) => prev ? { ...prev, followers: (prev.followers || 0) + 1 } : prev);
        Alert.alert("Success!", "You are now backing this talent.");

        // Call backend to Follow
        const res = await api.post(`/users/${targetUserId}/follow`);
        if (res.data?.following !== undefined) {
          setBacked(res.data.following);
        }
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (Platform.OS === "web") {
          if (
            window.confirm("Are you sure you want to stop backing this talent?")
          ) {
            setBacked(false);
            setProfileData((prev: any) => prev ? { ...prev, followers: Math.max(0, (prev.followers || 0) - 1) } : prev);
            const res = await api.post(`/users/${targetUserId}/follow`);
            if (res.data?.following !== undefined) {
              setBacked(res.data.following);
            }
          }
        } else {
          Alert.alert(
            "Stop Backing",
            "Are you sure you want to stop backing this talent?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Stop Backing",
                style: "destructive",
                onPress: async () => {
                  setBacked(false);
                  setProfileData((prev: any) => prev ? { ...prev, followers: Math.max(0, (prev.followers || 0) - 1) } : prev);
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  try {
                    const res = await api.post(`/users/${targetUserId}/follow`);
                    if (res.data?.following !== undefined) {
                      setBacked(res.data.following);
                    }
                  } catch (e) {
                    console.error("Failed to unback:", e);
                  }
                },
              },
            ],
          );
        }
      }
    } catch (error) {
      console.error("Error toggling back status:", error);
      // Revert on failure
      setBacked(!backed);
      Alert.alert("Error", "Failed to update backing status.");
    }
  };

  const handleInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsInviteModalOpen(true);
  };

  const handleAction = (actionName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (actionName === "Inspect Craft") {
      Alert.alert(
        `${profileData?.name || "Artist"}'s Acoustic Rig`,
        "• Taylor 814ce Grand Auditorium (Solid Sitka Spruce / Indian Rosewood)\n• Shure SM58 Vocal Microphone\n• Strymon Timeline Multi-Delay Pedal\n• Tunings: D-A-D-F#-A-D (Open D) & Standard"
      );
    } else if (actionName === "Open Spotify") {
      const name = encodeURIComponent(profileData?.name || "Artist");
      Linking.openURL(`https://open.spotify.com/search/${name}`).catch(() => {
        Alert.alert("Spotify", "Unable to open Spotify.");
      });
    } else if (actionName === "Open YouTube") {
      const name = encodeURIComponent(profileData?.name || "Artist");
      Linking.openURL(`https://www.youtube.com/results?search_query=${name}`).catch(() => {
        Alert.alert("YouTube", "Unable to open YouTube.");
      });
    } else if (actionName === "Open Instagram") {
      const handle = profileData?.username || profileData?.name?.toLowerCase().replace(/\s+/g, '') || "artist";
      Linking.openURL(`https://www.instagram.com/${handle}`).catch(() => {
        Alert.alert("Instagram", "Unable to open Instagram.");
      });
    } else {
      Alert.alert(actionName, `Action triggered for ${actionName}`);
    }
  };

  const playVideo = (url: string, filter?: string | null, filterIntensity?: number | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveVideoMedia({ url, filter, filterIntensity });
  };

  if (isProfileFeedOpen) {
    return (
      <View className="flex-1 bg-[#050608]">
        {/* Header with Back Button */}
        <View className="pt-14 pb-4 px-4 flex-row items-center bg-[#13151C] border-b border-white/5 z-50">
          <TouchableOpacity
            onPress={() => setIsProfileFeedOpen(false)}
            className="w-10 h-10 items-center justify-center bg-black/40 rounded-full border border-white/10"
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text className="text-white font-bold text-[16px] ml-4">
            {profileData?.name || (isOwnProfile ? "My" : "Artist")}'s Performances
          </Text>
        </View>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 20,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
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
          {profileData?.videos
            ?.filter((v: any) => !deletedVideoIds.has(String(v.id || '')))
            .map((video: any, i: number) => {
              const videoId = String(video.id || i);
              const title = editedTitles[videoId] || video.title || "Performance Take";
              const videoThumb =
                video.thumbnailUrl || video.url || "";
              return (
                <ProfileFeedVideoCard
                  key={videoId}
                  video={{
                    id: videoId,
                    title: title,
                    author: profileData?.name || "User",
                    role: "Artist",
                    avatar: profileData?.avatarUrl || avatarImg,
                    videoThumb: videoThumb,
                    duration: video.duration || "0:58",
                    videoUrl: video.url || "",
                    filter: video.filter,
                    filterIntensity: video.filterIntensity,
                    userRating: video.userRating,
                    allowJudging: video.allowJudging,
                    allowComments: video.allowComments,
                  }}
                  playingVideoId={playingVideoId}
                  setPlayingVideoId={setPlayingVideoId}
                  onPass={() => { }}
                  onMaximize={(url, filter, filterIntensity) => playVideo(url, filter, filterIntensity)}
                  onTalk={() => {
                    setIsProfileFeedOpen(false);
                    const targetUserId = profileData?.id || user?.id || 1;
                    router.push(`/chat/${targetUserId}`);
                  }}
                  onOptions={() =>
                    openPostOptions({
                      id: videoId,
                      title: title,
                      videoUrl: video.url || "",
                      img: videoThumb,
                      time: video.duration || "0:58",
                      isImg: isMediaImage(video.url),
                      allowJudging: video.allowJudging,
                      allowComments: video.allowComments,
                    })
                  }
                />
              );
            })}
        </ScrollView>
      </View>
    );
  }

  const averageScore = useMemo(() => {
    if (!profileData?.videos || profileData.videos.length === 0) return "—";
    const rated = profileData.videos.filter((v: any) => typeof v.averageRating === 'number' && v.averageRating > 0);
    if (rated.length === 0) return "—";
    const sum = rated.reduce((acc: number, v: any) => acc + v.averageRating, 0);
    return (sum / rated.length).toFixed(1);
  }, [profileData?.videos]);

  if (isLoading && !profileData) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!profileData && !isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: theme.bg }}>
        <View
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          className="w-full max-w-[360px] p-8 rounded-3xl border items-center text-center shadow-xl"
        >
          <View
            style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}30` }}
            className="w-20 h-20 rounded-full border items-center justify-center mb-5"
          >
            <UserX color={theme.primary} size={36} />
          </View>
          <Text className="text-xl font-bold mb-2 text-center" style={{ color: theme.text }}>
            Artist Not Found
          </Text>
          <Text className="text-sm text-center mb-6 leading-5" style={{ color: theme.textSecondary }}>
            This artist profile does not exist or has been removed.
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (onBack) onBack();
              else if (router.canGoBack()) router.back();
              else router.replace('/');
            }}
            style={{ backgroundColor: theme.primary }}
            className="px-6 py-3 rounded-full flex-row items-center gap-2"
          >
            <ChevronLeft color="#fff" size={18} />
            <Text className="text-white font-semibold text-sm">Return to Stage</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {activeVideoMedia && (
        <VideoPlayerModal
          url={activeVideoMedia.url}
          filter={activeVideoMedia.filter}
          filterIntensity={activeVideoMedia.filterIntensity}
          onClose={() => setActiveVideoMedia(null)}
        />
      )}

      {activeShowModal && (
        <ShowPreviewModal
          show={activeShowModal}
          onClose={() => setActiveShowModal(null)}
          onBookingChange={(showId: any, isBooked: boolean) => {
            setShows((prevShows: any[]) =>
              prevShows.map((s: any) =>
                s.id === showId
                  ? {
                    ...s,
                    isVisiting: isBooked,
                    isBooked: isBooked,
                    visiting: Math.max(0, (s.visiting || 0) + (isBooked ? 1 : -1)),
                  }
                  : s,
              ),
            );
          }}
        />
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
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
        {/* Top Actions */}
        <View
          className="flex-row justify-between items-center px-4 pb-4"
          style={{ backgroundColor: theme.headerBg, paddingTop: topInset + 8 }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onBack) {
                onBack();
              } else if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
            className="w-10 h-10 items-center justify-center rounded-full border"
          >
            <ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleShare}
              style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
              className="w-10 h-10 items-center justify-center rounded-full border"
            >
              <Share color={theme.text} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsSettingsOpen(true)}
              style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
              className="w-10 h-10 items-center justify-center rounded-full border"
            >
              <MoreHorizontal color={theme.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar (Centered) */}
        <View className="items-center mt-2">
          <TouchableOpacity
            className="relative"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (isOwnProfile) {
                setIsEditingProfile(true);
              } else {
                Alert.alert(
                  "Online",
                  `${profileData?.name || "Artist"} is currently online & accepting bookings!`,
                );
              }
            }}
          >
            <View
              style={{ borderColor: theme.primary, backgroundColor: theme.surfaceBg }}
              className="w-[100px] h-[100px] rounded-full overflow-hidden border-[2px] shadow-lg"
            >
              <Image
                source={{ uri: profileData?.avatarUrl || avatarImg }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            {/* Online Dot */}
            <View
              style={{ borderColor: theme.bg }}
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#00E575] border-[2.5px]"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Info & Bio */}
        <View className="px-4 pt-6 flex-col">
          <View className="items-center">
            {/* Name & Badge */}
            <View className="flex-row items-center justify-center gap-2">
              <Text
                className="text-[32px] font-serif font-bold tracking-tight text-center"
                style={{ color: theme.text }}
              >
                {profileData?.name || (isOwnProfile ? "My Profile" : "Artist Profile")}
              </Text>
              {profileData?.isVerified && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Verified Stage Artist", "Level 4 Calibrated")
                  }
                  style={{ backgroundColor: theme.primary }}
                  className="w-[22px] h-[22px] rounded-full items-center justify-center shadow-md"
                >
                  <Check color="#fff" strokeWidth={3.5} size={13} />
                </TouchableOpacity>
              )}
            </View>

            {/* Role & Location */}
            <View className="flex-row items-center justify-center flex-wrap gap-2 mt-2">
              {profileData?.title ? (
                profileData.title.split("•").map((part: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <View className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.textSecondary }} />}
                    <Text className="text-[13px] font-medium" style={{ color: theme.textSecondary }}>
                      {part.trim()}
                    </Text>
                  </React.Fragment>
                ))
              ) : (
                <Text className="text-[13px]" style={{ color: theme.textSecondary }}>Artist</Text>
              )}
              {Boolean(profileData?.location) && (
                <>
                  <View className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.textSecondary }} />
                  <View className="flex-row items-center justify-center gap-1">
                    <MapPin color={theme.primary} fill={theme.primary} size={13} />
                    <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                      {profileData.location}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Quote / Caption */}
            {Boolean(profileData?.quote || profileData?.bio) && (
              <Text
                className="text-[15px] italic text-center mt-3 px-6 leading-6 opacity-90"
                style={{ color: theme.text }}
              >
                "{profileData?.quote || profileData?.bio}"
              </Text>
            )}
          </View>

          {/* Metrics 4-Grid Cards */}
          <View className="flex-row gap-2 mt-5">
            <TouchableOpacity
              onPress={() => setIsScoreBreakdownOpen(true)}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="flex-1 p-3 rounded-2xl border items-start min-h-[72px] justify-between">
              <Star color={theme.primary} fill={theme.primary} size={18} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold" style={{ color: theme.text }}>{averageScore}</Text>
                <Text className="text-[11px] font-medium mt-0.5" style={{ color: theme.textSecondary }}>
                  Blind Score
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Performances")}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="flex-1 p-3 rounded-2xl border items-start min-h-[72px] justify-between"
            >
              <BarChart2 color={theme.textSecondary} size={18} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold" style={{ color: theme.text }}>
                  {profileData?.videosCount !== undefined ? profileData.videosCount.toString() : (isLoading ? "..." : "0")}
                </Text>
                <Text
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  Performances
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Shows")}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="flex-1 p-3 rounded-2xl border items-start min-h-[72px] justify-between"
            >
              <Calendar color={theme.primary} size={18} strokeWidth={2} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold" style={{ color: theme.text }}>
                  {shows ? shows.length.toString() : (isLoading ? "..." : "0")}
                </Text>
                <Text className="text-[11px] font-medium mt-0.5" style={{ color: theme.textSecondary }}>
                  Shows
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFollowersModalTab('followers');
                setIsFansModalOpen(true);
              }}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="flex-1 p-3 rounded-2xl border items-start min-h-[72px] justify-between">
              <Users color={theme.textSecondary} size={18} strokeWidth={2} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold" style={{ color: theme.text }}>
                  {profileData?.followers !== undefined ? profileData.followers.toLocaleString() : (isLoading ? "..." : "0")}
                </Text>
                <Text className="text-[11px] font-medium mt-0.5" style={{ color: theme.textSecondary }}>
                  Followers
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-5 items-center">
            {isOwnProfile ? (
              <TouchableOpacity
                onPress={() => setIsEditingProfile(true)}
                activeOpacity={0.8}
                style={{ backgroundColor: theme.primary }}
                className="flex-[1.8] h-[48px] rounded-full flex-row items-center justify-center gap-1.5 shadow-md"
              >
                <User color="#fff" size={16} />
                <Text className="text-[12px] text-white font-bold tracking-[0.08em] uppercase">
                  EDIT PROFILE
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleBackTalent}
                activeOpacity={0.8}
                style={backed ? { borderColor: theme.primary } : { backgroundColor: theme.primary }}
                className={`flex-[1.6] h-[48px] rounded-full flex-row items-center justify-center gap-2 ${backed ? "bg-[#181A24] border" : ""}`}
              >
                <Heart
                  color={backed ? theme.primary : "#fff"}
                  fill="transparent"
                  size={18}
                  strokeWidth={2}
                />
                <Text
                  className={`text-[12px] font-semibold tracking-[0.05em] uppercase text-white`}
                >
                  {backed ? "TALENT BACKED" : "BACK TALENT"}
                </Text>
              </TouchableOpacity>
            )}

            {!isOwnProfile && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const targetUserId = profileData?.id || user?.id || 1;
                  router.push(`/chat/${targetUserId}`);
                }}
                activeOpacity={0.8}
                style={{ borderColor: theme.border, backgroundColor: theme.surfaceBg }}
                className="flex-[1.8] h-[48px] rounded-full border items-center justify-center flex-row gap-2"
              >
                <MessageCircle color={theme.text} size={16} strokeWidth={2} />
                <Text className="text-[12px] font-semibold tracking-[0.05em] uppercase" style={{ color: theme.text }}>
                  MESSAGE
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setIsSettingsOpen(true)}
              style={{ borderColor: theme.border, backgroundColor: theme.surfaceBg }}
              className="w-[48px] h-[48px] rounded-full border items-center justify-center"
            >
              <MoreHorizontal color={theme.text} size={20} />
            </TouchableOpacity>
          </View>

          {/* Hashtags Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-5"
            contentContainerStyle={{ paddingBottom: 4, gap: 10 }}
          >
            {["#Original", "#Acoustic", "#Indie", "#Singer"].map((tag, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/search', params: { q: tag.replace('#', '') } });
                }}
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="px-4 py-2 rounded-full border items-center justify-center"
              >
                <Text className="text-[12px] font-medium" style={{ color: theme.text }}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                if (isOwnProfile) {
                  setIsEditingProfile(true);
                } else {
                  router.push('/search');
                }
              }}
              style={{ borderColor: theme.border }}
              className="px-4 py-2 rounded-full bg-transparent border flex-row items-center gap-1"
            >
              <Plus color={theme.textSecondary} size={14} />
              <Text className="text-[12px] font-medium" style={{ color: theme.textSecondary }}>
                Add tag
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tabs */}
        <View
          className="flex-row border-b mb-6 px-4 justify-between"
          style={{ borderBottomColor: theme.border }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("Performances");
            }}
            className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab !== "Performances" ? "opacity-60" : ""}`}
          >
            <View
              className="flex-row items-center gap-2 pb-1"
              style={activeTab === "Performances" ? { borderBottomWidth: 3, borderBottomColor: theme.primary } : undefined}
            >
              <Play
                color={activeTab === "Performances" ? theme.primary : theme.textSecondary}
                fill={activeTab === "Performances" ? theme.primary : "transparent"}
                size={14}
              />
              <Text
                className="font-semibold text-[13px]"
                style={{ color: activeTab === "Performances" ? theme.primary : theme.textSecondary }}
              >
                Performances
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("Kept");
            }}
            className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab !== "Kept" ? "opacity-60" : ""}`}
          >
            <View
              className="flex-row items-center gap-2 pb-1"
              style={activeTab === "Kept" ? { borderBottomWidth: 3, borderBottomColor: theme.primary } : undefined}
            >
              <Bookmark
                color={activeTab === "Kept" ? theme.primary : theme.textSecondary}
                fill={activeTab === "Kept" ? theme.primary : "transparent"}
                size={14}
              />
              <Text
                className="font-semibold text-[13px]"
                style={{ color: activeTab === "Kept" ? theme.primary : theme.textSecondary }}
              >
                Kept
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("Shows");
            }}
            className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab !== "Shows" ? "opacity-60" : ""}`}
          >
            <View
              className="flex-row items-center gap-2 pb-1"
              style={activeTab === "Shows" ? { borderBottomWidth: 3, borderBottomColor: theme.primary } : undefined}
            >
              <Calendar
                color={activeTab === "Shows" ? theme.primary : theme.textSecondary}
                size={14}
              />
              <Text
                className="font-semibold text-[13px]"
                style={{ color: activeTab === "Shows" ? theme.primary : theme.textSecondary }}
              >
                Shows
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("About");
            }}
            className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab !== "About" ? "opacity-60" : ""}`}
          >
            <View
              className="flex-row items-center gap-2 pb-1"
              style={activeTab === "About" ? { borderBottomWidth: 3, borderBottomColor: theme.primary } : undefined}
            >
              <User
                color={activeTab === "About" ? theme.primary : theme.textSecondary}
                size={14}
              />
              <Text
                className="font-semibold text-[13px]"
                style={{ color: activeTab === "About" ? theme.primary : theme.textSecondary }}
              >
                About
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {activeTab === "Performances" && (
          <View>
            {/* Featured Performance */}
            <View className="px-5 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[18px] font-bold tracking-tight" style={{ color: theme.text }}>
                  Featured Performance
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsProfileFeedOpen(true);
                    }}
                    style={{ borderColor: theme.primary, backgroundColor: theme.primary + '15' }}
                    className="border px-3 py-1 rounded-full flex-row items-center justify-center"
                  >
                    <Text style={{ color: theme.primary }} className="text-[10px] font-bold tracking-wider uppercase">
                      Live View
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/create');
                    }}
                    style={{ backgroundColor: theme.primary }}
                    className="px-3 py-1 rounded-full flex-row items-center justify-center gap-1"
                  >
                    <Plus color="#fff" size={12} />
                    <Text className="text-white text-[11px] font-bold">
                      Add Video
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {(() => {
                const fallbackPerformances: any[] = [];

                const hasUploadedVideos = Boolean(profileData?.videos && profileData.videos.length > 0);
                const availableVideos = hasUploadedVideos
                  ? profileData.videos.filter((v: any) => !deletedVideoIds.has(String(v.id || '')))
                  : [];

                // Pick pinned or first
                const pinned = pinnedVideoId
                  ? availableVideos.find((v: any) => String(v.id) === pinnedVideoId)
                  : null;
                const featuredVideo = pinned || (availableVideos.length > 0 ? availableVideos[0] : null);

                if (!featuredVideo) {
                  return (
                    <View
                      style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
                      className="w-full aspect-[4/3] rounded-[24px] items-center justify-center border p-6"
                    >
                      <Film color={theme.textSecondary} size={36} />
                      <Text className="font-bold text-[16px] mt-3" style={{ color: theme.text }}>
                        No Featured Performance
                      </Text>
                      <Text className="text-[12px] text-center mt-1 mb-4" style={{ color: theme.textSecondary }}>
                        Upload or set a performance as featured to showcase it here.
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push('/create')}
                        style={{ backgroundColor: theme.primary }}
                        className="px-5 py-2.5 rounded-full flex-row items-center gap-2"
                      >
                        <Plus color="#fff" size={14} />
                        <Text className="text-white font-bold text-[12px]">Add Performance</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                const featuredId = String(featuredVideo.id);
                const featuredVideoUrl = featuredVideo.url || featuredVideo.videoUrl || "";
                const featuredTitle = editedTitles[featuredId] || featuredVideo.title || "Acoustic Sunset Sessions";
                const isImg = isMediaImage(featuredVideoUrl);
                const featuredCategory = featuredVideo.category || (isImg ? "Visual Art" : "Performance");
                const featuredViews = featuredVideo.views ? `${featuredVideo.views} views` : "3.2M views";
                const posterUrl = featuredVideo.thumbnailUrl || featuredVideo.img || featuredVideo.url || "";

                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => playVideo(featuredVideoUrl)}
                    style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
                    className="w-full aspect-[4/3] rounded-[24px] overflow-hidden relative border"
                  >
                    {isImg ? (
                      Platform.OS === "web" ? (
                        <img
                          src={featuredVideoUrl}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          alt={featuredTitle}
                        />
                      ) : (
                        <Image
                          source={{ uri: featuredVideoUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      )
                    ) : Platform.OS === "web" ? (
                      <video
                        src={featuredVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={posterUrl}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: posterUrl,
                        }}
                        className="w-full h-full opacity-80"
                      />
                    )}
                    <View className="absolute inset-0 bg-black/40" />

                    {/* Featured Badge */}
                    <View
                      style={{ backgroundColor: theme.primary }}
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-md flex-row items-center gap-1.5 shadow-sm z-10"
                    >
                      <Star color="#fff" fill="#fff" size={12} />
                      <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
                        {pinnedVideoId === featuredId
                          ? "PINNED • FEATURED TAKE"
                          : isImg
                            ? "LATEST UPLOAD • TAP TO VIEW FULL"
                            : "FEATURED • TAP TO PLAY FULL"}
                      </Text>
                    </View>

                    {/* Post Options Button (•••) */}
                    <TouchableOpacity
                      onPress={(e: any) => {
                        e.stopPropagation?.();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        openPostOptions({
                          id: featuredId,
                          title: featuredTitle,
                          videoUrl: featuredVideoUrl,
                          img: posterUrl,
                          time: isImg ? "Photo" : "02:40",
                          isImg,
                          isFeatured: true,
                          allowJudging: featuredVideo?.allowJudging,
                          allowComments: featuredVideo?.allowComments,
                        });
                      }}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 items-center justify-center z-20 shadow-md"
                    >
                      <MoreHorizontal color="#fff" size={18} />
                    </TouchableOpacity>

                    {/* Play / View Button */}
                    <View className="absolute top-[50%] left-0 right-0 items-center justify-center -translate-y-1/2">
                      <View className="w-16 h-16 rounded-full border border-white bg-black/30 items-center justify-center">
                        {isImg ? (
                          <Eye color="#fff" size={24} />
                        ) : (
                          <Play
                            color="#fff"
                            fill="#fff"
                            size={24}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>
                    </View>

                    {/* Bottom Info */}
                    <View className="absolute bottom-0 left-0 right-0 px-5 py-5">
                      <Text className="text-white text-[24px] font-serif font-bold tracking-tight mb-2">
                        {featuredTitle}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1">
                          <Text className="text-[#D1D5DB] text-[13px]">
                            {featuredCategory} • {featuredViews} •{" "}
                          </Text>
                          <Text style={{ color: theme.primary }} className="text-[13px]">
                            {isImg ? "Tap to View Photo" : "Tap to Watch"}
                          </Text>
                        </View>
                        <View className="bg-transparent border border-white/20 px-2.5 py-1 rounded-md">
                          <Text className="text-white text-[11px] font-medium tracking-wide">
                            {isImg ? "Photo" : "03:24"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })()}
            </View>

            {/* Performances Row */}
            <View className="mb-8">
              <View className="px-5 flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
                    Performances
                  </Text>
                  <Text className="text-[14px]" style={{ color: theme.textSecondary }}>
                    ({profileData?.videosCount || profileData?.videos?.length || 4})
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/create');
                }}>
                  <Text style={{ color: theme.primary }} className="text-[13px] font-medium">
                    + Upload take
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pl-5"
                contentContainerStyle={{ paddingRight: 40, gap: 12 }}
              >
                {(() => {
                  const rawItems =
                    profileData?.videos && profileData.videos.length > 0
                      ? profileData.videos.map((v: any, idx: number) => {
                          const isImg = isMediaImage(v.url);
                          const vidId = String(v.id || idx);
                          return {
                            id: vidId,
                            title: editedTitles[vidId] || v.title || "Untitled Take",
                            time: isImg ? "Photo" : (v.duration || "02:40"),
                            img: isImg
                              ? v.url
                              : (v.thumbnailUrl || ""),
                            videoUrl: v.url,
                            filter: v.filter,
                            filterIntensity: v.filterIntensity,
                            isImg,
                            allowJudging: v.allowJudging,
                            allowComments: v.allowComments,
                          };
                        })
                      : [];

                  const itemsToDisplay = rawItems
                    .filter((perf: any) => !deletedVideoIds.has(String(perf.id)))
                    .sort((a: any, b: any) => {
                      if (pinnedVideoId === String(a.id)) return -1;
                      if (pinnedVideoId === String(b.id)) return 1;
                      return 0;
                    });

                  if (itemsToDisplay.length === 0) {
                    return (
                      <View
                        style={{ borderColor: theme.border, backgroundColor: theme.surfaceBg }}
                        className="py-6 px-8 rounded-2xl border border-dashed items-center justify-center my-2 mr-5"
                      >
                        <Film color={theme.textSecondary} size={28} />
                        <Text className="text-[13px] font-bold mt-2" style={{ color: theme.text }}>
                          No Performances Left
                        </Text>
                        <Text className="text-[11px] text-center mt-1 mb-3" style={{ color: theme.textSecondary }}>
                          Upload new takes to show on your profile
                        </Text>
                        <TouchableOpacity
                          onPress={() => router.push('/create')}
                          style={{ backgroundColor: theme.primary }}
                          className="px-4 py-1.5 rounded-full flex-row items-center gap-1.5"
                        >
                          <Plus color="#fff" size={12} />
                          <Text className="text-white font-bold text-[11px]">Upload Take</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }

                  return itemsToDisplay.map((perf: any, i: number) => {
                    const isPinned = pinnedVideoId === String(perf.id);
                    return (
                      <TouchableOpacity
                        key={perf.id || i}
                        onPress={() => playVideo(perf.videoUrl, perf.filter, perf.filterIntensity)}
                        activeOpacity={0.8}
                        style={
                          isPinned
                            ? { borderColor: theme.primary, borderWidth: 2 }
                            : i === 0 && !pinnedVideoId
                              ? { borderColor: theme.primary, borderWidth: 2 }
                              : { borderColor: theme.border, borderWidth: 1 }
                        }
                        className="w-[140px] h-[190px] rounded-[16px] overflow-hidden relative"
                      >
                        {perf.isImg ? (
                          Platform.OS === "web" ? (
                            <img
                              src={perf.videoUrl || perf.img}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: getEffectiveFilterCss(perf.filter, perf.filterIntensity),
                              }}
                              alt={perf.title}
                            />
                          ) : (
                            <View className="w-full h-full">
                              <Image
                                source={{ uri: resolveMediaUrl(perf.videoUrl || perf.img) }}
                                className="w-full h-full opacity-90"
                                resizeMode="cover"
                              />
                              <MediaFilterOverlay filter={perf.filter} filterIntensity={perf.filterIntensity} />
                            </View>
                          )
                        ) : Platform.OS === "web" ? (
                          <div style={{ position: "relative", width: "100%", height: "100%" }}>
                            <video
                              src={resolveMediaUrl(perf.videoUrl)}
                              autoPlay
                              loop
                              muted
                              playsInline
                              poster={resolveMediaUrl(perf.img)}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: getEffectiveFilterCss(perf.filter, perf.filterIntensity),
                              }}
                            />
                            <MediaFilterOverlay filter={perf.filter} filterIntensity={perf.filterIntensity} />
                          </div>
                        ) : (
                          <View className="w-full h-full">
                            <Image
                              source={{ uri: resolveMediaUrl(perf.img || perf.videoUrl) }}
                              className="w-full h-full opacity-80"
                            />
                            <MediaFilterOverlay filter={perf.filter} filterIntensity={perf.filterIntensity} />
                          </View>
                        )}
                        <View className="absolute inset-0 bg-black/40" />

                        {/* Top Action Bar: Pin badge & Options button */}
                        <View className="absolute top-2 left-2 right-2 flex-row items-center justify-between z-20">
                          {isPinned ? (
                            <View
                              style={{ backgroundColor: theme.primary }}
                              className="px-1.5 py-0.5 rounded-md flex-row items-center gap-1 shadow-sm"
                            >
                              <Pin color="#fff" size={9} />
                              <Text className="text-white text-[8px] font-bold">PINNED</Text>
                            </View>
                          ) : (
                            <View />
                          )}
                          <TouchableOpacity
                            onPress={(e: any) => {
                              e.stopPropagation?.();
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              openPostOptions({
                                id: String(perf.id),
                                title: perf.title,
                                videoUrl: perf.videoUrl,
                                img: perf.img,
                                time: perf.time,
                                isImg: perf.isImg,
                                allowJudging: perf.allowJudging,
                                allowComments: perf.allowComments,
                              });
                            }}
                            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 items-center justify-center shadow-sm"
                          >
                            <MoreHorizontal color="#fff" size={14} />
                          </TouchableOpacity>
                        </View>

                        {/* Bottom Info */}
                        <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
                          <View className="flex-1 pr-1">
                            <Text
                              className="text-white text-[13px] font-bold mb-1"
                              numberOfLines={1}
                            >
                              {perf.title}
                            </Text>
                            <Text className="text-[#9CA3AF] text-[11px]">
                              {perf.time}
                            </Text>
                          </View>
                          <View className="w-7 h-7 rounded-full border border-white items-center justify-center bg-black/30">
                            {perf.isImg ? (
                              <Eye color="#fff" size={12} />
                            ) : (
                              <Play
                                color="#fff"
                                size={12}
                                fill="#fff"
                                style={{ marginLeft: 2 }}
                              />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  });
                })()}
              </ScrollView>
            </View>

            {/* Upcoming Shows in Performances Tab */}
            <View className="mb-8">
              <View className="px-5 flex-row justify-between items-center mb-4">
                <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
                  Upcoming Shows
                </Text>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab("Shows");
                  }}
                >
                  <Text className="text-[12px]" style={{ color: theme.textSecondary }}>View all</Text>
                  <ChevronRight color={theme.textSecondary} size={14} />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pl-5"
                contentContainerStyle={{ paddingRight: 40, gap: 12 }}
              >
                {(shows && shows.length > 0 ? (
                  shows.map((show, i) => {
                    const date = new Date(show.date);
                    const dateM = date.getDate().toString();
                    const dateD = date
                      .toLocaleString("default", { month: "short" })
                      .toUpperCase();

                    return (
                      <TouchableOpacity
                        key={show.id || i}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setActiveShowModal(show);
                        }}
                        activeOpacity={0.8}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                        className="w-[300px] border rounded-2xl flex-col overflow-hidden"
                      >
                        <View className="p-4 flex-row items-center gap-4">
                          <View
                            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                            className="items-center w-[48px] h-[52px] border rounded-xl justify-center"
                          >
                            <Text className="font-bold text-[18px] leading-5" style={{ color: theme.text }}>
                              {dateM}
                            </Text>
                            <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>
                              {dateD}
                            </Text>
                          </View>
                          <View className="w-14 h-14 rounded-xl overflow-hidden bg-black/10">
                            {show.image ? (
                              <Image
                                source={{ uri: show.image }}
                                className="w-full h-full opacity-80"
                              />
                            ) : null}
                          </View>
                          <View className="flex-1">
                            <Text
                              className="font-bold text-[15px] mb-1"
                              style={{ color: theme.text }}
                              numberOfLines={1}
                            >
                              {show.title}
                            </Text>
                            <View className="flex-row items-center gap-1">
                              <MapPin color={theme.primary} size={12} />
                              <Text
                                className="text-[12px]"
                                style={{ color: theme.textSecondary }}
                                numberOfLines={1}
                              >
                                {show.location}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View
                          style={{ borderTopColor: theme.border, backgroundColor: theme.surfaceBg }}
                          className="px-4 py-3 border-t flex-row items-center justify-between"
                        >
                          <View className="flex-row items-center gap-1.5">
                            <User color={theme.primary} size={14} />
                            <Text className="text-[12px]" style={{ color: theme.textSecondary }}>
                              {show.visiting} visiting
                            </Text>
                          </View>
                          {show.isVisiting ? (
                            <View className="bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/30 flex-row items-center gap-1">
                              <CheckCircle color="#10b981" size={12} />
                              <Text className="text-[#10b981] text-[11px] font-bold">
                                You're Visiting
                              </Text>
                            </View>
                          ) : (
                            <View
                              style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
                              className="px-3 py-1.5 rounded-full border"
                            >
                              <Text className="text-[11px] font-bold" style={{ color: theme.text }}>
                                RSVP
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View
                    style={{ borderColor: theme.border, backgroundColor: theme.surfaceBg }}
                    className="py-5 px-6 rounded-2xl border border-dashed items-center justify-center my-1"
                  >
                    <Calendar color={theme.textSecondary} size={24} />
                    <Text className="text-[13px] font-bold mt-2" style={{ color: theme.text }}>
                      No Upcoming Shows
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {activeTab === "Kept" && (
          <View className="mb-8">
            <View className="px-5 flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
                  Kept Performances
                </Text>
                <Text className="text-[14px]" style={{ color: theme.textSecondary }}>
                  ({savedPerformances.length})
                </Text>
              </View>
            </View>

            {isLoadingSaved && savedPerformances.length === 0 ? (
              <View className="py-16 items-center justify-center">
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textSecondary }} className="font-medium text-[13px] mt-4">
                  Loading kept performances...
                </Text>
              </View>
            ) : savedPerformances.length === 0 ? (
              <View
                style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
                className="mx-5 rounded-[24px] items-center justify-center border p-8"
              >
                <View
                  style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}30` }}
                  className="w-14 h-14 rounded-full border items-center justify-center mb-3"
                >
                  <Bookmark color={theme.primary} size={26} />
                </View>
                <Text className="font-bold text-[16px] mb-1" style={{ color: theme.text }}>
                  No Kept Performances
                </Text>
                <Text className="text-[12px] text-center max-w-[260px] leading-4" style={{ color: theme.textSecondary }}>
                  Performances you bookmark with KEEP on the feed will appear here for fast replay.
                </Text>
              </View>
            ) : (
              <View className="px-5 gap-4">
                {savedPerformances.map((perf: any) => {
                  const perfUrl = resolveMediaUrl(perf.url || perf.videoUrl);
                  const isImg = isMediaImage(perf.url || perf.videoUrl);
                  return (
                    <TouchableOpacity
                      key={perf.id}
                      activeOpacity={0.85}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        playVideo(perfUrl, perf.filter, perf.filterIntensity);
                      }}
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                      className="rounded-[20px] p-3 border shadow-md flex-row items-center gap-3"
                    >
                      {/* Video Thumbnail */}
                      <View className="w-24 h-28 rounded-[14px] bg-black overflow-hidden relative border border-white/10 items-center justify-center">
                        {isImg ? (
                          <View className="w-full h-full">
                            <Image source={{ uri: perfUrl }} className="w-full h-full" resizeMode="cover" />
                            <MediaFilterOverlay filter={perf.filter} filterIntensity={perf.filterIntensity} />
                          </View>
                        ) : (
                          <>
                            {perf.videoThumb || perf.thumbnailUrl ? (
                              <View className="w-full h-full">
                                <Image source={{ uri: perf.videoThumb || perf.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
                                <MediaFilterOverlay filter={perf.filter} filterIntensity={perf.filterIntensity} />
                              </View>
                            ) : (
                              <View className="flex-1 w-full bg-neutral-900 items-center justify-center" />
                            )}
                            <View className="absolute inset-0 bg-black/30 items-center justify-center">
                              <View className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md items-center justify-center border border-white/30">
                                <Play color="#fff" fill="#fff" size={14} style={{ marginLeft: 2 }} />
                              </View>
                            </View>
                          </>
                        )}
                      </View>

                      {/* Video Info */}
                      <View className="flex-1 justify-between h-28 py-1">
                        <View>
                          <View className="flex-row items-center gap-1.5 mb-1">
                            <Text style={{ color: theme.primary }} className="text-[10px] font-bold uppercase tracking-wider">
                              KEPT
                            </Text>
                            {perf.views ? (
                              <>
                                <Text style={{ color: theme.textSecondary }} className="text-[10px]">•</Text>
                                <Text style={{ color: theme.textSecondary }} className="text-[10px]">{perf.views} views</Text>
                              </>
                            ) : null}
                          </View>
                          <Text style={{ color: theme.text }} className="text-[15px] font-bold leading-tight" numberOfLines={2}>
                            {perf.title || 'Performance'}
                          </Text>
                          {(() => {
                            const authorName = typeof perf.author === 'object' && perf.author !== null
                              ? (perf.author.name || perf.author.username || 'Artist')
                              : (typeof perf.author === 'string' && perf.author ? perf.author : 'Artist');
                            return (
                              <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-1" numberOfLines={1}>
                                By {authorName}
                              </Text>
                            );
                          })()}
                        </View>

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-1">
                            <Star color="#F59E0B" fill="#F59E0B" size={12} />
                            <Text style={{ color: theme.text }} className="text-[11px] font-bold">
                              {perf.averageRating ? perf.averageRating.toFixed(1) : '5.0'}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={async (e: any) => {
                              if (e) {
                                if (typeof e.stopPropagation === 'function') e.stopPropagation();
                                if (e.nativeEvent && typeof e.nativeEvent.stopPropagation === 'function') {
                                  e.nativeEvent.stopPropagation();
                                }
                              }
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              await useKeptStore.getState().toggleKeep(perf);
                            }}
                            className="px-2.5 py-1 rounded-full bg-white/10 flex-row items-center gap-1 active:opacity-60"
                          >
                            <Bookmark color={theme.primary} fill={theme.primary} size={11} />
                            <Text style={{ color: theme.primary }} className="text-[10px] font-bold">Kept</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {activeTab === "Shows" && (
          <View className="mb-8">
            <View className="px-5 flex-row justify-between items-center mb-4">
              <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
                Upcoming Shows
              </Text>
            </View>

            <View className="px-5 gap-3">
              {shows && shows.length > 0 ? (
                shows.map((show, i) => {
                  const date = new Date(show.date);
                  const dateM = date.getDate().toString();
                  const dateD = date
                    .toLocaleString("default", { month: "short" })
                    .toUpperCase();

                  return (
                    <TouchableOpacity
                      key={show.id || i}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveShowModal(show);
                      }}
                      activeOpacity={0.8}
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                      className="w-full border rounded-xl p-3 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-4">
                        <View className="items-center w-[40px]">
                          <Text className="font-bold text-[18px]" style={{ color: theme.text }}>
                            {dateM}
                          </Text>
                          <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>
                            {dateD}
                          </Text>
                        </View>
                        <View className="w-12 h-12 rounded-lg overflow-hidden bg-black/10">
                          {show.image ? (
                            <Image
                              source={{ uri: show.image }}
                              className="w-full h-full opacity-80"
                            />
                          ) : null}
                        </View>
                        <View>
                          <Text className="font-bold text-[14px] mb-1" style={{ color: theme.text }}>
                            {show.title}
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <MapPin color={theme.textSecondary} size={10} />
                            <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                              {show.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <ChevronRight color={theme.textSecondary} size={16} />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                  className="items-center justify-center p-8 border rounded-[24px]"
                >
                  <Calendar color={theme.textSecondary} size={48} className="mb-4" />
                  <Text className="font-bold text-[18px] text-center mb-2" style={{ color: theme.text }}>
                    No upcoming shows
                  </Text>
                  <Text className="text-[13px] text-center" style={{ color: theme.textSecondary }}>
                    There are no upcoming shows scheduled right now.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === "About" && (
          <View className="px-5 mb-8">
            {/* Artist Bio */}
            <View
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="border rounded-xl p-5 mb-4"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <User color={theme.primary} size={18} />
                <Text className="text-[13px] font-bold tracking-widest uppercase" style={{ color: theme.text }}>
                  Artist Bio
                </Text>
              </View>
              <Text className="text-[14px] leading-6" style={{ color: theme.textSecondary }}>
                {profileData?.bio || "No artist bio added yet. Tap Edit Profile to add your story."}
              </Text>
            </View>

            {/* Instruments & Craft */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleAction("Inspect Craft")}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="border rounded-xl p-5 mb-4"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Music color={theme.primary} size={18} />
                <Text className="text-[13px] font-bold tracking-widest uppercase" style={{ color: theme.text }}>
                  Instruments & Craft (Tap to inspect)
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "Taylor 814ce Acoustic",
                  "Shure SM58 Dynamic",
                  "Strymon Timeline Delay",
                  "Open D Tuning",
                ].map((item, i) => (
                  <View
                    key={i}
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                    className="border px-3 py-2 rounded-full"
                  >
                    <Text className="text-[13px]" style={{ color: theme.text }}>{item}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Streaming & Socials */}
            <View
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="border rounded-xl p-5 mb-6"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-[13px] font-bold tracking-widest uppercase" style={{ color: theme.text }}>
                  Streaming & Socials
                </Text>
              </View>

              <View className="gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAction("Open Spotify")}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="flex-row items-center justify-between border rounded-xl p-4"
                >
                  <Text className="text-[14px]" style={{ color: theme.text }}>
                    Spotify • 184K Monthly Listeners
                  </Text>
                  <ExternalLink color={theme.textSecondary} size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAction("Open YouTube")}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="flex-row items-center justify-between border rounded-xl p-4"
                >
                  <Text className="text-[14px]" style={{ color: theme.text }}>
                    YouTube • 92K Subscribers
                  </Text>
                  <ExternalLink color={theme.textSecondary} size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAction("Open Instagram")}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="flex-row items-center justify-between border rounded-xl p-4"
                >
                  <Text className="text-[14px]" style={{ color: theme.text }}>
                    Instagram • @{profileData?.username || profileData?.name?.toLowerCase().replace(/\s+/g, '') || "artist"}
                  </Text>
                  <ExternalLink color={theme.textSecondary} size={16} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Booking Button */}
            <TouchableOpacity
              onPress={handleInvite}
              activeOpacity={0.8}
              className="w-full bg-[#E91E76] h-[52px] rounded-full flex-row items-center justify-center"
            >
              <Text className="text-white font-bold text-[14px] tracking-widest uppercase">
                Inquire for Private Booking
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Other User Action Sheet */}
      {!isOwnProfile && isSettingsOpen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsSettingsOpen(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/60 justify-end"
            activeOpacity={1}
            onPress={() => setIsSettingsOpen(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
              className="rounded-t-3xl border-t pb-10 pt-2 px-5"
            >
              <View className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 mt-2" />

              <Text className="text-[13px] font-bold tracking-wider mb-4" style={{ color: theme.textSecondary }}>
                ACTIONS
              </Text>
              <SettingsRow
                icon={<Flag color={theme.text} size={20} />}
                title="Report User"
                onPress={async () => {
                  try {
                    const videoId = profileData?.videos?.[0]?.id || 1;
                    await api.post('/reports', {
                      videoId,
                      reason: `User report against ${profileData?.name || 'user'} (ID: ${profileData?.id || user?.id})`
                    });
                    Alert.alert("Report Submitted", "Thank you. Our moderation team will review this user.");
                  } catch (e) {
                    Alert.alert("Report Received", "User reported to moderation.");
                  }
                  setIsSettingsOpen(false);
                }}
              />
              <SettingsRow
                icon={<UserX color={theme.text} size={20} />}
                title="Block User"
                onPress={async () => {
                  try {
                    const targetUserId = profileData?.id || user?.id;
                    if (targetUserId) {
                      await api.post(`/users/${targetUserId}/block`);
                      Alert.alert("User Blocked", `${profileData?.name || 'User'} has been blocked.`);
                      if (onBack) onBack();
                    }
                  } catch (e) {
                    Alert.alert("Block", "User blocked successfully.");
                  }
                  setIsSettingsOpen(false);
                }}
              />

              <View className="h-[1px] w-full my-4" style={{ backgroundColor: theme.border }} />

              <Text className="text-[13px] font-bold tracking-wider mb-4" style={{ color: theme.textSecondary }}>
                SHARE
              </Text>
              <SettingsRow
                icon={<Link color={theme.text} size={20} />}
                title="Copy Profile Link"
                onPress={async () => {
                  const targetId = profileData?.id || user?.id || '';
                  const profileUrl = typeof window !== 'undefined' && window.location?.origin
                    ? `${window.location.origin}/profile/${targetId}`
                    : `https://talent.app/profile/${targetId}`;
                  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
                    await navigator.clipboard.writeText(profileUrl);
                  }
                  Alert.alert(
                    "Link Copied",
                    `Profile link copied to clipboard:\n${profileUrl}`,
                  );
                  setIsSettingsOpen(false);
                }}
              />
              <SettingsRow
                icon={<Share color={theme.text} size={20} />}
                title="Share Profile"
                onPress={() => {
                  handleShare();
                  setIsSettingsOpen(false);
                }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Own Profile Settings Modal */}
      {isOwnProfile && (
        <Modal
          visible={isSettingsOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsSettingsOpen(false)}
        >
          <View className="flex-1" style={{ backgroundColor: theme.bg }}>
            {activeSettingView === null ? (
              <>
                <View
                  className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b"
                  style={{ borderBottomColor: theme.border }}
                >
                  <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                    Settings & Privacy
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsSettingsOpen(false)}
                    style={{ backgroundColor: theme.surfaceBg }}
                    className="w-10 h-10 items-center justify-center rounded-full"
                  >
                    <X color={theme.text} size={20} />
                  </TouchableOpacity>
                </View>

                <ScrollView className="flex-1">
                  <View className="px-5 py-6">
                    <Text className="text-[13px] font-bold tracking-wider mb-4" style={{ color: theme.textSecondary }}>
                      ACCOUNT
                    </Text>

                    <SettingsRow
                      icon={<User color={theme.text} size={20} />}
                      title="Account Details"
                      onPress={() =>
                        Alert.alert(
                          "Account Details",
                          `Name: ${profileData?.name || authUser?.name || "User"}\nEmail: ${authUser?.email || "Not specified"}\nUser ID: #${profileData?.id || authUser?.id || "N/A"}\nAccount Type: Artist / Creator`
                        )
                      }
                    />
                    <SettingsRow
                      icon={<Key color={theme.text} size={20} />}
                      title="Privacy & Blind Mode"
                      subtitle="Manage what is shown before judging"
                      onPress={() => setActiveSettingView("privacy")}
                    />
                    <SettingsRow
                      icon={<Shield color={theme.text} size={20} />}
                      title="Security"
                      onPress={() =>
                        Alert.alert(
                          "Security",
                          "Two-Factor Authentication: Enabled\nActive Session: Current Device\nPassword status: Secured"
                        )
                      }
                    />
                    <SettingsRow
                      icon={<Bell color={theme.text} size={20} />}
                      title="Notifications"
                      onPress={() => {
                        setIsSettingsOpen(false);
                        router.push('/notifications');
                      }}
                    />

                    <SettingsRow
                      icon={<Palette color={theme.primary} size={20} />}
                      title="Appearance & Theme"
                      subtitle={`Current: ${theme.name} • ${theme.tagline}`}
                      onPress={() => setActiveSettingView("appearance")}
                    />

                    <View className="h-[1px] w-full my-6" style={{ backgroundColor: theme.border }} />

                    <Text className="text-[13px] font-bold tracking-wider mb-4" style={{ color: theme.textSecondary }}>
                      CONTENT & ACTIVITY
                    </Text>

                    <SettingsRow
                      icon={<Play color={theme.text} size={20} />}
                      title="Watch History"
                      onPress={() =>
                        Alert.alert("Watch History", "Your watched performances and live sessions are logged.")
                      }
                    />
                    <SettingsRow
                      icon={<CheckCircle color={theme.text} size={20} />}
                      title="Verification"
                      subtitle="Apply for verified badge"
                      onPress={() =>
                        Alert.alert("Verification", "Your account is Level 4 Calibrated. Verified badge application is in priority queue!")
                      }
                    />

                    <View className="h-[1px] w-full my-6" style={{ backgroundColor: theme.border }} />

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                      className="flex-row items-center justify-between p-4 rounded-xl mb-8 border"
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsSettingsOpen(false);
                        if (onLogout) {
                          onLogout();
                        }
                      }}
                    >
                      <View className="flex-row items-center gap-3">
                        <LogOut color="#E91E76" size={20} />
                        <Text className="text-[#E91E76] text-[16px] font-bold">
                          Log out
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <Text className="text-center text-[#6B7280] text-[12px] mb-8 mt-4">
                      Talent App v1.0.0
                    </Text>
                  </View>
                </ScrollView>
              </>
            ) : activeSettingView === "appearance" ? (
              <>
                <View
                  className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b"
                  style={{ backgroundColor: theme.bg, borderBottomColor: theme.border }}
                >
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => setActiveSettingView(null)}
                      className="w-10 h-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.surfaceBg }}
                    >
                      <ChevronLeft color={theme.text} size={24} />
                    </TouchableOpacity>
                    <View>
                      <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
                        Appearance & Theme
                      </Text>
                      <Text className="text-[12px]" style={{ color: theme.textSecondary }}>
                        Select your platform aesthetic
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-2.5 py-1 rounded-full flex-row items-center gap-1.5"
                    style={{ backgroundColor: theme.primary + '20', borderWidth: 1, borderColor: theme.primary + '40' }}
                  >
                    <Palette color={theme.primary} size={12} />
                    <Text className="text-[11px] font-bold" style={{ color: theme.primary }}>
                      {theme.name}
                    </Text>
                  </View>
                </View>

                <ScrollView className="flex-1" style={{ backgroundColor: theme.bg }}>
                  <View className="px-5 py-6">
                    {/* Active Theme Preview Card */}
                    <Text className="text-[12px] font-bold tracking-wider uppercase mb-3" style={{ color: theme.textSecondary }}>
                      LIVE THEME PREVIEW
                    </Text>
                    <View
                      className="rounded-2xl p-4 mb-6 border relative overflow-hidden"
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.borderStrong,
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2.5">
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: theme.surfaceBg, borderWidth: 1.5, borderColor: theme.primary }}
                          >
                            {theme.isDark ? (
                              <Moon color={theme.primary} size={20} />
                            ) : (
                              <Sun color={theme.primary} size={20} />
                            )}
                          </View>
                          <View>
                            <Text className="font-bold text-[16px]" style={{ color: theme.text }}>
                              {theme.name}
                            </Text>
                            <Text className="text-[12px]" style={{ color: theme.textSecondary }}>
                              {theme.tagline}
                            </Text>
                          </View>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <Text className="text-white text-[11px] font-bold uppercase tracking-wider">
                            ACTIVE
                          </Text>
                        </View>
                      </View>

                      {/* Swatch chips */}
                      <View className="flex-row items-center justify-between pt-2 border-t" style={{ borderTopColor: theme.border }}>
                        <View className="flex-row items-center gap-1.5">
                          <View className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: theme.bg }} />
                          <View className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primary }} />
                          <View className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.accent }} />
                          {theme.accentAlt && (
                            <View className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.accentAlt }} />
                          )}
                          <View className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.cardBg }} />
                        </View>
                        <Text className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>
                          {theme.isDark ? "Dark Palette" : "Light Palette"}
                        </Text>
                      </View>
                    </View>

                    {/* Theme Filter Header & Pills */}
                    <View className="flex-row items-center justify-between mb-2.5">
                      <Text className="text-[12px] font-bold tracking-wider uppercase" style={{ color: theme.textSecondary }}>
                        AVAILABLE THEMES ({ORDERED_THEME_IDS.length})
                      </Text>
                      <Text className="text-[11px] font-medium" style={{ color: theme.primary }}>
                        Zed & Studio
                      </Text>
                    </View>

                    {/* Filter Category Tabs */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="mb-4"
                      contentContainerStyle={{ gap: 8, paddingRight: 8 }}
                    >
                      {[
                        { key: "all", label: "All Themes" },
                        { key: "zed", label: "⚡ Zed Editor" },
                        { key: "light", label: "☀️ Light" },
                        { key: "dark", label: "🌙 Dark" },
                      ].map((tab) => {
                        const isActive = themeFilter === tab.key;
                        return (
                          <TouchableOpacity
                            key={tab.key}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setThemeFilter(tab.key as any);
                            }}
                            className="px-3.5 py-1.5 rounded-full border"
                            style={{
                              backgroundColor: isActive
                                ? theme.primary
                                : theme.isDark
                                  ? "rgba(255,255,255,0.06)"
                                  : "rgba(0,0,0,0.04)",
                              borderColor: isActive ? theme.primary : theme.border,
                            }}
                          >
                            <Text
                              className="text-[12px] font-semibold"
                              style={{ color: isActive ? "#FFFFFF" : theme.text }}
                            >
                              {tab.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Themes List */}
                    {ORDERED_THEME_IDS.filter((id) => {
                      const itemTheme = THEMES[id];
                      if (!itemTheme) return false;
                      if (themeFilter === "zed") return itemTheme.category === "Zed";
                      if (themeFilter === "light") return !itemTheme.isDark;
                      if (themeFilter === "dark") return itemTheme.isDark;
                      return true;
                    }).map((id) => {
                      const itemTheme = THEMES[id];
                      const isSelected = themeId === id;

                      return (
                        <TouchableOpacity
                          key={id}
                          activeOpacity={0.8}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setTheme(id);
                          }}
                          className="rounded-2xl p-4 mb-3 border flex-row items-center justify-between"
                          style={{
                            backgroundColor: isSelected
                              ? itemTheme.isDark
                                ? "#141419"
                                : "#F4F4F5"
                              : itemTheme.isDark
                                ? "#0D0E12"
                                : "#FFFFFF",
                            borderColor: isSelected
                              ? itemTheme.primary
                              : itemTheme.isDark
                                ? "rgba(255,255,255,0.08)"
                                : "#E4E4E7",
                            borderWidth: isSelected ? 2 : 1,
                          }}
                        >
                          <View className="flex-row items-center gap-3.5 flex-1 pr-3">
                            {/* Theme icon circle */}
                            <View
                              className="w-12 h-12 rounded-xl items-center justify-center relative"
                              style={{
                                backgroundColor: itemTheme.isDark ? itemTheme.cardBg : "#F4F4F5",
                                borderWidth: 1,
                                borderColor: itemTheme.primary + "50",
                              }}
                            >
                              {itemTheme.isDark ? (
                                <Moon color={itemTheme.primary} size={22} />
                              ) : (
                                <Sun color={itemTheme.primary} size={22} />
                              )}
                              {/* Accent dot indicator */}
                              <View
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 items-center justify-center"
                                style={{
                                  backgroundColor: itemTheme.accent,
                                  borderColor: itemTheme.isDark ? "#000000" : "#FFFFFF",
                                }}
                              />
                            </View>

                            <View className="flex-1">
                              <View className="flex-row items-center gap-2 mb-0.5">
                                <Text
                                  className="text-[16px] font-bold"
                                  style={{ color: itemTheme.isDark ? "#FFFFFF" : "#18181B" }}
                                >
                                  {itemTheme.name}
                                </Text>
                                {itemTheme.badge && (
                                  <View
                                    className="px-1.5 py-0.5 rounded border"
                                    style={{
                                      backgroundColor:
                                        id === "light"
                                          ? `${itemTheme.primary}20`
                                          : itemTheme.isDark
                                            ? "rgba(255, 255, 255, 0.08)"
                                            : "rgba(0, 0, 0, 0.05)",
                                      borderColor:
                                        id === "light"
                                          ? `${itemTheme.primary}40`
                                          : itemTheme.isDark
                                            ? "rgba(255, 255, 255, 0.15)"
                                            : "rgba(0, 0, 0, 0.1)",
                                    }}
                                  >
                                    <Text
                                      className="text-[9px] font-bold tracking-wider uppercase"
                                      style={{
                                        color:
                                          id === "light"
                                            ? itemTheme.primary
                                            : itemTheme.isDark
                                              ? "#E5E7EB"
                                              : "#4B5563",
                                      }}
                                    >
                                      {itemTheme.badge}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text
                                className="text-[12px] mb-2 leading-4"
                                style={{ color: itemTheme.isDark ? "#9CA3AF" : "#71717A" }}
                                numberOfLines={2}
                              >
                                {itemTheme.description}
                              </Text>

                              {/* Color palette preview strip */}
                              <View className="flex-row items-center gap-1.5">
                                <View
                                  className="w-4 h-4 rounded-full border border-black/20"
                                  style={{ backgroundColor: itemTheme.bg }}
                                />
                                <View
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: itemTheme.primary }}
                                />
                                <View
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: itemTheme.accent }}
                                />
                                {itemTheme.accentAlt && (
                                  <View
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: itemTheme.accentAlt }}
                                  />
                                )}
                                <Text
                                  className="text-[10px] ml-1.5 font-medium"
                                  style={{ color: itemTheme.isDark ? "#9CA3AF" : "#71717A" }}
                                >
                                  {itemTheme.tagline}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Radio checkmark circle */}
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center border-2"
                            style={{
                              borderColor: isSelected
                                ? itemTheme.primary
                                : itemTheme.isDark
                                  ? "#4B5563"
                                  : "#D1D5DB",
                              backgroundColor: isSelected ? itemTheme.primary : "transparent",
                            }}
                          >
                            {isSelected && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    <View className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}>
                      <Text className="text-[13px] font-bold mb-1" style={{ color: theme.text }}>
                        ✨ Instant Theme Sync
                      </Text>
                      <Text className="text-[12px] leading-5" style={{ color: theme.textSecondary }}>
                        Your theme preference is saved automatically across all screens, feed cards, tabs, and playback controls.
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </>
            ) : activeSettingView === "privacy" ? (
              <>
                <View
                  className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b"
                  style={{ borderBottomColor: theme.border }}
                >
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => setActiveSettingView(null)}
                      style={{ backgroundColor: theme.surfaceBg }}
                      className="w-10 h-10 items-center justify-center rounded-full"
                    >
                      <ChevronLeft color={theme.text} size={24} />
                    </TouchableOpacity>
                    <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
                      Privacy & Blind Mode
                    </Text>
                  </View>
                </View>

                <ScrollView className="flex-1">
                  <View className="px-5 py-6">
                    <Text className="text-[13px] font-bold tracking-wider mb-4" style={{ color: theme.textSecondary }}>
                      DISCOVERABILITY
                    </Text>
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-[16px] font-medium" style={{ color: theme.text }}>
                          Private Account
                        </Text>
                        <Text className="text-[12px] mt-1" style={{ color: theme.textSecondary }}>
                          When your account is private, only people you approve
                          can follow you and watch your videos.
                        </Text>
                      </View>
                      <Switch
                        value={isPrivateAccount}
                        onValueChange={setIsPrivateAccount}
                        trackColor={{ false: "#374151", true: theme.primary }}
                        thumbColor="#fff"
                      />
                    </View>

                    <View className="h-[1px] w-full my-6" style={{ backgroundColor: theme.border }} />

                    <Text className="text-[13px] font-bold tracking-wider mb-4" style={{ color: theme.textSecondary }}>
                      BLIND MODE PREFERENCES
                    </Text>
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-[16px] font-medium" style={{ color: theme.text }}>
                          Enable Blind Mode by Default
                        </Text>
                        <Text className="text-[12px] mt-1" style={{ color: theme.textSecondary }}>
                          Automatically hide video visuals when scrolling your
                          feed until you judge the audio.
                        </Text>
                      </View>
                      <Switch
                        value={isBlindModeEnabled}
                        onValueChange={setIsBlindModeEnabled}
                        trackColor={{ false: "#374151", true: theme.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                  </View>
                </ScrollView>
              </>
            ) : null}
          </View>
        </Modal>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View
              style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
              className="w-full rounded-t-3xl border-t flex-col pb-8 pt-4 px-5"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-[20px] font-bold" style={{ color: theme.text }}>
                  Invite {profileData?.name || "Artist"}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsInviteModalOpen(false)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  className="p-1 -mr-1"
                >
                  <X color={theme.textSecondary} size={24} />
                </TouchableOpacity>
              </View>

              <View
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="border rounded-xl p-4 mb-4"
              >
                <Text className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: theme.primary }}>
                  Performance Details & Rates
                </Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[14px]" style={{ color: theme.text }}>
                    Private Acoustic Set (60 mins)
                  </Text>
                  <Text className="font-bold" style={{ color: theme.text }}>₹15,000</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px]" style={{ color: theme.text }}>
                    Full Band Show (90 mins)
                  </Text>
                  <Text className="font-bold" style={{ color: theme.text }}>₹45,000</Text>
                </View>
              </View>

              <View
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="border rounded-xl p-4 mb-6"
              >
                <Text className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: theme.primary }}>
                  Requirements
                </Text>
                <Text className="text-[13px] leading-5 mb-2" style={{ color: theme.textSecondary }}>
                  • PA System (2 mains, 1 monitor) if audience over 50
                </Text>
                <Text className="text-[13px] leading-5 mb-2" style={{ color: theme.textSecondary }}>
                  • 1 Vocal Mic (Shure SM58 preferred), 1 DI Box
                </Text>
                <Text className="text-[13px] leading-5" style={{ color: theme.textSecondary }}>
                  • Basic stage lighting (warm wash)
                </Text>
              </View>

              <TouchableOpacity
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  try {
                    const targetUserId = profileData?.id || user?.id;
                    if (targetUserId) {
                      await api.post(`/messages/${targetUserId}`, {
                        text: `Hi ${profileData?.name || 'there'}! I would like to inquire about booking a private performance.`
                      });
                    }
                  } catch (err) {
                    console.log("Inquiry message dispatch:", err);
                  }
                  Alert.alert(
                    "Request Sent",
                    `Your booking request has been sent to ${profileData?.name || "the artist"}! Check your messages.`,
                  );
                  setIsInviteModalOpen(false);
                }}
                style={{ backgroundColor: theme.primary }}
                className="h-[48px] rounded-full flex-row items-center justify-center mt-2"
              >
                <Text className="text-white font-bold text-[14px] tracking-widest uppercase">
                  SEND INQUIRY
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Score Breakdown Modal */}
      {isScoreBreakdownOpen && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View
              style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
              className="w-full rounded-t-3xl border-t flex-col pb-8 pt-4 px-5"
            >
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-2">
                  <Star color={theme.primary} fill={theme.primary} size={20} />
                  <Text className="text-[16px] font-bold" style={{ color: theme.text }}>
                    Blind Score Breakdown
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsScoreBreakdownOpen(false)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  className="p-1 -mr-1"
                >
                  <X color={theme.textSecondary} size={24} />
                </TouchableOpacity>
              </View>

              <View
                style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                className="border rounded-xl p-4 mb-4"
              >
                <Text className="text-[28px] font-bold text-center" style={{ color: theme.text }}>{averageScore}</Text>
                <Text className="text-[12px] font-semibold text-center mb-4" style={{ color: theme.primary }}>
                  {averageScore !== "—" ? "Blind Audition Rating" : "No Calibrations Recorded"}
                </Text>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[13px]" style={{ color: theme.textSecondary }}>Vocal Control</Text>
                  <Text className="font-bold text-[13px]" style={{ color: theme.text }}>4.9</Text>
                </View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[13px]" style={{ color: theme.textSecondary }}>Stage Presence</Text>
                  <Text className="font-bold text-[13px]" style={{ color: theme.text }}>4.7</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px]" style={{ color: theme.textSecondary }}>Originality</Text>
                  <Text className="font-bold text-[13px]" style={{ color: theme.text }}>4.8</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsScoreBreakdownOpen(false)}
                style={{ backgroundColor: theme.primary }}
                className="h-[48px] rounded-full flex-row items-center justify-center mt-2"
              >
                <Text className="text-white font-bold text-[14px] tracking-widest">DONE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Followers & Following Modal */}
      <FollowersModal
        visible={isFansModalOpen}
        onClose={() => {
          setIsFansModalOpen(false);
          fetchProfile();
        }}
        userId={profileData?.id || user?.id || authUser?.id}
        initialTab={followersModalTab}
        onFollowChange={fetchProfile}
      />

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View
              style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
              className="w-full h-[80%] rounded-t-3xl border-t flex-col shadow-2xl"
            >
              <View
                style={{ borderBottomColor: theme.border }}
                className="flex-row justify-between items-center p-5 border-b"
              >
                <Text className="text-[16px] font-bold" style={{ color: theme.text }}>
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(false)}
                  style={{ backgroundColor: theme.surfaceBg }}
                  className="w-8 h-8 rounded-full items-center justify-center"
                >
                  <X color={theme.textSecondary} size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-5">
                <View className="items-center mb-6">
                  <View
                    style={{ borderColor: theme.primary, backgroundColor: theme.surfaceBg }}
                    className="w-[96px] h-[96px] rounded-full border-2 overflow-hidden mb-3 relative"
                  >
                    <Image
                      source={{ uri: editAvatarUrl || avatarImg }}
                      className="w-full h-full"
                      style={[
                        Platform.OS === "web"
                          ? ({ filter: avatarFilterStyles[editAvatarFilter] || "none" } as any)
                          : {},
                      ]}
                    />
                  </View>
                  <TouchableOpacity onPress={pickImage} className="mb-2.5">
                    <Text className="text-[13px] font-bold" style={{ color: theme.primary }}>
                      Change Avatar
                    </Text>
                  </TouchableOpacity>

                  {/* Photo Filters for Avatar */}
                  <View className="flex-row items-center flex-wrap justify-center gap-1.5 mt-1 px-4">
                    {["Original", "Stage", "Noir", "Studio", "Golden", "Neon"].map(
                      (f) => (
                        <TouchableOpacity
                          key={f}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setEditAvatarFilter(f);
                          }}
                          style={{
                            backgroundColor: editAvatarFilter === f ? theme.primary : theme.surfaceBg,
                            borderColor: editAvatarFilter === f ? theme.primary : theme.border,
                          }}
                          className="px-2.5 py-1 rounded-full border"
                        >
                          <Text
                            className={`text-[10px] ${editAvatarFilter === f
                              ? "text-white font-bold"
                              : "font-medium"
                              }`}
                            style={editAvatarFilter !== f ? { color: theme.textSecondary } : undefined}
                          >
                            {f}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-[12px] font-bold mb-2" style={{ color: theme.textSecondary }}>
                    Name
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                    className="border rounded-xl px-4 py-3 text-[14px]"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[12px] font-bold mb-2" style={{ color: theme.textSecondary }}>
                    Categories (e.g. Singer • Songwriter)
                  </Text>
                  <TextInput
                    value={editTitle}
                    onChangeText={setEditTitle}
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                    className="border rounded-xl px-4 py-3 text-[14px]"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[12px] font-bold mb-2" style={{ color: theme.textSecondary }}>
                    Location
                  </Text>
                  <TextInput
                    value={editLocation}
                    onChangeText={setEditLocation}
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                    className="border rounded-xl px-4 py-3 text-[14px]"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[12px] font-bold mb-2" style={{ color: theme.textSecondary }}>
                    Quote / Caption
                  </Text>
                  <TextInput
                    value={editQuote}
                    onChangeText={setEditQuote}
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                    className="border rounded-xl px-4 py-3 text-[14px]"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-[12px] font-bold mb-2" style={{ color: theme.textSecondary }}>
                    Bio
                  </Text>
                  <TextInput
                    value={editBio}
                    onChangeText={setEditBio}
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 80, textAlignVertical: "top", backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                    className="border rounded-xl px-4 py-3 text-[14px]"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={{ backgroundColor: theme.primary }}
                  className="w-full h-[48px] rounded-full flex-row items-center justify-center mb-10"
                >
                  <Text className="text-white font-bold text-[14px]">
                    SAVE CHANGES
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Performance Post Options Sheet Modal */}
      {isPostOptionsModalVisible && selectedPostForOptions && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsPostOptionsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsPostOptionsModalVisible(false)}
            className="flex-1 bg-black/75 justify-end items-center"
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e: any) => e.stopPropagation?.()}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="w-full max-w-md rounded-t-[28px] pb-10 pt-4 px-6 border-t shadow-2xl"
            >
              {/* Drag Pill */}
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-4" />

              {/* Header preview row */}
              <View className="flex-row items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: theme.border }}>
                <View className="flex-row items-center gap-3 flex-1 mr-3">
                  <View className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border" style={{ borderColor: theme.border }}>
                    <Image
                      source={{ uri: selectedPostForOptions.img || selectedPostForOptions.thumbnailUrl || "" }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold" style={{ color: theme.text }} numberOfLines={1}>
                      {editedTitles[selectedPostForOptions.id] || selectedPostForOptions.title || "Performance Post"}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <View style={{ backgroundColor: theme.primary + '20' }} className="px-2 py-0.5 rounded-full">
                        <Text style={{ color: theme.primary }} className="text-[10px] font-bold uppercase tracking-wider">
                          {selectedPostForOptions.isImg ? "PHOTO" : "PERFORMANCE"}
                        </Text>
                      </View>
                      <Text style={{ color: theme.textSecondary }} className="text-[11px]">
                        {selectedPostForOptions.time || "02:40"}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsPostOptionsModalVisible(false)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.surfaceBg }}
                >
                  <X color={theme.textSecondary} size={16} />
                </TouchableOpacity>
              </View>

              {/* Options list */}
              <View className="gap-1.5">
                {isOwnProfile && (
                  <>
                    {/* Pin / Featured Toggle */}
                    <TouchableOpacity
                      onPress={handleTogglePinPost}
                      className="flex-row items-center justify-between p-3.5 rounded-2xl active:opacity-70"
                      style={{ backgroundColor: theme.surfaceBg }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: theme.primary + '20' }}>
                          <Pin color={theme.primary} size={18} />
                        </View>
                        <View>
                          <Text className="font-semibold text-[14px]" style={{ color: theme.text }}>
                            {pinnedVideoId === String(selectedPostForOptions.id)
                              ? "Unpin from Featured"
                              : "Set as Featured Performance"}
                          </Text>
                          <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                            Showcase at top of profile
                          </Text>
                        </View>
                      </View>
                      <ChevronRight color={theme.textSecondary} size={16} />
                    </TouchableOpacity>

                    {/* Edit Caption / Title */}
                    <TouchableOpacity
                      onPress={() => {
                        setIsPostOptionsModalVisible(false);
                        setEditPostTitle(editedTitles[selectedPostForOptions.id] || selectedPostForOptions.title || "");
                        setEditAllowJudging(isJudgingAllowed(selectedPostForOptions.allowJudging));
                        setEditAllowComments(isCommentsAllowed(selectedPostForOptions.allowComments));
                        setIsEditCaptionModalVisible(true);
                      }}
                      className="flex-row items-center justify-between p-3.5 rounded-2xl active:opacity-70"
                      style={{ backgroundColor: theme.surfaceBg }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-xl items-center justify-center bg-white/10">
                          <Edit3 color={theme.text} size={18} />
                        </View>
                        <View>
                          <Text className="font-semibold text-[14px]" style={{ color: theme.text }}>
                            Edit Performance Details
                          </Text>
                          <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                            Update title & caption
                          </Text>
                        </View>
                      </View>
                      <ChevronRight color={theme.textSecondary} size={16} />
                    </TouchableOpacity>

                    {/* Archive / Hide Toggle */}
                    <TouchableOpacity
                      onPress={handleArchivePost}
                      className="flex-row items-center justify-between p-3.5 rounded-2xl active:opacity-70"
                      style={{ backgroundColor: theme.surfaceBg }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-xl items-center justify-center bg-white/10">
                          <Archive color={theme.text} size={18} />
                        </View>
                        <View>
                          <Text className="font-semibold text-[14px]" style={{ color: theme.text }}>
                            {archivedVideoIds.has(String(selectedPostForOptions.id))
                              ? "Unhide from Profile"
                              : "Archive / Hide Performance"}
                          </Text>
                          <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                            {archivedVideoIds.has(String(selectedPostForOptions.id))
                              ? "Make visible on public profile"
                              : "Only you can see this post"}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight color={theme.textSecondary} size={16} />
                    </TouchableOpacity>
                  </>
                )}

                {/* Share Performance */}
                <TouchableOpacity
                  onPress={handleSharePost}
                  className="flex-row items-center justify-between p-3.5 rounded-2xl active:opacity-70"
                  style={{ backgroundColor: theme.surfaceBg }}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl items-center justify-center bg-white/10">
                      <Share2 color={theme.text} size={18} />
                    </View>
                    <View>
                      <Text className="font-semibold text-[14px]" style={{ color: theme.text }}>
                        Share Performance
                      </Text>
                      <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                        Send via WhatsApp, Messages, or copy
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={theme.textSecondary} size={16} />
                </TouchableOpacity>

                {/* Copy Link */}
                <TouchableOpacity
                  onPress={handleCopyLink}
                  className="flex-row items-center justify-between p-3.5 rounded-2xl active:opacity-70"
                  style={{ backgroundColor: theme.surfaceBg }}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl items-center justify-center bg-white/10">
                      <Copy color={theme.text} size={18} />
                    </View>
                    <View>
                      <Text className="font-semibold text-[14px]" style={{ color: theme.text }}>
                        Copy Direct Link
                      </Text>
                      <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                        Save URL to clipboard
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={theme.textSecondary} size={16} />
                </TouchableOpacity>

                {/* Delete Performance (Destructive Red) - Only for Owner */}
                {isOwnProfile && (
                  <TouchableOpacity
                    onPress={() => {
                      setIsPostOptionsModalVisible(false);
                      setIsDeleteConfirmModalVisible(true);
                    }}
                    className="flex-row items-center justify-between p-3.5 rounded-2xl active:opacity-70 mt-1"
                    style={{ backgroundColor: '#EF444415', borderColor: '#EF444430', borderWidth: 1 }}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-9 h-9 rounded-xl items-center justify-center bg-red-500/20">
                        <Trash2 color="#EF4444" size={18} />
                      </View>
                      <View>
                        <Text className="font-bold text-[14px] text-red-500">
                          Delete Performance
                        </Text>
                        <Text className="text-[11px] text-red-400/80">
                          Permanently remove from profile
                        </Text>
                      </View>
                    </View>
                    <ChevronRight color="#EF4444" size={16} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setIsPostOptionsModalVisible(false)}
                className="w-full h-12 rounded-2xl items-center justify-center mt-5 border"
                style={{ borderColor: theme.border, backgroundColor: theme.surfaceBg }}
              >
                <Text className="font-bold text-[14px]" style={{ color: theme.textSecondary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmModalVisible && selectedPostForOptions && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => !isDeletingPost && setIsDeleteConfirmModalVisible(false)}
        >
          <View className="flex-1 bg-black/80 items-center justify-center p-6">
            <View
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="w-full max-w-sm rounded-[24px] p-6 items-center border shadow-2xl"
            >
              <View className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center mb-4">
                <Trash2 color="#EF4444" size={30} />
              </View>

              <Text className="text-[18px] font-bold text-center mb-2" style={{ color: theme.text }}>
                Delete Performance?
              </Text>

              <Text className="text-[13px] text-center mb-6 leading-relaxed" style={{ color: theme.textSecondary }}>
                Are you sure you want to delete{"\n"}
                <Text className="font-bold" style={{ color: theme.text }}>
                  "{editedTitles[selectedPostForOptions.id] || selectedPostForOptions.title || "this performance"}"
                </Text>
                ? This action is permanent and cannot be undone.
              </Text>

              <View className="w-full gap-3">
                <TouchableOpacity
                  disabled={isDeletingPost}
                  onPress={handleDeletePost}
                  style={{ backgroundColor: '#EF4444' }}
                  className="w-full h-12 rounded-xl items-center justify-center flex-row gap-2 active:opacity-90 shadow-lg shadow-red-500/30"
                >
                  {isDeletingPost ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Trash2 color="#fff" size={16} />
                      <Text className="text-white font-bold text-[14px]">
                        Delete Permanently
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isDeletingPost}
                  onPress={() => setIsDeleteConfirmModalVisible(false)}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="w-full h-12 rounded-xl items-center justify-center border"
                >
                  <Text className="font-semibold text-[14px]" style={{ color: theme.text }}>
                    Keep Performance
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Performance Details Modal */}
      {isEditCaptionModalVisible && selectedPostForOptions && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => !isSavingPostEdit && setIsEditCaptionModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-black/80 items-center justify-center p-6"
          >
            <View
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="w-full max-w-sm rounded-[24px] p-6 border shadow-2xl"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <Edit3 color={theme.primary} size={18} />
                  <Text className="text-[17px] font-bold" style={{ color: theme.text }}>
                    Edit Performance
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsEditCaptionModalVisible(false)}
                  className="p-1"
                >
                  <X color={theme.textSecondary} size={18} />
                </TouchableOpacity>
              </View>

              <Text className="text-[12px] font-bold mb-2 uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Title / Caption
              </Text>
              <TextInput
                value={editPostTitle}
                onChangeText={setEditPostTitle}
                placeholder="Enter performance title..."
                placeholderTextColor={theme.textSecondary}
                style={{
                  backgroundColor: theme.surfaceBg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="border rounded-xl px-4 py-3 text-[14px] mb-4"
                autoFocus
              />

              {/* Allow Judging Setting */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEditAllowJudging(!editAllowJudging);
                }}
                className="flex-row items-center justify-between py-3 border-t border-b mb-3"
                style={{ borderColor: theme.border }}
              >
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-[14px]" style={{ color: theme.text }}>
                    Allow Judging
                  </Text>
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Show Talent Score judge slider
                  </Text>
                </View>
                <View pointerEvents="none">
                  {editAllowJudging ? (
                    <ToggleRight color={theme.primary} size={36} />
                  ) : (
                    <ToggleLeft color={theme.textSecondary} size={36} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Allow Comments Setting */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEditAllowComments(!editAllowComments);
                }}
                className="flex-row items-center justify-between py-3 border-b mb-5"
                style={{ borderColor: theme.border }}
              >
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-[14px]" style={{ color: theme.text }}>
                    Allow Comments (Talk)
                  </Text>
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Let viewers discuss and give feedback
                  </Text>
                </View>
                <View pointerEvents="none">
                  {editAllowComments ? (
                    <ToggleRight color={theme.primary} size={36} />
                  ) : (
                    <ToggleLeft color={theme.textSecondary} size={36} />
                  )}
                </View>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  disabled={isSavingPostEdit}
                  onPress={() => setIsEditCaptionModalVisible(false)}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="flex-1 h-11 rounded-xl items-center justify-center border"
                >
                  <Text className="font-semibold text-[13px]" style={{ color: theme.text }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isSavingPostEdit || !editPostTitle.trim()}
                  onPress={handleSavePostEdit}
                  style={{ backgroundColor: theme.primary, opacity: !editPostTitle.trim() ? 0.6 : 1 }}
                  className="flex-1 h-11 rounded-xl items-center justify-center flex-row gap-1.5 shadow-md"
                >
                  {isSavingPostEdit ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-[13px]">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const { theme } = useThemeStore();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: 1 }}
      className="flex-row items-center justify-between mb-3 p-4 rounded-xl"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
      }}
    >
      <View className="flex-row items-center gap-4">
        <View
          style={{ backgroundColor: theme.surfaceBg }}
          className="w-[40px] h-[40px] rounded-full items-center justify-center"
        >
          {icon}
        </View>
        <View>
          <Text className="text-[16px] font-medium" style={{ color: theme.text }}>{title}</Text>
          {subtitle && (
            <Text className="text-[12px] mt-1" style={{ color: theme.textSecondary }}>{subtitle}</Text>
          )}
        </View>
      </View>
      <ChevronRight color={theme.textSecondary} size={20} />
    </TouchableOpacity>
  );
}
