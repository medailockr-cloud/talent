import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Animated,
  PanResponder,
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  ChevronLeft,
  Download,
  Music,
  Smile,
  Type,
  PenTool,
  Sparkles,
  ChevronRight,
  Star,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import {
  InstagramFilter,
  INSTAGRAM_FILTERS,
} from "./InstagramFilters";
import {
  OverlayItem,
  TextOverlayItem,
  StickerOverlayItem,
  DrawingPath,
  InstagramSound,
} from "./types";
import { InstagramCanvasOverlay } from "./InstagramCanvasOverlay";
import { InstagramTextEditor } from "./InstagramTextEditor";
import { InstagramStickersSheet } from "./InstagramStickersSheet";
import { InstagramDrawingCanvas } from "./InstagramDrawingCanvas";
import { InstagramAudioPicker } from "./InstagramAudioPicker";

interface InstagramVideoEditorProps {
  mediaUri: string;
  mediaType: "video" | "image";
  initialSound?: InstagramSound | null;
  onBack: () => void;
  onSaveDraft: (draftData: any) => void;
  onNext: (editedData: {
    uri: string;
    mediaType: "video" | "image";
    filter: InstagramFilter;
    sound: InstagramSound | null;
    overlayItems: OverlayItem[];
    drawingPaths: DrawingPath[];
    cameraVolume: number;
    soundVolume: number;
  }) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function InstagramVideoEditor({
  mediaUri,
  mediaType,
  initialSound,
  onBack,
  onSaveDraft,
  onNext,
}: InstagramVideoEditorProps) {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 28) : 0;
  const safeTop = Math.max(insets.top, statusBarHeight, Platform.OS === "android" ? 28 : 20);
  const topBarTop = safeTop + 4;
  const bottomBarBottom = Math.max(insets.bottom, Platform.OS === "android" ? 16 : 24);

  // Filters
  const [filterIndex, setFilterIndex] = useState(0);
  const currentFilter = INSTAGRAM_FILTERS[filterIndex];
  const [filterIntensity, setFilterIntensity] = useState(1);
  const [showFilterTray, setShowFilterTray] = useState(false);

  // Filter Name Badge Animation on Swipe
  const filterBadgeAnim = useRef(new Animated.Value(0)).current;
  const [filterBadgeName, setFilterBadgeName] = useState("NORMAL");

  // Audio & Volumes
  const [activeSound, setActiveSound] = useState<InstagramSound | null>(
    initialSound || null
  );
  const [showAudioPicker, setShowAudioPicker] = useState(false);
  const [cameraAudioVolume, setCameraAudioVolume] = useState(1);
  const [soundAudioVolume, setSoundAudioVolume] = useState(1);

