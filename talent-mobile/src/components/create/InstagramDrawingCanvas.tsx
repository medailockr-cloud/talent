import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  StyleSheet,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  PenTool,
  Highlighter,
  Sparkles,
  Eraser,
  RotateCcw,
  Check,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DrawingBrushType, DrawingPath } from "./types";
import { INSTAGRAM_COLORS } from "./InstagramTextEditor";

interface InstagramDrawingCanvasProps {
  visible: boolean;
  onClose: () => void;
  paths: DrawingPath[];
  onSavePaths: (paths: DrawingPath[]) => void;
}

export function InstagramDrawingCanvas({
  visible,
  onClose,
  paths: initialPaths,
  onSavePaths,
}: InstagramDrawingCanvasProps) {
  const [paths, setPaths] = useState<DrawingPath[]>(initialPaths || []);
  const [currentBrush, setCurrentBrush] = useState<DrawingBrushType>("pen");
  const [selectedColor, setSelectedColor] = useState<string>("#FFFFFF");
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);

  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPointsRef.current = [{ x: locationX, y: locationY }];
        setCurrentPathPoints([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPointsRef.current.push({ x: locationX, y: locationY });
        setCurrentPathPoints([...currentPointsRef.current]);
      },
      onPanResponderRelease: () => {
        if (currentPointsRef.current.length > 0) {
          if (currentBrush === "eraser") {
            // Eraser logic: remove paths near touch points
            const lastPoint = currentPointsRef.current[currentPointsRef.current.length - 1];
            setPaths((prev) =>
              prev.filter((p) => {
                const hasNearPoint = p.points.some(
                  (pt) =>
                    Math.abs(pt.x - lastPoint.x) < 30 &&
                    Math.abs(pt.y - lastPoint.y) < 30
                );
                return !hasNearPoint;
              })
            );
          } else {
            const newPath: DrawingPath = {
              id: "path_" + Date.now() + "_" + Math.random().toString(36).substring(7),
              brush: currentBrush,
              color: selectedColor,
              strokeWidth: currentBrush === "highlighter" ? strokeWidth * 2.5 : strokeWidth,
              points: [...currentPointsRef.current],
            };
            setPaths((prev) => [...prev, newPath]);
          }
        }
        currentPointsRef.current = [];
        setCurrentPathPoints([]);
      },
    })
  ).current;

  if (!visible) return null;

  // Convert array of points to SVG path 'd' string
  const pointsToSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const handleUndo = () => {
    triggerHaptic();
    setPaths((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    triggerHaptic();
    setPaths([]);
  };

  const handleDone = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onSavePaths(paths);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Action Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleUndo}
            disabled={paths.length === 0}
          >
            <RotateCcw
              color={paths.length > 0 ? "#fff" : "rgba(255, 255, 255, 0.3)"}
              size={22}
            />
          </TouchableOpacity>

          {/* Brush Selector */}
          <View style={styles.brushRow}>
            {/* Pen */}
            <TouchableOpacity
              style={[
                styles.brushItem,
                currentBrush === "pen" && styles.brushItemActive,
              ]}
              onPress={() => {
                triggerHaptic();
                setCurrentBrush("pen");
              }}
            >
              <PenTool
                color={currentBrush === "pen" ? "#000" : "#fff"}
                size={20}
              />
            </TouchableOpacity>

            {/* Highlighter */}
            <TouchableOpacity
              style={[
                styles.brushItem,
                currentBrush === "highlighter" && styles.brushItemActive,
              ]}
              onPress={() => {
                triggerHaptic();
                setCurrentBrush("highlighter");
              }}
            >
              <Highlighter
                color={currentBrush === "highlighter" ? "#000" : "#fff"}
                size={20}
              />
            </TouchableOpacity>

            {/* Neon */}
            <TouchableOpacity
              style={[
                styles.brushItem,
                currentBrush === "neon" && styles.brushItemActive,
              ]}
              onPress={() => {
                triggerHaptic();
                setCurrentBrush("neon");
              }}
            >
              <Sparkles
                color={currentBrush === "neon" ? "#000" : "#fff"}
                size={20}
              />
            </TouchableOpacity>

            {/* Eraser */}
            <TouchableOpacity
              style={[
                styles.brushItem,
                currentBrush === "eraser" && styles.brushItemActive,
              ]}
              onPress={() => {
                triggerHaptic();
                setCurrentBrush("eraser");
              }}
            >
              <Eraser
                color={currentBrush === "eraser" ? "#000" : "#fff"}
                size={20}
              />
            </TouchableOpacity>
          </View>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Drawing Surface with SVG */}
        <View style={styles.canvasArea} {...panResponder.panHandlers}>
          <Svg style={StyleSheet.absoluteFill}>
            {/* Render saved paths */}
            {paths.map((p) => {
              const d = pointsToSvgPath(p.points);
              if (p.brush === "neon") {
                return (
                  <React.Fragment key={p.id}>
                    {/* Outer glow */}
                    <Path
                      d={d}
                      stroke={p.color}
                      strokeWidth={p.strokeWidth * 3}
                      strokeOpacity={0.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Inner core */}
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

            {/* Render active dragging path */}
            {currentPathPoints.length > 0 && (
              <Path
                d={pointsToSvgPath(currentPathPoints)}
                stroke={currentBrush === "eraser" ? "rgba(255, 255, 255, 0.4)" : selectedColor}
                strokeWidth={currentBrush === "highlighter" ? strokeWidth * 2.5 : strokeWidth}
                strokeOpacity={currentBrush === "highlighter" ? 0.45 : 1}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
        </View>

        {/* Bottom Color Palette */}
        <View style={styles.bottomBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorScroll}
          >
            {INSTAGRAM_COLORS.map((col) => {
              const isSelected = selectedColor === col && currentBrush !== "eraser";
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
                    setSelectedColor(col);
                    if (currentBrush === "eraser") setCurrentBrush("pen");
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 30 : 50,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  brushRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    padding: 4,
    gap: 4,
  },
  brushItem: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  brushItemActive: {
    backgroundColor: "#fff",
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
  canvasArea: {
    flex: 1,
    position: "relative",
  },
  bottomBar: {
    paddingBottom: Platform.OS === "android" ? 20 : 36,
    paddingTop: 10,
  },
  colorScroll: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: "center",
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
