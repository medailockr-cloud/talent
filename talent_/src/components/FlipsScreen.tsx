import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  EyeOff,
  Eye,
  Bookmark,
  MessageCircle,
  X,
  Sparkles,
  ChevronRight,
  MapPin,
  Check,
  Send,
  Volume2,
  VolumeX,
  Sliders,
  Award,
  Activity,
  Layers,
  Zap,
  RotateCw,
  ShieldCheck,
  TrendingUp,
  Disc,
  Heart,
  ChevronUp,
  ChevronDown,
  Star,
} from 'lucide-react';
import { GeneratedArtworks } from '../utils/stageArtwork';
import { FlipsLogoIcon } from './icons/NavigationLogos';

interface FlipsScreenProps {
  artworks: GeneratedArtworks;
  onOpenProfile: (id: string) => void;
  onSearchClick: () => void;
}

type FlipViewMode = 'STAGE' | 'STEM_XRAY' | 'BLINDFOLD';

interface CraftMarker {
  time: number;
  label: string;
  category: 'Vocal' | 'Instrument' | 'Dynamic';
  description: string;
}

export default function FlipsScreen({
  artworks,
  onOpenProfile,
  onSearchClick,
}: FlipsScreenProps) {
  // Flip Queue with deep multi-dimensional metadata
  const flipsQueue = useMemo(
    () => [
      {
        id: 'aarav-menon',
        artistName: 'Aarav Menon',
        role: 'Acoustic Singer',
        location: 'Bengaluru',
        tags: ['Original Music', 'Indie', 'Hindi'],
        poster: artworks.flipsAaravPoster,
        videoSrc:
          'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
        initialSeconds: 42,
        totalSeconds: 60,
        craftScore: 9.4,
        scores: { presence: 9.4, originality: 9.6, craft: 9.2 },
        pitchAccuracy: '98.6%',
        vocalRange: 'E2 - G4 (2.3 Octaves)',
        keySignature: 'E Minor • 108 BPM',
        zeroAutotuneProof: 'Pure Analog Mic Feed (18.2 dB Dynamic Range)',
        popularityStats: { votes: '142.8K', rank: '#2 Indie Originals' },
        craftMarkers: [
          {
            time: 14,
            label: 'Chest-to-Head Transition',
            category: 'Vocal',
            description: 'Flawless vocal break without pitch-correction snap.',
          },
          {
            time: 28,
            label: 'Fingerstyle Polyphony',
            category: 'Instrument',
            description: 'Independent thumb bassline while sustaining melody.',
          },
          {
            time: 42,
            label: 'Dynamic Crescendo',
            category: 'Dynamic',
            description: 'Uncompressed diaphragm breath control into condenser mic.',
          },
        ] as CraftMarker[],
        nextTalent: {
          title: 'Contemporary Dancer',
          name: 'Kiara Nair',
          thumb: artworks.kiaraPoster,
        },
      },
      {
        id: 'kiara-nair',
        artistName: 'Kiara Nair',
        role: 'Contemporary Dancer',
        location: 'Kochi & Bengaluru',
        tags: ['Classical Fusion', 'Mudras', 'One-Take'],
        poster: artworks.kiaraPoster,
        videoSrc:
          'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
        initialSeconds: 36,
        totalSeconds: 60,
        craftScore: 9.7,
        scores: { presence: 9.8, originality: 9.6, craft: 9.7 },
        pitchAccuracy: '99.4% Tempo Lock',
        vocalRange: 'Center of Gravity 98% Stable',
        keySignature: 'Taal Teentaal • 84 BPM',
        zeroAutotuneProof: 'Raw One-Take Uncut Stage Footage',
        popularityStats: { votes: '98.6K', rank: '#1 Classical Fusion' },
        craftMarkers: [
          {
            time: 12,
            label: 'Mudra Inversion',
            category: 'Instrument',
            description: 'High Bharatanatyam hand geometry transition.',
          },
          {
            time: 32,
            label: 'Floorwork Pivot',
            category: 'Dynamic',
            description: 'Zero momentum loss from spin to ground contact.',
          },
        ] as CraftMarker[],
        nextTalent: {
          title: 'Oud Virtuoso',
          name: 'Sofia Al-Mansoor',
          thumb: artworks.showSofarThumb,
        },
      },
    ],
    [artworks]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = flipsQueue[currentIndex];

  // Revolutionary Innovation: Flip View Mode
  const [viewMode, setViewMode] = useState<FlipViewMode>('STAGE');
  const [isCardFlipping, setIsCardFlipping] = useState(false);

  // Stem X-Ray Controls
  const [isolatedStem, setIsolatedStem] = useState<'ALL' | 'VOCAL' | 'GUITAR' | 'ROOM'>('ALL');
  const [stemFaders, setStemFaders] = useState({ vocal: 92, guitar: 88, room: 65 });

  // Playback & Audio
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(currentItem.initialSeconds);
  const [duration, setDuration] = useState(currentItem.totalSeconds);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const canvasSpectrumRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive UI states
  const [isKept, setIsKept] = useState(false);
  const [isTalkOpen, setIsTalkOpen] = useState(false);
  const [isBlindRevealed, setIsBlindRevealed] = useState(false);
  const [isPopularityRevealed, setIsPopularityRevealed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<CraftMarker | null>(null);

  // Simple Number Stepper Scoring (Exact Flow from image.png)
  const [isScorePickerOpen, setIsScorePickerOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number>(8);
  const [hasJudged, setHasJudged] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  const handleScoreUp = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedScore((prev) => Math.min(10, prev + 1));
  };

  const handleScoreDown = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedScore((prev) => Math.max(1, prev - 1));
  };

  const handleConfirmScore = (score = selectedScore) => {
    setSelectedScore(score);
    setHasJudged(true);
    setIsScorePickerOpen(false);

    // Floating subtle emojis
    const emojis = ['⭐️', '🔥', '👏', '❤️'];
    const newReactions = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      left: 40 + Math.random() * 20,
    }));
    setFloatingReactions(newReactions);
    setTimeout(() => setFloatingReactions([]), 1400);

    // Play subtle audio chime
    try {
      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      }
    } catch {}

    showToast(`Score ${score}/10 saved!`);
  };

  const handleJudgeButtonClick = () => {
    if (isScorePickerOpen) {
      handleConfirmScore();
    } else {
      setIsScorePickerOpen(true);
    }
  };

  // Comments
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Vikram Seth',
      role: 'Grammy Voting Member',
      text: 'Flipped to Stem X-Ray at 00:28. The fingerpicking resonance has zero digital artifacts. Incredible raw talent.',
      time: '8m ago',
    },
    {
      id: 'c2',
      author: 'Zoya Akhtar',
      role: 'Master Ear Curator',
      text: 'Blindfolded rating was 9.6. Flipped to reveal and wasn’t surprised — Aarav’s micro-intonation is world-class.',
      time: '19m ago',
    },
  ]);
  const [commentInput, setCommentInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  // Flip Mode Transition with physical 3D card turnover
  const triggerFlipMode = (newMode: FlipViewMode) => {
    if (newMode === viewMode) return;
    setIsCardFlipping(true);
    setTimeout(() => {
      setViewMode(newMode);
      setIsCardFlipping(false);
    }, 220);

    if (newMode === 'STEM_XRAY') {
      showToast('🎛️ Craft Stem X-Ray: Audio Stems & Pitch Isolated');
    } else if (newMode === 'BLINDFOLD') {
      showToast('🕶️ Blindfold Audition: Visuals hidden for pure ear judging');
    } else {
      showToast('🎭 One-Take Stage: Raw live performance view');
    }
  };

  // Web Audio Synth for authentic stem isolation audio feedback
  const playStemAudioTone = useCallback(
    (stem: 'ALL' | 'VOCAL' | 'GUITAR' | 'ROOM') => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        if (stem === 'VOCAL') {
          // Pure human vocal formants (sine with rich vibrato)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(329.63, now); // E4
          osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.3); // F4 vibrato
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.95);
        } else if (stem === 'GUITAR') {
          // Acoustic string pluck resonance
          const freqs = [196.0, 246.94, 392.0];
          freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.05);
            gain.gain.setValueAtTime(0.09, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.85);
          });
        }
      } catch {
        // AudioContext fallback
      }
    },
    []
  );

  // Live Real-Time Canvas Spectrogram & Radar Visualizer
  useEffect(() => {
    let animId: number;
    const canvas = canvasSpectrumRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderSpectrum = () => {
      phase += 0.06;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const bars = 36;
      const barWidth = (w - bars * 3) / bars;

      for (let i = 0; i < bars; i++) {
        const heightMult =
          Math.sin(phase + i * 0.28) * 0.4 +
          Math.cos(phase * 0.8 + i * 0.15) * 0.3 +
          0.45;
        const barHeight = Math.max(8, heightMult * (h * 0.82));

        const grad = ctx.createLinearGradient(0, h - barHeight, 0, h);
        if (isolatedStem === 'VOCAL') {
          grad.addColorStop(0, '#FF4081');
          grad.addColorStop(1, '#9C27B0');
        } else if (isolatedStem === 'GUITAR') {
          grad.addColorStop(0, '#FFB300');
          grad.addColorStop(1, '#FF6F00');
        } else {
          grad.addColorStop(0, '#00E5FF');
          grad.addColorStop(0.5, '#DF1E76');
          grad.addColorStop(1, '#1A1D27');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(i * (barWidth + 3), h - barHeight, barWidth, barHeight);
      }

      animId = requestAnimationFrame(renderSpectrum);
    };

    renderSpectrum();
    return () => cancelAnimationFrame(animId);
  }, [isolatedStem, viewMode]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % flipsQueue.length);
    setIsKept(false);
    setHasJudged(false);
    setIsScorePickerOpen(false);
    setSelectedScore(8);
    setIsBlindRevealed(false);
    setViewMode('STAGE');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [flipsQueue.length]);

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = pos * (duration || 60);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const jumpToMarker = (marker: CraftMarker) => {
    if (videoRef.current) {
      videoRef.current.currentTime = marker.time;
      setCurrentTime(marker.time);
    }
    setActiveMarkerInfo(marker);
    showToast(`📍 Jumped to ${marker.label} (${marker.category})`);
  };

  const formatSeconds = (sec: number) => {
    const total = Math.floor(sec || 0);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between overflow-hidden px-3 pt-0.5 pb-1 text-white relative select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#151824]/95 border border-[#DF1E76] shadow-2xl backdrop-blur-md text-[12px] font-medium text-white flex items-center gap-2 animate-in fade-in duration-150">
          <Sparkles className="w-4 h-4 text-[#DF1E76]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Instagram-style floating reaction emojis */}
      {floatingReactions.map((r) => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-50 text-3xl animate-float-up"
          style={{
            left: `${r.left}%`,
            bottom: '140px',
          }}
        >
          {r.emoji}
        </div>
      ))}

      {/* 1. Main Revolutionary 3D Flip Card Frame */}
      <div
        className={`relative w-full flex-1 min-h-0 rounded-[28px] overflow-hidden border border-white/10 bg-[#0E0B09] shadow-2xl flex flex-col justify-between transition-all duration-300 ${
          isCardFlipping ? 'scale-95 opacity-50 rotate-y-90' : 'scale-100 opacity-100 rotate-y-0'
        }`}
      >
        {/* ================= LAYER A: ONE-TAKE STAGE VIEW ================= */}
        {viewMode === 'STAGE' && (
          <>
            <video
              ref={videoRef}
              src={currentItem.videoSrc}
              poster={currentItem.poster}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              onTimeUpdate={(e) => {
                setCurrentTime(e.currentTarget.currentTime);
                setDuration(e.currentTarget.duration || 60);
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/45 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />
          </>
        )}

        {/* ================= LAYER B: THE STEM X-RAY & CRAFT SPECTROGRAM ================= */}
        {viewMode === 'STEM_XRAY' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D16] via-[#120F1D] to-[#08050E] p-4 flex flex-col justify-between overflow-y-auto no-scrollbar z-10">
            {/* Live Spectrogram Canvas */}
            <div className="w-full pt-11">
              <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mb-1.5">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#00E5FF]">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Live Audio Spectrum & Formant Density
                </span>
                <span className="text-[10px] text-white/70 font-mono">{currentItem.pitchAccuracy}</span>
              </div>
              <div className="w-full h-24 rounded-2xl bg-[#06070B] border border-white/10 p-2 flex items-center justify-center relative overflow-hidden shadow-inner">
                <canvas ref={canvasSpectrumRef} width={360} height={80} className="w-full h-full" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 border border-white/15 text-[9px] font-mono text-emerald-400">
                  {currentItem.keySignature}
                </div>
              </div>
            </div>

            {/* Stem Isolator Console (Solo Stems with Real Audio Synthesis) */}
            <div className="flex flex-col gap-2 my-auto">
              <span className="text-[10.5px] uppercase font-bold text-[#E5E7EB] tracking-wider flex items-center gap-1">
                <Disc className="w-3.5 h-3.5 text-[#DF1E76]" />
                Interactive Stem Deconstructor
              </span>

              <div className="grid grid-cols-3 gap-2">
                {/* Vocal Stem Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsolatedStem('VOCAL');
                    playStemAudioTone('VOCAL');
                    showToast('🎙️ Solo Vocal Stem Isolated: Raw Condenser Audio');
                  }}
                  className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col ${
                    isolatedStem === 'VOCAL'
                      ? 'bg-gradient-to-b from-[#3B0E24] to-[#1F0712] border-[#DF1E76] shadow-[0_0_12px_rgba(223,30,118,0.5)]'
                      : 'bg-[#10121C] border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-[11px] font-bold text-white">Vocal Stem</span>
                  <span className="text-[9.5px] text-[#DF1E76] font-medium">Zero Autotune</span>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#DF1E76] h-full w-[92%]" />
                  </div>
                </button>

                {/* Guitar Stem Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsolatedStem('GUITAR');
                    playStemAudioTone('GUITAR');
                    showToast('🎸 Solo Guitar Fret & Resonance Stem Isolated');
                  }}
                  className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col ${
                    isolatedStem === 'GUITAR'
                      ? 'bg-gradient-to-b from-[#3A260C] to-[#1E1305] border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'bg-[#10121C] border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-[11px] font-bold text-white">Guitar Body</span>
                  <span className="text-[9.5px] text-amber-400 font-medium">Wood Resonator</span>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-400 h-full w-[88%]" />
                  </div>
                </button>

                {/* Master Mix Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsolatedStem('ALL');
                    showToast('🎧 Master Stage Mix Restored');
                  }}
                  className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col ${
                    isolatedStem === 'ALL'
                      ? 'bg-gradient-to-b from-[#0E2734] to-[#07151D] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                      : 'bg-[#10121C] border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-[11px] font-bold text-white">Master Mix</span>
                  <span className="text-[9.5px] text-[#00E5FF] font-medium">100% Balanced</span>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#00E5FF] h-full w-[100%]" />
                  </div>
                </button>
              </div>

              {/* Real-time Proof of Craft Badge */}
              <div className="p-2.5 rounded-2xl bg-[#080910] border border-white/10 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white">Analog Craft Verification</span>
                    <p className="text-[9.5px] text-[#9CA3AF]">{currentItem.zeroAutotuneProof}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Bottom Stem Switch to Stage View */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => triggerFlipMode('STAGE')}
                className="w-full h-10 rounded-full bg-white/10 border border-white/20 text-[11.5px] font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Back to Live Stage View</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= LAYER C: BLINDFOLD AUDITION MODE ================= */}
        {viewMode === 'BLINDFOLD' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#130A12] via-[#0E0610] to-[#070308] p-5 flex flex-col justify-between z-10">
            {/* Blindfold Header */}
            <div className="pt-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#DF1E76] to-[#7B1FA2] flex items-center justify-center shadow-[0_0_24px_rgba(223,30,118,0.6)] mb-3">
                <EyeOff className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-brand text-[21px] font-bold text-white">Blindfold Audition Mode</h3>
              <p className="text-[12px] text-[#D1D5DB] max-w-[280px] mt-1 leading-snug">
                Visual identity and follower counts are cryptographically sealed. Listen purely to the raw acoustic one-take.
              </p>
            </div>

            {/* Animated Audio Pulses */}
            <div className="flex items-center justify-center gap-2 my-auto">
              {[40, 70, 100, 60, 90, 45, 80].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-[#DF1E76] to-[#00E5FF] rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            {/* Blindfold Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleJudgeButtonClick}
                className="w-full h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12px] font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {hasJudged ? (
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                ) : (
                  <Star className="w-4 h-4 fill-white text-white" />
                )}
                <span>{hasJudged ? `Judged • ${selectedScore}/10` : 'Judge Performance (1-10)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerFlipMode('STAGE');
                  showToast('Veil shattered! Artist identity revealed.');
                }}
                className="w-full h-10 rounded-full bg-black/40 border border-white/20 text-[11.5px] font-medium text-white flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Flip to Reveal Identity ({currentItem.artistName})</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= CARD TOP CONTROLS (Always Present) ================= */}
        <div className="relative z-20 px-3.5 pt-3.5 flex items-center justify-between">
          {/* Left: Play/Pause + Scrubber Track + Timecode */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                if (isPlaying) {
                  v.pause();
                  setIsPlaying(false);
                } else {
                  v.play().catch(() => {});
                  setIsPlaying(true);
                }
              }}
              className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
            </button>

            {/* Scrubber Bar with Interactive Craft Markers */}
            <div
              onClick={handleScrub}
              className="w-24 sm:w-32 h-[4px] rounded-full bg-white/25 overflow-hidden relative cursor-pointer hover:h-[6px] transition-all"
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, (currentTime / (duration || 60)) * 100))}%`,
                }}
              />
            </div>

            <span className="text-[11px] font-medium text-white/90 tabular-nums">
              {formatSeconds(currentTime)}
            </span>

            <button
              type="button"
              onClick={() => {
                const nextM = !isMuted;
                setIsMuted(nextM);
                showToast(nextM ? 'Audio muted' : 'Live Stage Audio enabled 🔊');
              }}
              className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-[#DF1E76]" /> : <Volume2 className="w-3 h-3 text-white" />}
            </button>
          </div>

          {/* Right: 3-Way INNOVATIVE FLIP MODE SELECTOR PILL */}
          <div className="flex items-center bg-black/55 backdrop-blur-md border border-white/20 rounded-full p-0.5 shadow-md">
            <button
              type="button"
              onClick={() => triggerFlipMode('STAGE')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'STAGE'
                  ? 'bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <FlipsLogoIcon size={12} isActive={viewMode === 'STAGE'} />
              <span>Stage</span>
            </button>

            <button
              type="button"
              onClick={() => triggerFlipMode('STEM_XRAY')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'STEM_XRAY'
                  ? 'bg-[#00E5FF] text-black font-bold shadow-sm'
                  : 'text-[#00E5FF] hover:text-white'
              }`}
            >
              <Layers className="w-2.5 h-2.5" />
              <span>X-Ray</span>
            </button>

            <button
              type="button"
              onClick={() => triggerFlipMode('BLINDFOLD')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'BLINDFOLD'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <EyeOff className="w-2.5 h-2.5" />
              <span>Blind</span>
            </button>
          </div>
        </div>

        {/* ================= KEY MOMENT CRAFT MARKERS ================= */}
        {viewMode === 'STAGE' && (
          <div className="relative z-20 px-4 mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[9.5px] font-bold text-[#00E5FF] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#00E5FF]" />
              Craft Jumps:
            </span>
            {currentItem.craftMarkers.map((m) => (
              <button
                key={m.time}
                type="button"
                onClick={() => jumpToMarker(m)}
                className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 hover:border-[#00E5FF] text-[10px] text-white whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all shadow-sm"
              >
                <span className="text-amber-300 font-mono">00:{m.time.toString().padStart(2, '0')}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Marker Info Toast/Banner */}
        {activeMarkerInfo && viewMode === 'STAGE' && (
          <div className="relative z-20 mx-4 mt-1.5 p-2 rounded-xl bg-black/75 backdrop-blur-md border border-[#00E5FF]/40 flex items-center justify-between text-[11px] animate-in slide-in-from-top-2 duration-150">
            <div>
              <span className="font-bold text-[#00E5FF]">{activeMarkerInfo.label}</span>
              <p className="text-[10px] text-[#D1D5DB] leading-tight">{activeMarkerInfo.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveMarkerInfo(null)}
              className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/70"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ================= BOTTOM METADATA & ACTION BUTTONS ================= */}
        {viewMode === 'STAGE' && (
          <div className="relative z-20 flex items-end justify-between px-4 pb-3 mt-auto">
            {/* Bottom Left: Artist Info & Signature Line */}
            <div className="flex flex-col min-w-0 pr-3">
              <h2
                onClick={() => onOpenProfile('aarav-nair')}
                className="font-brand text-[26px] font-bold text-white leading-tight cursor-pointer hover:text-[#DF1E76] transition-colors truncate"
              >
                {currentItem.artistName}
              </h2>

              <div className="w-9 h-[2.5px] bg-[#DF1E76] rounded-full mt-1 mb-1.5" />

              <div className="flex items-center gap-1.5 text-[12.5px] text-[#D1D5DB] mb-2.5">
                <span>{currentItem.role}</span>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#DF1E76] fill-[#DF1E76]" />
                  <span>{currentItem.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {currentItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[11px] text-white font-medium shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Side Stacked Action Icons (KEEP, TALK, PASS) */}
            <div className="flex flex-col items-center gap-2.5 shrink-0 select-none pb-0.5">
              {/* KEEP */}
              <button
                type="button"
                onClick={() => {
                  const next = !isKept;
                  setIsKept(next);
                  showToast(next ? `Saved ${currentItem.artistName} to shortlist` : 'Removed from shortlist');
                }}
                className={`w-[45px] h-[45px] rounded-full border flex flex-col items-center justify-center transition-all active:scale-90 shadow-md ${
                  isKept
                    ? 'bg-[#DF1E76] border-[#DF1E76] text-white shadow-[0_0_15px_rgba(223,30,118,0.5)]'
                    : 'bg-black/55 backdrop-blur-md border-white/20 text-white/90 hover:border-white/40'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isKept ? 'fill-white' : ''}`} />
                <span className="text-[8.5px] font-bold uppercase tracking-wider mt-0.5">KEEP</span>
              </button>

              {/* TALK */}
              <button
                type="button"
                onClick={() => setIsTalkOpen(true)}
                className="w-[45px] h-[45px] rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white/90 hover:border-white/40 flex flex-col items-center justify-center transition-all active:scale-90 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-[8.5px] font-bold uppercase tracking-wider mt-0.5">TALK</span>
              </button>

              {/* PASS */}
              <button
                type="button"
                onClick={() => {
                  showToast(`Passed on ${currentItem.artistName}`);
                  handleNext();
                }}
                className="w-[45px] h-[45px] rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white/90 hover:border-white/40 flex flex-col items-center justify-center transition-all active:scale-90 shadow-md"
              >
                <X className="w-4 h-4" />
                <span className="text-[8.5px] font-bold uppercase tracking-wider mt-0.5">PASS</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2 & 3: COMPACT NUMBER PICKER PILL ================= */}
        {viewMode === 'STAGE' && isScorePickerOpen && (
          <div className="absolute bottom-[62px] left-1/2 -translate-x-1/2 z-40 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-[46px] py-1 px-1 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.85)] flex flex-col items-center justify-between select-none">
              {/* Up arrow */}
              <button
                type="button"
                onClick={handleScoreUp}
                aria-label="Increase score"
                className="w-8 h-5 flex items-center justify-center text-white/70 hover:text-white active:scale-80 transition-transform cursor-pointer"
              >
                <ChevronUp className="w-4 h-4 text-white stroke-[2.5]" />
              </button>

              {/* Score Number (tap to confirm) */}
              <button
                type="button"
                onClick={() => handleConfirmScore(selectedScore)}
                aria-label="Confirm score"
                className="font-brand text-[24px] font-bold text-white leading-none my-0.5 active:scale-95 transition-transform cursor-pointer"
              >
                {selectedScore}
              </button>

              {/* Down arrow */}
              <button
                type="button"
                onClick={handleScoreDown}
                aria-label="Decrease score"
                className="w-8 h-5 flex items-center justify-center text-white/70 hover:text-white active:scale-80 transition-transform cursor-pointer"
              >
                <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Center Compact Glowing JUDGE Dial Button */}
        {viewMode === 'STAGE' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30">
            <button
              type="button"
              onClick={handleJudgeButtonClick}
              aria-label="Calibrated Judge Button"
              className={`w-[48px] h-[48px] rounded-full border-[1.5px] flex flex-col items-center justify-center text-white active:scale-90 transition-all cursor-pointer shadow-md ${
                hasJudged
                  ? 'bg-gradient-to-b from-[#E91E76] via-[#DF1E76] to-[#880E4F] border-amber-300 shadow-[0_0_20px_rgba(233,30,118,0.8)] ring-1 ring-amber-300/40'
                  : 'bg-gradient-to-b from-[#DF1E76] to-[#A31253] border-pink-300/40 shadow-[0_0_18px_rgba(223,30,118,0.65)]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${hasJudged ? 'fill-amber-300 text-amber-300' : 'fill-white text-white'}`} />
              <span className="text-[8.5px] font-bold tracking-wider uppercase mt-0.5 font-mono">
                {hasJudged ? `${selectedScore}⭐` : 'JUDGE'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 2. "Next talent" Peek Drawer Carousel */}
      <div
        onClick={handleNext}
        className="h-[58px] shrink-0 mt-1.5 px-3 py-1.5 rounded-2xl bg-[#12141D] border border-white/10 hover:border-white/25 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] relative overflow-hidden shadow-lg group"
      >
        <div className="w-9 h-[3px] bg-white/30 rounded-full absolute top-1.5 left-1/2 -translate-x-1/2" />

        <div className="flex flex-col min-w-0 pr-3 pt-0.5">
          <span className="text-[9.5px] text-[#9CA3AF] leading-tight">Next talent</span>
          <span className="text-[12px] font-semibold text-white leading-tight mt-0.5 truncate">
            {currentItem.nextTalent.title}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-16 h-8 rounded-lg overflow-hidden border border-white/15 relative">
            <img
              src={currentItem.nextTalent.thumb}
              alt={currentItem.nextTalent.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* ================= MODAL: VERIFIED TALK CRITIQUES ================= */}
      {isTalkOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-[430px] h-[65vh] bg-[#12141D] border-t border-white/15 rounded-t-3xl p-4 flex flex-col justify-between animate-in slide-in-from-bottom duration-200">
            <div className="flex flex-col">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-2" />
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-[15px] font-bold text-white">Judge Critiques</h3>
                  <p className="text-[11px] text-[#9CA3AF]">{currentItem.artistName} • One-Take</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTalkOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[42vh] pt-3 pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl bg-[#090A0F] border border-white/10">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">{c.author}</span>
                      <span className="text-[#6B7280]">{c.time}</span>
                    </div>
                    <span className="text-[10px] text-[#DF1E76] font-medium">{c.role}</span>
                    <p className="text-[12px] text-[#D1D5DB] mt-1">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentInput.trim()) return;
                setComments((prev) => [
                  ...prev,
                  {
                    id: `c-${Date.now()}`,
                    author: 'You (Calibrated Judge)',
                    role: 'Verified Judge',
                    text: commentInput.trim(),
                    time: 'Just now',
                  },
                ]);
                setCommentInput('');
              }}
              className="pt-2 flex items-center gap-2"
            >
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Leave verified feedback on craft..."
                className="flex-1 h-10 px-4 rounded-full bg-[#090A0F] border border-white/15 text-[12px] text-white focus:outline-none focus:border-[#DF1E76]"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-[#DF1E76] flex items-center justify-center text-white active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
