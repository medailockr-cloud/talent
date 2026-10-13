import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, Platform, ScrollView, Modal, Dimensions, PanResponder, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Search, EyeOff, Play, Pause, Maximize2, MoreHorizontal, X, Bookmark, MessageCircle, Send, ChevronDown, ChevronRight, Gauge, MapPin, Flag, UserX, User, Bell, Volume2, VolumeX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFeed } from '../../hooks/useFeed';
import { api } from '../../utils/api';

const HEADER_HEIGHT = 130;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 6 Dummy videos with guaranteed streaming backend video files
const initialFeedData = [
  {
    id: '1',
    author: 'Kiara Nair',
    role: 'Contemporary Dancer • Kochi, India',
    tags: ['#dance', '#contemporary', '#kerala'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    videoThumb: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80',
    duration: '0:58',
    videoUrl: 'http://localhost:3000/uploads/performer_1.mp4',
    isRising: true,
    isNearby: false,
    isLive: false,
    comments: [
      { id: 'c1', user: 'Arjun Mehta', text: 'Your expression during the final section was powerful.', time: '12m', isUseful: false },
      { id: 'c2', user: 'Riya Sharma', text: 'The ending felt slightly rushed. A longer hold on the final pose could make it stronger.', time: '20m', isFeedback: true, isUseful: false },
      { id: 'c3', user: 'Neha Kapoor', text: 'I’m working on a dance film in Bengaluru. Would love to discuss a collaboration.', time: '1h', isOpportunity: true, isUseful: false },
      { id: 'c4', user: 'Dev Patel', text: 'How did you train that transition?', time: '2h', isQuestion: true, isUseful: false },
      { id: 'c5', user: 'Kiara Nair', text: 'Thank you! That section was mostly improvised.', time: '3h', isArtist: true, isUseful: false }
    ]
  },
  {
    id: '2',
    author: 'Arjun Menon',
    role: 'Singer-Songwriter • Bengaluru, India',
    tags: ['#music', '#singer', '#original'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    videoThumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    duration: '1:00',
    videoUrl: 'http://localhost:3000/uploads/performer_2.mp4',
    isRising: false,
    isNearby: true,
    isLive: true,
    comments: []
  },
  {
    id: '3',
    author: 'Meera Rao',
    role: 'Classical Violinist • Chennai, India',
    tags: ['#classical', '#violin', '#carnatic'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    videoThumb: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&q=80',
    duration: '1:45',
    videoUrl: 'http://localhost:3000/uploads/performer_3.mp4',
    isRising: true,
    isNearby: false,
    isLive: false,
    comments: []
  },
  {
    id: '4',
    author: 'Kabir Shah',
    role: 'Studio Vocals & Beatbox • Mumbai, India',
    tags: ['#beatbox', '#hiphop', '#vocalpercussion'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    videoThumb: 'https://images.unsplash.com/photo-1516280440502-a2fc9977823b?w=800&q=80',
    duration: '0:30',
    videoUrl: 'http://localhost:3000/uploads/performer_4.mp4',
    isRising: false,
    isNearby: false,
    isLive: true,
    comments: []
  },
  {
    id: '5',
    author: 'Ananya Iyer',
    role: 'Street Dancer • Hyderabad, India',
    tags: ['#dance', '#breakdance', '#hiphop'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    videoThumb: 'https://images.unsplash.com/photo-1527224857830-43a7ace8526d?w=800&q=80',
    duration: '2:15',
    videoUrl: 'http://localhost:3000/uploads/performer_5.mp4',
    isRising: true,
    isNearby: true,
    isLive: false,
    comments: []
  },
  {
    id: '6',
    author: 'Rohan Das',
    role: 'Guitarist • Pune, India',
    tags: ['#guitar', '#acoustic', '#fingerstyle'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
    videoThumb: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
    duration: '1:10',
    videoUrl: 'http://localhost:3000/uploads/performer_1.mp4',
    isRising: false,
    isNearby: true,
    isLive: false,
    comments: []
  }
];

function FeedVideoCard({ 
  video, 
  playingVideoId, 
  setPlayingVideoId, 
  onPass,
  isMuted,
  setIsMuted,
  onVisible,
  onManualToggle
}: { 
  video: any; 
  playingVideoId: string | null; 
  setPlayingVideoId: (id: string | null) => void; 
  onPass: () => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  onVisible?: (id: string) => void;
  onManualToggle?: (id: string, willPlay: boolean) => void;
}) {
  const router = useRouter();
  const isPlaying = String(playingVideoId) === String(video.id);
  const containerRef = useRef<any>(null);
  
  // Interactive States
  const [isKept, setIsKept] = useState(video.isLiked || false);
  const [keptText, setKeptText] = useState(video.isLiked ? 'KEPT ✓' : 'KEEP');
  
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(video.comments || []);
  const [attachMoment, setAttachMoment] = useState(false);
  
  const [showOptions, setShowOptions] = useState(false);
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

  const mainSrc = video.url || video.videoUrl || 'http://localhost:3000/uploads/performer_1.mp4';
  const fallbackSrc = 'http://localhost:3000/uploads/performer_1.mp4';
  const srcToUse = videoError ? fallbackSrc : mainSrc;

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

  // Handle active video transitions: start over when becoming playing, pause when stopped
  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        try {
          videoRef.current.currentTime = 0;
        } catch (e) {}

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
          videoRef.current.currentTime = 0;
        } catch (e) {}
      }
    }
  }, [isPlaying, srcToUse]);
  
  // Judging States (Press + Move + Release + Tap Modal)
  const [judgeScore, setJudgeScore] = useState<number | null>(video.userRating || null);
  const [isJudgingActive, setIsJudgingActive] = useState(false);
  const [tempScore, setTempScore] = useState<number>(video.userRating || 5.0);
  const [showJudgeModal, setShowJudgeModal] = useState(false);

  const judgeScoreRef = useRef<number | null>(video.userRating || null);
  const tempScoreRef = useRef<number>(video.userRating || 5.0);
  const isDraggingRef = useRef(false);
  const startScoreRef = useRef<number>(video.userRating || 5.0);

  useEffect(() => {
    judgeScoreRef.current = judgeScore;
  }, [judgeScore]);

  const saveScore = (score: number) => {
    const finalScore = parseFloat(Math.max(1.0, Math.min(10.0, score)).toFixed(1));
    setJudgeScore(finalScore);
    judgeScoreRef.current = finalScore;
    tempScoreRef.current = finalScore;
    setTempScore(finalScore);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    api.post(`/videos/${video.id}/rate`, { score: finalScore }).catch(err => console.error("Rate err:", err));
  };

  // Judging PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderGrant: () => {
        isDraggingRef.current = false;
        const initial = judgeScoreRef.current ?? 5.0;
        startScoreRef.current = initial;
        tempScoreRef.current = initial;
        setTempScore(initial);
        setIsJudgingActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > 6) {
          isDraggingRef.current = true;
        }
        // Move UP (negative dy) increases score, DOWN (positive dy) decreases.
        // Sensitivity: 15 pixels = 0.1 score change
        const delta = -gestureState.dy / 15;
        let newScore = startScoreRef.current + delta;
        newScore = Math.max(1.0, Math.min(10.0, newScore));
        const rounded = parseFloat(newScore.toFixed(1));
        
        if (Math.floor(rounded) !== Math.floor(tempScoreRef.current)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        
        tempScoreRef.current = rounded;
        setTempScore(rounded);
      },
      onPanResponderRelease: () => {
        setIsJudgingActive(false);
        if (isDraggingRef.current) {
          saveScore(tempScoreRef.current);
        } else {
          // Tap without drag: open interactive judge sheet
          setShowJudgeModal(true);
        }
      },
      onPanResponderTerminate: () => {
        setIsJudgingActive(false);
      }
    })
  ).current;

  const handleKeepToggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const willKeep = !isKept;
        setIsKept(willKeep);
        if (willKeep) {
          setKeptText('KEPT ✓');
          setTimeout(() => setKeptText('KEPT'), 1500);
        } else {
          setKeptText('KEEP');
        }
        
        api.post(`/videos/${video.id}/like`).catch(err => {
          console.error("Like err:", err);
          setIsKept(!willKeep); // revert on error
        });
      };

  const handlePostComment = () => {
        if (!commentText.trim()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newComment = {
          id: Math.random().toString(),
          author: 'You',
          text: commentText,
          time: 'Just now',
          isUseful: false,
          timestamp: attachMoment ? '00:38' : null
        };
        setComments([...comments, newComment]);
        
        api.post(`/videos/${video.id}/comment`, { text: commentText }).catch(err => console.error("Comment err:", err));
        
        setCommentText('');
        setAttachMoment(false);
      };

  const toggleUseful = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setComments(comments.map((c: any) => c.id === id ? { ...c, isUseful: !c.isUseful } : c));
  };

  return (
    <View 
      ref={containerRef} 
      nativeID={`feed-card-${video.id}`}
      className="bg-[#0B0D13] rounded-[24px] p-3 border border-white/10 mb-6 shadow-2xl overflow-hidden"
    >
      {/* Video Playback Area */}
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={togglePlay}
        className="relative w-full aspect-[4/5] rounded-[18px] overflow-hidden border border-white/10 bg-[#000] mb-3.5"
      >
        {Platform.OS === 'web' ? (
          <video 
            ref={videoRef}
            key={`${video.id}-${srcToUse}`}
            src={srcToUse} 
            autoPlay={isPlaying}
            loop
            muted={!isPlaying || isMuted}
            playsInline
            poster={video.videoThumb || video.thumbnailUrl || 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80'}
            onTimeUpdate={(e: any) => {
              if (e?.target) setCurrentTime(e.target.currentTime);
            }}
            onLoadedMetadata={(e: any) => {
              if (e?.target) setDuration(e.target.duration);
            }}
            onError={() => {
              if (!videoError) setVideoError(true);
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-black">
            <Image 
              source={{ uri: video.videoThumb || video.thumbnailUrl || 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80' }} 
              className="w-full h-full opacity-90 absolute" 
              resizeMode="cover"
            />
          </View>
        )}
        
        {/* Smooth Cinematic Vignette Gradient Overlay (No harsh center band) */}
        <View 
          pointerEvents="none" 
          className="absolute inset-0 z-[1]"
          style={Platform.OS === 'web' ? ({
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 24%, rgba(0,0,0,0.05) 65%, rgba(0,0,0,0.85) 100%)'
          } as any) : undefined}
        />

        {/* Top Header Row: Category Badge & Hidden Metrics (Guaranteed Non-Colliding) */}
        <View pointerEvents="none" className="absolute top-3.5 inset-x-3.5 flex-row items-center justify-between z-10">
          <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
            <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76]" />
            <Text className="text-[10px] font-bold tracking-wider text-white uppercase">PERFORMANCE</Text>
            <View className="w-1 h-1 rounded-full bg-white/40" />
            <Text className="text-white/80 text-[10px] font-semibold">{formatTime(duration) || video.duration || '0:58'}</Text>
          </View>

          <View className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex-row items-center gap-1.5">
            <EyeOff color="#E91E76" size={11} strokeWidth={2.2} />
            <Text className="text-[9px] font-bold tracking-wider text-white uppercase">METRICS HIDDEN</Text>
          </View>
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
        <View pointerEvents="none" className="absolute bottom-0 inset-x-0 h-[3px] bg-white/20 z-20 overflow-hidden">
          <View 
            className="h-full bg-[#E91E76]" 
            style={{ width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` }} 
          />
        </View>

        {/* Bottom Controls Bar */}
        <View className="absolute bottom-3 inset-x-3.5 flex-row items-center justify-between z-10">
          {/* Left: Time Badge */}
          <View className="h-8 px-3 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex-row items-center">
            <Text className="text-[11px] font-medium text-white tracking-wider">
              {formatTime(currentTime)} / {formatTime(duration) || video.duration || '0:58'}
            </Text>
          </View>

          {/* Right: Audio & Fullscreen Buttons */}
          <View className="flex-row items-center gap-2">
            {Platform.OS === 'web' && (
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
                  <VolumeX color="#9CA3AF" size={14} />
                ) : (
                  <Volume2 color="#E91E76" size={14} />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={(e: any) => {
                if (e?.stopPropagation) e.stopPropagation();
                if (Platform.OS === 'web' && videoRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen?.().catch(() => {});
                  } else {
                    videoRef.current.requestFullscreen?.().catch(() => {});
                  }
                }
              }}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 items-center justify-center"
            >
              <Maximize2 color="#fff" size={13} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Judging Floating Overlay */}
        {isJudgingActive && (
          <View pointerEvents="none" className="absolute inset-0 bg-black/70 backdrop-blur-sm items-center justify-center z-30">
            <Text 
              className="text-white text-[76px] font-black tracking-tighter"
              style={{ textShadowColor: 'rgba(233,30,118,0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 16 }}
            >
              {tempScore.toFixed(1)}
            </Text>
            <Text className="text-[#E91E76] text-[12px] font-bold tracking-widest uppercase mt-3">★ Slide Up / Down to Score ★</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Author Profile Row */}
      <View className="flex-row items-center justify-between px-1 mb-3">
        <TouchableOpacity 
          activeOpacity={0.8}
          className="flex-row items-center gap-3 flex-1 mr-2"
          onPress={() => {
            const userId = video.authorId || video.author?.id || video.id;
            router.push(`/profile/${userId}` as any);
          }}
        >
          <View className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/15 shadow-md">
            <Image source={{ uri: video.avatar || video.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }} className="w-full h-full" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-[15px] font-bold mb-0.5" numberOfLines={1}>{video.author}</Text>
            <View className="flex-row items-center gap-1.5 mb-1">
              <Text className="text-[#9CA3AF] text-[11px]">{(video.role || 'Artist').split('•')[0].trim()}</Text>
              <Text className="text-[#9CA3AF] text-[11px]">•</Text>
              <MapPin color="#9CA3AF" size={10} />
              <Text className="text-[#9CA3AF] text-[11px]">{(video.role || 'World').split('•')[1]?.trim() || 'World'}</Text>
            </View>
            <View className="flex-row items-center gap-1.5 flex-wrap">
              {(video.tags || video.hashtags || ['#performance', '#talent']).slice(0, 3).map((tag: any, idx: number) => {
                const tagText = typeof tag === 'string' ? tag : tag?.name ? `#${tag.name}` : '#performance';
                return (
                  <Text key={idx} className="text-[#E91E76]/80 text-[10px] font-medium">{tagText}</Text>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowOptions(true)} className="w-9 h-9 rounded-full bg-white/5 items-center justify-center">
          <MoreHorizontal color="#9CA3AF" size={16} />
        </TouchableOpacity>
      </View>

      {/* Main Actions Row */}
      <View className="flex-row items-center justify-between px-2 pt-2.5 border-t border-white/5">
        <View className="flex-row items-center gap-6">
          <TouchableOpacity onPress={handleKeepToggle} activeOpacity={0.7} className="items-center gap-1 min-w-[38px]">
            <Bookmark color={isKept ? "#E91E76" : "#fff"} fill={isKept ? "#E91E76" : "transparent"} size={22} strokeWidth={1.7} />
            <Text className={`text-[9px] font-bold tracking-widest uppercase ${isKept ? 'text-[#E91E76]' : 'text-[#9CA3AF]'}`}>{keptText}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsCommenting(true); }} activeOpacity={0.7} className="items-center gap-1 min-w-[38px]">
            <MessageCircle color="#fff" size={22} strokeWidth={1.7} />
            <Text className="text-[#9CA3AF] text-[9px] font-bold tracking-widest uppercase">TALK</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPass(); }} activeOpacity={0.7} className="items-center gap-1 min-w-[38px]">
            <Send color="#fff" size={21} strokeWidth={1.7} style={{ transform: [{ rotate: '45deg' }], marginLeft: -3, marginBottom: 1 }} />
            <Text className="text-[#9CA3AF] text-[9px] font-bold tracking-widest uppercase">PASS</Text>
          </TouchableOpacity>
        </View>

        {/* JUDGE Button */}
        <View {...panResponder.panHandlers}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowJudgeModal(true)}
            className={`rounded-full h-[36px] px-4 flex-row items-center gap-2 shadow-lg ${
              judgeScore !== null 
                ? 'bg-[#E91E76]/20 border border-[#E91E76]' 
                : 'bg-[#E91E76]'
            }`}
          >
            <Gauge color={judgeScore !== null ? "#E91E76" : "#fff"} size={14} />
            <Text className={`text-[11px] font-bold tracking-wider uppercase ${
              judgeScore !== null ? 'text-[#E91E76]' : 'text-white'
            }`}>
              {judgeScore !== null ? `${judgeScore.toFixed(1)} ★` : 'JUDGE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Judging Criteria Footer Row - Completely Separated to Prevent Cramping */}
      <View className="flex-row items-center justify-between pt-2.5 mt-2 border-t border-white/5 px-2">
        <Text className="text-[#6B7280] text-[10px] font-medium tracking-wide">Judging criteria</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-[#9CA3AF] text-[9px] font-semibold uppercase tracking-wider">Presence</Text>
          <View className="w-1 h-1 rounded-full bg-[#E91E76]/70" />
          <Text className="text-[#9CA3AF] text-[9px] font-semibold uppercase tracking-wider">Originality</Text>
          <View className="w-1 h-1 rounded-full bg-[#E91E76]/70" />
          <Text className="text-[#9CA3AF] text-[9px] font-semibold uppercase tracking-wider">Craft</Text>
        </View>
      </View>

      {/* Options Menu Sheet */}
      {showOptions && (
        <Modal visible={true} transparent={true} animationType="fade">
          <TouchableOpacity activeOpacity={1} onPress={() => setShowOptions(false)} className="flex-1 bg-black/60 justify-end">
            <View className="bg-[#171922] w-full rounded-t-2xl pb-8 pt-4 px-4 border-t border-white/10">
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-6" />
              <TouchableOpacity onPress={() => { 
                setShowOptions(false); 
                const userId = video.authorId || video.author?.id || video.id;
                router.push(`/profile/${userId}` as any);
              }} className="flex-row items-center gap-4 py-4 border-b border-white/5">
                <User color="#fff" size={20} />
                <Text className="text-white text-[15px] font-medium">View profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowOptions(false); Alert.alert('Hidden', 'Performance hidden.'); }} className="flex-row items-center gap-4 py-4 border-b border-white/5">
                <UserX color="#fff" size={20} />
                <Text className="text-white text-[15px] font-medium">Not interested</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowOptions(false); Alert.alert('Reported', 'Performance reported for review.'); }} className="flex-row items-center gap-4 py-4">
                <Flag color="#EF4444" size={20} />
                <Text className="text-[#EF4444] text-[15px] font-medium">Report</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Talk / Comments Bottom Sheet */}
      {isCommenting && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-[#101217] w-full h-[75%] rounded-t-3xl border-t border-white/10 flex-col pb-6 shadow-2xl">
              <View className="flex-row justify-between items-center p-5 border-b border-white/5">
                <View>
                  <Text className="text-white text-[16px] font-bold tracking-wider">TALK</Text>
                  <Text className="text-[#9CA3AF] text-[12px] mt-0.5">{video.author}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsCommenting(false)} className="w-8 h-8 bg-white/5 rounded-full items-center justify-center">
                  <X color="#9CA3AF" size={18} />
                </TouchableOpacity>
              </View>
              
              <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {comments.length === 0 ? (
                  <Text className="text-[#6B7280] text-[13px] text-center mt-10">No comments yet. Start the conversation!</Text>
                ) : (
                  comments.map((c: any) => (
                    <View key={c.id} className="mb-6">
                      <View className="flex-row items-start gap-3">
                        <View className="w-8 h-8 rounded-full bg-[#1A1D24] items-center justify-center border border-white/5 overflow-hidden">
                          {c.user === 'You' ? (
                             <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }} className="w-full h-full" />
                          ) : (
                             <Text className="text-[#9CA3AF] text-xs font-bold">{c.user.charAt(0)}</Text>
                          )}
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-[#9CA3AF] text-[12px] font-medium">{c.user}</Text>
                            <Text className="text-[#4B5563] text-[10px]">{c.time}</Text>
                            {c.isArtist && <Text className="bg-[#E91E76]/20 text-[#E91E76] text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Artist</Text>}
                            {c.isFeedback && <Text className="bg-blue-500/20 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Feedback</Text>}
                            {c.isOpportunity && <Text className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Opportunity</Text>}
                            {c.isQuestion && <Text className="bg-amber-500/20 text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Question</Text>}
                            {c.timestamp && (
                              <TouchableOpacity className="bg-white/10 rounded-full px-2 py-0.5 ml-1">
                                <Text className="text-white text-[9px] font-medium">○ {c.timestamp}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <Text className="text-white/90 text-[13px] leading-5">{c.text}</Text>
                          
                          <View className="flex-row items-center gap-4 mt-2">
                            <TouchableOpacity>
                              <Text className="text-[#6B7280] text-[11px] font-medium">Reply</Text>
                            </TouchableOpacity>
                            {c.isOpportunity ? (
                              <TouchableOpacity>
                                <Text className="text-emerald-400 text-[11px] font-bold">Connect</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity onPress={() => toggleUseful(c.id)}>
                                <Text className={`text-[11px] font-medium ${c.isUseful ? 'text-[#E91E76]' : 'text-[#6B7280]'}`}>
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
              
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View className="p-4 border-t border-white/5 bg-[#101217]">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                      <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }} className="w-full h-full" />
                    </View>
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Talk about this performance..."
                      placeholderTextColor="#6B7280"
                      className="flex-1 bg-[#1A1D24] text-white text-[13px] px-4 py-2.5 rounded-full border border-white/5"
                      onSubmitEditing={handlePostComment}
                      returnKeyType="send"
                    />
                    <TouchableOpacity onPress={handlePostComment} disabled={!commentText.trim()} className={`w-8 h-8 rounded-full items-center justify-center ${commentText.trim() ? 'bg-[#E91E76]' : 'bg-white/10'}`}>
                      <Send color={commentText.trim() ? "#fff" : "#6B7280"} size={14} style={{ transform: [{ rotate: '45deg' }], marginLeft: -2 }} />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center gap-4 mt-3 ml-11">
                    <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAttachMoment(!attachMoment); }} className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${attachMoment ? 'bg-[#E91E76]/20' : 'bg-white/5'}`}>
                      <Text className={`text-[10px] font-medium ${attachMoment ? 'text-[#E91E76]' : 'text-[#9CA3AF]'}`}>○ Attach moment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
                      <Text className="text-[#9CA3AF] text-[10px] font-medium">🎤 Voice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
      )}
      {/* Interactive Judging Sheet / Modal */}
      {showJudgeModal && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowJudgeModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowJudgeModal(false)} className="flex-1 bg-black/75 justify-end items-center">
            <TouchableOpacity activeOpacity={1} onPress={(e: any) => e.stopPropagation?.()} className="bg-[#171922] w-full max-w-md rounded-t-3xl pb-10 pt-5 px-6 border-t border-white/10">
              <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-5" />
              
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Gauge color="#E91E76" size={20} />
                  <Text className="text-white text-lg font-bold">Judge Performance</Text>
                </View>
                <TouchableOpacity onPress={() => setShowJudgeModal(false)} className="p-1">
                  <X color="#9CA3AF" size={20} />
                </TouchableOpacity>
              </View>

              <Text className="text-[#9CA3AF] text-xs mb-5">Rate this performance on a scale of 1.0 to 10.0</Text>

              {/* Big Score Display */}
              <View className="items-center justify-center my-2">
                <View className="w-28 h-28 rounded-full bg-[#E91E76]/10 border-2 border-[#E91E76] items-center justify-center shadow-lg shadow-[#E91E76]/30">
                  <Text className="text-white text-4xl font-extrabold tracking-tight">
                    {tempScore.toFixed(1)}
                  </Text>
                  <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mt-0.5">SCORE</Text>
                </View>
              </View>

              {/* Score Stepper Controls (- / +) */}
              <View className="flex-row items-center justify-center gap-4 my-4">
                <TouchableOpacity 
                  onPress={() => {
                    const next = Math.max(1.0, parseFloat((tempScore - 0.5).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-12 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">-0.5</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    const next = Math.max(1.0, parseFloat((tempScore - 0.1).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">-0.1</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    const next = Math.min(10.0, parseFloat((tempScore + 0.1).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">+0.1</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    const next = Math.min(10.0, parseFloat((tempScore + 0.5).toFixed(1)));
                    setTempScore(next);
                    tempScoreRef.current = next;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="w-12 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center active:bg-white/20"
                >
                  <Text className="text-white text-sm font-bold">+0.5</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Preset Buttons */}
              <View className="flex-row items-center justify-center gap-1.5 mb-6 flex-wrap">
                {[6.0, 7.0, 8.0, 8.5, 9.0, 9.5, 10.0].map((val) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => {
                      setTempScore(val);
                      tempScoreRef.current = val;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`px-3 py-1.5 rounded-lg border ${tempScore === val ? 'bg-[#E91E76] border-[#E91E76]' : 'bg-white/5 border-white/10'}`}
                  >
                    <Text className={`text-xs font-semibold ${tempScore === val ? 'text-white' : 'text-[#9CA3AF]'}`}>{val.toFixed(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => {
                  saveScore(tempScore);
                  setShowJudgeModal(false);
                }}
                className="w-full bg-[#E91E76] h-12 rounded-xl items-center justify-center shadow-lg shadow-[#E91E76]/40"
              >
                <Text className="text-white font-bold text-base tracking-wide">
                  Confirm Rating • {tempScore.toFixed(1)} ★
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export function HomeView({ user }: { user?: any }) {
  const [activeFeedTab, setActiveFeedTab] = useState('For You');
  
  // Search & Filters state removed for dedicated screens
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { videos: feedData, isLoading, refetch } = useFeed();
  const effectiveFeed = (feedData && feedData.length > 0) ? feedData : initialFeedData;
  const [extraVideos, setExtraVideos] = useState<any[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const manuallyPausedIdRef = useRef<string | null>(null);
  const autoPlayDebounceRef = useRef<any>(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const sentinelRef = useRef<any>(null);

  const allFeedItems = [...effectiveFeed, ...extraVideos];

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
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    setTimeout(() => {
      setExtraVideos(prev => {
        const sourceList = (feedData && feedData.length > 0) ? feedData : initialFeedData;
        const newItems = sourceList.map((item, idx) => ({
          ...item,
          id: `${item.id}-page-${prev.length + idx + 1}`
        }));
        return [...prev, ...newItems];
      });
      setIsLoadingMore(false);
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 400);
    }, 300);
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
  }, [allFeedItems.length]);
  
  // Filter Logic based on Tabs and Search
  const filteredData = allFeedItems.filter(v => {
    let matchesTab = true;
    if (activeFeedTab === 'Rising') matchesTab = v.isRising;
    if (activeFeedTab === 'Nearby') matchesTab = v.isNearby;
    if (activeFeedTab === 'Live') matchesTab = v.isLive;
    
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
      backgroundColor: '#050608',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.03)'
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
    <View className="flex-1 bg-[#050608]">
      <Animated.View style={headerStyle}>
        <View className="px-5 pt-12 pb-4 flex-row items-center justify-between">
          <View className="flex-row items-baseline">
            <Text className="font-bold text-[32px] tracking-tight text-white leading-none font-serif">talent</Text>
            <Text className="font-bold text-[32px] text-[#E91E76] leading-none ml-[1px] font-serif">.</Text>
          </View>
          <View className="flex-row items-center gap-6">
            <TouchableOpacity activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/search' as any); }}>
              <Search color="#E5E7EB" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/messages' as any); }}>
              <MessageCircle color="#E5E7EB" size={24} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/notifications' as any); }}>
              <Bell color="#E5E7EB" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {['For You', 'Rising', 'Nearby', 'Live', 'All Genres'].map((tab) => {
            const isActive = activeFeedTab === tab;
            return (
              <TouchableOpacity activeOpacity={0.7}
                key={tab}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFeedTab(tab);
                  // Reset scroll
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
                className={`h-[36px] px-5 rounded-full flex-row items-center justify-center ${
                  isActive ? 'bg-[#130711] border border-[#E91E76]/80' : 'bg-[#13151C] border border-white/5'
                }`}
              >
                <Text className={`text-[13px] ${isActive ? 'text-white font-bold' : 'text-[#D1D5DB] font-medium'}`}>
                  {tab}
                </Text>
                {tab === 'Live' && (
                  <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76] ml-2 -mt-1" />
                )}
                {tab === 'All Genres' && (
                  <ChevronDown color="#D1D5DB" size={14} className="ml-1" />
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef as any}
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 10, paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        scrollEventThrottle={16}
      >
        {filteredData.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-[#9CA3AF] text-[15px]">No performances found.</Text>
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
              />
            ))}

            {/* Seamless Automated Infinite Scroll Loading Indicator */}
            <View ref={sentinelRef} className="py-10 items-center justify-center">
              <View className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-full flex-row items-center gap-3">
                <ActivityIndicator size="small" color="#E91E76" />
                <Text className="text-[#9CA3AF] font-medium text-[13px] tracking-wide">
                  {isLoadingMore ? "Fetching fresh performances..." : "Loading more fresh performances..."}
                </Text>
              </View>
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}
