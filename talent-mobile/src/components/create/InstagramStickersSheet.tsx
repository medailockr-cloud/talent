import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import {
  MapPin,
  AtSign,
  Hash,
  HelpCircle,
  BarChart2,
  Camera,
  Flame,
  Clock,
  Music,
  Smile,
  X,
  Search,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { StickerOverlayItem, StickerType } from "./types";

interface InstagramStickersSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddSticker: (sticker: StickerOverlayItem) => void;
  activeSoundTitle?: string;
  activeSoundArtist?: string;
}

export function InstagramStickersSheet({
  visible,
  onClose,
  onAddSticker,
  activeSoundTitle,
  activeSoundArtist,
}: InstagramStickersSheetProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"widgets" | "emojis">("widgets");

  if (!visible) return null;

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSelectWidget = (type: StickerType, initialData: any) => {
    triggerHaptic();
    const newSticker: StickerOverlayItem = {
      id: "sticker_" + Date.now() + "_" + Math.random().toString(36).substring(7),
      type: "sticker",
      stickerType: type,
      data: initialData,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    };
    onAddSticker(newSticker);
    onClose();
  };

  const EMOJIS = [
    "🔥", "❤️", "✨", "👏", "💯", "😍", "😂", "🚀",
    "🥳", "🎉", "💃", "🎤", "🎸", "⚡", "🌟", "👑",
    "🙌", "🤩", "🎶", "🏆", "💖", "😎", "💪", "🌈",
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header handle */}
          <View style={styles.dragHandle} />

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Search color="#888" size={18} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search stickers"
                placeholderTextColor="#777"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <X color="#888" size={16} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Instagram Widget Grid */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            <Text style={styles.sectionHeader}>Interactive Widgets</Text>
            <View style={styles.widgetGrid}>
              {/* Location */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("location", {
                    location: "Bengaluru, India",
                    theme: "rainbow",
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#EF4444" }]}>
                  <MapPin color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>LOCATION</Text>
              </TouchableOpacity>

              {/* Mention */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("mention", {
                    username: "talent_star",
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#F59E0B" }]}>
                  <AtSign color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>@MENTION</Text>
              </TouchableOpacity>

              {/* Add Yours */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("add_yours", {
                    prompt: "Drop your best move 💃",
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#10B981" }]}>
                  <Camera color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>ADD YOURS</Text>
              </TouchableOpacity>

              {/* Questions */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("question", {
                    question: "Ask me anything about my act ✨",
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#3B82F6" }]}>
                  <HelpCircle color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>QUESTIONS</Text>
              </TouchableOpacity>

              {/* Poll */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("poll", {
                    question: "Should I perform this live?",
                    optionA: "YES 💯",
                    optionB: "NEXT TIME",
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#8B5CF6" }]}>
                  <BarChart2 color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>POLL</Text>
              </TouchableOpacity>

              {/* Slider */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("slider", {
                    emoji: "🔥",
                    question: "Rate this talent",
                    value: 0.8,
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#EC4899" }]}>
                  <Flame color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>SLIDER</Text>
              </TouchableOpacity>

              {/* Time */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("time", {
                    time: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#6366F1" }]}>
                  <Clock color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>TIME</Text>
              </TouchableOpacity>

              {/* Music Sticker */}
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() =>
                  handleSelectWidget("music", {
                    title: activeSoundTitle || "Golden Hour",
                    artist: activeSoundArtist || "JVKE",
                  })
                }
              >
                <View style={[styles.iconBox, { backgroundColor: "#06B6D4" }]}>
                  <Music color="#fff" size={24} />
                </View>
                <Text style={styles.widgetName}>MUSIC</Text>
              </TouchableOpacity>
            </View>

            {/* Popular Reaction Emojis */}
            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
              Popular Reactions
            </Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map((emoji, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.emojiItem}
                  onPress={() => handleSelectWidget("emoji", { emoji })}
                >
                  <Text style={styles.emojiChar}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    height: "75%",
    backgroundColor: "#161616",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: "center",
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    padding: 0,
  },
  cancelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  contentScroll: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  widgetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  widgetCard: {
    width: "22%",
    aspectRatio: 0.9,
    backgroundColor: "#262626",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  widgetName: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emojiItem: {
    width: "16%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiChar: {
    fontSize: 28,
  },
});
