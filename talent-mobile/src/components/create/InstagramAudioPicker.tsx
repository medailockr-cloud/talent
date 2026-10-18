import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  ChevronLeft,
  Search,
  X,
  Play,
  Pause,
  Music,
  Check,
  Volume2,
  Sliders,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { api } from "../../utils/api";
import { InstagramSound } from "./types";

interface InstagramAudioPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedSound: InstagramSound | null;
  onSelectSound: (sound: InstagramSound | null) => void;
  cameraAudioVolume: number;
  onChangeCameraVolume: (vol: number) => void;
  soundAudioVolume: number;
  onChangeSoundVolume: (vol: number) => void;
}

export function InstagramAudioPicker({
  visible,
  onClose,
  selectedSound,
  onSelectSound,
  cameraAudioVolume,
  onChangeCameraVolume,
  soundAudioVolume,
  onChangeSoundVolume,
}: InstagramAudioPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Trending");
  const [sounds, setSounds] = useState<InstagramSound[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [scrubberOffset, setScrubberOffset] = useState<number>(0);
  const [showVolumeMixer, setShowVolumeMixer] = useState(false);

  // Fetch sounds from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadSounds() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("q", searchQuery);
        if (selectedCategory && selectedCategory !== "For You") {
          queryParams.append("category", selectedCategory);
        }
        const res = await api.get(`/api/sounds?${queryParams.toString()}`);
        if (isMounted && res.data && res.data.sounds) {
          setSounds(res.data.sounds);
        }
      } catch (e) {
        // Fallback curated sounds
        if (isMounted) {
          setSounds([
            {
              id: "sound_1",
              title: "Golden Hour Glow",
              artist: "JVKE & Talent Records",
              category: "Trending",
              duration: 45,
              usesCount: 1420000,
              coverUrl:
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop",
              audioUrl:
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
              waveform: [20, 35, 55, 80, 95, 70, 60, 85, 100, 90, 75, 45, 60],
            },
            {
              id: "sound_2",
              title: "Midnight Tokyo Drift",
              artist: "Synthwave Collective",
              category: "Viral",
              duration: 30,
              usesCount: 890000,
              coverUrl:
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
              audioUrl:
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
              waveform: [40, 60, 70, 90, 85, 60, 45, 80, 95, 100, 85, 65, 50],
            },
            {
              id: "sound_3",
              title: "Acoustic Sunset Breeze",
              artist: "Maya Chen",
              category: "Acoustic",
              duration: 60,
              usesCount: 540000,
              coverUrl:
                "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&h=200&fit=crop",
              audioUrl:
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
              waveform: [15, 25, 40, 55, 65, 50, 40, 60, 75, 70, 60, 45, 35],
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (visible) {
      loadSounds();
    }
    return () => {
      isMounted = false;
    };
  }, [visible, searchQuery, selectedCategory]);

  const audioRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current = null;
        } catch (e) {}
      }
    };
  }, []);

  if (!visible) return null;

  const CATEGORIES = ["For You", "Trending", "Viral", "Pop", "Hip-Hop", "Acoustic", "EDM"];

  const handleTogglePlay = (sound: InstagramSound) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    if (playingSoundId === sound.id) {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      setPlayingSoundId(null);
    } else {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      setPlayingSoundId(sound.id);
      if (Platform.OS === "web" && typeof Audio !== "undefined" && sound.audioUrl) {
        try {
          const a = new Audio(sound.audioUrl);
          a.volume = soundAudioVolume;
          a.play().catch(() => {});
          a.onended = () => setPlayingSoundId(null);
          audioRef.current = a;
        } catch (e) {}
      }
    }
  };

  const handleSelect = (sound: InstagramSound) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (e) {}
    }
    setPlayingSoundId(null);
    if (selectedSound?.id === sound.id) {
      onSelectSound(null);
    } else {
      onSelectSound(sound);
    }
  };

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (e) {}
    }
    setPlayingSoundId(null);
    onClose();
  };

  return (
    <View style={styles.fullscreenModal}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.headerButton}
        >
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audio</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.selectionAsync();
              }
              setShowVolumeMixer((prev) => !prev);
            }}
            style={styles.headerButton}
          >
            <Sliders color={showVolumeMixer ? "#38BDF8" : "#fff"} size={22} />
          </TouchableOpacity>
          {selectedSound && (
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.headerButton, { backgroundColor: "#fff", borderRadius: 16, width: 32, height: 32 }]}
            >
              <Check color="#000" size={18} strokeWidth={3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Audio Mixer Drawer (Camera Audio vs Sound Track) */}
      {showVolumeMixer && (
        <View style={styles.mixerContainer}>
          <Text style={styles.mixerTitle}>Audio Controls</Text>
          <View style={styles.mixerRow}>
            <Text style={styles.mixerLabel}>Camera Audio</Text>
            <View style={styles.volumeBarWrapper}>
              <TouchableOpacity
                style={styles.volumeLevelButton}
                onPress={() => onChangeCameraVolume(cameraAudioVolume === 0 ? 1 : 0)}
              >
                <Volume2 color={cameraAudioVolume > 0 ? "#fff" : "#666"} size={18} />
              </TouchableOpacity>
              <Text style={styles.volumePercentText}>
                {Math.round(cameraAudioVolume * 100)}%
              </Text>
            </View>
          </View>

          {selectedSound && (
            <View style={styles.mixerRow}>
              <Text style={styles.mixerLabel}>{selectedSound.title}</Text>
              <View style={styles.volumeBarWrapper}>
                <TouchableOpacity
                  style={styles.volumeLevelButton}
                  onPress={() => onChangeSoundVolume(soundAudioVolume === 0 ? 1 : 0)}
                >
                  <Music color={soundAudioVolume > 0 ? "#38BDF8" : "#666"} size={18} />
                </TouchableOpacity>
                <Text style={styles.volumePercentText}>
                  {Math.round(soundAudioVolume * 100)}%
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Search color="#888" size={18} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search music..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X color="#888" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, isActive && styles.activeCategoryPill]}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.selectionAsync();
                }
                setSelectedCategory(cat);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sound Track List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.soundList}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {sounds.map((sound) => {
            const isSelected = selectedSound?.id === sound.id;
            const isPlaying = playingSoundId === sound.id;

            return (
              <View key={sound.id} style={styles.soundCard}>
                {/* Cover with Play Overlay */}
                <TouchableOpacity
                  style={styles.coverWrapper}
                  onPress={() => handleTogglePlay(sound)}
                >
                  <Image source={{ uri: sound.coverUrl }} style={styles.coverImage} />
                  <View style={styles.playOverlay}>
                    {isPlaying ? (
                      <Pause color="#fff" size={18} fill="#fff" />
                    ) : (
                      <Play color="#fff" size={18} fill="#fff" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Info */}
                <TouchableOpacity
                  style={styles.infoWrapper}
                  onPress={() => handleSelect(sound)}
                >
                  <Text style={styles.soundTitle} numberOfLines={1}>
                    {sound.title}
                  </Text>
                  <Text style={styles.soundArtist} numberOfLines={1}>
                    {sound.artist} • {sound.duration}s
                  </Text>
                  {sound.usesCount && (
                    <Text style={styles.usesCountText}>
                      {(sound.usesCount / 1000000).toFixed(1)}M reels
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Select Checkmark / Use Button */}
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    isSelected && styles.selectedButtonActive,
                  ]}
                  onPress={() => handleSelect(sound)}
                >
                  {isSelected ? (
                    <Check color="#000" size={16} strokeWidth={3} />
                  ) : (
                    <Text style={styles.useText}>Use</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Bottom Waveform Scrubber (when a sound is selected) */}
      {selectedSound && (
        <View style={styles.bottomScrubberSheet}>
          <View style={styles.scrubberHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scrubberTitle} numberOfLines={1}>
                {selectedSound.title}
              </Text>
              <Text style={styles.scrubberSubtitle}>
                Slide waveform to adjust snippet
              </Text>
            </View>
            <TouchableOpacity
              style={styles.donePill}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.selectionAsync();
                }
                onClose();
              }}
            >
              <Text style={styles.donePillText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Waveform graphic */}
          <View style={styles.waveformContainer}>
            {(selectedSound.waveform || [30, 60, 90, 70, 45, 80, 100, 60, 40, 75, 90, 50]).map(
              (h, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: (h / 100) * 36,
                      backgroundColor: i >= 4 && i <= 8 ? "#38BDF8" : "rgba(255, 255, 255, 0.3)",
                    },
                  ]}
                />
              )
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 100,
    paddingTop: Platform.OS === "android" ? 30 : 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    marginHorizontal: 16,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    padding: 0,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1F1F1F",
  },
  activeCategoryPill: {
    backgroundColor: "#fff",
  },
  categoryText: {
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
  },
  activeCategoryText: {
    color: "#000",
    fontWeight: "700",
  },
  soundList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  soundCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  coverWrapper: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    marginRight: 14,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoWrapper: {
    flex: 1,
  },
  soundTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  soundArtist: {
    color: "#888",
    fontSize: 13,
  },
  usesCountText: {
    color: "#555",
    fontSize: 11,
    marginTop: 2,
  },
  selectButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  selectedButtonActive: {
    backgroundColor: "#fff",
  },
  useText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  bottomScrubberSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#161616",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "android" ? 24 : 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  scrubberHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  scrubberTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  scrubberSubtitle: {
    color: "#777",
    fontSize: 12,
  },
  donePill: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  donePillText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },
  waveformContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  mixerContainer: {
    backgroundColor: "#1A1A1A",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mixerTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  mixerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  mixerLabel: {
    color: "#ccc",
    fontSize: 13,
    flex: 1,
  },
  volumeBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  volumeLevelButton: {
    padding: 6,
    backgroundColor: "#2A2A2A",
    borderRadius: 14,
  },
  volumePercentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
});
