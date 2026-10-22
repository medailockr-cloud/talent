import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
  Image,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  RefreshCw,
  Image as ImageIcon,
  Lock,
  Square,
  Plus,
  Camera,
  Video,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { InstagramMode } from "./types";

interface InstagramShutterProps {
  currentMode: InstagramMode;
  onSelectMode: (mode: InstagramMode) => void;
  isRecording: boolean;
  recordingSeconds: number;
  maxDuration: number;
  onPressCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onZoomChange: (zoom: number) => void;
  onFlipCamera: () => void;
  onOpenGallery: () => void;
  recentGalleryThumb?: string | null;
}

export function InstagramShutter({
  currentMode,
  onSelectMode,
  isRecording,
  recordingSeconds,
  maxDuration,
  onPressCapture,
  onStartRecording,
  onStopRecording,
  onZoomChange,
  onFlipCamera,
  onOpenGallery,
  recentGalleryThumb,
}: InstagramShutterProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [showLockPrompt, setShowLockPrompt] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Mutable refs to prevent stale closures in PanResponder
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;
  const currentModeRef = useRef(currentMode);
  currentModeRef.current = currentMode;
  const onPressCaptureRef = useRef(onPressCapture);
  onPressCaptureRef.current = onPressCapture;
  const onStartRecordingRef = useRef(onStartRecording);
  onStartRecordingRef.current = onStartRecording;
  const onStopRecordingRef = useRef(onStopRecording);
  onStopRecordingRef.current = onStopRecording;
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;

  const pressStartTimeRef = useRef<number>(0);
  const longPressTimer = useRef<any>(null);
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);

  // Reset lock when recording stops
  useEffect(() => {
    if (!isRecording) {
      setIsLocked(false);
      setShowLockPrompt(false);
    }
  }, [isRecording]);

  // Flip rotation animation
  const handleFlipPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    onFlipCamera();
  };

  const flipInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Stop recording handler
  const handleStop = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsLocked(false);
    setShowLockPrompt(false);
    onStopRecordingRef.current();
  };

  // PanResponder for Shutter: Press, Hold, Drag to Zoom, Drag to Lock
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsPressed(true);
        pressStartTimeRef.current = Date.now();
        startYRef.current = evt.nativeEvent.pageY;
        startXRef.current = evt.nativeEvent.pageX;

        Animated.spring(scaleAnim, {
          toValue: 1.18,
          useNativeDriver: true,
        }).start();

        // If already recording, tap should stop recording
        if (isRecordingRef.current) {
          handleStop();
          return;
        }

        // Long press detection for holding to record
        longPressTimer.current = setTimeout(() => {
          if (!isRecordingRef.current) {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            setShowLockPrompt(true);
            Animated.spring(lockAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
            onStartRecordingRef.current();
          }
        }, 250);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Vertical slide for zoom
        if (gestureState.dy < -15) {
          const dragDist = Math.min(Math.abs(gestureState.dy), 250);
          const zoomVal = Math.min(Math.max((dragDist - 15) / 200, 0), 1);
          onZoomChangeRef.current(zoomVal);
        }

        // Horizontal slide right for Hands-Free lock
        if (gestureState.dx > 50 && isRecordingRef.current && !isLockedRef.current) {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setIsLocked(true);
          setShowLockPrompt(false);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsPressed(false);
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        const pressDuration = Date.now() - pressStartTimeRef.current;

        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        // If it was a quick tap (< 250ms)
        if (pressDuration < 250) {
          if (isRecordingRef.current) {
            // Tapping while recording stops it
            handleStop();
          } else {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            if (currentModeRef.current === "VIDEO" || currentModeRef.current === "REEL") {
              // In VIDEO mode, quick tap starts video recording
              onStartRecordingRef.current();
            } else {
              // In PHOTO mode, quick tap takes photo
              onPressCaptureRef.current();
            }
          }
        } else {
          // It was a long press hold
          if (isRecordingRef.current && !isLockedRef.current) {
            // Releasing finger stops video recording unless locked
            handleStop();
          }
        }
      },
      onPanResponderTerminate: () => {
        setIsPressed(false);
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
        if (isRecordingRef.current && !isLockedRef.current) {
          handleStop();
        }
      },
    })
  ).current;

  // Circular progress calculations
  const size = 88;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(recordingSeconds / maxDuration, 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  const isPhotoMode = currentMode === "PHOTO" || currentMode === "POST";
  const isVideoMode = !isPhotoMode;

  return (
    <View style={styles.container}>
      {/* Hands-Free Lock Indicator */}
      {showLockPrompt && (
        <Animated.View
          style={[
            styles.lockPromptContainer,
            {
              opacity: lockAnim,
              transform: [
                {
                  translateX: lockAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 60],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.lockPill}>
            <Lock color="#fff" size={16} />
          </View>
        </Animated.View>
      )}

      {/* Main Shutter Row: Gallery | Shutter Button | Flip Camera */}
      <View style={styles.shutterRow}>
        {/* Gallery Thumbnail Button */}
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.selectionAsync();
            }
            onOpenGallery();
          }}
          activeOpacity={0.8}
        >
          {recentGalleryThumb ? (
            <Image
              source={{ uri: recentGalleryThumb }}
              style={styles.galleryThumbImage}
            />
          ) : (
            <View style={styles.galleryPlaceholder}>
              <ImageIcon color="#fff" size={22} />
            </View>
          )}
          <View style={styles.galleryPlusBadge}>
            <Plus color="#000" size={10} strokeWidth={3} />
          </View>
        </TouchableOpacity>

        {/* Shutter Button */}
        <Animated.View
          style={[
            styles.shutterWrapper,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Circular Progress Ring when recording */}
          {isRecording ? (
            <View style={styles.svgProgressWrapper}>
              <Svg width={size} height={size}>
                {/* Background Ring */}
                <Circle
                  stroke="rgba(255, 255, 255, 0.25)"
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                />
                {/* Animated Fill Ring */}
                <Circle
                  stroke="#FF3040"
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </Svg>
            </View>
          ) : (
            <View style={styles.outerRing} />
          )}

          {/* Inner Shutter Element */}
          {isRecording ? (
            <View style={styles.innerSquareButton}>
              <Square color="#FF3040" fill="#FF3040" size={24} />
            </View>
          ) : (
            <View
              style={[
                styles.innerCircle,
                isVideoMode && styles.innerCircleVideo,
                isPressed && styles.innerCirclePressed,
              ]}
            />
          )}
        </Animated.View>

        {/* 180° Flip Camera Button */}
        <TouchableOpacity
          style={styles.flipButton}
          onPress={handleFlipPress}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [{ rotateY: flipInterpolate }],
            }}
          >
            <RefreshCw color="#fff" size={24} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Switcher Button: PHOTO <-> VIDEO */}
      {!isRecording && (
        <View style={styles.modeSwitchContainer}>
          <View style={styles.modeSwitchPill}>
            <TouchableOpacity
              style={[
                styles.modeOption,
                isPhotoMode && styles.modeOptionActive,
              ]}
              onPress={() => {
                if (!isPhotoMode) {
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                  onSelectMode("PHOTO");
                }
              }}
              activeOpacity={0.7}
            >
              <Camera
                color={isPhotoMode ? "#fff" : "rgba(255, 255, 255, 0.45)"}
                size={14}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modeText,
                  isPhotoMode && styles.activeModeText,
                ]}
              >
                PHOTO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeOption,
                isVideoMode && styles.modeOptionActiveVideo,
              ]}
              onPress={() => {
                if (!isVideoMode) {
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                  onSelectMode("VIDEO");
                }
              }}
              activeOpacity={0.7}
            >
              <Video
                color={isVideoMode ? "#FF3040" : "rgba(255, 255, 255, 0.45)"}
                size={14}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modeText,
                  isVideoMode && styles.activeModeTextVideo,
                ]}
              >
                VIDEO
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    alignItems: "center",
    zIndex: 40,
  },
  shutterRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 30,
    marginBottom: 20,
    position: "relative",
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  galleryThumbImage: {
    width: "100%",
    height: "100%",
  },
  galleryPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryPlusBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterWrapper: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  outerRing: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: "#fff",
  },
  svgProgressWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  innerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff",
  },
  innerCircleVideo: {
    backgroundColor: "#FF3040",
  },
  innerCirclePressed: {
    transform: [{ scale: 0.88 }],
  },
  innerRecordingCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FF3040",
  },
  innerSquareButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockPromptContainer: {
    position: "absolute",
    right: "30%",
    top: 25,
    zIndex: 50,
  },
  lockPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  modeSwitchContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  modeSwitchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 24,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  modeOptionActive: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  modeOptionActiveVideo: {
    backgroundColor: "rgba(255, 48, 64, 0.25)",
  },
  modeText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  activeModeText: {
    color: "#fff",
    fontWeight: "800",
  },
  activeModeTextVideo: {
    color: "#fff",
    fontWeight: "800",
  },
});
