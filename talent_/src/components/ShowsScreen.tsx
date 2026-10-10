import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Ticket,
  Users,
  ChevronRight,
  ArrowRight,
  Star,
  Check,
  X,
  Sparkles,
  Play,
  Navigation,
  Camera,
  Award,
  Clock,
  Music,
  Share2,
  CheckCircle,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react';
import { GeneratedArtworks } from '../utils/stageArtwork';
import { RoomData } from './LiveRoomModal';
import { ShowsLogoIcon } from './icons/NavigationLogos';
import {
  UPCOMING_SHOWS_CATALOG,
  PREVIOUS_SHOWS_ARCHIVE,
  UpcomingShowItem,
  PreviousShowItem,
  ShowReview,
} from '../utils/showsData';

interface ShowsScreenProps {
  artworks: GeneratedArtworks;
  rooms: RoomData[];
  onEnterRoom: (room: RoomData) => void;
  onOpenProfile: (id: string) => void;
}

export default function ShowsScreen({
  artworks,
  rooms,
  onEnterRoom,
  onOpenProfile,
}: ShowsScreenProps) {
  // Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Previous'>('Upcoming');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  // Interactive User States (Persistent within session)
  const [rsvpShowIds, setRsvpShowIds] = useState<Record<string, boolean>>({
    'show-aarav-indiranagar': true,
  });
  const [attendedPastShowIds, setAttendedPastShowIds] = useState<Record<string, boolean>>({
    'past-prithvi-theatre': true,
  });
  const [customReviews, setCustomReviews] = useState<Record<string, ShowReview[]>>({});

  // Modals
  const [selectedUpcomingShow, setSelectedUpcomingShow] = useState<UpcomingShowItem | null>(null);
  const [selectedPastShow, setSelectedPastShow] = useState<PreviousShowItem | null>(null);
  const [ticketModalShow, setTicketModalShow] = useState<UpcomingShowItem | null>(null);
  const [ticketTier, setTicketTier] = useState<'General' | 'VIP' | 'Judge'>('General');
  const [ticketQty, setTicketQty] = useState<number>(1);
  const [ticketConfirmed, setTicketConfirmed] = useState<boolean>(false);
  const [venueModalShow, setVenueModalShow] = useState<UpcomingShowItem | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [reviewModalPastShow, setReviewModalPastShow] = useState<PreviousShowItem | null>(null);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newReviewRole, setNewReviewRole] = useState<string>('Verified Judge');
  const [isPlayingTeaser, setIsPlayingTeaser] = useState<boolean>(false);
  const [auditionModalOpen, setAuditionModalOpen] = useState<boolean>(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } catch {
      // AudioContext unavailable
    }
  };

  // City list
  const cities = ['All Cities', 'Bengaluru', 'Mumbai', 'Kochi', 'Delhi NCR', 'Goa'];

  // Filtered Shows
  const filteredUpcoming = UPCOMING_SHOWS_CATALOG.filter(
    (s) => selectedCity === 'All Cities' || s.city === selectedCity
  );

  const filteredPrevious = PREVIOUS_SHOWS_ARCHIVE.filter(
    (s) => selectedCity === 'All Cities' || s.city === selectedCity
  );

  // Handle RSVP Toggle
  const handleToggleRsvp = (show: UpcomingShowItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = !rsvpShowIds[show.id];
    setRsvpShowIds((prev) => ({ ...prev, [show.id]: next }));
    playChime();
    showToast(next ? `You're RSVP'd to ${show.title}! 🎟️ Check-in QR unlocked.` : `Removed RSVP for ${show.title}`);
  };

  // Handle Past Show Attendance Toggle
  const handleToggleAttendance = (show: PreviousShowItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = !attendedPastShowIds[show.id];
    setAttendedPastShowIds((prev) => ({ ...prev, [show.id]: next }));
    playChime();
    showToast(
      next
        ? `Added verified alumni badge for ${show.title}! 🏆`
        : `Removed attendance mark for ${show.title}`
    );
  };

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalPastShow || !newReviewText.trim()) return;

    const newRev: ShowReview = {
      id: `rev-custom-${Date.now()}`,
      author: 'You (Calibrated Judge)',
      avatar: artworks.userAvatar,
      role: newReviewRole,
      stars: newReviewRating,
      comment: newReviewText.trim(),
      time: 'Just now',
      verified: true,
    };

    setCustomReviews((prev) => ({
      ...prev,
      [reviewModalPastShow.id]: [newRev, ...(prev[reviewModalPastShow.id] || [])],
    }));

    // Auto mark as attended
    setAttendedPastShowIds((prev) => ({ ...prev, [reviewModalPastShow.id]: true }));

    playChime();
    showToast('Your verified show review has been published! ⭐');
    setReviewModalPastShow(null);
    setNewReviewText('');
    setNewReviewRating(5);
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-1 pb-24 text-white overflow-y-auto no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1A1D27]/95 border border-[#DF1E76] shadow-2xl backdrop-blur-md text-[12px] font-medium text-white flex items-center gap-2 animate-in fade-in duration-150">
          <Sparkles className="w-4 h-4 text-[#DF1E76]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with Logo & Subtitle */}
      <div className="flex items-center justify-between mt-1 mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#DF1E76]/25 to-[#DF1E76]/10 border border-[#DF1E76]/40 flex items-center justify-center text-[#DF1E76] shadow-[0_0_12px_rgba(223,30,118,0.25)] shrink-0">
              <ShowsLogoIcon size={18} isActive={true} className="text-[#DF1E76]" />
            </div>
            <h1 className="font-brand text-[28px] font-bold text-white tracking-[-0.01em] leading-tight">
              Shows
            </h1>
          </div>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">
            Live concerts • Venue previews • Past gig archives & ratings
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAuditionModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#DF1E76] text-[11px] font-semibold text-white/90 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#DF1E76]" />
          <span>Audition Take</span>
        </button>
      </div>

      {/* 2. DUAL MAIN SUB-TABS: UPCOMING SHOWS VS PREVIOUS SHOWS ARCHIVE */}
      <div className="flex items-center p-1 rounded-2xl bg-[#11131B] border border-white/10 mb-3 select-none shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('Upcoming')}
          className={`flex-1 py-2 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'Upcoming'
              ? 'bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white shadow-md'
              : 'text-[#8E95A5] hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming Shows ({filteredUpcoming.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Previous')}
          className={`flex-1 py-2 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'Previous'
              ? 'bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white shadow-md'
              : 'text-[#8E95A5] hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Previous Archive ({filteredPrevious.length})</span>
        </button>
      </div>

      {/* 3. City Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 select-none -mx-4 px-4">
        {cities.map((city) => {
          const isActive = selectedCity === city;
          return (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#18111B] border border-[#DF1E76] text-white shadow-[0_0_12px_rgba(223,30,118,0.35)]'
                  : 'bg-[#12141C] border border-white/10 text-[#9CA3AF] hover:text-white'
              }`}
            >
              <span>{city}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ================= VIEW 1: UPCOMING SHOWS & HOW PEOPLE VISIT ============= */}
      {/* ========================================================================= */}
      {activeTab === 'Upcoming' && (
        <div className="flex flex-col gap-4">
          {/* Top Banner Notice */}
          <div className="flex items-center justify-between text-[12px] px-1 text-[#9CA3AF]">
            <span>Confirmed live stage dates & RSVP list</span>
            <span className="text-[#E91E76] font-semibold">Priority Judge Passes</span>
          </div>

          {/* Featured Hero Card if viewing all or Bengaluru */}
          {filteredUpcoming.length > 0 && (
            <div className="relative w-full aspect-[16/11.5] rounded-3xl overflow-hidden border border-white/15 bg-[#0F0A06] shadow-2xl group">
              <img
                src={filteredUpcoming[0].thumb}
                alt={filteredUpcoming[0].title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />

              {/* Status Badge */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DF1E76]/90 backdrop-blur-md text-[10px] font-bold tracking-wider text-white uppercase shadow-md">
                <Star className="w-3 h-3 fill-white" />
                <span>{filteredUpcoming[0].status}</span>
              </div>

              {/* Hero Info */}
              <div className="absolute inset-x-4 bottom-4 flex flex-col">
                <div
                  onClick={() => onOpenProfile(filteredUpcoming[0].artistId)}
                  className="flex items-center gap-2 cursor-pointer mb-1 group/art"
                >
                  <img
                    src={filteredUpcoming[0].artistAvatar}
                    alt={filteredUpcoming[0].artistName}
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                  <span className="text-[12px] font-semibold text-white/90 group-hover/art:text-[#DF1E76]">
                    {filteredUpcoming[0].artistName} • {filteredUpcoming[0].genre}
                  </span>
                </div>

                <h2 className="font-brand text-[21px] font-bold text-white leading-tight">
                  {filteredUpcoming[0].title}
                </h2>
                <p className="text-[11.5px] text-[#D1D5DB] mt-0.5 line-clamp-1">
                  {filteredUpcoming[0].tagline}
                </p>

                {/* Venue Coordinates */}
                <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] mt-1.5">
                  <MapPin className="w-3 h-3 text-[#DF1E76] shrink-0" />
                  <span className="truncate">{filteredUpcoming[0].venue}</span>
                  <span>•</span>
                  <span>{filteredUpcoming[0].day} {filteredUpcoming[0].month}</span>
                </div>

                {/* Attendees Social Proof */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {filteredUpcoming[0].attendees.slice(0, 3).map((a, i) => (
                        <img
                          key={i}
                          src={a.avatar}
                          alt={a.name}
                          className="w-5 h-5 rounded-full border border-black object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#D1D5DB]">
                      <strong className="text-white">
                        {filteredUpcoming[0].attendeesCount + (rsvpShowIds[filteredUpcoming[0].id] ? 1 : 0)}
                      </strong>{' '}
                      visiting
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleRsvp(filteredUpcoming[0], e)}
                    className={`px-3 py-1 rounded-full text-[10.5px] font-semibold transition-all active:scale-95 cursor-pointer ${
                      rsvpShowIds[filteredUpcoming[0].id]
                        ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    {rsvpShowIds[filteredUpcoming[0].id] ? '✓ You’re Visiting' : '+ RSVP / Visiting'}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUpcomingShow(filteredUpcoming[0]);
                      setIsPlayingTeaser(false);
                    }}
                    className="h-9 px-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Preview Show & Seating</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTicketModalShow(filteredUpcoming[0]);
                      setTicketTier('General');
                      setTicketQty(1);
                      setTicketConfirmed(false);
                    }}
                    className="h-9 px-3 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Passes ({filteredUpcoming[0].price})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List of All Upcoming Shows */}
          <div className="flex flex-col gap-3">
            <h3 className="font-brand text-[16px] font-bold text-white mt-1">
              All Scheduled Live Shows
            </h3>

            {filteredUpcoming.map((show) => {
              const isGoing = rsvpShowIds[show.id];
              return (
                <div
                  key={show.id}
                  className="p-3.5 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/25 flex flex-col gap-3 transition-colors shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center w-11 py-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0 text-center">
                      <span className="text-[17px] font-bold text-white leading-none">{show.day}</span>
                      <span className="text-[9.5px] font-bold uppercase text-[#DF1E76] mt-0.5">
                        {show.month}
                      </span>
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#DF1E76]/20 border border-[#DF1E76]/40 text-[#DF1E76] font-bold uppercase">
                          {show.status}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] truncate">{show.time}</span>
                      </div>

                      <h4 className="text-[14.5px] font-bold text-white mt-1 leading-snug">
                        {show.title}
                      </h4>

                      <div
                        onClick={() => onOpenProfile(show.artistId)}
                        className="text-[11.5px] text-[#D1D5DB] hover:text-[#DF1E76] cursor-pointer flex items-center gap-1 mt-0.5"
                      >
                        <span>{show.artistName}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-[#9CA3AF]">{show.genre}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] mt-1 truncate">
                        <MapPin className="w-3 h-3 text-[#DF1E76] shrink-0" />
                        <span className="truncate">{show.venue} • {show.city}</span>
                      </div>
                    </div>

                    {/* Stage Preview Thumbnail */}
                    <div
                      onClick={() => {
                        setSelectedUpcomingShow(show);
                        setIsPlayingTeaser(false);
                      }}
                      className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/15 relative cursor-pointer group"
                    >
                      <img
                        src={show.thumb}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Attendees & RSVP Section */}
                  <div className="p-2.5 rounded-xl bg-[#090A0F] border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {show.attendees.slice(0, 3).map((att, i) => (
                          <img
                            key={i}
                            src={att.avatar}
                            alt={att.name}
                            className="w-5 h-5 rounded-full border border-black object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#D1D5DB]">
                        <strong className="text-white">{show.attendeesCount + (isGoing ? 1 : 0)}</strong> visiting
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleRsvp(show, e)}
                      className={`px-3 py-1 rounded-full text-[10.5px] font-semibold transition-all active:scale-95 cursor-pointer ${
                        isGoing
                          ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isGoing ? '✓ You’re Visiting' : '+ RSVP / Visiting'}
                    </button>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUpcomingShow(show);
                        setIsPlayingTeaser(false);
                      }}
                      className="flex-1 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Preview Show & Seating</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVenueModalShow(show)}
                      className="h-9 px-3 rounded-full bg-white/5 border border-white/15 hover:border-white/30 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Map & Location"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#DF1E76]" />
                      <span>Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTicketModalShow(show);
                        setTicketTier('General');
                        setTicketQty(1);
                        setTicketConfirmed(false);
                      }}
                      className="h-9 px-4 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[11.5px] font-semibold shadow-md active:scale-95 transition-transform cursor-pointer"
                    >
                      Passes ({show.price})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= VIEW 2: PREVIOUS SHOWS ARCHIVE & RATINGS ============== */}
      {/* ========================================================================= */}
      {activeTab === 'Previous' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-[12px] px-1 text-[#9CA3AF]">
            <span>Historical gig logs, verified ratings & attendee reviews</span>
            <span className="text-amber-300 font-semibold">100% Sold Out Archive</span>
          </div>

          {filteredPrevious.map((show) => {
            const wasThere = attendedPastShowIds[show.id];
            const reviewsForShow = [
              ...(customReviews[show.id] || []),
              ...show.visitorReviews,
            ];

            return (
              <div
                key={show.id}
                className="p-4 rounded-2xl bg-[#11131B] border border-white/10 hover:border-white/20 flex flex-col gap-3 transition-colors shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider">
                        {show.capacity}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF]">{show.date}</span>
                    </div>

                    <h3 className="text-[16px] font-bold text-white mt-1 leading-tight">
                      {show.title}
                    </h3>

                    <div
                      onClick={() => onOpenProfile(show.artistId)}
                      className="text-[12px] text-[#D1D5DB] hover:text-[#DF1E76] cursor-pointer flex items-center gap-1 mt-0.5"
                    >
                      <span>{show.artistName}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-[#9CA3AF]">{show.city}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] mt-1">
                      <MapPin className="w-3 h-3 text-[#DF1E76] shrink-0" />
                      <span>{show.venue}</span>
                    </div>
                  </div>

                  {/* Rating Score Pill */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      <Star className="w-3.5 h-3.5 fill-amber-300" />
                      <span className="text-[13px] font-bold">{show.rating}</span>
                    </div>
                    <span className="text-[10px] text-[#8E95A5] mt-1 block">
                      {show.ratingCount + (customReviews[show.id]?.length || 0)} ratings
                    </span>
                  </div>
                </div>

                {/* People Visited Counter & Attendee Roll Call */}
                <div className="p-2.5 rounded-xl bg-[#090A0F] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#DF1E76]" />
                    <span className="text-[11.5px] text-[#D1D5DB]">
                      <strong className="text-white">
                        {show.visitorsCount + (wasThere ? 1 : 0)}
                      </strong>{' '}
                      people visited
                    </span>
                  </div>

                  {/* I Was There Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleAttendance(show, e)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
                      wasThere
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-white/5 border border-white/15 text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {wasThere ? '✓ I Was There (Alumni)' : '+ I Was There'}
                  </button>
                </div>

                {/* Setlist preview */}
                <div className="p-2.5 rounded-xl bg-[#090A0F] border border-white/[0.06] flex flex-col gap-1 text-[11.5px]">
                  <span className="text-[10px] uppercase font-bold text-[#8E95A5] tracking-wider flex items-center gap-1">
                    <Music className="w-3 h-3 text-[#DF1E76]" />
                    <span>Setlist Played at Show:</span>
                  </span>
                  <div className="text-[#D1D5DB] truncate">
                    {show.setlistPlayed.join(' • ')}
                  </div>
                </div>

                {/* Night-of Stage Photos Thumbnail Grid */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  {show.photos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setLightboxPhotos(show.photos);
                        setLightboxIndex(i);
                      }}
                      className="w-20 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0 cursor-pointer group relative"
                    >
                      <img
                        src={photo}
                        alt="Stage moment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedPastShow(show)}
                    className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[10px] text-[#9CA3AF] hover:text-white cursor-pointer shrink-0"
                  >
                    <span>+{show.photos.length}</span>
                    <span>photos</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPastShow(show)}
                    className="flex-1 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Replay & Full Recap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewModalPastShow(show);
                      setNewReviewRating(5);
                      setNewReviewText('');
                    }}
                    className="h-9 px-3.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>Write Review</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL 1: UPCOMING SHOW PREVIEW & SEATING ============== */}
      {/* ========================================================================= */}
      {selectedUpcomingShow && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] max-h-[92vh] bg-[#10121A] border-t sm:border border-white/20 rounded-t-[28px] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DF1E76] text-white uppercase tracking-wider">
                  Show Preview
                </span>
                <h3 className="text-[14px] font-bold text-white truncate max-w-[200px]">
                  {selectedUpcomingShow.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUpcomingShow(null);
                  setIsPlayingTeaser(false);
                }}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Soundcheck / Acoustic Teaser Player */}
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg">
                <video
                  src={selectedUpcomingShow.teaserVideo}
                  poster={selectedUpcomingShow.thumb}
                  autoPlay={isPlayingTeaser}
                  playsInline
                  loop
                  muted={false}
                  controls={isPlayingTeaser}
                  className="w-full h-full object-cover"
                />
                {!isPlayingTeaser && (
                  <div
                    onClick={() => setIsPlayingTeaser(true)}
                    className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#DF1E76] flex items-center justify-center text-white shadow-[0_0_24px_rgba(223,30,118,0.7)] group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <span className="text-[11px] font-semibold text-white mt-2 uppercase tracking-wider">
                      Tap to Preview Acoustic Soundcheck
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Timing Info */}
              <div>
                <span className="text-[11px] font-bold text-[#DF1E76] uppercase tracking-wider">
                  {selectedUpcomingShow.tagline}
                </span>
                <h2 className="text-[18px] font-bold text-white mt-0.5">
                  {selectedUpcomingShow.title}
                </h2>
                <div className="flex items-center gap-2 text-[12px] text-[#D1D5DB] mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#DF1E76]" />
                    {selectedUpcomingShow.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#DF1E76]" />
                    {selectedUpcomingShow.time}
                  </span>
                </div>
              </div>

              {/* How People Will Be Visiting & Attendees */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#DF1E76]" />
                    <span className="text-[13px] font-semibold text-white">
                      Who’s Visiting ({selectedUpcomingShow.attendeesCount + (rsvpShowIds[selectedUpcomingShow.id] ? 1 : 0)})
                    </span>
                  </div>
                  <span className="text-[11px] text-green-400 font-medium">Verified Judges Attending</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[11.5px] text-[#D1D5DB]">
                  {selectedUpcomingShow.attendees.map((att, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 flex items-center gap-1.5"
                    >
                      <img
                        src={att.avatar}
                        alt={att.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{att.name}</span>
                    </div>
                  ))}
                  {rsvpShowIds[selectedUpcomingShow.id] && (
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-semibold">
                      ✓ You (Attending)
                    </span>
                  )}
                </div>

                {/* RSVP / I'm Going Button */}
                <button
                  type="button"
                  onClick={() => handleToggleRsvp(selectedUpcomingShow)}
                  className={`w-full h-10 rounded-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer mt-1 ${
                    rsvpShowIds[selectedUpcomingShow.id]
                      ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {rsvpShowIds[selectedUpcomingShow.id]
                      ? 'You Are Listed as Visiting (Tap to cancel)'
                      : 'RSVP: I’m Visiting This Show'}
                  </span>
                </button>
              </div>

              {/* Venue Coordinates & Directions */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Venue & Coordinates
                </span>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[13.5px] font-semibold text-white leading-tight">
                      {selectedUpcomingShow.venue}
                    </h4>
                    <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">{selectedUpcomingShow.venueAddress}</p>
                    <p className="text-[11px] text-white/70 mt-1">
                      Age Limit: {selectedUpcomingShow.ageLimit} • Dress: {selectedUpcomingShow.dressCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVenueModalShow(selectedUpcomingShow)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#DF1E76] text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Map Guide</span>
                  </button>
                </div>
              </div>

              {/* Stage & Venue Photos */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#DF1E76]" />
                    <span>Stage & Venue Photos ({selectedUpcomingShow.stagePhotos.length})</span>
                  </span>
                  <span className="text-[10.5px] text-[#9CA3AF]">Tap to expand</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedUpcomingShow.stagePhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setLightboxPhotos(selectedUpcomingShow.stagePhotos);
                        setLightboxIndex(idx);
                      }}
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

              {/* Set Timings & Itinerary */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2.5">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Show Itinerary Timeline
                </span>
                <div className="flex flex-col gap-2">
                  {selectedUpcomingShow.itinerary.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[12px]">
                      <span className="font-mono font-bold text-[#DF1E76] w-16 shrink-0">
                        {item.time}
                      </span>
                      <span className="text-[#D1D5DB]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Setlist */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Expected Acoustic Setlist
                </span>
                <div className="flex flex-col gap-1 text-[12px] text-[#D1D5DB]">
                  {selectedUpcomingShow.setlist.map((track, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Music className="w-3 h-3 text-[#DF1E76]" />
                      <span>{track}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seating Layout Preview */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-1.5 text-[12px]">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Seating & Experience Preview
                </span>
                <p className="text-[#D1D5DB] leading-relaxed">{selectedUpcomingShow.seating}</p>
              </div>
            </div>

            {/* Bottom Floating Booking Actions */}
            <div className="p-3.5 bg-[#090A0F] border-t border-white/10 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedUpcomingShow(null);
                  setTicketModalShow(selectedUpcomingShow);
                  setTicketTier('General');
                  setTicketQty(1);
                  setTicketConfirmed(false);
                }}
                className="flex-1 h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12.5px] font-semibold uppercase tracking-wider shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                Reserve Passes ({selectedUpcomingShow.price})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL 2: PREVIOUS SHOW RECAP & RATINGS ================ */}
      {/* ========================================================================= */}
      {selectedPastShow && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] max-h-[92vh] bg-[#10121A] border-t sm:border border-white/20 rounded-t-[28px] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Past Show Archive
                </span>
                <h3 className="text-[14px] font-bold text-white truncate max-w-[200px]">
                  {selectedPastShow.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPastShow(null)}
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
                  src={selectedPastShow.videoHighlight}
                  poster={selectedPastShow.thumb}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Stats */}
              <div>
                <span className="text-[11px] font-bold text-[#DF1E76] uppercase tracking-wider">
                  {selectedPastShow.subtitle}
                </span>
                <h2 className="text-[18px] font-bold text-white mt-0.5">
                  {selectedPastShow.title}
                </h2>
                <div className="flex items-center gap-3 text-[12px] text-[#D1D5DB] mt-1.5 flex-wrap">
                  <span>{selectedPastShow.date}</span>
                  <span>•</span>
                  <span>{selectedPastShow.venue}</span>
                  <span>•</span>
                  <span>{selectedPastShow.city}</span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-white">
                    👥 {selectedPastShow.visitorsCount + (attendedPastShowIds[selectedPastShow.id] ? 1 : 0)} People Visited
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-300">
                    ⭐ {selectedPastShow.rating} ({selectedPastShow.ratingCount + (customReviews[selectedPastShow.id]?.length || 0)} ratings)
                  </span>
                </div>
              </div>

              {/* 5-DIMENSION RATINGS BREAKDOWN */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                    Audience & Critic Ratings Breakdown
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold">
                    {selectedPastShow.rating} / 5.0 ⭐
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-[11.5px]">
                  <div>
                    <div className="flex justify-between text-[#D1D5DB] mb-1">
                      <span>Acoustic Sound & Tone Quality</span>
                      <span className="font-bold text-amber-300">{selectedPastShow.dimensionRatings.sound} ⭐</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#DF1E76] rounded-full"
                        style={{ width: `${(selectedPastShow.dimensionRatings.sound / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#D1D5DB] mb-1">
                      <span>Crowd Energy & Atmosphere</span>
                      <span className="font-bold text-amber-300">{selectedPastShow.dimensionRatings.atmosphere} ⭐</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#DF1E76] rounded-full"
                        style={{ width: `${(selectedPastShow.dimensionRatings.atmosphere / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#D1D5DB] mb-1">
                      <span>Artist Craft & Stage Presence</span>
                      <span className="font-bold text-amber-300">{selectedPastShow.dimensionRatings.craft} ⭐</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#DF1E76] rounded-full"
                        style={{ width: `${(selectedPastShow.dimensionRatings.craft / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#D1D5DB] mb-1">
                      <span>Seating & Venue Comfort</span>
                      <span className="font-bold text-amber-300">{selectedPastShow.dimensionRatings.comfort} ⭐</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#DF1E76] rounded-full"
                        style={{ width: `${(selectedPastShow.dimensionRatings.comfort / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#D1D5DB] mb-1">
                      <span>Ticket Experience Value</span>
                      <span className="font-bold text-amber-300">{selectedPastShow.dimensionRatings.value} ⭐</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#DF1E76] rounded-full"
                        style={{ width: `${(selectedPastShow.dimensionRatings.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Setlist Played */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                  Official Setlist Played at this Show
                </span>
                <div className="flex flex-col gap-1.5 text-[12.5px] text-white">
                  {selectedPastShow.setlistPlayed.map((song, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                      <Music className="w-3.5 h-3.5 text-[#DF1E76]" />
                      <span>{song}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Crowd Photos Gallery */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#DF1E76]" />
                    <span>Crowd & Stage Moments</span>
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">Tap to expand</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {selectedPastShow.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setLightboxPhotos(selectedPastShow.photos);
                        setLightboxIndex(idx);
                      }}
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

              {/* Verified Attendee Reviews */}
              <div className="p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#8E95A5] tracking-wider">
                    Attendee Reviews & Memories
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewModalPastShow(selectedPastShow);
                      setNewReviewRating(5);
                      setNewReviewText('');
                    }}
                    className="text-[11px] text-[#DF1E76] font-semibold hover:underline cursor-pointer"
                  >
                    + Write a Review
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    ...(customReviews[selectedPastShow.id] || []),
                    ...selectedPastShow.visitorReviews,
                  ].map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/[0.06] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-[11.5px]">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="font-semibold text-white">{rev.author}</span>
                        </div>
                        <span className="text-amber-300 font-bold">{rev.stars}.0 ⭐</span>
                      </div>
                      <span className="text-[10px] text-[#DF1E76] font-medium">{rev.role} • {rev.time}</span>
                      <p className="text-[12px] text-[#D1D5DB] mt-0.5 italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Done / I Was There */}
            <div className="p-3.5 bg-[#090A0F] border-t border-white/10 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleAttendance(selectedPastShow)}
                className={`flex-1 h-11 rounded-full text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  attendedPastShowIds[selectedPastShow.id]
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>
                  {attendedPastShowIds[selectedPastShow.id]
                    ? '✓ You Attended This Show (Badge Earned)'
                    : '+ I Was There at this Show'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL 3: WRITE A REVIEW & SHARE MEMORY ================ */}
      {/* ========================================================================= */}
      {reviewModalPastShow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] text-amber-300 font-bold uppercase tracking-wider">
                  Verified Review
                </span>
                <h3 className="text-[16px] font-bold text-white">
                  {reviewModalPastShow.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalPastShow(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
              {/* Star Selector */}
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

              {/* Role selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-[#9CA3AF]">Your Attendee Badge</label>
                <select
                  value={newReviewRole}
                  onChange={(e) => setNewReviewRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#090A0F] border border-white/15 text-[12px] text-white focus:outline-none focus:border-[#DF1E76]"
                >
                  <option value="Verified Judge">Verified Judge (Calibrated Ear)</option>
                  <option value="Live Attendee">Live Concert Attendee</option>
                  <option value="Front Row VIP">Front Row VIP</option>
                  <option value="Audio Engineer">Sound & Audio Specialist</option>
                </select>
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] text-[#9CA3AF]">Review & Show Memory</label>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="How was the acoustic clarity, crowd energy, and stage presence?"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#090A0F] border border-white/15 text-[12.5px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#DF1E76] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!newReviewText.trim()}
                className="w-full h-11 rounded-full bg-gradient-to-r from-amber-400 to-[#DF1E76] disabled:opacity-50 text-black font-bold text-[12px] uppercase tracking-wider shadow-lg active:scale-95 transition-transform cursor-pointer mt-1"
              >
                Publish Verified Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL 4: VENUE MAP & DIRECTIONS GUIDE ================== */}
      {/* ========================================================================= */}
      {venueModalShow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#DF1E76]" />
                <h3 className="text-[15px] font-bold text-white">Location & Directions</h3>
              </div>
              <button
                type="button"
                onClick={() => setVenueModalShow(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="p-3 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Venue Name</span>
                <span className="font-semibold text-white">{venueModalShow.venue}</span>
                <span className="text-[#9CA3AF] text-[11px]">{venueModalShow.venueAddress}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Public Transit & Metro</span>
                <span className="text-white">{venueModalShow.transit}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Parking & Valet</span>
                <span className="text-[#D1D5DB]">{venueModalShow.parking}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Landmark</span>
                <span className="text-[#D1D5DB]">{venueModalShow.landmarks}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast(`Opening navigation to ${venueModalShow.venue}`);
                setVenueModalShow(null);
              }}
              className="w-full h-10 rounded-full bg-[#DF1E76] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate in Google Maps</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL 5: PASSES & TICKET TIER RESERVATION ============= */}
      {/* ========================================================================= */}
      {ticketModalShow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] text-[#DF1E76] font-bold uppercase tracking-wider">
                  Live Stage Passes
                </span>
                <h3 className="text-[16px] font-bold text-white leading-tight">
                  {ticketModalShow.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalShow(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!ticketConfirmed ? (
              <>
                {/* Tier Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11.5px]">
                  <div
                    onClick={() => setTicketTier('General')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      ticketTier === 'General'
                        ? 'bg-[#DF1E76]/20 border-[#DF1E76] text-white font-bold'
                        : 'bg-[#090A0F] border-white/10 text-[#9CA3AF]'
                    }`}
                  >
                    <span>General</span>
                    <span className="block text-[10px] mt-0.5 font-normal text-white/80">₹799</span>
                  </div>

                  <div
                    onClick={() => setTicketTier('VIP')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      ticketTier === 'VIP'
                        ? 'bg-[#DF1E76]/20 border-[#DF1E76] text-white font-bold'
                        : 'bg-[#090A0F] border-white/10 text-[#9CA3AF]'
                    }`}
                  >
                    <span>VIP Stage</span>
                    <span className="block text-[10px] mt-0.5 font-normal text-white/80">₹1,999</span>
                  </div>

                  <div
                    onClick={() => setTicketTier('Judge')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      ticketTier === 'Judge'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-[#090A0F] border-white/10 text-[#9CA3AF]'
                    }`}
                  >
                    <span>Judge Pass</span>
                    <span className="block text-[10px] mt-0.5 font-normal text-amber-300">Free</span>
                  </div>
                </div>

                {/* Perks description */}
                <div className="p-3 rounded-2xl bg-[#090A0F] border border-white/10 text-[11.5px] text-[#D1D5DB]">
                  {ticketTier === 'General' && '✓ Guaranteed floor cushion seating • Live unplugged take access'}
                  {ticketTier === 'VIP' && '✓ Front-row reserved table • Dedicated audio monitoring tap • Free drink'}
                  {ticketTier === 'Judge' && '✓ Free admission for verified calibrated ear judges • Live voting iPad provided'}
                </div>

                {/* Ticket Counter */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#090A0F] border border-white/10">
                  <span className="text-[12px] text-white font-medium">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketQty((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="text-[14px] font-bold text-white w-4 text-center">{ticketQty}</span>
                    <button
                      type="button"
                      onClick={() => setTicketQty((q) => Math.min(6, q + 1))}
                      className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTicketConfirmed(true);
                    setRsvpShowIds((prev) => ({ ...prev, [ticketModalShow.id]: true }));
                    playChime();
                    showToast(`Reserved ${ticketQty} pass(es) for ${ticketModalShow.title}!`);
                  }}
                  className="w-full h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12px] font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-transform cursor-pointer"
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
                    {ticketQty}x {ticketTier} Pass for {ticketModalShow.title}. You have been added to the visiting list.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketModalShow(null)}
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
      {/* ================= MODAL 6: PHOTO GALLERY LIGHTBOX ======================= */}
      {/* ========================================================================= */}
      {lightboxPhotos && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between z-10">
            <span className="text-[13px] font-semibold text-white">
              Photo {lightboxIndex + 1} of {lightboxPhotos.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxPhotos(null)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <img
              src={lightboxPhotos[lightboxIndex]}
              alt="Concert stage"
              className="max-h-[75vh] max-w-full rounded-2xl object-contain border border-white/20 shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            {lightboxPhotos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === lightboxIndex ? 'bg-[#DF1E76] w-6' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL 7: OPEN AUDITIONS =============================== */}
      {/* ========================================================================= */}
      {auditionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#12141C] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] text-[#DF1E76] font-bold uppercase tracking-wider">
                  Open Auditions
                </span>
                <h3 className="text-[16px] font-bold text-white">Stage Hunt: New Voices</h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              Submit your raw 60-second live one-take take. Calibrated judges evaluate submissions blindly to book performers for upcoming headline shows.
            </p>

            <div
              onClick={() => {
                setAuditionModalOpen(false);
                playChime();
                showToast('One-take video submitted to Stage Hunt audition roster! 🎤');
              }}
              className="p-4 rounded-2xl bg-[#090A0F] border border-dashed border-[#DF1E76]/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#DF1E76]/10 transition-colors"
            >
              <Sparkles className="w-6 h-6 text-[#DF1E76] mb-1" />
              <span className="text-[12.5px] font-semibold text-white">Upload 60s Uncut Take</span>
              <span className="text-[10.5px] text-[#9CA3AF]">MP4 or MOV • Max 60 seconds</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuditionModalOpen(false);
                playChime();
                showToast('Audition take submitted! Entering blind judging round.');
              }}
              className="w-full h-11 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12px] font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
            >
              Submit for Show Curation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
