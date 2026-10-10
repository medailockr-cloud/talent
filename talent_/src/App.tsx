import React, { useState, useRef, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  EyeOff,
  Eye,
  Maximize2,
  Bookmark,
  Send,
  ChevronRight,
  MoreHorizontal,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  Upload,
  Award,
  Flame,
  TrendingUp,
  Share2,
  Lock,
  Unlock,
  Sliders,
  Check,
  Users,
  Heart,
  ChevronUp,
  Star,
} from 'lucide-react';
import { PERFORMANCES_FEED, PerformanceItem } from './utils/stageData';
import { getGeneratedArtworks } from './utils/stageArtwork';
import ArtistProfile from './components/ArtistProfile';
import LiveRoomModal, { RoomData } from './components/LiveRoomModal';
import ShowsScreen from './components/ShowsScreen';
import FlipsScreen from './components/FlipsScreen';
import CreateFlow from './components/CreateFlow';
import { FlipsLogoIcon, ShowsLogoIcon } from './components/icons/NavigationLogos';

const GENRES = [
  'All Genres',
  'Contemporary Dance',
  'Singer-Songwriter',
  'Classical Fusion',
  'Spoken Word',
  'Urban Movement',
  'Cinematic Strings',
  'Vocal Percussion',
  'Jazz & Instrumental',
];