  // Overlay Elements
  const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);

  // Modals
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTextItem, setEditingTextItem] = useState<TextOverlayItem | null>(null);
  const [showStickersSheet, setShowStickersSheet] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);

  // Saved Toast
  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Video Player
  const player = useVideoPlayer(
    mediaType === "video" ? mediaUri : null,
    (p) => {
      if (mediaType === "video" && mediaUri) {
        p.loop = true;
        p.muted = cameraAudioVolume === 0;
        p.play();
      }
    }
  );

  const [isPlaying, setIsPlaying] = useState(true);

  // Sync mute state with player
  useEffect(() => {
    if (player && mediaType === "video") {
      player.muted = cameraAudioVolume === 0;
      player.volume = cameraAudioVolume;
    }
  }, [player, cameraAudioVolume, mediaType]);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Show filter name popup
  const showFilterPopup = (name: string) => {
    setFilterBadgeName(name.toUpperCase());
    filterBadgeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(filterBadgeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(650),
      Animated.timing(filterBadgeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Horizontal Swipe PanResponder to cycle filters
  const swipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Trigger on horizontal swipe greater than 20px
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 40) {
          // Swipe Right: Previous Filter
          triggerHaptic();
          setFilterIndex((prev) => {
            const nextIdx = (prev - 1 + INSTAGRAM_FILTERS.length) % INSTAGRAM_FILTERS.length;
            showFilterPopup(INSTAGRAM_FILTERS[nextIdx].name);
            return nextIdx;
          });
        } else if (gestureState.dx < -40) {
          // Swipe Left: Next Filter
          triggerHaptic();
          setFilterIndex((prev) => {
            const nextIdx = (prev + 1) % INSTAGRAM_FILTERS.length;
            showFilterPopup(INSTAGRAM_FILTERS[nextIdx].name);
            return nextIdx;
          });
        }
      },
    })
  ).current;

  // Toggle Video Play/Pause
  const handleTogglePlay = () => {
    if (player && mediaType === "video") {
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    }
  };

  // Save Video Toast
  const handleDownload = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowSaveToast(true);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowSaveToast(false));
  };

  // Discard Confirmation Dialog
  const handleBackPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Discard Media?",
      "If you go back now, you'll lose all changes and edits made to this performance.",
      [
        {
          text: "Discard",
          style: "destructive",
          onPress: onBack,
        },
        {
          text: "Save Draft",
          onPress: () => {
            onSaveDraft({
              uri: mediaUri,
              mediaType,
              filter: currentFilter.id,
              sound: activeSound,
              overlayItems,
            });
            onBack();
          },
        },
        {
          text: "Keep Editing",
          style: "cancel",
        },
      ]
    );
  };

  // Next -> Navigate to publishing
  const handleNextPress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    onNext({
      uri: mediaUri,
      mediaType,
      filter: currentFilter,
      sound: activeSound,
      overlayItems,
      drawingPaths,
      cameraVolume: cameraAudioVolume,
      soundVolume: soundAudioVolume,
    });
  };

  // Text management
  const handleSaveText = (item: TextOverlayItem) => {
    setOverlayItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
    setEditingTextItem(null);
  };

  const handleUpdateItem = (updated: OverlayItem) => {
    setOverlayItems((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  const handleDeleteItem = (id: string) => {
    setOverlayItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleEditText = (item: TextOverlayItem) => {
    setEditingTextItem(item);
    setShowTextEditor(true);
  };

  return (
    <View style={styles.container}>
      {/* 1. Main Viewport with Filter Tint & Gesture Handler */}
      <View style={styles.mediaViewport} {...swipeResponder.panHandlers}>
        {/* Media (VideoView or Image) */}
        {mediaType === "video" && player ? (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleTogglePlay}
          >
            <VideoView
              player={player}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              nativeControls={false}
            />
          </TouchableOpacity>
        ) : (
          <Image
            source={{ uri: mediaUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}

        {/* Instagram Filter Tint Overlay */}
        {currentFilter.overlayColor && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: currentFilter.overlayColor,
                opacity: currentFilter.overlayOpacity
                  ? currentFilter.overlayOpacity * filterIntensity
                  : 0.6 * filterIntensity,
              },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Filter Name Pop-up Badge */}
        <Animated.View
          style={[
            styles.filterBadge,
            {
              opacity: filterBadgeAnim,
              transform: [
                {
                  scale: filterBadgeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.filterBadgeText}>{filterBadgeName}</Text>
        </Animated.View>

        {/* Canvas Overlay for Draggable Texts, Stickers, and Drawings */}
        <InstagramCanvasOverlay
          items={overlayItems}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onEditText={handleEditText}
          drawingPaths={drawingPaths}
        />
      </View>

      {/* 2. Top Header Navigation & Tools Bar */}
      <View style={[styles.topHeaderBar, { top: topBarTop }]}>
        {/* Back Discard Button */}
        <TouchableOpacity
          style={styles.circleToolBtn}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>

        {/* Action Tools: Download | Music | Stickers | Drawing | Text | Effects */}
        <View style={styles.topToolsRow}>
          {/* Download to camera roll */}
          <TouchableOpacity
            style={styles.circleToolBtn}
            onPress={handleDownload}
            activeOpacity={0.7}
          >
            <Download color="#fff" size={22} />
          </TouchableOpacity>

          {/* Music / Audio Studio */}
          <TouchableOpacity
            style={[
              styles.circleToolBtn,
              activeSound && styles.activeCircleToolBtn,
            ]}
            onPress={() => setShowAudioPicker(true)}
            activeOpacity={0.7}
          >
            <Music color={activeSound ? "#000" : "#fff"} size={22} />
          </TouchableOpacity>

          {/* Stickers Sheet */}
          <TouchableOpacity
            style={styles.circleToolBtn}
            onPress={() => setShowStickersSheet(true)}
            activeOpacity={0.7}
          >
            <Smile color="#fff" size={22} />
          </TouchableOpacity>

          {/* Freehand Drawing Canvas */}
          <TouchableOpacity
            style={[
              styles.circleToolBtn,
              drawingPaths.length > 0 && styles.activeCircleToolBtn,
            ]}
            onPress={() => setShowDrawingCanvas(true)}
            activeOpacity={0.7}
          >
            <PenTool color={drawingPaths.length > 0 ? "#000" : "#fff"} size={22} />
          </TouchableOpacity>

          {/* Typography Text Studio */}
          <TouchableOpacity
            style={styles.circleToolBtn}
            onPress={() => {
              setEditingTextItem(null);
              setShowTextEditor(true);
            }}
            activeOpacity={0.7}
          >
            <Type color="#fff" size={23} />
          </TouchableOpacity>

          {/* Filter Fine-Tuning Tray */}
          <TouchableOpacity
            style={[
              styles.circleToolBtn,
              showFilterTray && styles.activeCircleToolBtn,
            ]}
            onPress={() => setShowFilterTray((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Sparkles color={showFilterTray ? "#000" : "#fff"} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Filter Fine-Tuning Intensity Bar */}
      {showFilterTray && (
        <View style={styles.filterTrayContainer}>
          <Text style={styles.filterTrayTitle}>
            {currentFilter.name} Intensity ({Math.round(filterIntensity * 100)}%)
          </Text>
          <View style={styles.intensityRow}>
            {[0.25, 0.5, 0.75, 1.0].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.intensityPill,
                  filterIntensity === val && styles.intensityPillActive,
                ]}
                onPress={() => {
                  triggerHaptic();
                  setFilterIntensity(val);
                }}
              >
                <Text
                  style={[
                    styles.intensityPillText,
                    filterIntensity === val && styles.intensityPillTextActive,
                  ]}
                >
                  {Math.round(val * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 4. Bottom Footer Bar (1:1 Instagram Android) */}
      <View style={[styles.bottomFooterBar, { bottom: bottomBarBottom }]}>
        {/* Your Story Button */}
        <TouchableOpacity
          style={styles.storyPill}
          onPress={handleNextPress}
          activeOpacity={0.8}
        >
          <View style={styles.storyAvatarBorder}>
            <View style={styles.storyAvatarInner} />
          </View>
          <Text style={styles.storyPillText}>Your Story</Text>
        </TouchableOpacity>

        {/* Close Friends Button */}
        <TouchableOpacity
          style={styles.closeFriendsPill}
          onPress={handleNextPress}
          activeOpacity={0.8}
        >
          <View style={styles.greenStarBadge}>
            <Star color="#10B981" fill="#10B981" size={14} />
          </View>
          <Text style={styles.closeFriendsText}>Close Friends</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextPill}
          onPress={handleNextPress}
          activeOpacity={0.85}
        >
          <Text style={styles.nextPillText}>Next</Text>
          <ChevronRight color="#000" size={18} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* 5. Save Toast Banner */}
      {showSaveToast && (
        <Animated.View
          style={[
            styles.saveToast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Check color="#10B981" size={18} strokeWidth={3} style={{ marginRight: 8 }} />
          <Text style={styles.saveToastText}>Saved to camera roll</Text>
        </Animated.View>
      )}

      {/* 6. Typography Modal */}
      <InstagramTextEditor
        visible={showTextEditor}
        onClose={() => {
          setShowTextEditor(false);
          setEditingTextItem(null);
        }}
        onSaveText={handleSaveText}
        editingItem={editingTextItem}
      />

      {/* 7. Stickers Sheet Modal */}
      <InstagramStickersSheet
        visible={showStickersSheet}
        onClose={() => setShowStickersSheet(false)}
        onAddSticker={(stk) => setOverlayItems((prev) => [...prev, stk])}
        activeSoundTitle={activeSound?.title}
        activeSoundArtist={activeSound?.artist}
      />

      {/* 8. Freehand Drawing Canvas Modal */}
      <InstagramDrawingCanvas
        visible={showDrawingCanvas}
        onClose={() => setShowDrawingCanvas(false)}
        paths={drawingPaths}
        onSavePaths={setDrawingPaths}
      />

      {/* 9. Audio Picker Modal */}
      <InstagramAudioPicker
        visible={showAudioPicker}
        onClose={() => setShowAudioPicker(false)}
        selectedSound={activeSound}
        onSelectSound={setActiveSound}
        cameraAudioVolume={cameraAudioVolume}
        onChangeCameraVolume={setCameraAudioVolume}
        soundAudioVolume={soundAudioVolume}
        onChangeSoundVolume={setSoundAudioVolume}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mediaViewport: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  filterBadge: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 30,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  topHeaderBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    zIndex: 40,
  },
  circleToolBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircleToolBtn: {
    backgroundColor: "#fff",
  },
  topToolsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterTrayContainer: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "rgba(24, 24, 27, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 45,
  },
  filterTrayTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  intensityRow: {
    flexDirection: "row",
    gap: 8,
  },
  intensityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  intensityPillActive: {
    backgroundColor: "#fff",
  },
  intensityPillText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  intensityPillTextActive: {
    color: "#000",
    fontWeight: "800",
  },
  bottomFooterBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    zIndex: 40,
    gap: 8,
  },
  storyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  storyAvatarBorder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E1306C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  storyAvatarInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  storyPillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  closeFriendsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  greenStarBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  closeFriendsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  nextPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  nextPillText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 4,
  },
  saveToast: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(28, 28, 30, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 99,
  },
  saveToastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
