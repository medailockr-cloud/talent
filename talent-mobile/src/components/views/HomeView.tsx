import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, Platform, ScrollView, Modal, Dimensions, PanResponder, KeyboardAvoidingView, ActivityIndicator, Share as RNShare, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Search, EyeOff, Play, Pause, Maximize2, MoreHorizontal, X, Bookmark, MessageCircle, MessageCircleOff, Send, ChevronDown, ChevronRight, Gauge, MapPin, Flag, UserX, User, Bell, Volume2, VolumeX, Trophy, Eye, Mic, Sparkles, Share2, Sliders, ToggleLeft, ToggleRight, CheckCircle2, PictureInPicture2, SkipForward, ArrowUpRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFeed } from '../../hooks/useFeed';
import { api, resolveMediaUrl } from '../../utils/api';
import { useThemeStore } from '../../store/themeStore';
import { useKeptStore } from '../../store/keptStore';
import { AppVideoPlayer } from '../ui/AppVideoPlayer';
import { LeaderboardModal } from '../ui/LeaderboardModal';

const HEADER_HEIGHT = 130;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const isMediaImage = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp|heic)(\?.*)?$/i.test(url);
};

const isCommentsAllowed = (val: any): boolean => {
  if (val === false || val === 'false' || val === 0 || val === '0' || val === 'off' || val === 'disabled') {
    return false;
  }
  return true;
};

const isJudgingAllowed = (val: any): boolean => {
  if (val === false || val === 'false' || val === 0 || val === '0' || val === 'off' || val === 'disabled') {
    return false;
  }
  return true;
};

