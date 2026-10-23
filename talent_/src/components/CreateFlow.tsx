import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Folder,
  ChevronRight,
  X,
  Zap,
  Music,
  RefreshCw,
  Timer,
  Sparkles,
  Sliders,
  Scissors,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Type,
  TrendingUp,
  MessageSquare,
  Users,
  Briefcase,
  MapPin,
  Check,
  CheckCircle2,
  CloudUpload,
  ArrowLeft,
  Play,
  Pause,
  Maximize2,
  Film,
  Mic,
  Palette,
  Star,
  Theater,
  Smile,
  Globe,
  Radio,
  Clock,
  Sparkle,
} from 'lucide-react';
import { PerformanceItem } from '../utils/stageData';

export type CreateStep =
  | 'CREATE_HOME' // 1. Create Home
  | 'RECORD' // 2. Record Performance
  | 'UPLOAD' // 3. Upload Performance
  | 'CHOOSE_TALENT' // 4. Choose Talent
  | 'PREVIEW_EDIT' // 5. Preview & Edit
  | 'SET_PURPOSE' // 6. Set Purpose
  | 'DETAILS_SETTINGS' // 7. Performance Details & Settings
  | 'PUBLISH' // 8. Ready to Publish
  | 'UPLOADING' // 9. Publishing animation
  | 'SUCCESS'; // 10. Your performance is live

export interface CreateFlowProps {
  onBackToHome: () => void;
  onPublishSuccess: (item: PerformanceItem) => void;
}

// Preset filters requested by user
export const VIDEO_FILTERS = [
  { id: 'normal', name: 'Normal', css: 'none' },
  {
    id: 'stage-amber',
    name: 'Stage Amber',
    css: 'sepia(0.35) saturate(1.45) contrast(1.1) brightness(1.05) hue-rotate(-8deg)',
  },
  {
    id: 'noir-bw',
    name: 'Noir B&W',
    css: 'grayscale(1) contrast(1.35) brightness(0.95)',
  },
  {
    id: 'neon-glow',
    name: 'Neon Pink',
    css: 'contrast(1.2) saturate(1.75) hue-rotate(310deg)',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    css: 'hue-rotate(275deg) saturate(1.6) contrast(1.25)',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    css: 'sepia(0.4) saturate(1.5) contrast(1.05) brightness(1.1)',
  },
  {
    id: 'vintage-90s',
    name: 'Vintage 90s',
    css: 'sepia(0.2) contrast(1.15) brightness(0.92) hue-rotate(12deg)',
  },
  {
    id: 'cinematic-cool',
    name: 'Cinematic Cool',
    css: 'hue-rotate(180deg) saturate(1.2) contrast(1.15)',
  },
];

// Talent categories with sub-styles (Screen 4)
export const TALENT_CATEGORIES = [
  {
    id: 'dance',
    name: 'Dance',
    icon: '💃',
    img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
    styles: ['Contemporary', 'Hip-Hop', 'Classical', 'Freestyle', 'Ballet', 'Folk', 'Other'],
  },
  {
    id: 'voice',
    name: 'Voice',
    icon: '🎤',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
    styles: ['Acoustic Singer', 'Indie Pop', 'Classical Raga', 'Jazz Vocals', 'R&B / Soul', 'Other'],
  },
  {
    id: 'music',
    name: 'Music',
    icon: '🎸',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    styles: ['Acoustic Guitar', 'Electric Solo', 'Keyboard / Synth', 'Percussion', 'Fusion', 'Other'],
  },
  {
    id: 'acting',
    name: 'Acting',
    icon: '🎭',
    img: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=400&q=80',
    styles: ['Monologue', 'Dramatic', 'Theatre', 'Spoken Word', 'Method', 'Other'],
  },
  {
    id: 'comedy',
    name: 'Comedy',
    icon: '🎙️',
    img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=400&q=80',
    styles: ['Stand-Up', 'Sketch', 'Improv', 'Musical Comedy', 'Mimicry', 'Other'],
  },
  {
    id: 'film',
    name: 'Film',
    icon: '🎬',
    img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80',
    styles: ['Cinematography', 'Short Scene', 'Choreography Reel', 'Directing', 'Other'],
  },
  {
    id: 'art',
    name: 'Art',
    icon: '🎨',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    styles: ['Live Painting', 'Speed Sketching', 'Digital Canvas', 'Installation', 'Other'],
  },
  {
    id: 'other',
    name: 'Other',
    icon: '⭐',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    styles: ['Acrobatics', 'Beatboxing', 'Magic & Illusion', 'Flow Arts', 'Variety'],
  },
];

// Goals (Screen 6)
export const PURPOSE_GOALS = [
  {
    id: 'discover',
    title: 'Get Discovered',
    desc: 'Show this to new people and audience curators',
    icon: TrendingUp,
  },
  {
    id: 'feedback',
    title: 'Get Feedback',
    desc: 'Let verified judges rate craft and help you improve',
    icon: MessageSquare,
  },
  {
    id: 'collaborators',
    title: 'Find Collaborators',
    desc: 'Connect with artists, producers, and musicians',
    icon: Users,
  },
  {
    id: 'opportunities',
    title: 'Find Opportunities',
    desc: 'Get considered for festival slots, showcases, and gigs',
    icon: Briefcase,
  },
];

