import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import {
  Infinity as InfinityIcon,
  LayoutGrid,
  Clock,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  Type,
  Maximize2,
  Sliders,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import {
  InstagramCameraSpeed,
  InstagramLayoutMode,
} from "./types";

interface InstagramLeftToolStackProps {
  topOffset?: number;
  isCreateMode: boolean;
  onToggleCreateMode: () => void;
  isBoomerang: boolean;
  onToggleBoomerang: () => void;
  layoutMode: InstagramLayoutMode;
  onSelectLayoutMode: (mode: InstagramLayoutMode) => void;
  timerSeconds: 0 | 3 | 10;
  onCycleTimer: () => void;
  speed: InstagramCameraSpeed;
  onCycleSpeed: () => void;
  onSelectSpeed?: (speed: InstagramCameraSpeed) => void;
  onSelectTimer?: (seconds: 0 | 3 | 10) => void;
  isDualCamera: boolean;
  onToggleDualCamera: () => void;
  isAlignActive: boolean;
  onToggleAlign: () => void;
}

export function InstagramLeftToolStack({
  topOffset = 96,
  isCreateMode,
  onToggleCreateMode,
  isBoomerang,
  onToggleBoomerang,
  layoutMode,
  onSelectLayoutMode,
  timerSeconds,
  onCycleTimer,
  onSelectTimer,
  speed,
  onCycleSpeed,
  onSelectSpeed,
  isDualCamera,
  onToggleDualCamera,
  isAlignActive,
  onToggleAlign,
}: InstagramLeftToolStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, { top: topOffset }]}>
      <View style={styles.pillStack}>
        {/* Create Mode (Aa) */}
        <TouchableOpacity
          style={[styles.toolButton, isCreateMode && styles.activeToolButton]}
          onPress={() => {
            triggerHaptic();
            onToggleCreateMode();
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.createAaText,
              isCreateMode && { color: "#000", fontWeight: "900" },
            ]}
          >
            Aa
          </Text>
        </TouchableOpacity>

        {/* Boomerang (Infinity) */}
        <TouchableOpacity
          style={[styles.toolButton, isBoomerang && styles.activeToolButton]}
          onPress={() => {
            triggerHaptic();
            onToggleBoomerang();
          }}
          activeOpacity={0.7}
        >
          <InfinityIcon color={isBoomerang ? "#000" : "#fff"} size={22} />
        </TouchableOpacity>

        {/* Layout Grid */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            layoutMode !== "none" && styles.activeToolButton,
          ]}
          onPress={() => {
            triggerHaptic();
            setShowLayoutMenu((prev) => !prev);
          }}
          activeOpacity={0.7}
        >
          <LayoutGrid
            color={layoutMode !== "none" ? "#000" : "#fff"}
            size={20}
          />
        </TouchableOpacity>

        {/* Hands-Free / Timer */}
        <TouchableOpacity
          style={[styles.toolButton, timerSeconds > 0 && styles.activeToolButton]}
          onPress={() => {
            triggerHaptic();
            onCycleTimer();
          }}
          activeOpacity={0.7}
        >
          <Clock color={timerSeconds > 0 ? "#000" : "#fff"} size={20} />
          {timerSeconds > 0 && (
            <Text style={styles.timerBadgeText}>{timerSeconds}s</Text>
          )}
        </TouchableOpacity>

        {/* Extra tools when expanded */}
        {isExpanded && (
          <>
            {/* Speed Selector */}
            <TouchableOpacity
              style={[
                styles.toolButton,
                speed !== "1x" && styles.activeToolButton,
              ]}
              onPress={() => {
                triggerHaptic();
                setShowSpeedMenu((prev) => !prev);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.speedText,
                  speed !== "1x" && { color: "#000", fontWeight: "900" },
                ]}
              >
                {speed}
              </Text>
            </TouchableOpacity>

            {/* Dual Camera PIP */}
            <TouchableOpacity
              style={[
                styles.toolButton,
                isDualCamera && styles.activeToolButton,
              ]}
              onPress={() => {
                triggerHaptic();
                onToggleDualCamera();
              }}
              activeOpacity={0.7}
            >
              <Users color={isDualCamera ? "#000" : "#fff"} size={20} />
            </TouchableOpacity>

            {/* Align Ghost frame */}
            <TouchableOpacity
              style={[
                styles.toolButton,
                isAlignActive && styles.activeToolButton,
              ]}
              onPress={() => {
                triggerHaptic();
                onToggleAlign();
              }}
              activeOpacity={0.7}
            >
              <Sliders color={isAlignActive ? "#000" : "#fff"} size={19} />
            </TouchableOpacity>
          </>
        )}

        {/* Expand / Collapse Chevron */}
        <TouchableOpacity
          style={styles.chevronButton}
          onPress={() => {
            triggerHaptic();
            setIsExpanded((prev) => !prev);
          }}
          activeOpacity={0.7}
        >
          {isExpanded ? (
            <ChevronUp color="#fff" size={16} />
          ) : (
            <ChevronDown color="#fff" size={16} />
          )}
        </TouchableOpacity>
      </View>

      {/* Flyout Menu: Layout Grid Options */}
      {showLayoutMenu && (
        <View style={styles.flyoutMenu}>
          <Text style={styles.flyoutTitle}>Layout</Text>
          {(["none", "1x2", "2x1", "2x2", "3x3"] as InstagramLayoutMode[]).map(
            (mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.flyoutItem,
                  layoutMode === mode && styles.flyoutItemActive,
                ]}
                onPress={() => {
                  triggerHaptic();
                  onSelectLayoutMode(mode);
                  setShowLayoutMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.flyoutItemText,
                    layoutMode === mode && styles.flyoutItemTextActive,
                  ]}
                >
                  {mode === "none" ? "Off" : mode}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      {/* Flyout Menu: Speed Options */}
      {showSpeedMenu && (
        <View style={styles.flyoutMenu}>
          <Text style={styles.flyoutTitle}>Recording Speed</Text>
          {(["0.3x", "0.5x", "1x", "2x", "3x"] as InstagramCameraSpeed[]).map(
            (s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.flyoutItem,
                  speed === s && styles.flyoutItemActive,
                ]}
                onPress={() => {
                  triggerHaptic();
                  if (onSelectSpeed) {
                    onSelectSpeed(s);
                  } else {
                    onCycleSpeed();
                  }
                  setShowSpeedMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.flyoutItemText,
                    speed === s && styles.flyoutItemTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 14,
    zIndex: 35,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pillStack: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 8,
  },
  toolButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeToolButton: {
    backgroundColor: "#fff",
  },
  createAaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  speedText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  timerBadgeText: {
    position: "absolute",
    bottom: 2,
    right: 2,
    fontSize: 8,
    fontWeight: "900",
    color: "#000",
  },
  chevronButton: {
    width: 36,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  flyoutMenu: {
    marginLeft: 10,
    backgroundColor: "rgba(28, 28, 30, 0.95)",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    gap: 4,
  },
  flyoutTitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flyoutItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  flyoutItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  flyoutItemText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  flyoutItemTextActive: {
    color: "#fff",
    fontWeight: "800",
  },
});
