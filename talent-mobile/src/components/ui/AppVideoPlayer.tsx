import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { resolveMediaUrl } from '../../utils/api';

export interface AppVideoPlayerProps {
  src: string;
  poster?: string;
  isPlaying: boolean;
  isMuted: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onError?: () => void;
  style?: any;
  className?: string;
  videoRef?: any;
}

export function AppVideoPlayer({
  src,
  poster,
  isPlaying,
  isMuted,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  style,
}: AppVideoPlayerProps) {
  const resolvedSrc = resolveMediaUrl(src || '');
  const resolvedPoster = poster ? resolveMediaUrl(poster) : undefined;

  const player = useVideoPlayer(resolvedSrc, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.timeUpdateEventInterval = 0.25;
    if (isPlaying) {
      try {
        p.play();
      } catch (e) {}
    }
  });

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
      if (isPlaying) {
        try {
          player.play();
        } catch (e) {}
      } else {
        try {
          player.pause();
        } catch (e) {}
      }
    }
  }, [isPlaying, isMuted, player]);

  // Time update listener
  useEffect(() => {
    if (!player) return;
    try {
      const sub = (player as any).addListener?.('timeUpdate', (event: any) => {
        if (event && typeof event.currentTime === 'number') {
          onTimeUpdate?.(event.currentTime);
        }
      });
      return () => {
        try {
          sub?.remove?.();
        } catch (e) {}
      };
    } catch (e) {}
  }, [player, onTimeUpdate]);

  if (!resolvedSrc) {
    return resolvedPoster ? (
      <Image source={{ uri: resolvedPoster }} style={[StyleSheet.absoluteFill, style]} resizeMode="cover" />
    ) : null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      {resolvedPoster && (
        <Image source={{ uri: resolvedPoster }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}
