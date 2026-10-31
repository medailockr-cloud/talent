// Filter definitions and real-time visual tone-mapping configurations

export interface TalentFilter {
  id: string;
  name: string;
  category: "All" | "Popular" | "Stage" | "Portrait" | "Cinematic" | "Mood" | "Film" | "B&W";
  badge?: string;
  cssFilter: (intensity: number) => string;
  overlayColor?: string;
  overlayOpacity?: number;
  secondaryOverlay?: string;
  previewBg: string;
  accentColor: string;
  description: string;
}

export const TALENT_FILTERS: TalentFilter[] = [
  {
    id: "original",
    name: "Original",
    category: "All",
    cssFilter: () => "none",
    previewBg: "#1F2937",
    accentColor: "#9CA3AF",
    description: "Raw unedited capture",
  },
  {
    id: "stage",
    name: "Stage",
    category: "Stage",
    badge: "POPULAR",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.3 * int}) saturate(${1 + 0.45 * int}) brightness(${1 + 0.05 * int}) hue-rotate(${-8 * int}deg)`,
    overlayColor: "rgba(233, 30, 118, 0.16)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(251, 146, 60, 0.1)",
    previewBg: "#E91E76",
    accentColor: "#E91E76",
    description: "Concert stage glow & punchy mids",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    category: "Stage",
    badge: "DRAMA",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.45 * int}) brightness(${1 - 0.08 * int}) saturate(${1 + 0.3 * int})`,
    overlayColor: "rgba(99, 102, 241, 0.2)",
    overlayOpacity: 0.85,
    secondaryOverlay: "rgba(244, 63, 94, 0.12)",
    previewBg: "#4338CA",
    accentColor: "#818CF8",
    description: "Dramatic theatre spotlight with deep vignette",
  },
  {
    id: "live",
    name: "Live Neon",
    category: "Stage",
    badge: "ELECTRIC",
    cssFilter: (int: number) =>
      `saturate(${1 + 0.65 * int}) contrast(${1 + 0.35 * int}) hue-rotate(${18 * int}deg)`,
    overlayColor: "rgba(168, 85, 247, 0.2)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(236, 72, 153, 0.15)",
    previewBg: "#9333EA",
    accentColor: "#C084FC",
    description: "Cyberpunk live arena lasers & violet neon",
  },
  {
    id: "goldenhour",
    name: "Golden Hour",
    category: "Stage",
    badge: "GLOW",
    cssFilter: (int: number) =>
      `sepia(${0.25 * int}) saturate(${1 + 0.5 * int}) brightness(${1 + 0.12 * int}) hue-rotate(${-10 * int}deg)`,
    overlayColor: "rgba(245, 158, 11, 0.22)",
    overlayOpacity: 0.75,
    secondaryOverlay: "rgba(234, 88, 12, 0.1)",
    previewBg: "#B45309",
    accentColor: "#FBBF24",
    description: "Warm afternoon sunburst & golden amphitheatre aura",
  },
  {
    id: "pyroarena",
    name: "Pyro Arena",
    category: "Stage",
    badge: "HOT",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.52 * int}) saturate(${1 + 0.65 * int}) brightness(${1 - 0.04 * int}) hue-rotate(${-20 * int}deg)`,
    overlayColor: "rgba(239, 68, 68, 0.24)",
    overlayOpacity: 0.85,
    secondaryOverlay: "rgba(249, 115, 22, 0.16)",
    previewBg: "#DC2626",
    accentColor: "#F87171",
    description: "Fierce stadium rock & pyro red energy",
  },
  {
    id: "studio",
    name: "Studio",
    category: "Popular",
    badge: "PRO",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.22 * int}) brightness(${1 + 0.08 * int}) saturate(${1 + 0.18 * int})`,
    overlayColor: "rgba(14, 165, 233, 0.12)",
    overlayOpacity: 0.7,
    previewBg: "#0284C7",
    accentColor: "#38BDF8",
    description: "Crisp studio clarity & balanced exposure",
  },
  {
    id: "autofix",
    name: "Auto Fix",
    category: "Popular",
    badge: "AI",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.22 * int}) brightness(${1 + 0.1 * int}) saturate(${1 + 0.22 * int})`,
    overlayColor: "rgba(233, 30, 118, 0.08)",
    overlayOpacity: 0.7,
    previewBg: "#E91E76",
    accentColor: "#F472B6",
    description: "Smart luminance & dynamic range balance",
  },
  {
    id: "natural",
    name: "Natural",
    category: "Popular",
    cssFilter: (int: number) =>
      `brightness(${1 + 0.06 * int}) saturate(${1 + 0.12 * int}) contrast(${1 + 0.08 * int})`,
    overlayColor: "rgba(245, 158, 11, 0.10)",
    overlayOpacity: 0.6,
    previewBg: "#D97706",
    accentColor: "#FBBF24",
    description: "Soft warm radiance & natural skin luster",
  },
  {
    id: "silk",
    name: "Silk & Glow",
    category: "Portrait",
    badge: "BEAUTY",
    cssFilter: (int: number) =>
      `brightness(${1 + 0.15 * int}) contrast(${1 - 0.06 * int}) saturate(${1 + 0.18 * int})`,
    overlayColor: "rgba(253, 230, 138, 0.14)",
    overlayOpacity: 0.65,
    previewBg: "#F59E0B",
    accentColor: "#FDE68A",
    description: "Soft luminous skin tones & dreamy beauty diffusion",
  },
  {
    id: "porcelain",
    name: "Porcelain",
    category: "Portrait",
    cssFilter: (int: number) =>
      `brightness(${1 + 0.18 * int}) contrast(${1 + 0.14 * int}) saturate(${1 - 0.08 * int})`,
    overlayColor: "rgba(241, 245, 249, 0.16)",
    overlayOpacity: 0.65,
    previewBg: "#94A3B8",
    accentColor: "#F8FAFC",
    description: "Clean high-key studio glamour illumination",
  },
  {
    id: "warmhoney",
    name: "Warm Honey",
    category: "Portrait",
    cssFilter: (int: number) =>
      `sepia(${0.22 * int}) saturate(${1 + 0.38 * int}) contrast(${1 + 0.16 * int}) brightness(${1 + 0.05 * int})`,
    overlayColor: "rgba(217, 119, 6, 0.18)",
    overlayOpacity: 0.7,
    previewBg: "#92400E",
    accentColor: "#F59E0B",
    description: "Rich caramel warmth for dancers & singers",
  },
  {
    id: "tealorange",
    name: "Teal & Orange",
    category: "Cinematic",
    badge: "CINEMA",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.38 * int}) saturate(${1 + 0.42 * int}) hue-rotate(${14 * int}deg)`,
    overlayColor: "rgba(13, 148, 136, 0.2)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(249, 115, 22, 0.15)",
    previewBg: "#0F766E",
    accentColor: "#2DD4BF",
    description: "Hollywood signature blockbuster color grade",
  },
  {
    id: "neotokyo",
    name: "Neo Tokyo",
    category: "Cinematic",
    badge: "SCI-FI",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.45 * int}) saturate(${1 + 0.7 * int}) hue-rotate(${165 * int}deg)`,
    overlayColor: "rgba(6, 182, 212, 0.22)",
    overlayOpacity: 0.85,
    secondaryOverlay: "rgba(236, 72, 153, 0.18)",
    previewBg: "#0891B2",
    accentColor: "#67E8F9",
    description: "Rain-slicked neon cyan and magenta haze",
  },
  {
    id: "silverscreen",
    name: "Silver Screen",
    category: "Cinematic",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.36 * int}) saturate(${1 - 0.4 * int}) brightness(${1 - 0.05 * int})`,
    overlayColor: "rgba(71, 85, 105, 0.22)",
    overlayOpacity: 0.75,
    previewBg: "#334155",
    accentColor: "#94A3B8",
    description: "Bleached thriller palette with silver dynamic range",
  },
  {
    id: "portra",
    name: "Portra 400",
    category: "Film",
    badge: "ANALOG",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.14 * int}) saturate(${1 + 0.24 * int}) sepia(${0.16 * int}) brightness(${1 + 0.07 * int})`,
    overlayColor: "rgba(254, 215, 170, 0.16)",
    overlayOpacity: 0.7,
    previewBg: "#C2410C",
    accentColor: "#FDBA74",
    description: "Iconic pastel emulsion & organic skin tones",
  },
  {
    id: "vintage",
    name: "Vintage '92",
    category: "Film",
    badge: "RETRO",
    cssFilter: (int: number) =>
      `sepia(${0.55 * int}) contrast(${1 + 0.18 * int}) brightness(${1 - 0.04 * int}) saturate(${1 + 0.2 * int})`,
    overlayColor: "rgba(180, 83, 9, 0.22)",
    overlayOpacity: 0.8,
    previewBg: "#B45309",
    accentColor: "#F59E0B",
    description: "35mm grain aesthetic & analogue warmth",
  },
  {
    id: "vividchrome",
    name: "Vivid Chrome",
    category: "Film",
    badge: "VIVID",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.4 * int}) saturate(${1 + 0.75 * int}) brightness(${1 - 0.02 * int})`,
    overlayColor: "rgba(16, 185, 129, 0.16)",
    overlayOpacity: 0.7,
    secondaryOverlay: "rgba(59, 130, 246, 0.12)",
    previewBg: "#047857",
    accentColor: "#6EE7B7",
    description: "Ultra-saturated slide film with punchy primaries",
  },
  {
    id: "emerald",
    name: "Emerald",
    category: "Film",
    cssFilter: (int: number) =>
      `hue-rotate(${30 * int}deg) saturate(${1 + 0.25 * int}) contrast(${1 + 0.25 * int})`,
    overlayColor: "rgba(16, 185, 129, 0.18)",
    overlayOpacity: 0.75,
    previewBg: "#059669",
    accentColor: "#34D399",
    description: "Indie festival teal & emerald cinematic tint",
  },
  {
    id: "vhs",
    name: "VHS '88",
    category: "Film",
    badge: "LO-FI",
    cssFilter: (int: number) =>
      `contrast(${1 + 0.22 * int}) saturate(${1 + 0.38 * int}) hue-rotate(${-18 * int}deg) brightness(${1 + 0.06 * int})`,
    overlayColor: "rgba(219, 39, 119, 0.18)",
    overlayOpacity: 0.75,
    previewBg: "#9D174D",
    accentColor: "#F472B6",
    description: "Camcorder nostalgia & analog tape color bleed",
  },
  {
    id: "sunset",
    name: "Sunset Dream",
    category: "Mood",
    badge: "DUSK",
    cssFilter: (int: number) =>
      `sepia(${0.3 * int}) saturate(${1 + 0.45 * int}) brightness(${1 + 0.06 * int}) hue-rotate(${-15 * int}deg)`,
    overlayColor: "rgba(244, 63, 94, 0.18)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(251, 191, 36, 0.12)",
    previewBg: "#BE123C",
    accentColor: "#FDA4AF",
    description: "Radiant dusk horizon & magenta blush",
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    category: "Mood",
    badge: "NIGHT",
    cssFilter: (int: number) =>
      `brightness(${1 - 0.12 * int}) contrast(${1 + 0.3 * int}) hue-rotate(${190 * int}deg) saturate(${1 + 0.32 * int})`,
    overlayColor: "rgba(30, 58, 138, 0.26)",
    overlayOpacity: 0.85,
    secondaryOverlay: "rgba(56, 189, 248, 0.12)",
    previewBg: "#1E3A8A",
    accentColor: "#60A5FA",
    description: "Moody late-night electric blue ambiance",
  },
  {
    id: "candypop",
    name: "Candy Pop",
    category: "Mood",
    badge: "POP",
    cssFilter: (int: number) =>
      `saturate(${1 + 0.85 * int}) contrast(${1 + 0.25 * int}) brightness(${1 + 0.12 * int})`,
    overlayColor: "rgba(244, 114, 182, 0.2)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(192, 132, 252, 0.14)",
    previewBg: "#DB2777",
    accentColor: "#F472B6",
    description: "Bursting pastel candy punch for upbeat moves",
  },
  {
    id: "ethereal",
    name: "Ethereal Mist",
    category: "Mood",
    cssFilter: (int: number) =>
      `brightness(${1 + 0.16 * int}) contrast(${1 - 0.1 * int}) saturate(${1 + 0.22 * int}) hue-rotate(${20 * int}deg)`,
    overlayColor: "rgba(167, 139, 250, 0.2)",
    overlayOpacity: 0.75,
    previewBg: "#7C3AED",
    accentColor: "#C4B5FD",
    description: "Dreamy lavender glow with soft highlights",
  },
  {
    id: "lowlight",
    name: "Low Light",
    category: "Mood",
    cssFilter: (int: number) =>
      `brightness(${1 + 0.35 * int}) contrast(${1 + 0.18 * int}) saturate(${1 + 0.15 * int})`,
    overlayColor: "rgba(255, 255, 255, 0.12)",
    overlayOpacity: 0.6,
    previewBg: "#475569",
    accentColor: "#94A3B8",
    description: "Nightclub & dim room exposure booster",
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    category: "Mood",
    badge: "FUTURISTIC",
    cssFilter: (int: number) =>
      `hue-rotate(${135 * int}deg) saturate(${1 + 0.6 * int}) contrast(${1 + 0.3 * int})`,
    overlayColor: "rgba(244, 63, 94, 0.18)",
    overlayOpacity: 0.8,
    secondaryOverlay: "rgba(59, 130, 246, 0.18)",
    previewBg: "#E11D48",
    accentColor: "#FB7185",
    description: "Dual-tone hyper-contrast nightscape",
  },
  {
    id: "bw",
    name: "Noir B&W",
    category: "B&W",
    badge: "CLASSIC",
    cssFilter: (int: number) =>
      `grayscale(${1 * int}) contrast(${1 + 0.42 * int}) brightness(${1 - 0.06 * int})`,
    overlayColor: "rgba(17, 24, 39, 0.25)",
    overlayOpacity: 0.8,
    previewBg: "#111827",
    accentColor: "#F3F4F6",
    description: "High-contrast cinematic monochrome",
  },
  {
    id: "graphite",
    name: "Graphite Deep",
    category: "B&W",
    badge: "CRISP",
    cssFilter: (int: number) =>
      `grayscale(${1 * int}) contrast(${1 + 0.75 * int}) brightness(${1 - 0.12 * int})`,
    overlayColor: "rgba(0, 0, 0, 0.35)",
    overlayOpacity: 0.9,
    previewBg: "#030712",
    accentColor: "#E5E7EB",
    description: "Inky crushed blacks & punchy silver highlights",
  },
  {
    id: "sepianostalgia",
    name: "Sepia Archive",
    category: "B&W",
    badge: "VINTAGE",
    cssFilter: (int: number) =>
      `sepia(${0.9 * int}) contrast(${1 + 0.22 * int}) brightness(${1 - 0.02 * int})`,
    overlayColor: "rgba(120, 53, 15, 0.24)",
    overlayOpacity: 0.8,
    previewBg: "#78350F",
    accentColor: "#D97706",
    description: "Timeless antique museum sepia print",
  },
];