export default function App() {
  const artworks = useMemo(() => getGeneratedArtworks(), []);

  // Performance feed state (with per-item hidden/showing popularity toggle)
  const [feed, setFeed] = useState<PerformanceItem[]>(PERFORMANCES_FEED);
  const [activeFeedTab, setActiveFeedTab] = useState<'For You' | 'Rising' | 'Nearby' | 'Live'>('For You');
  const [popularityFilter, setPopularityFilter] = useState<'ALL' | 'HIDDEN' | 'SHOWING'>('ALL');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'HOME' | 'FLIPS' | 'CREATE' | 'SHOWS' | 'YOU'>('HOME');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [activeLiveRoom, setActiveLiveRoom] = useState<RoomData | null>(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Video playback states
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState<Record<string, { current: number; total: number }>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // User interactions
  const [keptIds, setKeptIds] = useState<Record<string, boolean>>({});
  const [passedIds, setPassedIds] = useState<Record<string, boolean>>({});
  const [judgedScores, setJudgedScores] = useState<
    Record<string, { presence: number; originality: number; craft: number }>
  >({});

  // Score Picker Stepper (as shown in image.png)
  const [activeScorePickerId, setActiveScorePickerId] = useState<string | null>(null);
  const [cardSelectedScores, setCardSelectedScores] = useState<Record<string, number>>({});

  // Modals & Sheets
  const [floatingAppReactions, setFloatingAppReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [talkingItem, setTalkingItem] = useState<PerformanceItem | null>(null);
  const [commentText, setCommentText] = useState('');
  const [customComments, setCustomComments] = useState<
    Record<string, { author: string; role: string; text: string; time: string }[]>
  >({});
  const [fullscreenItem, setFullscreenItem] = useState<PerformanceItem | null>(null);
  const [popularityDetailItem, setPopularityDetailItem] = useState<PerformanceItem | null>(null);
  const [revealPromptItem, setRevealPromptItem] = useState<PerformanceItem | null>(null);
  const [moreMenuItem, setMoreMenuItem] = useState<PerformanceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Toggle play/pause for a specific video card
  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (playingVideoId === id) {
      if (video) video.pause();
      setPlayingVideoId(null);
    } else {
      if (playingVideoId && videoRefs.current[playingVideoId]) {
        videoRefs.current[playingVideoId]?.pause();
      }
      if (video) {
        video.play().catch(() => {});
      }
      setPlayingVideoId(id);
    }
  };

  // Toggle popularity hidden/revealed for a specific performance
  const toggleCardPopularity = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFeed((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isPopularityHidden;
          showToast(
            nextState
              ? `Popularity hidden for ${item.artistName} (Blind Mode)`
              : `Popularity revealed for ${item.artistName} (${item.popularityStats?.votes || '120K'} votes)`
          );
          return { ...item, isPopularityHidden: nextState };
        }
        return item;
      })
    );
  };

  const formatTwoDigits = (sec: number) => {
    const total = Math.floor(sec || 0);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCardScoreUp = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setCardSelectedScores((prev) => ({
      ...prev,
      [itemId]: Math.min(10, (prev[itemId] ?? 8) + 1),
    }));
  };

  const handleCardScoreDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setCardSelectedScores((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] ?? 8) - 1),
    }));
  };

  const handleConfirmCardScore = (item: PerformanceItem, score?: number) => {
    const finalScore = score ?? cardSelectedScores[item.id] ?? 8;
    setJudgedScores((prev) => ({
      ...prev,
      [item.id]: { presence: finalScore, originality: finalScore, craft: finalScore },
    }));
    setFeed((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, isPopularityHidden: false } : f))
    );
    setActiveScorePickerId(null);

    // Floating reaction burst
    const emojis = ['⭐️', '🔥', '👏', '❤️'];
    const newReactions = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      left: 35 + Math.random() * 30,
    }));
    setFloatingAppReactions(newReactions);
    setTimeout(() => setFloatingAppReactions([]), 1400);

    showToast(`Score ${finalScore}/10 saved for ${item.artistName}! Stats unlocked.`);
  };

  const handleCardJudgeClick = (item: PerformanceItem) => {
    if (activeScorePickerId === item.id) {
      handleConfirmCardScore(item);
    } else {
      setActiveScorePickerId(item.id);
      if (cardSelectedScores[item.id] === undefined) {
        setCardSelectedScores((prev) => ({ ...prev, [item.id]: 8 }));
      }
    }
  };

  const toggleJudgeLike = (item: PerformanceItem) => {
    const isCurrentlyJudged = Boolean(judgedScores[item.id]);
    if (isCurrentlyJudged) {
      // Un-judge / un-like
      setJudgedScores((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
      showToast(`Removed score for ${item.artistName}`);
    } else {
      // 1-Tap Like & Judge!
      setJudgedScores((prev) => ({
        ...prev,
        [item.id]: { presence: 10, originality: 10, craft: 10 },
      }));

      // Unlock popularity stats!
      setFeed((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, isPopularityHidden: false } : f))
      );

      // Instagram-style floating reaction emoji burst
      const emojis = ['❤️', '🔥', '⭐️', '👏'];
      const newReactions = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        emoji: emojis[i % emojis.length],
        left: 35 + Math.random() * 30,
      }));
      setFloatingAppReactions(newReactions);
      setTimeout(() => setFloatingAppReactions([]), 1400);

      showToast(`❤️ Judged 10/10 for ${item.artistName} • Stats unlocked!`);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talkingItem || !commentText.trim()) return;
    const newComment = {
      author: 'You',
      role: 'Verified Judge',
      text: commentText.trim(),
      time: 'Just now',
    };
    setCustomComments((prev) => ({
      ...prev,
      [talkingItem.id]: [newComment, ...(prev[talkingItem.id] || [])],
    }));
    setCommentText('');
    showToast('Feedback submitted to artist');
  };

  // Filtered performances: In 'For You', all 13+ performances show continuously!
  const visiblePerformances = useMemo(() => {
    return feed.filter((item) => {
      if (passedIds[item.id]) return false;

      // Filter by tab (For You shows all recommendations)
      if (activeFeedTab !== 'For You') {
        if (item.category !== activeFeedTab) return false;
      }

      // Filter by Popularity visibility
      if (popularityFilter === 'HIDDEN' && !item.isPopularityHidden) return false;
      if (popularityFilter === 'SHOWING' && item.isPopularityHidden) return false;

      // Genre filter
      if (selectedGenre !== 'All Genres' && item.genre !== selectedGenre) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.artistName.toLowerCase().includes(q);
        const matchRole = item.role.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchRole && !matchLoc && !matchTag) return false;
      }
      return true;
    });
  }, [feed, passedIds, activeFeedTab, popularityFilter, selectedGenre, searchQuery]);

  const hiddenCount = feed.filter((p) => p.isPopularityHidden).length;
  const showingCount = feed.filter((p) => !p.isPopularityHidden).length;

  const showRooms: RoomData[] = useMemo(
    () => [
      {
        id: 'south-india-movement',
        title: 'South India Contemporary Movement',
        city: 'Kochi & Bengaluru',
        status: 'Live Now • 8 Finalists',
        votes: '92.4K Votes Cast',
        activeViewers: 3840,
        performerName: 'Kiara Nair',
        performerRole: 'Contemporary Kathak Fusion',
        songTitle: "Ananya's Awakening (One-Take)",
        videoSrc:
          'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
        posterUrl: artworks.kiaraPoster,
        avatarUrl: artworks.kiaraAvatar,
        queue: [
          {
            name: 'Aarav Nair',
            role: 'Acoustic Storyteller',
            time: 'in 4m',
            avatar: artworks.aaravAvatar,
          },
          {
            name: 'Sofia Al-Mansoor',
            role: 'Oud Virtuoso',
            time: 'in 11m',
            avatar:
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          },
        ],
        comments: [
          {
            id: 'c1',
            author: 'Kunal Sen',
            badge: 'Verified Judge',
            text: 'Her balance on the spin was absolute perfection.',
            time: '2m ago',
          },
          {
            id: 'c2',
            author: 'Ananya Rao',
            badge: 'Movement Critic',
            text: 'Flawless mudra transitions, zero studio post-editing.',
            time: '1m ago',
          },
        ],
      },
      {
        id: 'acoustic-storytellers',
        title: 'Acoustic Storytellers One-Take',
        city: 'Pan-India',
        status: 'Popularity Hidden • Pure Craft',
        votes: 'Blind Judging Active',
        activeViewers: 4120,
        performerName: 'Aarav Nair',
        performerRole: 'Singer • Songwriter',
        songTitle: 'Monsoon Motion (Uncut Acoustic)',
        videoSrc:
          'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
        posterUrl: artworks.aaravHero,
        avatarUrl: artworks.aaravAvatar,
        queue: [
          {
            name: 'Reyansh Malik',
            role: 'Spoken Word MC',
            time: 'in 3m',
            avatar:
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Kiara Nair',
            role: 'Contemporary Dancer',
            time: 'in 9m',
            avatar: artworks.kiaraAvatar,
          },
        ],
        comments: [
          {
            id: 'c3',
            author: 'Devika Pillai',
            badge: 'Calibrated Ear',
            text: 'The acoustic warmth in this mic setup is pure gold.',
            time: '3m ago',
          },
          {
            id: 'c4',
            author: 'Rohit Verma',
            badge: 'Folk Judge',
            text: 'Giving this a 9.8 on presence!',
            time: 'Just now',
          },
        ],
      },
      {
        id: 'classical-strings',
        title: 'Classical Strings & Neo-Sufi Room',
        city: 'Jaipur & Delhi',
        status: 'Tonight, 9:00 PM IST',
        votes: '14K RSVP',
        activeViewers: 2890,
        performerName: 'Sofia Al-Mansoor',
        performerRole: 'Arabic Oud Virtuoso',
        songTitle: 'Desert Maqam Hijaz (Live)',
        videoSrc:
          'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-musician-playing-an-acoustic-instrument-42617-large.mp4',
        posterUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
        avatarUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        queue: [
          {
            name: 'Aarav Nair',
            role: 'Singer • Songwriter',
            time: 'in 5m',
            avatar: artworks.aaravAvatar,
          },
          {
            name: 'Kavya S.',
            role: 'Carnatic Violin',
            time: 'in 12m',
            avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          },
        ],
        comments: [
          {
            id: 'c5',
            author: 'Tariq Al-Saleh',
            badge: 'Composer',
            text: 'The microtonal bend on the high string was astonishing.',
            time: '4m ago',
          },
        ],
      },
      {
        id: 'urban-movement',
        title: 'Urban Movement & Break World Series',
        city: 'London & Montreal',
        status: 'Semi-Finals Tomorrow',
        votes: '180K Anticipated',
        activeViewers: 5120,
        performerName: 'Marcus Sterling',
        performerRole: 'Experimental Hip-Hop & Krump',
        songTitle: 'Kinetic Shockwave (Live Battle Take)',
        videoSrc:
          'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-woman-talking-on-stage-with-lights-42534-large.mp4',
        posterUrl:
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        queue: [
          {
            name: 'Kiara Nair',
            role: 'Contemporary Dancer',
            time: 'in 4m',
            avatar: artworks.kiaraAvatar,
          },
          {
            name: 'Reyansh Malik',
            role: 'Spoken Word MC',
            time: 'in 10m',
            avatar:
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
          },
        ],
        comments: [
          {
            id: 'c6',
            author: 'B-Boy Static',
            badge: 'Global Judge',
            text: 'The power freeze transition at 0:24 was monstrous.',
            time: '1m ago',
          },
        ],
      },
    ],
    [artworks]
  );

  if (activeLiveRoom !== null) {
    return (
      <LiveRoomModal
        room={activeLiveRoom}
        artworks={artworks}
        onLeaveRoom={() => setActiveLiveRoom(null)}
        onOpenPerformerProfile={() => {
          setActiveLiveRoom(null);
          setSelectedProfile('aarav-nair');
        }}
      />
    );
  }

  if (selectedProfile !== null) {
    return (
      <div className="min-h-screen w-full bg-[#050608] flex justify-center items-start">
        <ArtistProfile
          artworks={artworks}
          onBack={() => {
            setSelectedProfile(null);
            setActiveBottomTab('HOME');
          }}
          onPlayVideo={(videoSrc, title, duration) => {
            setFullscreenItem({
              id: 'aarav-perf',
              topDuration: duration,
              timecode: `${duration} / ${duration}`,
              totalSeconds: 204,
              initialSeconds: 0,
              artistName: 'Aarav Nair',
              role: 'Singer • Songwriter',
              location: 'Bengaluru, India',
              tags: ['#Original', '#Acoustic', '#Indie'],
              category: 'For You',
              genre: 'Singer-Songwriter',
              videoSrc: videoSrc,
              posterUrl: artworks.aaravHero,
              avatarUrl: artworks.aaravAvatar,
              bio: '“Building a life on stage, one performance at a time.”',
              isPopularityHidden: false,
              popularityStats: {
                votes: '142.8K',
                views: '3.2M',
                rank: '#3 Trending',
                likes: '89.4K',
                trendingTag: 'Top Acoustic Original',
              },
              communityScores: { presence: 9.6, originality: 9.7, craft: 9.8 },
              comments: [],
            });
          }}
        />

        {fullscreenItem && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
            <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
              <div>
                <h3 className="text-[15px] font-semibold text-white">{fullscreenItem.artistName}</h3>
                <p className="text-[12px] text-white/70">{fullscreenItem.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenItem(null)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <video
                src={fullscreenItem.videoSrc}
                poster={fullscreenItem.posterUrl}
                autoPlay
                playsInline
                loop
                controls
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050608] flex justify-center items-start">
      {/* Mobile App Container matching exact reference viewport */}
      <div
        className={`w-full max-w-[430px] ${
          activeBottomTab === 'FLIPS'
            ? 'h-[100dvh] max-h-[920px] overflow-hidden pb-[76px]'
            : 'min-h-screen pb-[86px]'
        } bg-[#0A0B10] text-white relative flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-x-hidden`}
      >
        {/* 1. iOS Status Bar */}
        <div className="px-6 pt-2.5 pb-1 flex items-center justify-between select-none z-20">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">9:41</span>
          <div className="flex items-center gap-1.5">
            {/* Cellular Signal Bars */}
            <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden="true">
              <rect x="0.5" y="7" width="2.8" height="3.5" rx="1" fill="white" />
              <rect x="4.8" y="5" width="2.8" height="5.5" rx="1" fill="white" />
              <rect x="9.1" y="2.5" width="2.8" height="8" rx="1" fill="white" />
              <rect x="13.4" y="0.5" width="2.8" height="10" rx="1" fill="white" />
            </svg>
            {/* Wi-Fi Icon */}
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden="true">
              <path
                d="M8 10.5C8.82843 10.5 9.5 9.82843 9.5 9C9.5 8.17157 8.82843 7.5 8 7.5C7.17157 7.5 6.5 8.17157 6.5 9C6.5 9.82843 7.17157 10.5 8 10.5Z"
                fill="white"
              />
              <path
                d="M4.6 6.7C5.5 5.8 6.7 5.3 8 5.3C9.3 5.3 10.5 5.8 11.4 6.7"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M1.8 3.9C3.4 2.3 5.6 1.4 8 1.4C10.4 1.4 12.6 2.3 14.2 3.9"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {/* Battery Icon */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
              <rect
                x="0.75"
                y="1"
                width="21"
                height="10"
                rx="2.6"
                stroke="white"
                strokeOpacity="0.45"
                strokeWidth="1.1"
              />
              <rect x="2.2" y="2.5" width="17" height="7" rx="1.4" fill="white" />
              <path
                d="M23 4.2V7.8C23.8 7.4 24.3 6.7 24.3 6C24.3 5.3 23.8 4.6 23 4.2Z"
                fill="white"
                fillOpacity="0.5"
              />
            </svg>
          </div>
        </div>

        {/* 2. Top Brand Header */}
        <header className="px-4 pt-1 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab('HOME');
              setActiveFeedTab('For You');
              setPopularityFilter('ALL');
              setSelectedGenre('All Genres');
              setSearchQuery('');
              setSearchOpen(false);
              setPassedIds({});
            }}
            className="text-left focus:outline-none group flex items-baseline"
          >
            <span className="font-brand text-[33px] font-bold tracking-[-0.02em] text-white leading-none">
              talent
            </span>
            <span className="font-brand text-[33px] font-bold text-[#E91E76] leading-none ml-[0.5px]">
              .
            </span>
          </button>

          {activeBottomTab === 'FLIPS' && (
            <div className="flex flex-col items-center select-none animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <FlipsLogoIcon size={16} isActive={true} className="text-[#E91E76]" />
                <span className="text-[12px] font-bold tracking-[0.25em] text-white uppercase">
                  FLIPS
                </span>
              </div>
              <div className="w-8 h-[2.5px] bg-[#E91E76] rounded-full mt-1 shadow-[0_0_8px_rgba(233,30,118,0.6)]" />
            </div>
          )}

          {activeBottomTab === 'SHOWS' && (
            <div className="flex flex-col items-center select-none animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <ShowsLogoIcon size={16} isActive={true} className="text-[#E91E76]" />
                <span className="text-[12px] font-bold tracking-[0.25em] text-white uppercase">
                  SHOWS
                </span>
              </div>
              <div className="w-8 h-[2.5px] bg-[#E91E76] rounded-full mt-1 shadow-[0_0_8px_rgba(233,30,118,0.6)]" />
            </div>
          )}

          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search performances"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#E5E7EB] hover:text-white active:scale-95 transition-transform"
            >
              <Search className="w-[23px] h-[23px] stroke-[1.8]" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedProfile('aarav-nair')}
              aria-label="Your Profile"
              className="w-[38px] h-[38px] rounded-full overflow-hidden border border-white/20 active:scale-95 transition-transform shrink-0"
            >
              <img
                src={artworks.aaravAvatar}
                alt="Aarav Nair profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* Search Bar (expands when search icon tapped) */}
        {searchOpen && (
          <div className="px-4 pb-2.5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists, dance, sufi, rap, saxophone..."
                autoFocus
                className="w-full h-9 pl-9 pr-8 rounded-full bg-[#151720] border border-white/15 text-[13px] text-white placeholder-[#7C8495] focus:outline-none focus:border-[#E91E76]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#9CA3AF] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Horizontal Filter Pills Row (Shown only on HOME feed) */}
        {activeBottomTab === 'HOME' && (
          <>
            <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar relative">
              {(['For You', 'Rising', 'Nearby', 'Live'] as const).map((tab) => {
                const isActive = activeFeedTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveFeedTab(tab);
                      setActiveBottomTab('HOME');
                    }}
                    className={`h-[34px] px-4 rounded-full text-[12.5px] flex items-center justify-center whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-gradient-to-b from-[#42112B] to-[#240918] border-[1.5px] border-[#E52177] shadow-[0_0_12px_rgba(229,33,119,0.3)] text-white font-semibold'
                        : 'bg-[#13151C] border border-[#252834] text-[#D1D5DB] font-medium hover:border-white/20'
                    }`}
                  >
                    <span>{tab}</span>
                    {tab === 'Live' && (
                      <span className="w-[6px] h-[6px] rounded-full bg-[#EC267F] ml-1.5 -mt-1.5 shrink-0 animate-ping" />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setGenreMenuOpen((prev) => !prev)}
                className={`h-[34px] px-3.5 rounded-full text-[12.5px] flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  selectedGenre !== 'All Genres'
                    ? 'bg-gradient-to-b from-[#42112B] to-[#240918] border-[1.5px] border-[#E52177] text-white font-semibold'
                    : 'bg-[#13151C] border border-[#252834] text-[#D1D5DB] font-medium hover:border-white/20'
                }`}
              >
                <span>{selectedGenre}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>
            </div>

            {/* Popularity Mode Switcher Sub-Bar (Allows easy toggling to see Hidden vs Showing) */}
            <div className="px-4 pb-2.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[#8E95A5] font-medium">Filter:</span>
                <button
                  type="button"
                  onClick={() => setPopularityFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    popularityFilter === 'ALL'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  All ({feed.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPopularityFilter('HIDDEN')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                    popularityFilter === 'HIDDEN'
                      ? 'bg-pink-950/80 text-pink-300 border border-pink-700/60 font-semibold'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3 h-3 text-[#E91E76]" />
                  <span>Hidden ({hiddenCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPopularityFilter('SHOWING')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                    popularityFilter === 'SHOWING'
                      ? 'bg-gradient-to-r from-amber-950 to-pink-950 text-amber-200 border border-amber-600/50 font-semibold'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Showing ({showingCount})</span>
                </button>
              </div>

              <span className="text-[#7C8495] text-[10px]">
                {visiblePerformances.length} takes
              </span>
            </div>

            {/* Genre Dropdown Menu */}
            {genreMenuOpen && (
              <div className="mx-4 mb-3 p-1.5 rounded-2xl bg-[#141722] border border-white/15 shadow-2xl flex flex-wrap gap-1.5 z-30">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => {
                      setSelectedGenre(genre);
                      setGenreMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                      selectedGenre === genre
                        ? 'bg-[#E52177] text-white'
                        : 'bg-[#0E1017] text-[#D1D5DB] hover:bg-white/10'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* 4. Main Feed Section with continuous rich performance cards */}
        {activeBottomTab === 'HOME' && (
          <main className="flex-1 flex flex-col gap-3.5 px-4">
            {visiblePerformances.map((item, idx) => {
              const isPlaying = playingVideoId === item.id;
              const isKept = !!keptIds[item.id];
              const userScore = judgedScores[item.id];
              const prog = videoProgress[item.id] || { current: item.initialSeconds, total: item.totalSeconds };

              return (
                <article
                  key={item.id}
                  className={`flex flex-col ${
                    idx < visiblePerformances.length - 1
                      ? 'pb-3.5 border-b border-white/[0.08]'
                      : 'pb-2'
                  }`}
                >
                  {/* Real Video / Stage Player Frame */}
                  <div className="relative w-full aspect-[16/9.35] rounded-[18px] overflow-hidden border border-white/15 bg-[#100C09] shadow-lg group">
                    {/* HTML5 Real Video Player */}
                    <video
                      ref={(el) => {
                        videoRefs.current[item.id] = el;
                      }}
                      src={item.videoSrc}
                      poster={
                        item.id === 'kiara-nair'
                          ? artworks.kiaraPoster
                          : item.id === 'aarav-nair'
                          ? artworks.aaravHero
                          : item.posterUrl
                      }
                      playsInline
                      loop
                      muted={isMuted}
                      onTimeUpdate={(e) => {
                        const v = e.currentTarget;
                        setVideoProgress((prev) => ({
                          ...prev,
                          [item.id]: { current: v.currentTime, total: v.duration || 60 },
                        }));
                      }}
                      onClick={() => togglePlay(item.id)}
                      className="w-full h-full object-cover cursor-pointer"
                    />

                    {/* Top Scrim */}
                    <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

                    {/* Bottom Scrim */}
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                    {/* Top-Left: PERFORMANCE • 0:58 */}
                    <div className="absolute top-3 left-3.5 flex items-center gap-2 text-[10.5px] font-medium tracking-[0.11em] text-white/95 uppercase select-none">
                      <span>PERFORMANCE</span>
                      <span className="text-white/80">•</span>
                      <span className="tabular-nums">
                        {isPlaying ? formatTwoDigits(prog.current) : item.topDuration}
                      </span>
                    </div>

                    {/* Top-Right: Working Popularity Badge (Hidden vs Showing) */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {item.isPopularityHidden ? (
                        // 1. POPULARITY HIDDEN BADGE (Tapping gives option to reveal or judge blind)
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevealPromptItem(item);
                          }}
                          title="Popularity is hidden for blind evaluation. Click to inspect or reveal."
                          className="h-[26px] px-2.5 rounded-[7px] bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1.5 hover:bg-black/85 transition-colors group/badge"
                        >
                          <EyeOff className="w-[12px] h-[12px] text-white/85 stroke-[1.8] group-hover/badge:text-[#E91E76] transition-colors" />
                          <span className="text-[9.5px] font-medium tracking-[0.09em] text-white/90 uppercase whitespace-nowrap">
                            POPULARITY HIDDEN
                          </span>
                        </button>
                      ) : (
                        // 2. REVEALED POPULARITY BADGE (Showing real live votes and ranks)
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopularityDetailItem(item);
                          }}
                          title="Click to view detailed popularity and heat analytics"
                          className="h-[26px] px-2.5 rounded-[7px] bg-gradient-to-r from-[#9C1958]/90 to-[#E91E76]/90 backdrop-blur-md border border-[#F43F8E]/70 flex items-center gap-1.5 hover:brightness-110 shadow-[0_0_14px_rgba(233,30,118,0.5)] transition-all"
                        >
                          <Flame className="w-[12px] h-[12px] text-amber-300 fill-amber-300 animate-pulse" />
                          <span className="text-[9.5px] font-semibold tracking-[0.08em] text-white uppercase whitespace-nowrap">
                            {item.popularityStats?.votes} VOTES
                          </span>
                          <span className="text-white/60 text-[9px]">•</span>
                          <span className="text-[9px] font-medium text-pink-200">
                            {item.popularityStats?.rank || 'TOP 1%'}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Center Play / Pause Button */}
                    <button
                      type="button"
                      onClick={() => togglePlay(item.id)}
                      aria-label={isPlaying ? `Pause ${item.artistName}` : `Play ${item.artistName}`}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full bg-black/45 backdrop-blur-[2px] border-[1.5px] border-white/85 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-white" />
                      ) : (
                        <svg
                          width="20"
                          height="22"
                          viewBox="0 0 20 22"
                          fill="none"
                          className="ml-1"
                        >
                          <path
                            d="M2.5 1.8L18.2 11L2.5 20.2V1.8Z"
                            fill="white"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Audio Mute/Unmute quick toggle when playing */}
                    {isPlaying && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted((prev) => !prev);
                        }}
                        className="absolute bottom-2.5 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-md border border-[#E91E76]/50 text-[10px] text-white hover:bg-black/85"
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-3 h-3 text-[#E91E76]" />
                            <span>Unmute</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-[#E91E76] animate-pulse" />
                            <span>Live Sound</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Bottom-Right: Expand + Duration Pill */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFullscreenItem(item)}
                        aria-label="Expand full screen"
                        className="w-[27px] h-[27px] rounded-[7px] bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-transform"
                      >
                        <Maximize2 className="w-[13px] h-[13px] stroke-[2]" />
                      </button>

                      <div className="h-[27px] px-2.5 rounded-[7px] bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-[11px] font-medium tabular-nums tracking-[0.05em] text-white/95 select-none">
                        {isPlaying ? `${formatTwoDigits(prog.current)} / 01:00` : item.timecode}
                      </div>
                    </div>
                  </div>

                  {/* Artist Details Row */}
                  <div className="mt-2.5 flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(item.id)}
                        className="w-[46px] h-[46px] rounded-full overflow-hidden border border-white/15 shrink-0 focus:outline-none active:scale-95 transition-transform"
                      >
                        <img
                          src={
                            item.id === 'kiara-nair'
                              ? artworks.kiaraAvatar
                              : item.id === 'aarav-nair'
                              ? artworks.aaravAvatar
                              : item.avatarUrl
                          }
                          alt={item.artistName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>

                      <div
                        className="flex flex-col min-w-0 cursor-pointer"
                        onClick={() => setSelectedProfile(item.id)}
                      >
                        <div className="flex items-center gap-2">
                          <h2 className="text-[15.5px] font-semibold text-white leading-tight truncate hover:text-[#E91E76] transition-colors">
                            {item.artistName}
                          </h2>
                          {!item.isPopularityHidden ? (
                            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-amber-300" />
                              Revealed
                            </span>
                          ) : (
                            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-medium">
                              Blind
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[12.5px] text-[#9CA3AF] mt-0.5 truncate">
                          <span className="truncate">{item.role}</span>
                          <span className="text-[#6B7280]">•</span>
                          {/* Solid drop pin icon matching screenshot */}
                          <svg
                            width="11"
                            height="13"
                            viewBox="0 0 12 14"
                            fill="none"
                            className="shrink-0 text-[#9CA3AF]"
                          >
                            <path
                              d="M6 0.5C3.24 0.5 1 2.74 1 5.5C1 9.25 6 13.5 6 13.5C6 13.5 11 9.25 11 5.5C11 2.74 8.76 0.5 6 0.5ZM6 7.25C5.03 7.25 4.25 6.47 4.25 5.5C4.25 4.53 5.03 3.75 6 3.75C6.97 3.75 7.75 4.53 7.75 5.5C7.75 6.47 6.97 7.25 6 7.25Z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="truncate">{item.location}</span>
                        </div>

                        {/* Popularity Metrics preview or Blind indicator */}
                        {!item.isPopularityHidden && item.popularityStats ? (
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#E5E7EB] font-medium flex-wrap">
                            <span className="text-amber-300 font-semibold flex items-center gap-0.5">
                              🔥 {item.popularityStats.votes} Votes
                            </span>
                            <span className="text-white/40">•</span>
                            <span className="text-pink-300">{item.popularityStats.likes} Likes</span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/80">{item.popularityStats.rank}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-[#7C8495]">
                            <Lock className="w-2.5 h-2.5 text-[#E91E76]" />
                            <span>Blind Mode: metrics revealed upon judging</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2.5 mt-1 text-[11.5px] text-[#7C8495] flex-wrap">
                          {item.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSearchQuery(tag);
                                setSearchOpen(true);
                              }}
                              className="hover:text-[#D1D5DB] transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMoreMenuItem(item)}
                      aria-label="More options"
                      className="w-[30px] h-[30px] rounded-full bg-[#171922] border border-white/[0.06] flex items-center justify-center text-[#9CA3AF] hover:text-white shrink-0 mt-1"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions & Judging Row */}
                  <div className="mt-3 flex items-center justify-between">
                    {/* Left: KEEP | TALK | PASS with vertical separators */}
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isKept;
                          setKeptIds((prev) => ({ ...prev, [item.id]: nextState }));
                          showToast(
                            nextState
                              ? `Kept ${item.artistName}'s performance in Saved`
                              : `Removed ${item.artistName} from Saved`
                          );
                        }}
                        className="pr-3.5 py-1 flex flex-col items-center justify-center gap-1 group min-w-[48px]"
                      >
                        <Bookmark
                          className={`w-[19px] h-[19px] stroke-[1.7] transition-colors ${
                            isKept
                              ? 'text-[#E91E76] fill-[#E91E76]'
                              : 'text-[#E5E7EB] group-hover:text-white'
                          }`}
                        />
                        <span
                          className={`text-[9.5px] font-medium tracking-[0.1em] uppercase ${
                            isKept ? 'text-[#E91E76]' : 'text-[#9CA3AF]'
                          }`}
                        >
                          KEEP
                        </span>
                      </button>

                      <div className="h-7 w-[1px] bg-white/[0.09]" />

                      <button
                        type="button"
                        onClick={() => setTalkingItem(item)}
                        className="px-3.5 py-1 flex flex-col items-center justify-center gap-1 group min-w-[52px]"
                      >
                        {/* Custom speech bubble with 3 dots */}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-[#E5E7EB] group-hover:text-white transition-colors"
                        >
                          <path
                            d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5887 20 9.25285 19.6932 8.06498 19.1467L3 20.5L4.46249 16.1125C3.53677 14.7911 3 13.2082 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="8.5" cy="11.5" r="1.1" fill="currentColor" />
                          <circle cx="12" cy="11.5" r="1.1" fill="currentColor" />
                          <circle cx="15.5" cy="11.5" r="1.1" fill="currentColor" />
                        </svg>
                        <span className="text-[9.5px] font-medium tracking-[0.1em] text-[#9CA3AF] uppercase">
                          TALK
                        </span>
                      </button>

                      <div className="h-7 w-[1px] bg-white/[0.09]" />

                      <button
                        type="button"
                        onClick={() => {
                          setPassedIds((prev) => ({ ...prev, [item.id]: true }));
                          showToast(`Passed ${item.artistName}`);
                        }}
                        className="px-3.5 py-1 flex flex-col items-center justify-center gap-1 group min-w-[52px]"
                      >
                        <Send className="w-[18px] h-[18px] text-[#E5E7EB] stroke-[1.7] group-hover:text-white transition-colors" />
                        <span className="text-[9.5px] font-medium tracking-[0.1em] text-[#9CA3AF] uppercase">
                          PASS
                        </span>
                      </button>

                      <div className="h-7 w-[1px] bg-white/[0.09]" />
                    </div>

                    {/* Right: COMPACT JUDGE BUTTON & STEPPER */}
                    <div className="relative flex flex-col items-end pl-2">
                      {/* Step 2 & 3 Floating Number Pill */}
                      {activeScorePickerId === item.id && (
                        <div className="absolute bottom-[38px] right-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                          <div className="w-[46px] py-1 px-1 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.85)] flex flex-col items-center justify-between select-none">
                            <button
                              type="button"
                              onClick={(e) => handleCardScoreUp(e, item.id)}
                              className="w-8 h-5 flex items-center justify-center text-white/70 hover:text-white active:scale-80 cursor-pointer"
                            >
                              <ChevronUp className="w-4 h-4 text-white stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmCardScore(item)}
                              className="font-brand text-[24px] font-bold text-white leading-none my-0.5 active:scale-95 cursor-pointer"
                            >
                              {cardSelectedScores[item.id] ?? 8}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleCardScoreDown(e, item.id)}
                              className="w-8 h-5 flex items-center justify-center text-white/70 hover:text-white active:scale-80 cursor-pointer"
                            >
                              <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCardJudgeClick(item)}
                        className="h-[30px] px-3 rounded-full bg-gradient-to-r from-[#4E1133] via-[#981856] to-[#DF1E76] border border-[#F43F8E]/70 shadow-[0_0_12px_rgba(223,30,118,0.3)] flex items-center gap-1.5 active:scale-[0.98] transition-transform cursor-pointer shrink-0"
                      >
                        {/* Speedometer gauge icon */}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-white shrink-0"
                        >
                          <path
                            d="M12 4C6.48 4 2 8.48 2 14C2 16.25 2.74 18.32 4 20H20C21.26 18.32 22 16.25 22 14C22 8.48 17.52 4 12 4Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 14L15.5 9.5"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                          />
                          <circle cx="12" cy="14" r="1.6" fill="currentColor" />
                        </svg>

                        <span className="text-[10px] font-bold tracking-[0.06em] text-white uppercase whitespace-nowrap">
                          {userScore
                            ? `JUDGED • ${userScore.craft} ⭐`
                            : 'JUDGE'}
                        </span>

                        <ChevronRight className="w-[12px] h-[12px] text-white stroke-[2.2] shrink-0" />
                      </button>

                      <span className="mt-0.5 text-[9px] text-[#8E95A5] select-none text-right pr-1">
                        {userScore ? 'Score saved' : 'Presence • Craft'}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}

            {visiblePerformances.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <p className="text-[14px] text-[#9CA3AF]">No performances match the current filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPassedIds({});
                    setActiveFeedTab('For You');
                    setPopularityFilter('ALL');
                    setSelectedGenre('All Genres');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-full bg-[#E91E76] text-white text-[12px] font-semibold"
                >
                  Reset Feed
                </button>
              </div>
            )}
          </main>
        )}

        {/* CREATE Tab - Complete 10-Screen Creation Flow from image.png */}
        {activeBottomTab === 'CREATE' && (
          <CreateFlow
            onBackToHome={() => setActiveBottomTab('HOME')}
            onPublishSuccess={(newPerformance) => {
              setFeed((prev) => [newPerformance, ...prev]);
              setActiveBottomTab('HOME');
              setPlayingVideoId(newPerformance.id);
              showToast(`🎉 "${newPerformance.genre}" live! Viewers can now judge your take.`);
            }}
          />
        )}

        {/* FLIPS Tab - Fullscreen vertical one-take video feed matching screenshot */}
        {activeBottomTab === 'FLIPS' && (
          <FlipsScreen
            artworks={artworks}
            onOpenProfile={(id) => setSelectedProfile(id)}
            onSearchClick={() => setSearchOpen((prev) => !prev)}
          />
        )}

        {/* SHOWS Tab - Exactly matching the designer show screen */}
        {activeBottomTab === 'SHOWS' && (
          <ShowsScreen
            artworks={artworks}
            rooms={showRooms}
            onEnterRoom={(room) => setActiveLiveRoom(room)}
            onOpenProfile={(id) => setSelectedProfile(id)}
          />
        )}

        {/* YOU Tab */}
        {activeBottomTab === 'YOU' && (
          <div className="flex-1 px-4 py-3 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-[#13151D] border border-white/10 flex items-center gap-3.5">
              <img
                src={artworks.userAvatar}
                alt="Your profile"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border border-white/20"
              />
              <div>
                <h2 className="text-[16px] font-semibold text-white">Ananya Krishnan</h2>
                <p className="text-[12px] text-[#9CA3AF]">Calibrated Ear & Movement Judge • India</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#D1D5DB]">
                  <span>{Object.keys(judgedScores).length + 22} Judged</span>
                  <span>•</span>
                  <span>{Object.values(keptIds).filter(Boolean).length + 10} Kept</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#13151D] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
                <Award className="w-4 h-4 text-[#E91E76]" />
                <span>Blind Judging Accuracy</span>
              </div>
              <p className="text-[12px] text-[#9CA3AF]">
                Your scores match elite peer judges within 0.2 variance without knowing popularity metrics beforehand.
              </p>
            </div>
          </div>
        )}

        {/* 5. Fixed Bottom Navigation Bar + iOS Home Indicator */}
        <nav
          aria-label="Bottom Navigation"
          className="fixed bottom-0 w-full max-w-[430px] bg-[#0B0D13]/95 backdrop-blur-xl border-t border-white/[0.08] pt-2 pb-1.5 px-6 z-30 select-none"
        >
          <div className="grid grid-cols-5 items-start">
            {/* HOME */}
            <button
              type="button"
              onClick={() => setActiveBottomTab('HOME')}
              className="flex flex-col items-center justify-center group"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                className={activeBottomTab === 'HOME' ? 'text-white' : 'text-[#8E95A5]'}
              >
                <path
                  d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15C15 14.4477 14.5523 14 14 14H10C9.44772 14 9 14.4477 9 15V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`text-[10px] tracking-[0.02em] mt-1 ${
                  activeBottomTab === 'HOME' ? 'text-white font-semibold' : 'text-[#8E95A5]'
                }`}
              >
                Home
              </span>
            </button>

            {/* FLIPS */}
            <button
              type="button"
              onClick={() => setActiveBottomTab('FLIPS')}
              className="flex flex-col items-center justify-center group active:scale-95 transition-transform"
            >
              <FlipsLogoIcon
                size={22}
                isActive={activeBottomTab === 'FLIPS'}
                className={activeBottomTab === 'FLIPS' ? 'text-[#E91E76]' : 'text-[#8E95A5]'}
              />
              <span
                className={`text-[10px] tracking-[0.02em] mt-1 ${
                  activeBottomTab === 'FLIPS' ? 'text-[#E91E76] font-semibold' : 'text-[#8E95A5]'
                }`}
              >
                Flips
              </span>
              <span
                className={`w-[4.5px] h-[4.5px] rounded-full mt-0.5 ${
                  activeBottomTab === 'FLIPS' ? 'bg-[#E91E76]' : 'bg-transparent'
                }`}
              />
            </button>

            {/* CREATE */}
            <button
              type="button"
              onClick={() => setActiveBottomTab('CREATE')}
              className="flex flex-col items-center justify-center group"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                className={activeBottomTab === 'CREATE' ? 'text-white' : 'text-[#8E95A5]'}
              >
                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 8V16M8 12H16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`text-[10px] tracking-[0.02em] mt-1 ${
                  activeBottomTab === 'CREATE' ? 'text-white font-semibold' : 'text-[#8E95A5]'
                }`}
              >
                Create
              </span>
            </button>

            {/* SHOWS */}
            <button
              type="button"
              onClick={() => setActiveBottomTab('SHOWS')}
              className="flex flex-col items-center justify-center group active:scale-95 transition-transform"
            >
              <ShowsLogoIcon
                size={22}
                isActive={activeBottomTab === 'SHOWS'}
                className={activeBottomTab === 'SHOWS' ? 'text-[#E91E76]' : 'text-[#8E95A5]'}
              />
              <span
                className={`text-[10px] tracking-[0.02em] mt-1 ${
                  activeBottomTab === 'SHOWS'
                    ? 'text-[#E91E76] font-semibold'
                    : 'text-[#8E95A5]'
                }`}
              >
                Shows
              </span>
              <span
                className={`w-[4.5px] h-[4.5px] rounded-full mt-0.5 ${
                  activeBottomTab === 'SHOWS' ? 'bg-[#E91E76]' : 'bg-transparent'
                }`}
              />
            </button>

            {/* YOU */}
            <button
              type="button"
              onClick={() => setSelectedProfile('aarav-nair')}
              className="flex flex-col items-center justify-center group"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                className={activeBottomTab === 'YOU' ? 'text-[#E91E76]' : 'text-[#8E95A5]'}
              >
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`text-[10px] tracking-[0.02em] mt-1 ${
                  activeBottomTab === 'YOU'
                    ? 'text-[#E91E76] font-semibold'
                    : 'text-[#8E95A5]'
                }`}
              >
                You
              </span>
            </button>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="w-[134px] h-[4.5px] bg-white rounded-full mx-auto mt-1.5" />
        </nav>

        {/* MODAL: PROMPT TO REVEAL POPULARITY ON A HIDDEN CARD */}
        {revealPromptItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-[380px] bg-[#131620] border border-white/15 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-[#E91E76]">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-white">Blind Judging Mode</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRevealPromptItem(null)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[13px] text-[#9CA3AF] leading-relaxed">
                Popularity metrics for <span className="text-white font-semibold">{revealPromptItem.artistName}</span> are concealed to ensure you evaluate their craft without popularity bias.
              </div>

              <div className="p-3 rounded-2xl bg-[#0B0D13] border border-white/[0.08] flex items-center justify-between">
                <span className="text-[12px] text-[#D1D5DB]">Status</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-900/40 text-pink-300 border border-pink-700/50 font-medium">
                  Concealed (Blind Test)
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleCardPopularity(revealPromptItem.id);
                    setRevealPromptItem(null);
                  }}
                  className="w-full h-11 rounded-full bg-gradient-to-r from-[#4E1133] via-[#981856] to-[#DF1E76] border border-[#F43F8E]/70 text-[12.5px] font-semibold tracking-wide text-white uppercase shadow-lg"
                >
                  Reveal Popularity Stats
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const item = revealPromptItem;
                    setRevealPromptItem(null);
                    toggleJudgeLike(item);
                  }}
                  className="w-full h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[12px] font-medium text-white flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-[#E91E76] fill-[#E91E76]" />
                  <span>Like & Judge Performance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: POPULARITY BREAKDOWN MODAL (FOR SHOWING CARDS) */}
        {popularityDetailItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-[380px] bg-[#131620] border border-white/15 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h3 className="text-[16px] font-semibold text-white">Popularity & Heat Stats</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPopularityDetailItem(null)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#0B0D13] border border-white/[0.08] flex items-center gap-3">
                <img
                  src={
                    popularityDetailItem.id === 'kiara-nair'
                      ? artworks.kiaraAvatar
                      : popularityDetailItem.id === 'arjun-menon'
                      ? artworks.arjunAvatar
                      : popularityDetailItem.avatarUrl
                  }
                  alt={popularityDetailItem.artistName}
                  className="w-12 h-12 rounded-full object-cover border border-white/15"
                />
                <div>
                  <h4 className="text-[15px] font-semibold text-white">
                    {popularityDetailItem.artistName}
                  </h4>
                  <p className="text-[12px] text-[#9CA3AF]">{popularityDetailItem.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0B0D13] border border-white/[0.07] flex flex-col">
                  <span className="text-[10.5px] uppercase tracking-wider text-[#8E95A5]">Total Votes</span>
                  <span className="text-[18px] font-bold text-white mt-1">
                    {popularityDetailItem.popularityStats?.votes || '142.8K'}
                  </span>
                  <span className="text-[10px] text-green-400 mt-0.5">+14% this week</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0D13] border border-white/[0.07] flex flex-col">
                  <span className="text-[10.5px] uppercase tracking-wider text-[#8E95A5]">Views</span>
                  <span className="text-[18px] font-bold text-white mt-1">
                    {popularityDetailItem.popularityStats?.views || '1.2M'}
                  </span>
                  <span className="text-[10px] text-[#E91E76] mt-0.5">High Viral Heat</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0D13] border border-white/[0.07] flex flex-col">
                  <span className="text-[10.5px] uppercase tracking-wider text-[#8E95A5]">Leaderboard</span>
                  <span className="text-[18px] font-bold text-amber-300 mt-1">
                    {popularityDetailItem.popularityStats?.rank || '#3 Trending'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0D13] border border-white/[0.07] flex flex-col">
                  <span className="text-[10.5px] uppercase tracking-wider text-[#8E95A5]">Audience Likes</span>
                  <span className="text-[18px] font-bold text-white mt-1">
                    {popularityDetailItem.popularityStats?.likes || '89.4K'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleCardPopularity(popularityDetailItem.id);
                  setPopularityDetailItem(null);
                }}
                className="w-full h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[12px] font-medium text-white flex items-center justify-center gap-2"
              >
                <EyeOff className="w-4 h-4 text-[#E91E76]" />
                <span>Switch to Blind Mode (Hide Popularity)</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL: TALK / FEEDBACK COMMENTS DRAWER */}
        {talkingItem && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-[430px] max-h-[85vh] bg-[#12141C] border-t border-white/15 rounded-t-3xl p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200 overflow-hidden">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-white">
                    Feedback for {talkingItem.artistName}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                    Constructive Only
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTalkingItem(null)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 py-1 pr-1 max-h-[320px]">
                {(customComments[talkingItem.id] || []).concat(talkingItem.comments).map((cmt, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#0A0C12] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-[11.5px] mb-1">
                      <span className="font-semibold text-white">{cmt.author}</span>
                      <span className="text-[#8E95A5]">{cmt.time}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#E91E76] uppercase tracking-wider block mb-1">
                      {cmt.role}
                    </span>
                    <p className="text-[12.5px] text-[#D1D5DB] leading-relaxed">{cmt.text}</p>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave craft notes or movement critique..."
                  className="flex-1 h-10 px-4 rounded-full bg-[#0A0C12] border border-white/15 text-[12.5px] text-white placeholder-[#7C8495] focus:outline-none focus:border-[#E91E76]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="h-10 px-4 rounded-full bg-[#E91E76] disabled:opacity-40 text-white text-[12px] font-semibold"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FULLSCREEN VIDEO PLAYER */}
        {fullscreenItem && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
            <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
              <div>
                <h3 className="text-[15px] font-semibold text-white">{fullscreenItem.artistName}</h3>
                <p className="text-[12px] text-white/70">{fullscreenItem.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenItem(null)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <video
                src={fullscreenItem.videoSrc}
                poster={
                  fullscreenItem.id === 'kiara-nair'
                    ? artworks.kiaraPoster
                    : fullscreenItem.id === 'arjun-menon'
                    ? artworks.arjunPoster
                    : fullscreenItem.posterUrl
                }
                autoPlay
                playsInline
                loop
                controls
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between">
              <div className="text-[12px] text-white/80">
                {fullscreenItem.isPopularityHidden ? (
                  <span className="flex items-center gap-1.5 text-white/90">
                    <EyeOff className="w-3.5 h-3.5 text-[#E91E76]" /> Popularity Hidden • Blind Judge
                  </span>
                ) : (
                  <span className="text-[#E91E76] font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    {fullscreenItem.popularityStats?.votes} Votes Cast
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleJudgeLike(fullscreenItem);
                  setFullscreenItem(null);
                }}
                className="px-4 py-2 rounded-full bg-[#E91E76] text-white text-[12px] font-semibold flex items-center gap-1.5 active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
                <span>Like & Judge</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL: MORE OPTIONS SHEET */}
        {moreMenuItem && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-[430px] bg-[#12141C] border-t border-white/15 rounded-t-3xl p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h3 className="text-[15px] font-semibold text-white">{moreMenuItem.artistName}</h3>
                <button
                  type="button"
                  onClick={() => setMoreMenuItem(null)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[12.5px] text-[#9CA3AF] leading-relaxed py-1">
                {moreMenuItem.bio}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleCardPopularity(moreMenuItem.id);
                    setMoreMenuItem(null);
                  }}
                  className="w-full h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-left text-[13px] text-white flex items-center justify-between"
                >
                  <span>
                    {moreMenuItem.isPopularityHidden ? 'Reveal Popularity Stats' : 'Hide Popularity (Blind Mode)'}
                  </span>
                  {moreMenuItem.isPopularityHidden ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-pink-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Share link copied for ${moreMenuItem.artistName}`);
                    setMoreMenuItem(null);
                  }}
                  className="w-full h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-left text-[13px] text-white flex items-center justify-between"
                >
                  <span>Share 60-Second Take</span>
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Instagram-style reaction emojis */}
        {floatingAppReactions.map((r) => (
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

        {/* FULLSCREEN ARTIST PROFILE OVERLAY */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 bg-[#07080C] overflow-y-auto flex justify-center animate-in slide-in-from-right duration-200">
            <div className="w-full max-w-[430px] min-h-screen">
              <ArtistProfile
                artworks={artworks}
                onBack={() => setSelectedProfile(null)}
                onPlayVideo={(videoSrc, title, duration) => {
                  setFullscreenItem({
                    id: 'artist-preview',
                    artistName: 'Aarav Nair',
                    role: 'Singer-Songwriter',
                    videoSrc,
                    posterUrl: artworks.aaravHero,
                    avatarUrl: artworks.aaravAvatar,
                    location: 'Kochi, India',
                    isPopularityHidden: false,
                    topDuration: duration,
                    timecode: `${duration} / ${duration}`,
                    totalSeconds: 60,
                    initialSeconds: 10,
                    genre: 'Singer-Songwriter',
                    category: 'For You',
                    bio: 'Independent acoustic singer-songwriter.',
                    tags: ['#Acoustic', '#Original'],
                    communityScores: { presence: 9.2, originality: 9.4, craft: 9.6 },
                    comments: [],
                  });
                }}
              />
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#181C26]/95 border border-[#E91E76]/50 shadow-2xl backdrop-blur-md text-[12px] font-medium text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <Sparkles className="w-3.5 h-3.5 text-[#E91E76]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
