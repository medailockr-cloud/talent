import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  MapPin,
  AtSign,
  HelpCircle,
  BarChart2,
  Camera,
  Flame,
  Clock,
  Music,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import {
  OverlayItem,
  TextOverlayItem,
  StickerOverlayItem,
  DrawingPath,
} from "./types";
import { INSTAGRAM_FONTS } from "./InstagramTextEditor";

interface InstagramCanvasOverlayProps {
  items: OverlayItem[];
  onUpdateItem: (item: OverlayItem) => void;
  onDeleteItem: (id: string) => void;
  onEditText: (item: TextOverlayItem) => void;
  drawingPaths: DrawingPath[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function InstagramCanvasOverlay({
  items,
  onUpdateItem,
  onDeleteItem,
  onEditText,
  drawingPaths,
}: InstagramCanvasOverlayProps) {
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  const trashScaleAnim = useRef(new Animated.Value(1)).current;

  const pointsToSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 1. Drawing SVG Paths Layer */}
      {drawingPaths.length > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg style={StyleSheet.absoluteFill}>
            {drawingPaths.map((p) => {
              const d = pointsToSvgPath(p.points);
              if (p.brush === "neon") {
                return (
                  <React.Fragment key={p.id}>
                    <Path
                      d={d}
                      stroke={p.color}
                      strokeWidth={p.strokeWidth * 3}
                      strokeOpacity={0.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <Path
                      d={d}
                      stroke="#FFFFFF"
                      strokeWidth={p.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </React.Fragment>
                );
              }
              return (
                <Path
                  key={p.id}
                  d={d}
                  stroke={p.color}
                  strokeWidth={p.strokeWidth}
                  strokeOpacity={p.brush === "highlighter" ? 0.45 : 1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              );
            })}
          </Svg>
        </View>
      )}

      {/* 2. Interactive Text and Sticker Items */}
      {items.map((item) => (
        <DraggableOverlayItem
          key={item.id}
          item={item}
          onUpdate={onUpdateItem}
          onDelete={onDeleteItem}
          onEditText={onEditText}
          onDragStart={() => setActiveDraggingId(item.id)}
          onDragEnd={() => {
            setActiveDraggingId(null);
            setIsOverTrash(false);
          }}
          onOverTrashChange={(over) => {
            setIsOverTrash(over);
            Animated.spring(trashScaleAnim, {
              toValue: over ? 1.3 : 1,
              useNativeDriver: true,
            }).start();
            if (over && Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }}
        />
      ))}

      {/* 3. Animated Trash Can (visible when dragging) */}
      {activeDraggingId && (
        <Animated.View
          style={[
            styles.trashCanContainer,
            {
              transform: [{ scale: trashScaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.trashPill,
              isOverTrash && styles.trashPillActive,
            ]}
          >
            <Trash2 color={isOverTrash ? "#EF4444" : "#fff"} size={26} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// Subcomponent: Draggable item
function DraggableOverlayItem({
  item,
  onUpdate,
  onDelete,
  onEditText,
  onDragStart,
  onDragEnd,
  onOverTrashChange,
}: {
  item: OverlayItem;
  onUpdate: (item: OverlayItem) => void;
  onDelete: (id: string) => void;
  onEditText: (item: TextOverlayItem) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onOverTrashChange: (over: boolean) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
  const currentPos = useRef({ x: item.x, y: item.y });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onDragStart();
        pan.setOffset({
          x: currentPos.current.x,
          y: currentPos.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });

        // Check proximity to trash can at bottom center
        const absY = evt.nativeEvent.pageY;
        const absX = evt.nativeEvent.pageX;
        const isNearBottom = absY > SCREEN_HEIGHT - 160;
        const isNearCenter = Math.abs(absX - SCREEN_WIDTH / 2) < 70;
        onOverTrashChange(isNearBottom && isNearCenter);
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        const absY = evt.nativeEvent.pageY;
        const absX = evt.nativeEvent.pageX;
        const isNearBottom = absY > SCREEN_HEIGHT - 160;
        const isNearCenter = Math.abs(absX - SCREEN_WIDTH / 2) < 70;

        if (isNearBottom && isNearCenter) {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          onDelete(item.id);
        } else {
          const newX = currentPos.current.x + gestureState.dx;
          const newY = currentPos.current.y + gestureState.dy;
          currentPos.current = { x: newX, y: newY };
          onUpdate({ ...item, x: newX, y: newY });
        }
        onDragEnd();
      },
    })
  ).current;

  // Render text element
  if (item.type === "text") {
    const fontMeta = INSTAGRAM_FONTS.find((f) => f.id === item.fontId) || INSTAGRAM_FONTS[0];

    const getHighlightStyle = () => {
      if (item.highlightMode === "solid") {
        return {
          backgroundColor: item.color === "#FFFFFF" ? "#000000" : "#FFFFFF",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
        };
      }
      if (item.highlightMode === "transparent") {
        return {
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
        };
      }
      if (item.highlightMode === "outline") {
        return {
          borderWidth: 2,
          borderColor: item.color,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
        };
      }
      return {};
    };

    return (
      <Animated.View
        style={[
          styles.itemWrapper,
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onEditText(item)}
          style={[styles.textBubble, getHighlightStyle()]}
        >
          <Text
            style={{
              color: item.color,
              fontSize: item.fontSize,
              textAlign: item.align,
              fontFamily: fontMeta.fontFamily,
              fontWeight: fontMeta.fontWeight,
              fontStyle: fontMeta.fontStyle,
              letterSpacing: fontMeta.letterSpacing,
              textTransform: fontMeta.textTransform,
            }}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Render sticker widgets
  const renderStickerContent = () => {
    switch (item.stickerType) {
      case "location":
        return (
          <View style={styles.locationPill}>
            <MapPin color="#EF4444" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.locationText}>{item.data.location}</Text>
          </View>
        );

      case "mention":
        return (
          <View style={styles.mentionPill}>
            <AtSign color="#F59E0B" size={16} style={{ marginRight: 4 }} />
            <Text style={styles.mentionText}>{item.data.username}</Text>
          </View>
        );

      case "question":
        return (
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <HelpCircle color="#fff" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.questionTitle}>ASK A QUESTION</Text>
            </View>
            <Text style={styles.questionBody}>{item.data.question}</Text>
            <View style={styles.questionInputBox}>
              <Text style={styles.questionInputPlaceholder}>Type something...</Text>
            </View>
          </View>
        );

      case "poll":
        return (
          <View style={styles.pollCard}>
            <Text style={styles.pollQuestion}>{item.data.question}</Text>
            <View style={styles.pollOptionsRow}>
              <View style={[styles.pollOption, styles.pollOptionA]}>
                <Text style={styles.pollOptionText}>{item.data.optionA}</Text>
              </View>
              <View style={[styles.pollOption, styles.pollOptionB]}>
                <Text style={styles.pollOptionText}>{item.data.optionB}</Text>
              </View>
            </View>
          </View>
        );

      case "add_yours":
        return (
          <View style={styles.addYoursCard}>
            <View style={styles.addYoursHeader}>
              <Camera color="#fff" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.addYoursHeaderText}>Add Yours</Text>
            </View>
            <Text style={styles.addYoursPrompt}>{item.data.prompt}</Text>
          </View>
        );

      case "slider":
        return (
          <View style={styles.sliderCard}>
            <Text style={styles.sliderQuestion}>{item.data.question}</Text>
            <View style={styles.sliderTrack}>
              <View style={styles.sliderFill} />
              <View style={styles.sliderThumb}>
                <Text style={{ fontSize: 22 }}>{item.data.emoji}</Text>
              </View>
            </View>
          </View>
        );

      case "time":
        return (
          <View style={styles.timeWidget}>
            <Text style={styles.timeText}>{item.data.time}</Text>
          </View>
        );

      case "music":
        return (
          <View style={styles.musicSticker}>
            <Music color="#06B6D4" size={18} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.musicStickerTitle} numberOfLines={1}>
                {item.data.title}
              </Text>
              <Text style={styles.musicStickerArtist} numberOfLines={1}>
                {item.data.artist}
              </Text>
            </View>
          </View>
        );

      case "emoji":
      default:
        return <Text style={styles.plainEmoji}>{item.data.emoji}</Text>;
    }
  };

  return (
    <Animated.View
      style={[
        styles.itemWrapper,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={0.9}>
        {renderStickerContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  itemWrapper: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
    zIndex: 20,
  },
  textBubble: {
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  trashCanContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    zIndex: 99,
  },
  trashPill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  trashPillActive: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
    borderColor: "#EF4444",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  locationText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  mentionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  mentionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  questionCard: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  questionTitle: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  questionBody: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  questionInputBox: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  questionInputPlaceholder: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  pollCard: {
    width: 240,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  pollQuestion: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  pollOptionsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },
  pollOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pollOptionA: {
    backgroundColor: "#10B981",
  },
  pollOptionB: {
    backgroundColor: "#EF4444",
  },
  pollOptionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  addYoursCard: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    minWidth: 200,
  },
  addYoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  addYoursHeaderText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  addYoursPrompt: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  sliderCard: {
    width: 240,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  sliderQuestion: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  sliderTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    position: "relative",
    justifyContent: "center",
  },
  sliderFill: {
    width: "70%",
    height: "100%",
    backgroundColor: "#EC4899",
    borderRadius: 6,
  },
  sliderThumb: {
    position: "absolute",
    left: "65%",
    top: -12,
  },
  timeWidget: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  timeText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
  },
  musicSticker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: 220,
  },
  musicStickerTitle: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  musicStickerArtist: {
    color: "#666",
    fontSize: 11,
  },
  plainEmoji: {
    fontSize: 54,
  },
});