// Fallback lookup table for classic Instagram camera filters
const INSTAGRAM_FALLBACKS: Record<string, Partial<TalentFilter>> = {
  clarendon: {
    name: "Clarendon",
    cssFilter: (int: number) => `contrast(${1 + 0.25 * int}) saturate(${1 + 0.3 * int}) brightness(${1 + 0.05 * int})`,
    overlayColor: "rgba(127, 187, 255, 0.15)",
    overlayOpacity: 0.7,
  },
  gingham: {
    name: "Gingham",
    cssFilter: (int: number) => `sepia(${0.15 * int}) contrast(${1 - 0.1 * int}) brightness(${1 + 0.1 * int})`,
    overlayColor: "rgba(230, 230, 250, 0.18)",
    overlayOpacity: 0.65,
  },
  juno: {
    name: "Juno",
    cssFilter: (int: number) => `contrast(${1 + 0.2 * int}) saturate(${1 + 0.35 * int}) hue-rotate(${-5 * int}deg)`,
    overlayColor: "rgba(255, 170, 0, 0.14)",
    overlayOpacity: 0.7,
  },
  lark: {
    name: "Lark",
    cssFilter: (int: number) => `contrast(${1 + 0.1 * int}) brightness(${1 + 0.12 * int}) saturate(${1 - 0.08 * int})`,
    overlayColor: "rgba(180, 220, 240, 0.16)",
    overlayOpacity: 0.6,
  },
  ludwig: {
    name: "Ludwig",
    cssFilter: (int: number) => `contrast(${1 + 0.15 * int}) brightness(${1 + 0.05 * int}) saturate(${1 - 0.05 * int})`,
    overlayColor: "rgba(245, 158, 11, 0.12)",
    overlayOpacity: 0.6,
  },
  moon: {
    name: "Moon",
    cssFilter: (int: number) => `grayscale(${1 * int}) contrast(${1 + 0.25 * int}) brightness(${1 + 0.05 * int})`,
    overlayColor: "rgba(0, 0, 0, 0.25)",
    overlayOpacity: 0.7,
  },
  reyes: {
    name: "Reyes",
    cssFilter: (int: number) => `sepia(${0.22 * int}) brightness(${1 + 0.15 * int}) contrast(${1 - 0.15 * int})`,
    overlayColor: "rgba(255, 235, 205, 0.18)",
    overlayOpacity: 0.6,
  },
  slumber: {
    name: "Slumber",
    cssFilter: (int: number) => `saturate(${1 - 0.25 * int}) sepia(${0.2 * int}) brightness(${1 + 0.05 * int})`,
    overlayColor: "rgba(200, 160, 120, 0.15)",
    overlayOpacity: 0.6,
  },
  valencia: {
    name: "Valencia",
    cssFilter: (int: number) => `sepia(${0.25 * int}) contrast(${1 + 0.1 * int}) brightness(${1 + 0.08 * int})`,
    overlayColor: "rgba(254, 215, 170, 0.2)",
    overlayOpacity: 0.65,
  },
  xpro2: {
    name: "X-Pro II",
    cssFilter: (int: number) => `contrast(${1 + 0.4 * int}) saturate(${1 + 0.3 * int}) brightness(${1 - 0.05 * int})`,
    overlayColor: "rgba(20, 50, 120, 0.22)",
    overlayOpacity: 0.75,
  },
  lofi: {
    name: "Lo-Fi",
    cssFilter: (int: number) => `contrast(${1 + 0.45 * int}) saturate(${1 + 0.5 * int})`,
    overlayColor: "rgba(236, 72, 153, 0.14)",
    overlayOpacity: 0.7,
  },
};

