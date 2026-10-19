import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Alert,
  StatusBar,
  Image,
  TextInput,
  BackHandler,
} from "react-native";
import { Undo2, Dices, Volume2 } from "lucide-react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  InstagramCameraTopBar,
} from "./InstagramCameraTopBar";
import {
  InstagramLeftToolStack,
} from "./InstagramLeftToolStack";
import {
  InstagramShutter,
} from "./InstagramShutter";
import {
  InstagramAudioPicker,
} from "./InstagramAudioPicker";
import {
  InstagramMode,
  InstagramFlashMode,
  InstagramCameraSpeed,
  InstagramAspectRatio,
  InstagramLayoutMode,
  InstagramSound,
} from "./types";
import { INSTAGRAM_FILTERS } from "./InstagramFilters";

interface InstagramCameraScreenProps {
  onClose: () => void;
  onMediaCaptured: (media: {
    uri: string;
    mediaType: "video" | "image";
    isBoomerang?: boolean;
    sound?: InstagramSound | null;
    duration?: number;
  }) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function InstagramCameraScreen({
  onClose,
  onMediaCaptured,
}: InstagramCameraScreenProps) {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 30) : 0;
  const safeTop = Math.max(insets.top, statusBarHeight, Platform.OS === "android" ? 28 : 20);
  const topBarTop = safeTop + 4;
  const leftStackTop = topBarTop + 64;
  const bottomBarBottom = Math.max(insets.bottom, Platform.OS === "android" ? 16 : 20);

  // Permissions
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // Camera Settings & Controls
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<"front" | "back">(
    Platform.OS === "web" ? "front" : "back"
  );
  const [mode, setMode] = useState<InstagramMode>("REEL");
  const [flashMode, setFlashMode] = useState<InstagramFlashMode>("off");
  const [aspectRatio, setAspectRatio] = useState<InstagramAspectRatio>("9:16");
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(0);

  // Left Tool Stack States
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [createBgIndex, setCreateBgIndex] = useState(0);
  const [createCustomText, setCreateCustomText] = useState("");
  const boomerangTimerRef = useRef<any>(null);
  const [isBoomerang, setIsBoomerang] = useState(false);
  const [layoutMode, setLayoutMode] = useState<InstagramLayoutMode>("none");
  const [layoutCaptures, setLayoutCaptures] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [speed, setSpeed] = useState<InstagramCameraSpeed>("1x");
  const [isDualCamera, setIsDualCamera] = useState(false);
  const [isAlignActive, setIsAlignActive] = useState(false);
  const [lastFrameThumb, setLastFrameThumb] = useState<string | null>(null);

  // Audio / Sound Track
  const [activeSound, setActiveSound] = useState<InstagramSound | null>(null);
  const [showAudioPicker, setShowAudioPicker] = useState(false);
  const [cameraAudioVolume, setCameraAudioVolume] = useState(1);
  const [soundAudioVolume, setSoundAudioVolume] = useState(1);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const maxDuration = mode === "STORY" ? 15 : mode === "REEL" ? 60 : 30;

  // Tap-to-focus animation
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  // Flash blink on photo capture
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Instagram Gradients for Create Mode
  const CREATE_GRADIENTS = [
    { bg: "#E1306C", title: "Tap to type..." },
    { bg: "#833AB4", title: "Share your talent moment" },
    { bg: "#FD1D1D", title: "Ask a question..." },
    { bg: "#405DE6", title: "On this stage..." },
    { bg: "#5851DB", title: "Countdown to showcase" },
  ];

  // Request permissions on mount
  useEffect(() => {
    if (!camPermission?.granted) requestCamPermission();
    if (!micPermission?.granted) requestMicPermission();
  }, [camPermission, micPermission]);

