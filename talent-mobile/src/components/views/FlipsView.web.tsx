import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, MessageCircle, Share2, MoreHorizontal, Volume2, VolumeX, Play, X, ArrowUpRight, Check, Plus, Search, Send, CheckCircle2 } from 'lucide-react-native';
import { api, resolveMediaUrl } from '../../utils/api';
import { useKeptStore } from '../../store/keptStore';
import { useCommunityStore } from '../../store/communityStore';
import { useThemeStore } from '../../store/themeStore';

export const FLIPS_DATA: any[] = [];

function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function timeLabel(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

function ApplauseMark({ filled }: { filled: boolean }) {
  return (
    <svg
      className="talent-applause-mark"
      width="25"
      height="25"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        fill={filled ? 'currentColor' : 'none'}
        fillOpacity={filled ? 0.22 : 0}
        d="m9 20-4-5c-1-1.4 1-3 2-1.8l1.8 1.6-3.6-6c-.9-1.6 1.3-2.8 2.2-1.2l3 4.5-2.8-6c-.7-1.7 1.6-2.6 2.3-1l3 5.7-1.8-5.5c-.5-1.7 1.9-2.4 2.4-.8l2.5 6.7c.7-1 2-1.3 2.5-.3l1.7 4c1.8 4.3-1.6 8.5-5.4 8.5-2.3 0-4.1-1.5-5.8-3.4Z"
      />
      <path d="m19 3 1-1m1 5 2-1m-1 5h2" />
    </svg>
  );
}

function PiPMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <rect x="12" y="10" width="8" height="6" rx="1" />
      <path d="M12 12l2 2" />
    </svg>
  );
}

function SkipMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
      <line x1="19" y1="5" x2="19" y2="19" strokeWidth="2.4" />
    </svg>
  );
}