function FeedVideoCard({ 
  video, 
  playingVideoId, 
  setPlayingVideoId, 
  onPass,
  isMuted,
  setIsMuted,
  onVisible,
  onManualToggle,
  isBlindMode,
  onToggleKeep
}: { 
  video: any; 
  playingVideoId: string | null; 
  setPlayingVideoId: (id: string | null) => void; 
  onPass: () => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  onVisible?: (id: string) => void;
  onManualToggle?: (id: string, willPlay: boolean) => void;
  isBlindMode?: boolean;
  onToggleKeep?: (id: string, isSaved: boolean) => void;
}) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isPlaying = String(playingVideoId) === String(video.id);
  const containerRef = useRef<any>(null);
  
  // Interactive States
  const [isRevealed, setIsRevealed] = useState(false);
  const isKept = useKeptStore(state => Boolean(state.keptRecord[String(video.id)]));
  const [justKeptToast, setJustKeptToast] = useState(false);
  const [isCopiedToast, setIsCopiedToast] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const keptText = justKeptToast ? 'KEPT ✓' : isKept ? 'KEPT' : 'KEEP';

  const authorName = typeof video.author === 'object' && video.author !== null
    ? (video.author.name || video.author.username || 'Artist')
    : (typeof video.author === 'string' && video.author ? video.author : 'Artist');
  const authorAvatar = video.avatar || video.authorAvatar || (typeof video.author === 'object' ? video.author?.avatarUrl : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=E91E76&color=fff`;
  
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(video.comments || []);
  const [attachMoment, setAttachMoment] = useState(false);
  
  const [showOptions, setShowOptions] = useState(false);
  const [currentAllowJudging, setCurrentAllowJudging] = useState(isJudgingAllowed(video.allowJudging));
  const [currentAllowComments, setCurrentAllowComments] = useState(isCommentsAllowed(video.allowComments));
  const [isEditSettingsOpen, setIsEditSettingsOpen] = useState(false);
  const [draftJudging, setDraftJudging] = useState(isJudgingAllowed(video.allowJudging));
  const [draftComments, setDraftComments] = useState(isCommentsAllowed(video.allowComments));
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const allowed = isJudgingAllowed(video.allowJudging);
    setCurrentAllowJudging(allowed);
    setDraftJudging(allowed);
  }, [video.allowJudging]);

  useEffect(() => {
    const allowed = isCommentsAllowed(video.allowComments);
    setCurrentAllowComments(allowed);
    setDraftComments(allowed);
    if (!allowed) {
      setIsCommenting(false);
    }
  }, [video.allowComments]);

  const [videoError, setVideoError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<any>(null);

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const mainSrc = resolveMediaUrl(video.url || video.videoUrl || '');
  const fallbackSrc = resolveMediaUrl(video.url || video.videoUrl || '');
  const srcToUse = mainSrc;

  // Autoplay IntersectionObserver for web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') return;

    let observer: IntersectionObserver | null = null;
    let timer: any = null;

    const setupObserver = () => {
      const node = containerRef.current;
      const element = (node instanceof HTMLElement ? node : (node as any)?._node || (node as any)?.base)
        || (typeof document !== 'undefined' ? document.getElementById(`feed-card-${video.id}`) : null);

      if (!element || !(element instanceof HTMLElement)) {
        timer = setTimeout(setupObserver, 100);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              onVisible?.(video.id);
            }
          });
        },
        {
          rootMargin: '-25% 0px -25% 0px',
          threshold: 0.15,
        }
      );

      observer.observe(element);
    };

    setupObserver();

    return () => {
      if (timer) clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [video.id, onVisible]);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPlaying) {
      setPlayingVideoId(null);
      onManualToggle?.(video.id, false);
      if (Platform.OS === 'web' && videoRef.current) {
        videoRef.current.pause();
      }
    } else {
      setPlayingVideoId(video.id);
      onManualToggle?.(video.id, true);
      if (Platform.OS === 'web' && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Sync muted state without resetting video time
  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle active video transitions: resume from paused time when playing, pause when stopped
  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
        }
      } else {
        try {
          videoRef.current.pause();
        } catch (e) {}
      }
    }
  }, [isPlaying, srcToUse]);
  
  // Judging States (Press + Slide Up/Down Gesture)
  const [judgeScore, setJudgeScore] = useState<number | null>(video.userRating || null);
  const [isJudgingActive, setIsJudgingActive] = useState(false);
  const [tempScore, setTempScore] = useState<number>(video.userRating || 5.0);

  const judgeScoreRef = useRef<number | null>(video.userRating || null);
  const tempScoreRef = useRef<number>(video.userRating || 5.0);
  const startScoreRef = useRef<number>(video.userRating || 5.0);
  const startClientYRef = useRef<number>(0);

  useEffect(() => {
    judgeScoreRef.current = judgeScore;
    if (judgeScore !== null) {
      tempScoreRef.current = judgeScore;
      setTempScore(judgeScore);
    }
  }, [judgeScore]);

  const isBlind = Boolean(isBlindMode && !isRevealed && judgeScore === null);

  const saveScore = (score: number) => {
    if (currentAllowJudging === false) return;
    setIsRevealed(true);
    const finalScore = parseFloat(Math.max(1.0, Math.min(10.0, score)).toFixed(1));
    setJudgeScore(finalScore);
    judgeScoreRef.current = finalScore;
    tempScoreRef.current = finalScore;
    setTempScore(finalScore);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    api.post(`/videos/${video.id}/rate`, { score: finalScore }).catch(err => console.error("Rate err:", err));
  };

  const handleGestureStart = (clientY?: number) => {
    if (currentAllowJudging === false) return;
    const initial = judgeScoreRef.current ?? 5.0;
    startScoreRef.current = initial;
    tempScoreRef.current = initial;
    setTempScore(initial);
    setIsJudgingActive(true);
    if (clientY !== undefined) {
      startClientYRef.current = clientY;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleGestureMoveDelta = (deltaY: number) => {
    // Negative deltaY (dragging UP) increases score, positive deltaY (dragging DOWN) decreases.
    // Sensitivity: 15 pixels = 0.1 score change
    const deltaScore = -deltaY / 15;
    let newScore = startScoreRef.current + deltaScore;
    newScore = Math.max(1.0, Math.min(10.0, newScore));
    const rounded = parseFloat(newScore.toFixed(1));

    if (Math.floor(rounded) !== Math.floor(tempScoreRef.current)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }

    tempScoreRef.current = rounded;
    setTempScore(rounded);
  };

  const handleGestureEnd = () => {
    setIsJudgingActive(false);
    saveScore(tempScoreRef.current);
  };

  // Judging PanResponder for Touch on Native
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        handleGestureStart();
      },
      onPanResponderMove: (_, gestureState) => {
        handleGestureMoveDelta(gestureState.dy);
      },
      onPanResponderRelease: () => {
        handleGestureEnd();
      },
      onPanResponderTerminate: () => {
        setIsJudgingActive(false);
      }
    })
  ).current;

  // Web Pointer Drag Handlers (ultra smooth on desktop mouse & trackpad)
  const webPointerHandlers = Platform.OS === 'web' ? {
    onPointerDown: (e: any) => {
      e.preventDefault();
      try {
        e.currentTarget?.setPointerCapture?.(e.pointerId);
      } catch (err) {}
      handleGestureStart(e.clientY);
    },
    onPointerMove: (e: any) => {
      if (isJudgingActive) {
        e.preventDefault();
        const deltaY = e.clientY - startClientYRef.current;
        handleGestureMoveDelta(deltaY);
      }
    },
    onPointerUp: (e: any) => {
      if (isJudgingActive) {
        try {
          e.currentTarget?.releasePointerCapture?.(e.pointerId);
        } catch (err) {}
        handleGestureEnd();
      }
    },
    onPointerCancel: () => {
      if (isJudgingActive) {
        setIsJudgingActive(false);
      }
    }
  } : {};

  const handleKeepToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const willKeep = await useKeptStore.getState().toggleKeep(video);
    if (willKeep) {
      setJustKeptToast(true);
      setTimeout(() => setJustKeptToast(false), 1500);
    }
    onToggleKeep?.(String(video.id), willKeep);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Track share count in backend
    api.post(`/videos/${video.id}/share`).catch(() => {});

    const videoTitle = video.title || 'Performance';
    const artistName = authorName;
    const shareUrl = typeof window !== 'undefined' && window.location 
      ? `${window.location.origin}/video/${video.id}`
      : `https://talent.app/video/${video.id}`;
    const shareMessage = `Watch "${videoTitle}" by ${artistName} on Talent!\n${shareUrl}`;

    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: videoTitle,
            text: `Watch "${videoTitle}" by ${artistName} on Talent!`,
            url: shareUrl,
          });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          setIsCopiedToast(true);
          setTimeout(() => setIsCopiedToast(false), 2000);
        } else {
          Alert.alert("Share Performance", shareUrl);
        }
      } else {
        await RNShare.share({
          message: shareMessage,
          title: videoTitle,
          url: shareUrl,
        });
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error("Share error:", e);
      }
    }
  };

  const handlePostComment = () => {
    if (!currentAllowComments) {
      Alert.alert('Comments Disabled', 'Comments are disabled for this performance by the artist.');
      setIsCommenting(false);
      return;
    }
    if (!commentText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const postText = commentText.trim();
    setCommentText('');
    setAttachMoment(false);
    
    api.post(`/videos/${video.id}/comment`, { text: postText })
      .then(res => {
        const added = {
          id: res.data?.id || Math.random().toString(),
          author: res.data?.user?.name || res.data?.author || 'You',
          text: postText,
          time: 'Just now',
          isUseful: false,
          timestamp: attachMoment ? '00:38' : null
        };
        setComments((prev: any[]) => [...prev, added]);
      })
      .catch(err => {
        console.error("Comment err:", err);
        const errMsg = err?.response?.data?.error || 'Comments are disabled for this performance';
        Alert.alert('Cannot Comment', errMsg);
      });
  };

  const toggleUseful = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setComments(comments.map((c: any) => c.id === id ? { ...c, isUseful: !c.isUseful } : c));
  };

  return (
    <View 
      ref={containerRef} 
      nativeID={`feed-card-${video.id}`}
      style={{ borderBottomColor: theme.border }}
      className="w-full border-b pb-4 mb-3"
    >
      {/* Video Playback Area - Edge to Edge */}
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={togglePlay}
        className="relative w-full aspect-[16/10] bg-black overflow-hidden"
      >
        <AppVideoPlayer
          src={srcToUse}
          poster={video.videoThumb || video.thumbnailUrl || ''}
          isPlaying={isPlaying}
          isMuted={!isPlaying || isMuted}
          videoRef={videoRef}
          onTimeUpdate={(t) => setCurrentTime(t)}
          onLoadedMetadata={(d) => setDuration(d)}
          onError={() => {
            if (!videoError) setVideoError(true);
          }}
        />
        
        {/* Smooth Cinematic Vignette Gradient Overlay */}
        <View 
          pointerEvents="none" 
          className="absolute inset-0 z-[1]"
          style={Platform.OS === 'web' ? ({
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 24%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.85) 100%)'
          } as any) : undefined}
        />

        {/* Top Header Row: Category Badge & Utility Controls */}
        <View className="absolute top-3 inset-x-3.5 flex-row items-center justify-between z-10">
          {/* Left: Category Badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
            <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76]" />
            <Text className="text-[10px] font-bold tracking-wider text-white uppercase">
              {isBlind ? "BLIND AUDITION" : `${video.category ? video.category.toUpperCase() : 'TALENT'} · PERFORMANCE`}
            </Text>
          </View>

          {/* Center: PiP & Pass Utility Buttons */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={(e: any) => {
                if (e?.stopPropagation) e.stopPropagation();
                if (Platform.OS === 'web' && videoRef.current) {
                  if (document.pictureInPictureElement) {
                    document.exitPictureInPicture?.().catch(() => {});
                  } else if (videoRef.current.requestPictureInPicture) {
                    videoRef.current.requestPictureInPicture().catch(() => {
                      if (document.fullscreenElement) {
                        document.exitFullscreen?.().catch(() => {});
                      } else {
                        videoRef.current?.requestFullscreen?.().catch(() => {});
                      }
                    });
                  } else if (videoRef.current.requestFullscreen) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen?.().catch(() => {});
                    } else {
                      videoRef.current.requestFullscreen().catch(() => {});
                    }
                  }
                }
              }}
              className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 items-center justify-center"
            >
              <PictureInPicture2 color="#fff" size={14} />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={(e: any) => {
                if (e?.stopPropagation) e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPass();
              }}
              className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 items-center justify-center"
            >
              <SkipForward color="#fff" size={14} />
            </TouchableOpacity>
          </View>

          {/* Right: Audio Mute Toggle Button */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={(e: any) => {
              if (e?.stopPropagation) e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (!isPlaying) {
                setPlayingVideoId(video.id);
                onManualToggle?.(video.id, true);
              }
            }}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 items-center justify-center"
          >
            {isMuted ? (
              <VolumeX color="#fff" size={15} />
            ) : (
              <Volume2 color={theme.primary} size={15} />
            )}
          </TouchableOpacity>
        </View>

        {/* Center Play Button Overlay (Visible ONLY when paused) */}
        {!isPlaying && (
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center z-10">
            <View className="w-16 h-16 rounded-full bg-black/65 backdrop-blur-md border border-white/30 items-center justify-center shadow-2xl">
              <Play color="#fff" fill="#fff" size={26} className="ml-1" />
            </View>
          </View>
        )}

        {/* Bottom Playback Scrubber Line */}
        <View pointerEvents="none" className="absolute bottom-0 inset-x-0 h-[2.5px] bg-white/20 z-20 overflow-hidden">
          <View 
            className="h-full bg-[#E91E76]" 
            style={{ width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` }} 
          />
        </View>

        {/* Bottom Right: Time Duration Badge */}
        <View pointerEvents="none" className="absolute bottom-2 right-3 z-10 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10">
          <Text className="text-[10px] font-medium text-white tracking-wider">
            {formatTime(duration) || video.duration || '0:28'}
          </Text>
        </View>

        {/* Judging Floating Overlay */}
        {isJudgingActive && (
          <View pointerEvents="none" className="absolute inset-0 bg-black/75 backdrop-blur-sm items-center justify-center z-30">
            <Text 
              className="text-white text-[82px] font-black tracking-tighter"
              style={{ textShadowColor: 'rgba(229,9,20,0.6)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 20 }}
            >
              {tempScore.toFixed(1)}
            </Text>
            <View 
              style={{ backgroundColor: theme.primary + '25', borderColor: theme.primary }}
              className="flex-row items-center gap-2 border px-4 py-1.5 rounded-full mt-3"
            >
              <Gauge color={theme.primary} size={14} />
              <Text style={{ color: theme.primary }} className="text-[11px] font-bold tracking-widest uppercase">Slide ↕ to Score • Release to Set</Text>
            </View>
          </View>
        )}
        {/* Blind Audition Curtain Overlay */}
        {isBlind && (
          <View className="absolute inset-0 z-20 bg-black/85 backdrop-blur-md items-center justify-center p-6">
            <View 
              style={{ backgroundColor: theme.primary + '25', borderColor: theme.primary }}
              className="w-16 h-16 rounded-full items-center justify-center border-2 mb-3 shadow-lg"
            >
              <EyeOff color={theme.primary} size={30} />
            </View>
            <Text className="text-white text-[17px] font-black tracking-wider uppercase text-center mb-1">
              BLIND AUDITION
            </Text>
            <Text className="text-white/70 text-[11px] text-center max-w-[240px] mb-4 leading-4">
              Evaluate purely by audio resonance. Slide to judge (1.0-10.0) or tap reveal.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e: any) => {
                if (e?.stopPropagation) e.stopPropagation();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsRevealed(true);
              }}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }}
              className="px-4 py-2 rounded-full border flex-row items-center gap-2"
            >
              <Eye color="#fff" size={14} />
              <Text className="text-white text-[11px] font-bold tracking-wide">Reveal Performer</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Information & Actions Area */}
      <View className="px-4 pt-3.5 pb-1">
        {/* Author Profile Row */}
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity 
            activeOpacity={0.8}
            className="flex-row items-center gap-3 flex-1 mr-3"
            onPress={() => {
              if (isBlind) {
                setIsRevealed(true);
                return;
              }
              const userId = video.authorId || video.author?.id || video.id;
              router.push(`/profile/${userId}` as any);
            }}
          >
            <View 
              style={{ backgroundColor: theme.surfaceBg }}
              className="w-11 h-11 rounded-xl overflow-hidden border border-white/10 items-center justify-center"
            >
              {isBlind ? (
                <EyeOff color={theme.primary} size={20} />
              ) : (
                <Image source={{ uri: authorAvatar }} className="w-full h-full" resizeMode="cover" />
              )}
            </View>
            <View className="flex-1">
              <Text style={{ color: theme.text }} className="text-[16px] font-bold" numberOfLines={1}>
                {isBlind ? "Blind Audition Contestant" : authorName}
              </Text>
              <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5" numberOfLines={1}>
                {isBlind 
                  ? "Unbiased Talent Pool" 
                  : `${(video.category || 'Artist').charAt(0).toUpperCase() + (video.category || 'Artist').slice(1)} · ${(video.role || 'Sample portfolio').split('•')[0].trim()}`}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => {
              if (isBlind) {
                setIsRevealed(true);
                return;
              }
              const userId = video.authorId || video.author?.id || video.id;
              router.push(`/profile/${userId}` as any);
            }}
            className="flex-row items-center gap-1 py-1"
          >
            <Text style={{ color: theme.textSecondary }} className="text-[13px] font-medium">
              Portfolio
            </Text>
            <ArrowUpRight color={theme.textSecondary} size={15} />
          </TouchableOpacity>
        </View>

        {/* Performance Title & Details */}
        <View className="mb-3">
          <View className="flex-row items-start justify-between gap-3">
            <Text 
              style={{ color: theme.text }} 
              className="text-[16px] font-bold tracking-tight leading-snug flex-1" 
              numberOfLines={2}
            >
              {isBlind ? "Blind Audition Take" : (video.title || "Be Somebody · beatbox performance · passage 1")}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowOptions(true)} 
              activeOpacity={0.7}
              className="w-8 h-8 items-center justify-center -mr-1"
            >
              <MoreHorizontal color={theme.text} size={20} />
            </TouchableOpacity>
          </View>

          <Text 
            style={{ color: theme.textSecondary }} 
            className="text-[12px] leading-relaxed mt-1" 
            numberOfLines={isDescriptionExpanded ? undefined : 2}
          >
            {video.description || "Licensed performance excerpt"}
          </Text>

          {Boolean(video.description && video.description.length > 85) && (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-0.5 self-start"
            >
              <Text style={{ color: theme.primary }} className="text-[11px] font-semibold">
                {isDescriptionExpanded ? "Show less" : "More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Actions Row */}
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-row items-center gap-6">
            <TouchableOpacity onPress={handleKeepToggle} activeOpacity={0.7} className="items-center gap-1 min-w-[42px]">
              <Bookmark color={isKept ? theme.primary : theme.text} fill={isKept ? theme.primary : "transparent"} size={23} strokeWidth={1.8} />
              <Text style={{ color: isKept ? theme.primary : theme.text }} className="text-[11px] font-medium">{isKept ? 'Kept' : 'Keep'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { 
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                setIsCommenting(true); 
              }} 
              activeOpacity={0.7} 
              className="items-center gap-1 min-w-[42px]"
              style={{ opacity: currentAllowComments ? 1 : 0.5 }}
            >
              {currentAllowComments ? (
                <MessageCircle color={theme.text} size={23} strokeWidth={1.8} />
              ) : (
                <MessageCircleOff color={theme.textSecondary} size={23} strokeWidth={1.8} />
              )}
              <Text style={{ color: currentAllowComments ? theme.text : theme.textSecondary }} className="text-[11px] font-medium">
                {currentAllowComments ? 'Comment' : 'Disabled'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.7} className="items-center gap-1 min-w-[42px]">
              <Share2 color={isCopiedToast ? theme.primary : theme.text} size={23} strokeWidth={1.8} />
              <Text style={{ color: isCopiedToast ? theme.primary : theme.text }} className="text-[11px] font-medium">
                {isCopiedToast ? 'Copied' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* SCROLLING JUDGE BUTTON with Direct Drag Gesture */}
          {currentAllowJudging && (
            <View 
              {...panResponder.panHandlers}
              {...webPointerHandlers}
              style={{
                touchAction: 'none',
                userSelect: 'none',
                cursor: 'ns-resize',
                backgroundColor: isJudgingActive 
                  ? theme.primary 
                  : judgeScore !== null 
                    ? theme.primary + '25' 
                    : theme.primary,
                borderColor: judgeScore !== null && !isJudgingActive ? theme.primary : undefined,
                borderWidth: judgeScore !== null && !isJudgingActive ? 1 : 0,
              } as any}
              className={`rounded-full h-[40px] px-5 flex-row items-center gap-2 shadow-lg select-none ${
                isJudgingActive ? 'scale-105' : ''
              }`}
            >
              <Gauge color={judgeScore !== null && !isJudgingActive ? theme.primary : "#fff"} size={16} />
              <Text 
                style={{ color: judgeScore !== null && !isJudgingActive ? theme.primary : '#ffffff' }}
                className="text-[12px] font-extrabold tracking-wider uppercase select-none"
              >
                {isJudgingActive 
                  ? `${tempScore.toFixed(1)} ★` 
                  : judgeScore !== null 
                    ? `${judgeScore.toFixed(1)} ★` 
                    : 'JUDGE ↕'}
              </Text>
            </View>
          )}
        </View>

        {/* Judging Criteria / Helper Sub-caption */}
        {currentAllowJudging && (
          <Text style={{ color: theme.textSecondary }} className="text-[11px] text-right mt-1 font-normal opacity-70">
            Slide Judge to score · Presence, originality & craft
          </Text>
        )}
      </View>

      {/* Options Menu Sheet */}
      {showOptions && (
        <Modal visible={true} transparent={true} animationType="fade">
          <TouchableOpacity activeOpacity={1} onPress={() => setShowOptions(false)} className="flex-1 bg-black/60 justify-end">
            <View 
              style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
              className="w-full rounded-t-2xl pb-8 pt-4 px-4 border-t"
            >
              <View 
                style={{ backgroundColor: theme.textSecondary + '40' }}
                className="w-10 h-1 rounded-full self-center mb-6" 
              />
              <TouchableOpacity onPress={() => { 
                setShowOptions(false); 
                const userId = video.authorId || video.author?.id || video.id;
                router.push(`/profile/${userId}` as any);
              }} 
                style={{ borderBottomColor: theme.border }}
                className="flex-row items-center gap-4 py-4 border-b"
              >
                <User color={theme.text} size={20} />
                <Text style={{ color: theme.text }} className="text-[15px] font-medium">View profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { 
                setShowOptions(false); 
                setDraftJudging(currentAllowJudging);
                setDraftComments(currentAllowComments);
                setIsEditSettingsOpen(true);
              }} 
                style={{ borderBottomColor: theme.border }}
                className="flex-row items-center gap-4 py-4 border-b"
              >
                <Sliders color={theme.primary} size={20} />
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-[15px] font-medium">Performance Settings</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-[11px]">Toggle judging and talk/comments</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowOptions(false); Alert.alert('Hidden', 'Performance hidden.'); }} 
                style={{ borderBottomColor: theme.border }}
                className="flex-row items-center gap-4 py-4 border-b"
              >
                <UserX color={theme.text} size={20} />
                <Text style={{ color: theme.text }} className="text-[15px] font-medium">Not interested</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowOptions(false); Alert.alert('Reported', 'Performance reported for review.'); }} className="flex-row items-center gap-4 py-4">
                <Flag color="#EF4444" size={20} />
                <Text className="text-[#EF4444] text-[15px] font-medium">Report</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Edit Performance Settings Modal */}
      {isEditSettingsOpen && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => !isSavingSettings && setIsEditSettingsOpen(false)}>
          <View className="flex-1 bg-black/80 items-center justify-center p-6">
            <View 
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              className="w-full max-w-sm rounded-[24px] p-6 border shadow-2xl"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-[18px] font-bold" style={{ color: theme.text }}>Performance Settings</Text>
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }} numberOfLines={1}>
                    "{video.title || 'Untitled Performance'}"
                  </Text>
                </View>
                <TouchableOpacity
                  disabled={isSavingSettings}
                  onPress={() => setIsEditSettingsOpen(false)}
                  style={{ backgroundColor: theme.surfaceBg }}
                  className="w-8 h-8 rounded-full items-center justify-center"
                >
                  <X color={theme.textSecondary} size={18} />
                </TouchableOpacity>
              </View>

              {/* Allow Judging Setting */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDraftJudging(!draftJudging);
                }}
                className="flex-row items-center justify-between py-3.5 border-t border-b mb-3"
                style={{ borderColor: theme.border }}
              >
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-[14px]" style={{ color: theme.text }}>
                    Allow Judging
                  </Text>
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Show Talent Score judge slider
                  </Text>
                </View>
                <View pointerEvents="none">
                  {draftJudging ? (
                    <ToggleRight color={theme.primary} size={36} />
                  ) : (
                    <ToggleLeft color={theme.textSecondary} size={36} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Allow Comments Setting */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDraftComments(!draftComments);
                }}
                className="flex-row items-center justify-between py-3.5 border-b mb-6"
                style={{ borderColor: theme.border }}
              >
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-[14px]" style={{ color: theme.text }}>
                    Allow Comments (Talk)
                  </Text>
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                    Let viewers discuss and give feedback
                  </Text>
                </View>
                <View pointerEvents="none">
                  {draftComments ? (
                    <ToggleRight color={theme.primary} size={36} />
                  ) : (
                    <ToggleLeft color={theme.textSecondary} size={36} />
                  )}
                </View>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  disabled={isSavingSettings}
                  onPress={() => setIsEditSettingsOpen(false)}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  className="flex-1 h-11 rounded-xl items-center justify-center border"
                >
                  <Text className="font-semibold text-[13px]" style={{ color: theme.text }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isSavingSettings}
                  onPress={async () => {
                    setIsSavingSettings(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    try {
                      await api.put(`/videos/${video.id}`, {
                        allowJudging: draftJudging,
                        allowComments: draftComments,
                      });
                      setCurrentAllowJudging(draftJudging);
                      setCurrentAllowComments(draftComments);
                      video.allowJudging = draftJudging;
                      video.allowComments = draftComments;
                      if (!draftComments) {
                        setIsCommenting(false);
                      }
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Alert.alert("Updated", "Performance settings updated successfully.");
                      setIsEditSettingsOpen(false);
                    } catch (err: any) {
                      console.error("Save settings err:", err);
                      setCurrentAllowJudging(draftJudging);
                      setCurrentAllowComments(draftComments);
                      video.allowJudging = draftJudging;
                      video.allowComments = draftComments;
                      if (!draftComments) {
                        setIsCommenting(false);
                      }
                      Alert.alert("Updated", "Performance settings updated.");
                      setIsEditSettingsOpen(false);
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }}
                  style={{ backgroundColor: theme.primary }}
                  className="flex-1 h-11 rounded-xl items-center justify-center flex-row gap-1.5 shadow-md"
                >
                  {isSavingSettings ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-[13px]">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Talk / Comments Bottom Sheet */}
      {isCommenting && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View 
              style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
              className="w-full h-[75%] rounded-t-3xl border-t flex-col pb-6 shadow-2xl"
            >
              <View 
                style={{ borderBottomColor: theme.border }}
                className="flex-row justify-between items-center p-5 border-b"
              >
                <View className="flex-1 mr-3">
                  <Text style={{ color: theme.text }} className="text-[16px] font-bold tracking-wider">TALK</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5" numberOfLines={1}>
                    {video.title ? `"${video.title}" • ${authorName}` : authorName}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsCommenting(false)} 
                  style={{ backgroundColor: theme.surfaceBg }}
                  className="w-8 h-8 rounded-full items-center justify-center"
                >
                  <X color={theme.textSecondary} size={18} />
                </TouchableOpacity>
              </View>
              
              <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {comments.length === 0 ? (
                  <Text style={{ color: theme.textSecondary }} className="text-[13px] text-center mt-10">No comments yet. Start the conversation!</Text>
                ) : (
                  comments.map((c: any) => (
                    <View key={c.id} className="mb-6">
                      <View className="flex-row items-start gap-3">
                        <View 
                          style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                          className="w-8 h-8 rounded-full items-center justify-center border overflow-hidden"
                        >
                          <User color={theme.textSecondary} size={16} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text style={{ color: theme.text }} className="text-[12px] font-medium">{c.user}</Text>
                            <Text style={{ color: theme.textSecondary }} className="text-[10px]">{c.time}</Text>
                            {c.isArtist && <Text style={{ backgroundColor: theme.primary + '20', color: theme.primary }} className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Artist</Text>}
                            {c.isFeedback && <Text className="bg-blue-500/20 text-blue-500 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Feedback</Text>}
                            {c.isOpportunity && <Text className="bg-emerald-500/20 text-emerald-500 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Opportunity</Text>}
                            {c.isQuestion && <Text className="bg-amber-500/20 text-amber-500 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Question</Text>}
                            {c.timestamp && (
                              <TouchableOpacity 
                                style={{ backgroundColor: theme.surfaceBg }}
                                className="rounded-full px-2 py-0.5 ml-1"
                              >
                                <Text style={{ color: theme.text }} className="text-[9px] font-medium">○ {c.timestamp}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <Text style={{ color: theme.text }} className="text-[13px] leading-5">{c.text}</Text>
                          
                          <View className="flex-row items-center gap-4 mt-2">
                            <TouchableOpacity>
                              <Text style={{ color: theme.textSecondary }} className="text-[11px] font-medium">Reply</Text>
                            </TouchableOpacity>
                            {c.isOpportunity ? (
                              <TouchableOpacity>
                                <Text className="text-emerald-500 text-[11px] font-bold">Connect</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity onPress={() => toggleUseful(c.id)}>
                                <Text style={{ color: c.isUseful ? theme.primary : theme.textSecondary }} className="text-[11px] font-medium">
                                  {c.isUseful ? 'Useful ✓' : 'Useful'}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
                <View className="h-10" />
              </ScrollView>
              
              {currentAllowComments === false ? (
                <View 
                  style={{ borderTopColor: theme.border, backgroundColor: theme.surfaceBg }}
                  className="p-5 border-t items-center justify-center flex-row gap-2.5"
                >
                  <EyeOff color={theme.textSecondary} size={16} />
                  <Text style={{ color: theme.textSecondary }} className="text-[12px] font-medium">
                    Comments are turned off for this performance by the artist.
                  </Text>
                </View>
              ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                  <View 
                    style={{ borderTopColor: theme.border, backgroundColor: theme.cardBg }}
                    className="p-4 border-t"
                  >
                    <View className="flex-row items-center gap-3">
                      <View 
                        style={{ borderColor: theme.border, backgroundColor: theme.surfaceBg }}
                        className="w-8 h-8 rounded-full items-center justify-center border"
                      >
                        <User color={theme.textSecondary} size={15} />
                      </View>
                      <TextInput
                        value={commentText}
                        onChangeText={setCommentText}
                        placeholder="Talk about this performance..."
                        placeholderTextColor={theme.textSecondary}
                        style={{ 
                          backgroundColor: theme.surfaceBg, 
                          borderColor: theme.border,
                          color: theme.text 
                        }}
                        className="flex-1 text-[13px] px-4 py-2.5 rounded-full border"
                        onSubmitEditing={handlePostComment}
                        returnKeyType="send"
                      />
                      <TouchableOpacity 
                        onPress={handlePostComment} 
                        disabled={!commentText.trim()} 
                        style={{ backgroundColor: commentText.trim() ? theme.primary : theme.surfaceBg }}
                        className="w-8 h-8 rounded-full items-center justify-center"
                      >
                        <Send color={commentText.trim() ? "#fff" : theme.textSecondary} size={14} style={{ transform: [{ rotate: '45deg' }], marginLeft: -2 }} />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center gap-4 mt-3 ml-11">
                      <TouchableOpacity 
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAttachMoment(!attachMoment); }} 
                        style={attachMoment ? { backgroundColor: theme.primary + '25', borderColor: theme.primary } : { backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                        className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
                      >
                        <Text style={{ color: attachMoment ? theme.primary : theme.textSecondary }} className="text-[10px] font-medium">○ Attach moment</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                        className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
                      >
                        <Text style={{ color: theme.textSecondary }} className="text-[10px] font-medium">🎤 Voice</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

export function HomeView({ user }: { user?: any }) {
  const { theme } = useThemeStore();
  const [activeFeedTab, setActiveFeedTab] = useState('For you');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  
  // Search & Filters state removed for dedicated screens
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { videos: feedData, isLoading, isRefreshing, isLoadingMore, hasMore, refetch, loadMore } = useFeed();
  const effectiveFeed = feedData || [];
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const manuallyPausedIdRef = useRef<string | null>(null);
  const autoPlayDebounceRef = useRef<any>(null);
  const sentinelRef = useRef<any>(null);

  // Homepage feed is strictly for videos only. Images are excluded from the homepage and only shown on user profiles.
  const allFeedItems = effectiveFeed.filter(v => !isMediaImage(v.url || v.videoUrl));

  const hasInitializedPlayingRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedPlayingRef.current && allFeedItems && allFeedItems.length > 0) {
      hasInitializedPlayingRef.current = true;
      setPlayingVideoId(allFeedItems[0].id);
    }
  }, [allFeedItems]);

  const handleCardVisible = useCallback((id: string) => {
    if (manuallyPausedIdRef.current === id) return;
    if (autoPlayDebounceRef.current) {
      clearTimeout(autoPlayDebounceRef.current);
    }
    autoPlayDebounceRef.current = setTimeout(() => {
      manuallyPausedIdRef.current = null;
      setPlayingVideoId(id);
    }, 120);
  }, []);

  const handleManualToggle = useCallback((id: string, willPlay: boolean) => {
    manuallyPausedIdRef.current = willPlay ? null : id;
  }, []);

  const triggerAutoLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  // IntersectionObserver for automatic infinite loading on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0] && entries[0].isIntersecting) {
            triggerAutoLoadMore();
          }
        },
        { rootMargin: '500px' }
      );

      const target = sentinelRef.current;
      if (target) {
        const element = target instanceof HTMLElement ? target : (target as any)?._node || (target as any)?.base;
        if (element && element instanceof HTMLElement) {
          observer.observe(element);
        } else if (target && typeof (target as any).querySelector === 'function') {
          observer.observe(target);
        }
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [allFeedItems.length, hasMore, isLoadingMore]);
  
  const keptVideos = useKeptStore(state => state.keptVideos);
  const isLoadingSaved = useKeptStore(state => state.isLoading);

  // Sync kept store with feed items whenever feed loads
  useEffect(() => {
    if (allFeedItems && allFeedItems.length > 0) {
      useKeptStore.getState().initializeFromFeed(allFeedItems);
    }
  }, [allFeedItems]);

  // Fetch saved/kept videos whenever 'Kept' tab is selected
  useEffect(() => {
    if (activeFeedTab.toLowerCase() === 'kept') {
      useKeptStore.getState().fetchKept();
    }
  }, [activeFeedTab]);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeFeedTab.toLowerCase() === 'kept') {
      await useKeptStore.getState().fetchKept();
    } else {
      await refetch();
    }
  }, [activeFeedTab, refetch]);

  const handleToggleKeep = useCallback((id: string, isSaved: boolean) => {
    if (feedData && Array.isArray(feedData)) {
      feedData.forEach((v) => {
        if (String(v.id) === id) {
          v.isSaved = isSaved;
          v.isKept = isSaved;
        }
      });
    }
  }, [feedData]);

  // Filter Logic based on Tabs and Search (strictly exclude images)
  const filteredData = activeFeedTab.toLowerCase() === 'kept'
    ? keptVideos.filter(v => !isMediaImage(v.url || v.videoUrl))
    : allFeedItems.filter(v => {
        if (isMediaImage(v.url || v.videoUrl)) return false;
        let matchesTab = true;
        const tabLower = activeFeedTab.toLowerCase();
        if (tabLower === 'rising') matchesTab = v.isRising;
        if (tabLower === 'clubs') matchesTab = v.category?.toLowerCase() === 'club' || v.isClub;
        if (tabLower === 'blind audition') matchesTab = true;
        
        return matchesTab;
      });

  // Switch tabs auto-play first card of new tab
  useEffect(() => {
    manuallyPausedIdRef.current = null;
    if (filteredData.length > 0) {
      setPlayingVideoId(filteredData[0].id);
    } else {
      setPlayingVideoId(null);
    }
  }, [activeFeedTab]);

  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      if (currentY < 0) return;
      const diff = currentY - lastScrollY.value;
      
      let newTranslateY = headerTranslateY.value - diff;
      if (newTranslateY < -HEADER_HEIGHT) newTranslateY = -HEADER_HEIGHT;
      if (newTranslateY > 0) newTranslateY = 0;
      
      if (currentY <= HEADER_HEIGHT) {
        newTranslateY = -currentY; 
        if (newTranslateY > 0) newTranslateY = 0;
      }
      
      headerTranslateY.value = newTranslateY;
      lastScrollY.value = currentY;

      // Automatically trigger load more when within 600px of bottom
      const { layoutMeasurement, contentOffset, contentSize } = event;
      if (layoutMeasurement && contentOffset && contentSize) {
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 600) {
          runOnJS(triggerAutoLoadMore)();
        }
      }
    },
  });

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement && contentOffset && contentSize) {
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 600;
      if (isCloseToBottom) {
        triggerAutoLoadMore();
      }

      // Fallback autoplay calculation for Native platforms
      if (Platform.OS !== 'web' && filteredData.length > 0) {
        const approximateCardHeight = Dimensions.get('window').width * (5/4) + 160;
        const index = Math.round(contentOffset.y / approximateCardHeight);
        const target = filteredData[Math.min(Math.max(0, index), filteredData.length - 1)];
        if (target && target.id !== playingVideoId && manuallyPausedIdRef.current !== target.id) {
          manuallyPausedIdRef.current = null;
          setPlayingVideoId(target.id);
        }
      }
    }
  };

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: theme.headerBg,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    };
  });

  const handlePass = (currentIndex: number) => {
    if (scrollRef.current && filteredData.length > currentIndex + 1) {
      // Calculate approximate offset: Header + (Card height + Margin) * nextIndex
      const approximateCardHeight = Dimensions.get('window').width * (5/4) + 160;
      scrollRef.current.scrollTo({ y: (currentIndex + 1) * approximateCardHeight, animated: true });
      manuallyPausedIdRef.current = null;
      setPlayingVideoId(filteredData[currentIndex + 1].id);
    }
  };
  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      <Animated.View style={headerStyle}>
        <View className="px-5 pt-12 pb-2 flex-row items-center justify-between">
          <View>
            <View className="flex-row items-baseline">
              <Text className="font-extrabold text-[32px] tracking-tight leading-none font-serif" style={{ color: theme.text }}>talent</Text>
              <Text className="font-extrabold text-[32px] leading-none ml-[1px] font-serif" style={{ color: theme.primary }}>.</Text>
            </View>
            <Text className="text-[10px] tracking-[0.18em] uppercase font-bold text-white/50 mt-1">
              ABILITY TAKES THE STAGE
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/search' as any); }}>
              <Search color={theme.text} size={23} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/messages' as any); }}>
              <MessageCircle color={theme.text} size={23} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/notifications' as any); }}>
              <Bell color={theme.text} size={23} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tab Bar with Underline Indicator */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-0">
          {['For you', 'Rising', 'Clubs', 'Kept'].map((tab) => {
            const isActive = activeFeedTab.toLowerCase() === tab.toLowerCase();
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFeedTab(tab);
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
                className="pb-2 relative items-center"
              >
                <Text 
                  style={{ color: isActive ? theme.text : theme.textSecondary }}
                  className={`text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}
                >
                  {tab}
                </Text>
                {isActive && (
                  <View 
                    style={{ backgroundColor: theme.primary }} 
                    className="h-[2.5px] w-full absolute bottom-0 inset-x-0 rounded-full" 
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef as any}
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 6, paddingHorizontal: 0, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.cardBg}
            progressViewOffset={Platform.OS === 'android' ? HEADER_HEIGHT + 10 : 0}
          />
        }
      >
        {activeFeedTab === 'Kept' && isLoadingSaved && filteredData.length === 0 ? (
          <View className="items-center justify-center py-24 px-6">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.textSecondary }} className="font-medium text-[13px] mt-4">
              Loading your kept performances...
            </Text>
          </View>
        ) : filteredData.length === 0 ? (
          <View className="items-center justify-center py-20 px-6">
            <View 
              style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}30` }}
              className="w-16 h-16 rounded-full border items-center justify-center mb-4"
            >
              {activeFeedTab === 'Kept' ? (
                <Bookmark color={theme.primary} size={28} />
              ) : (
                <Mic color={theme.primary} size={28} />
              )}
            </View>
            <Text style={{ color: theme.text }} className="text-[17px] font-bold mb-1 text-center">
              {activeFeedTab === 'Kept' ? "No Kept Performances Yet" : "No Video Performances Yet"}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-[13px] text-center max-w-[280px] leading-5 mb-5">
              {activeFeedTab === 'Kept' 
                ? "Performances you bookmark with KEEP will appear here for fast replay, scoring, and sharing."
                : "The homepage is dedicated strictly to video performances. Upload a video take to be featured!"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (activeFeedTab === 'Kept') {
                  setActiveFeedTab('For You');
                } else {
                  router.push('/create');
                }
              }}
              style={{ backgroundColor: theme.primary }}
              className="px-6 py-2.5 rounded-full flex-row items-center gap-2 shadow-lg"
            >
              <Play color="#fff" size={14} fill="#fff" />
              <Text className="text-white font-bold text-xs uppercase tracking-wider">
                {activeFeedTab === 'Kept' ? "Explore Performances" : "Upload Video Take"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredData.map((video, index) => (
              <FeedVideoCard 
                key={video.id} 
                video={video} 
                playingVideoId={playingVideoId} 
                setPlayingVideoId={setPlayingVideoId}
                onPass={() => handlePass(index)}
                isMuted={isGlobalMuted}
                setIsMuted={setIsGlobalMuted}
                onVisible={handleCardVisible}
                onManualToggle={handleManualToggle}
                isBlindMode={activeFeedTab === 'Blind Audition'}
                onToggleKeep={handleToggleKeep}
              />
            ))}

            {/* Seamless Automated Infinite Scroll Loading Indicator */}
            {hasMore ? (
              <View ref={sentinelRef} className="py-10 items-center justify-center">
                <View 
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                  className="border px-5 py-2.5 rounded-full flex-row items-center gap-3"
                >
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={{ color: theme.textSecondary }} className="font-medium text-[13px] tracking-wide">
                    {isLoadingMore ? "Fetching fresh performances..." : "Loading more fresh performances..."}
                  </Text>
                </View>
              </View>
            ) : filteredData.length > 0 ? (
              <View className="py-10 items-center justify-center">
                <View 
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                  className="border px-5 py-2.5 rounded-full flex-row items-center gap-2"
                >
                  <Sparkles color={theme.primary} size={15} />
                  <Text style={{ color: theme.textSecondary }} className="font-medium text-[13px] tracking-wide">
                    You're all caught up on performances ✨
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        )}
      </Animated.ScrollView>

      {/* Weekly Leaderboard Modal */}
      <LeaderboardModal 
        visible={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />
    </View>
  );
}
