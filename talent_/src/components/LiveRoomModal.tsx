import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Share2,
  Sliders,
  Send,
  Users,
  Award,
  Sparkles,
  Flame,
  Heart,
  ChevronRight,
  ChevronDown,
  Check,
  Radio,
  Clock,
  Music,
} from 'lucide-react';
import { GeneratedArtworks } from '../utils/stageArtwork';

export interface RoomData {
  id: string;
  title: string;
  city: string;
  status: string;
  votes: string;
  activeViewers: number;
  performerName: string;
  performerRole: string;
  songTitle: string;
  videoSrc: string;
  posterUrl: string;
  avatarUrl: string;
  queue: { name: string; role: string; time: string; avatar: string }[];
  comments: { id: string; author: string; badge: string; text: string; time: string }[];
}

interface LiveRoomModalProps {
  room: RoomData;
  artworks: GeneratedArtworks;
  onLeaveRoom: () => void;
  onOpenPerformerProfile?: (name: string) => void;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export default function LiveRoomModal({
  room,
  artworks,
  onLeaveRoom,
  onOpenPerformerProfile,
}: LiveRoomModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [reactionCounter, setReactionCounter] = useState(0);

  // Live Chat state
  const [chatMessages, setChatMessages] = useState(room.comments);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Live Voting state
  const [isScoringOpen, setIsScoringOpen] = useState(false);
  const [presenceScore, setPresenceScore] = useState(9.4);
  const [originalityScore, setOriginalityScore] = useState(9.6);
  const [craftScore, setCraftScore] = useState(9.2);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(room.activeViewers);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'CHAT' | 'LINEUP' | 'JUDGING'>('CHAT');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Live simulation: viewers fluctuation and occasional comments
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setVoteCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);

    const automatedComments = [
      { author: 'Vikram Seth', badge: 'Ear Judge', text: 'That vocal vibrato at the turn was immaculate.' },
      { author: 'Meera Sen', badge: 'Movement Curator', text: 'Incredible poise, zero backing track reliance!' },
      { author: 'Arjun Das', badge: 'Live Producer', text: 'Clean acoustics, pure one-take energy 🔥' },
      { author: 'Pooja Hegde', badge: 'Audience Judge', text: 'Locking in my 9.8 right now!' },
    ];

