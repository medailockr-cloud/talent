import React, { useEffect, useRef } from 'react';
import { AppVideoPlayerProps } from './AppVideoPlayer';

export function AppVideoPlayer({
  src,
  poster,
  isPlaying,
  isMuted,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  style,
  videoRef: externalRef,
}: AppVideoPlayerProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);
  const refToUse = externalRef || internalRef;

  useEffect(() => {
    const el = refToUse.current;
    if (el) {
      el.muted = isMuted;
      if (isPlaying) {
        el.play().catch(() => {});
      } else {
        try {
          el.pause();
        } catch (e) {}
      }
    }
  }, [isPlaying, isMuted, src]);

  return (
    <video
      ref={refToUse}
      src={src}
      autoPlay={isPlaying}
      loop
      muted={isMuted}
      playsInline
      poster={poster || undefined}
      onTimeUpdate={(e: any) => {
        if (e?.target) onTimeUpdate?.(e.target.currentTime);
      }}
      onLoadedMetadata={(e: any) => {
        if (e?.target) onLoadedMetadata?.(e.target.duration);
      }}
      onError={onError}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
    />
  );
}
