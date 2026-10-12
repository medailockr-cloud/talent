import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  PanResponder,
  Animated,
  Alert,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import {
  X,
  Music,
  Flashlight,
  Repeat,
  Settings2,
  Sparkles,
  Clock,
  Image as ImageIcon,
  Image as CoverIcon,
  Check,
  ChevronLeft,
  MapPin,
  ToggleRight,
  ToggleLeft,
  Camera,
  Upload,
  Folder,
  Cloud,
  MoreHorizontal,
  MessageSquare,
  Eye,
  Globe,
  Zap,
  UploadCloud,
  CheckCircle2,
  FileVideo,
  Music2,
  Edit3,
  ImagePlus,
  ChevronRight,
  Scissors,
  Volume2,
  Type,
  BarChart2,
  Users,
  Briefcase,
  Settings,
  Play,
  Pause,
  MonitorPlay,
  Star,
  Aperture,
  Subtitles,
  SlidersHorizontal,
  Sun,
  RotateCcw,
  Palette,
  Contrast,
  Droplets,
  Flame,
  VolumeX,
  Plus,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useVideoPlayer, VideoView } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { api } from "../../utils/api";

// --- Types & Filter Configurations ---
export interface TalentFilter {
  id: string;
  name: string;
  category: "All" | "Popular" | "Stage" | "Mood" | "Film" | "B&W";
  badge?: string;
  cssFilter: (intensity: number) => string;
  overlayColor?: string;
  overlayOpacity?: number;
  secondaryOverlay?: string;
  previewBg: string;
  accentColor: string;
  description: string;
}

export const TALENT_FILTERS: TalentFilter[] = [
  {
    id: "original",
    name: "Original",
    category: "All",
    cssFilter: () => "none",
    previewBg: "#1F2937",
    accentColor: "#9CA3AF",
    description: "Raw unedited capture",
  },
  {
    id: "stage",
    name: "Stage",
    category: "Stage",
    badge: "POPULAR",
    cssFilter: (int) =>
      `contrast(${1 + 0.3 * int}) saturate(${1 + 0.45 * int}) brightness(${1 + 0.05 * int}) hue-rotate(${-8 * int}deg)`,
    overlayColor: "rgba(233, 30, 118, 0.16)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(251, 146, 60, 0.1)",
    previewBg: "#E91E76",
    accentColor: "#E91E76",
    description: "Concert stage glow & punchy mids",
  },
  {
    id: "studio",
    name: "Studio",
    category: "Popular",
    cssFilter: (int) =>
      `contrast(${1 + 0.22 * int}) brightness(${1 + 0.08 * int}) saturate(${1 + 0.18 * int})`,
    overlayColor: "rgba(14, 165, 233, 0.12)",
    overlayOpacity: 0.7,
    previewBg: "#0284C7",
    accentColor: "#38BDF8",
    description: "Crisp studio clarity & balanced exposure",
  },
  {
    id: "natural",
    name: "Natural",
    category: "Popular",
    cssFilter: (int) =>
      `brightness(${1 + 0.06 * int}) saturate(${1 + 0.12 * int}) contrast(${1 + 0.08 * int})`,
    overlayColor: "rgba(245, 158, 11, 0.10)",
    overlayOpacity: 0.6,
    previewBg: "#D97706",
    accentColor: "#FBBF24",
    description: "Golden hour glow and soft warm radiance",
  },
  {
    id: "bw",
    name: "Noir B&W",
    category: "B&W",
    cssFilter: (int) =>
      `grayscale(${1 * int}) contrast(${1 + 0.42 * int}) brightness(${1 - 0.06 * int})`,
    overlayColor: "rgba(17, 24, 39, 0.25)",
    overlayOpacity: 0.8,
    previewBg: "#111827",
    accentColor: "#F3F4F6",
    description: "High-contrast cinematic monochrome",
  },
  {
    id: "live",
    name: "Live Neon",
    category: "Stage",
    badge: "ELECTRIC",
    cssFilter: (int) =>
      `saturate(${1 + 0.65 * int}) contrast(${1 + 0.35 * int}) hue-rotate(${18 * int}deg)`,
    overlayColor: "rgba(168, 85, 247, 0.2)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(236, 72, 153, 0.15)",
    previewBg: "#9333EA",
    accentColor: "#C084FC",
    description: "Cyberpunk live arena lasers & violet neon",
  },
  {
    id: "lowlight",
    name: "Low Light",
    category: "Mood",
    cssFilter: (int) =>
      `brightness(${1 + 0.35 * int}) contrast(${1 + 0.18 * int}) saturate(${1 + 0.15 * int})`,
    overlayColor: "rgba(255, 255, 255, 0.12)",
    overlayOpacity: 0.6,
    previewBg: "#475569",
    accentColor: "#94A3B8",
    description: "Nightclub & dim room exposure booster",
  },
  {
    id: "vintage",
    name: "Vintage '92",
    category: "Film",
    cssFilter: (int) =>
      `sepia(${0.55 * int}) contrast(${1 + 0.18 * int}) brightness(${1 - 0.04 * int}) saturate(${1 + 0.2 * int})`,
    overlayColor: "rgba(180, 83, 9, 0.22)",
    overlayOpacity: 0.8,
    previewBg: "#B45309",
    accentColor: "#F59E0B",
    description: "35mm grain aesthetic & analogue warmth",
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    category: "Mood",
    cssFilter: (int) =>
      `hue-rotate(${135 * int}deg) saturate(${1 + 0.6 * int}) contrast(${1 + 0.3 * int})`,
    overlayColor: "rgba(244, 63, 94, 0.18)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(59, 130, 246, 0.18)",
    previewBg: "#E11D48",
    accentColor: "#FB7185",
    description: "Dual-tone hyper-contrast nightscape",
  },
  {
    id: "autofix",
    name: "Auto Fix",
    category: "Popular",
    badge: "AI",
    cssFilter: (int) =>
      `contrast(${1 + 0.22 * int}) brightness(${1 + 0.1 * int}) saturate(${1 + 0.22 * int})`,
    overlayColor: "rgba(233, 30, 118, 0.08)",
    overlayOpacity: 0.7,
    previewBg: "#E91E76",
    accentColor: "#F472B6",
    description: "Smart luminance & dynamic range balance",
  },
  {
    id: "emerald",
    name: "Emerald",
    category: "Film",
    cssFilter: (int) =>
      `hue-rotate(${30 * int}deg) saturate(${1 + 0.25 * int}) contrast(${1 + 0.25 * int})`,
    overlayColor: "rgba(16, 185, 129, 0.18)",
    overlayOpacity: 0.75,
    previewBg: "#059669",
    accentColor: "#34D399",
    description: "Indie festival teal & emerald cinematic tint",
  },
  {
    id: "sunset",
    name: "Sunset Dream",
    category: "Mood",
    cssFilter: (int) =>
      `sepia(${0.3 * int}) saturate(${1 + 0.45 * int}) brightness(${1 + 0.06 * int}) hue-rotate(${-15 * int}deg)`,
    overlayColor: "rgba(244, 63, 94, 0.18)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(251, 191, 36, 0.12)",
    previewBg: "#BE123C",
    accentColor: "#FDA4AF",
    description: "Radiant dusk horizon & magenta blush",
  },
];

export interface FineTuneOption {
  key: "brightness" | "contrast" | "saturation" | "warmth";
  label: string;
  icon: any;
  previewFilter: string;
}

export const FINE_TUNE_OPTIONS: FineTuneOption[] = [
  {
    key: "brightness",
    label: "Brightness",
    icon: Sun,
    previewFilter: "brightness(1.35)",
  },
  {
    key: "contrast",
    label: "Contrast",
    icon: Contrast,
    previewFilter: "contrast(1.45)",
  },
  {
    key: "saturation",
    label: "Saturation",
    icon: Droplets,
    previewFilter: "saturate(1.75)",
  },
  {
    key: "warmth",
    label: "Warmth",
    icon: Flame,
    previewFilter: "sepia(0.6) saturate(1.2)",
  },
];

export interface SoundTrack {
  id: string;
  name: string;
  artist: string;
  genre: string;
  duration: string;
  accent: string;
  uri?: string;
  isCustom?: boolean;
}

export const SOUND_TRACKS: SoundTrack[] = [
  {
    id: "none",
    name: "Original Only",
    artist: "Captured Mic Audio",
    genre: "Live Voice / Raw",
    duration: "Live",
    accent: "#6B7280",
  },
  {
    id: "track-1",
    name: "Midnight Echoes",
    artist: "Talent Beat Lab",
    genre: "Lo-Fi / Soul",
    duration: "02:18",
    accent: "#E91E76",
  },
  {
    id: "track-2",
    name: "Stage Horizon",
    artist: "Nova Strings",
    genre: "Acoustic / Live",
    duration: "01:54",
    accent: "#8B5CF6",
  },
  {
    id: "track-3",
    name: "Pulse & Spotlight",
    artist: "Metro Bass",
    genre: "Electronic / Trap",
    duration: "02:05",
    accent: "#38BDF8",
  },
  {
    id: "track-4",
    name: "Golden Hour Glow",
    artist: "Aura Ensemble",
    genre: "Chill / R&B",
    duration: "02:30",
    accent: "#F59E0B",
  },
  {
    id: "track-5",
    name: "Crescendo Rush",
    artist: "Cinematic Orchestra",
    genre: "Stage Drama",
    duration: "01:42",
    accent: "#10B981",
  },
];

type CreateStep =
  | "HOME"
  | "RECORD"
  | "UPLOAD"
  | "CHOOSE_TALENT"
  | "PREVIEW"
  | "SET_PURPOSE"
  | "DETAILS"
  | "SUMMARY"
  | "UPLOADING"
  | "SUCCESS";