    let commentIdx = 0;
    const commentInterval = setInterval(() => {
      if (commentIdx < automatedComments.length) {
        const item = automatedComments[commentIdx];
        setChatMessages((prev) => [
          ...prev,
          {
            id: `auto-${Date.now()}-${commentIdx}`,
            author: item.author,
            badge: item.badge,
            text: item.text,
            time: 'Just now',
          },
        ]);
        commentIdx++;
      }
    }, 6000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(commentInterval);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const triggerReaction = (emoji: string) => {
    const newId = reactionCounter + 1;
    setReactionCounter(newId);
    const xPos = 40 + Math.random() * 45; // random horizontal offset in %
    setReactions((prev) => [...prev, { id: newId, emoji, x: xPos }]);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newId));
    }, 2200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        author: 'You (Calibrated Judge)',
        badge: 'Verified',
        text: chatInput.trim(),
        time: 'Just now',
      },
    ]);
    setChatInput('');
  };

  const handleCastVote = () => {
    setHasVoted(true);
    setIsScoringOpen(false);
    triggerReaction('🏆');
    setShowToast('Live Blind Vote locked in! (+100 XP to Judge Rank)');
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleShareRoom = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowToast('Room invite link copied to clipboard!');
    setTimeout(() => setShowToast(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080C] text-white flex flex-col items-center justify-start overflow-hidden">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-12 z-50 px-4 py-2 rounded-full bg-[#1A1D27]/95 border border-[#E91E76] shadow-2xl backdrop-blur-md text-[12px] font-medium text-white flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-[#E91E76]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Floating Reaction Animation Layer */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-28 text-3xl animate-float-up select-none"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Mobile-width Container */}
      <div className="w-full max-w-[430px] h-full flex flex-col justify-between relative bg-[#07080C] shadow-2xl">
        {/* 1. Room Header Bar */}
        <header className="px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-white/[0.08] bg-[#0E1017]/90 backdrop-blur-md z-30 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onLeaveRoom}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11.5px] font-medium flex items-center gap-1 active:scale-95 transition-all text-white/90"
            >
              <X className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                {/* Pulsing Live indicator */}
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E91E76] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E91E76]" />
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#E91E76]">
                  LIVE ROOM
                </span>
                <span className="text-white/40 text-[10px]">•</span>
                <span className="text-[11px] text-[#9CA3AF] truncate">{room.city}</span>
              </div>
              <h2 className="text-[13.5px] font-bold text-white truncate leading-tight">
                {room.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Viewers Pill */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10.5px] text-[#D1D5DB]">
              <Users className="w-3 h-3 text-[#E91E76]" />
              <span className="font-semibold">{voteCount.toLocaleString()}</span>
            </div>

            {/* Share Room */}
            <button
              type="button"
              onClick={handleShareRoom}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 2. Main Live Video / Stage Performance Feed */}
        <div className="relative w-full aspect-[16/10] bg-black shrink-0 overflow-hidden group">
          <video
            src={room.videoSrc}
            poster={room.posterUrl}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Cinematic Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080C] via-transparent to-black/40 pointer-events-none" />

          {/* Top Live Stage Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[10.5px] font-medium">
            <Radio className="w-3 h-3 text-[#E91E76] animate-pulse" />
            <span className="text-white/90">UNCUT ONE-TAKE</span>
            <span className="text-white/40">|</span>
            <span className="text-[#E91E76] font-semibold">STAGE A</span>
          </div>

          {/* Sound & Fullscreen Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-medium flex items-center gap-1.5 text-white active:scale-95 transition-all"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#E91E76]" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#E91E76] animate-pulse" />
                  <span>Live Stage Audio</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Stage Overlay: Current Performer */}
          <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-2 z-10">
            <div
              onClick={() => onOpenPerformerProfile?.(room.performerName)}
              className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md border border-white/15 p-2 rounded-2xl cursor-pointer hover:border-[#E91E76]/60 transition-colors"
            >
              <div className="relative">
                <img
                  src={room.avatarUrl}
                  alt={room.performerName}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <span className="w-3 h-3 rounded-full bg-[#00E575] border-2 border-black absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-white leading-tight">
                    {room.performerName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#E91E76] text-white text-[9px] font-bold">
                    ON STAGE
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#D1D5DB] mt-0.5 truncate">
                  <Music className="w-3 h-3 text-[#E91E76]" />
                  <span className="truncate">{room.songTitle}</span>
                </div>
              </div>
            </div>

            {/* Live Voting Quick Button */}
            <button
              type="button"
              onClick={() => setIsScoringOpen((prev) => !prev)}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-[11.5px] font-semibold transition-all active:scale-95 shadow-lg ${
                hasVoted
                  ? 'bg-[#181C26] border border-[#00E575] text-[#00E575]'
                  : 'bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white shadow-[0_0_15px_rgba(233,30,118,0.5)]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{hasVoted ? 'Voted 9.4' : 'Cast Live Score'}</span>
            </button>
          </div>
        </div>

        {/* 3. Live Scoring Dial Accordion (if open) */}
        {isScoringOpen && (
          <div className="p-3.5 bg-[#12141D] border-y border-white/10 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#E91E76]" />
                  <span>Live Blind Assessment</span>
                </h4>
                <p className="text-[10.5px] text-[#9CA3AF]">
                  Judge calibration is weighted in real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScoringOpen(false)}
                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {/* Presence */}
              <div className="p-2 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col">
                <div className="flex justify-between items-center text-[#9CA3AF]">
                  <span>Presence</span>
                  <span className="font-bold text-white">{presenceScore.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={presenceScore}
                  onChange={(e) => setPresenceScore(parseFloat(e.target.value))}
                  className="w-full accent-[#E91E76] h-1 mt-2 cursor-pointer"
                />
              </div>

              {/* Originality */}
              <div className="p-2 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col">
                <div className="flex justify-between items-center text-[#9CA3AF]">
                  <span>Originality</span>
                  <span className="font-bold text-white">{originalityScore.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={originalityScore}
                  onChange={(e) => setOriginalityScore(parseFloat(e.target.value))}
                  className="w-full accent-[#E91E76] h-1 mt-2 cursor-pointer"
                />
              </div>

              {/* Craft */}
              <div className="p-2 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col">
                <div className="flex justify-between items-center text-[#9CA3AF]">
                  <span>Craft</span>
                  <span className="font-bold text-white">{craftScore.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={craftScore}
                  onChange={(e) => setCraftScore(parseFloat(e.target.value))}
                  className="w-full accent-[#E91E76] h-1 mt-2 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCastVote}
              className="w-full h-9 rounded-full bg-gradient-to-r from-[#DF1E76] to-[#E91E76] text-white text-[12px] font-bold uppercase tracking-wider shadow-md active:scale-95 transition-transform"
            >
              Lock In Live Vote (Avg:{' '}
              {((presenceScore + originalityScore + craftScore) / 3).toFixed(1)})
            </button>
          </div>
        )}

        {/* 4. Sub-Navigation Tabs for Room */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 pt-1 select-none">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('CHAT')}
              className={`pb-2 text-[12.5px] font-semibold relative transition-colors ${
                activeTab === 'CHAT' ? 'text-white' : 'text-[#8E95A5]'
              }`}
            >
              <span>Live Judges Chat</span>
              {activeTab === 'CHAT' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#E91E76]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LINEUP')}
              className={`pb-2 text-[12.5px] font-semibold relative transition-colors ${
                activeTab === 'LINEUP' ? 'text-white' : 'text-[#8E95A5]'
              }`}
            >
              <span>Stage Lineup ({room.queue.length + 1})</span>
              {activeTab === 'LINEUP' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#E91E76]" />
              )}
            </button>
          </div>

          {/* Quick Reaction Bar */}
          <div className="flex items-center gap-1.5 pb-2">
            {['👏', '🔥', '❤️', '🤯', '⚡'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => triggerReaction(emoji)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-sm active:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Tab Body */}
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2 min-h-0">
          {activeTab === 'CHAT' && (
            <div className="flex-1 flex flex-col justify-between min-h-0">
              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 no-scrollbar min-h-0">
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-[#9CA3AF] text-center mb-1">
                  🔒 Blind Judging Mode: Metrics hidden to protect unbiased evaluation.
                </div>

                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex flex-col p-2 rounded-xl bg-[#11131B] border border-white/[0.06] text-[12px]"
                  >
                    <div className="flex items-center justify-between text-[10.5px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{msg.author}</span>
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#E91E76] font-semibold text-[9.5px]">
                          {msg.badge}
                        </span>
                      </div>
                      <span className="text-[#6B7280]">{msg.time}</span>
                    </div>
                    <p className="text-[#D1D5DB] mt-1 leading-snug">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Drop a reaction or judge comment..."
                  className="flex-1 h-9 px-3.5 rounded-full bg-[#11131B] border border-white/15 text-[12px] text-white focus:outline-none focus:border-[#E91E76]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-9 h-9 rounded-full bg-[#E91E76] disabled:opacity-40 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'LINEUP' && (
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-[#161824] border border-[#E91E76]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E91E76]">
                    <img
                      src={room.avatarUrl}
                      alt={room.performerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[13px] font-bold text-white">{room.performerName}</h4>
                      <span className="px-1.5 py-0.5 rounded bg-[#E91E76] text-white text-[9px] font-bold">
                        NOW LIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{room.performerRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#00E575] font-semibold">Stage Active</span>
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-[#8E95A5] mt-1">
                Coming Up Next
              </div>

              {room.queue.map((item, idx) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-[#11131B] border border-white/[0.08] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-[#8E95A5] w-4">{idx + 1}</span>
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-[12.5px] font-semibold text-white">{item.name}</h4>
                      <p className="text-[10.5px] text-[#9CA3AF]">{item.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#E91E76]">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. iOS Home Indicator */}
        <div className="w-[134px] h-[4.5px] bg-white rounded-full mx-auto my-2" />
      </div>
    </div>
  );
}
