import React from "react";
import { View, StyleSheet } from "react-native";
import { getFilterConfig } from "../../constants/filters";

export interface MediaFilterOverlayProps {
  filter?: string | null;
  filterIntensity?: number | null;
}

export function MediaFilterOverlay({
  filter,
  filterIntensity = 0.85,
}: MediaFilterOverlayProps) {
  if (!filter) return null;

  const normalized = filter.trim().toLowerCase();
  if (normalized === "original" || normalized === "normal" || normalized === "none") {
    return null;
  }

  const config = getFilterConfig(filter);
  if (!config || config.id === "original" || config.id === "normal") {
    return null;
  }

  const intensity =
    typeof filterIntensity === "number" && !isNaN(filterIntensity)
      ? Math.max(0, Math.min(1, filterIntensity))
      : 0.85;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {config.overlayColor && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: config.overlayColor,
              opacity: intensity * (config.overlayOpacity || 0.6),
            },
          ]}
        />
      )}
      {config.secondaryOverlay && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: config.secondaryOverlay,
              opacity: intensity * 0.12,
            },
          ]}
        />
      )}
    </View>
  );
}