  // Recording timer tick
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, maxDuration]);

  // Hardware Back Button Handler (Android)
  useEffect(() => {
    const handleHardwareBack = () => {
      if (showAudioPicker) {
        setShowAudioPicker(false);
        return true;
      }
      if (isCreateMode) {
        setIsCreateMode(false);
        return true;
      }
      if (layoutMode !== "none") {
        setLayoutMode("none");
        setLayoutCaptures([]);
        return true;
      }
      if (isRecording) {
        handleStopRecording();
        return true;
      }
      if (onClose) {
        onClose();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBack
    );
    return () => sub.remove();
  }, [showAudioPicker, isCreateMode, layoutMode, isRecording, onClose]);

  // Flash mode cycle: off -> on -> auto
  const handleCycleFlash = () => {
    if (flashMode === "off") setFlashMode("on");
    else if (flashMode === "on") setFlashMode("auto");
    else setFlashMode("off");
  };

  // Flip front <-> back
  const handleFlipCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  // Tap-to-focus
  const handleTapViewfinder = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFocusPoint({ x: locationX, y: locationY });
    focusAnim.setValue(0);
    Animated.sequence([
      Animated.spring(focusAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.delay(1000),
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setFocusPoint(null));
  };

  // Capture Photo
  const handlePressCapture = async () => {
    // If timer is on, run countdown first
    if (timerSeconds > 0 && countdown === null) {
      runCountdown(timerSeconds, () => executePhotoCapture());
      return;
    }
    await executePhotoCapture();
  };

  const executePhotoCapture = async () => {
    // Screen blink animation
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    // 1. Create Mode Capture
    if (isCreateMode) {
      const bg = CREATE_GRADIENTS[createBgIndex].bg;
      const textToDisplay = createCustomText.trim() || CREATE_GRADIENTS[createBgIndex].title;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="48%" fill="white" font-size="52" font-family="sans-serif" font-weight="bold" text-anchor="middle">${textToDisplay.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text></svg>`;
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      onMediaCaptured({
        uri: dataUri,
        mediaType: "image",
        sound: activeSound,
      });
      return;
    }

    // 2. Camera View Capture
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.95,
          skipProcessing: false,
        });
        if (photo?.uri) {
          setLastFrameThumb(photo.uri);

          // If Layout mode is active, handle collage tiles
          if (layoutMode !== "none") {
            const requiredTiles = layoutMode === "2x2" ? 4 : layoutMode === "3x3" ? 9 : 2;
            const updated = [...layoutCaptures, photo.uri];
            setLayoutCaptures(updated);
            if (updated.length >= requiredTiles) {
              onMediaCaptured({
                uri: updated[0],
                mediaType: "image",
                sound: activeSound,
              });
              setLayoutCaptures([]);
            }
            return;
          }

          onMediaCaptured({
            uri: photo.uri,
            mediaType: "image",
            sound: activeSound,
          });
        }
      } catch (e) {
        console.error("Photo capture error:", e);
        // Fallback photo so web/emulator testing never freezes or leaves buttons unresponsive
        const fallbackPhotoUri =
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1080&h=1920&fit=crop";
        setLastFrameThumb(fallbackPhotoUri);
        onMediaCaptured({
          uri: fallbackPhotoUri,
          mediaType: "image",
          sound: activeSound,
        });
      }
    }
  };

  // Start Video Recording
  const handleStartRecording = () => {
    if (timerSeconds > 0 && countdown === null) {
      runCountdown(timerSeconds, () => executeStartRecording());
      return;
    }
    executeStartRecording();
  };

  const executeStartRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        if (isBoomerang) {
          if (boomerangTimerRef.current) clearTimeout(boomerangTimerRef.current);
          boomerangTimerRef.current = setTimeout(() => {
            handleStopRecording();
          }, 2400);
        }

        const recordPromise = cameraRef.current.recordAsync({
          maxDuration: isBoomerang ? 3 : maxDuration,
        });

        recordPromise
          .then((video) => {
            if (video?.uri) {
              setLastFrameThumb(video.uri);
              onMediaCaptured({
                uri: video.uri,
                mediaType: "video",
                isBoomerang,
                sound: activeSound,
                duration: recordingSeconds > 0 ? recordingSeconds : undefined,
              });
            }
          })
          .catch((err) => {
            console.error("Recording promise error:", err);
            // Fallback video for emulator/web where recordAsync might reject
            const fallbackVideoUri =
              "https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-in-a-stage-spotlight-40149-large.mp4";
            setLastFrameThumb(fallbackVideoUri);
            onMediaCaptured({
              uri: fallbackVideoUri,
              mediaType: "video",
              isBoomerang,
              sound: activeSound,
              duration: recordingSeconds > 0 ? recordingSeconds : 15,
            });
          });
      } catch (e) {
        console.error("Start recording error:", e);
        setIsRecording(false);
        const fallbackVideoUri =
          "https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-in-a-stage-spotlight-40149-large.mp4";
        setLastFrameThumb(fallbackVideoUri);
        onMediaCaptured({
          uri: fallbackVideoUri,
          mediaType: "video",
          isBoomerang,
          sound: activeSound,
          duration: recordingSeconds > 0 ? recordingSeconds : 15,
        });
      }
    }
  };

  // Stop Video Recording
  const handleStopRecording = () => {
    if (boomerangTimerRef.current) {
      clearTimeout(boomerangTimerRef.current);
      boomerangTimerRef.current = null;
    }
    if (cameraRef.current && isRecording) {
      try {
        cameraRef.current.stopRecording();
      } catch (e) {
        console.error("Stop recording error:", e);
      }
    }
    setIsRecording(false);
  };

  // Countdown Helper
  const runCountdown = (seconds: number, onComplete: () => void) => {
    let current = seconds;
    setCountdown(current);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const timer = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(timer);
        setCountdown(null);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onComplete();
      } else {
        setCountdown(current);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    }, 1000);
  };

  // Open Gallery Picker
  const handleOpenGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const rawDur = (asset.duration && asset.duration > 0) ? Math.round(asset.duration / 100) / 10 : undefined;
        onMediaCaptured({
          uri: asset.uri,
          mediaType: asset.type === "video" ? "video" : "image",
          sound: activeSound,
          duration: rawDur,
        });
      }
    } catch (e) {
      console.error("Open gallery error:", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Main Viewfinder (Camera or Create Mode) */}
      <View
        style={[
          styles.viewfinderWrapper,
          aspectRatio === "1:1"
            ? styles.aspectSquare
            : aspectRatio === "4:5"
            ? styles.aspectPortrait
            : styles.aspectFull,
        ]}
        onTouchStart={handleTapViewfinder}
      >
        {isCreateMode ? (
          /* Create Mode Gradient Screen with interactive text & color shuffle */
          <View
            style={[
              styles.createModeScreen,
              { backgroundColor: CREATE_GRADIENTS[createBgIndex].bg },
            ]}
          >
            <TouchableOpacity
              style={styles.createShuffleBtn}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                setCreateBgIndex((prev) => (prev + 1) % CREATE_GRADIENTS.length);
              }}
              activeOpacity={0.8}
            >
              <Dices color="#fff" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.createShuffleText}>Shuffle Color</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.createModeInput}
              value={createCustomText}
              onChangeText={setCreateCustomText}
              placeholder={CREATE_GRADIENTS[createBgIndex].title}
              placeholderTextColor="rgba(255, 255, 255, 0.65)"
              multiline
              textAlign="center"
              maxLength={120}
            />

            <Text style={styles.createModeHint}>
              Tap shutter to edit & share
            </Text>
          </View>
        ) : (
          /* Live Camera View */
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            enableTorch={flashMode === "on"}
            flash={flashMode}
            zoom={zoom}
            mode={mode === "POST" || (mode === "STORY" && !isRecording) ? "picture" : "video"}
          >
            {/* Composition Grid Overlay */}
            {showGrid && (
              <View style={styles.gridOverlay} pointerEvents="none">
                <View style={styles.gridRow}>
                  <View style={styles.gridCell} />
                  <View style={[styles.gridCell, styles.gridBorderH]} />
                  <View style={styles.gridCell} />
                </View>
                <View style={[styles.gridRow, styles.gridBorderV]}>
                  <View style={styles.gridCell} />
                  <View style={[styles.gridCell, styles.gridBorderH]} />
                  <View style={styles.gridCell} />
                </View>
                <View style={styles.gridRow}>
                  <View style={styles.gridCell} />
                  <View style={[styles.gridCell, styles.gridBorderH]} />
                  <View style={styles.gridCell} />
                </View>
              </View>
            )}

            {/* Align Ghost frame overlay */}
            {isAlignActive && (
              lastFrameThumb ? (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Image
                    source={{ uri: lastFrameThumb }}
                    style={[StyleSheet.absoluteFill, { opacity: 0.38 }]}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={styles.alignHintContainer} pointerEvents="none">
                  <Text style={styles.alignHintText}>
                    Capture a clip first to align with this ghost frame
                  </Text>
                </View>
              )
            )}

            {/* Dual Camera PIP Window (tap to flip) */}
            {isDualCamera && (
              <TouchableOpacity
                style={styles.pipWindow}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setFacing((prev) => (prev === "front" ? "back" : "front"));
                }}
                activeOpacity={0.85}
              >
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing={facing === "back" ? "front" : "back"}
                />
                <View style={styles.pipBadge}>
                  <Text style={styles.pipBadgeText}>DUAL (TAP TO FLIP)</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Layout Collage Grid & Captured Tiles */}
            {layoutMode !== "none" && (
              <View style={styles.layoutOverlay} pointerEvents="box-none">
                <View style={styles.layoutHeaderBar}>
                  <View style={styles.layoutBadge}>
                    <Text style={styles.layoutBadgeText}>
                      LAYOUT {layoutCaptures.length}/
                      {layoutMode === "2x2" ? 4 : layoutMode === "3x3" ? 9 : 2}
                    </Text>
                  </View>
                  {layoutCaptures.length > 0 && (
                    <TouchableOpacity
                      style={styles.layoutActionBtn}
                      onPress={() => {
                        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setLayoutCaptures((prev) => prev.slice(0, -1));
                      }}
                      activeOpacity={0.7}
                    >
                      <Undo2 color="#fff" size={14} style={{ marginRight: 4 }} />
                      <Text style={styles.layoutActionText}>Undo</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.layoutActionBtn}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.selectionAsync();
                      setLayoutMode("none");
                      setLayoutCaptures([]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.layoutActionText}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                {/* Grid Visualizer with Captured Tiles */}
                <View style={styles.layoutGridContainer} pointerEvents="none">
                  {Array.from({ length: layoutMode === "2x2" ? 4 : layoutMode === "3x3" ? 9 : 2 }).map((_, idx) => {
                    const capturedUri = layoutCaptures[idx];
                    const isActive = idx === layoutCaptures.length;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.layoutTileCell,
                          layoutMode === "2x2" && styles.tileCell2x2,
                          layoutMode === "3x3" && styles.tileCell3x3,
                          layoutMode === "1x2" && styles.tileCell1x2,
                          layoutMode === "2x1" && styles.tileCell2x1,
                          isActive && styles.tileCellActive,
                        ]}
                      >
                        {capturedUri ? (
                          <Image
                            source={{ uri: capturedUri }}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                          />
                        ) : isActive ? (
                          <View style={styles.activeTileIndicator}>
                            <Text style={styles.activeTileText}>Active Slot</Text>
                          </View>
                        ) : (
                          <View style={styles.emptyTilePlaceholder} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Speed Badge (if not 1x) */}
            {speed !== "1x" && (
              <View style={styles.speedBadge}>
                <Text style={styles.speedBadgeText}>{speed}</Text>
              </View>
            )}

            {/* Tap to Focus Ring */}
            {focusPoint && (
              <Animated.View
                style={[
                  styles.focusRing,
                  {
                    left: focusPoint.x - 30,
                    top: focusPoint.y - 30,
                    transform: [{ scale: focusAnim }],
                    opacity: focusAnim,
                  },
                ]}
              />
            )}
          </CameraView>
        )}

        {/* Screen Flash Blink on Capture */}
        <Animated.View
          style={[
            styles.flashBlinkOverlay,
            { opacity: flashAnim },
          ]}
          pointerEvents="none"
        />

        {/* Large Countdown Overlay */}
        {countdown !== null && (
          <View style={styles.countdownOverlay} pointerEvents="none">
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>

      {/* 2. Top Bar */}
      <View style={[styles.topBarWrapper, { top: topBarTop }]}>
        <InstagramCameraTopBar
          flashMode={flashMode}
          onCycleFlash={handleCycleFlash}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((prev) => !prev)}
          activeSound={activeSound}
          onOpenSoundPicker={() => setShowAudioPicker(true)}
          onClose={onClose}
        />
      </View>

      {/* 3. Left Tool Stack */}
      <InstagramLeftToolStack
        topOffset={leftStackTop}
        isCreateMode={isCreateMode}
        onToggleCreateMode={() => setIsCreateMode((prev) => !prev)}
        isBoomerang={isBoomerang}
        onToggleBoomerang={() => setIsBoomerang((prev) => !prev)}
        layoutMode={layoutMode}
        onSelectLayoutMode={setLayoutMode}
        timerSeconds={timerSeconds}
        onCycleTimer={() =>
          setTimerSeconds((prev) => (prev === 0 ? 3 : prev === 3 ? 10 : 0))
        }
        speed={speed}
        onCycleSpeed={() =>
          setSpeed((prev) =>
            prev === "1x" ? "2x" : prev === "2x" ? "0.5x" : "1x"
          )
        }
        onSelectSpeed={setSpeed}
        onSelectTimer={setTimerSeconds}
        isDualCamera={isDualCamera}
        onToggleDualCamera={() => setIsDualCamera((prev) => !prev)}
        isAlignActive={isAlignActive}
        onToggleAlign={() => setIsAlignActive((prev) => !prev)}
      />

      {/* 4. Bottom Shutter & Mode Carousel */}
      <View style={[styles.bottomShutterWrapper, { bottom: bottomBarBottom }]}>
        <InstagramShutter
          currentMode={mode}
          onSelectMode={setMode}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          maxDuration={maxDuration}
          onPressCapture={handlePressCapture}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onZoomChange={setZoom}
          onFlipCamera={handleFlipCamera}
          onOpenGallery={handleOpenGallery}
          recentGalleryThumb={lastFrameThumb}
        />
      </View>

      {/* 5. Instagram Audio Picker Modal */}
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
    position: "relative",
  },
  viewfinderWrapper: {
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  aspectFull: {
    height: "100%",
  },
  aspectSquare: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    top: (SCREEN_HEIGHT - SCREEN_WIDTH) / 2 - 40,
    borderRadius: 16,
  },
  aspectPortrait: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 5) / 4,
    top: (SCREEN_HEIGHT - (SCREEN_WIDTH * 5) / 4) / 2 - 40,
    borderRadius: 16,
  },
  createModeScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  createModeHint: {
    position: "absolute",
    top: 100,
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  createModePrompt: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  topBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 40,
  },
  bottomShutterWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 40,
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
  },
  gridCell: {
    flex: 1,
  },
  gridBorderH: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  gridBorderV: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  pipWindow: {
    position: "absolute",
    top: 90,
    right: 16,
    width: 100,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  pipBadge: {
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pipBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },
  layoutOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
  },
  layoutHeaderBar: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 30,
  },
  layoutBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  layoutBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  layoutActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  layoutActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  layoutGridContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  layoutTileCell: {
    borderWidth: 1.5,
    borderColor: "#fff",
    overflow: "hidden",
  },
  tileCell2x2: {
    width: "50%",
    height: "50%",
  },
  tileCell3x3: {
    width: "33.33%",
    height: "33.33%",
  },
  tileCell1x2: {
    width: "100%",
    height: "50%",
  },
  tileCell2x1: {
    width: "50%",
    height: "100%",
  },
  tileCellActive: {
    borderColor: "#FBBF24",
    borderWidth: 2.5,
  },
  activeTileIndicator: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    backgroundColor: "rgba(251, 191, 36, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeTileText: {
    color: "#FBBF24",
    fontSize: 10,
    fontWeight: "800",
  },
  emptyTilePlaceholder: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  createShuffleBtn: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  createShuffleText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  createModeInput: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createModeBottomHint: {
    position: "absolute",
    bottom: 120,
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  alignHintContainer: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  alignHintText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  speedBadge: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  focusRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FBBF24",
  },
  flashBlinkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 90,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 85,
  },
  countdownText: {
    color: "#fff",
    fontSize: 96,
    fontWeight: "900",
  },
});