export function CreateView({ onClose }: { onClose?: () => void }) {
  // --- Permissions ---
  const [facing, setFacing] = useState<"front" | "back">(
    Platform.OS === "web" ? "front" : "back",
  );
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // --- State ---
  const [step, setStep] = useState<CreateStep>("HOME");
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [cameraMode, setCameraMode] = useState<"video" | "photo">("video");
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Form Data
  const [category, setCategory] = useState("Dance");
  const [subCategory, setSubCategory] = useState("Contemporary");
  const [purpose, setPurpose] = useState("Get Discovered");
  const [title, setTitle] = useState("Midnight Movement");
  const [location, setLocation] = useState("Bengaluru, India");
  const [allowJudging, setAllowJudging] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [visibility, setVisibility] = useState("Public");

  // Upload progress simulation
  const [uploadProgress, setUploadProgress] = useState(0);

  // Editor State
  const [editMode, setEditMode] = useState<
    "none" | "trim" | "cover" | "sound" | "filters" | "caption"
  >("filters");
  const [activeFilter, setActiveFilter] = useState("Original");
  const [filterIntensity, setFilterIntensity] = useState(0.85); // 0.0 to 1.0
  const [activeFilterSubTab, setActiveFilterSubTab] = useState<"presets" | "adjust">("presets");
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>("All");
  const [isComparing, setIsComparing] = useState(false);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
  });
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [sliderWidth, setSliderWidth] = useState(0);

  const previewPlayer = useVideoPlayer(
    mediaType === "video" ? recordedVideoUri : null,
    (player) => {
      player.loop = true;
      player.muted = true; // Auto-play requires muted on web
      player.play();
    },
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (previewPlayer && mediaType === "video") {
        setCurrentTime(previewPlayer.currentTime);
        setDuration(previewPlayer.duration || 1);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [previewPlayer, mediaType]);

  const activeFilterConfig =
    TALENT_FILTERS.find((f) => f.name === activeFilter) || TALENT_FILTERS[0];

  const getEffectiveCssFilter = () => {
    if (isComparing) return "none";
    const baseFilter = activeFilterConfig.cssFilter(filterIntensity);

    const b = 1 + adjustments.brightness / 100;
    const c = 1 + adjustments.contrast / 100;
    const s = 1 + adjustments.saturation / 100;
    const w = adjustments.warmth;

    const adjustParts: string[] = [];
    if (b !== 1) adjustParts.push(`brightness(${b.toFixed(2)})`);
    if (c !== 1) adjustParts.push(`contrast(${c.toFixed(2)})`);
    if (s !== 1) adjustParts.push(`saturate(${s.toFixed(2)})`);
    if (w > 0) adjustParts.push(`sepia(${(w / 100).toFixed(2)})`);
    if (w < 0) adjustParts.push(`hue-rotate(${w}deg)`);

    if (baseFilter === "none" && adjustParts.length === 0) return "none";
    return [baseFilter !== "none" ? baseFilter : "", ...adjustParts]
      .filter(Boolean)
      .join(" ");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (sliderWidth > 0 && duration > 0) {
          const locX = evt.nativeEvent.locationX;
          const newTime = (locX / sliderWidth) * duration;
          if (previewPlayer) {
            previewPlayer.currentTime = newTime;
          }
        }
      },
      onPanResponderMove: (evt) => {
        if (sliderWidth > 0 && duration > 0) {
          let newX = evt.nativeEvent.locationX;
          if (newX < 0) newX = 0;
          if (newX > sliderWidth) newX = sliderWidth;
          const newTime = (newX / sliderWidth) * duration;
          if (previewPlayer) {
            previewPlayer.currentTime = newTime;
          }
        }
      },
    }),
  ).current;

  const [intensitySliderWidth, setIntensitySliderWidth] = useState(0);
  const intensitySliderWidthRef = useRef(0);

  const intensityPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const width = intensitySliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const val = Math.round((x / width) * 100) / 100;
          setFilterIntensity(val);
        }
      },
      onPanResponderMove: (evt) => {
        const width = intensitySliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const val = Math.round((x / width) * 100) / 100;
          setFilterIntensity(val);
        }
      },
    }),
  ).current;

  const [selectedFineTune, setSelectedFineTune] = useState<
    "brightness" | "contrast" | "saturation" | "warmth"
  >("brightness");
  const selectedFineTuneRef = useRef<
    "brightness" | "contrast" | "saturation" | "warmth"
  >("brightness");
  selectedFineTuneRef.current = selectedFineTune;

  const [fineTuneSliderWidth, setFineTuneSliderWidth] = useState(0);
  const fineTuneSliderWidthRef = useRef(0);

  const fineTunePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const width = fineTuneSliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const pct = x / width;
          const val = Math.round(pct * 100 - 50);
          setAdjustments((prev) => ({
            ...prev,
            [selectedFineTuneRef.current]: Math.max(-50, Math.min(50, val)),
          }));
        }
      },
      onPanResponderMove: (evt) => {
        const width = fineTuneSliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const pct = x / width;
          const val = Math.round(pct * 100 - 50);
          setAdjustments((prev) => ({
            ...prev,
            [selectedFineTuneRef.current]: Math.max(-50, Math.min(50, val)),
          }));
        }
      },
    }),
  ).current;

  // --- Sound Lab State ---
  const [selectedSoundTrack, setSelectedSoundTrack] = useState<string>("none");
  const [userSoundTracks, setUserSoundTracks] = useState<SoundTrack[]>([]);
  const allSoundTracks = useMemo(
    () => [...userSoundTracks, ...SOUND_TRACKS],
    [userSoundTracks],
  );

  const pickCustomAudio = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileName = file.name
          ? file.name.replace(/\.[^/.]+$/, "")
          : "My Custom Song";
        const newTrack: SoundTrack = {
          id: `custom-${Date.now()}`,
          name: fileName,
          artist: "Your Upload",
          genre: "User Music",
          duration: file.size
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : "Audio",
          accent: "#EC4899",
          uri: file.uri,
          isCustom: true,
        };

        setUserSoundTracks((prev) => [newTrack, ...prev]);
        setSelectedSoundTrack(newTrack.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.warn("Error picking custom audio:", error);
      Alert.alert("Audio Selection", "Unable to select audio file.");
    }
  };

  const removeCustomTrack = (trackId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserSoundTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (selectedSoundTrack === trackId) {
      setSelectedSoundTrack("none");
    }
  };

  const [originalAudioVolume, setOriginalAudioVolume] = useState<number>(100);
  const [musicVolume, setMusicVolume] = useState<number>(80);
  const [isOriginalMuted, setIsOriginalMuted] = useState<boolean>(false);
  const [activeAudioEffects, setActiveAudioEffects] = useState<string[]>([
    "enhance",
  ]);

  const [origVolSliderWidth, setOrigVolSliderWidth] = useState(0);
  const origVolSliderWidthRef = useRef(0);

  const origVolPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const width = origVolSliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const val = Math.round((x / width) * 150);
          setOriginalAudioVolume(val);
          if (val > 0) setIsOriginalMuted(false);
        }
      },
      onPanResponderMove: (evt) => {
        const width = origVolSliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const val = Math.round((x / width) * 150);
          setOriginalAudioVolume(val);
          if (val > 0) setIsOriginalMuted(false);
        }
      },
    }),
  ).current;

  const [musicVolSliderWidth, setMusicVolSliderWidth] = useState(0);
  const musicVolSliderWidthRef = useRef(0);

  const musicVolPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const width = musicVolSliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const val = Math.round((x / width) * 100);
          setMusicVolume(val);
        }
      },
      onPanResponderMove: (evt) => {
        const width = musicVolSliderWidthRef.current;
        if (width > 0) {
          const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
          const val = Math.round((x / width) * 100);
          setMusicVolume(val);
        }
      },
    }),
  ).current;

  // --- Captions & Subtitles State ---
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [captionText, setCaptionText] = useState<string>(
    "Step into the spotlight ✨",
  );
  const [captionStyle, setCaptionStyle] = useState<
    "neon" | "classic" | "yellow" | "minimal"
  >("neon");

  // Draggable caption position & PanResponder
  const captionPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDraggingCaption, setIsDraggingCaption] = useState(false);

  const captionPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDraggingCaption(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // @ts-ignore
        captionPan.setOffset({
          // @ts-ignore
          x: captionPan.x._value,
          // @ts-ignore
          y: captionPan.y._value,
        });
        captionPan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: captionPan.x, dy: captionPan.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: () => {
        setIsDraggingCaption(false);
        captionPan.flattenOffset();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    }),
  ).current;

  const resetCaptionPosition = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    captionPan.setOffset({ x: 0, y: 0 });
    captionPan.setValue({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (previewPlayer && mediaType === "video") {
      try {
        if (isOriginalMuted) {
          previewPlayer.muted = true;
        } else {
          previewPlayer.muted = false;
          previewPlayer.volume = Math.max(
            0,
            Math.min(1, originalAudioVolume / 100),
          );
        }
      } catch (e) {
        // Safe catch for browser audio autoplay restrictions
      }
    }
  }, [previewPlayer, isOriginalMuted, originalAudioVolume, mediaType]);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- Actions ---
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  async function toggleRecord() {
    if (!cameraRef.current) return;

    if (cameraMode === "photo") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.95,
        });
        if (photo && photo.uri) {
          setRecordedVideoUri(photo.uri);
          setMediaType("image");
          setStep("PREVIEW");
        }
      } catch (error) {
        console.error("Failed to take photo:", error);
      }
      return;
    }

    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } else {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
        if (video && video.uri) {
          setRecordedVideoUri(video.uri);
          setMediaType("video");
          setStep("PREVIEW");
        }
      } catch (error) {
        console.error("Failed to record video:", error);
        setIsRecording(false);
      }
    }
  }

  const handlePublish = async () => {
    setStep("UPLOADING");

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);

        // Execute real upload here
        submitToServer()
          .then(() => {
            setStep("SUCCESS");
          })
          .catch((err) => {
            console.error(err);
            setStep("SUMMARY"); // revert on error
          });
      }
    }, 300);
  };

  const submitToServer = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", captionText.trim() || "");
      if (selectedSoundTrack !== "none") {
        formData.append("soundtrack", selectedSoundTrack);
      }
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("purpose", purpose);
      formData.append("location", location);
      formData.append("allowJudging", String(allowJudging));
      formData.append("filter", activeFilter);

      if (recordedVideoUri) {
        const isImg = mediaType === "image";
        const filename = isImg ? "photo.jpg" : "video.mp4";
        const filetype = isImg ? "image/jpeg" : "video/mp4";

        if (Platform.OS === "web") {
          const res = await fetch(recordedVideoUri);
          const blob = await res.blob();
          formData.append("video", blob, filename);
          if (isImg) {
            formData.append("image", blob, filename);
          }
        } else {
          formData.append("video", {
            uri: recordedVideoUri,
            name: filename,
            type: filetype,
          } as any);
        }
      }

      console.log("Sending to server...");
      await api.post("/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRecordedVideoUri(result.assets[0].uri);
        setMediaType("video");
        setStep("PREVIEW");
      }
    } catch (error) {
      console.error("Failed to pick video:", error);
    }
  };

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRecordedVideoUri(result.assets[0].uri);
        setMediaType("image");
        setStep("PREVIEW");
      }
    } catch (error) {
      console.error("Failed to pick photo:", error);
    }
  };

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setRecordedVideoUri(asset.uri);
        const isImg =
          asset.type === "image" ||
          asset.mimeType?.startsWith("image/") ||
          /\.(jpg|jpeg|png|webp|gif)$/i.test(asset.uri);
        setMediaType(isImg ? "image" : "video");
        setStep("PREVIEW");
      }
    } catch (error) {
      console.error("Failed to pick media:", error);
    }
  };

  // --- Render Helpers ---
  const TopNav = ({
    title,
    onBack,
    rightEl,
  }: {
    title?: string;
    onBack: () => void;
    rightEl?: React.ReactNode;
  }) => (
    <View className="flex-row items-center justify-between px-5 mb-8">
      <TouchableOpacity onPress={onBack} className="p-1 -ml-1">
        <ChevronLeft color="#fff" size={28} />
      </TouchableOpacity>
      {title && (
        <Text className="text-white font-semibold text-lg">{title}</Text>
      )}
      <View className="min-w-[28px] items-end">{rightEl}</View>
    </View>
  );

  // --- Screens ---

  const renderHome = () => (
    <View className="flex-1 bg-[#050608] px-6 pt-16">
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-baseline">
          <Text className="font-bold text-[32px] tracking-tight text-white leading-none font-serif">
            talent
          </Text>
          <Text className="font-bold text-[32px] text-[#E91E76] leading-none ml-[1px] font-serif">
            .
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-white text-4xl font-serif mt-4 mb-2">Create</Text>
      <Text className="text-[#9CA3AF] text-lg mb-12">
        Show what you can do.
      </Text>

      <TouchableOpacity
        className="bg-[#E91E76] w-full rounded-2xl p-5 mb-4 flex-row items-center"
        onPress={() => {
          if (!camPermission?.granted) requestCamPermission();
          if (!micPermission?.granted) requestMicPermission();
          setStep("RECORD");
        }}
      >
        <View className="bg-white/20 p-3 rounded-full mr-4">
          <Camera color="#fff" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-1">
            Record Performance
          </Text>
          <Text className="text-white/80 text-sm">Start with your camera</Text>
        </View>
        <ChevronRight color="#fff" size={20} opacity={0.7} />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-[#1A1D24] border border-white/10 w-full rounded-2xl p-5 mb-4 flex-row items-center"
        onPress={() => setStep("UPLOAD")}
      >
        <View className="bg-white/10 p-3 rounded-full mr-4">
          <Upload color="#fff" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-1">
            Upload Performance
          </Text>
          <Text className="text-[#9CA3AF] text-sm">
            Choose from your device
          </Text>
        </View>
        <ChevronRight color="#fff" size={20} opacity={0.5} />
      </TouchableOpacity>

      <TouchableOpacity className="bg-[#1A1D24] border border-white/10 rounded-2xl p-4 flex-row items-center self-start px-6 mt-2">
        <Folder color="#9CA3AF" size={20} className="mr-3" />
        <Text className="text-white font-medium">Drafts • 2</Text>
        <ChevronRight color="#9CA3AF" size={16} className="ml-2" />
      </TouchableOpacity>
    </View>
  );

  const renderRecord = () => {
    if (!camPermission || !camPermission.granted) {
      return (
        <View className="flex-1 bg-black items-center justify-center">
          <Text className="text-white">Camera permission is required.</Text>
          <TouchableOpacity
            onPress={requestCamPermission}
            className="mt-4 bg-[#E91E76] px-4 py-2 rounded"
          >
            <Text className="text-white">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          className="flex-1 w-full h-full"
          facing={facing}
          mode="video"
        >
          <View className="pt-14 px-5 flex-row justify-between items-start z-10">
            <TouchableOpacity onPress={() => setStep("HOME")}>
              <X color="#fff" size={28} />
            </TouchableOpacity>

            <View className="flex-row gap-4 items-center">
              <TouchableOpacity>
                <Flashlight color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2">
                <Music color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="absolute right-4 top-40 items-center gap-6 z-10">
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="items-center"
            >
              <Repeat color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">
                Flip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Zap color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">
                Speed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Clock color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">
                Timer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Settings2 color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">
                Filters
              </Text>
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-0 inset-x-0 pb-12 pt-20 bg-gradient-to-t from-black via-black/50 to-transparent">
            {/* Camera Mode Toggle */}
            <View className="flex-row justify-center items-center gap-8 mb-6">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCameraMode("video");
                }}
                className="py-1"
              >
                <Text
                  className={`font-bold text-[14px] tracking-wider uppercase ${cameraMode === "video" ? "text-[#E91E76] border-b-2 border-[#E91E76] pb-0.5" : "text-white/60"}`}
                >
                  Video
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCameraMode("photo");
                }}
                className="py-1"
              >
                <Text
                  className={`font-bold text-[14px] tracking-wider uppercase ${cameraMode === "photo" ? "text-[#E91E76] border-b-2 border-[#E91E76] pb-0.5" : "text-white/60"}`}
                >
                  Photo
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center">
              <TouchableOpacity
                onPress={toggleRecord}
                className="items-center justify-center"
              >
                <View
                  className={`rounded-full border-[4px] items-center justify-center transition-all ${
                    cameraMode === "photo"
                      ? "border-white/80 w-[80px] h-[80px]"
                      : isRecording
                        ? "border-[#E91E76] w-[88px] h-[88px]"
                        : "border-white/50 w-[80px] h-[80px]"
                  }`}
                >
                  <View
                    className={`rounded-full ${
                      cameraMode === "photo"
                        ? "bg-white w-[64px] h-[64px]"
                        : isRecording
                          ? "bg-[#E91E76] w-[36px] h-[36px] rounded-md"
                          : "bg-[#E91E76] w-[64px] h-[64px]"
                    }`}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  };

  const renderUpload = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav title="Upload Performance" onBack={() => setStep("HOME")} />

      <View className="px-5 mt-2">
        <TouchableOpacity
          onPress={pickMedia}
          className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-[#E91E76]/50 bg-[#E91E76]/5 items-center justify-center mb-6"
        >
          <UploadCloud color="#E91E76" size={40} className="mb-3" />
          <Text className="text-white font-bold text-lg mb-1">
            Choose a Video or Image
          </Text>
          <Text className="text-[#9CA3AF] text-sm text-center px-4">
            Select high-res photos or videos up to 3 mins
          </Text>
          <Text className="text-[#E91E76] text-xs font-semibold mt-2">
            MP4, MOV, HEVC, JPG, PNG
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickMedia}
          className="flex-row justify-between items-center bg-[#1A1D24] p-4 rounded-2xl mb-2.5 border border-white/5"
        >
          <View className="flex-row items-center gap-3.5">
            <View className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center">
              <ImageIcon color="#fff" size={20} />
            </View>
            <View>
              <Text className="text-white font-medium text-[15px]">
                From Gallery (All Media)
              </Text>
              <Text className="text-[#9CA3AF] text-[11px]">
                Photos and Videos from your camera roll
              </Text>
            </View>
          </View>
          <ChevronRight color="#9CA3AF" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickVideo}
          className="flex-row justify-between items-center bg-[#1A1D24] p-4 rounded-2xl mb-2.5 border border-white/5"
        >
          <View className="flex-row items-center gap-3.5">
            <View className="w-10 h-10 rounded-xl bg-[#E91E76]/20 items-center justify-center">
              <FileVideo color="#E91E76" size={20} />
            </View>
            <View>
              <Text className="text-white font-medium text-[15px]">
                Videos Only
              </Text>
              <Text className="text-[#9CA3AF] text-[11px]">
                Select recorded performances or clips
              </Text>
            </View>
          </View>
          <ChevronRight color="#9CA3AF" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickPhoto}
          className="flex-row justify-between items-center bg-[#1A1D24] p-4 rounded-2xl mb-2.5 border border-white/5"
        >
          <View className="flex-row items-center gap-3.5">
            <View className="w-10 h-10 rounded-xl bg-cyan-500/20 items-center justify-center">
              <ImagePlus color="#38BDF8" size={20} />
            </View>
            <View>
              <Text className="text-white font-medium text-[15px]">
                Photos & Artwork
              </Text>
              <Text className="text-[#9CA3AF] text-[11px]">
                Stage stills, portraits, and performance photography
              </Text>
            </View>
          </View>
          <ChevronRight color="#9CA3AF" size={18} />
        </TouchableOpacity>

        <Text className="text-center text-[#9CA3AF] text-xs mt-6">
          Supported: MP4, MOV, HEVC{"\n"}Max size: 500 MB
        </Text>
      </View>
    </View>
  );

  const renderPreview = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav
        title={
          editMode === "none"
            ? "Preview & Edit"
            : editMode === "trim"
              ? "Trim Performance"
              : editMode === "filters"
                ? "Filters & Effects"
                : editMode === "cover"
                  ? "Cover & Poster"
                  : editMode === "sound"
                    ? "Audio & Sound"
                    : "Captions & Text"
        }
        onBack={() => {
          if (editMode !== "none") {
            setEditMode("none");
          } else {
            setRecordedVideoUri(null);
            setStep("RECORD");
          }
        }}
        rightEl={
          <TouchableOpacity
            onPress={() => setStep("CHOOSE_TALENT")}
            className="bg-[#E91E76] px-4 py-1.5 rounded-full flex-row items-center gap-1"
          >
            <Text className="text-white font-bold text-sm">Next</Text>
            <ChevronRight color="#fff" size={16} />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 px-5 pb-2">
        {/* Pinned Media Preview Viewport (Always visible at the top) */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            if (mediaType === "video") {
              if (isPlaying) {
                previewPlayer.pause();
                setIsPlaying(false);
              } else {
                previewPlayer.play();
                setIsPlaying(true);
              }
            }
          }}
          className="w-full h-[320px] max-h-[44vh] rounded-3xl overflow-hidden bg-black mb-3 border border-white/10 relative justify-center items-center shrink-0"
        >
          {/* Main Content with Filter Applied */}
          <View className="absolute inset-0 w-full h-full justify-center items-center overflow-hidden">
            {mediaType === "video" && recordedVideoUri ? (
              <VideoView
                player={previewPlayer}
                className="w-full h-full"
                contentFit="cover"
                nativeControls={false}
                style={[
                  Platform.OS === "web"
                    ? ({ filter: getEffectiveCssFilter() } as any)
                    : {},
                ]}
              />
            ) : recordedVideoUri ? (
              <Image
                source={{ uri: recordedVideoUri }}
                className="w-full h-full"
                resizeMode="cover"
                style={[
                  Platform.OS === "web"
                    ? ({ filter: getEffectiveCssFilter() } as any)
                    : {},
                ]}
              />
            ) : null}

            {/* Visual Tone Mapping Overlays for Native & Web */}
            {!isComparing && activeFilterConfig.overlayColor && (
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: activeFilterConfig.overlayColor,
                    opacity:
                      filterIntensity *
                      (activeFilterConfig.overlayOpacity || 0.6),
                  },
                ]}
              />
            )}
            {!isComparing && activeFilterConfig.secondaryOverlay && (
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: activeFilterConfig.secondaryOverlay,
                    opacity: filterIntensity * 0.12,
                  },
                ]}
              />
            )}
            {!isComparing && adjustments.warmth !== 0 && (
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor:
                      adjustments.warmth > 0
                        ? "rgba(245, 158, 11, 0.2)"
                        : "rgba(14, 165, 233, 0.2)",
                    opacity: (Math.abs(adjustments.warmth) / 50) * 0.35,
                  },
                ]}
              />
            )}
          </View>

          {/* Floating Filter Badge Top Left */}
          <View className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-white/15 backdrop-blur-md z-20">
            <Aperture color="#E91E76" size={13} />
            <Text className="text-white text-[11px] font-semibold tracking-wide">
              {isComparing
                ? "Original Raw"
                : `${activeFilter}${activeFilter !== "Original" ? ` • ${Math.round(filterIntensity * 100)}%` : ""}`}
            </Text>
          </View>

          {/* Compare Button Top Right */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPressIn={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsComparing(true);
            }}
            onPressOut={() => {
              setIsComparing(false);
            }}
            className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border z-20 backdrop-blur-md transition-all ${
              isComparing
                ? "bg-[#E91E76] border-[#E91E76]"
                : "bg-black/60 border-white/20"
            }`}
          >
            <Eye color="#fff" size={13} />
            <Text className="text-white text-[11px] font-bold">
              {isComparing ? "Showing Original" : "Hold to Compare"}
            </Text>
          </TouchableOpacity>

          {/* Media Type Badge Bottom Left */}
          <View className="absolute bottom-4 left-4 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center gap-1.5 border border-white/10 z-10">
            {mediaType === "image" ? (
              <>
                <ImageIcon color="#38BDF8" size={12} />
                <Text className="text-white/80 text-[10px] font-medium">
                  HD Photo
                </Text>
              </>
            ) : (
              <>
                <Play color="#E91E76" size={10} fill="#E91E76" />
                <Text className="text-white/80 text-[10px] font-medium">
                  Video
                </Text>
              </>
            )}
          </View>

          {/* Live Draggable Subtitle / Caption Overlay */}
          {showCaptions && captionText.trim().length > 0 && (
            <Animated.View
              {...captionPanResponder.panHandlers}
              style={[
                {
                  transform: captionPan.getTranslateTransform(),
                },
                Platform.OS === "web" ? ({ cursor: "grab" } as any) : {},
              ]}
              className="absolute bottom-14 z-30 self-center items-center"
            >
              <View
                style={[
                  captionStyle === "neon"
                    ? {
                        backgroundColor: "rgba(10, 10, 18, 0.88)",
                        borderColor: isDraggingCaption ? "#fff" : "#E91E76",
                        borderWidth: 2,
                        shadowColor: "#E91E76",
                        shadowOpacity: 0.9,
                        shadowRadius: 10,
                      }
                    : captionStyle === "yellow"
                      ? {
                          backgroundColor: "rgba(0, 0, 0, 0.9)",
                          borderColor: isDraggingCaption ? "#fff" : "#FACC15",
                          borderWidth: 2,
                        }
                      : captionStyle === "minimal"
                        ? {
                            backgroundColor: isDraggingCaption
                              ? "rgba(0,0,0,0.5)"
                              : "transparent",
                            borderColor: isDraggingCaption
                              ? "rgba(255,255,255,0.4)"
                              : "transparent",
                            borderWidth: 1,
                          }
                        : {
                            backgroundColor: "rgba(0, 0, 0, 0.82)",
                            borderColor: isDraggingCaption
                              ? "#fff"
                              : "rgba(255, 255, 255, 0.3)",
                            borderWidth: 1,
                          },
                ]}
                className={`px-4 py-2 rounded-2xl max-w-[90%] shadow-lg flex-row items-center gap-1.5 ${
                  isDraggingCaption ? "scale-105" : ""
                }`}
              >
                <Text
                  style={[
                    captionStyle === "neon"
                      ? {
                          color: "#FFFFFF",
                          textShadowColor: "#E91E76",
                          textShadowRadius: 8,
                        }
                      : captionStyle === "yellow"
                        ? { color: "#FACC15", fontWeight: "900" }
                        : captionStyle === "minimal"
                          ? {
                              color: "#FFFFFF",
                              textShadowColor: "rgba(0,0,0,0.9)",
                              textShadowRadius: 6,
                            }
                          : { color: "#FFFFFF", fontWeight: "700" },
                  ]}
                  className="text-center text-xs font-bold tracking-wide select-none"
                >
                  {captionText}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Selected Soundtrack Active Badge */}
          {selectedSoundTrack !== "none" && (
            <View className="absolute top-4 right-32 bg-black/60 px-2 py-1 rounded-full flex-row items-center gap-1 border border-[#E91E76]/40 backdrop-blur-md z-20">
              <Music2 color="#E91E76" size={11} />
              <Text
                className="text-white text-[9px] font-semibold max-w-[80px]"
                numberOfLines={1}
              >
                {allSoundTracks.find((s) => s.id === selectedSoundTrack)?.name}
              </Text>
            </View>
          )}

          {/* Video Paused Play Icon */}
          {mediaType === "video" && !isPlaying && (
            <View className="w-16 h-16 bg-black/60 rounded-full items-center justify-center backdrop-blur-md z-20 border border-white/20">
              <Play color="#fff" size={30} fill="#fff" className="ml-1" />
            </View>
          )}

          {/* Custom Video Progress Bar */}
          {mediaType === "video" && editMode !== "trim" && (
            <View className="absolute bottom-3 right-4 left-24 flex-row items-center gap-2 z-10">
              <View
                className="flex-1 h-5 justify-center relative"
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                {...panResponder.panHandlers}
              >
                <View className="w-full h-1 bg-white/25 rounded-full flex-row items-center pointer-events-none">
                  <View
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                    className="h-full bg-[#E91E76] rounded-l-full"
                  />
                  <View className="w-3 h-3 bg-white rounded-full -ml-1 shadow-md pointer-events-none" />
                </View>
              </View>
              <Text className="text-white text-[10px] font-mono opacity-80">
                {formatTime(currentTime)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Scrollable Controls & Options Section (Scroll up to reveal more options) */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
          nestedScrollEnabled={true}
        >
          {/* Main 5 Editor Navigation Buttons */}
          <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditMode("filters");
            }}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border bg-[#1A1D24] ${
              editMode === "filters"
                ? "border-[#E91E76] bg-[#E91E76]/15"
                : "border-white/10"
            }`}
          >
            <Aperture
              color={editMode === "filters" ? "#E91E76" : "#fff"}
              size={22}
              className="mb-1"
            />
            <Text
              className={
                editMode === "filters"
                  ? "text-[#E91E76] text-[10px] font-bold"
                  : "text-white text-[10px]"
              }
            >
              Filters
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditMode("cover");
            }}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border bg-[#1A1D24] ${
              editMode === "cover"
                ? "border-[#E91E76] bg-[#E91E76]/15"
                : "border-white/10"
            }`}
          >
            <ImageIcon
              color={editMode === "cover" ? "#E91E76" : "#fff"}
              size={22}
              className="mb-1"
            />
            <Text
              className={
                editMode === "cover"
                  ? "text-[#E91E76] text-[10px] font-bold"
                  : "text-white text-[10px]"
              }
            >
              Cover
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditMode("trim");
            }}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border bg-[#1A1D24] ${
              editMode === "trim"
                ? "border-[#E91E76] bg-[#E91E76]/15"
                : "border-white/10"
            }`}
          >
            <Scissors
              color={editMode === "trim" ? "#E91E76" : "#fff"}
              size={22}
              className="mb-1"
            />
            <Text
              className={
                editMode === "trim"
                  ? "text-[#E91E76] text-[10px] font-bold"
                  : "text-white text-[10px]"
              }
            >
              Trim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditMode("sound");
            }}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border bg-[#1A1D24] ${
              editMode === "sound"
                ? "border-[#E91E76] bg-[#E91E76]/15"
                : "border-white/10"
            }`}
          >
            <Music2
              color={editMode === "sound" ? "#E91E76" : "#fff"}
              size={22}
              className="mb-1"
            />
            <Text
              className={
                editMode === "sound"
                  ? "text-[#E91E76] text-[10px] font-bold"
                  : "text-white text-[10px]"
              }
            >
              Sound
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditMode("caption");
            }}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border bg-[#1A1D24] ${
              editMode === "caption"
                ? "border-[#E91E76] bg-[#E91E76]/15"
                : "border-white/10"
            }`}
          >
            <Subtitles
              color={editMode === "caption" ? "#E91E76" : "#fff"}
              size={22}
              className="mb-1"
            />
            <Text
              className={
                editMode === "caption"
                  ? "text-[#E91E76] text-[10px] font-bold"
                  : "text-white text-[10px]"
              }
            >
              Captions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Editor Panel */}
        {editMode === "filters" ? (
          <View className="w-full bg-[#12141A] rounded-2xl p-3 border border-white/10 mb-3">
            {/* Presets vs Fine-Tune Sub Tabs */}
            <View className="flex-row items-center justify-between mb-3 border-b border-white/5 pb-2.5">
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setActiveFilterSubTab("presets")}
                  className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${
                    activeFilterSubTab === "presets"
                      ? "bg-[#E91E76]"
                      : "bg-white/5"
                  }`}
                >
                  <Palette color="#fff" size={13} />
                  <Text className="text-white text-[11px] font-bold">
                    Presets
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveFilterSubTab("adjust")}
                  className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${
                    activeFilterSubTab === "adjust"
                      ? "bg-[#E91E76]"
                      : "bg-white/5"
                  }`}
                >
                  <SlidersHorizontal color="#fff" size={13} />
                  <Text className="text-white text-[11px] font-bold">
                    Fine-Tune
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Reset Filter Button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFilter("Original");
                  setFilterIntensity(0.85);
                  setAdjustments({
                    brightness: 0,
                    contrast: 0,
                    saturation: 0,
                    warmth: 0,
                  });
                }}
                className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-white/5"
              >
                <RotateCcw color="#9CA3AF" size={12} />
                <Text className="text-[#9CA3AF] text-[10px] font-medium">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>

            {activeFilterSubTab === "presets" ? (
              <>
                {/* Filter Category Pills */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                  contentContainerStyle={{ gap: 6 }}
                >
                  {["All", "Popular", "Stage", "Mood", "Film", "B&W"].map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setActiveFilterCategory(cat);
                        }}
                        className={`px-3 py-1 rounded-full border ${
                          activeFilterCategory === cat
                            ? "bg-white/20 border-white/40"
                            : "bg-transparent border-white/10"
                        }`}
                      >
                        <Text
                          className={`text-[11px] font-medium ${
                            activeFilterCategory === cat
                              ? "text-white font-bold"
                              : "text-[#9CA3AF]"
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </ScrollView>

                {/* Filter Cards Carousel with Live Thumbnails */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingRight: 10 }}
                  className="mb-3"
                >
                  {TALENT_FILTERS.filter(
                    (f) =>
                      activeFilterCategory === "All" ||
                      f.category === activeFilterCategory,
                  ).map((filter) => {
                    const isSelected = activeFilter === filter.name;
                    return (
                      <TouchableOpacity
                        key={filter.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setActiveFilter(filter.name);
                        }}
                        className="items-center"
                        style={{ width: 66 }}
                      >
                        <View
                          className={`w-16 h-16 rounded-2xl overflow-hidden mb-1.5 relative border-2 ${
                            isSelected
                              ? "border-[#E91E76] shadow-lg shadow-[#E91E76]/50"
                              : "border-white/15"
                          }`}
                        >
                          {/* Miniature Real Media Thumbnail with Filter */}
                          {recordedVideoUri ? (
                            <Image
                              source={{ uri: recordedVideoUri }}
                              className="w-full h-full"
                              resizeMode="cover"
                              style={[
                                Platform.OS === "web"
                                  ? ({ filter: filter.cssFilter(0.85) } as any)
                                  : {},
                              ]}
                            />
                          ) : (
                            <View
                              className="w-full h-full"
                              style={{ backgroundColor: filter.previewBg }}
                            />
                          )}

                          {/* Color tint overlay on thumbnail */}
                          {filter.overlayColor && (
                            <View
                              pointerEvents="none"
                              style={[
                                StyleSheet.absoluteFill,
                                {
                                  backgroundColor: filter.overlayColor,
                                  opacity:
                                    (filter.overlayOpacity || 0.6) * 0.75,
                                },
                              ]}
                            />
                          )}

                          {/* Badge tag if any */}
                          {filter.badge && (
                            <View className="absolute top-1 left-1 bg-[#E91E76] px-1 py-0.5 rounded-[4px]">
                              <Text className="text-[7px] font-black text-white">
                                {filter.badge}
                              </Text>
                            </View>
                          )}

                          {/* Selected Checkmark Indicator */}
                          {isSelected && (
                            <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#E91E76] items-center justify-center border border-white">
                              <Check color="#fff" size={9} strokeWidth={3} />
                            </View>
                          )}
                        </View>

                        <Text
                          numberOfLines={1}
                          className={`text-[11px] font-medium text-center ${
                            isSelected
                              ? "text-[#E91E76] font-bold"
                              : "text-white/80"
                          }`}
                        >
                          {filter.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Filter Strength / Intensity Draggable Slider */}
                {activeFilter !== "Original" && (
                  <View className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <Sun color="#E91E76" size={15} />
                        <Text className="text-white text-[12px] font-semibold">
                          Intensity Slider
                        </Text>
                      </View>
                      <View className="bg-[#E91E76]/20 px-2.5 py-0.5 rounded-full border border-[#E91E76]/40">
                        <Text className="text-[#E91E76] text-[11px] font-bold">
                          {Math.round(filterIntensity * 100)}%
                        </Text>
                      </View>
                    </View>

                    {/* Draggable & Clickable Slider Bar */}
                    <View
                      className="h-7 justify-center relative cursor-pointer"
                      onLayout={(e) => {
                        const w = e.nativeEvent.layout.width;
                        setIntensitySliderWidth(w);
                        intensitySliderWidthRef.current = w;
                      }}
                      {...intensityPanResponder.panHandlers}
                    >
                      {/* Track Background */}
                      <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                        <View
                          style={{ width: `${Math.max(0, Math.min(100, filterIntensity * 100))}%` }}
                          className="h-full bg-[#E91E76] rounded-full"
                        />
                      </View>

                      {/* Slider Draggable Knob */}
                      <View
                        style={{
                          left: `${Math.max(0, Math.min(100, filterIntensity * 100))}%`,
                          marginLeft: -10,
                        }}
                        className="absolute top-1/2 -mt-2.5 w-5 h-5 rounded-full bg-white shadow-md border-2 border-[#E91E76] items-center justify-center pointer-events-none"
                      >
                        <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76]" />
                      </View>
                    </View>

                    {/* Scale markers */}
                    <View className="flex-row justify-between px-0.5 mt-1">
                      {[0, 25, 50, 75, 100].map((mark) => (
                        <TouchableOpacity
                          key={mark}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setFilterIntensity(mark / 100);
                          }}
                        >
                          <Text
                            className={`text-[9px] font-semibold ${
                              Math.round(filterIntensity * 100) === mark
                                ? "text-[#E91E76] font-bold"
                                : "text-[#9CA3AF]"
                            }`}
                          >
                            {mark}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              /* Fine-Tune Adjustments Panel - Styled like Presets with individual option cards and dedicated slider */
              <>
                {/* Fine-Tune Option Cards Carousel */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingRight: 10 }}
                  className="mb-3"
                >
                  {FINE_TUNE_OPTIONS.map((opt) => {
                    const isSelected = selectedFineTune === opt.key;
                    const currentVal =
                      adjustments[opt.key as keyof typeof adjustments];
                    const hasAdjustment = currentVal !== 0;
                    const IconComponent = opt.icon;

                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedFineTune(opt.key as any);
                        }}
                        className="items-center"
                        style={{ width: 66 }}
                      >
                        <View
                          className={`w-16 h-16 rounded-2xl overflow-hidden mb-1.5 relative border-2 items-center justify-center ${
                            isSelected
                              ? "border-[#E91E76] shadow-lg shadow-[#E91E76]/50 bg-[#E91E76]/15"
                              : "border-white/15 bg-white/5"
                          }`}
                        >
                          {/* Miniature Real Media Thumbnail with tweak */}
                          {recordedVideoUri ? (
                            <Image
                              source={{ uri: recordedVideoUri }}
                              className="w-full h-full"
                              resizeMode="cover"
                              style={[
                                Platform.OS === "web"
                                  ? ({ filter: opt.previewFilter } as any)
                                  : {},
                              ]}
                            />
                          ) : null}

                          {/* Tint overlay with Icon */}
                          <View
                            className="absolute inset-0 items-center justify-center"
                            style={{
                              backgroundColor: recordedVideoUri
                                ? "rgba(10, 10, 15, 0.45)"
                                : "rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            <IconComponent
                              color={isSelected ? "#E91E76" : "#FFFFFF"}
                              size={20}
                              strokeWidth={2}
                            />
                          </View>

                          {/* Current Value Badge if not 0 */}
                          {hasAdjustment && (
                            <View className="absolute top-1 left-1 bg-[#E91E76] px-1 py-0.5 rounded-[4px]">
                              <Text className="text-[7px] font-black text-white">
                                {currentVal > 0 ? `+${currentVal}` : `${currentVal}`}
                              </Text>
                            </View>
                          )}

                          {/* Selected Checkmark Indicator */}
                          {isSelected && (
                            <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#E91E76] items-center justify-center border border-white">
                              <Check color="#fff" size={9} strokeWidth={3} />
                            </View>
                          )}
                        </View>

                        <Text
                          numberOfLines={1}
                          className={`text-[11px] font-medium text-center ${
                            isSelected
                              ? "text-[#E91E76] font-bold"
                              : "text-white/80"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Dedicated Slider Card for Selected Fine-Tune Option */}
                {(() => {
                  const activeOpt =
                    FINE_TUNE_OPTIONS.find((o) => o.key === selectedFineTune) ||
                    FINE_TUNE_OPTIONS[0];
                  const currentVal =
                    adjustments[activeOpt.key as keyof typeof adjustments];
                  const ActiveIcon = activeOpt.icon;
                  const knobPct = Math.max(
                    0,
                    Math.min(100, ((currentVal + 50) / 100) * 100),
                  );

                  return (
                    <View className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                          <ActiveIcon color="#E91E76" size={15} />
                          <Text className="text-white text-[12px] font-semibold">
                            {activeOpt.label} Slider
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          {currentVal !== 0 && (
                            <TouchableOpacity
                              onPress={() => {
                                Haptics.impactAsync(
                                  Haptics.ImpactFeedbackStyle.Light,
                                );
                                setAdjustments((prev) => ({
                                  ...prev,
                                  [activeOpt.key]: 0,
                                }));
                              }}
                              className="bg-white/10 px-2 py-0.5 rounded-full"
                            >
                              <Text className="text-[#9CA3AF] text-[10px] font-medium">
                                Reset
                              </Text>
                            </TouchableOpacity>
                          )}
                          <View className="bg-[#E91E76]/20 px-2.5 py-0.5 rounded-full border border-[#E91E76]/40">
                            <Text className="text-[#E91E76] text-[11px] font-bold">
                              {currentVal > 0
                                ? `+${currentVal}%`
                                : `${currentVal}%`}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Draggable & Clickable Slider Bar */}
                      <View
                        className="h-7 justify-center relative cursor-pointer"
                        onLayout={(e) => {
                          const w = e.nativeEvent.layout.width;
                          setFineTuneSliderWidth(w);
                          fineTuneSliderWidthRef.current = w;
                        }}
                        {...fineTunePanResponder.panHandlers}
                      >
                        {/* Track Background */}
                        <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                          {/* Center zero mark */}
                          <View className="absolute left-1/2 -ml-[1px] top-0 bottom-0 w-[2px] bg-white/30 z-10" />

                          {/* Active Fill from Center (0) to Knob */}
                          {currentVal >= 0 ? (
                            <View
                              style={{
                                left: "50%",
                                width: `${(currentVal / 50) * 50}%`,
                              }}
                              className="h-full bg-[#E91E76] rounded-r-full"
                            />
                          ) : (
                            <View
                              style={{
                                left: `${50 - (Math.abs(currentVal) / 50) * 50}%`,
                                width: `${(Math.abs(currentVal) / 50) * 50}%`,
                              }}
                              className="h-full bg-[#E91E76] rounded-l-full"
                            />
                          )}
                        </View>

                        {/* Slider Draggable Knob */}
                        <View
                          style={{
                            left: `${knobPct}%`,
                            marginLeft: -10,
                          }}
                          className="absolute top-1/2 -mt-2.5 w-5 h-5 rounded-full bg-white shadow-md border-2 border-[#E91E76] items-center justify-center pointer-events-none"
                        >
                          <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76]" />
                        </View>
                      </View>

                      {/* Scale markers */}
                      <View className="flex-row justify-between px-0.5 mt-1">
                        {[-50, -25, 0, 25, 50].map((mark) => (
                          <TouchableOpacity
                            key={mark}
                            onPress={() => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light,
                              );
                              setAdjustments((prev) => ({
                                ...prev,
                                [activeOpt.key]: mark,
                              }));
                            }}
                          >
                            <Text
                              className={`text-[9px] font-semibold ${
                                currentVal === mark
                                  ? "text-[#E91E76] font-bold"
                                  : "text-[#9CA3AF]"
                              }`}
                            >
                              {mark > 0 ? `+${mark}%` : `${mark}%`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                })()}
              </>
            )}
          </View>
        ) : editMode === "cover" ? (
          /* Cover & Poster Editor Panel */
          <View className="w-full bg-[#12141A] rounded-2xl p-4 border border-white/10 mb-3">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-white font-bold text-sm">
                  Performance Cover Frame
                </Text>
                <Text className="text-[#9CA3AF] text-[11px]">
                  Applied with your current "{activeFilter}" filter
                </Text>
              </View>
              <TouchableOpacity
                onPress={pickPhoto}
                className="bg-[#E91E76] px-3 py-1.5 rounded-full flex-row items-center gap-1"
              >
                <ImagePlus color="#fff" size={13} />
                <Text className="text-white font-bold text-[11px]">Upload</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 items-center">
              <View className="w-16 h-20 rounded-xl overflow-hidden border-2 border-[#E91E76] relative">
                {recordedVideoUri && (
                  <Image
                    source={{ uri: recordedVideoUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                    style={[
                      Platform.OS === "web"
                        ? ({ filter: getEffectiveCssFilter() } as any)
                        : {},
                    ]}
                  />
                )}
                <View className="absolute bottom-1 inset-x-0 items-center">
                  <View className="bg-black/60 px-1 py-0.5 rounded">
                    <Text className="text-white text-[8px] font-bold">ACTIVE</Text>
                  </View>
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-white text-xs font-semibold mb-1">
                  Card Poster Ready
                </Text>
                <Text className="text-[#9CA3AF] text-[11px] leading-relaxed">
                  This poster will be shown in the Explore Feed, your Profile, and Stage listings.
                </Text>
              </View>
            </View>
          </View>
        ) : editMode === "trim" ? (
          <View className="w-full h-24 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-medium">
                {formatTime(currentTime)}
              </Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => {
                    if (isPlaying) {
                      previewPlayer.pause();
                      setIsPlaying(false);
                    } else {
                      previewPlayer.play();
                      setIsPlaying(true);
                    }
                  }}
                >
                  {isPlaying ? (
                    <Pause color="#fff" size={24} />
                  ) : (
                    <Play color="#fff" size={24} />
                  )}
                </TouchableOpacity>
              </View>
              <Text className="text-white font-medium">
                {formatTime(duration)}
              </Text>
            </View>

            {/* Timeline Editor Scrubber */}
            <View
              className="h-14 w-full relative justify-center"
              onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              {...panResponder.panHandlers}
            >
              <View className="absolute inset-0 flex-row overflow-hidden rounded-lg border-2 border-white/20 opacity-50 pointer-events-none">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View
                    key={i}
                    className="flex-1 h-full bg-[#2A2D34] border-r border-black"
                  />
                ))}
              </View>

              <View className="absolute left-[10%] right-[20%] h-full border-4 border-[#E91E76] rounded-lg bg-transparent pointer-events-none">
                <View className="absolute -left-3 top-0 bottom-0 w-3 bg-[#E91E76] rounded-l-md justify-center items-center">
                  <View className="w-1 h-4 bg-white rounded-full" />
                </View>
                <View className="absolute -right-3 top-0 bottom-0 w-3 bg-[#E91E76] rounded-r-md justify-center items-center">
                  <View className="w-1 h-4 bg-white rounded-full" />
                </View>
              </View>

              <View
                style={{ left: `${(currentTime / duration) * 100}%` }}
                className="absolute top-[-8px] bottom-[-8px] w-1 bg-white rounded-full z-10 shadow-lg pointer-events-none"
              />
            </View>
          </View>
        ) : editMode === "sound" ? (
          /* Sound & Audio Lab Panel */
          <View className="w-full bg-[#12141A] rounded-2xl p-4 border border-white/10 mb-3 gap-3.5">
            {/* Header with status */}
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold text-sm">
                  Soundtrack & Audio Lab
                </Text>
                <Text className="text-[#9CA3AF] text-[11px]">
                  Balance original live recording & background music
                </Text>
              </View>
              <View className="bg-[#E91E76]/15 px-2.5 py-1 rounded-full border border-[#E91E76]/30 flex-row items-center gap-1">
                <Music2 color="#E91E76" size={12} />
                <Text className="text-[#E91E76] text-[10px] font-bold">
                  {selectedSoundTrack === "none" ? "Raw Mic" : "Mixed Track"}
                </Text>
              </View>
            </View>

            {/* Soundtrack Selection Carousel */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wider">
                  Featured & Custom Music
                </Text>
                <TouchableOpacity
                  onPress={pickCustomAudio}
                  className="bg-[#E91E76]/15 border border-[#E91E76]/40 px-2.5 py-1 rounded-full flex-row items-center gap-1"
                >
                  <Plus color="#E91E76" size={11} strokeWidth={2.5} />
                  <Text className="text-[#E91E76] text-[10px] font-bold">
                    Add Your Music
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              >
                {/* Upload Your Own Song Card */}
                <TouchableOpacity
                  onPress={pickCustomAudio}
                  className="p-2.5 rounded-2xl border border-dashed border-[#E91E76]/50 bg-[#E91E76]/10 items-center justify-center"
                  style={{ width: 120, height: 76 }}
                >
                  <View className="w-6 h-6 rounded-full bg-[#E91E76] items-center justify-center mb-1 shadow-sm">
                    <Plus color="#fff" size={14} strokeWidth={3} />
                  </View>
                  <Text className="text-white text-[11px] font-bold text-center">
                    Add Song
                  </Text>
                  <Text className="text-[#E91E76] text-[9px] font-medium text-center">
                    Audio / MP3
                  </Text>
                </TouchableOpacity>

                {allSoundTracks.map((track) => {
                  const isSelected = selectedSoundTrack === track.id;
                  return (
                    <TouchableOpacity
                      key={track.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedSoundTrack(track.id);
                      }}
                      className={`p-2.5 rounded-2xl border items-start justify-between relative ${
                        isSelected
                          ? "border-[#E91E76] bg-[#E91E76]/15"
                          : "border-white/10 bg-white/5"
                      }`}
                      style={{ width: 132, height: 76 }}
                    >
                      <View className="flex-row items-center justify-between w-full">
                        <View
                          className="w-6 h-6 rounded-lg items-center justify-center"
                          style={{
                            backgroundColor: isSelected
                              ? "#E91E76"
                              : "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Music2
                            color={isSelected ? "#fff" : track.accent}
                            size={13}
                          />
                        </View>
                        <View className="flex-row items-center gap-1">
                          {track.isCustom && (
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                removeCustomTrack(track.id);
                              }}
                              className="p-0.5"
                            >
                              <Trash2 color="#9CA3AF" size={12} />
                            </TouchableOpacity>
                          )}
                          {isSelected && (
                            <View className="w-4 h-4 rounded-full bg-[#E91E76] items-center justify-center">
                              <Check color="#fff" size={9} strokeWidth={3} />
                            </View>
                          )}
                        </View>
                      </View>

                      <View className="w-full">
                        <View className="flex-row items-center gap-1">
                          <Text
                            numberOfLines={1}
                            className={`text-xs font-bold flex-1 ${
                              isSelected ? "text-[#E91E76]" : "text-white"
                            }`}
                          >
                            {track.name}
                          </Text>
                          {track.isCustom && (
                            <View className="bg-[#E91E76]/30 px-1 rounded">
                              <Text className="text-[7px] text-[#F472B6] font-bold">
                                MINE
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          numberOfLines={1}
                          className="text-[#9CA3AF] text-[10px]"
                        >
                          {track.genre} • {track.duration}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Original Audio Volume Control Card */}
            <View className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsOriginalMuted(!isOriginalMuted);
                    }}
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      isOriginalMuted ? "bg-red-500/20" : "bg-white/10"
                    }`}
                  >
                    {isOriginalMuted ? (
                      <VolumeX color="#EF4444" size={13} />
                    ) : (
                      <Volume2 color="#E91E76" size={13} />
                    )}
                  </TouchableOpacity>
                  <Text className="text-white text-[12px] font-semibold">
                    Original Microphone Audio
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsOriginalMuted(!isOriginalMuted);
                    }}
                    className="bg-white/10 px-2 py-0.5 rounded-full"
                  >
                    <Text className="text-[#9CA3AF] text-[10px] font-medium">
                      {isOriginalMuted ? "Unmute" : "Mute"}
                    </Text>
                  </TouchableOpacity>
                  <View className="bg-[#E91E76]/20 px-2.5 py-0.5 rounded-full border border-[#E91E76]/40">
                    <Text className="text-[#E91E76] text-[11px] font-bold">
                      {isOriginalMuted ? "0%" : `${originalAudioVolume}%`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Draggable Original Volume Slider */}
              <View
                className="h-7 justify-center relative cursor-pointer"
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  setOrigVolSliderWidth(w);
                  origVolSliderWidthRef.current = w;
                }}
                {...origVolPanResponder.panHandlers}
              >
                <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                  <View
                    style={{
                      width: `${isOriginalMuted ? 0 : Math.max(0, Math.min(100, (originalAudioVolume / 150) * 100))}%`,
                    }}
                    className="h-full bg-[#E91E76] rounded-full"
                  />
                </View>
                <View
                  style={{
                    left: `${isOriginalMuted ? 0 : Math.max(0, Math.min(100, (originalAudioVolume / 150) * 100))}%`,
                    marginLeft: -10,
                  }}
                  className="absolute top-1/2 -mt-2.5 w-5 h-5 rounded-full bg-white shadow-md border-2 border-[#E91E76] items-center justify-center pointer-events-none"
                >
                  <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76]" />
                </View>
              </View>

              {/* Scale markers */}
              <View className="flex-row justify-between px-0.5 mt-1">
                {[0, 50, 100, 150].map((mark) => (
                  <TouchableOpacity
                    key={mark}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setOriginalAudioVolume(mark);
                      setIsOriginalMuted(mark === 0);
                    }}
                  >
                    <Text
                      className={`text-[9px] font-semibold ${
                        !isOriginalMuted && originalAudioVolume === mark
                          ? "text-[#E91E76] font-bold"
                          : "text-[#9CA3AF]"
                      }`}
                    >
                      {mark}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Music Track Volume Slider (if soundtrack selected) */}
            {selectedSoundTrack !== "none" && (
              <View className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Music2 color="#38BDF8" size={14} />
                    <Text className="text-white text-[12px] font-semibold">
                      Soundtrack Volume
                    </Text>
                  </View>
                  <View className="bg-[#38BDF8]/20 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/40">
                    <Text className="text-[#38BDF8] text-[11px] font-bold">
                      {musicVolume}%
                    </Text>
                  </View>
                </View>

                {/* Draggable Music Volume Slider */}
                <View
                  className="h-7 justify-center relative cursor-pointer"
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    setMusicVolSliderWidth(w);
                    musicVolSliderWidthRef.current = w;
                  }}
                  {...musicVolPanResponder.panHandlers}
                >
                  <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                    <View
                      style={{
                        width: `${Math.max(0, Math.min(100, musicVolume))}%`,
                      }}
                      className="h-full bg-[#38BDF8] rounded-full"
                    />
                  </View>
                  <View
                    style={{
                      left: `${Math.max(0, Math.min(100, musicVolume))}%`,
                      marginLeft: -10,
                    }}
                    className="absolute top-1/2 -mt-2.5 w-5 h-5 rounded-full bg-white shadow-md border-2 border-[#38BDF8] items-center justify-center pointer-events-none"
                  >
                    <View className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                  </View>
                </View>

                {/* Scale markers */}
                <View className="flex-row justify-between px-0.5 mt-1">
                  {[0, 25, 50, 75, 100].map((mark) => (
                    <TouchableOpacity
                      key={mark}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setMusicVolume(mark);
                      }}
                    >
                      <Text
                        className={`text-[9px] font-semibold ${
                          musicVolume === mark
                            ? "text-[#38BDF8] font-bold"
                            : "text-[#9CA3AF]"
                        }`}
                      >
                        {mark}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Studio Audio FX Chips */}
            <View>
              <Text className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wider mb-2">
                Studio Audio FX
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { id: "enhance", label: "✨ AI Voice Boost" },
                  { id: "noiseCut", label: "🔇 Noise Cut" },
                  { id: "reverb", label: "🎙️ Stage Reverb" },
                  { id: "bass", label: "🔊 Punchy Bass" },
                ].map((fx) => {
                  const isActive = activeAudioEffects.includes(fx.id);
                  return (
                    <TouchableOpacity
                      key={fx.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveAudioEffects((prev) =>
                          isActive
                            ? prev.filter((x) => x !== fx.id)
                            : [...prev, fx.id],
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${
                        isActive
                          ? "bg-[#E91E76]/15 border-[#E91E76]"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${
                          isActive ? "text-[#E91E76]" : "text-[#D1D5DB]"
                        }`}
                      >
                        {fx.label}
                      </Text>
                      {isActive && (
                        <Check color="#E91E76" size={10} strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ) : editMode === "caption" ? (
          /* Captions & Subtitles Panel */
          <View className="w-full bg-[#12141A] rounded-2xl p-4 border border-white/10 mb-3 gap-3.5">
            {/* Header with toggle */}
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold text-sm">
                  Captions & Stage Subtitles
                </Text>
                <Text className="text-[#9CA3AF] text-[11px]">
                  Add dynamic lyrics, quotes, or stage dialog
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCaptions(!showCaptions);
                }}
                className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${
                  showCaptions ? "bg-[#E91E76]" : "bg-white/10"
                }`}
              >
                <Subtitles color="#fff" size={12} />
                <Text className="text-white text-[11px] font-bold">
                  {showCaptions ? "Visible" : "Hidden"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Editable Caption Input Field */}
            <View className="bg-white/5 rounded-xl p-3 border border-white/10">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wider">
                  Subtitle Text
                </Text>
                <Text className="text-[#9CA3AF] text-[10px]">
                  {captionText.length}/100
                </Text>
              </View>
              <TextInput
                value={captionText}
                onChangeText={(text) => {
                  setCaptionText(text);
                  if (!showCaptions && text.length > 0) setShowCaptions(true);
                }}
                maxLength={100}
                placeholder="Enter performance quote or lyric..."
                placeholderTextColor="#6B7280"
                className="text-white text-xs py-1 px-0 font-medium"
              />
            </View>

            {/* Quick Caption Presets */}
            <View>
              <Text className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wider mb-2">
                Quick Preset Phrases
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingRight: 6 }}
              >
                {[
                  "Feel the rhythm 🔥",
                  "Step into the spotlight ✨",
                  "Live stage energy ⚡",
                  "Raw performance 🎭",
                  "Leaving it all on stage 🌟",
                ].map((phrase) => (
                  <TouchableOpacity
                    key={phrase}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCaptionText(phrase);
                      setShowCaptions(true);
                    }}
                    className={`px-3 py-1.5 rounded-full border ${
                      captionText === phrase
                        ? "bg-[#E91E76]/15 border-[#E91E76]"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-medium ${
                        captionText === phrase
                          ? "text-[#E91E76] font-bold"
                          : "text-white/80"
                      }`}
                    >
                      {phrase}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Subtitle Style Presets */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[#9CA3AF] text-[11px] font-semibold uppercase tracking-wider">
                  Subtitle Style
                </Text>
                <TouchableOpacity
                  onPress={resetCaptionPosition}
                  className="bg-white/10 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-white/10"
                >
                  <RotateCcw color="#fff" size={10} />
                  <Text className="text-white text-[10px] font-semibold">Reset Position</Text>
                </TouchableOpacity>
              </View>
                <View className="flex-row bg-white/5 p-1 rounded-xl border border-white/10">
                  {(
                    [
                      { id: "neon", label: "Neon Glow" },
                      { id: "classic", label: "Dark Pill" },
                      { id: "yellow", label: "Karaoke Pop" },
                      { id: "minimal", label: "Clean Shadow" },
                    ] as const
                  ).map((st) => (
                    <TouchableOpacity
                      key={st.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCaptionStyle(st.id);
                      }}
                      className={`flex-1 py-2 rounded-lg items-center ${
                        captionStyle === st.id
                          ? "bg-[#E91E76]"
                          : "bg-transparent"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          captionStyle === st.id
                            ? "text-white"
                            : "text-[#9CA3AF]"
                        }`}
                      >
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
          </View>
        ) : null}

        {/* AI Best Moment Enhancement Banner */}
        <View className="bg-[#1A1D24] p-3.5 rounded-2xl flex-row items-center border border-white/5">
          <Sparkles color="#E91E76" size={22} className="mr-3" />
          <View className="flex-1 mr-2">
            <Text className="text-white font-bold text-sm mb-0.5">
              Auto Color & Filter Match
            </Text>
            <Text className="text-[#9CA3AF] text-[11px]">
              AI suggests "{activeFilterConfig.name}" for your performance lighting.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveFilter("Stage");
              setFilterIntensity(0.9);
            }}
            className="bg-[#E91E76] px-4 py-1.5 rounded-full"
          >
            <Text className="text-white font-bold text-xs">Auto Apply</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderChooseTalent = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav onBack={() => setStep("PREVIEW")} />
      <Text className="text-white text-[28px] font-bold px-5 mb-2">
        What are you showing?
      </Text>
      <Text className="text-[#9CA3AF] px-5 mb-8">
        Choose the main talent category.
      </Text>

      <View className="flex-row flex-wrap px-3 mb-6">
        {[
          "Dance",
          "Voice",
          "Music",
          "Acting",
          "Comedy",
          "Film",
          "Art",
          "Other",
        ].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`w-[22%] aspect-square m-[1.5%] rounded-2xl items-center justify-center border-2 ${category === cat ? "border-[#E91E76] bg-[#E91E76]/10" : "border-white/5 bg-[#1A1D24]"}`}
          >
            <View
              className={`w-8 h-8 rounded-full mb-2 ${category === cat ? "bg-[#E91E76]/20" : "bg-white/5"}`}
            />
            <Text className="text-white text-[11px] font-medium">{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {category === "Dance" && (
        <View className="px-5">
          <Text className="text-white font-medium mb-3">
            Dance styles{" "}
            <Text className="text-[#9CA3AF] text-sm">(optional)</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              "Contemporary",
              "Hip-Hop",
              "Classical",
              "Freestyle",
              "Ballet",
              "Folk",
              "Other",
            ].map((sub) => (
              <TouchableOpacity
                key={sub}
                onPress={() => setSubCategory(sub)}
                className={`px-4 py-2 rounded-full border ${subCategory === sub ? "border-[#E91E76] bg-[#E91E76]/10" : "border-white/10"}`}
              >
                <Text
                  className={
                    subCategory === sub
                      ? "text-[#E91E76] font-medium"
                      : "text-[#9CA3AF]"
                  }
                >
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View className="mt-auto px-5 pb-10 pt-4">
        <TouchableOpacity
          onPress={() => setStep("SET_PURPOSE")}
          className="bg-[#E91E76] w-full py-4 rounded-full items-center"
        >
          <Text className="text-white font-bold text-[16px]">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSetPurpose = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav onBack={() => setStep("CHOOSE_TALENT")} />
      <Text className="text-white text-[28px] font-bold px-5 mb-2">
        What do you want from this performance?
      </Text>
      <Text className="text-[#9CA3AF] px-5 mb-8">Choose your main goal.</Text>

      <View className="px-5 gap-4">
        {[
          {
            id: "Get Discovered",
            desc: "Show this to new people",
            icon: (
              <Sparkles
                color={purpose === "Get Discovered" ? "#E91E76" : "#fff"}
              />
            ),
          },
          {
            id: "Get Feedback",
            desc: "Let people judge and help you improve",
            icon: (
              <MessageSquare
                color={purpose === "Get Feedback" ? "#E91E76" : "#fff"}
              />
            ),
          },
          {
            id: "Find Collaborators",
            desc: "Find artists, producers and creators",
            icon: (
              <Globe
                color={purpose === "Find Collaborators" ? "#E91E76" : "#fff"}
              />
            ),
          },
          {
            id: "Find Opportunities",
            desc: "Get considered for shows, auditions and projects",
            icon: (
              <CheckCircle2
                color={purpose === "Find Opportunities" ? "#E91E76" : "#fff"}
              />
            ),
          },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setPurpose(item.id)}
            className={`w-full p-5 rounded-2xl border-2 flex-row items-center ${purpose === item.id ? "border-[#E91E76] bg-[#E91E76]/5" : "border-white/5 bg-[#1A1D24]"}`}
          >
            <View className="w-12 items-center justify-center">
              {item.icon}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-white font-bold text-lg mb-1">
                {item.id}
              </Text>
              <Text className="text-[#9CA3AF] text-sm">{item.desc}</Text>
            </View>
            <ChevronRight
              color={purpose === item.id ? "#E91E76" : "#9CA3AF"}
              size={20}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-auto px-5 pb-10 pt-4">
        <TouchableOpacity
          onPress={() => setStep("DETAILS")}
          className="bg-[#E91E76] w-full py-4 rounded-full items-center"
        >
          <Text className="text-white font-bold text-[16px]">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetails = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#050608]"
    >
      <ScrollView className="flex-1">
        <View className="pt-14">
          <TopNav onBack={() => setStep("SET_PURPOSE")} />
          <Text className="text-white text-[28px] font-bold px-5 mb-2">
            Performance Details
          </Text>
          <Text className="text-[#9CA3AF] px-5 mb-8">
            Add the finishing touches.
          </Text>

          <View className="px-5">
            <View className="flex-row mb-8">
              <View className="w-24 h-36 bg-[#1A1D24] rounded-xl overflow-hidden mr-4">
                {recordedVideoUri && (
                  <VideoView
                    player={previewPlayer}
                    className="flex-1 w-full h-full"
                    contentFit="cover"
                  />
                )}
                <View className="absolute bottom-0 w-full bg-black/60 py-1">
                  <Text className="text-white text-[10px] text-center font-medium">
                    Change Cover
                  </Text>
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-[#9CA3AF] mb-2 font-medium text-xs uppercase tracking-wider">
                  Title
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Midnight Movement"
                  placeholderTextColor="#6B7280"
                  className="w-full bg-[#1A1D24] text-white px-4 py-3 rounded-xl border border-white/5 mb-4 font-medium"
                />

                <Text className="text-[#9CA3AF] mb-2 font-medium text-xs uppercase tracking-wider">
                  Location
                </Text>
                <View className="flex-row items-center bg-[#1A1D24] border border-white/5 rounded-xl px-4 py-3">
                  <MapPin color="#E91E76" size={16} className="mr-2" />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Bengaluru, India"
                    placeholderTextColor="#6B7280"
                    className="flex-1 text-white p-0 m-0 font-medium"
                  />
                </View>

                <Text className="text-[#9CA3AF] mb-2 font-medium text-xs uppercase tracking-wider mt-4">
                  Caption / Subtitle
                </Text>
                <View className="flex-row items-center bg-[#1A1D24] border border-white/5 rounded-xl px-4 py-3">
                  <Subtitles color="#E91E76" size={16} className="mr-2" />
                  <TextInput
                    value={captionText}
                    onChangeText={setCaptionText}
                    placeholder="Add a performance subtitle..."
                    placeholderTextColor="#6B7280"
                    className="flex-1 text-white p-0 m-0 font-medium"
                  />
                </View>
              </View>
            </View>

            <View className="h-[1px] bg-white/5 w-full mb-6" />

            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-[16px] mb-1">
                  Allow Judging
                </Text>
                <Text className="text-[#9CA3AF] text-sm">
                  Let viewers give this performance a Talent Score.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAllowJudging(!allowJudging)}>
                {allowJudging ? (
                  <ToggleRight color="#E91E76" size={44} />
                ) : (
                  <ToggleLeft color="#4B5563" size={44} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="flex-row justify-between items-center bg-[#1A1D24] p-4 rounded-xl border border-white/5">
              <Text className="text-white font-medium">More settings</Text>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-10 pt-4 bg-[#050608]">
        <TouchableOpacity
          className={`w-full py-4 rounded-full items-center justify-center ${title.trim() ? "bg-[#E91E76]" : "bg-[#E91E76]/50"}`}
          activeOpacity={0.8}
          disabled={!title.trim()}
          onPress={() => setStep("SUMMARY")}
        >
          <Text className="text-white font-bold text-[16px]">Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderSummary = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav onBack={() => setStep("DETAILS")} />
      <Text className="text-white text-[28px] font-bold px-5 mb-2">
        Ready to Publish?
      </Text>
      <Text className="text-[#9CA3AF] px-5 mb-8">Here's a quick summary.</Text>

      <View className="px-5">
        <View className="bg-[#1A1D24] rounded-2xl p-4 flex-row mb-6 border border-white/5">
          <View className="w-20 h-28 bg-[#2A2D34] rounded-lg overflow-hidden mr-4 relative">
            {recordedVideoUri && (
              <VideoView
                player={previewPlayer}
                className="flex-1 w-full h-full"
                contentFit="cover"
              />
            )}
            <View className="absolute inset-0 items-center justify-center bg-black/20">
              <View className="w-8 h-8 rounded-full bg-black/50 items-center justify-center">
                <Text className="text-white text-xs">▶</Text>
              </View>
            </View>
          </View>

          <View className="flex-1 justify-center">
            <Text className="text-white font-bold text-lg mb-1">{title}</Text>
            <Text className="text-[#E91E76] font-medium text-sm mb-2">
              {category} • {subCategory}
            </Text>

            <View className="flex-row items-center mb-2">
              <MapPin color="#9CA3AF" size={12} className="mr-1" />
              <Text className="text-[#9CA3AF] text-xs">{location}</Text>
            </View>

            <View className="self-start bg-white/5 px-3 py-1 rounded-full flex-row items-center">
              <Sparkles color="#E91E76" size={12} className="mr-1" />
              <Text className="text-[#9CA3AF] text-xs">Goal: {purpose}</Text>
            </View>
          </View>
        </View>

        <View className="space-y-4">
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Allow Judging</Text>
            <View className="flex-row items-center">
              <CheckCircle2 color="#10B981" size={16} className="mr-1.5" />
              <Text className="text-[#10B981] font-medium">On</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Comments (Talk)</Text>
            <View className="flex-row items-center">
              <CheckCircle2 color="#10B981" size={16} className="mr-1.5" />
              <Text className="text-[#10B981] font-medium">On</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Soundtrack</Text>
            <View className="flex-row items-center">
              <Music2 color="#E91E76" size={14} className="mr-1.5" />
              <Text className="text-[#E91E76] font-medium text-xs">
                {selectedSoundTrack !== "none"
                  ? allSoundTracks.find((s) => s.id === selectedSoundTrack)?.name
                  : "Original Mic Audio"}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Captions</Text>
            <View className="flex-row items-center">
              <Subtitles
                color={showCaptions ? "#10B981" : "#9CA3AF"}
                size={14}
                className="mr-1.5"
              />
              <Text
                className={`font-medium text-xs ${showCaptions ? "text-[#10B981]" : "text-[#9CA3AF]"}`}
              >
                {showCaptions ? "Enabled" : "Off"}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Visibility</Text>
            <View className="flex-row items-center">
              <Globe color="#9CA3AF" size={16} className="mr-1.5" />
              <Text className="text-[#9CA3AF] font-medium">Public</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="flex-row justify-between items-center bg-[#1A1D24] p-4 rounded-xl border border-white/5 mt-8">
          <Text className="text-white font-medium">More settings</Text>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
      </View>

      <View className="mt-auto px-5 pb-10">
        <TouchableOpacity
          className="w-full py-4 rounded-full items-center justify-center bg-[#E91E76]"
          activeOpacity={0.8}
          onPress={handlePublish}
        >
          <Text className="text-white font-bold text-[16px]">
            Publish Performance
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUploading = () => (
    <View className="flex-1 bg-[#050608] items-center justify-center px-8">
      <Cloud color="#E91E76" size={80} className="mb-8" opacity={0.8} />

      <Text className="text-white text-2xl font-bold text-center mb-2">
        Publishing your{"\n"}performance...
      </Text>
      <Text className="text-[#9CA3AF] text-center mb-12">
        This may take a few moments.
      </Text>

      <View className="w-full mb-8">
        <View className="flex-row justify-between mb-2">
          <Text className="text-white font-medium"></Text>
          <Text className="text-[#E91E76] font-bold">{uploadProgress}%</Text>
        </View>
        <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <View
            className="h-full bg-[#E91E76] rounded-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </View>
      </View>

      <View className="w-full space-y-4 px-4">
        <View className="flex-row items-center">
          <CheckCircle2
            color={uploadProgress > 10 ? "#E91E76" : "#4B5563"}
            size={20}
            className="mr-3"
          />
          <Text
            className={
              uploadProgress > 10 ? "text-white font-medium" : "text-[#4B5563]"
            }
          >
            Uploading video
          </Text>
        </View>
        <View className="flex-row items-center">
          <CheckCircle2
            color={uploadProgress > 50 ? "#E91E76" : "#4B5563"}
            size={20}
            className="mr-3"
          />
          <Text
            className={
              uploadProgress > 50 ? "text-white font-medium" : "text-[#4B5563]"
            }
          >
            Processing video
          </Text>
        </View>
        <View className="flex-row items-center">
          <CheckCircle2
            color={uploadProgress > 80 ? "#E91E76" : "#4B5563"}
            size={20}
            className="mr-3"
          />
          <Text
            className={
              uploadProgress > 80 ? "text-white font-medium" : "text-[#4B5563]"
            }
          >
            Saving details
          </Text>
        </View>
        <View className="flex-row items-center">
          <CheckCircle2
            color={uploadProgress >= 100 ? "#E91E76" : "#4B5563"}
            size={20}
            className="mr-3"
          />
          <Text
            className={
              uploadProgress >= 100
                ? "text-white font-medium"
                : "text-[#4B5563]"
            }
          >
            Finalizing...
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View className="flex-1 bg-[#050608] items-center justify-center px-6">
      <View className="w-24 h-24 rounded-full bg-[#E91E76] items-center justify-center mb-8 relative">
        <Check color="#fff" size={48} strokeWidth={3} />
        {/* Decorative sparkles */}
        <View className="absolute -top-4 -left-4">
          <Sparkles color="#fff" size={16} opacity={0.6} />
        </View>
        <View className="absolute top-0 -right-6">
          <Sparkles color="#fff" size={20} opacity={0.8} />
        </View>
        <View className="absolute -bottom-2 -left-8">
          <Sparkles color="#E91E76" size={14} />
        </View>
        <View className="absolute -bottom-6 right-0">
          <Sparkles color="#fff" size={18} opacity={0.5} />
        </View>
      </View>

      <Text className="text-white text-3xl font-bold text-center mb-4">
        Your performance{"\n"}is live!
      </Text>
      <Text className="text-[#9CA3AF] text-center mb-12 px-4 leading-relaxed">
        People can now watch, keep,{"\n"}talk and judge your performance.
      </Text>

      <TouchableOpacity className="w-full py-4 rounded-full items-center justify-center bg-[#E91E76] mb-4">
        <Text className="text-white font-bold text-[16px]">
          View Performance
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setStep("HOME");
          setRecordedVideoUri(null);
          setTitle("");
        }}
      >
        <Text className="text-[#9CA3AF] font-medium py-3">Create Another</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Main Switch ---
  switch (step) {
    case "HOME":
      return renderHome();
    case "RECORD":
      return renderRecord();
    case "UPLOAD":
      return renderUpload();
    case "PREVIEW":
      return renderPreview();
    case "CHOOSE_TALENT":
      return renderChooseTalent();
    case "SET_PURPOSE":
      return renderSetPurpose();
    case "DETAILS":
      return renderDetails();
    case "SUMMARY":
      return renderSummary();
    case "UPLOADING":
      return renderUploading();
    case "SUCCESS":
      return renderSuccess();
    default:
      return renderHome();
  }
}