const flipsStyles = `
.talent-flips {
  height: 100dvh;
  background: #000;
  color: #fff;
  position: relative;
  overflow: hidden;
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
}
.talent-flips * {
  box-sizing: border-box;
}
.talent-flips button {
  font: inherit;
  cursor: pointer;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
}
.talent-flips button:disabled {
  cursor: default;
  opacity: 0.4;
}
.talent-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  transition: background 0.15s ease;
}
.talent-icon:hover {
  background: rgba(255, 255, 255, 0.12);
}
.talent-flip-scroll {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  overscroll-behavior: contain;
}
.talent-flip-scroll::-webkit-scrollbar {
  display: none;
}
.talent-flip-slide {
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #000;
  overflow: hidden;
}
.talent-flip-top {
  position: absolute;
  left: max(16px, calc(10px + env(safe-area-inset-left, 0px)));
  right: max(16px, calc(10px + env(safe-area-inset-right, 0px)));
  top: max(18px, calc(8px + env(safe-area-inset-top, 0px)));
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  pointer-events: auto;
}
.talent-flip-top-left {
  display: flex;
  align-items: center;
}
.talent-brand {
  display: inline-flex !important;
  align-items: center !important;
  background: none !important;
  border: 0 !important;
  padding: 0 !important;
  color: #fff !important;
  cursor: pointer !important;
  text-decoration: none !important;
}
.talent-brand-wordmark {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  font-size: 30px !important;
  font-weight: 800 !important;
  letter-spacing: -1.8px !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: baseline !important;
  color: #ffffff !important;
}
.talent-brand-dot {
  color: #ed177b !important;
  font-weight: 800 !important;
  font-style: normal !important;
  margin-left: 0.5px !important;
}
.talent-brand-divider {
  width: 1px !important;
  height: 16px !important;
  background: rgba(255, 255, 255, 0.45) !important;
  margin: 0 12px !important;
  display: inline-block !important;
}
.talent-brand-label {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  font-size: 15px !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  letter-spacing: -0.2px !important;
  line-height: 1 !important;
}
.talent-brand i {
  font-style: normal !important;
  color: #ed177b !important;
  font-weight: 800 !important;
  margin-left: 0.5px !important;
}
.talent-brand small {
  font-size: 15px !important;
  font-weight: 400 !important;
  letter-spacing: -0.2px !important;
  border-left: 1px solid rgba(255, 255, 255, 0.45) !important;
  margin-left: 12px !important;
  padding-left: 12px !important;
  color: #ffffff !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  display: inline-flex !important;
  align-items: center !important;
  line-height: 1 !important;
}
.talent-flip-top-center {
  display: flex;
  align-items: center;
  gap: 8px;
}
.talent-flip-top-center .talent-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease, background 0.15s ease;
}
.talent-flip-top-center .talent-icon:active {
  transform: scale(0.92);
  background: rgba(255, 255, 255, 0.12);
}
.talent-flip-top-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.talent-flip-top-right .talent-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: transparent;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.talent-flip-top-right .talent-icon:active {
  transform: scale(0.92);
  opacity: 0.75;
}
.talent-media {
  position: absolute;
  inset: 0;
  background: #000;
  overflow: hidden;
}
.talent-video-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(28px);
  opacity: 0.38;
  pointer-events: none;
}
.talent-media video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}
.talent-shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, transparent 20%, transparent 60%, rgba(0, 0, 0, 0.88) 100%);
}
.talent-pause-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}
.talent-pause-bubble {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.talent-identity {
  position: absolute;
  left: max(16px, calc(10px + env(safe-area-inset-left, 0px)));
  right: max(16px, calc(10px + env(safe-area-inset-right, 0px)));
  bottom: calc(max(20px, calc(12px + env(safe-area-inset-bottom, 0px))) + 72px);
  z-index: 20;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  pointer-events: auto;
}
.talent-person {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.talent-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}
.talent-avatar-monogram {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ed177b, #8a0c44);
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.talent-person strong {
  font-size: 19px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.25;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
}
.talent-person small {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: #d1d5db;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.85);
}
.talent-portfolio {
  margin-top: 5px;
  font-size: 12px;
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
  transition: opacity 0.15s ease;
}
.talent-portfolio:hover {
  opacity: 0.85;
}
.talent-back {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  border-radius: 24px;
  min-height: 38px;
  padding: 0 15px !important;
  font-size: 12px !important;
  font-weight: 600;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  color: #fff;
  transition: all 0.15s ease;
}
.talent-back:hover {
  background: rgba(255, 255, 255, 0.15);
}
.talent-back[aria-pressed="true"] {
  border-color: #ed177b !important;
  color: #ed177b;
  background: rgba(237, 23, 123, 0.15);
}
.talent-actions {
  position: absolute;
  left: max(16px, calc(10px + env(safe-area-inset-left, 0px)));
  right: max(16px, calc(10px + env(safe-area-inset-right, 0px)));
  bottom: max(20px, calc(12px + env(safe-area-inset-bottom, 0px)));
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  color: #fff;
  pointer-events: auto;
}
.talent-action {
  min-width: 52px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  font-size: 11px !important;
  color: #e5e5e5;
  transition: transform 0.12s ease, color 0.15s ease;
}
.talent-action:hover {
  color: #fff;
  transform: translateY(-1px);
}
.talent-action[data-active="true"] {
  color: #ed177b;
}
.talent-applause {
  position: relative;
  flex: none;
}
.talent-applause-pulse {
  position: absolute;
  top: 0;
  left: 14px;
  width: 24px;
  height: 24px;
  border: 1.5px solid #ed177b;
  border-radius: 50%;
  pointer-events: none;
  animation: applause-ring 0.4s ease-out both;
}
@keyframes applause-ring {
  from {
    transform: scale(0.6);
    opacity: 0.9;
  }
  to {
    transform: scale(2.2);
    opacity: 0;
  }
}
.talent-playback {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  height: calc(18px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  pointer-events: auto;
}
.talent-progress {
  appearance: none;
  -webkit-appearance: none;
  flex: 1;
  width: 100%;
  height: 18px;
  margin: 0;
  background: transparent;
  cursor: pointer;
  accent-color: #ed177b;
  touch-action: pan-x;
}
.talent-progress::-webkit-slider-runnable-track {
  height: 4px;
  background: linear-gradient(to right, #ed177b 0%, #ed177b var(--played), rgba(255, 255, 255, 0.25) var(--played), rgba(255, 255, 255, 0.25) 100%);
  border-radius: 2px;
}
.talent-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 2px;
  height: 4px;
  background: #ed177b;
}
.talent-progress:hover::-webkit-slider-thumb,
.talent-progress:active::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: -4px;
  background: #ed177b;
  box-shadow: 0 0 8px #ed177b;
}
.talent-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.talent-sheet {
  font: 14px Arial, Helvetica, sans-serif;
  width: 100%;
  max-width: 480px;
  background: #18191d;
  color: #fff;
  border-radius: 22px 22px 0 0;
  padding: 12px 20px max(24px, calc(16px + env(safe-area-inset-bottom, 0px)));
  box-shadow: 0 -8px 36px rgba(0, 0, 0, 0.5);
  max-height: 82dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.talent-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.25);
  margin: 0 auto 12px;
}
.talent-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.talent-sheet h3 {
  font-size: 18px;
  margin: 0;
  font-weight: 700;
}
.talent-comments {
  overflow-y: auto;
  min-height: 120px;
  max-height: 40dvh;
  padding: 4px 0 14px;
}
.talent-comment {
  padding: 10px 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.talent-comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ed177b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.talent-comment strong {
  font-size: 13px;
  display: block;
}
.talent-comment p {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: #e0e0e0;
}
.talent-compose {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.talent-compose input {
  min-width: 0;
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 11px 14px;
  font: 13px Arial;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.talent-compose input:focus {
  outline: none;
  border-color: #ed177b;
}
.talent-primary {
  background: #ed177b !important;
  color: #fff !important;
  border-radius: 12px;
  min-height: 44px;
  padding: 10px 18px !important;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.talent-option {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  font-size: 14px;
  padding: 4px 0;
}
.talent-toast {
  position: absolute;
  top: 75px;
  left: 50%;
  transform: translateX(-50%);
  padding: 9px 18px;
  background: rgba(20, 21, 25, 0.95);
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.talent-loading {
  padding: 60px 20px;
  text-align: center;
  font-size: 14px;
  color: #a0a0a0;
}
`;