// Sample preset videos ready to upload with 1-click
const PRESET_TAKES = [
  {
    title: 'Midnight Movement',
    category: 'Dance',
    style: 'Contemporary',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
    duration: '00:58',
    artist: 'Ananya Krishnan',
    role: 'Contemporary Dancer',
  },
  {
    title: 'Sunset Acoustic Raga',
    category: 'Music',
    style: 'Acoustic Guitar',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    duration: '01:00',
    artist: 'Aarav Nair',
    role: 'Singer-Songwriter',
  },
  {
    title: 'Silhouette Monologue',
    category: 'Acting',
    style: 'Theatre',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-woman-talking-on-stage-with-lights-42534-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1000&q=80',
    duration: '00:48',
    artist: 'Kiara Sen',
    role: 'Dramatic Actor',
  },
];

export default function CreateFlow({ onBackToHome, onPublishSuccess }: CreateFlowProps) {
  const [step, setStep] = useState<CreateStep>('CREATE_HOME');

  // Video and Media data
  const [videoSrc, setVideoSrc] = useState<string>(PRESET_TAKES[0].videoSrc);
  const [coverUrl, setCoverUrl] = useState<string>(PRESET_TAKES[0].posterUrl);
  const [videoDuration, setVideoDuration] = useState<string>('00:58');

  // Editing state
  const [activeFilterId, setActiveFilterId] = useState<string>('normal');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [videoTrimStart, setVideoTrimStart] = useState(0);
  const [videoTrimEnd, setVideoTrimEnd] = useState(58);
  const [activeSoundTrack, setActiveSoundTrack] = useState<string>('Live Stage Audio (Original)');
  const [captionText, setCaptionText] = useState<string>('');

  // Performance metadata
  const [selectedCategory, setSelectedCategory] = useState<string>('dance');
  const [selectedStyle, setSelectedStyle] = useState<string>('Contemporary');
  const [selectedGoal, setSelectedGoal] = useState<string>('discover');
  const [performanceTitle, setPerformanceTitle] = useState<string>('Midnight Movement');
  const [performanceLocation, setPerformanceLocation] = useState<string>('Bengaluru, India');
  const [allowJudging, setAllowJudging] = useState<boolean>(true);
  const [allowComments, setAllowComments] = useState<boolean>(true);
  const [visibility, setVisibility] = useState<'Public' | 'Unlisted' | 'Blind Only'>('Public');
  const [moreSettingsOpen, setMoreSettingsOpen] = useState(false);

  // Recording camera state (Step 2)
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [recordMode, setRecordMode] = useState<'Video' | 'Photo'>('Video');
  const [cameraSpeed, setCameraSpeed] = useState<'0.5x' | '1x' | '2x' | '3x'>('1x');
  const [cameraTimerSec, setCameraTimerSec] = useState<number>(0);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload progress (Step 9)
  const [uploadPercent, setUploadPercent] = useState(15);
  const [uploadStepIndex, setUploadStepIndex] = useState(1);

  // Drafts drawer
  const [draftsDrawerOpen, setDraftsDrawerOpen] = useState(false);
  const drafts = [
    { title: 'Midnight Movement (Take 1)', date: 'Yesterday', duration: '0:58' },
    { title: 'Acoustic Intro Raw', date: '3 days ago', duration: '0:45' },
  ];

  // Camera stream initialization for Step 2
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'RECORD') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'user' }, audio: true })
          .then((mediaStream) => {
            stream = mediaStream;
            if (cameraVideoRef.current) {
              cameraVideoRef.current.srcObject = mediaStream;
              cameraVideoRef.current.play().catch(() => {});
            }
          })
          .catch(() => {
            // fallback to cinematic simulation video
          });
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [step]);

  // Recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordedSeconds((prev) => {
          if (prev >= 180) {
            setIsRecording(false);
            setStep('CHOOSE_TALENT');
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Uploading progression (Step 9)
  useEffect(() => {
    if (step === 'UPLOADING') {
      setUploadPercent(15);
      setUploadStepIndex(1);

      const t1 = setTimeout(() => {
        setUploadPercent(45);
        setUploadStepIndex(2);
      }, 700);

      const t2 = setTimeout(() => {
        setUploadPercent(75);
        setUploadStepIndex(3);
      }, 1400);

      const t3 = setTimeout(() => {
        setUploadPercent(100);
        setUploadStepIndex(4);
      }, 2100);

      const t4 = setTimeout(() => {
        setStep('SUCCESS');
      }, 2600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [step]);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setPerformanceTitle(file.name.replace(/\.[^/.]+$/, ''));
      setStep('CHOOSE_TALENT');
    }
  };

  // Pick preset take
  const handleSelectPresetTake = (take: (typeof PRESET_TAKES)[0]) => {
    setVideoSrc(take.videoSrc);
    setCoverUrl(take.posterUrl);
    setPerformanceTitle(take.title);
    setPerformanceLocation('Bengaluru, India');
    setStep('CHOOSE_TALENT');
  };

  // Active filter CSS
  const currentFilter = VIDEO_FILTERS.find((f) => f.id === activeFilterId)?.css || 'none';

  // Final published item
  const handleFinishAndPublish = () => {
    const publishedItem: PerformanceItem = {
      id: `perf-${Date.now()}`,
      topDuration: videoDuration,
      timecode: `00:12 / ${videoDuration}`,
      totalSeconds: 60,
      initialSeconds: 12,
      artistName: 'Ananya Krishnan',
      role: `${selectedStyle} Performer`,
      location: performanceLocation,
      tags: [`#${selectedStyle.toLowerCase().replace(/\s+/g, '')}`, `#${selectedCategory}`, '#newtake'],
      category: 'For You',
      genre: selectedStyle,
      videoSrc: videoSrc,
      posterUrl: coverUrl,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: `Stage performance launched for: ${PURPOSE_GOALS.find((g) => g.id === selectedGoal)?.title}`,
      isPopularityHidden: !allowJudging,
      communityScores: { presence: 9.5, originality: 9.4, craft: 9.6 },
      comments: [
        {
          author: 'Stage Judge Bot',
          role: 'Calibrated Ear',
          text: 'Verified 60s Uncut Take. Ready for blind judging scores.',
          time: 'Just now',
        },
      ],
    };

    onPublishSuccess(publishedItem);
  };

  return (
    <div
      className={`w-full max-w-[430px] ${
        step === 'CREATE_HOME'
          ? 'min-h-screen pb-24'
          : 'fixed inset-0 z-40 mx-auto bg-[#07080C] overflow-y-auto'
      } text-white relative flex flex-col overflow-x-hidden selection:bg-[#E11D74]/30 pb-6`}
    >
      {/* Hidden File Input for Device Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* ===================== SCREEN 1: CREATE HOME ============================ */}
      {/* ========================================================================= */}
      {step === 'CREATE_HOME' && (
        <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-8">
          {/* iOS Status Bar */}
          <div className="flex items-center justify-between select-none text-[14.5px] font-semibold tracking-[-0.01em] text-white">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px]">📶</span>
              <span className="text-[12px]">🔋</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            {/* Header branding */}
            <div className="flex items-center justify-between">
              <span className="font-brand text-[22px] font-bold tracking-tight text-white flex items-center">
                talent<span className="text-[#E91E76]">.</span>
              </span>
              <button
                type="button"
                onClick={onBackToHome}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & subtitle */}
            <div>
              <h1 className="text-[34px] font-bold text-white tracking-tight leading-tight">Create</h1>
              <p className="text-[14px] text-[#9CA3AF] mt-0.5">Show what you can do.</p>
            </div>

            {/* Option 1: Record Performance (Pink gradient card) */}
            <button
              type="button"
              onClick={() => setStep('RECORD')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#DF1E76] to-[#E91E76] shadow-[0_4px_24px_rgba(233,30,118,0.35)] flex items-center justify-between group active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
                  <Camera className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white">Record Performance</h3>
                  <p className="text-[12px] text-white/80">Start with your camera</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/90 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Option 2: Upload Performance (Dark card) */}
            <button
              type="button"
              onClick={() => setStep('UPLOAD')}
              className="w-full p-4 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/20 flex items-center justify-between group active:scale-[0.98] transition-all text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Upload className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white">Upload Performance</h3>
                  <p className="text-[12px] text-[#8E95A5]">Choose from your device</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8E95A5] group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Drafts link */}
            <button
              type="button"
              onClick={() => setDraftsDrawerOpen(true)}
              className="flex items-center gap-2 text-[13px] text-[#8E95A5] hover:text-white px-1 py-1"
            >
              <Folder className="w-4 h-4 text-[#E91E76]" />
              <span>Drafts • 2</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Hero Card: "Your talent. Your stage." */}
          <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mt-4">
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
              alt="Guitarist on stage"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h4 className="font-serif italic text-[24px] text-white/95 leading-tight">
                Your talent.
              </h4>
              <h4 className="font-serif italic text-[24px] text-[#E91E76] leading-tight">
                Your stage.
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ==================== SCREEN 2: RECORD PERFORMANCE ======================= */}
      {/* ========================================================================= */}
      {step === 'RECORD' && (
        <div className="relative w-full h-[100dvh] bg-black flex flex-col justify-between overflow-hidden">
          {/* Live Camera Viewport with Selected Video Filter Applied */}
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            <video
              ref={cameraVideoRef}
              src="https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ filter: currentFilter }}
              className="w-full h-full object-cover scale-105"
            />
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
          </div>

          {/* Top Bar: Close, Flash, Sound */}
          <div className="relative z-20 px-5 pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsRecording(false);
                setStep('CREATE_HOME');
              }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Live Recording Timer Pill */}
            {isRecording && (
              <div className="px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[12px] font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>
                  00:{recordedSeconds.toString().padStart(2, '0')} / 03:00
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFlashEnabled(!flashEnabled)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors ${
                  flashEnabled ? 'bg-amber-400 text-black' : 'bg-black/40 text-white'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const tracks = [
                    'Live Stage Audio (Original)',
                    'Midnight Reverie (Ambient Beat)',
                    'Acoustic Strings Warmup',
                  ];
                  const nextIdx = (tracks.indexOf(activeSoundTrack) + 1) % tracks.length;
                  setActiveSoundTrack(tracks[nextIdx]);
                }}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-[#E91E76]"
                title={activeSoundTrack}
              >
                <Music className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Floating Camera Controls: Flip, Speed, Timer, Filters */}
          <div className="absolute right-4 top-20 z-20 flex flex-col gap-4 items-center">
            {/* Flip */}
            <button
              type="button"
              onClick={() => {
                if (cameraVideoRef.current) {
                  cameraVideoRef.current.classList.toggle('scale-x-[-1]');
                }
              }}
              className="flex flex-col items-center gap-1 text-white/90 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">Flip</span>
            </button>

            {/* Speed */}
            <button
              type="button"
              onClick={() => {
                const speeds: Array<'0.5x' | '1x' | '2x' | '3x'> = ['0.5x', '1x', '2x', '3x'];
                const next = speeds[(speeds.indexOf(cameraSpeed) + 1) % speeds.length];
                setCameraSpeed(next);
              }}
              className="flex flex-col items-center gap-1 text-white/90 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-[11px] font-bold">
                {cameraSpeed}
              </div>
              <span className="text-[10px] font-medium drop-shadow">Speed</span>
            </button>

            {/* Timer */}
            <button
              type="button"
              onClick={() => {
                const timers = [0, 3, 10];
                const next = timers[(timers.indexOf(cameraTimerSec) + 1) % timers.length];
                setCameraTimerSec(next);
              }}
              className="flex flex-col items-center gap-1 text-white/90 hover:text-white"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center ${
                  cameraTimerSec > 0 ? 'bg-[#E91E76] text-white' : 'bg-black/40 text-white'
                }`}
              >
                <Timer className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">
                {cameraTimerSec > 0 ? `${cameraTimerSec}s` : 'Timer'}
              </span>
            </button>

            {/* Filters (User emphasized: "I wnat that filters and everything properly") */}
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="flex flex-col items-center gap-1 text-white/90 hover:text-white"
            >
              <div
                className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center ${
                  activeFilterId !== 'normal' ? 'bg-[#E91E76] text-white' : 'bg-black/40 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium drop-shadow">Filters</span>
            </button>
          </div>

          {/* Interactive Filters Bottom Carousel (When open) */}
          {filterDrawerOpen && (
            <div className="relative z-30 px-4 py-2 bg-black/75 backdrop-blur-xl border-y border-white/10 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
              {VIDEO_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilterId(f.id)}
                  className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeFilterId === f.id
                      ? 'bg-[#E91E76] text-white shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Controls: Thumbnail picker, Big Record Button, Mode selector */}
          <div className="relative z-20 px-6 pb-8 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between">
              {/* Camera Roll Thumbnail on Left */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/60 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={coverUrl}
                  alt="Gallery pick"
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Big Record Button */}
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                    setStep('CHOOSE_TALENT');
                  } else {
                    setIsRecording(true);
                  }
                }}
                className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              >
                <div
                  className={`transition-all duration-200 ${
                    isRecording
                      ? 'w-8 h-8 rounded-lg bg-red-500 animate-pulse'
                      : 'w-16 h-16 rounded-full bg-[#E91E76] shadow-[0_0_20px_rgba(233,30,118,0.7)]'
                  }`}
                />
              </button>

              {/* Next/Skip button */}
              <button
                type="button"
                onClick={() => setStep('CHOOSE_TALENT')}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-[#E91E76] cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Selector: Video | Photo */}
            <div className="flex items-center gap-6 text-[13px] font-semibold tracking-wider uppercase select-none">
              <button
                type="button"
                onClick={() => setRecordMode('Video')}
                className={recordMode === 'Video' ? 'text-white font-bold' : 'text-white/40'}
              >
                Video
              </button>
              <button
                type="button"
                onClick={() => setRecordMode('Photo')}
                className={recordMode === 'Photo' ? 'text-white font-bold' : 'text-white/40'}
              >
                Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ==================== SCREEN 3: UPLOAD PERFORMANCE ======================= */}
      {/* ========================================================================= */}
      {step === 'UPLOAD' && (
        <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setStep('CREATE_HOME')}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[17px] font-bold text-white">Upload Performance</h2>
            <div className="w-9" />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {/* Big Dropzone Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[16/10] rounded-3xl border-2 border-dashed border-white/20 hover:border-[#E91E76] bg-[#11131B] flex flex-col items-center justify-center p-6 text-center cursor-pointer group transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E91E76] group-hover:scale-110 transition-transform">
                <CloudUpload className="w-7 h-7" />
              </div>
              <h3 className="text-[17px] font-bold text-white mt-3">Choose a video</h3>
              <p className="text-[12px] text-[#8E95A5] mt-0.5">Select from your device (Max 3 minutes)</p>
            </div>

            {/* Source Options List */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/20 flex items-center justify-between group active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <ImageIcon className="w-5 h-5 text-white/80" />
                  <span className="text-[15px] font-semibold text-white">From Gallery</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/20 flex items-center justify-between group active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <Folder className="w-5 h-5 text-white/80" />
                  <span className="text-[15px] font-semibold text-white">From Files</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/20 flex items-center justify-between group active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <CloudUpload className="w-5 h-5 text-white/80" />
                  <span className="text-[15px] font-semibold text-white">From Cloud</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
              </button>
            </div>

            {/* Quick Test Takes (Ready to test with 1-click) */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 mt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E91E76]">
                Or Pick a Ready Stage Take:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {PRESET_TAKES.map((take) => (
                  <button
                    key={take.title}
                    type="button"
                    onClick={() => handleSelectPresetTake(take)}
                    className="p-2 rounded-xl bg-[#0A0B10] border border-white/10 hover:border-[#E91E76] flex items-center gap-2.5 shrink-0 text-left cursor-pointer group"
                  >
                    <img
                      src={take.posterUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h5 className="text-[12px] font-bold text-white group-hover:text-[#E91E76] transition-colors truncate max-w-[130px]">
                        {take.title}
                      </h5>
                      <span className="text-[10px] text-[#8E95A5]">
                        {take.category} • {take.duration}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[11px] text-[#8E95A5] mt-4">
            <p>Supported: MP4, MOV, HEVC</p>
            <p className="mt-0.5">Max size: 500 MB</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== SCREEN 4: CHOOSE TALENT ========================== */}
      {/* ========================================================================= */}
      {step === 'CHOOSE_TALENT' && (
        <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-8">
          <div>
            {/* Header with Progress Bar */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setStep('RECORD')}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-1/4 h-full bg-[#E91E76]" />
              </div>
              <div className="w-9" />
            </div>

            {/* Title */}
            <div className="mt-2">
              <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                What are you showing?
              </h1>
              <p className="text-[13px] text-[#9CA3AF] mt-0.5">
                Choose the main talent category.
              </p>
            </div>

            {/* 2x4 Grid of 8 Talent Categories */}
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              {TALENT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedStyle(cat.styles[0]);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 relative overflow-hidden ${
                      isSelected
                        ? 'border-[#E91E76] bg-[#E91E76]/15 shadow-[0_0_15px_rgba(233,30,118,0.3)]'
                        : 'border-white/10 bg-[#11131B] hover:border-white/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 relative shadow-sm">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#E91E76]/70 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[12.5px] font-semibold ${
                        isSelected ? 'text-white' : 'text-[#D1D5DB]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Subcategories Section (e.g. Dance styles (optional)) */}
            <div className="mt-6 flex flex-col gap-2.5">
              <label className="text-[12.5px] font-semibold text-white">
                {TALENT_CATEGORIES.find((c) => c.id === selectedCategory)?.name} styles (optional)
              </label>

              <div className="flex flex-wrap gap-2">
                {TALENT_CATEGORIES.find((c) => c.id === selectedCategory)?.styles.map((style) => {
                  const isSelected = selectedStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSelectedStyle(style)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E91E76] text-white shadow-md'
                          : 'bg-[#11131B] border border-white/10 text-[#D1D5DB] hover:border-white/25'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={() => setStep('PREVIEW_EDIT')}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white font-bold text-[14px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform mt-6 cursor-pointer"
          >
            Continue
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== SCREEN 5: PREVIEW & EDIT ========================== */}
      {/* ========================================================================= */}
      {step === 'PREVIEW_EDIT' && (
        <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-8">
          <div>
            {/* Header: Back, Preview & Edit, Next Button */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setStep('CHOOSE_TALENT')}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-[17px] font-bold text-white">Preview & Edit</h2>
              <button
                type="button"
                onClick={() => setStep('SET_PURPOSE')}
                className="px-4 py-1.5 rounded-full bg-[#E91E76] text-white text-[12.5px] font-bold shadow-md cursor-pointer active:scale-95"
              >
                Next
              </button>
            </div>

            {/* Video Preview Card */}
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl mt-2">
              <video
                ref={previewVideoRef}
                src={videoSrc}
                poster={coverUrl}
                autoPlay
                loop
                playsInline
                style={{ filter: currentFilter }}
                className="w-full h-full object-cover"
              />

              {/* Filter badge */}
              {activeFilterId !== 'normal' && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#E91E76] uppercase">
                  {VIDEO_FILTERS.find((f) => f.id === activeFilterId)?.name}
                </div>
              )}

              {/* Caption Overlay */}
              {captionText && (
                <div className="absolute bottom-16 inset-x-4 text-center">
                  <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-[13px] font-semibold">
                    {captionText}
                  </span>
                </div>
              )}

              {/* Scrim & Timecode */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />

              {/* Video Timeline & Scrub Bar */}
              <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-[11px] font-mono text-white/80">
                <div className="flex-1 mr-3 h-2 bg-white/20 rounded-full overflow-hidden relative">
                  <div className="w-2/5 h-full bg-[#E91E76] rounded-full" />
                </div>
                <span>00:12 / {videoDuration}</span>
                <Maximize2 className="w-3.5 h-3.5 ml-2 cursor-pointer" />
              </div>
            </div>

            {/* Video Editing Tools Row: Trim, Cover, Sound, Caption, Filters */}
            <div className="grid grid-cols-5 gap-2 mt-4 select-none">
              {/* Trim */}
              <button
                type="button"
                onClick={() => setVideoDuration(videoDuration === '00:58' ? '00:30' : '00:58')}
                className="p-2.5 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/25 flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Scissors className="w-5 h-5 text-white/80" />
                <span className="text-[10px] font-medium text-[#D1D5DB]">Trim</span>
              </button>

              {/* Cover */}
              <button
                type="button"
                onClick={() => {
                  const photos = [
                    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1000&q=80',
                  ];
                  const next = photos[(photos.indexOf(coverUrl) + 1) % photos.length];
                  setCoverUrl(next);
                }}
                className="p-2.5 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/25 flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 text-white/80" />
                <span className="text-[10px] font-medium text-[#D1D5DB]">Cover</span>
              </button>

              {/* Sound */}
              <button
                type="button"
                onClick={() => {
                  const tracks = [
                    'Live Stage Audio (Original)',
                    'Bassline Kick Pulse',
                    'Acoustic Studio Reverb',
                  ];
                  const next = tracks[(tracks.indexOf(activeSoundTrack) + 1) % tracks.length];
                  setActiveSoundTrack(next);
                }}
                className="p-2.5 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/25 flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Music className="w-5 h-5 text-white/80" />
                <span className="text-[10px] font-medium text-[#D1D5DB]">Sound</span>
              </button>

              {/* Caption */}
              <button
                type="button"
                onClick={() => {
                  const text = prompt('Enter stage caption:', captionText);
                  if (text !== null) setCaptionText(text);
                }}
                className="p-2.5 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/25 flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Type className="w-5 h-5 text-white/80" />
                <span className="text-[10px] font-medium text-[#D1D5DB]">Caption</span>
              </button>

              {/* Filters */}
              <button
                type="button"
                onClick={() => {
                  const ids = VIDEO_FILTERS.map((f) => f.id);
                  const next = ids[(ids.indexOf(activeFilterId) + 1) % ids.length];
                  setActiveFilterId(next);
                }}
                className="p-2.5 rounded-2xl bg-[#11131B] border border-white/10 hover:border-[#E91E76] flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#E91E76]" />
                <span className="text-[10px] font-medium text-white">Filter</span>
              </button>
            </div>

            {/* Active tool status summary */}
            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] text-[#9CA3AF]">
              <span>Audio: {activeSoundTrack}</span>
              <span className="text-[#E91E76] font-semibold">
                Filter: {VIDEO_FILTERS.find((f) => f.id === activeFilterId)?.name}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('SET_PURPOSE')}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white font-bold text-[14px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform mt-4 cursor-pointer"
          >
            Continue
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== SCREEN 6: SET PURPOSE ============================= */}
      {/* ========================================================================= */}
      {step === 'SET_PURPOSE' && (
        <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-8">
          <div>
            {/* Header with Progress Bar */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setStep('PREVIEW_EDIT')}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-2/4 h-full bg-[#E91E76]" />
              </div>
              <div className="w-9" />
            </div>

            {/* Title */}
            <div className="mt-2">
              <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                What do you want from this performance?
              </h1>
              <p className="text-[13px] text-[#9CA3AF] mt-0.5">
                Choose your main goal.
              </p>
            </div>

            {/* 4 Goal Cards matching reference */}
            <div className="flex flex-col gap-3 mt-6">
              {PURPOSE_GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.id;
                const IconComponent = goal.icon;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all text-left cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#E91E76] bg-[#E91E76]/15 shadow-[0_0_15px_rgba(233,30,118,0.3)]'
                        : 'border-white/10 bg-[#11131B] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#E91E76] text-white'
                            : 'bg-white/5 border border-white/10 text-white/80'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[15.5px] font-bold text-white leading-tight">
                          {goal.title}
                        </h4>
                        <p className="text-[12px] text-[#8E95A5] mt-0.5">{goal.desc}</p>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        isSelected ? 'text-[#E91E76] translate-x-0.5' : 'text-[#8E95A5]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('DETAILS_SETTINGS')}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white font-bold text-[14px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform mt-6 cursor-pointer"
          >
            Continue
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= SCREEN 7: DETAILS & SETTINGS ========================== */}
      {/* ========================================================================= */}
      {step === 'DETAILS_SETTINGS' && (
        <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-8">
          <div>
            {/* Header with Progress Bar */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setStep('SET_PURPOSE')}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-3/4 h-full bg-[#E91E76]" />
              </div>
              <div className="w-9" />
            </div>

            {/* Title */}
            <div className="mt-2">
              <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                Performance Details
              </h1>
              <p className="text-[13px] text-[#9CA3AF] mt-0.5">
                Add the finishing touches.
              </p>
            </div>

            {/* Cover and Inputs Card */}
            <div className="mt-5 p-4 rounded-2xl bg-[#11131B] border border-white/10 flex gap-4">
              {/* Cover Preview & Change Button */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-28 rounded-xl overflow-hidden border border-white/20 relative shadow-md">
                  <img
                    src={coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const photos = [
                      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
                      'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1000&q=80',
                    ];
                    const next = photos[(photos.indexOf(coverUrl) + 1) % photos.length];
                    setCoverUrl(next);
                  }}
                  className="text-[10px] text-[#E91E76] font-semibold hover:underline"
                >
                  Change Cover
                </button>
              </div>

              {/* Title and Location Inputs */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#8E95A5] mb-1">
                    <label className="uppercase font-bold tracking-wider">Title</label>
                    <span>{performanceTitle.length}/100</span>
                  </div>
                  <input
                    type="text"
                    value={performanceTitle}
                    onChange={(e) => setPerformanceTitle(e.target.value)}
                    maxLength={100}
                    placeholder="Enter performance title..."
                    className="w-full h-9 px-3 rounded-xl bg-[#0A0B10] border border-white/15 text-[13px] text-white focus:outline-none focus:border-[#E91E76]"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-[11px] uppercase font-bold tracking-wider text-[#8E95A5] block mb-1">
                    Location
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-[#E91E76] absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={performanceLocation}
                      onChange={(e) => setPerformanceLocation(e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#0A0B10] border border-white/15 text-[13px] text-white focus:outline-none focus:border-[#E91E76]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Allow Judging Toggle Switch */}
            <div className="mt-4 p-4 rounded-2xl bg-[#11131B] border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-white leading-tight">Allow Judging</h4>
                <p className="text-[12px] text-[#8E95A5] mt-0.5">
                  Let viewers give this performance a Talent Score.
                </p>
              </div>

              {/* iOS Switch */}
              <button
                type="button"
                onClick={() => setAllowJudging(!allowJudging)}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                  allowJudging ? 'bg-[#E91E76]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    allowJudging ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* More Settings Accordion / Button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setMoreSettingsOpen(!moreSettingsOpen)}
                className="w-full p-3.5 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/20 flex items-center justify-between text-[13px] text-[#D1D5DB] cursor-pointer"
              >
                <span>More settings</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${moreSettingsOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {moreSettingsOpen && (
                <div className="mt-2 p-4 rounded-2xl bg-[#0E1017] border border-white/10 flex flex-col gap-3 text-[12.5px] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Comments (Talk)</span>
                      <span className="text-[11px] text-[#8E95A5]">Allow craft critique from verified peers</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowComments(!allowComments)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                        allowComments ? 'bg-[#E91E76]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          allowComments ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      <span className="font-semibold text-white block">Visibility</span>
                      <span className="text-[11px] text-[#8E95A5]">Who can view this stage take</span>
                    </div>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="h-8 px-2 rounded-lg bg-black/60 border border-white/20 text-white text-[11px]"
                    >
                      <option value="Public">Public (Global Feed)</option>
                      <option value="Blind Only">Blind Only (Scores first)</option>
                      <option value="Unlisted">Unlisted</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('PUBLISH')}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white font-bold text-[14px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform mt-6 cursor-pointer"
          >
            Continue
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== SCREEN 8: READY TO PUBLISH ======================== */}
      {/* ========================================================================= */}
      {step === 'PUBLISH' && (
        <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-8">
          <div>
            {/* Header with Progress Bar */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setStep('DETAILS_SETTINGS')}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="w-full h-full bg-[#E91E76]" />
              </div>
              <div className="w-9" />
            </div>

            {/* Title */}
            <div className="mt-2">
              <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                Ready to Publish?
              </h1>
              <p className="text-[13px] text-[#9CA3AF] mt-0.5">
                Here's a quick summary.
              </p>
            </div>

            {/* Summary Card with Video Preview, Badges, Category, Goal */}
            <div className="mt-5 p-4 rounded-3xl bg-[#11131B] border border-white/10 flex gap-4 shadow-xl">
              <div className="w-24 h-32 rounded-2xl overflow-hidden border border-white/20 relative shrink-0">
                <img
                  src={coverUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <h3 className="text-[17px] font-bold text-white leading-tight">
                    {performanceTitle || 'Untitled Performance'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF] mt-1">
                    <span>{TALENT_CATEGORIES.find((c) => c.id === selectedCategory)?.name}</span>
                    <span>•</span>
                    <span className="text-[#E91E76] font-semibold">{selectedStyle}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#D1D5DB] mt-1">
                    <MapPin className="w-3 h-3 text-[#E91E76]" />
                    <span>{performanceLocation}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#E91E76]/15 border border-[#E91E76]/30 text-[10.5px] font-bold text-[#E91E76]">
                    📊 Goal: {PURPOSE_GOALS.find((g) => g.id === selectedGoal)?.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings Checklist */}
            <div className="mt-5 p-4 rounded-2xl bg-[#11131B] border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#D1D5DB]">Allow Judging</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[11px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{allowJudging ? 'On' : 'Off'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[13px] pt-2 border-t border-white/[0.06]">
                <span className="text-[#D1D5DB]">Comments (Talk)</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[11px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{allowComments ? 'On' : 'Off'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[13px] pt-2 border-t border-white/[0.06]">
                <span className="text-[#D1D5DB]">Visibility</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#E91E76]" />
                  <span>{visibility}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Publish Performance Button */}
          <button
            type="button"
            onClick={() => setStep('UPLOADING')}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white font-bold text-[14px] uppercase tracking-wider shadow-[0_0_24px_rgba(233,30,118,0.5)] active:scale-95 transition-transform mt-6 cursor-pointer"
          >
            Publish Performance
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ===================== SCREEN 9: UPLOADING ANIMATION ===================== */}
      {/* ========================================================================= */}
      {step === 'UPLOADING' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none">
          {/* Pulsing Cloud Upload Graphic */}
          <div className="relative w-28 h-28 rounded-full bg-[#E91E76]/15 border-2 border-[#E91E76]/40 flex items-center justify-center shadow-[0_0_40px_rgba(233,30,118,0.35)] animate-pulse">
            <CloudUpload className="w-14 h-14 text-[#E91E76]" />
            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-25" />
          </div>

          <h2 className="text-[22px] font-bold text-white mt-6">
            Publishing your performance...
          </h2>
          <p className="text-[13px] text-[#9CA3AF] mt-1">This may take a few moments.</p>

          {/* Progress Bar & Percentage */}
          <div className="w-full max-w-[280px] mt-6 flex flex-col gap-2">
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
            <span className="text-[12px] font-mono font-bold text-white/90 text-right">
              {uploadPercent}%
            </span>
          </div>

          {/* Multi-step progress checklist from Screen 9 */}
          <div className="w-full max-w-[260px] flex flex-col gap-2.5 mt-6 text-left text-[12.5px]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 ${
                  uploadStepIndex >= 1 ? 'text-[#E91E76]' : 'text-white/20'
                }`}
              />
              <span className={uploadStepIndex >= 1 ? 'text-white font-medium' : 'text-white/40'}>
                Uploading video
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 ${
                  uploadStepIndex >= 2 ? 'text-[#E91E76]' : 'text-white/20'
                }`}
              />
              <span className={uploadStepIndex >= 2 ? 'text-white font-medium' : 'text-white/40'}>
                Processing video
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 ${
                  uploadStepIndex >= 3 ? 'text-[#E91E76]' : 'text-white/20'
                }`}
              />
              <span className={uploadStepIndex >= 3 ? 'text-white font-medium' : 'text-white/40'}>
                Saving details
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 ${
                  uploadStepIndex >= 4 ? 'text-[#E91E76]' : 'text-white/20'
                }`}
              />
              <span className={uploadStepIndex >= 4 ? 'text-white font-medium' : 'text-white/40'}>
                Finalizing...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================= SCREEN 10: SUCCESS ============================== */}
      {/* ========================================================================= */}
      {step === 'SUCCESS' && (
        <div className="flex-1 flex flex-col justify-between px-6 pt-10 pb-8 text-center select-none animate-in zoom-in-95 duration-200">
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Big Pink Checkmark Badge with Confetti Sparkles */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#DF1E76] to-[#FF4B8B] flex items-center justify-center shadow-[0_0_40px_rgba(233,30,118,0.5)]">
                <Check className="w-12 h-12 text-white stroke-[3.5]" />
              </div>
              <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
              <Sparkles className="w-5 h-5 text-pink-300 absolute -bottom-1 -left-2" />
            </div>

            <h1 className="text-[28px] font-bold text-white mt-6 tracking-tight">
              Your performance is live!
            </h1>
            <p className="text-[13.5px] text-[#9CA3AF] mt-1.5 max-w-[280px] leading-relaxed">
              People can now watch, keep, talk and judge your performance.
            </p>
          </div>

          {/* Action Buttons: View Performance & Create Another */}
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={handleFinishAndPublish}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white font-bold text-[14px] uppercase tracking-wider shadow-[0_0_24px_rgba(233,30,118,0.5)] active:scale-95 transition-transform cursor-pointer"
            >
              View Performance
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('CREATE_HOME');
                setPerformanceTitle('Midnight Movement');
              }}
              className="w-full h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] font-semibold text-white/90 active:scale-95 transition-all cursor-pointer"
            >
              Create Another
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ======================= DRAFTS DRAWER MODAL ============================= */}
      {/* ========================================================================= */}
      {draftsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[430px] bg-[#12141C] border-t border-white/15 rounded-t-3xl p-5 flex flex-col gap-3.5 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-white">Saved Drafts</h3>
                <p className="text-[12px] text-[#9CA3AF]">Resume editing previous takes</p>
              </div>
              <button
                type="button"
                onClick={() => setDraftsDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {drafts.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPerformanceTitle(d.title);
                    setDraftsDrawerOpen(false);
                    setStep('PREVIEW_EDIT');
                  }}
                  className="w-full p-3 rounded-xl bg-[#0A0B10] border border-white/10 hover:border-[#E91E76] flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-[#E91E76]" />
                    <div>
                      <h4 className="text-[13px] font-bold text-white group-hover:text-[#E91E76] transition-colors">
                        {d.title}
                      </h4>
                      <span className="text-[11px] text-[#8E95A5]">
                        {d.date} • {d.duration}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
