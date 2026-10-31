import React, { useEffect, useRef } from 'react';
import { AppVideoPlayerProps } from './AppVideoPlayer';
import { resolveMediaUrl } from '../../utils/api';
import { getEffectiveFilterCss } from '../../constants/filters';
import { MediaFilterOverlay } from './MediaFilterOverlay';

export function AppVideoPlayer({
  src,
  poster,
  isPlaying,
  isMuted,
  filter,
  filterIntensity,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  style,
  videoRef: externalRef,
}: AppVideoPlayerProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);
  const refToUse = externalRef || internalRef;
  const resolvedSrc = resolveMediaUrl(src || '');
  const resolvedPoster = poster ? resolveMediaUrl(poster) : undefined;
  const cssFilter = getEffectiveFilterCss(filter, filterIntensity);

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
  }, [isPlaying, isMuted, resolvedSrc]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <video
        ref={refToUse}
        src={resolvedSrc}
        autoPlay={isPlaying}
        loop
        muted={isMuted}
        playsInline
        poster={resolvedPoster}
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
          filter: cssFilter !== 'none' ? cssFilter : undefined,
          ...style,
        }}
      />
      <MediaFilterOverlay filter={filter} filterIntensity={filterIntensity} />
    </div>
  );
}