/**
 * Resolves filter configuration by id or display name (case-insensitive)
 */
export function getFilterConfig(filterNameOrId: string | null | undefined): TalentFilter {
  if (!filterNameOrId) return TALENT_FILTERS[0];
  const normalized = filterNameOrId.trim().toLowerCase();

  if (normalized === "original" || normalized === "normal" || normalized === "none") {
    return TALENT_FILTERS[0];
  }

  const found = TALENT_FILTERS.find(
    (f) => f.id.toLowerCase() === normalized || f.name.toLowerCase() === normalized
  );
  if (found) return found;

  const igMatch = INSTAGRAM_FALLBACKS[normalized];
  if (igMatch) {
    return {
      id: normalized,
      name: igMatch.name || filterNameOrId,
      category: "Popular",
      cssFilter: igMatch.cssFilter || (() => "none"),
      overlayColor: igMatch.overlayColor,
      overlayOpacity: igMatch.overlayOpacity,
      previewBg: "#1F2937",
      accentColor: "#9CA3AF",
      description: "Instagram style filter",
    };
  }

  return TALENT_FILTERS[0];
}

/**
 * Computes CSS filter string for Web elements (video or img)
 */
export function getEffectiveFilterCss(
  filterNameOrId: string | null | undefined,
  intensity: number | null | undefined = 0.85
): string {
  const config = getFilterConfig(filterNameOrId);
  if (!config || config.id === "original" || config.id === "normal") {
    return "none";
  }
  const effIntensity =
    typeof intensity === "number" && !isNaN(intensity)
      ? Math.max(0, Math.min(1, intensity))
      : 0.85;
  return config.cssFilter(effIntensity);
}

