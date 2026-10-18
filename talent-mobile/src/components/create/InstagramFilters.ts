export interface InstagramFilter {
  id: string;
  name: string;
  subtitle: string;
  cssFilter: (intensity: number) => string;
  overlayColor?: string;
  overlayOpacity?: number;
  contrast?: number;
  saturation?: number;
  brightness?: number;
  swatch: string[];
}

export const INSTAGRAM_FILTERS: InstagramFilter[] = [
  {
    id: "normal",
    name: "Normal",
    subtitle: "Original capture",
    cssFilter: () => "none",
    contrast: 1,
    saturation: 1,
    brightness: 1,
    swatch: ["#262626", "#404040"],
  },
  {
    id: "clarendon",
    name: "Clarendon",
    subtitle: "Punchy contrast & bright highlights",
    cssFilter: (int) =>
      `contrast(${1 + 0.25 * int}) saturate(${1 + 0.3 * int}) brightness(${1 + 0.05 * int})`,
    overlayColor: "rgba(127, 187, 255, 0.15)",
    overlayOpacity: 0.7,
    contrast: 1.25,
    saturation: 1.3,
    brightness: 1.05,
    swatch: ["#3B82F6", "#60A5FA"],
  },
  {
    id: "gingham",
    name: "Gingham",
    subtitle: "Soft vintage haze",
    cssFilter: (int) =>
      `sepia(${0.15 * int}) contrast(${1 - 0.1 * int}) brightness(${1 + 0.1 * int})`,
    overlayColor: "rgba(230, 230, 250, 0.18)",
    overlayOpacity: 0.65,
    contrast: 0.9,
    saturation: 0.9,
    brightness: 1.1,
    swatch: ["#D8B4FE", "#F472B6"],
  },
  {
    id: "juno",
    name: "Juno",
    subtitle: "Vibrant warm tones & deep greens",
    cssFilter: (int) =>
      `contrast(${1 + 0.2 * int}) saturate(${1 + 0.35 * int}) hue-rotate(${-5 * int}deg)`,
    overlayColor: "rgba(255, 170, 0, 0.14)",
    overlayOpacity: 0.7,
    contrast: 1.2,
    saturation: 1.35,
    brightness: 1.02,
    swatch: ["#F59E0B", "#EF4444"],
  },
  {
    id: "lark",
    name: "Lark",
    subtitle: "Desaturated warm tones, bright blues",
    cssFilter: (int) =>
      `contrast(${1 + 0.1 * int}) brightness(${1 + 0.12 * int}) saturate(${1 - 0.08 * int})`,
    overlayColor: "rgba(180, 220, 240, 0.16)",
    overlayOpacity: 0.6,
    contrast: 1.1,
    saturation: 0.92,
    brightness: 1.12,
    swatch: ["#06B6D4", "#3B82F6"],
  },
  {
    id: "ludwig",
    name: "Ludwig",
    subtitle: "Warm minimalist tone with rich shadows",
    cssFilter: (int) =>
      `contrast(${1 + 0.15 * int}) brightness(${1 + 0.05 * int}) saturate(${1 - 0.05 * int})`,
    overlayColor: "rgba(245, 158, 11, 0.12)",
    overlayOpacity: 0.6,
    contrast: 1.15,
    saturation: 0.95,
    brightness: 1.05,
    swatch: ["#D97706", "#78350F"],
  },
  {
    id: "moon",
    name: "Moon",
    subtitle: "Cinematic black & white with high contrast",
    cssFilter: (int) =>
      `grayscale(${1 * int}) contrast(${1 + 0.25 * int}) brightness(${1 + 0.05 * int})`,
    overlayColor: "rgba(0, 0, 0, 0.25)",
    overlayOpacity: 0.7,
    contrast: 1.25,
    saturation: 0,
    brightness: 1.05,
    swatch: ["#171717", "#737373"],
  },
  {
    id: "reyes",
    name: "Reyes",
    subtitle: "Subtle vintage warmth & washed shadows",
    cssFilter: (int) =>
      `sepia(${0.22 * int}) brightness(${1 + 0.15 * int}) contrast(${1 - 0.15 * int})`,
    overlayColor: "rgba(255, 235, 205, 0.18)",
    overlayOpacity: 0.6,
    contrast: 0.85,
    saturation: 0.88,
    brightness: 1.15,
    swatch: ["#FDE68A", "#F59E0B"],
  },
  {
    id: "slumber",
    name: "Slumber",
    subtitle: "Dreamy desaturated golden hour",
    cssFilter: (int) =>
      `saturate(${1 - 0.25 * int}) sepia(${0.2 * int}) brightness(${1 + 0.05 * int})`,
    overlayColor: "rgba(200, 160, 120, 0.15)",
    overlayOpacity: 0.6,
    contrast: 1.0,
    saturation: 0.75,
    brightness: 1.05,
    swatch: ["#A8A29E", "#78716C"],
  },
  {
    id: "valencia",
    name: "Valencia",
    subtitle: "Warm faded antique feel",
    cssFilter: (int) =>
      `sepia(${0.25 * int}) contrast(${1 + 0.1 * int}) brightness(${1 + 0.08 * int})`,
    overlayColor: "rgba(254, 215, 170, 0.2)",
    overlayOpacity: 0.65,
    contrast: 1.1,
    saturation: 1.1,
    brightness: 1.08,
    swatch: ["#FB923C", "#EA580C"],
  },
  {
    id: "xpro2",
    name: "X-Pro II",
    subtitle: "Heavy vignette with rich intense blues",
    cssFilter: (int) =>
      `contrast(${1 + 0.4 * int}) saturate(${1 + 0.3 * int}) brightness(${1 - 0.05 * int})`,
    overlayColor: "rgba(20, 50, 120, 0.22)",
    overlayOpacity: 0.75,
    contrast: 1.4,
    saturation: 1.3,
    brightness: 0.95,
    swatch: ["#1E3A8A", "#2563EB"],
  },
  {
    id: "lofi",
    name: "Lo-Fi",
    subtitle: "Saturated shadows and vivid colors",
    cssFilter: (int) =>
      `contrast(${1 + 0.45 * int}) saturate(${1 + 0.5 * int})`,
    overlayColor: "rgba(236, 72, 153, 0.14)",
    overlayOpacity: 0.7,
    contrast: 1.45,
    saturation: 1.5,
    brightness: 1.0,
    swatch: ["#EC4899", "#8B5CF6"],
  },
  {
    id: "perpetua",
    name: "Perpetua",
    subtitle: "Earthy nature greens and pastel highlights",
    cssFilter: (int) =>
      `brightness(${1 + 0.1 * int}) saturate(${1 + 0.15 * int}) hue-rotate(${10 * int}deg)`,
    overlayColor: "rgba(52, 211, 153, 0.15)",
    overlayOpacity: 0.65,
    contrast: 1.05,
    saturation: 1.15,
    brightness: 1.1,
    swatch: ["#10B981", "#059669"],
  },
  {
    id: "aden",
    name: "Aden",
    subtitle: "Pastel softness with soft purple undertones",
    cssFilter: (int) =>
      `hue-rotate(${-15 * int}deg) saturate(${1 - 0.15 * int}) brightness(${1 + 0.12 * int})`,
    overlayColor: "rgba(192, 132, 252, 0.16)",
    overlayOpacity: 0.6,
    contrast: 0.95,
    saturation: 0.85,
    brightness: 1.12,
    swatch: ["#C084FC", "#E879F9"],
  },
  {
    id: "amaro",
    name: "Amaro",
    subtitle: "Center spotlight glow with vintage aging",
    cssFilter: (int) =>
      `brightness(${1 + 0.18 * int}) saturate(${1 + 0.25 * int}) contrast(${1 + 0.1 * int})`,
    overlayColor: "rgba(253, 224, 71, 0.15)",
    overlayOpacity: 0.6,
    contrast: 1.1,
    saturation: 1.25,
    brightness: 1.18,
    swatch: ["#FBBF24", "#F59E0B"],
  },
  {
    id: "nashville",
    name: "Nashville",
    subtitle: "Pleasant pink pastel nostalgia",
    cssFilter: (int) =>
      `sepia(${0.2 * int}) contrast(${1 + 0.15 * int}) brightness(${1 + 0.1 * int}) saturate(${1 + 0.15 * int})`,
    overlayColor: "rgba(244, 114, 182, 0.18)",
    overlayOpacity: 0.7,
    contrast: 1.15,
    saturation: 1.15,
    brightness: 1.1,
    swatch: ["#F472B6", "#FB7185"],
  },
];