function FlipSlide({
  video,
  active,
  muted,
  setMuted,
  onVisible,
  onSkipNext,
}: {
  video: any;
  active: boolean;
  muted: boolean;
  setMuted: (val: boolean) => void;
  onVisible?: (id: string) => void;
  onSkipNext?: () => void;
}) {
  const router = useRouter();
  const elementRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(Number(video.durationSeconds) || 0);
  const [failed, setFailed] = useState(false);
  const [sheet, setSheet] = useState<'comments' | 'options' | 'back' | null>(null);
  const [toast, setToast] = useState('');
  const [applaudPulse, setApplaudPulse] = useState(0);
  const [comments, setComments] = useState<any[]>(video.comments || []);
  const [commentText, setCommentText] = useState('');

  const kept = useKeptStore((s) => Boolean(s.keptRecord[String(video.id)]));
  const toggleKeep = useKeptStore((s) => s.toggleKeep);
  const backed = useCommunityStore((s) => s.backed.includes(String(video.authorId || video.id)));
  const toggleBack = useCommunityStore((s) => s.toggleBack);
  const applauded = useCommunityStore((s) => (s.applauded || []).includes(String(video.id)));
  const toggleApplaud = useCommunityStore((s) => s.toggleApplaud);

  const name =
    typeof video.author === 'string'
      ? video.author
      : video.author?.name || video.author?.username || video.authorName || 'Performer';
  const category = video.category || 'Performance';
  const avatar = video.authorAvatar || video.avatar || (typeof video.author === 'object' ? video.author?.avatarUrl : '') || '';
  const resolvedVideoSrc = resolveMediaUrl(video.url || video.videoUrl || '');

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible?.(String(video.id));
        }
      },
      { threshold: 0.65 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [video.id, onVisible]);

  useEffect(() => {
    const media = videoRef.current;
    if (!media) return;
    if (active && !paused && !sheet) {
      media.muted = muted;
      media.play().catch(() => {});
    } else {
      media.pause();
    }
  }, [active, paused, sheet, muted, resolvedVideoSrc]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const seek = (seconds: number) => {
    const target = Math.max(0, Math.min(duration || 0, seconds));
    if (videoRef.current) videoRef.current.currentTime = target;
    setCurrent(target);
  };

  const handleTogglePlay = () => {
    setPaused((prev) => !prev);
  };

  const handleApplaud = async () => {
    toggleApplaud(String(video.id));
    if (!applauded) {
      setApplaudPulse((p) => p + 1);
    }
    try {
      await api.post(`/videos/${video.id}/applaud`);
    } catch {}
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/flips`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on Talent`, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setToast('Performance link copied');
      }
    } catch {
      setToast('Link copied');
    }
  };

  const handlePiP = async () => {
    const media = videoRef.current;
    if (!media) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (media.requestPictureInPicture) {
        await media.requestPictureInPicture();
      }
    } catch {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: String(Date.now()),
      author: 'You',
      text: commentText.trim(),
      moment: Math.floor(current),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    try {
      await api.post(`/videos/${video.id}/comment`, { text: newComment.text, moment: newComment.moment });
    } catch {}
  };

  const percentage = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <article
      ref={(node) => {
        elementRef.current = node;
      }}
      id={`flip-card-${video.id}`}
      className="talent-flip-slide"
    >
      {/* Background Video Media */}
      <div className="talent-media">
        {avatar ? (
          <img className="talent-video-backdrop" src={avatar} alt="" aria-hidden="true" loading="lazy" />
        ) : null}

        <video
          ref={videoRef}
          src={resolvedVideoSrc}
          poster={avatar || undefined}
          muted={muted}
          loop
          playsInline
          preload={active ? 'auto' : 'none'}
          tabIndex={0}
          role="button"
          aria-pressed={!paused}
          onClick={handleTogglePlay}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onError={() => setFailed(true)}
          aria-label={`${name} performance video`}
        />

        <div className="talent-shade" />

        {/* Center Pause Indicator */}
        {paused && !failed && (
          <div className="talent-pause-indicator">
            <div className="talent-pause-bubble">
              <Play size={32} color="#fff" fill="#fff" />
            </div>
          </div>
        )}
      </div>

      {/* Top Header */}
      <div className="talent-flip-top">
        <div className="talent-flip-top-left">
          <button onClick={() => router.replace('/' as any)} className="talent-brand" aria-label="Return to Home">
            <span className="talent-brand-wordmark">talent<span className="talent-brand-dot">.</span></span>
            <span className="talent-brand-divider" />
            <span className="talent-brand-label">Flips</span>
          </button>
        </div>

        <div className="talent-flip-top-center">
          <button className="talent-icon" aria-label="Picture in Picture" onClick={handlePiP}>
            <PiPMark />
          </button>
          <button className="talent-icon" aria-label="Next performance" onClick={onSkipNext}>
            <SkipMark />
          </button>
        </div>

        <div className="talent-flip-top-right">
          <button className="talent-icon" aria-label="Search" onClick={() => router.push('/search' as any)}>
            <Search size={21} />
          </button>
          <button
            className="talent-icon"
            aria-label={muted ? 'Unmute performance' : 'Mute performance'}
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
          </button>
          <button className="talent-icon" aria-label="Close Flips" onClick={() => router.replace('/' as any)}>
            <X size={21} />
          </button>
        </div>
      </div>

      {/* Performer Identity Overlaid On Video */}
      <div className="talent-identity">
        <div className="talent-person">
          {avatar ? (
            <img className="talent-avatar" src={avatar} alt={name} />
          ) : (
            <div className="talent-avatar-monogram">{getInitials(name)}</div>
          )}
          <div>
            <strong>
              {name}
              {video.isVerified !== false && <CheckCircle2 size={16} color="#34d399" fill="#059669" />}
            </strong>
            <small>{category} · Sample performance</small>
            <button
              className="talent-portfolio"
              onClick={() => router.push(`/profile/${video.authorId || video.id}` as any)}
            >
              View portfolio <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        <button
          className="talent-back"
          aria-pressed={backed}
          onClick={() => {
            toggleBack(String(video.authorId || video.id));
            setToast(backed ? `Stopped backing ${name}` : `Now backing ${name}`);
          }}
        >
          {backed ? <Check size={14} /> : <Plus size={14} />} {backed ? 'Backing' : 'Back talent'}
        </button>
      </div>

      {/* Bottom Actions Row */}
      <div className="talent-actions">
        <div className="talent-applause">
          <button
            className="talent-action"
            data-active={applauded}
            aria-label={`Applaud ${video.title || name}`}
            onClick={handleApplaud}
          >
            <ApplauseMark filled={applauded} />
            <span>{applauded ? 'Applauded' : 'Applaud'}</span>
            {applaudPulse > 0 && applauded && <i className="talent-applause-pulse" key={applaudPulse} />}
          </button>
        </div>

        <button
          className="talent-action"
          data-active={kept}
          aria-label={`Keep ${video.title || name}`}
          onClick={() => {
            toggleKeep({
              id: video.id,
              title: video.title || name,
              author: name,
              avatar: avatar,
              url: resolvedVideoSrc,
              category: category,
            });
            setToast(kept ? 'Removed from Kept' : 'Saved to Kept');
          }}
        >
          <Bookmark size={23} fill={kept ? '#ed177b' : 'transparent'} />
          <span>{kept ? 'Kept' : 'Keep'}</span>
        </button>

        <button
          className="talent-action"
          aria-label="Talk"
          onClick={() => setSheet('comments')}
        >
          <MessageCircle size={23} />
          <span>Talk</span>
        </button>

        <button
          className="talent-action"
          aria-label="Share"
          onClick={handleShare}
        >
          <Share2 size={23} />
          <span>Share</span>
        </button>

        <button
          className="talent-action"
          aria-label="More options"
          onClick={() => setSheet('options')}
        >
          <MoreHorizontal size={23} />
        </button>
      </div>

      {/* Bottom Playback Scrubber Line */}
      <div className="talent-playback">
        <input
          className="talent-progress"
          type="range"
          min="0"
          max={duration || 1}
          step="0.1"
          value={Math.min(current, duration || 1)}
          aria-label={`Seek ${video.title || name}`}
          style={{ '--played': `${percentage}%` } as React.CSSProperties}
          onChange={(e) => seek(Number(e.target.value))}
        />
      </div>

      {/* Toast Notification */}
      {!!toast && (
        <div className="talent-toast" role="status">
          {toast}
        </div>
      )}

      {/* Modals / Bottom Sheets */}
      {sheet && (
        <div className="talent-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSheet(null); }}>
          <section className="talent-sheet" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="talent-sheet-handle" />

            <div className="talent-sheet-head">
              <h3>{sheet === 'comments' ? 'Conversation' : sheet === 'back' ? 'Back Talent' : 'Performance Options'}</h3>
              <button className="talent-icon" aria-label="Close sheet" onClick={() => setSheet(null)}>
                <X size={20} />
              </button>
            </div>

            {sheet === 'comments' && (
              <>
                <div className="talent-comments">
                  {comments.length ? (
                    comments.map((c, idx) => (
                      <div className="talent-comment" key={c.id || idx}>
                        <div className="talent-comment-avatar">{String(c.author || 'Fan').slice(0, 1)}</div>
                        <div>
                          <strong>{c.author || 'Fan'}</strong>
                          <p>{c.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="talent-loading">No messages yet. Tell them what stood out.</div>
                  )}
                </div>

                <form className="talent-compose" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    placeholder="Add to the conversation..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button className="talent-primary" type="submit" disabled={!commentText.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}

            {sheet === 'options' && (
              <>
                <button
                  className="talent-option"
                  onClick={() => {
                    setSheet(null);
                    router.push(`/profile/${video.authorId || video.id}` as any);
                  }}
                >
                  <span>View Talent Passport</span>
                  <ArrowUpRight size={18} />
                </button>
                <button
                  className="talent-option"
                  onClick={() => {
                    setSheet(null);
                    handleShare();
                  }}
                >
                  <span>Share performance</span>
                  <Share2 size={18} />
                </button>
                <button
                  className="talent-option"
                  onClick={() => {
                    setSheet(null);
                    router.push('/shows?section=clubs' as any);
                  }}
                >
                  <span>Discover clubs</span>
                  <ArrowUpRight size={18} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </article>
  );
}

export function FlipsView() {
  const router = useRouter();
  const params = useLocalSearchParams<{ video?: string }>();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [videos, setVideos] = useState<any[]>([]);
  const [active, setActive] = useState(params.video || '18');
  const [muted, setMuted] = useState(true);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  useEffect(() => {
    let alive = true;
    api
      .get('/feed?limit=1000')
      .then((r) => {
        if (!alive) return;
        const list = r.data.videos || [];
        setVideos(list);
        if (list.length && !params.video) {
          setActive(String(list[0].id));
        }
      })
      .catch(() => {
        if (alive) setError('Performances couldn’t load.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [params.video]);

  useEffect(() => {
    if (!params.video || !videos.length) return;
    const card = scrollRef.current?.querySelector<HTMLElement>(`#flip-card-${params.video}`);
    card?.scrollIntoView({ block: 'start' });
  }, [params.video, videos]);

  const visible = useCallback((id: string) => setActive(id), []);

  const skipNext = useCallback(() => {
    const index = videos.findIndex((v) => String(v.id) === active);
    const next = Math.min(videos.length - 1, index + 1);
    if (next !== index) {
      scrollRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(String(videos[next].id));
    }
  }, [videos, active]);

  return (
    <main className="talent-flips">
      <style>{flipsStyles}</style>

      <div
        ref={scrollRef}
        className="talent-flip-scroll"
        tabIndex={0}
        aria-label="Flips performances; swipe up for the next video"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Escape') {
            router.replace('/' as any);
            return;
          }
          if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) return;
          event.preventDefault();
          const index = videos.findIndex((v) => String(v.id) === active);
          const next = Math.max(
            0,
            Math.min(videos.length - 1, index + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1))
          );
          scrollRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActive(String(videos[next].id));
        }}
      >
        {videos.map((video) => (
          <FlipSlide
            key={video.id}
            video={video}
            active={focused && String(video.id) === active}
            muted={muted}
            setMuted={setMuted}
            onVisible={visible}
            onSkipNext={skipNext}
          />
        ))}

        {loading && <div className="talent-loading">Loading performances...</div>}

        {!loading && !videos.length && (
          <div className="talent-loading">
            {error || 'No performances available.'}
            <br />
            <button className="talent-primary" style={{ marginTop: 14 }} onClick={() => router.replace('/' as any)}>
              Return Home
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
