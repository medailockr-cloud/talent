import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Check,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import {
  InstagramFontId,
  InstagramFontOption,
  TextHighlightMode,
  TextOverlayItem,
} from "./types";

interface InstagramTextEditorProps {
  visible: boolean;
  onClose: () => void;
  onSaveText: (item: TextOverlayItem) => void;
  editingItem?: TextOverlayItem | null;
}

export const INSTAGRAM_FONTS: InstagramFontOption[] = [
  { id: "classic", name: "Classic", fontWeight: "bold" },
  { id: "modern", name: "MODERN", fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" },
  { id: "neon", name: "Neon", fontStyle: "italic", fontWeight: "600" },
  { id: "typewriter", name: "Typewriter", fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  { id: "strong", name: "STRONG", fontWeight: "900", textTransform: "uppercase" },
  { id: "dropshadow", name: "Shadow", fontWeight: "bold" },
  { id: "serif", name: "Serif", fontStyle: "italic", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  { id: "comic", name: "Comic", fontWeight: "600" },
  { id: "elegant", name: "Elegant", fontWeight: "300", letterSpacing: 2 },
];

export const INSTAGRAM_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FBBF24",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#A855F7",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
];

export function InstagramTextEditor({
  visible,
  onClose,
  onSaveText,
  editingItem,
}: InstagramTextEditorProps) {
  const [text, setText] = useState(editingItem?.text || "");
  const [selectedFont, setSelectedFont] = useState<InstagramFontId>(
    editingItem?.fontId || "classic"
  );
  const [textColor, setTextColor] = useState(editingItem?.color || "#FFFFFF");
  const [highlightMode, setHighlightMode] = useState<TextHighlightMode>(
    editingItem?.highlightMode || "none"
  );
  const [align, setAlign] = useState<"left" | "center" | "right">(
    editingItem?.align || "center"
  );
  const [fontSize, setFontSize] = useState<number>(editingItem?.fontSize || 32);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (editingItem) {
        setText(editingItem.text);
        setSelectedFont(editingItem.fontId);
        setTextColor(editingItem.color);
        setHighlightMode(editingItem.highlightMode);
        setAlign(editingItem.align);
        setFontSize(editingItem.fontSize);
      } else {
        setText("");
        setSelectedFont("classic");
        setTextColor("#FFFFFF");
        setHighlightMode("none");
        setAlign("center");
        setFontSize(32);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [visible, editingItem]);

  if (!visible) return null;

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Cycle alignment
  const handleCycleAlign = () => {
    triggerHaptic();
    if (align === "left") setAlign("center");
    else if (align === "center") setAlign("right");
    else setAlign("left");
  };

  // Cycle highlight mode: none -> solid -> transparent -> outline
  const handleCycleHighlight = () => {
    triggerHaptic();
    if (highlightMode === "none") setHighlightMode("solid");
    else if (highlightMode === "solid") setHighlightMode("transparent");
    else if (highlightMode === "transparent") setHighlightMode("outline");
    else setHighlightMode("none");
  };

  const handleDone = () => {
    if (!text.trim()) {
      onClose();
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const item: TextOverlayItem = {
      id: editingItem?.id || "text_" + Date.now() + "_" + Math.random().toString(36).substring(7),
      type: "text",
      text,
      fontId: selectedFont,
      color: textColor,
      highlightMode,
      align,
      fontSize,
      x: editingItem?.x || 0,
      y: editingItem?.y || 0,
      scale: editingItem?.scale || 1,
      rotation: editingItem?.rotation || 0,
    };
    onSaveText(item);
    onClose();
  };

  // Determine styling based on font and highlight mode
  const currentFontMeta = INSTAGRAM_FONTS.find((f) => f.id === selectedFont) || INSTAGRAM_FONTS[0];

  const getHighlightStyle = () => {
    if (highlightMode === "solid") {
      return {
        backgroundColor: textColor === "#FFFFFF" ? "#000000" : "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
      };
    }
    if (highlightMode === "transparent") {
      return {
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
      };
    }
    if (highlightMode === "outline") {
      return {
        borderWidth: 2,
        borderColor: textColor,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
      };
    }
    return {};
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Control Bar */}
        <View style={styles.topBar}>
          {/* Alignment */}
          <TouchableOpacity style={styles.topIconBtn} onPress={handleCycleAlign}>
            {align === "left" ? (
              <AlignLeft color="#fff" size={24} />
            ) : align === "center" ? (
              <AlignCenter color="#fff" size={24} />
            ) : (
              <AlignRight color="#fff" size={24} />
            )}
          </TouchableOpacity>

          {/* Highlight pill button */}
          <TouchableOpacity
            style={[
              styles.topIconBtn,
              highlightMode !== "none" && styles.topIconBtnActive,
            ]}
            onPress={handleCycleHighlight}
          >
            <Text
              style={[
                styles.highlightIconText,
                highlightMode !== "none" && { color: "#000" },
              ]}
            >
              A
            </Text>
          </TouchableOpacity>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Center: Multiline Input with Left Font Size Scrubber */}
        <View style={styles.centerArea}>
          {/* Vertical Font Size Slider */}
          <View style={styles.verticalSliderContainer}>
            <TouchableOpacity
              style={styles.sizeIndicator}
              onPress={() => {
                triggerHaptic();
                setFontSize((prev) => (prev >= 48 ? 20 : prev + 8));
              }}
            >
              <Text style={styles.sizeIndicatorText}>{fontSize}</Text>
            </TouchableOpacity>
          </View>

          {/* Text Input Container */}
          <View style={[styles.inputBox, getHighlightStyle()]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                {
                  color: textColor,
                  fontSize,
                  textAlign: align,
                  fontFamily: currentFontMeta.fontFamily,
                  fontWeight: currentFontMeta.fontWeight,
                  fontStyle: currentFontMeta.fontStyle,
                  letterSpacing: currentFontMeta.letterSpacing,
                  textTransform: currentFontMeta.textTransform,
                },
              ]}
              multiline
              value={text}
              onChangeText={setText}
              placeholder="Type something..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              selectionColor={textColor}
            />
          </View>
        </View>

        {/* Bottom Bar: Fonts Carousel & Color Palette */}
        <View style={styles.bottomControls}>
          {/* Font Selector Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fontsCarousel}
          >
            {INSTAGRAM_FONTS.map((font) => {
              const isSelected = selectedFont === font.id;
              return (
                <TouchableOpacity
                  key={font.id}
                  style={[
                    styles.fontPill,
                    isSelected && styles.fontPillActive,
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedFont(font.id);
                  }}
                >
                  <Text
                    style={[
                      styles.fontPillText,
                      isSelected && styles.fontPillTextActive,
                    ]}
                  >
                    {font.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Color Palette Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorPalette}
          >
            {INSTAGRAM_COLORS.map((col) => {
              const isSelected = textColor === col;
              return (
                <TouchableOpacity
                  key={col}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: col },
                    isSelected && styles.colorSwatchActive,
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    setTextColor(col);
                  }}
                >
                  {isSelected && (
                    <Check
                      color={col === "#FFFFFF" ? "#000" : "#FFF"}
                      size={14}
                      strokeWidth={3}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 30 : 50,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  topIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  topIconBtnActive: {
    backgroundColor: "#fff",
  },
  highlightIconText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  doneBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  doneBtnText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
  centerArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  verticalSliderContainer: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  sizeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeIndicatorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  inputBox: {
    maxWidth: "85%",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    minWidth: 100,
    padding: 0,
    lineHeight: 40,
  },
  bottomControls: {
    paddingBottom: Platform.OS === "android" ? 20 : 36,
  },
  fontsCarousel: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 14,
  },
  fontPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  fontPillActive: {
    backgroundColor: "#fff",
  },
  fontPillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  fontPillTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  colorPalette: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: "center",
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchActive: {
    borderColor: "#fff",
    transform: [{ scale: 1.15 }],
  },
});
