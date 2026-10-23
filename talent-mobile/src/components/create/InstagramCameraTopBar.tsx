import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import {
  X,
  ChevronLeft,
  Settings,
  Music,
  Zap,
  ZapOff,
  Grid,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { InstagramFlashMode, InstagramAspectRatio, InstagramSound } from "./types";

interface InstagramCameraTopBarProps {
  flashMode: InstagramFlashMode;
  onCycleFlash: () => void;
  aspectRatio: InstagramAspectRatio;
  onChangeAspectRatio: (ratio: InstagramAspectRatio) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  activeSound: InstagramSound | null;
  onOpenSoundPicker: () => void;
  onClose: () => void;
}

export function InstagramCameraTopBar({
  flashMode,
  onCycleFlash,
  aspectRatio,
  onChangeAspectRatio,
  showGrid,
  onToggleGrid,
  activeSound,
  onOpenSoundPicker,
  onClose,
}: InstagramCameraTopBarProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleFlashPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onCycleFlash();
  };

  return (
    <View style={styles.container}>
      {/* Back / Close Button on Top Left */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync();
          }
          onClose();
        }}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
      >
        <ChevronLeft color="#fff" size={28} />
      </TouchableOpacity>

      {/* Music / Audio Button in Center */}
      <TouchableOpacity
        style={[styles.musicPill, activeSound && styles.activeMusicPill]}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync();
          }
          onOpenSoundPicker();
        }}
        activeOpacity={0.8}
      >
        <Music
          color={activeSound ? "#000" : "#fff"}
          size={16}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.musicPillText,
            activeSound && { color: "#000", fontWeight: "700" },
          ]}
          numberOfLines={1}
        >
          {activeSound ? activeSound.title : "Add audio"}
        </Text>
      </TouchableOpacity>

      {/* Right Action Group: Flash | Aspect Ratio | Settings */}
      <View style={styles.rightGroup}>
        {/* Flash Mode Toggle */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            flashMode === "on" && styles.activeYellowPill,
          ]}
          onPress={handleFlashPress}
          activeOpacity={0.7}
        >
          {flashMode === "off" ? (
            <ZapOff color="#fff" size={20} />
          ) : flashMode === "on" ? (
            <Zap color="#FBBF24" fill="#FBBF24" size={20} />
          ) : (
            <View style={styles.autoFlashWrapper}>
              <Zap color="#fff" size={20} />
              <Text style={styles.autoFlashText}>A</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Aspect Ratio Switcher */}
        <TouchableOpacity
          style={styles.ratioBadge}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.selectionAsync();
            }
            const nextRatio =
              aspectRatio === "9:16" ? "1:1" : aspectRatio === "1:1" ? "4:5" : "9:16";
            onChangeAspectRatio(nextRatio);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.ratioText}>{aspectRatio}</Text>
        </TouchableOpacity>

        {/* Settings Gear */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.selectionAsync();
            }
            setShowSettingsModal(true);
          }}
          activeOpacity={0.7}
        >
          <Settings color="#fff" size={21} />
        </TouchableOpacity>
      </View>

      {/* Camera Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Camera Settings</Text>

            {/* Grid Toggle */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.selectionAsync();
                }
                onToggleGrid();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingRowLeft}>
                <Grid color="#fff" size={20} />
                <Text style={styles.settingLabel}>Composition Grid</Text>
              </View>
              {showGrid ? (
                <View style={styles.checkPill}>
                  <Check color="#000" size={14} />
                </View>
              ) : (
                <Text style={styles.offLabel}>Off</Text>
              )}
            </TouchableOpacity>

            {/* Aspect Ratio options */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionSubtitle}>Aspect Ratio</Text>
              <View style={styles.ratioRow}>
                {(["9:16", "1:1", "4:5"] as InstagramAspectRatio[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.ratioOption,
                      aspectRatio === r && styles.activeRatioOption,
                    ]}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.selectionAsync();
                      }
                      onChangeAspectRatio(r);
                    }}
                  >
                    <Text
                      style={[
                        styles.ratioOptionText,
                        aspectRatio === r && styles.activeRatioOptionText,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Close modal */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowSettingsModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 4,
    zIndex: 40,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeYellowPill: {
    backgroundColor: "rgba(251, 191, 36, 0.25)",
    borderColor: "#FBBF24",
    borderWidth: 1,
  },
  autoFlashWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  autoFlashText: {
    position: "absolute",
    right: -4,
    bottom: -3,
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },
  musicPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    maxWidth: 140,
    flexShrink: 1,
  },
  activeMusicPill: {
    backgroundColor: "#fff",
  },
  musicPillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  ratioBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ratioText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  checkPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  offLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 14,
    fontWeight: "500",
  },
  settingSection: {
    paddingVertical: 16,
  },
  sectionSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  ratioRow: {
    flexDirection: "row",
    gap: 10,
  },
  ratioOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeRatioOption: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#fff",
  },
  ratioOptionText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  activeRatioOptionText: {
    color: "#fff",
  },
  doneButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
});
