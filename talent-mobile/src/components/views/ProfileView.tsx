import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import {
  Settings,
  Share,
  MoreHorizontal,
  CheckCircle,
  Check,
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
  Pause,
  Maximize2,
  Flag,
  UserX,
  Link,
  Users,
  BarChart2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Switch } from "react-native";
import { api } from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

const coverImg =
  "https://images.unsplash.com/photo-1493225457124-a1a2a4fa3e93?w=800&q=80";
const avatarImg =
  "https://images.unsplash.com/photo-1493225457124-a1a2a4fa3e93?w=200&q=80";

// Real dummy video URLs served from local backend uploads
const dummyVideos = [
  "http://localhost:3000/uploads/performer_1.mp4",
  "http://localhost:3000/uploads/performer_2.mp4",
  "http://localhost:3000/uploads/performer_3.mp4",
  "http://localhost:3000/uploads/performer_4.mp4",
  "http://localhost:3000/uploads/performer_5.mp4",
];

function VideoPlayerModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const videoRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, [url]);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black justify-center relative">
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

        {Platform.OS === "web" ? (
          <video
            ref={videoRef}
            src={url}
            controls
            autoPlay
            playsInline
            style={{ width: "100%", maxHeight: "80vh", outline: "none" }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-center px-4">
              Video playback on native requires expo-video or expo-av to be
              installed. Currently playing: {url}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

function ShowPreviewModal({
  show,
  onClose,
}: {
  show: any;
  onClose: () => void;
}) {
  const [isBooked, setIsBooked] = useState(false);
  const [visitors, setVisitors] = useState(show.bookings?.length || 0);

  useEffect(() => {
    // Basic check assuming user info is available or we just rely on backend response.
    // Ideally we pass user id here to check if already booked.
    setIsBooked(show.isBooked || false);
  }, [show]);

  const handleRSVP = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await api.post(`/shows/${show.id}/book`);
      if (res.data.isBooked) {
        setIsBooked(true);
        setVisitors((prev: number) => prev + 1);
        Alert.alert("RSVP Confirmed", "You are now visiting this show.");
      } else {
        setIsBooked(false);
        setVisitors((prev: number) => Math.max(0, prev - 1));
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
                    Alert.alert("Map", "Opening map...");
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
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1540039155733-d7696d4eb98e?w=200",
                  }}
                  className="w-[100px] h-[80px] rounded-xl opacity-80"
                />
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200",
                  }}
                  className="w-[100px] h-[80px] rounded-xl opacity-80"
                />
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
                    Aarav Nair Unamplified Living Room Set
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
              onPress={() => Alert.alert("Calendar", "Added to calendar.")}
              className="w-[48px] h-[48px] rounded-xl border border-white/20 items-center justify-center"
            >
              <Calendar color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert("Passes Reserved", "Your passes are secured!");
                onClose();
              }}
              activeOpacity={0.8}
              className="flex-1 bg-[#E91E76] h-[48px] rounded-full items-center justify-center"
            >
              <Text className="text-white font-bold text-[13px]">
                RESERVE PASSES (₹650 (RSVP PRIORITY))
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
}: {
  video: any;
  playingVideoId: string | null;
  setPlayingVideoId: (id: string | null) => void;
  onPass: () => void;
}) {
  const isPlaying = String(playingVideoId) === String(video.id);
  const [isKept, setIsKept] = useState(false);
  const [judgeScore, setJudgeScore] = useState<number | null>(null);
  const [isJudgingActive, setIsJudgingActive] = useState(false);
  const [tempScore, setTempScore] = useState<number>(5.0);
  const [judgedStatusText, setJudgedStatusText] = useState("");
  const videoRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = !isPlaying;
      if (isPlaying) {
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
      }
    }
  }, [isPlaying, video.videoUrl]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsJudgingActive(true);
        setTempScore(judgeScore || 5.0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const delta = -gestureState.dy / 20;
        let newScore = (judgeScore || 5.0) + delta;
        newScore = Math.max(1.0, Math.min(10.0, newScore));
        if (Math.floor(newScore) !== Math.floor(tempScore))
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        setTempScore(parseFloat(newScore.toFixed(1)));
      },
      onPanResponderRelease: () => {
        setIsJudgingActive(false);
        setJudgeScore(tempScore);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setJudgedStatusText(`${tempScore.toFixed(1)} ✓`);
        setTimeout(() => setJudgedStatusText("JUDGED"), 800);
      },
    }),
  ).current;

  return (
    <View className="mb-6">
      <View className="relative w-full aspect-[16/9.5] rounded-[16px] overflow-hidden border border-white/10 bg-[#100C09] mb-4">
        {Platform.OS === "web" ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            autoPlay
            loop
            muted={!isPlaying}
            playsInline
            poster={video.videoThumb}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-black">
            <Image
              source={{ uri: video.videoThumb }}
              className="w-full h-full opacity-90 absolute"
            />
          </View>
        )}

        <View className="absolute inset-x-0 top-0 h-16 bg-black/40" />
        <View className="absolute inset-x-0 bottom-0 h-16 bg-black/40" />

        <View className="absolute top-4 left-4 flex-row items-center gap-2">
          <Text className="text-[11px] font-bold tracking-[0.1em] text-white uppercase">
            PERFORMANCE
          </Text>
          <View className="w-1 h-1 rounded-full bg-white/60" />
          <Text className="text-white text-[11px] font-bold tracking-widest">
            {video.duration}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="absolute top-1/2 left-1/2 -ml-7 -mt-7 w-14 h-14 rounded-full bg-black/40 border border-white/80 items-center justify-center"
          onPress={() => setPlayingVideoId(isPlaying ? null : video.id)}
        >
          {isPlaying ? (
            <Pause color="#fff" fill="#fff" size={24} />
          ) : (
            <Play color="#fff" fill="#fff" size={24} className="ml-1" />
          )}
        </TouchableOpacity>

        <View className="absolute bottom-3 right-3 flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.8}
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
            <Text className="text-white text-[72px] font-bold tracking-tighter shadow-xl">
              {tempScore.toFixed(1)}
            </Text>
            <Text className="text-white/60 text-[12px] font-medium tracking-widest uppercase mt-4">
              Slide Up/Down to Adjust
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-[42px] h-[42px] rounded-full overflow-hidden border border-white/10">
            <Image source={{ uri: video.avatar }} className="w-full h-full" />
          </View>
          <View>
            <Text className="text-white text-[16px] font-bold mb-0.5">
              {video.author}
            </Text>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Text className="text-[#9CA3AF] text-[11px]">{video.role}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between px-1">
        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => setIsKept(!isKept)}
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
            onPress={() => {}}
            activeOpacity={0.7}
            className="items-center gap-1.5 min-w-[36px]"
          >
            <MessageCircle color="#fff" size={22} strokeWidth={1.5} />
            <Text className="text-[#9CA3AF] text-[9px] font-bold tracking-widest uppercase">
              TALK
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-col items-end pt-1">
          <View {...panResponder.panHandlers}>
            <View
              className={`rounded-full h-[32px] px-3.5 flex-row items-center gap-2 mb-2 ${judgeScore ? "bg-white/10 border border-[#E91E76]/50" : "bg-[#E91E76]"}`}
            >
              <Gauge color={judgeScore ? "#E91E76" : "#fff"} size={13} />
              <Text
                className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${judgeScore ? "text-[#E91E76]" : "text-white"}`}
              >
                {judgeScore ? judgedStatusText || "JUDGED" : "JUDGE"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="w-full h-[1px] bg-white/5 mt-5" />
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingView, setActiveSettingView] = useState<string | null>(
    null,
  );

  // App State
  const [activeTab, setActiveTab] = useState<
    "Performances" | "Shows" | "About"
  >("Performances");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeShowModal, setActiveShowModal] = useState<any | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isScoreBreakdownOpen, setIsScoreBreakdownOpen] = useState(false);
  const [isFansModalOpen, setIsFansModalOpen] = useState(false);
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

  const { user: authUser, checkAuth } = useAuthStore();
  const isOwnProfile = profileData?.id === authUser?.id;

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

      const res = await api.put("/profile/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        if (!user?.id && !authUser) {
          setIsLoading(false);
          return;
        }
        // If no user prop is passed, or if we want the current user profile
        const endpoint = user?.id ? `/profile/${user.id}` : "/profile/me";

        const response = await api.get(endpoint);
        setProfileData(response.data);
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
          } catch (e) {
            console.error("Failed to fetch shows:", e);
          }
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log("Unauthorized: Please log in to view profile");
        } else {
          console.error("Failed to fetch profile:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await RNShare.share({
        message:
          "Check out Aarav Nair on Talent App! https://talent.app/aaravnair",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBackTalent = async () => {
    try {
      const targetUserId = user?.id || 1; // Assuming we are viewing profile of user ID 1 if none passed
      if (!backed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Optimistic update
        setBacked(true);
        Alert.alert("Success!", "You are now backing this talent.");

        // Call backend to Follow
        await api.post(`/users/${targetUserId}/follow`);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (Platform.OS === "web") {
          if (
            window.confirm("Are you sure you want to stop backing this talent?")
          ) {
            setBacked(false);
            await api.post(`/users/${targetUserId}/follow`);
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
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  try {
                    await api.post(`/users/${targetUserId}/follow`);
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
    Alert.alert(actionName, `Action triggered for ${actionName}`);
  };

  const playVideo = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveVideoUrl(url);
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
            Aarav Nair's Performances
          </Text>
        </View>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 20,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
        >
          {profileData?.videos?.map((video: any, i: number) => (
            <ProfileFeedVideoCard
              key={video.id || i}
              video={{
                id: String(video.id || i),
                author: profileData?.name || "User",
                role: "Artist",
                avatar: profileData?.avatarUrl || avatarImg,
                videoThumb:
                  i === 0
                    ? "https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=800&q=80"
                    : "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300",
                duration: "0:58",
                videoUrl: video.url || dummyVideos[0],
              }}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
              onPass={() => {}}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050608]">
      {activeVideoUrl && (
        <VideoPlayerModal
          url={activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />
      )}

      {activeShowModal && (
        <ShowPreviewModal
          show={activeShowModal}
          onClose={() => setActiveShowModal(null)}
        />
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
      >
        {/* Top Actions */}
        <View className="flex-row justify-between items-center px-4 pt-14 pb-4 bg-[#050608]">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onBack) {
                onBack();
              } else if (Platform.OS === "web") {
                window.location.href = "/";
              } else {
                Alert.alert("Home", "Navigating to Home...");
              }
            }}
            className="w-10 h-10 items-center justify-center rounded-full border border-white/10 bg-black/40"
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleShare}
              className="w-10 h-10 items-center justify-center rounded-full bg-black/40 border border-white/10"
            >
              <Share color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsSettingsOpen(true)}
              className="w-10 h-10 items-center justify-center rounded-full bg-black/40 border border-white/10"
            >
              <MoreHorizontal color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar (Centered) */}
        <View className="items-center mt-2">
          <TouchableOpacity
            className="relative"
            onPress={() =>
              Alert.alert(
                "Online",
                "Aarav Nair is currently online & accepting bookings!",
              )
            }
          >
            <View className="w-[100px] h-[100px] rounded-full overflow-hidden border-[2px] border-[#E91E76] bg-[#1B1D24] shadow-lg">
              <Image
                source={{ uri: profileData?.avatarUrl || avatarImg }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            {/* Online Dot */}
            <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#00E575] border-[2.5px] border-[#050608]" />
          </TouchableOpacity>
        </View>

        {/* Profile Info & Bio */}
        <View className="px-4 pt-6 flex-col">
          <View className="items-center">
            {/* Name & Badge */}
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-[32px] font-serif font-bold text-white tracking-tight text-center">
                {profileData?.name || "Aarav Nair"}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Verified Stage Artist", "Level 4 Calibrated")
                }
                className="w-[22px] h-[22px] rounded-full bg-[#E91E76] items-center justify-center shadow-md"
              >
                <Check color="#fff" strokeWidth={3.5} size={13} />
              </TouchableOpacity>
            </View>

            {/* Role & Location */}
            <View className="flex-row items-center justify-center flex-wrap gap-2 mt-2">
              {profileData?.title ? (
                profileData.title.split("•").map((part: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <View className="w-1 h-1 rounded-full bg-[#6B7280]" />}
                    <Text className="text-[13px] text-[#D1D5DB] font-medium">
                      {part.trim()}
                    </Text>
                  </React.Fragment>
                ))
              ) : (
                <>
                  <Text className="text-[13px] text-[#D1D5DB]">Singer</Text>
                  <View className="w-1 h-1 rounded-full bg-[#6B7280]" />
                  <Text className="text-[13px] text-[#D1D5DB]">Songwriter</Text>
                </>
              )}
              <View className="w-1 h-1 rounded-full bg-[#6B7280]" />
              <View className="flex-row items-center justify-center gap-1">
                <MapPin color="#E91E76" fill="#E91E76" size={13} />
                <Text className="text-[13px] text-[#D1D5DB]">
                  {profileData?.location || "Bengaluru, India"}
                </Text>
              </View>
            </View>

            {/* Quote / Caption */}
            <Text className="text-white text-[15px] italic text-center mt-3 px-6 leading-6 opacity-90">
              "{profileData?.quote || "Music is the language of the spirit."}"
            </Text>
          </View>

          {/* Metrics 4-Grid Cards */}
          <View className="flex-row gap-2 mt-5">
            <TouchableOpacity 
              onPress={() => setIsScoreBreakdownOpen(true)}
              className="flex-1 p-3 rounded-2xl bg-[#11131B] border border-white/5 items-start min-h-[72px] justify-between">
              <Star color="#E91E76" fill="#E91E76" size={18} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold text-white">4.8</Text>
                <Text className="text-[11px] text-[#8E95A5] font-medium mt-0.5">
                  Blind Score
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Performances")}
              className="flex-1 p-3 rounded-2xl bg-[#11131B] border border-white/5 items-start min-h-[72px] justify-between"
            >
              <BarChart2 color="#D1D5DB" size={18} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold text-white">
                  {profileData?.videosCount?.toString() || "5"}
                </Text>
                <Text
                  className="text-[11px] text-[#8E95A5] font-medium mt-0.5"
                  numberOfLines={1}
                >
                  Performances
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Shows")}
              className="flex-1 p-3 rounded-2xl bg-[#11131B] border border-white/5 items-start min-h-[72px] justify-between"
            >
              <Calendar color="#E91E76" size={18} strokeWidth={2} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold text-white">2</Text>
                <Text className="text-[11px] text-[#8E95A5] font-medium mt-0.5">
                  Shows
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setIsFansModalOpen(true)}
              className="flex-1 p-3 rounded-2xl bg-[#11131B] border border-white/5 items-start min-h-[72px] justify-between">
              <Users color="#D1D5DB" size={18} strokeWidth={2} />
              <View className="mt-2">
                <Text className="text-[17px] font-bold text-white">
                  {profileData?.followers?.toString() || "12.4K"}
                </Text>
                <Text className="text-[11px] text-[#8E95A5] font-medium mt-0.5">
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
                className="flex-[1.8] bg-[#E91E76] h-[48px] rounded-full flex-row items-center justify-center gap-1.5 shadow-md"
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
                className={`flex-[1.6] h-[48px] rounded-full flex-row items-center justify-center gap-2 ${backed ? "bg-[#181A24] border border-[#E91E76]" : "bg-[#E91E76]"}`}
              >
                <Heart
                  color={backed ? "#E91E76" : "#fff"}
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
                onPress={() => Alert.alert("Message", "Opening direct messages...")}
                activeOpacity={0.8}
                className="flex-[1.8] h-[48px] rounded-full bg-transparent border border-white/10 items-center justify-center flex-row gap-2"
              >
                <MessageCircle color="#fff" size={16} strokeWidth={2} />
                <Text className="text-[12px] font-semibold tracking-[0.05em] text-white uppercase">
                  MESSAGE
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setIsSettingsOpen(true)}
              className="w-[48px] h-[48px] rounded-full bg-transparent border border-white/10 items-center justify-center"
            >
              <MoreHorizontal color="#fff" size={20} />
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
                onPress={() => Alert.alert("Search Tag", `Searching for talents with ${tag}`)}
                className="px-4 py-2 rounded-full bg-[#11131B] border border-white/10 items-center justify-center"
              >
                <Text className="text-[#D1D5DB] text-[12px] font-medium">
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity className="px-4 py-2 rounded-full bg-transparent border border-white/10 flex-row items-center gap-1">
              <Plus color="#9CA3AF" size={14} />
              <Text className="text-[#9CA3AF] text-[12px] font-medium">
                Add tag
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-white/10 mb-6 px-4 justify-between">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("Performances");
            }}
            className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab !== "Performances" ? "opacity-60" : ""}`}
          >
            <View className={`flex-row items-center gap-2 pb-1 ${activeTab === "Performances" ? "border-b-[3px] border-[#E91E76] shadow-[0_0_10px_rgba(233,30,118,0.5)]" : ""}`}>
              <Play
                color={activeTab === "Performances" ? "#E91E76" : "#9CA3AF"}
                fill={activeTab === "Performances" ? "#E91E76" : "transparent"}
                size={14}
              />
              <Text
                className={`font-semibold text-[13px] ${activeTab === "Performances" ? "text-[#E91E76]" : "text-[#9CA3AF]"}`}
              >
                Performances
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
            <View className={`flex-row items-center gap-2 pb-1 ${activeTab === "Shows" ? "border-b-[3px] border-[#E91E76] shadow-[0_0_10px_rgba(233,30,118,0.5)]" : ""}`}>
              <Calendar
                color={activeTab === "Shows" ? "#E91E76" : "#9CA3AF"}
                size={14}
              />
              <Text
                className={`font-semibold text-[13px] ${activeTab === "Shows" ? "text-[#E91E76]" : "text-[#9CA3AF]"}`}
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
            <View className={`flex-row items-center gap-2 pb-1 ${activeTab === "About" ? "border-b-[3px] border-[#E91E76] shadow-[0_0_10px_rgba(233,30,118,0.5)]" : ""}`}>
              <User
                color={activeTab === "About" ? "#E91E76" : "#9CA3AF"}
                size={14}
              />
              <Text
                className={`font-semibold text-[13px] ${activeTab === "About" ? "text-[#E91E76]" : "text-[#9CA3AF]"}`}
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
                <Text className="text-white text-[18px] font-bold tracking-tight">
                  Featured Performance
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="border border-[#E91E76] px-3 py-1 rounded-full flex-row items-center justify-center bg-[#E91E76]/10">
                    <Text className="text-[#E91E76] text-[10px] font-bold tracking-wider uppercase">
                      Live View
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-[#E91E76] px-3 py-1 rounded-full flex-row items-center justify-center gap-1">
                    <Plus color="#fff" size={12} />
                    <Text className="text-white text-[11px] font-bold">
                      Add Video
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {(() => {
                const featuredVideoUrl = (profileData?.videos && profileData.videos.length > 0)
                  ? profileData.videos[0].url
                  : dummyVideos[0];
                const featuredTitle = (profileData?.videos && profileData.videos.length > 0)
                  ? profileData.videos[0].title
                  : "Acoustic Sunset Sessions";

                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => playVideo(featuredVideoUrl)}
                    className="w-full aspect-[4/3] rounded-[24px] overflow-hidden relative border border-white/5 bg-[#12141A]"
                  >
                    {Platform.OS === "web" ? (
                      <video
                        src={featuredVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=800&q=80"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: "https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=800&q=80",
                        }}
                        className="w-full h-full opacity-80"
                      />
                    )}
                    <View className="absolute inset-0 bg-black/40" />

                    {/* Featured Badge */}
                    <View className="absolute top-4 left-4 bg-[#E91E76] px-3 py-1.5 rounded-md flex-row items-center gap-1.5 shadow-sm">
                      <Star color="#fff" fill="#fff" size={12} />
                      <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
                        FEATURED • TAP TO PLAY FULL
                      </Text>
                    </View>

                    {/* Play Button */}
                    <View className="absolute top-[50%] left-0 right-0 items-center justify-center -translate-y-1/2">
                      <View className="w-16 h-16 rounded-full border border-white bg-black/30 items-center justify-center">
                        <Play
                          color="#fff"
                          fill="#fff"
                          size={24}
                          style={{ marginLeft: 4 }}
                        />
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
                            Acoustic Folk • 3.2M views •{" "}
                          </Text>
                          <Text className="text-[#E91E76] text-[13px]">
                            Tap to Watch
                          </Text>
                        </View>
                        <View className="bg-transparent border border-white/20 px-2.5 py-1 rounded-md">
                          <Text className="text-white text-[11px] font-medium tracking-wide">
                            03:24
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
                  <Text className="text-white text-[18px] font-bold">
                    Performances
                  </Text>
                  <Text className="text-[#9CA3AF] text-[14px]">(5)</Text>
                </View>
                <TouchableOpacity onPress={() => {}}>
                  <Text className="text-[#E91E76] text-[13px] font-medium">
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
                {[
                  {
                    title: "Monsoon Motion",
                    time: "03:24",
                    img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
                    videoUrl: dummyVideos[1],
                  },
                  {
                    title: "City Lights",
                    time: "02:48",
                    img: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300",
                    videoUrl: dummyVideos[2],
                  },
                  {
                    title: "Falling Again",
                    time: "03:10",
                    img: "https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=300",
                    videoUrl: dummyVideos[3],
                  },
                  {
                    title: "Studio Pulse",
                    time: "01:54",
                    img: "https://images.unsplash.com/photo-1516280440502-a2fc9977823b?w=300",
                    videoUrl: dummyVideos[4],
                  },
                ].map((perf, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => playVideo(perf.videoUrl)}
                    activeOpacity={0.8}
                    className={`w-[140px] h-[190px] rounded-[16px] overflow-hidden relative ${i === 0 ? "border-2 border-[#E91E76]" : "border border-white/10"}`}
                  >
                    {Platform.OS === "web" ? (
                      <video
                        src={perf.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={perf.img}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Image
                        source={{ uri: perf.img }}
                        className="w-full h-full opacity-80"
                      />
                    )}
                    <View className="absolute inset-0 bg-black/40" />
                    <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
                      <View>
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
                      <View className="w-7 h-7 rounded-full border border-white items-center justify-center bg-transparent">
                        <Play
                          color="#fff"
                          size={12}
                          fill="#fff"
                          style={{ marginLeft: 2 }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Upcoming Shows in Performances Tab */}
            <View className="mb-8">
              <View className="px-5 flex-row justify-between items-center mb-4">
                <Text className="text-white text-[18px] font-bold">
                  Upcoming Shows
                </Text>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab("Shows");
                  }}
                >
                  <Text className="text-[#9CA3AF] text-[12px]">View all</Text>
                  <ChevronRight color="#9CA3AF" size={14} />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pl-5"
                contentContainerStyle={{ paddingRight: 40, gap: 12 }}
              >
                {[
                  {
                    id: 1,
                    date: "2024-10-24",
                    title: "Live at The Next Stage",
                    location: "Bengaluru, India • ₹799",
                    visiting: 149,
                    isVisiting: true,
                    image:
                      "https://images.unsplash.com/photo-1540039155733-d7696d4eb98e?w=100",
                  },
                  {
                    id: 2,
                    date: "2024-11-16",
                    title: "Sofar Sounds",
                    location: "Bengaluru, India",
                    visiting: 86,
                    isVisiting: false,
                    image:
                      "https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=100",
                  },
                ].map((show, i) => {
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
                      className="w-[300px] bg-[#12141A] border border-white/5 rounded-2xl flex-col overflow-hidden"
                    >
                      <View className="p-4 flex-row items-center gap-4">
                        <View className="items-center w-[48px] h-[52px] border border-white/10 rounded-xl justify-center bg-[#1A1C23]">
                          <Text className="text-white font-bold text-[18px] leading-5">
                            {dateM}
                          </Text>
                          <Text className="text-[#E91E76] text-[10px] font-bold">
                            {dateD}
                          </Text>
                        </View>
                        <View className="w-14 h-14 rounded-xl overflow-hidden bg-[#1A1512]">
                          {show.image ? (
                            <Image
                              source={{ uri: show.image }}
                              className="w-full h-full opacity-80"
                            />
                          ) : null}
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-white font-bold text-[15px] mb-1"
                            numberOfLines={1}
                          >
                            {show.title}
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <MapPin color="#E91E76" size={12} />
                            <Text
                              className="text-[#9CA3AF] text-[12px]"
                              numberOfLines={1}
                            >
                              {show.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="px-4 py-3 border-t border-white/5 flex-row items-center justify-between bg-white/[0.02]">
                        <View className="flex-row items-center gap-1.5">
                          <User color="#E91E76" size={14} />
                          <Text className="text-[#9CA3AF] text-[12px]">
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
                          <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                            <Text className="text-white text-[11px] font-bold">
                              RSVP
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {activeTab === "Shows" && (
          <View className="mb-8">
            <View className="px-5 flex-row justify-between items-center mb-4">
              <Text className="text-white text-[18px] font-bold">
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
                      className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-4">
                        <View className="items-center w-[40px]">
                          <Text className="text-white font-bold text-[18px]">
                            {dateM}
                          </Text>
                          <Text className="text-[#9CA3AF] text-[10px]">
                            {dateD}
                          </Text>
                        </View>
                        <View className="w-12 h-12 rounded-lg overflow-hidden bg-[#1A1512]">
                          {show.image ? (
                            <Image
                              source={{ uri: show.image }}
                              className="w-full h-full opacity-80"
                            />
                          ) : null}
                        </View>
                        <View>
                          <Text className="text-white font-bold text-[14px] mb-1">
                            {show.title}
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <MapPin color="#9CA3AF" size={10} />
                            <Text className="text-[#9CA3AF] text-[11px]">
                              {show.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <ChevronRight color="#9CA3AF" size={16} />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="items-center justify-center p-8 border border-white/5 bg-[#12141A] rounded-[24px]">
                  <Calendar color="#4B5563" size={48} className="mb-4" />
                  <Text className="text-white font-bold text-[18px] text-center mb-2">
                    No upcoming shows
                  </Text>
                  <Text className="text-[#9CA3AF] text-[13px] text-center">
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
            <View className="bg-[#0F1115] border border-white/5 rounded-xl p-5 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <User color="#E91E76" size={18} />
                <Text className="text-white text-[13px] font-bold tracking-widest uppercase">
                  Artist Bio
                </Text>
              </View>
              <Text className="text-[#D1D5DB] text-[14px] leading-6">
                {profileData?.bio || "No artist bio added yet. Tap Edit Profile to add your story."}
              </Text>
            </View>

            {/* Instruments & Craft */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleAction("Inspect Craft")}
              className="bg-[#0F1115] border border-white/5 rounded-xl p-5 mb-4"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Music color="#E91E76" size={18} />
                <Text className="text-white text-[13px] font-bold tracking-widest uppercase">
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
                    className="bg-white/5 border border-white/10 px-3 py-2 rounded-full"
                  >
                    <Text className="text-[#D1D5DB] text-[13px]">{item}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Streaming & Socials */}
            <View className="bg-[#0F1115] border border-white/5 rounded-xl p-5 mb-6">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-white text-[13px] font-bold tracking-widest uppercase">
                  Streaming & Socials
                </Text>
              </View>

              <View className="gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAction("Open Spotify")}
                  className="flex-row items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4"
                >
                  <Text className="text-[#D1D5DB] text-[14px]">
                    Spotify • 184K Monthly Listeners
                  </Text>
                  <ExternalLink color="#9CA3AF" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAction("Open YouTube")}
                  className="flex-row items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4"
                >
                  <Text className="text-[#D1D5DB] text-[14px]">
                    YouTube • 92K Subscribers
                  </Text>
                  <ExternalLink color="#9CA3AF" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAction("Open Instagram")}
                  className="flex-row items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4"
                >
                  <Text className="text-[#D1D5DB] text-[14px]">
                    Instagram • @aaravnair
                  </Text>
                  <ExternalLink color="#9CA3AF" size={16} />
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
              className="bg-[#12141A] rounded-t-3xl border-t border-white/10 pb-10 pt-2 px-5"
            >
              <View className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 mt-2" />

              <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">
                ACTIONS
              </Text>
              <SettingsRow
                icon={<Flag color="#fff" size={20} />}
                title="Report User"
                onPress={() => {
                  Alert.alert("Report", "User reported.");
                  setIsSettingsOpen(false);
                }}
              />
              <SettingsRow
                icon={<UserX color="#fff" size={20} />}
                title="Block User"
                onPress={() => {
                  Alert.alert("Block", "User blocked.");
                  setIsSettingsOpen(false);
                }}
              />

              <View className="h-[1px] w-full bg-white/10 my-4" />

              <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">
                SHARE
              </Text>
              <SettingsRow
                icon={<Link color="#fff" size={20} />}
                title="Copy Profile Link"
                onPress={() => {
                  Alert.alert(
                    "Link Copied",
                    "Profile link copied to clipboard.",
                  );
                  setIsSettingsOpen(false);
                }}
              />
              <SettingsRow
                icon={<Share color="#fff" size={20} />}
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
          <View className="flex-1 bg-[#050608]">
            {activeSettingView === null ? (
              <>
                <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-white/10">
                  <Text className="text-white text-[20px] font-bold">
                    Settings & Privacy
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsSettingsOpen(false)}
                    className="w-10 h-10 items-center justify-center bg-white/5 rounded-full"
                  >
                    <X color="#fff" size={20} />
                  </TouchableOpacity>
                </View>

                <ScrollView className="flex-1">
                  <View className="px-5 py-6">
                    <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">
                      ACCOUNT
                    </Text>

                    <SettingsRow
                      icon={<User color="#fff" size={20} />}
                      title="Account Details"
                      onPress={() =>
                        Alert.alert("Account Details", "Available soon!")
                      }
                    />
                    <SettingsRow
                      icon={<Key color="#fff" size={20} />}
                      title="Privacy & Blind Mode"
                      subtitle="Manage what is shown before judging"
                      onPress={() => setActiveSettingView("privacy")}
                    />
                    <SettingsRow
                      icon={<Shield color="#fff" size={20} />}
                      title="Security"
                      onPress={() =>
                        Alert.alert(
                          "Security",
                          "Security settings are up to date.",
                        )
                      }
                    />
                    <SettingsRow
                      icon={<Bell color="#fff" size={20} />}
                      title="Notifications"
                      onPress={() =>
                        Alert.alert(
                          "Notifications",
                          "You have 3 new notifications",
                        )
                      }
                    />

                    <SettingsRow
                      icon={<User color="#fff" size={20} />}
                      title="Appearance"
                      subtitle="Customize app theme and colors"
                      onPress={() => setActiveSettingView("appearance")}
                    />

                    <View className="h-[1px] w-full bg-white/10 my-6" />

                    <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">
                      CONTENT & ACTIVITY
                    </Text>

                    <SettingsRow
                      icon={<Play color="#fff" size={20} />}
                      title="Watch History"
                      onPress={() =>
                        Alert.alert("Watch History", "Opening history...")
                      }
                    />
                    <SettingsRow
                      icon={<CheckCircle color="#fff" size={20} />}
                      title="Verification"
                      subtitle="Apply for verified badge"
                      onPress={() =>
                        Alert.alert("Verification", "Application submitted!")
                      }
                    />

                    <View className="h-[1px] w-full bg-white/10 my-6" />

                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="flex-row items-center justify-between bg-white/5 p-4 rounded-xl mb-8 border border-white/10"
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
                <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-white/10">
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => setActiveSettingView(null)}
                      className="w-10 h-10 items-center justify-center bg-white/5 rounded-full"
                    >
                      <ChevronLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white text-[18px] font-bold">
                      Appearance
                    </Text>
                  </View>
                </View>

                <ScrollView className="flex-1">
                  <View className="px-5 py-6">
                    <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">
                      THEME
                    </Text>
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-white text-[16px] font-medium">
                          Dark Mode
                        </Text>
                        <Text className="text-[#9CA3AF] text-[12px] mt-1">
                          Use a dark color scheme to reduce eye strain in
                          low-light environments.
                        </Text>
                      </View>
                      <Switch
                        value={true}
                        onValueChange={() => {
                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Warning,
                          );
                          Alert.alert(
                            "Notice",
                            "Light mode is coming soon! Our designers are currently creating the light palette.",
                          );
                        }}
                        trackColor={{ false: "#374151", true: "#E91E76" }}
                        thumbColor="#fff"
                      />
                    </View>
                  </View>
                </ScrollView>
              </>
            ) : activeSettingView === "privacy" ? (
              <>
                <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-white/10">
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => setActiveSettingView(null)}
                      className="w-10 h-10 items-center justify-center bg-white/5 rounded-full"
                    >
                      <ChevronLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white text-[18px] font-bold">
                      Privacy & Blind Mode
                    </Text>
                  </View>
                </View>

                <ScrollView className="flex-1">
                  <View className="px-5 py-6">
                    <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">
                      DISCOVERABILITY
                    </Text>
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-white text-[16px] font-medium">
                          Private Account
                        </Text>
                        <Text className="text-[#9CA3AF] text-[12px] mt-1">
                          When your account is private, only people you approve
                          can follow you and watch your videos.
                        </Text>
                      </View>
                      <Switch
                        value={isPrivateAccount}
                        onValueChange={setIsPrivateAccount}
                        trackColor={{ false: "#374151", true: "#E91E76" }}
                        thumbColor="#fff"
                      />
                    </View>

                    <View className="h-[1px] w-full bg-white/10 my-6" />

                    <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">
                      BLIND MODE PREFERENCES
                    </Text>
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-white text-[16px] font-medium">
                          Enable Blind Mode by Default
                        </Text>
                        <Text className="text-[#9CA3AF] text-[12px] mt-1">
                          Automatically hide video visuals when scrolling your
                          feed until you judge the audio.
                        </Text>
                      </View>
                      <Switch
                        value={isBlindModeEnabled}
                        onValueChange={setIsBlindModeEnabled}
                        trackColor={{ false: "#374151", true: "#E91E76" }}
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
            <View className="bg-[#12141A] w-full rounded-t-3xl border-t border-white/10 flex-col pb-8 pt-4 px-5">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-[20px] font-bold">
                  Invite Aarav Nair
                </Text>
                <TouchableOpacity onPress={() => setIsInviteModalOpen(false)}>
                  <X color="#9CA3AF" size={24} />
                </TouchableOpacity>
              </View>

              <View className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-2">
                  Performance Details & Rates
                </Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white text-[14px]">
                    Private Acoustic Set (60 mins)
                  </Text>
                  <Text className="text-white font-bold">₹15,000</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-[14px]">
                    Full Band Show (90 mins)
                  </Text>
                  <Text className="text-white font-bold">₹45,000</Text>
                </View>
              </View>

              <View className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-2">
                  Requirements
                </Text>
                <Text className="text-[#D1D5DB] text-[13px] leading-5 mb-2">
                  • PA System (2 mains, 1 monitor) if audience over 50
                </Text>
                <Text className="text-[#D1D5DB] text-[13px] leading-5 mb-2">
                  • 1 Vocal Mic (Shure SM58 preferred), 1 DI Box
                </Text>
                <Text className="text-[#D1D5DB] text-[13px] leading-5">
                  • Basic stage lighting (warm wash)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    "Request Sent",
                    `Your booking request has been sent to ${profileData?.name || "the artist"}!`,
                  );
                  setIsInviteModalOpen(false);
                }}
                className="bg-[#E91E76] h-[48px] rounded-full flex-row items-center justify-center mt-2"
              >
                <Text className="text-white font-bold text-[14px] tracking-widest">
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
            <View className="bg-[#12141A] w-full rounded-t-3xl border-t border-white/10 flex-col pb-8 pt-4 px-5">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-2">
                  <Star color="#E91E76" size={20} />
                  <Text className="text-white text-[16px] font-bold">
                    Blind Score Breakdown
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsScoreBreakdownOpen(false)}>
                  <X color="#9CA3AF" size={24} />
                </TouchableOpacity>
              </View>

              <View className="bg-[#0A0B10] border border-white/10 rounded-xl p-4 mb-4">
                <Text className="text-white text-[28px] font-bold text-center">4.8</Text>
                <Text className="text-[#E91E76] text-[12px] font-semibold text-center mb-4">Top 5% Artist</Text>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[#D1D5DB] text-[13px]">Vocal Control</Text>
                  <Text className="text-white font-bold text-[13px]">4.9</Text>
                </View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[#D1D5DB] text-[13px]">Stage Presence</Text>
                  <Text className="text-white font-bold text-[13px]">4.7</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#D1D5DB] text-[13px]">Originality</Text>
                  <Text className="text-white font-bold text-[13px]">4.8</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsScoreBreakdownOpen(false)}
                className="bg-[#E91E76] h-[48px] rounded-full flex-row items-center justify-center mt-2"
              >
                <Text className="text-white font-bold text-[14px] tracking-widest">DONE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Fans Modal */}
      {isFansModalOpen && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-[#12141A] w-full rounded-t-3xl border-t border-white/10 flex-col pb-8 pt-4 px-5">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-2">
                  <Users color="#E91E76" size={20} />
                  <Text className="text-white text-[16px] font-bold">
                    Backers & Community
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsFansModalOpen(false)}>
                  <X color="#9CA3AF" size={24} />
                </TouchableOpacity>
              </View>

              <View className="flex-col gap-2 mb-4">
                {[
                  { name: "Maya Krishnan", role: "Lead Patron • 14 Shows", color: "pink", icon: "MK" },
                  { name: "Arjun Menon", role: "Verified Stage Peer", color: "amber", icon: "AM" },
                  { name: "Bengaluru Live Club", role: "Curator", color: "blue", icon: "BL" }
                ].map((fan, index) => (
                  <View key={index} className="p-3 bg-[#0A0B10] border border-white/10 rounded-xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                        <Text className="text-white text-[12px] font-bold">{fan.icon}</Text>
                      </View>
                      <View>
                        <Text className="text-white text-[14px] font-semibold">{fan.name}</Text>
                        <Text className="text-[#9CA3AF] text-[12px]">{fan.role}</Text>
                      </View>
                    </View>
                    <Heart color="#E91E76" fill="#E91E76" size={16} />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setIsFansModalOpen(false);
                  handleBackTalent();
                }}
                className="bg-[#E91E76] h-[48px] rounded-full flex-row items-center justify-center mt-2"
              >
                <Text className="text-white font-bold text-[14px] tracking-widest uppercase">
                  {backed ? "You are Backing this Talent" : "Back Aarav Nair (+0.1K)"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-[#101217] w-full h-[80%] rounded-t-3xl border-t border-white/10 flex-col shadow-2xl">
              <View className="flex-row justify-between items-center p-5 border-b border-white/5">
                <Text className="text-white text-[16px] font-bold">
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(false)}
                  className="w-8 h-8 bg-white/5 rounded-full items-center justify-center"
                >
                  <X color="#9CA3AF" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-5">
                <View className="items-center mb-6">
                  <View className="w-[96px] h-[96px] rounded-full border-2 border-[#E91E76] overflow-hidden mb-3 relative bg-black/40">
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
                    <Text className="text-[#E91E76] text-[13px] font-bold">
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
                          className={`px-2.5 py-1 rounded-full border ${
                            editAvatarFilter === f
                              ? "bg-[#E91E76] border-[#E91E76]"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-medium ${
                              editAvatarFilter === f
                                ? "text-white font-bold"
                                : "text-white/70"
                            }`}
                          >
                            {f}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-[#9CA3AF] text-[12px] font-bold mb-2">
                    Name
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="bg-[#1A1D24] border border-white/10 rounded-xl text-white px-4 py-3 text-[14px]"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[#9CA3AF] text-[12px] font-bold mb-2">
                    Categories (e.g. Singer • Songwriter)
                  </Text>
                  <TextInput
                    value={editTitle}
                    onChangeText={setEditTitle}
                    className="bg-[#1A1D24] border border-white/10 rounded-xl text-white px-4 py-3 text-[14px]"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[#9CA3AF] text-[12px] font-bold mb-2">
                    Location
                  </Text>
                  <TextInput
                    value={editLocation}
                    onChangeText={setEditLocation}
                    className="bg-[#1A1D24] border border-white/10 rounded-xl text-white px-4 py-3 text-[14px]"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[#9CA3AF] text-[12px] font-bold mb-2">
                    Quote / Caption
                  </Text>
                  <TextInput
                    value={editQuote}
                    onChangeText={setEditQuote}
                    className="bg-[#1A1D24] border border-white/10 rounded-xl text-white px-4 py-3 text-[14px]"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-[#9CA3AF] text-[12px] font-bold mb-2">
                    Bio
                  </Text>
                  <TextInput
                    value={editBio}
                    onChangeText={setEditBio}
                    multiline
                    numberOfLines={3}
                    className="bg-[#1A1D24] border border-white/10 rounded-xl text-white px-4 py-3 text-[14px]"
                    style={{ minHeight: 80, textAlignVertical: "top" }}
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  className="w-full bg-[#E91E76] h-[48px] rounded-full flex-row items-center justify-center mb-10"
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
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center justify-between mb-6 bg-white/5 p-4 rounded-xl"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
      }}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-[40px] h-[40px] rounded-full bg-white/10 items-center justify-center">
          {icon}
        </View>
        <View>
          <Text className="text-white text-[16px] font-medium">{title}</Text>
          {subtitle && (
            <Text className="text-[#9CA3AF] text-[12px] mt-1">{subtitle}</Text>
          )}
        </View>
      </View>
      <ChevronRight color="#9CA3AF" size={20} />
    </TouchableOpacity>
  );
}
