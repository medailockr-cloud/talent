import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Share2,
  MoreHorizontal,
  Star,
  BarChart2,
  Calendar,
  Users,
  Heart,
  Play,
  Pause,
  MapPin,
  Plus,
  ChevronRight,
  User,
  X,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Bookmark,
  Eye,
  EyeOff,
  ShieldCheck,
  Music,
  Clock,
  MessageCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Award,
  Flame,
  TrendingUp,
  Ticket,
  Compass,
  Navigation,
  Camera,
  ThumbsUp,
  Radio,
  CheckCircle,
} from 'lucide-react';
import { GeneratedArtworks } from '../utils/stageArtwork';

export interface ProfilePerformanceItem {
  id: string;
  title: string;
  videoSrc: string;
  thumb: string;
  duration: string;
  genre: string;
  views: string;
  likes: string;
  isFeatured?: boolean;
  tags: string[];
}

interface ArtistProfileProps {
  artworks: GeneratedArtworks;
  onBack: () => void;
  onPlayVideo?: (videoSrc: string, title: string, duration: string) => void;
}

export default function ArtistProfile({ artworks, onBack, onPlayVideo }: ArtistProfileProps) {
  const [activeTab, setActiveTab] = useState<'Performances' | 'Shows' | 'About'>('Performances');
  const [isBacked, setIsBacked] = useState(false);
  const [followerCount, setFollowerCount] = useState(12.4);
  const [tags, setTags] = useState(['#Original', '#Acoustic', '#Indie', '#Singer']);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Modals state
  const [newTagPromptOpen, setNewTagPromptOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState<string | null>(null);
  const [ticketTier, setTicketTier] = useState<'General' | 'VIP' | 'Judge'>('General');
  const [ticketQty, setTicketQty] = useState(1);
  const [ticketConfirmed, setTicketConfirmed] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [scoreBreakdownOpen, setScoreBreakdownOpen] = useState(false);
  const [fansModalOpen, setFansModalOpen] = useState(false);
  const [gearModalItem, setGearModalItem] = useState<{ name: string; desc: string; type: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // Shows state (Upcoming vs Previous Shows, Attendees, and Detailed Preview)
  const [showsSubTab, setShowsSubTab] = useState<'Upcoming' | 'Previous'>('Upcoming');
  const [rsvpShowIds, setRsvpShowIds] = useState<Record<string, boolean>>({ 'show-next-stage': true });
  const [attendedPastShowIds, setAttendedPastShowIds] = useState<Record<string, boolean>>({ 'past-ranga': true });
  const [selectedShowDetail, setSelectedShowDetail] = useState<any | null>(null);
  const [selectedPastShowDetail, setSelectedPastShowDetail] = useState<any | null>(null);
  const [showPastGalleryModal, setShowPastGalleryModal] = useState<string[] | null>(null);
  const [isPlayingTeaserVideo, setIsPlayingTeaserVideo] = useState(false);
  const [calendarSavedShows, setCalendarSavedShows] = useState<Record<string, boolean>>({});
  const [reviewShowModal, setReviewShowModal] = useState<string | null>(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [venueDirectionsModal, setVenueDirectionsModal] = useState<{
    name: string;
    address: string;
    city: string;
    transit: string;
    parking: string;
  } | null>(null);
  const [pastShowUserReviews, setPastShowUserReviews] = useState<
    Record<string, { author: string; role: string; comment: string; stars: number; time: string }[]>
  >({});

  // Add Video modal
  const [addVideoModalOpen, setAddVideoModalOpen] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoGenre, setNewVideoGenre] = useState('Acoustic');
  const [newVideoDuration, setNewVideoDuration] = useState('03:12');
  const [newVideoPresetIdx, setNewVideoPresetIdx] = useState(0);

  // Home Feed Video Player Modal (Triggered by clicking Featured Performance or any video)
  const [activeFeedItem, setActiveFeedItem] = useState<ProfilePerformanceItem | null>(null);
  const [isFeedVideoPlaying, setIsFeedVideoPlaying] = useState(true);
  const [isFeedVideoMuted, setIsFeedVideoMuted] = useState(false);
  const [feedVideoProgress, setFeedVideoProgress] = useState(0);
  const [feedVideoCurrentTime, setFeedVideoCurrentTime] = useState('00:00');
  const feedVideoRef = useRef<HTMLVideoElement | null>(null);

  // Home feed actions state
  const [keptVideos, setKeptVideos] = useState<Record<string, boolean>>({});
  const [videoScores, setVideoScores] = useState<Record<string, number>>({});
  const [activeScorePickerId, setActiveScorePickerId] = useState<string | null>(null);
  const [selectedStepperScore, setSelectedStepperScore] = useState<number>(8);
  const [isTalkDrawerOpen, setIsTalkDrawerOpen] = useState(false);
  const [critiqueComments, setCritiqueComments] = useState<
    Record<string, { author: string; role: string; text: string; time: string }[]>
  >({
    p1: [
      {
        author: 'Maya Sen',
        role: 'Verified Stage Judge',
        text: 'The fingerpicking pattern during the bridge has wonderful dynamics. Very honest resonance.',
        time: '2h ago',
      },
      {
        author: 'Rohan V.',
        role: 'Acoustic Producer',
        text: 'Clean tone, nice sustain on the open D tuning.',
        time: '5h ago',
      },
    ],
  });
  const [newCommentInput, setNewCommentInput] = useState('');

  // Audio Context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContextRef.current = new AudioCtx();
    }
  }, []);

  const playChime = () => {
    try {
      if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      }
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Video preset choices for user to add
  const VIDEO_PRESETS = [
    {
      label: 'Acoustic Sunset Guitar',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
      thumb: artworks.monsoonMotionThumb,
    },
    {
      label: 'Stage Silhouette Lights',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-woman-talking-on-stage-with-lights-42534-large.mp4',
      thumb: artworks.cityLightsThumb,
    },
    {
      label: 'Soulful Dance Movement',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
      thumb: artworks.fallingAgainThumb,
    },
    {
      label: 'Uncut Instrumental Studio',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-musician-playing-an-acoustic-instrument-42617-large.mp4',
      thumb: artworks.unpluggedThumb,
    },
    {
      label: 'Live Microphone Take',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-singer-singing-into-a-microphone-in-a-studio-42588-large.mp4',
      thumb: artworks.theEdgeThumb,
    },
  ];

  // Dynamic performances list
  const [performancesList, setPerformancesList] = useState<ProfilePerformanceItem[]>([
    {
      id: 'p1',
      title: 'Monsoon Motion',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
      thumb: artworks.monsoonMotionThumb,
      duration: '03:24',
      genre: 'Acoustic Folk',
      views: '3.2M',
      likes: '142.8K',
      isFeatured: true,
      tags: ['#Original', '#Acoustic', '#Indie'],
    },
    {
      id: 'p2',
      title: 'City Lights',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-woman-talking-on-stage-with-lights-42534-large.mp4',
      thumb: artworks.cityLightsThumb,
      duration: '02:48',
      genre: 'Indie Fusion',
      views: '840K',
      likes: '48.2K',
      tags: ['#LiveTake', '#StageLights'],
    },
    {
      id: 'p3',
      title: 'Falling Again',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-stage-light-42407-large.mp4',
      thumb: artworks.fallingAgainThumb,
      duration: '03:10',
      genre: 'Contemporary Flow',
      views: '1.1M',
      likes: '96.5K',
      tags: ['#Movement', '#Acoustic'],
    },
    {
      id: 'p4',
      title: 'Unplugged Raga',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-musician-playing-an-acoustic-instrument-42617-large.mp4',
      thumb: artworks.unpluggedThumb,
      duration: '04:05',
      genre: 'Classical Acoustic',
      views: '620K',
      likes: '34.1K',
      tags: ['#Instrumental', '#Uncut'],
    },
    {
      id: 'p5',
      title: 'The Edge (Studio Take)',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-singer-singing-into-a-microphone-in-a-studio-42588-large.mp4',
      thumb: artworks.theEdgeThumb,
      duration: '03:15',
      genre: 'Singer-Songwriter',
      views: '490K',
      likes: '28.9K',
      tags: ['#Vocal', '#Original'],
    },
  ]);

  // Upcoming Shows Data (with attendees, itinerary, teaser preview video, and booking)
  const upcomingShows = [
    {
      id: 'show-next-stage',
      title: 'Live at The Next Stage',
      tagline: 'Official Album Acoustic Showcase',
      date: 'Oct 24, 2026',
      day: '24',
      month: 'OCT',
      time: '8:00 PM IST (Doors 7:15 PM)',
      venue: 'The Next Stage Auditorium, 12th Main Indiranagar',
      venueAddress: '312, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
      city: 'Bengaluru, India',
      price: '₹799',
      thumb: artworks.showNextStageThumb,
      teaserVideo: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
      attendeesCount: 148,
      attendeeNames: ['Ananya Krishnan (Judge)', 'Maya Sen (Judge)', 'Rohan V.', '145 others'],
      setlist: ['Monsoon Motion (Acoustic)', 'City Lights', 'New Ballad Preview', 'Raag Yaman Modulation'],
      itinerary: [
        { time: '7:15 PM', desc: 'Doors open & Ambient Soundscapes' },
        { time: '8:00 PM', desc: 'Opening Act: Kabir Joshi (Classical Flute)' },
        { time: '8:45 PM', desc: 'Aarav Nair 60-min Uncut Live Set' },
        { time: '9:45 PM', desc: 'Verified Judges Feedback & Backstage Meet' },
      ],
      seating: 'Tiered acoustic auditorium with stage-side judge pit (450 seats)',
      ageLimit: '16+',
      dressCode: 'Smart Casual / Indie Stage',
      transit: 'Indiranagar Metro Station (Purple Line) — 350m (4 min walk)',
      parking: 'Underground venue parking + Street valet service',
      acoustics: 'Meyer Sound Lina Line Array • Custom wooden acoustic diffusers',
      stagePhotos: [artworks.showNextStageThumb, artworks.aaravHero, artworks.cityLightsThumb],
    },
    {
      id: 'show-sofar',
      title: 'Sofar Sounds Secret Gig',
      tagline: 'Secret Living Room Acoustic Session',
      date: 'Nov 16, 2026',
      day: '16',
      month: 'NOV',
      time: '7:30 PM IST',
      venue: 'Secret Heritage Courtyard, 4th Block Koramangala',
      venueAddress: 'Secret location unlocked 24h before show for pass holders, Koramangala, Bengaluru 560034',
      city: 'Bengaluru, India',
      price: '₹650 (RSVP Priority)',
      thumb: artworks.showSofarThumb,
      teaserVideo: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-woman-talking-on-stage-with-lights-42534-large.mp4',
      attendeesCount: 86,
      attendeeNames: ['Vikram Rao', 'Tara Devi (Judge)', '84 others'],
      setlist: ['Unplugged Raag Improvisation', 'Monsoon Motion', 'Falling Again', 'Audience Request Track'],
      itinerary: [
        { time: '7:00 PM', desc: 'Secret location GPS pin revealed to pass holders' },
        { time: '7:30 PM', desc: 'Doors open & Warm chai / coffee mixer' },
        { time: '8:00 PM', desc: 'Aarav Nair Unamplified Living Room Set' },
      ],
      seating: 'Intimate floor cushions & low armchairs (BYO Cushion)',
      ageLimit: 'All Ages',
      dressCode: 'Cozy / Acoustic Comfort',
      transit: 'Sony World Junction Koramangala (Auto/Cab hub 2 mins)',
      parking: 'Reserved residential bay parking',
      acoustics: '100% Unamplified Acoustic Resonance (No PA System)',
      stagePhotos: [artworks.showSofarThumb, artworks.unpluggedThumb],
    },
  ];

  // Previous Shows Data (with visitor counts, ratings, setlist played, photos, and verified reviews)
  const previousShows = [
    {
      id: 'past-ranga',
      title: 'Sold Out at Ranga Shankara',
      subtitle: 'Solo Acoustic Theatre Session',
      date: 'Sept 18, 2025',
      venue: 'Ranga Shankara Theatre, JP Nagar, Bengaluru',
      venueAddress: '36/2, 8th Cross Rd, R K Colony, 2nd Phase, J. P. Nagar, Bengaluru, Karnataka 560078',
      visitorsCount: 450,
      capacity: 'Full House • 450/450',
      rating: '4.9/5 ⭐',
      ratingCount: 280,
      dimensionRatings: { sound: 4.9, atmosphere: 4.8, craft: 5.0, value: 4.9 },
      thumb: artworks.monsoonMotionThumb,
      videoHighlight: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-musician-playing-an-acoustic-instrument-42617-large.mp4',
      setlistPlayed: [
        '1. Monsoon Motion (Extended Acoustic Intro - 05:20)',
        '2. Raag Yaman Modern Modulation (04:15)',
        '3. City Lights (Audience Chorus Singalong - 03:45)',
        '4. Falling Again (Acoustic Encore - 04:30)',
      ],
      photos: [
        artworks.monsoonMotionThumb,
        artworks.aaravHero,
        artworks.cityLightsThumb,
      ],
      visitorReviews: [
        {
          author: 'Ananya Krishnan',
          role: 'Verified Stage Judge',
          comment: 'The raw fingerpicking on the Taylor 814ce gave goosebumps. 450 people were dead silent during the bridge.',
          stars: 5,
        },
        {
          author: 'Vikram R.',
          role: 'Patron',
          comment: 'Best acoustic concert in Bengaluru this year. Unamplified vocal modulation was incredible.',
          stars: 5,
        },
      ],
    },
    {
      id: 'past-nh7',
      title: 'NH7 Weekender Acoustic Stage',
      subtitle: 'Festival Uncut Showcase',
      date: 'Aug 12, 2025',
      venue: 'Mahalakshmi Lawns, Pune',
      venueAddress: 'Nagar Road, Near Kharadi Bypass, Pune, Maharashtra 411014',
      visitorsCount: 1200,
      capacity: 'Arena Stage • 1,200 Attended',
      rating: '4.8/5 ⭐',
      ratingCount: 520,
      dimensionRatings: { sound: 4.7, atmosphere: 5.0, craft: 4.8, value: 4.7 },
      thumb: artworks.theEdgeThumb,
      videoHighlight: 'https://assets.mixkit.co/videos/preview/mixkit-singer-singing-into-a-microphone-in-a-studio-42588-large.mp4',
      setlistPlayed: [
        '1. The Edge (Live Festival Take - 04:10)',
        '2. Monsoon Motion (Upbeat Rhythm - 03:30)',
        '3. Unplugged Sunset Jam (06:00)',
      ],
      photos: [
        artworks.theEdgeThumb,
        artworks.fallingAgainThumb,
      ],
      visitorReviews: [
        {
          author: 'Kabir Joshi',
          role: 'Festival Curator',
          comment: 'One of the quietest and most intense sets at NH7. Everyone stopped walking past the acoustic tent.',
          stars: 5,
        },
      ],
    },
    {
      id: 'past-prithvi',
      title: 'Prithvi Theatre Candlelight Sessions',
      subtitle: 'Intimate Unplugged Session',
      date: 'June 28, 2025',
      venue: 'Prithvi Theatre, Juhu, Mumbai',
      venueAddress: '20, Janki Kutir, Juhu Church Rd, Juhu, Mumbai, Maharashtra 400049',
      visitorsCount: 180,
      capacity: 'Intimate Room • 180/180',
      rating: '5.0/5 ⭐',
      ratingCount: 140,
      dimensionRatings: { sound: 5.0, atmosphere: 5.0, craft: 5.0, value: 5.0 },
      thumb: artworks.unpluggedThumb,
      videoHighlight: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-singing-and-playing-the-acoustic-guitar-42589-large.mp4',
      setlistPlayed: [
        '1. Candlelight Improvisation in D (05:00)',
        '2. Monsoon Motion (03:30)',
        '3. Mumbai Rain Raga (04:45)',
      ],
      photos: [
        artworks.unpluggedThumb,
        artworks.showSofarThumb,
      ],
      visitorReviews: [
        {
          author: 'Priya Deshmukh',
          role: 'Music Critic',
          comment: 'Pure poetry without microphones. Aarav proved that true vocal craft doesn’t need processing.',
          stars: 5,
        },
      ],
    },
  ];

  // Back Talent toggle
  const handleBackTalent = () => {
    const nextState = !isBacked;
    setIsBacked(nextState);
    setFollowerCount((prev) => (nextState ? +(prev + 0.1).toFixed(1) : +(prev - 0.1).toFixed(1)));

    if (nextState) {
      playChime();
      const emojis = ['❤️', '🔥', '⭐️', '👏'];
      const reactions = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        emoji: emojis[i % emojis.length],
        left: 35 + Math.random() * 30,
      }));
      setFloatingReactions(reactions);
      setTimeout(() => setFloatingReactions([]), 1400);
      showToast('❤️ You are now backing Aarav Nair! Follower count updated.');
    } else {
      showToast('Removed backing for Aarav Nair');
    }
  };

  // Add tag handler
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const formatted = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!tags.includes(formatted)) {
      setTags((prev) => [...prev, formatted]);
      showToast(`Added tag "${formatted}"`);
    } else {
      showToast(`Tag "${formatted}" already exists`);
    }
    setNewTagInput('');
    setNewTagPromptOpen(false);
  };

  // Add custom video handler
  const handleAddCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newVideoTitle.trim() || `Live Performance #${performancesList.length + 1}`;
    const preset = VIDEO_PRESETS[newVideoPresetIdx] || VIDEO_PRESETS[0];

    const newItem: ProfilePerformanceItem = {
      id: `custom-${Date.now()}`,
      title,
      genre: newVideoGenre,
      duration: newVideoDuration || '03:15',
      videoSrc: preset.src,
      thumb: preset.thumb,
      views: '1.2K',
      likes: '240',
      tags: ['#NewTake', '#LiveUncut'],
    };

    setPerformancesList((prev) => [newItem, ...prev]);
    setNewVideoTitle('');
    setAddVideoModalOpen(false);
    showToast(`Added "${title}" to performances!`);

    // Auto open in home feed video card view!
    handleOpenHomeFeedView(newItem);
  };

  // Open Home Feed Video Card view
  const handleOpenHomeFeedView = (item: ProfilePerformanceItem) => {
    setActiveFeedItem(item);
    setIsFeedVideoPlaying(true);
    setFeedVideoProgress(0);
    setFeedVideoCurrentTime('00:00');
    if (selectedStepperScore === 8 && videoScores[item.id]) {
      setSelectedStepperScore(videoScores[item.id]);
    }
  };

  // Stepper handlers for home feed card judging
  const handleScoreUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStepperScore((prev) => Math.min(10, prev + 1));
  };

  const handleScoreDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStepperScore((prev) => Math.max(1, prev - 1));
  };

  const handleConfirmScore = (item: ProfilePerformanceItem, score = selectedStepperScore) => {
    setVideoScores((prev) => ({ ...prev, [item.id]: score }));
    setActiveScorePickerId(null);
    playChime();

    // Floating reaction burst
    const emojis = ['⭐️', '🔥', '👏', '❤️'];
    const reactions = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      left: 40 + Math.random() * 20,
    }));
    setFloatingReactions(reactions);
    setTimeout(() => setFloatingReactions([]), 1400);

    showToast(`Score ${score}/10 recorded for ${item.title}!`);
  };

  const handleJudgeButtonClick = (item: ProfilePerformanceItem) => {
    if (activeScorePickerId === item.id) {
      handleConfirmScore(item);
    } else {
      setActiveScorePickerId(item.id);
    }
  };

  // Video time update
  const handleTimeUpdate = () => {
    if (feedVideoRef.current) {
      const current = feedVideoRef.current.currentTime;
      const total = feedVideoRef.current.duration || 1;
      setFeedVideoProgress((current / total) * 100);
      const m = Math.floor(current / 60);
      const s = Math.floor(current % 60);
      setFeedVideoCurrentTime(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!feedVideoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const total = feedVideoRef.current.duration || 60;
    feedVideoRef.current.currentTime = pos * total;
  };

  // Add critique comment
  const handlePostCritique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedItem || !newCommentInput.trim()) return;
    const newEntry = {
      author: 'You',
      role: 'Verified Judge',
      text: newCommentInput.trim(),
      time: 'Just now',
    };
    setCritiqueComments((prev) => ({
      ...prev,
      [activeFeedItem.id]: [newEntry, ...(prev[activeFeedItem.id] || [])],
    }));
    setNewCommentInput('');
    showToast('Critique submitted directly to artist!');
  };

  // Filtered performances based on tag selection
  const filteredPerformances = selectedTagFilter
    ? performancesList.filter((p) => p.tags.includes(selectedTagFilter))
    : performancesList;

  const featuredPerformance = performancesList.find((p) => p.isFeatured) || performancesList[0];

  return (
    <div className="w-full max-w-[430px] min-h-screen bg-[#07080C] text-white relative flex flex-col pb-8 overflow-x-hidden selection:bg-[#E11D74]/30">
      {/* 1. iOS Status Bar */}
      <div className="px-6 pt-2.5 pb-1 flex items-center justify-between select-none z-30 relative">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden="true">
            <rect x="0.5" y="7" width="2.8" height="3.5" rx="1" fill="white" />
            <rect x="4.8" y="5" width="2.8" height="5.5" rx="1" fill="white" />
            <rect x="9.1" y="2.5" width="2.8" height="8" rx="1" fill="white" />
            <rect x="13.4" y="0.5" width="2.8" height="10" rx="1" fill="white" />
          </svg>
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

      {/* 2. Top Navigation Over Hero */}
      <div className="px-4 py-2 flex items-center justify-between z-30 relative -mt-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to feed"
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={() => setShareSheetOpen(true)}
            aria-label="Share profile"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>

          {/* More Options Button */}
          <button
            type="button"
            onClick={() => setActionMenuOpen(true)}
            aria-label="More options"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-transform"
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* 3. Hero Cinematic Stage Banner & Avatar Area */}
      <div className="relative w-full aspect-[430/280] -mt-14 select-none">
        <img
          src={artworks.aaravHero}
          alt="Aarav Nair performing live"
          className="w-full h-full object-cover"
        />

        {/* Multi-stage Dark Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080C] via-[#07080C]/40 to-black/30 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07080C] to-transparent pointer-events-none" />

        {/* Circular Avatar with Green Online Dot */}
        <div className="absolute left-4 -bottom-6 z-20">
          <div
            className="relative cursor-pointer group"
            onClick={() => showToast('Aarav Nair is currently online & accepting bookings!')}
          >
            <div className="w-[84px] h-[84px] rounded-full overflow-hidden border-[2.5px] border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.8)] bg-[#1B1D24] group-hover:scale-105 transition-transform">
              <img
                src={artworks.aaravAvatar}
                alt="Aarav Nair"
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className="w-3.5 h-3.5 rounded-full bg-[#00E575] border-[2.5px] border-[#07080C] absolute bottom-0.5 right-1 z-10 shadow-sm animate-pulse"
              title="Online now"
            />
          </div>
        </div>
      </div>

      {/* 4. Identity Header & Bio */}
      <div className="px-4 pt-8 flex flex-col">
        {/* Name with Verified Badge */}
        <div className="flex items-center gap-2">
          <h1 className="font-brand text-[27px] font-bold text-white tracking-[-0.01em] leading-tight">
            Aarav Nair
          </h1>
          <button
            type="button"
            onClick={() => showToast('Verified Stage Artist • Level 4 Calibrated')}
            className="w-[19px] h-[19px] rounded-full bg-[#E91E76] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(233,30,118,0.5)] active:scale-90 transition-transform"
            title="Verified Talent"
          >
            <Check className="w-[11px] h-[11px] text-white stroke-[3.5]" />
          </button>
        </div>

        {/* Role & Location */}
        <div className="flex items-center gap-2 text-[12.5px] text-[#D1D5DB] mt-1 flex-wrap">
          <span>Singer</span>
          <span className="text-[#6B7280]">•</span>
          <span>Songwriter</span>
          <span className="text-[#6B7280]">•</span>
          <div className="flex items-center gap-1 text-[#D1D5DB]">
            <MapPin className="w-3.5 h-3.5 text-[#E91E76] fill-[#E91E76]" />
            <span>Bengaluru, India</span>
          </div>
        </div>

        {/* Quote */}
        <p className="text-[12.5px] text-[#9CA3AF] mt-1.5 italic font-normal tracking-wide">
          “Building a life on stage, one performance at a time.”
        </p>

        {/* 5. Metrics 4-Grid Cards (All Fully Clickable & Functional) */}
        <div className="grid grid-cols-4 gap-2 mt-4 select-none">
          {/* 1. Blind Score */}
          <div
            onClick={() => setScoreBreakdownOpen(true)}
            className="p-2.5 rounded-2xl bg-[#11131B] border border-white/[0.08] hover:border-[#E91E76]/50 flex flex-col justify-between min-h-[64px] cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <Star className="w-4 h-4 text-[#E91E76] fill-[#E91E76]" />
            <div className="mt-1">
              <span className="text-[16px] font-bold text-white leading-none block">4.8</span>
              <span className="text-[10px] text-[#8E95A5] font-medium leading-tight mt-0.5 block truncate">
                Blind Score
              </span>
            </div>
          </div>

          {/* 2. Performances */}
          <div
            onClick={() => {
              setActiveTab('Performances');
              showToast(`Showing all ${performancesList.length} performances`);
            }}
            className="p-2.5 rounded-2xl bg-[#11131B] border border-white/[0.08] hover:border-white/20 flex flex-col justify-between min-h-[64px] cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <BarChart2 className="w-4 h-4 text-[#D1D5DB] stroke-[2]" />
            <div className="mt-1">
              <span className="text-[16px] font-bold text-white leading-none block">
                {performancesList.length}
              </span>
              <span className="text-[10px] text-[#8E95A5] font-medium leading-tight mt-0.5 block truncate">
                Performances
              </span>
            </div>
          </div>

          {/* 3. Shows */}
          <div
            onClick={() => {
              setActiveTab('Shows');
              showToast('Switched to confirmed live shows');
            }}
            className="p-2.5 rounded-2xl bg-[#11131B] border border-white/[0.08] hover:border-white/20 flex flex-col justify-between min-h-[64px] cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 text-[#E91E76] stroke-[2]" />
            <div className="mt-1">
              <span className="text-[16px] font-bold text-white leading-none block">2</span>
              <span className="text-[10px] text-[#8E95A5] font-medium leading-tight mt-0.5 block truncate">
                Shows
              </span>
            </div>
          </div>

          {/* 4. Followers */}
          <div
            onClick={() => setFansModalOpen(true)}
            className="p-2.5 rounded-2xl bg-[#11131B] border border-white/[0.08] hover:border-white/20 flex flex-col justify-between min-h-[64px] cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <Users className="w-4 h-4 text-[#D1D5DB] stroke-[2]" />
            <div className="mt-1">
              <span className="text-[16px] font-bold text-white leading-none block">
                {followerCount.toFixed(1)}K
              </span>
              <span className="text-[10px] text-[#8E95A5] font-medium leading-tight mt-0.5 block truncate">
                Followers
              </span>
            </div>
          </div>
        </div>

        {/* 6. Primary Action Buttons */}
        <div className="flex items-center gap-2.5 mt-4">
          {/* BACK TALENT Button */}
          <button
            type="button"
            onClick={handleBackTalent}
            className={`flex-1 h-[42px] px-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isBacked
                ? 'bg-[#181A24] border border-[#E91E76] text-white shadow-[0_0_15px_rgba(233,30,118,0.3)]'
                : 'bg-gradient-to-r from-[#DF1E76] to-[#E91E76] shadow-[0_0_18px_rgba(233,30,118,0.45)] text-white hover:brightness-110'
            }`}
          >
            <Heart
              className={`w-4 h-4 stroke-[2.2] ${
                isBacked ? 'fill-[#E91E76] text-[#E91E76]' : 'text-white'
              }`}
            />
            <span className="text-[11.5px] font-semibold tracking-[0.08em] uppercase">
              {isBacked ? 'TALENT BACKED' : 'BACK TALENT'}
            </span>
          </button>

          {/* INVITE TO SHOW Button */}
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="h-[42px] px-4 rounded-full bg-[#11131B] border border-white/15 hover:border-white/30 flex items-center justify-center gap-2 text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-white stroke-[2]" />
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap">
              INVITE TO SHOW
            </span>
          </button>

          {/* More Options Button */}
          <button
            type="button"
            onClick={() => setActionMenuOpen(true)}
            aria-label="More profile actions"
            className="w-[42px] h-[42px] rounded-full bg-[#11131B] border border-white/15 flex items-center justify-center text-[#D1D5DB] hover:text-white shrink-0 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 7. Hashtags Row */}
        <div className="flex items-center gap-2 mt-3.5 overflow-x-auto no-scrollbar py-0.5">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (selectedTagFilter === tag) {
                  setSelectedTagFilter(null);
                  showToast('Showing all tags');
                } else {
                  setSelectedTagFilter(tag);
                  showToast(`Filtered by ${tag}`);
                }
              }}
              className={`px-3.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                selectedTagFilter === tag
                  ? 'bg-[#E91E76] text-white border border-pink-400/50 shadow-md'
                  : 'bg-[#11131B] border border-white/[0.09] text-[#D1D5DB] hover:border-white/30'
              }`}
            >
              {tag}
            </button>
          ))}

          {/* + Add tag button */}
          <button
            type="button"
            onClick={() => setNewTagPromptOpen(true)}
            className="px-3 py-1 rounded-full bg-[#11131B]/60 border border-white/20 hover:border-white/40 text-[11.5px] text-[#9CA3AF] hover:text-white font-medium flex items-center gap-1 whitespace-nowrap active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add tag</span>
          </button>
        </div>
      </div>

      {/* 8. Profile Navigation Tabs */}
      <div className="mt-5 border-b border-white/[0.08] px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('Performances')}
          className={`flex items-center gap-2 pb-3 relative transition-colors cursor-pointer ${
            activeTab === 'Performances' ? 'text-[#E91E76] font-semibold' : 'text-[#8E95A5]'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="text-[13px]">Performances</span>
          {activeTab === 'Performances' && (
            <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#E91E76] rounded-t-full shadow-[0_0_8px_rgba(233,30,118,0.8)]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Shows')}
          className={`flex items-center gap-2 pb-3 relative transition-colors cursor-pointer ${
            activeTab === 'Shows' ? 'text-[#E91E76] font-semibold' : 'text-[#8E95A5]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[13px]">Shows</span>
          {activeTab === 'Shows' && (
            <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#E91E76] rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('About')}
          className={`flex items-center gap-2 pb-3 relative transition-colors cursor-pointer ${
            activeTab === 'About' ? 'text-[#E91E76] font-semibold' : 'text-[#8E95A5]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span className="text-[13px]">About</span>
          {activeTab === 'About' && (
            <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#E91E76] rounded-t-full" />
          )}
        </button>
      </div>

      {/* 9. Tab Content */}
      {activeTab === 'Performances' && (
        <div className="flex flex-col gap-5 mt-4">
          {/* Section 1: Featured Performance & Add Video Button */}
          <div className="flex flex-col">
            <div className="px-4 flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[15.5px] font-semibold text-white">Featured Performance</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E91E76]/20 border border-[#E91E76]/40 text-[#E91E76] font-semibold uppercase">
                  Live View
                </span>
              </div>

              {/* + Add Video Button requested by user */}
              <button
                type="button"
                onClick={() => setAddVideoModalOpen(true)}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Video</span>
              </button>
            </div>

            {/* Featured Video Card - CLICKING OPENS HOME FEED VIDEO CARD VIEW */}
            <div className="px-4">
              <div
                onClick={() => handleOpenHomeFeedView(featuredPerformance)}
                className="relative w-full aspect-[16/9.3] rounded-2xl overflow-hidden border border-white/15 bg-[#120F0C] shadow-lg shrink-0 cursor-pointer group hover:border-[#E91E76]/50 transition-all"
              >
                <img
                  src={featuredPerformance.thumb}
                  alt={featuredPerformance.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

                {/* Top-Left Badge: Featured Live Take */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#DF1E76]/85 backdrop-blur-md text-[10px] font-semibold tracking-wider text-white uppercase shadow-md">
                  <Star className="w-3 h-3 fill-white" />
                  <span>Featured • Tap to play in Home Feed view</span>
                </div>

                {/* Center Play Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-[3px] border-[1.5px] border-white/85 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>

                {/* Bottom Left Title & Meta */}
                <div className="absolute bottom-3 left-3 right-16">
                  <h3 className="font-brand text-[17px] font-bold text-white leading-tight truncate">
                    {featuredPerformance.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-[#D1D5DB] mt-0.5 truncate">
                    <span>{featuredPerformance.genre}</span>
                    <span className="text-white/60">•</span>
                    <span>{featuredPerformance.views} views</span>
                    <span className="text-white/60">•</span>
                    <span className="text-[#E91E76] font-medium">{videoScores[featuredPerformance.id] ? `Scored ${videoScores[featuredPerformance.id]}⭐` : 'Tap to Judge'}</span>
                  </div>
                </div>

                {/* Bottom Right Duration Pill */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-[5px] bg-black/70 backdrop-blur-md border border-white/20 text-[10.5px] font-medium tabular-nums text-white">
                  {featuredPerformance.duration}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Performances Carousel (All cards open Home Feed Video view) */}
          <div className="flex flex-col">
            <div className="px-4 flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[15.5px] font-semibold text-white">Performances</h2>
                <span className="text-[11px] text-[#8E95A5]">({filteredPerformances.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setAddVideoModalOpen(true)}
                className="text-[12px] text-[#E91E76] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>+ Upload take</span>
              </button>
            </div>

            {/* Horizontal Cards Carousel */}
            <div className="px-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
              {filteredPerformances.map((item) => {
                const score = videoScores[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenHomeFeedView(item)}
                    className={`relative w-[126px] aspect-[3/4.25] rounded-xl overflow-hidden shrink-0 cursor-pointer group shadow-md transition-all active:scale-95 ${
                      score
                        ? 'border-2 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.3)]'
                        : item.isFeatured
                        ? 'border-2 border-[#E91E76] shadow-[0_0_14px_rgba(233,30,118,0.35)]'
                        : 'border border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.thumb}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                    {/* Score badge if judged */}
                    {score && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-300 text-[9.5px] font-bold text-amber-300 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        <span>{score}</span>
                      </div>
                    )}

                    {/* Title */}
                    <div className="absolute bottom-2 left-2 right-7">
                      <span className="text-[11.5px] font-semibold text-white leading-tight block truncate">
                        {item.title}
                      </span>
                      <span className="text-[9.5px] text-[#9CA3AF] block truncate mt-0.5">
                        {item.duration}
                      </span>
                    </div>

                    {/* Circular Play Button in bottom-right */}
                    <div className="absolute bottom-2 right-1.5 w-5 h-5 rounded-full bg-black/60 border border-white/80 flex items-center justify-center">
                      <Play className="w-2 h-2 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Upcoming Shows Preview */}
          <div className="flex flex-col">
            <div className="px-4 flex items-center justify-between mb-2.5">
              <h2 className="text-[15.5px] font-semibold text-white">Upcoming Shows</h2>
              <button
                type="button"
                onClick={() => setActiveTab('Shows')}
                className="text-[12px] text-[#8E95A5] hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Show Tickets Horizontal List */}
            <div className="px-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
              {upcomingShows.map((show) => {
                const isGoing = rsvpShowIds[show.id];
                return (
                  <div
                    key={show.id}
                    onClick={() => setSelectedShowDetail(show)}
                    className="min-w-[280px] p-3 rounded-2xl bg-[#11131B] border border-white/[0.08] hover:border-[#E91E76]/40 flex flex-col gap-2.5 cursor-pointer shrink-0 transition-all active:scale-[0.99] shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-9 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        <span className="text-[18px] font-bold text-white leading-none">{show.day}</span>
                        <span className="text-[9.5px] font-bold uppercase text-[#E91E76] mt-0.5">
                          {show.month}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={show.thumb}
                          alt={show.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="text-[13.5px] font-semibold text-white truncate leading-tight">
                          {show.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] mt-1 truncate">
                          <MapPin className="w-3 h-3 text-[#E91E76] shrink-0" />
                          <span className="truncate">{show.city} • {show.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Who's Visiting & RSVP Badge */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px]">
                      <div className="flex items-center gap-1.5 text-[#8E95A5]">
                        <Users className="w-3.5 h-3.5 text-[#E91E76]" />
                        <span>{show.attendeesCount + (isGoing ? 1 : 0)} visiting</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isGoing ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-[#9CA3AF]'
                      }`}>
                        {isGoing ? '✓ You’re Visiting' : 'Preview & RSVP'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shows Tab View (Complete with Upcoming & Previous Shows Archive) */}
      {activeTab === 'Shows' && (
        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Sub-tab Pill Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-[#11131B] border border-white/10 select-none">
            <button
              type="button"
              onClick={() => setShowsSubTab('Upcoming')}
              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                showsSubTab === 'Upcoming'
                  ? 'bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white shadow-md'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingShows.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowsSubTab('Previous')}
              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                showsSubTab === 'Previous'
                  ? 'bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white shadow-md'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Previous Archive ({previousShows.length})</span>
            </button>
          </div>

          {/* VIEW A: UPCOMING SHOWS (How people will be visiting) */}
          {showsSubTab === 'Upcoming' && (
            <div className="flex flex-col gap-3.5">
              <div className="text-[12px] text-[#9CA3AF] flex items-center justify-between">
                <span>Confirmed live stage dates & RSVP list</span>
                <span className="text-[#E91E76] font-semibold">Priority Judge Passes</span>
              </div>

              {upcomingShows.map((show) => {
                const isGoing = rsvpShowIds[show.id];
                return (
                  <div
                    key={show.id}
                    className="p-4 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/25 flex flex-col gap-3 transition-colors shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E91E76]/20 border border-[#E91E76]/40 text-[#E91E76] font-bold uppercase tracking-wider">
                            Live Concert
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">{show.date} • {show.time}</span>
                        </div>
                        <h3 className="text-[16px] font-bold text-white mt-1 leading-tight">
                          {show.title}
                        </h3>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5">{show.tagline}</p>
                        <div className="flex items-center gap-1 text-[11.5px] text-white/80 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E91E76] shrink-0" />
                          <span>{show.venue}</span>
                        </div>
                      </div>

                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/15">
                        <img
                          src={show.thumb}
                          alt={show.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* How People Will Be Visiting / Attendees Section */}
                    <div className="p-2.5 rounded-xl bg-[#0A0C12] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          <div className="w-6 h-6 rounded-full bg-pink-500/30 border border-black flex items-center justify-center text-[9px] font-bold text-white">
                            AK
                          </div>
                          <div className="w-6 h-6 rounded-full bg-amber-500/30 border border-black flex items-center justify-center text-[9px] font-bold text-white">
                            MS
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-500/30 border border-black flex items-center justify-center text-[9px] font-bold text-white">
                            RV
                          </div>
                        </div>
                        <span className="text-[11px] text-[#D1D5DB]">
                          <strong className="text-white">{show.attendeesCount + (isGoing ? 1 : 0)}</strong> people visiting
                        </span>
                      </div>

                      {/* RSVP / I'm Going Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isGoing;
                          setRsvpShowIds((prev) => ({ ...prev, [show.id]: next }));
                          playChime();
                          showToast(next ? `You're marked as visiting ${show.title}! 🎉` : `Removed RSVP for ${show.title}`);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
                          isGoing
                            ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isGoing ? '✓ You’re Visiting' : '+ RSVP / I’m Going'}
                      </button>
                    </div>

                    {/* Action Buttons: Preview Show, Get Passes, Add to Calendar */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedShowDetail(show)}
                        className="flex-1 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Preview Show & Seating</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowTicketsModal(show.title);
                          setTicketTier('General');
                          setTicketQty(1);
                          setTicketConfirmed(false);
                        }}
                        className="h-9 px-4 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[11.5px] font-semibold shadow-md active:scale-95 transition-transform cursor-pointer"
                      >
                        Get Passes ({show.price})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW B: PREVIOUS SHOWS (Archive with setlists, audience memories & reviews) */}
          {showsSubTab === 'Previous' && (
            <div className="flex flex-col gap-3.5">
              <div className="text-[12px] text-[#9CA3AF] flex items-center justify-between">
                <span>Past concerts, setlists played & attendee reviews</span>
                <span className="text-amber-300 font-semibold">100% Sold Out</span>
              </div>

              {previousShows.map((show) => {
                const wasThere = attendedPastShowIds[show.id];
                return (
                  <div
                    key={show.id}
                    className="p-4 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/20 flex flex-col gap-3 transition-colors shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider">
                            {show.capacity}
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">{show.date}</span>
                        </div>
                        <h3 className="text-[16px] font-bold text-white mt-1 leading-tight">
                          {show.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[11.5px] text-[#9CA3AF] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E91E76] shrink-0" />
                          <span>{show.venue}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[13px] font-bold text-amber-300 flex items-center gap-1 justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>{show.rating}</span>
                        </span>
                        <span className="text-[10px] text-[#8E95A5] mt-0.5 block">
                          {show.ratingCount} reviews
                        </span>
                      </div>
                    </div>

                    {/* Setlist preview */}
                    <div className="p-2.5 rounded-xl bg-[#0A0C12] border border-white/[0.06] flex flex-col gap-1 text-[11.5px]">
                      <span className="text-[10px] uppercase font-bold text-[#8E95A5] tracking-wider">
                        Setlist Played:
                      </span>
                      <div className="text-[#D1D5DB] truncate">
                        {show.setlistPlayed.join(' • ')}
                      </div>
                    </div>

                    {/* Action buttons: Replay Highlight, View Full Recap, I Was There */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPastShowDetail(show)}
                        className="flex-1 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Replay & Full Recap</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const next = !wasThere;
                          setAttendedPastShowIds((prev) => ({ ...prev, [show.id]: next }));
                          playChime();
                          showToast(next ? `Marked you as an attendee of ${show.title}! 🎟️` : 'Removed attendance mark');
                        }}
                        className={`h-9 px-3.5 rounded-full text-[11.5px] font-semibold transition-all active:scale-95 cursor-pointer ${
                          wasThere
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'bg-white/5 border border-white/15 text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        {wasThere ? '✓ I Was There' : '+ I Was There'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* About Tab View */}
      {activeTab === 'About' && (
        <div className="px-4 py-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-[#11131B] border border-white/10 flex flex-col gap-2">
            <h3 className="text-[14px] font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#E91E76]" />
              <span>Artist Bio</span>
            </h3>
            <p className="text-[13px] text-[#D1D5DB] leading-relaxed">
              Aarav Nair is a Bengaluru-based singer-songwriter blending stripped-back acoustic arrangements with cinematic vocal modulations. Starting out in underground coffee house sessions, his one-take live recordings have garnered over 3.2M views across blind-judged platforms.
            </p>
          </div>

          {/* Clickable Gear & Instruments */}
          <div className="p-4 rounded-2xl bg-[#11131B] border border-white/10 flex flex-col gap-2.5">
            <h3 className="text-[14px] font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4 text-[#E91E76]" />
              <span>Instruments & Craft (Tap to inspect)</span>
            </h3>
            <div className="flex flex-wrap gap-2 text-[12px] text-[#D1D5DB]">
              <button
                type="button"
                onClick={() =>
                  setGearModalItem({
                    name: 'Taylor 814ce Acoustic',
                    type: 'Main Acoustic Guitar',
                    desc: 'Grand Auditorium cutaway with V-Class bracing and Sitka Spruce top. Custom tuned to Open D (D-A-D-F#-A-D).',
                  })
                }
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#E91E76] hover:text-white transition-colors cursor-pointer"
              >
                Taylor 814ce Acoustic
              </button>
              <button
                type="button"
                onClick={() =>
                  setGearModalItem({
                    name: 'Shure SM58 Dynamic',
                    type: 'Stage Vocal Microphone',
                    desc: 'Tuned to accentuate vocal warmth and clarity with high-gain spherical filter to isolate natural breath resonance.',
                  })
                }
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#E91E76] hover:text-white transition-colors cursor-pointer"
              >
                Shure SM58 Dynamic
              </button>
              <button
                type="button"
                onClick={() =>
                  setGearModalItem({
                    name: 'Strymon Timeline Delay',
                    type: 'Ambient Effects Rig',
                    desc: 'Used for tape-style harmonic echoes and stereo slapback on guitar solos.',
                  })
                }
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#E91E76] hover:text-white transition-colors cursor-pointer"
              >
                Strymon Timeline Delay
              </button>
              <button
                type="button"
                onClick={() =>
                  setGearModalItem({
                    name: 'Open D Tuning Setup',
                    type: 'Signature Fingerstyle Tuning',
                    desc: 'D-A-D-F#-A-D setup with 12-53 gauge phosphor bronze strings for deep drone harmonics.',
                  })
                }
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#E91E76] hover:text-white transition-colors cursor-pointer"
              >
                Open D Tuning
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="p-4 rounded-2xl bg-[#11131B] border border-white/10 flex flex-col gap-2.5">
            <h3 className="text-[14px] font-semibold text-white uppercase tracking-wider">Streaming & Socials</h3>
            <div className="flex flex-col gap-2 text-[12.5px]">
              <button
                type="button"
                onClick={() => showToast('Opening Aarav Nair on Spotify...')}
                className="w-full p-2.5 rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-white/20 flex items-center justify-between text-[#D1D5DB] cursor-pointer"
              >
                <span>Spotify • 184K Monthly Listeners</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => showToast('Opening Aarav Nair on YouTube...')}
                className="w-full p-2.5 rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-white/20 flex items-center justify-between text-[#D1D5DB] cursor-pointer"
              >
                <span>YouTube • 92K Subscribers</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => showToast('Opening @aaravnair on Instagram...')}
                className="w-full p-2.5 rounded-xl bg-[#0B0D13] border border-white/[0.08] hover:border-white/20 flex items-center justify-between text-[#D1D5DB] cursor-pointer"
              >
                <span>Instagram • @aaravnair</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inquire Booking Button */}
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="w-full h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12px] font-semibold uppercase tracking-wider shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            Inquire for Private Booking
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= HOME FEED VIDEO CARD MODAL (REQUESTED) ================ */}
      {/* ========================================================================= */}
      {activeFeedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-[420px] max-h-[96vh] bg-[#0E1017] border border-white/20 rounded-[28px] overflow-hidden flex flex-col shadow-2xl relative">
            {/* Top Modal Header */}
            <div className="px-4 py-2.5 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E91E76] text-white uppercase tracking-wider">
                  Home Feed View
                </span>
                <span className="text-[12.5px] font-semibold text-white truncate max-w-[170px]">
                  {activeFeedItem.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveFeedItem(null);
                  setActiveScorePickerId(null);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Area */}
            <div className="relative w-full aspect-[4/5] bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={feedVideoRef}
                src={activeFeedItem.videoSrc}
                poster={activeFeedItem.thumb}
                autoPlay
                playsInline
                loop
                muted={isFeedVideoMuted}
                onTimeUpdate={handleTimeUpdate}
                onClick={() => {
                  if (feedVideoRef.current) {
                    if (isFeedVideoPlaying) {
                      feedVideoRef.current.pause();
                      setIsFeedVideoPlaying(false);
                    } else {
                      feedVideoRef.current.play();
                      setIsFeedVideoPlaying(true);
                    }
                  }
                }}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Pause overlay icon */}
              {!isFeedVideoPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-black/60 border border-white/60 flex items-center justify-center">
                    <Play className="w-6 h-6 fill-white text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Top Video Overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-white uppercase">
                  60s Uncut Live Take
                </span>
              </div>

              {/* Top Right Controls (Mute / Sound) */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsFeedVideoMuted(!isFeedVideoMuted)}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer"
                >
                  {isFeedVideoMuted ? (
                    <VolumeX className="w-4 h-4 text-white/80" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#E91E76]" />
                  )}
                </button>
              </div>

              {/* Bottom Scrim & Progress Bar */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

              {/* Interactive Scrub Bar */}
              <div
                onClick={handleScrub}
                className="absolute bottom-2.5 inset-x-4 h-3 flex items-center cursor-pointer z-10 group"
              >
                <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] rounded-full"
                    style={{ width: `${feedVideoProgress}%` }}
                  />
                </div>
              </div>

              {/* Timecode overlay */}
              <div className="absolute bottom-6 right-4 text-[10.5px] font-mono text-white/80 z-10 pointer-events-none">
                {feedVideoCurrentTime} / {activeFeedItem.duration}
              </div>
            </div>

            {/* Performance Metadata */}
            <div className="px-4 py-2.5 flex flex-col bg-[#0E1017]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[16px] font-bold text-white leading-tight">
                      Aarav Nair
                    </h3>
                    <div className="w-4 h-4 rounded-full bg-[#E91E76] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                    </div>
                  </div>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                    Singer • Songwriter • Bengaluru
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{videoScores[activeFeedItem.id] ? `${videoScores[activeFeedItem.id]}/10 Judged` : '4.8 (1.4K ratings)'}</span>
                  </span>
                  <span className="text-[10px] text-[#8E95A5] block mt-0.5">
                    {activeFeedItem.views} views
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {activeFeedItem.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#D1D5DB]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* EXACT HOME FEED ACTION BAR: KEEP, TALK, PASS, JUDGE (WITH COMPACT STEPPER) */}
            <div className="px-4 py-3 bg-[#0A0C12] border-t border-white/10 flex items-center justify-between">
              {/* Left Group: KEEP, TALK, PASS */}
              <div className="flex items-center gap-2">
                {/* KEEP */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !keptVideos[activeFeedItem.id];
                    setKeptVideos((prev) => ({ ...prev, [activeFeedItem.id]: next }));
                    showToast(next ? `Saved ${activeFeedItem.title} to shortlist` : 'Removed from shortlist');
                  }}
                  className={`px-3 py-1.5 rounded-full border flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer ${
                    keptVideos[activeFeedItem.id]
                      ? 'bg-[#DF1E76] border-[#DF1E76] text-white shadow-[0_0_12px_rgba(223,30,118,0.5)]'
                      : 'bg-white/5 border-white/15 text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${keptVideos[activeFeedItem.id] ? 'fill-white' : ''}`} />
                  <span className="text-[8.5px] font-bold uppercase tracking-wider">KEEP</span>
                </button>

                {/* TALK */}
                <button
                  type="button"
                  onClick={() => setIsTalkDrawerOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/15 hover:border-white/30 text-[#9CA3AF] hover:text-white flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="text-[8.5px] font-bold uppercase tracking-wider">TALK</span>
                </button>

                {/* PASS */}
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Passed on ${activeFeedItem.title}`);
                    setActiveFeedItem(null);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/15 hover:border-white/30 text-[#9CA3AF] hover:text-white flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="text-[8.5px] font-bold uppercase tracking-wider">PASS</span>
                </button>
              </div>

              {/* Right: COMPACT JUDGE BUTTON & STEPPER (EXACT PREVIOUS DESIGN) */}
              <div className="relative flex flex-col items-end pl-2">
                {/* Floating Number Stepper Pill */}
                {activeScorePickerId === activeFeedItem.id && (
                  <div className="absolute bottom-[38px] right-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-[46px] py-1 px-1 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.85)] flex flex-col items-center justify-between select-none">
                      <button
                        type="button"
                        onClick={handleScoreUp}
                        className="w-8 h-5 flex items-center justify-center text-white/70 hover:text-white active:scale-80 cursor-pointer"
                      >
                        <ChevronUp className="w-4 h-4 text-white stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmScore(activeFeedItem)}
                        className="font-brand text-[24px] font-bold text-white leading-none my-0.5 active:scale-95 cursor-pointer"
                      >
                        {selectedStepperScore}
                      </button>
                      <button
                        type="button"
                        onClick={handleScoreDown}
                        className="w-8 h-5 flex items-center justify-center text-white/70 hover:text-white active:scale-80 cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleJudgeButtonClick(activeFeedItem)}
                  className="h-[32px] px-3.5 rounded-full bg-gradient-to-r from-[#4E1133] via-[#981856] to-[#DF1E76] border border-[#F43F8E]/70 shadow-[0_0_12px_rgba(223,30,118,0.3)] flex items-center gap-1.5 active:scale-[0.98] transition-transform cursor-pointer shrink-0"
                >
                  {/* Speedometer icon */}
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

                  <span className="text-[10.5px] font-bold tracking-[0.06em] text-white uppercase whitespace-nowrap">
                    {videoScores[activeFeedItem.id]
                      ? `JUDGED • ${videoScores[activeFeedItem.id]} ⭐`
                      : 'JUDGE'}
                  </span>

                  <ChevronRight className="w-[12px] h-[12px] text-white stroke-[2.2] shrink-0" />
                </button>

                <span className="mt-0.5 text-[9px] text-[#8E95A5] select-none text-right pr-1">
                  {videoScores[activeFeedItem.id] ? 'Score saved' : 'Presence • Craft'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* =================== MODAL: ADD VIDEO (USER REQUESTED) =================== */}
      {/* ========================================================================= */}
      {addVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E91E76]/20 flex items-center justify-center text-[#E91E76]">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-[16px] font-semibold text-white">Add New Video Take</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddVideoModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomVideo} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#8E95A5] uppercase tracking-wider block mb-1">
                  Performance Title
                </label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="e.g. Sunset Raga in D Minor"
                  required
                  className="w-full h-10 px-4 rounded-xl bg-[#0A0B10] border border-white/15 text-[13px] text-white focus:outline-none focus:border-[#E91E76]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[#8E95A5] uppercase tracking-wider block mb-1">
                    Genre / Style
                  </label>
                  <select
                    value={newVideoGenre}
                    onChange={(e) => setNewVideoGenre(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0A0B10] border border-white/15 text-[12.5px] text-white focus:outline-none focus:border-[#E91E76]"
                  >
                    <option value="Acoustic">Acoustic</option>
                    <option value="Fingerstyle">Fingerstyle</option>
                    <option value="Indie Folk">Indie Folk</option>
                    <option value="Classical Fusion">Classical Fusion</option>
                    <option value="Contemporary Dance">Contemporary Dance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#8E95A5] uppercase tracking-wider block mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newVideoDuration}
                    onChange={(e) => setNewVideoDuration(e.target.value)}
                    placeholder="03:15"
                    className="w-full h-10 px-3 rounded-xl bg-[#0A0B10] border border-white/15 text-[12.5px] text-white focus:outline-none focus:border-[#E91E76]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#8E95A5] uppercase tracking-wider block mb-1">
                  Choose Live Video Clip
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VIDEO_PRESETS.map((p, idx) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNewVideoPresetIdx(idx)}
                      className={`p-2 rounded-xl text-left border flex items-center gap-2 cursor-pointer transition-all ${
                        newVideoPresetIdx === idx
                          ? 'border-[#E91E76] bg-[#E91E76]/10 text-white'
                          : 'border-white/10 bg-[#0A0B10] text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      <img
                        src={p.thumb}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-[11px] font-medium leading-tight truncate">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12.5px] font-semibold uppercase tracking-wider shadow-lg active:scale-95 transition-transform mt-1 cursor-pointer"
              >
                Publish to Profile & Play in Feed
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: TALK / FEEDBACK COMMENTS DRAWER ================ */}
      {/* ========================================================================= */}
      {isTalkDrawerOpen && activeFeedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[430px] max-h-[85vh] bg-[#12141C] border-t border-white/15 rounded-t-3xl p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
              <div>
                <h3 className="text-[15px] font-semibold text-white">
                  Craft Critique: {activeFeedItem.title}
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">Constructive notes for Aarav Nair</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTalkDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Critique List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 py-1 pr-1 max-h-[280px]">
              {(critiqueComments[activeFeedItem.id] || []).map((cmt, i) => (
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

            {/* Input Form */}
            <form onSubmit={handlePostCritique} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newCommentInput}
                onChange={(e) => setNewCommentInput(e.target.value)}
                placeholder="Leave feedback on tone, presence, or craft..."
                className="flex-1 h-10 px-4 rounded-full bg-[#0A0C12] border border-white/15 text-[12.5px] text-white focus:outline-none focus:border-[#E91E76]"
              />
              <button
                type="submit"
                disabled={!newCommentInput.trim()}
                className="h-10 px-4 rounded-full bg-[#E91E76] disabled:opacity-40 text-white text-[12px] font-semibold cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ==================== MODAL: BLIND SCORE BREAKDOWN ======================= */}
      {/* ========================================================================= */}
      {scoreBreakdownOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#E91E76] fill-[#E91E76]" />
                <h3 className="text-[16px] font-semibold text-white">Blind Scoring Breakdown</h3>
              </div>
              <button
                type="button"
                onClick={() => setScoreBreakdownOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              Rated purely on unadorned stage performance before identity and popularity stats are unmasked.
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-white block">Stage Presence</span>
                  <span className="text-[11px] text-[#8E95A5]">Audience hook & dynamic stage aura</span>
                </div>
                <span className="text-[16px] font-bold text-[#E91E76]">9.6 / 10</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-white block">Originality</span>
                  <span className="text-[11px] text-[#8E95A5]">Song composition & unique phrasing</span>
                </div>
                <span className="text-[16px] font-bold text-[#E91E76]">9.7 / 10</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-white block">Technical Craft</span>
                  <span className="text-[11px] text-[#8E95A5]">Guitar tone, vocal pitch, and rhythm</span>
                </div>
                <span className="text-[16px] font-bold text-[#E91E76]">9.8 / 10</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between text-[12px]">
              <span className="text-[#8E95A5]">Calibrated Blind Judges:</span>
              <span className="font-semibold text-white">1,420 Verified Reviews</span>
            </div>

            <button
              type="button"
              onClick={() => setScoreBreakdownOpen(false)}
              className="w-full h-10 rounded-full bg-[#E91E76] text-white text-[12px] font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ====================== MODAL: FANS & BACKERS LIST ======================= */}
      {/* ========================================================================= */}
      {fansModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E91E76]" />
                <h3 className="text-[16px] font-semibold text-white">Backers & Community</h3>
              </div>
              <button
                type="button"
                onClick={() => setFansModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-white text-[12px] font-bold">
                    MK
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-semibold text-white">Maya Krishnan</h4>
                    <span className="text-[10.5px] text-[#E91E76]">Lead Patron • 14 Shows</span>
                  </div>
                </div>
                <Heart className="w-4 h-4 fill-[#E91E76] text-[#E91E76]" />
              </div>

              <div className="p-2.5 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-white text-[12px] font-bold">
                    AM
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-semibold text-white">Arjun Menon</h4>
                    <span className="text-[10.5px] text-amber-300">Verified Stage Peer</span>
                  </div>
                </div>
                <Heart className="w-4 h-4 fill-[#E91E76] text-[#E91E76]" />
              </div>

              <div className="p-2.5 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white text-[12px] font-bold">
                    {isBacked ? 'YOU' : 'BL'}
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-semibold text-white">
                      {isBacked ? 'You (Backing Aarav)' : 'Bengaluru Live Club'}
                    </h4>
                    <span className="text-[10.5px] text-[#9CA3AF]">
                      {isBacked ? 'Patron Backer' : 'Curator'}
                    </span>
                  </div>
                </div>
                <Heart className="w-4 h-4 fill-[#E91E76] text-[#E91E76]" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackTalent}
              className="w-full h-10 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12px] font-semibold uppercase tracking-wider mt-1"
            >
              {isBacked ? 'You are Backing this Talent' : 'Back Aarav Nair (+0.1K)'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ====================== MODAL: SHARE SHEET =============================== */}
      {/* ========================================================================= */}
      {shareSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[430px] bg-[#12141C] border-t border-white/15 rounded-t-3xl p-5 flex flex-col gap-3.5 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-white">Share Aarav Nair</h3>
                <p className="text-[12px] text-[#9CA3AF]">Broadcast performance profile & live takes</p>
              </div>
              <button
                type="button"
                onClick={() => setShareSheetOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setShareSheetOpen(false);
                  showToast('Profile link copied to clipboard!');
                }}
                className="p-3 rounded-2xl bg-[#0A0B10] border border-white/10 flex flex-col items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-[#E91E76]" />
                <span className="text-[10.5px] text-white font-medium">Copy Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShareSheetOpen(false);
                  showToast('Opening WhatsApp share...');
                }}
                className="p-3 rounded-2xl bg-[#0A0B10] border border-white/10 flex flex-col items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Send className="w-5 h-5 text-green-400" />
                <span className="text-[10.5px] text-white font-medium">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShareSheetOpen(false);
                  showToast('Instagram Story card ready!');
                }}
                className="p-3 rounded-2xl bg-[#0A0B10] border border-white/10 flex flex-col items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="text-[10.5px] text-white font-medium">Stories</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShareSheetOpen(false);
                  showToast('QR Code generated for Aarav Nair');
                }}
                className="p-3 rounded-2xl bg-[#0A0B10] border border-white/10 flex flex-col items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Award className="w-5 h-5 text-blue-400" />
                <span className="text-[10.5px] text-white font-medium">QR Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ====================== MODAL: ACTION MENU SHEET ========================= */}
      {/* ========================================================================= */}
      {actionMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[430px] bg-[#12141C] border-t border-white/15 rounded-t-3xl p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-[15px] font-semibold text-white">Artist Actions</h3>
              <button
                type="button"
                onClick={() => setActionMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1 text-[13px]">
              <button
                type="button"
                onClick={() => {
                  setActionMenuOpen(false);
                  setScoreBreakdownOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between text-white hover:border-[#E91E76]"
              >
                <span>View Blind Judging Breakdown</span>
                <Star className="w-4 h-4 text-[#E91E76]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionMenuOpen(false);
                  setInviteModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between text-white hover:border-[#E91E76]"
              >
                <span>Send Festival / Gig Booking Request</span>
                <Calendar className="w-4 h-4 text-[#E91E76]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setActionMenuOpen(false);
                  showToast('Profile link copied!');
                }}
                className="w-full p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between text-white hover:border-[#E91E76]"
              >
                <span>Copy Artist URL</span>
                <Share2 className="w-4 h-4 text-white/70" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionMenuOpen(false);
                  showToast('Feedback submitted to stage curation team.');
                }}
                className="w-full p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between text-[#9CA3AF] hover:text-white"
              >
                <span>Report / Artist Feedback</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ====================== MODAL: GEAR INSPECT MODAL ======================== */}
      {/* ========================================================================= */}
      {gearModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-semibold text-[#E91E76] uppercase tracking-wider block">
                  {gearModalItem.type}
                </span>
                <h3 className="text-[16px] font-bold text-white mt-0.5">{gearModalItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setGearModalItem(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12.5px] text-[#D1D5DB] leading-relaxed">{gearModalItem.desc}</p>
            <button
              type="button"
              onClick={() => {
                setGearModalItem(null);
                showToast(`Saved ${gearModalItem.name} to gear wishlist`);
              }}
              className="w-full h-10 rounded-full bg-[#E91E76] text-white text-[12px] font-semibold mt-1"
            >
              Close Spec
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ====================== MODAL: ADD TAG PROMPT ============================ */}
      {/* ========================================================================= */}
      {newTagPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-white">Add Talent Tag</h3>
              <button
                type="button"
                onClick={() => setNewTagPromptOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTag} className="flex flex-col gap-3">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="e.g. #Folk, #LiveLooping..."
                autoFocus
                className="w-full h-10 px-4 rounded-full bg-[#0A0B10] border border-white/15 text-[13px] text-white focus:outline-none focus:border-[#E91E76]"
              />
              <button
                type="submit"
                className="w-full h-10 rounded-full bg-[#E91E76] text-white text-[12px] font-semibold"
              >
                Add Tag
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================== MODAL: INVITE TO SHOW / BOOKING ====================== */}
      {/* ========================================================================= */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[430px] bg-[#12141C] border-t border-white/15 rounded-t-3xl p-5 flex flex-col gap-3.5 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-white">Invite Aarav to Perform</h3>
                <p className="text-[12px] text-[#9CA3AF]">Send booking inquiry for festival or showcase</p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1 text-[12.5px] text-[#D1D5DB]">
              <div className="p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <span>Base Performance Fee</span>
                <span className="text-[#E91E76] font-semibold">₹45,000 / 60-min Set</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0B10] border border-white/10 flex items-center justify-between">
                <span>Rider Requirements</span>
                <span className="text-white/80">DI Box + 2 Vocal Mics</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setInviteModalOpen(false);
                playChime();
                showToast('Official booking invite transmitted to artist manager!');
              }}
              className="w-full h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12.5px] font-semibold uppercase tracking-wider shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              Send Official Booking Invite
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* =================== MODAL: SHOW TICKET PASSES =========================== */}
      {/* ========================================================================= */}
      {showTicketsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#E91E76] uppercase tracking-wider">
                  Ticket Passes
                </span>
                <h3 className="text-[15px] font-semibold text-white mt-0.5">{showTicketsModal}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketsModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#9CA3AF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!ticketConfirmed ? (
              <>
                <p className="text-[12px] text-[#9CA3AF]">
                  Select your tier. Verified judges receive priority entry.
                </p>

                {/* Tiers */}
                <div className="flex flex-col gap-2 text-[12.5px]">
                  <button
                    type="button"
                    onClick={() => setTicketTier('General')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      ticketTier === 'General'
                        ? 'border-[#E91E76] bg-[#E91E76]/10 text-white'
                        : 'border-white/10 bg-[#0A0B10] text-[#9CA3AF]'
                    }`}
                  >
                    <span>General Admission</span>
                    <span className="font-bold text-[#E91E76]">₹799</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketTier('VIP')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      ticketTier === 'VIP'
                        ? 'border-[#E91E76] bg-[#E91E76]/10 text-white'
                        : 'border-white/10 bg-[#0A0B10] text-[#9CA3AF]'
                    }`}
                  >
                    <span>Backstage VIP + Meet Aarav</span>
                    <span className="font-bold text-[#E91E76]">₹1,999</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketTier('Judge')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      ticketTier === 'Judge'
                        ? 'border-[#E91E76] bg-[#E91E76]/10 text-white'
                        : 'border-white/10 bg-[#0A0B10] text-[#9CA3AF]'
                    }`}
                  >
                    <span>Verified Judge Pass</span>
                    <span className="font-bold text-amber-300">Free Priority</span>
                  </button>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0B10] border border-white/10 text-[12.5px]">
                  <span>Passes Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketQty((prev) => Math.max(1, prev - 1))}
                      className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white"
                    >
                      -
                    </button>
                    <span className="font-bold text-white">{ticketQty}</span>
                    <button
                      type="button"
                      onClick={() => setTicketQty((prev) => Math.min(5, prev + 1))}
                      className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTicketConfirmed(true);
                    playChime();
                    showToast(`Reserved ${ticketQty} pass(es) for ${showTicketsModal}!`);
                  }}
                  className="w-full h-10 rounded-full bg-[#E91E76] text-white text-[12px] font-semibold cursor-pointer"
                >
                  Confirm Reservation ({ticketTier === 'Judge' ? 'Free' : `₹${(ticketTier === 'VIP' ? 1999 : 799) * ticketQty}`})
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-white">Passes Confirmed!</h4>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    {ticketQty}x {ticketTier} Pass for {showTicketsModal}. Digital QR has been saved to your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTicketsModal(null)}
                  className="w-full h-10 rounded-full bg-white/10 text-white text-[12px] font-semibold hover:bg-white/20"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: UPCOMING SHOW PREVIEW & SEATING ================ */}
      {/* ========================================================================= */}
      {selectedShowDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] max-h-[92vh] bg-[#10121A] border-t sm:border border-white/20 rounded-t-[28px] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E91E76] text-white uppercase tracking-wider">
                  Show Preview
                </span>
                <h3 className="text-[14px] font-bold text-white truncate max-w-[200px]">
                  {selectedShowDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedShowDetail(null);
                  setIsPlayingTeaserVideo(false);
                }}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Teaser Video Preview Banner */}
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg">
                <video
                  src={selectedShowDetail.teaserVideo}
                  poster={selectedShowDetail.thumb}
                  autoPlay={isPlayingTeaserVideo}
                  playsInline
                  loop
                  muted={false}
                  controls={isPlayingTeaserVideo}
                  className="w-full h-full object-cover"
                />
                {!isPlayingTeaserVideo && (
                  <div
                    onClick={() => setIsPlayingTeaserVideo(true)}
                    className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="w-13 h-13 rounded-full bg-[#E91E76] flex items-center justify-center text-white shadow-[0_0_24px_rgba(233,30,118,0.7)] group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <span className="text-[11px] font-semibold text-white mt-2 uppercase tracking-wider">
                      Tap to Preview Acoustic Soundcheck
                    </span>
                  </div>
                )}
              </div>

              {/* Show Header & Info */}
              <div>
                <span className="text-[11px] font-bold text-[#E91E76] uppercase tracking-wider">
                  {selectedShowDetail.tagline}
                </span>
                <h2 className="text-[18px] font-bold text-white mt-0.5">
                  {selectedShowDetail.title}
                </h2>
                <div className="flex items-center gap-2 text-[12px] text-[#D1D5DB] mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E91E76]" />
                    {selectedShowDetail.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E91E76]" />
                    {selectedShowDetail.time}
                  </span>
                </div>
              </div>

              {/* Who's Visiting / Attendees Section */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#E91E76]" />
                    <span className="text-[13px] font-semibold text-white">
                      Who’s Visiting ({selectedShowDetail.attendeesCount + (rsvpShowIds[selectedShowDetail.id] ? 1 : 0)})
                    </span>
                  </div>
                  <span className="text-[11px] text-green-400 font-medium">Verified Judges Attending</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[11.5px] text-[#D1D5DB]">
                  {selectedShowDetail.attendeeNames.map((name: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/90"
                    >
                      {name}
                    </span>
                  ))}
                  {rsvpShowIds[selectedShowDetail.id] && (
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-semibold">
                      ✓ You (Attending)
                    </span>
                  )}
                </div>

                {/* RSVP / I'm Going Button */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !rsvpShowIds[selectedShowDetail.id];
                    setRsvpShowIds((prev) => ({ ...prev, [selectedShowDetail.id]: next }));
                    playChime();
                    showToast(next ? `Marked you as visiting ${selectedShowDetail.title}! 🎉` : 'RSVP updated');
                  }}
                  className={`w-full h-10 rounded-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer mt-1 ${
                    rsvpShowIds[selectedShowDetail.id]
                      ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {rsvpShowIds[selectedShowDetail.id] ? 'You Are Listed as Visiting (Tap to cancel)' : 'RSVP: I’m Visiting This Show'}
                  </span>
                </button>
              </div>

              {/* Venue & Directions */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Venue & Coordinates
                </span>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[13.5px] font-semibold text-white leading-tight">
                      {selectedShowDetail.venue}
                    </h4>
                    <p className="text-[12px] text-[#9CA3AF] mt-0.5">{selectedShowDetail.city}</p>
                    <p className="text-[11px] text-white/60 mt-1">Age Limit: {selectedShowDetail.ageLimit} • Dress: {selectedShowDetail.dressCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVenueDirectionsModal({
                        name: selectedShowDetail.venue,
                        address: selectedShowDetail.venueAddress,
                        city: selectedShowDetail.city,
                        transit: selectedShowDetail.transit,
                        parking: selectedShowDetail.parking,
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#E91E76] text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Map & Directions</span>
                  </button>
                </div>
              </div>

              {/* Venue & Stage Preview Photos */}
              {selectedShowDetail.stagePhotos && (
                <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#E91E76]" />
                      <span>Stage & Venue Photos ({selectedShowDetail.stagePhotos.length})</span>
                    </span>
                    <span className="text-[10.5px] text-[#9CA3AF]">Tap to expand</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedShowDetail.stagePhotos.map((photo: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setShowPastGalleryModal(selectedShowDetail.stagePhotos)}
                        className="aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer group"
                      >
                        <img
                          src={photo}
                          alt="Venue stage"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Set Timings & Itinerary */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2.5">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Show Itinerary Timeline
                </span>
                <div className="flex flex-col gap-2">
                  {selectedShowDetail.itinerary.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-[12px]">
                      <span className="font-mono font-bold text-[#E91E76] w-16 shrink-0">
                        {item.time}
                      </span>
                      <span className="text-[#D1D5DB]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Setlist */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Expected Acoustic Setlist
                </span>
                <div className="flex flex-col gap-1 text-[12px] text-[#D1D5DB]">
                  {selectedShowDetail.setlist.map((track: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Music className="w-3 h-3 text-[#E91E76]" />
                      <span>{track}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seating Layout Preview */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-1.5 text-[12px]">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Seating & Experience Preview
                </span>
                <p className="text-[#D1D5DB] leading-relaxed">{selectedShowDetail.seating}</p>
              </div>
            </div>

            {/* Bottom Floating Booking Actions */}
            <div className="p-3.5 bg-[#0A0C12] border-t border-white/10 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCalendarSavedShows((prev) => ({ ...prev, [selectedShowDetail.id]: true }));
                  playChime();
                  showToast(`Added ${selectedShowDetail.title} to your calendar! 📅`);
                }}
                className={`h-11 px-3.5 rounded-full border text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  calendarSavedShows[selectedShowDetail.id]
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/5 border-white/15 text-[#D1D5DB] hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#E91E76]" />
                <span>{calendarSavedShows[selectedShowDetail.id] ? 'In Calendar' : 'Calendar'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedShowDetail(null);
                  setShowTicketsModal(selectedShowDetail.title);
                  setTicketTier('General');
                  setTicketQty(1);
                  setTicketConfirmed(false);
                }}
                className="flex-1 h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12.5px] font-semibold uppercase tracking-wider shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                Reserve Passes ({selectedShowDetail.price})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: PREVIOUS SHOW RECAP, SETLIST & REVIEWS ========= */}
      {/* ========================================================================= */}
      {selectedPastShowDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] max-h-[92vh] bg-[#10121A] border-t sm:border border-white/20 rounded-t-[28px] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Past Show Archive
                </span>
                <h3 className="text-[14px] font-bold text-white truncate max-w-[200px]">
                  {selectedPastShowDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPastShowDetail(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Highlight Live Video Replay */}
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg">
                <video
                  src={selectedPastShowDetail.videoHighlight}
                  poster={selectedPastShowDetail.thumb}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Stats */}
              <div>
                <span className="text-[11px] font-bold text-[#E91E76] uppercase tracking-wider">
                  {selectedPastShowDetail.subtitle}
                </span>
                <h2 className="text-[18px] font-bold text-white mt-0.5">
                  {selectedPastShowDetail.title}
                </h2>
                <div className="flex items-center gap-3 text-[12px] text-[#D1D5DB] mt-1.5 flex-wrap">
                  <span>{selectedPastShowDetail.date}</span>
                  <span>•</span>
                  <span>{selectedPastShowDetail.venue}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-white">
                    👥 {selectedPastShowDetail.visitorsCount} People Visited
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-300">
                    ⭐ {selectedPastShowDetail.rating} ({selectedPastShowDetail.ratingCount} reviews)
                  </span>
                </div>
              </div>

              {/* Setlist Played */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Official Setlist Played at this Show
                </span>
                <div className="flex flex-col gap-1.5 text-[12.5px] text-white">
                  {selectedPastShowDetail.setlistPlayed.map((song: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                      <Music className="w-3.5 h-3.5 text-[#E91E76]" />
                      <span>{song}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Crowd Photos Gallery */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#E91E76]" />
                    <span>Crowd & Stage Moments</span>
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">Tap to expand</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {selectedPastShowDetail.photos.map((photo: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setShowPastGalleryModal(selectedPastShowDetail.photos)}
                      className="aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer group relative"
                    >
                      <img
                        src={photo}
                        alt="Stage moment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Ratings Breakdown */}
              {selectedPastShowDetail.dimensionRatings && (
                <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                    Show Ratings Breakdown ({selectedPastShowDetail.ratingCount} Verified Reviews)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                      <span className="text-[#9CA3AF]">Sound & Tone</span>
                      <span className="font-bold text-amber-300">{selectedPastShowDetail.dimensionRatings.sound} ⭐</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                      <span className="text-[#9CA3AF]">Atmosphere</span>
                      <span className="font-bold text-amber-300">{selectedPastShowDetail.dimensionRatings.atmosphere} ⭐</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                      <span className="text-[#9CA3AF]">Performance Craft</span>
                      <span className="font-bold text-amber-300">{selectedPastShowDetail.dimensionRatings.craft} ⭐</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                      <span className="text-[#9CA3AF]">Ticket Value</span>
                      <span className="font-bold text-amber-300">{selectedPastShowDetail.dimensionRatings.value} ⭐</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Visitor Memories & Reviews */}
              <div className="p-3.5 rounded-2xl bg-[#0A0C12] border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                    Attendee Reviews & Memories
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewShowModal(selectedPastShowDetail.id);
                      setNewReviewRating(5);
                      setNewReviewText('');
                    }}
                    className="text-[11px] text-[#E91E76] font-semibold hover:underline cursor-pointer"
                  >
                    + Write a Review
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {(pastShowUserReviews[selectedPastShowDetail.id] || []).map((rev, idx) => (
                    <div key={`user-${idx}`} className="p-2.5 rounded-xl bg-[#E91E76]/10 border border-[#E91E76]/30 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-semibold text-white">{rev.author}</span>
                        <span className="text-amber-300 font-bold">{rev.stars}.0 ⭐</span>
                      </div>
                      <span className="text-[10px] text-[#E91E76] font-medium">{rev.role} • {rev.time}</span>
                      <p className="text-[12.5px] text-white mt-0.5 italic">"{rev.comment}"</p>
                    </div>
                  ))}

                  {selectedPastShowDetail.visitorReviews.map((rev: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/[0.06] flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-semibold text-white">{rev.author}</span>
                        <span className="text-amber-300 font-bold">5.0 ⭐</span>
                      </div>
                      <span className="text-[10px] text-[#E91E76] font-medium">{rev.role}</span>
                      <p className="text-[12px] text-[#D1D5DB] mt-0.5 italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Done / I Was There */}
            <div className="p-3.5 bg-[#0A0C12] border-t border-white/10 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const next = !attendedPastShowIds[selectedPastShowDetail.id];
                  setAttendedPastShowIds((prev) => ({ ...prev, [selectedPastShowDetail.id]: next }));
                  playChime();
                  showToast(next ? `Marked you as an attendee of ${selectedPastShowDetail.title}! 🎟️` : 'Attendance unmarked');
                }}
                className={`flex-1 h-11 rounded-full text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  attendedPastShowIds[selectedPastShowDetail.id]
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>
                  {attendedPastShowIds[selectedPastShowDetail.id]
                    ? '✓ You Attended This Show (Badge Earned)'
                    : '+ I Was There at this Show'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: PHOTO GALLERY LIGHTBOX ========================= */}
      {/* ========================================================================= */}
      {showPastGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between z-10">
            <span className="text-[13px] font-semibold text-white">Live Concert Photos</span>
            <button
              type="button"
              onClick={() => setShowPastGalleryModal(null)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center gap-3 overflow-x-auto py-4">
            {showPastGalleryModal.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Concert stage"
                className="max-h-[70vh] rounded-2xl object-contain border border-white/20"
              />
            ))}
          </div>

          <div className="text-center text-[12px] text-[#9CA3AF]">
            Photos taken by verified attendees & stage photographers
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: WRITE SHOW REVIEW & MEMORY ===================== */}
      {/* ========================================================================= */}
      {reviewShowModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  Verified Review
                </span>
                <h3 className="text-[15px] font-bold text-white">Review Past Show</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewShowModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newReviewText.trim() || !reviewShowModal) return;
                const newRev = {
                  author: 'You (Calibrated Judge)',
                  role: 'Verified Stage Judge',
                  stars: newReviewRating,
                  comment: newReviewText.trim(),
                  time: 'Just now',
                };
                setPastShowUserReviews((prev) => ({
                  ...prev,
                  [reviewShowModal]: [newRev, ...(prev[reviewShowModal] || [])],
                }));
                setAttendedPastShowIds((prev) => ({ ...prev, [reviewShowModal]: true }));
                playChime();
                showToast('Your verified review was published to show archive! ⭐');
                setReviewShowModal(null);
                setNewReviewText('');
                setNewReviewRating(5);
              }}
              className="flex flex-col gap-3"
            >
              {/* Star Rating */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-[#9CA3AF]">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 cursor-pointer active:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-[13px] font-bold text-amber-300 ml-2">
                    {newReviewRating}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-[#9CA3AF]">Your Memory & Audio Critique</label>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="How was the acoustic resonance, crowd atmosphere, and stage presence?"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#090A0F] border border-white/15 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#E91E76] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!newReviewText.trim()}
                className="w-full h-11 rounded-full bg-gradient-to-r from-amber-400 to-[#E91E76] disabled:opacity-50 text-black font-bold text-[12px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform cursor-pointer mt-1"
              >
                Publish Verified Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: VENUE MAP & DIRECTIONS ========================= */}
      {/* ========================================================================= */}
      {venueDirectionsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#E91E76]" />
                <h3 className="text-[15px] font-bold text-white">Venue Coordinates & Map</h3>
              </div>
              <button
                type="button"
                onClick={() => setVenueDirectionsModal(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="p-3 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Venue Name</span>
                <span className="font-semibold text-white">{venueDirectionsModal.name}</span>
                <span className="text-[#9CA3AF] text-[11px]">{venueDirectionsModal.address}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Metro & Public Transit</span>
                <span className="text-white">{venueDirectionsModal.transit}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Parking & Valet</span>
                <span className="text-[#D1D5DB]">{venueDirectionsModal.parking}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast(`Opening navigation to ${venueDirectionsModal.name}`);
                setVenueDirectionsModal(null);
              }}
              className="w-full h-10 rounded-full bg-[#E91E76] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate in Google Maps</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Reaction Emojis */}
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

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#181C26]/95 border border-[#E91E76]/50 shadow-2xl backdrop-blur-md text-[12px] font-medium text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Sparkles className="w-4 h-4 text-[#E91E76]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* iOS Home Indicator Bar */}
      <div className="w-[134px] h-[4.5px] bg-white rounded-full mx-auto mt-6" />
    </div>
  );
}
