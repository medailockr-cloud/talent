export type InstagramMode = "POST" | "STORY" | "REEL";

export type InstagramFlashMode = "off" | "on" | "auto";

export type InstagramCameraSpeed = "0.3x" | "0.5x" | "1x" | "2x" | "3x";

export type InstagramAspectRatio = "9:16" | "1:1" | "4:5";

export type InstagramLayoutMode = "none" | "1x2" | "2x1" | "2x2" | "3x3";

export interface InstagramSound {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: number;
  usesCount?: number;
  coverUrl: string;
  audioUrl: string;
  waveform?: number[];
}

export type InstagramFontId =
  | "classic"
  | "modern"
  | "neon"
  | "typewriter"
  | "strong"
  | "dropshadow"
  | "serif"
  | "comic"
  | "elegant";

export interface InstagramFontOption {
  id: InstagramFontId;
  name: string;
  fontFamily?: string;
  fontWeight?: "normal" | "bold" | "900" | "600" | "300";
  letterSpacing?: number;
  fontStyle?: "normal" | "italic";
  textTransform?: "none" | "uppercase" | "lowercase";
}

export type TextHighlightMode = "none" | "solid" | "transparent" | "outline";

export interface TextOverlayItem {
  id: string;
  type: "text";
  text: string;
  fontId: InstagramFontId;
  color: string;
  backgroundColor?: string;
  highlightMode: TextHighlightMode;
  align: "left" | "center" | "right";
  fontSize: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export type StickerType =
  | "location"
  | "mention"
  | "hashtag"
  | "question"
  | "poll"
  | "add_yours"
  | "slider"
  | "time"
  | "music"
  | "emoji";

export interface StickerOverlayItem {
  id: string;
  type: "sticker";
  stickerType: StickerType;
  data: any;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export type DrawingBrushType = "pen" | "highlighter" | "neon" | "eraser";

export interface DrawingPath {
  id: string;
  brush: DrawingBrushType;
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
}

export type OverlayItem = TextOverlayItem | StickerOverlayItem;
