import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Platform } from 'react-native';
import { Settings, Share, MoreHorizontal, CheckCircle, MapPin, Play, X, Shield, Bell, Key, User, LogOut, ChevronRight, ChevronLeft, Calendar, Film, Heart, Plus, ExternalLink, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Switch } from 'react-native';

const coverImg = 'https://images.unsplash.com/photo-1493225457124-a1a2a4fa3e93?w=800&q=80';
const avatarImg = 'https://images.unsplash.com/photo-1493225457124-a1a2a4fa3e93?w=200&q=80';

// Real dummy video URLs
const dummyVideos = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
];

function VideoPlayerModal({ url, onClose }: { url: string, onClose: () => void }) {
  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black justify-center relative">
        <TouchableOpacity 
          style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
          className="w-12 h-12 bg-black/50 rounded-full items-center justify-center border border-white/20"
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
        
        {Platform.OS === 'web' ? (
          <video 
            src={url} 
            controls 
            autoPlay 
            style={{ width: '100%', maxHeight: '80vh', outline: 'none' }} 
          />
        ) : (
          <View className="flex-1 items-center justify-center">
             <Text className="text-white text-center px-4">
               Video playback on native requires expo-video or expo-av to be installed.
               Currently playing: {url}
             </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

function ShowPreviewModal({ show, onClose }: { show: any, onClose: () => void }) {
  return (
    <Modal visible={true} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center p-4">
        <View className="bg-[#12141A] w-full max-w-[420px] max-h-[85%] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
          
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-2">
                <View className="bg-[#E91E76] px-2 py-1 rounded-md">
                  <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Show Preview</Text>
                </View>
                <Text className="text-white font-bold text-[14px]" numberOfLines={1}>{show.title}</Text>
              </View>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }} className="w-8 h-8 bg-white/10 rounded-full items-center justify-center">
                <X color="#fff" size={16} />
              </TouchableOpacity>
            </View>

            {/* Subtitle / Info */}
            <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-1">Secret Living Room Acoustic Session</Text>
            <Text className="text-white font-bold text-[22px] mb-3">{show.title}</Text>
            <View className="flex-row items-center gap-4 mb-6">
              <View className="flex-row items-center gap-1.5">
                <Calendar color="#9CA3AF" size={14} />
                <Text className="text-[#9CA3AF] text-[13px]">Nov 16, 2026</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-[#E91E76]" />
                <Text className="text-[#9CA3AF] text-[13px]">7:30 PM IST</Text>
              </View>
            </View>

            {/* Who's Visiting */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <User color="#E91E76" size={16} />
                  <Text className="text-white text-[13px] font-bold">Who's Visiting (86)</Text>
                </View>
                <Text className="text-[#10b981] text-[10px] font-bold">Verified Judges Attending</Text>
              </View>
              <View className="flex-row flex-wrap gap-2 mb-4">
                <View className="bg-white/10 px-3 py-1.5 rounded-full"><Text className="text-[#D1D5DB] text-[12px]">Vikram Rao</Text></View>
                <View className="bg-white/10 px-3 py-1.5 rounded-full"><Text className="text-[#D1D5DB] text-[12px]">Tara Devi (Judge)</Text></View>
                <View className="bg-white/10 px-3 py-1.5 rounded-full"><Text className="text-[#D1D5DB] text-[12px]">84 others</Text></View>
              </View>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('RSVP Confirmed', 'You are now visiting this show.'); }} activeOpacity={0.8} className="w-full bg-white/10 h-[44px] rounded-xl flex-row items-center justify-center gap-2">
                <CheckCircle color="#fff" size={16} />
                <Text className="text-white font-bold text-[13px]">RSVP: I'm Visiting This Show</Text>
              </TouchableOpacity>
            </View>

            {/* Venue */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-3">Venue & Coordinates</Text>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-4">
                  <Text className="text-white font-bold text-[14px] leading-5 mb-1">Secret Heritage Courtyard, 4th Block Koramangala</Text>
                  <Text className="text-[#9CA3AF] text-[12px]">{show.loc}</Text>
                </View>
                <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Map', 'Opening map...'); }} className="bg-white/10 px-3 py-2 rounded-xl flex-row items-center gap-2">
                  <MapPin color="#fff" size={14} />
                  <Text className="text-white text-[12px] font-bold">Map & Directions</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-[#6B7280] text-[11px]">Age Limit: All Ages • Dress: Cozy / Acoustic Comfort</Text>
            </View>

            {/* Photos */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase">Stage & Venue Photos (2)</Text>
                </View>
                <Text className="text-[#6B7280] text-[10px]">Tap to expand</Text>
              </View>
              <View className="flex-row gap-3">
                <Image source={{ uri: 'https://images.unsplash.com/photo-1540039155733-d7696d4eb98e?w=200' }} className="w-[100px] h-[80px] rounded-xl opacity-80" />
                <Image source={{ uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200' }} className="w-[100px] h-[80px] rounded-xl opacity-80" />
              </View>
            </View>

            {/* Timeline */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-4">Show Itinerary Timeline</Text>
              <View className="gap-3">
                <View className="flex-row gap-4">
                  <Text className="text-[#E91E76] text-[12px] font-bold w-[60px]">7:00 PM</Text>
                  <Text className="text-[#D1D5DB] text-[12px] flex-1">Secret location GPS pin revealed to passholders</Text>
                </View>
                <View className="flex-row gap-4">
                  <Text className="text-[#E91E76] text-[12px] font-bold w-[60px]">7:30 PM</Text>
                  <Text className="text-[#D1D5DB] text-[12px] flex-1">Doors open & Warm chai / coffee mixer</Text>
                </View>
                <View className="flex-row gap-4">
                  <Text className="text-[#E91E76] text-[12px] font-bold w-[60px]">8:00 PM</Text>
                  <Text className="text-[#D1D5DB] text-[12px] flex-1">Aarav Nair Unamplified Living Room Set</Text>
                </View>
              </View>
            </View>

            {/* Setlist */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-3">Expected Acoustic Setlist</Text>
              <View className="gap-2">
                {['Unplugged Raag Improvisation', 'Monsoon Motion', 'Falling Again', 'Audience Request Track'].map((song, i) => (
                  <View key={i} className="flex-row items-center gap-3">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-[#D1D5DB] text-[13px]">{song}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Seating */}
            <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-2">Seating & Experience Preview</Text>
              <Text className="text-[#D1D5DB] text-[13px]">Intimate floor cushions & low armchairs (BYO Cushion)</Text>
            </View>

          </ScrollView>

          {/* Footer Action */}
          <View className="p-4 bg-[#12141A] border-t border-white/5 flex-row gap-3 items-center">
            <TouchableOpacity onPress={() => Alert.alert('Calendar', 'Added to calendar.')} className="w-[48px] h-[48px] rounded-xl border border-white/20 items-center justify-center">
              <Calendar color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Passes Reserved', 'Your passes are secured!'); onClose(); }} activeOpacity={0.8} className="flex-1 bg-[#E91E76] h-[48px] rounded-full items-center justify-center">
              <Text className="text-white font-bold text-[13px]">RESERVE PASSES (₹650 (RSVP PRIORITY))</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// Profile Feed Video Card
function ProfileFeedVideoCard({ video, playingVideoId, setPlayingVideoId, onPass }: { video: any, playingVideoId: string | null, setPlayingVideoId: (id: string | null) => void, onPass: () => void }) {
  const isPlaying = playingVideoId === video.id;
  const [isKept, setIsKept] = useState(false);
  const [judgeScore, setJudgeScore] = useState<number | null>(null);
  const [isJudgingActive, setIsJudgingActive] = useState(false);
  const [tempScore, setTempScore] = useState<number>(5.0);
  const [judgedStatusText, setJudgedStatusText] = useState('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsJudgingActive(true);
        setTempScore(judgeScore || 5.0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const delta = -gestureState.dy / 20;
        let newScore = (judgeScore || 5.0) + delta;
        newScore = Math.max(1.0, Math.min(10.0, newScore));
        if (Math.floor(newScore) !== Math.floor(tempScore)) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        setTempScore(parseFloat(newScore.toFixed(1)));
      },
      onPanResponderRelease: () => {
        setIsJudgingActive(false);
        setJudgeScore(tempScore);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setJudgedStatusText(`${tempScore.toFixed(1)} ✓`);
        setTimeout(() => setJudgedStatusText('JUDGED'), 800);
      }
    })
  ).current;

  return (
    <View className="mb-6">
      <View className="relative w-full aspect-[16/9.5] rounded-[16px] overflow-hidden border border-white/10 bg-[#100C09] mb-4">
        {Platform.OS === 'web' ? (
          isPlaying ? (
            <video src={video.videoUrl} autoPlay loop playsInline poster={video.videoThumb} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Image source={{ uri: video.videoThumb }} className="w-full h-full opacity-90" />
          )
        ) : (
          <View className="flex-1 items-center justify-center bg-black">
             <Image source={{ uri: video.videoThumb }} className="w-full h-full opacity-90 absolute" />
          </View>
        )}
        
        <View className="absolute inset-x-0 top-0 h-16 bg-black/40" />
        <View className="absolute inset-x-0 bottom-0 h-16 bg-black/40" />
        
        <View className="absolute top-4 left-4 flex-row items-center gap-2">
          <Text className="text-[11px] font-bold tracking-[0.1em] text-white uppercase">PERFORMANCE</Text>
          <View className="w-1 h-1 rounded-full bg-white/60" />
          <Text className="text-white text-[11px] font-bold tracking-widest">{video.duration}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} className="absolute top-1/2 left-1/2 -ml-7 -mt-7 w-14 h-14 rounded-full bg-black/40 border border-white/80 items-center justify-center" onPress={() => setPlayingVideoId(isPlaying ? null : video.id)}>
          {isPlaying ? <Pause color="#fff" fill="#fff" size={24} /> : <Play color="#fff" fill="#fff" size={24} className="ml-1" />}
        </TouchableOpacity>

        <View className="absolute bottom-3 right-3 flex-row items-center gap-2">
          <TouchableOpacity activeOpacity={0.8} className="w-8 h-8 rounded-lg bg-black/60 border border-white/20 items-center justify-center"><Maximize2 color="#fff" size={14} strokeWidth={2} /></TouchableOpacity>
          <View className="h-8 px-3 rounded-lg bg-black/60 border border-white/20 items-center justify-center"><Text className="text-[12px] font-medium text-white tracking-wider">{video.duration} / {video.duration}</Text></View>
        </View>

        {isJudgingActive && (
          <View className="absolute inset-0 bg-black/60 items-center justify-center z-20">
            <Text className="text-white text-[72px] font-bold tracking-tighter shadow-xl">{tempScore.toFixed(1)}</Text>
            <Text className="text-white/60 text-[12px] font-medium tracking-widest uppercase mt-4">Slide Up/Down to Adjust</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-[42px] h-[42px] rounded-full overflow-hidden border border-white/10"><Image source={{ uri: video.avatar }} className="w-full h-full" /></View>
          <View>
            <Text className="text-white text-[16px] font-bold mb-0.5">{video.author}</Text>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Text className="text-[#9CA3AF] text-[11px]">{video.role}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between px-1">
        <View className="flex-row items-center gap-5">
          <TouchableOpacity onPress={() => setIsKept(!isKept)} activeOpacity={0.7} className="items-center gap-1.5 min-w-[36px]">
            <Bookmark color={isKept ? "#E91E76" : "#fff"} fill={isKept ? "#E91E76" : "transparent"} size={22} strokeWidth={1.5} />
            <Text className={`text-[9px] font-bold tracking-widest uppercase ${isKept ? 'text-[#E91E76]' : 'text-[#9CA3AF]'}`}>{isKept ? 'KEPT ✓' : 'KEEP'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} activeOpacity={0.7} className="items-center gap-1.5 min-w-[36px]">
            <MessageCircle color="#fff" size={22} strokeWidth={1.5} />
            <Text className="text-[#9CA3AF] text-[9px] font-bold tracking-widest uppercase">TALK</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-col items-end pt-1">
          <View {...panResponder.panHandlers}>
            <View className={`rounded-full h-[32px] px-3.5 flex-row items-center gap-2 mb-2 ${judgeScore ? 'bg-white/10 border border-[#E91E76]/50' : 'bg-[#E91E76]'}`}>
              <Gauge color={judgeScore ? "#E91E76" : "#fff"} size={13} />
              <Text className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${judgeScore ? 'text-[#E91E76]' : 'text-white'}`}>
                {judgeScore ? (judgedStatusText || 'JUDGED') : 'JUDGE'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="w-full h-[1px] bg-white/5 mt-5" />
    </View>
  );
}

export function ProfileView({ user, onLogout, onBack }: { user?: any, onLogout?: () => void, onBack?: () => void }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingView, setActiveSettingView] = useState<string | null>(null);
  
  // App State
  const [activeTab, setActiveTab] = useState<'Performances' | 'Shows' | 'About'>('Performances');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeShowModal, setActiveShowModal] = useState<any | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProfileFeedOpen, setIsProfileFeedOpen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>('0');
  const [backed, setBacked] = useState(false);

  // Privacy Settings State
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [isBlindModeEnabled, setIsBlindModeEnabled] = useState(true);

  // Profile Data State
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userId = user?.id || 1; // Fallback to 1 if not logged in
        const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
        
        const response = await fetch(`${baseUrl}/api/profile/${userId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await RNShare.share({
        message: 'Check out Aarav Nair on Talent App! https://talent.app/aaravnair',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBackTalent = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!backed) {
      Alert.alert("Success!", "You are now backing Aarav Nair.");
      setBacked(true);
    } else {
      Alert.alert("Already Backed", "You are already supporting this talent!");
    }
  };

  const handleInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsInviteModalOpen(true);
  };

  const handleAction = (actionName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(actionName, `Action triggered for ${actionName}`);
  };

  const playVideo = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveVideoUrl(url);
  };

  if (isProfileFeedOpen) {
    return (
      <View className="flex-1 bg-[#050608]">
        {/* Header with Back Button */}
        <View className="pt-14 pb-4 px-4 flex-row items-center bg-[#13151C] border-b border-white/5 z-50">
          <TouchableOpacity onPress={() => setIsProfileFeedOpen(false)} className="w-10 h-10 items-center justify-center bg-black/40 rounded-full border border-white/10">
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text className="text-white font-bold text-[16px] ml-4">Aarav Nair's Performances</Text>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 100 }}>
          {dummyVideos.map((url, i) => (
             <ProfileFeedVideoCard 
               key={i} 
               video={{
                 id: String(i),
                 author: 'Aarav Nair',
                 role: 'Singer-Songwriter • Bengaluru, India',
                 avatar: avatarImg,
                 videoThumb: i === 0 ? 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=800&q=80' : (i === 1 ? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' : 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300'),
                 duration: '0:58',
                 videoUrl: url,
               }} 
               playingVideoId={playingVideoId}
               setPlayingVideoId={setPlayingVideoId}
               onPass={() => {}}
             />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050608]">
      {activeVideoUrl && (
        <VideoPlayerModal url={activeVideoUrl} onClose={() => setActiveVideoUrl(null)} />
      )}
      
      {activeShowModal && (
        <ShowPreviewModal show={activeShowModal} onClose={() => setActiveShowModal(null)} />
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
        {/* Cover */}
        <View className="w-full h-[140px] relative bg-[#050608]">
          {/* Top Actions */}
          <View className="absolute top-14 left-4 z-10">
            <TouchableOpacity onPress={() => { 
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
              if (onBack) {
                onBack(); 
              } else if (Platform.OS === 'web') {
                window.location.href = '/';
              } else {
                Alert.alert('Home', 'Navigating to Home...');
              }
            }} className="w-9 h-9 items-center justify-center rounded-full border border-white/10">
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
          </View>
          <View className="absolute top-14 right-4 flex-row gap-5 z-10">
            <TouchableOpacity onPress={handleShare}>
              <Share color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSettingsOpen(true)}>
              <MoreHorizontal color="#fff" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View className="px-5 -mt-20 relative z-20 items-center">
          {/* Avatar */}
          <View className="w-[96px] h-[96px] rounded-full border-[3px] border-[#050608] mb-3 relative bg-[#1A1512] shadow-xl">
            <Image source={{ uri: avatarImg }} className="w-full h-full rounded-full" />
            <View className="absolute bottom-1 right-1 w-4 h-4 bg-[#10b981] rounded-full border-2 border-[#050608]" />
          </View>

          {/* Name & Title */}
          <View className="flex-row items-center justify-center gap-2 mb-1">
            <Text className="text-white text-[26px] font-bold tracking-tight">{profileData?.name || 'Aarav Nair'}</Text>
            <CheckCircle color="#E91E76" fill="#E91E76" size={20} />
          </View>
          
          <View className="flex-row items-center justify-center gap-2 mb-3">
            <Text className="text-[#9CA3AF] text-[13px]">{profileData?.username ? `@${profileData.username}` : 'Singer'}</Text>
            <Text className="text-[#9CA3AF] text-[13px]">•</Text>
            <MapPin color="#9CA3AF" size={13} />
            <Text className="text-[#9CA3AF] text-[13px]">Bengaluru, India</Text>
          </View>
          
          <Text className="text-[#9CA3AF] text-[13px] mb-6 text-center px-4">
            “Building a life on stage, one performance at a time.”
          </Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-5 gap-2 mb-6 justify-between">
          {[
            { icon: <Star color="#E91E76" fill="#E91E76" size={14} />, label: 'Blind Score', value: '4.8' },
            { icon: <View className="flex-row items-end gap-[2px]"><View className="w-[2px] h-2.5 bg-white"/><View className="w-[2px] h-3.5 bg-white"/><View className="w-[2px] h-2 bg-white"/></View>, label: 'Performances', value: profileData?.videosCount?.toString() || '28' },
            { icon: <Calendar color="#E91E76" size={14} />, label: 'Shows', value: '6' },
            { icon: <User color="#9CA3AF" size={14} />, label: 'Followers', value: profileData?.followers?.toString() || '12.4K' },
          ].map((stat, i) => (
            <View key={i} className="flex-1 bg-[#12141A] rounded-[14px] py-2.5 px-1 items-center justify-center">
              <View className="flex-row items-center justify-center gap-1.5 mb-1">
                 {stat.icon}
                 <Text className="text-white text-[15px] font-bold">{stat.value}</Text>
              </View>
              <Text className="text-[#7C8495] text-[9px]">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="px-5 flex-row gap-3 mb-6">
          <TouchableOpacity onPress={handleBackTalent} activeOpacity={0.8} className={`flex-[1.2] ${backed ? 'bg-[#9CA3AF]/20' : 'bg-[#E91E76]'} h-[42px] rounded-full flex-row items-center justify-center gap-1.5`}>
            <Heart color={backed ? "#E91E76" : "#fff"} fill={backed ? "#E91E76" : "transparent"} size={14} />
            <Text className="text-white font-bold text-[11px] tracking-wider uppercase">{backed ? 'BACKED' : 'BACK TALENT'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleInvite} activeOpacity={0.8} className="flex-[1.2] border border-[#E91E76] bg-transparent h-[42px] rounded-full flex-row items-center justify-center gap-1.5">
            <Calendar color="#E91E76" size={14} />
            <Text className="text-[#E91E76] font-bold text-[11px] tracking-wider uppercase">INVITE TO SHOW</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSettingsOpen(true)} activeOpacity={0.8} className="w-[42px] h-[42px] rounded-full border border-white/20 items-center justify-center">
            <MoreHorizontal color="#fff" size={18} />
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-6" contentContainerStyle={{ paddingRight: 40, gap: 8 }}>
          {['#Original', '#Acoustic', '#Indie', '#Singer'].map((tag, i) => (
            <TouchableOpacity key={i} onPress={() => handleAction(`Explore ${tag}`)} className="px-4 py-1.5 rounded-full border border-white/10 bg-[#0F1115]">
              <Text className="text-[#D1D5DB] text-[12px]">{tag}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => handleAction("Add New Tag")} className="px-4 py-1.5 rounded-full border border-white/10 bg-[#0F1115] flex-row items-center gap-1">
            <Plus color="#9CA3AF" size={12} />
            <Text className="text-[#9CA3AF] text-[12px]">Add tag</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Tabs */}
        <View className="flex-row border-b border-white/10 mb-6 px-5 justify-between">
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab('Performances'); }} className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab === 'Performances' ? 'border-b-2 border-[#E91E76]' : 'opacity-60'}`}>
            <Text className="text-white font-bold text-[14px]">Performances</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab('Shows'); }} className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab === 'Shows' ? 'border-b-2 border-[#E91E76]' : 'opacity-60'}`}>
            <Text className="text-white font-medium text-[14px]">Shows</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab('About'); }} className={`flex-1 items-center pb-3 flex-row justify-center gap-2 ${activeTab === 'About' ? 'border-b-2 border-[#E91E76]' : 'opacity-60'}`}>
            <Text className="text-white font-medium text-[14px]">About</Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'Performances' && (
          <View>
            {/* Featured Performance */}
            <View className="px-5 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-[18px] font-bold tracking-tight">Featured Performance</Text>
                <TouchableOpacity className="flex-row items-center gap-1" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsProfileFeedOpen(true); }}>
                  <Text className="text-[#9CA3AF] text-[12px]">See all</Text>
                  <ChevronRight color="#9CA3AF" size={14} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity activeOpacity={0.9} onPress={() => playVideo(dummyVideos[0])} className="w-full aspect-[4/3] rounded-[24px] overflow-hidden relative border border-white/5 bg-[#12141A]">
                <Image source={{ uri: 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=800&q=80' }} className="w-full h-[70%] opacity-80" />
                
                {/* Featured Badge */}
                <View className="absolute top-4 left-4 bg-[#12141A] border border-[#E91E76]/30 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-sm">
                  <Star color="#E91E76" fill="#E91E76" size={12} />
                  <Text className="text-white text-[11px] font-bold tracking-wide">Featured</Text>
                </View>
                
                {/* Play Button */}
                <View className="absolute top-[35%] left-0 right-0 items-center justify-center -translate-y-1/2">
                  <View className="w-16 h-16 rounded-full border border-white bg-black/30 items-center justify-center">
                    <Play color="#fff" fill="#fff" size={24} style={{ marginLeft: 4 }} />
                  </View>
                </View>
                
                {/* Bottom Info */}
                <View className="absolute bottom-0 left-0 right-0 h-[30%] px-5 py-4 justify-center">
                  <Text className="text-white text-[20px] font-bold tracking-tight mb-1.5">Monsoon Motion</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[#9CA3AF] text-[12.5px] font-medium">Original • Acoustic • 3.2M views</Text>
                    <View className="bg-[#1C1F26] px-2.5 py-1 rounded-md">
                      <Text className="text-[#9CA3AF] text-[11px] font-medium tracking-wide">09:56</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Performances Row */}
            <View className="mb-8">
              <View className="px-5 flex-row justify-between items-center mb-4">
                <Text className="text-white text-[18px] font-bold">Performances</Text>
                <TouchableOpacity className="flex-row items-center gap-1" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsProfileFeedOpen(true); }}>
                  <Text className="text-[#9CA3AF] text-[12px]">See all</Text>
                  <ChevronRight color="#9CA3AF" size={14} />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5" contentContainerStyle={{ paddingRight: 40, gap: 12 }}>
                {[
                  { title: 'Monsoon\nMotion', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', active: true, video: dummyVideos[0] },
                  { title: 'City Lights', img: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300', active: false, video: dummyVideos[1] },
                  { title: 'Falling Again', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', active: false, video: dummyVideos[2] },
                  { title: 'Unplugged', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300', active: false, video: dummyVideos[3] },
                  { title: 'The Edge', img: 'https://images.unsplash.com/photo-1493225457124-a1a2a4fa3e93?w=300', active: false, video: dummyVideos[4] },
                ].map((perf, i) => (
                  <TouchableOpacity key={i} onPress={() => playVideo(perf.video)} activeOpacity={0.8} className={`w-[130px] h-[170px] rounded-xl overflow-hidden relative ${perf.active ? 'border-2 border-[#E91E76]' : 'border border-white/10'}`}>
                    <Image source={{ uri: perf.img }} className="w-full h-full opacity-80" />
                    <View className="absolute inset-0 bg-black/30" />
                    <View className="absolute bottom-2 left-2 right-2 flex-row items-end justify-between">
                      <Text className="text-white text-[12px] font-bold w-[70%]" numberOfLines={2}>{perf.title}</Text>
                      <View className="w-6 h-6 rounded-full border border-white items-center justify-center bg-black/40">
                        <Play color="#fff" size={10} fill="#fff" style={{ marginLeft: 2 }} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Upcoming Shows in Performances Tab */}
            <View className="mb-8">
              <View className="px-5 flex-row justify-between items-center mb-4">
                <Text className="text-white text-[18px] font-bold">Upcoming Shows</Text>
                <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab('Shows'); }}>
                  <Text className="text-[#9CA3AF] text-[12px]">View all</Text>
                </TouchableOpacity>
              </View>

              <View className="px-5 gap-3">
                {[
                  { dateM: '24', dateD: 'OCT', title: 'Live at The Next Stage', loc: 'Bengaluru, India', img: 'https://images.unsplash.com/photo-1540039155733-d7696d4eb98e?w=100' },
                  { dateM: '16', dateD: 'NOV', title: 'Sofar Sounds', loc: 'Bengaluru, India', img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100' }
                ].map((show, i) => (
                  <TouchableOpacity key={i} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveShowModal(show); }} activeOpacity={0.8} className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="items-center w-[40px]">
                        <Text className="text-white font-bold text-[18px]">{show.dateM}</Text>
                        <Text className="text-[#9CA3AF] text-[10px]">{show.dateD}</Text>
                      </View>
                      <View className="w-12 h-12 rounded-lg overflow-hidden bg-[#1A1512]">
                        <Image source={{ uri: show.img }} className="w-full h-full opacity-80" />
                      </View>
                      <View>
                        <Text className="text-white font-bold text-[14px] mb-1">{show.title}</Text>
                        <View className="flex-row items-center gap-1">
                          <MapPin color="#9CA3AF" size={10} />
                          <Text className="text-[#9CA3AF] text-[11px]">{show.loc}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight color="#9CA3AF" size={16} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>
        )}

        {activeTab === 'Shows' && (
          <View className="mb-8">
            <View className="px-5 flex-row justify-between items-center mb-4">
              <Text className="text-white text-[18px] font-bold">Upcoming Shows</Text>
            </View>

            <View className="px-5 gap-3">
              {[
                { dateM: '24', dateD: 'OCT', title: 'Live at The Next Stage', loc: 'Bengaluru, India', img: 'https://images.unsplash.com/photo-1540039155733-d7696d4eb98e?w=100' },
                { dateM: '16', dateD: 'NOV', title: 'Sofar Sounds', loc: 'Bengaluru, India', img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100' },
                { dateM: '02', dateD: 'DEC', title: 'Acoustic Nights', loc: 'Mumbai, India', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100' }
              ].map((show, i) => (
                <TouchableOpacity key={i} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveShowModal(show); }} activeOpacity={0.8} className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="items-center">
                      <Text className="text-white font-bold text-[18px]">{show.dateM}</Text>
                      <Text className="text-[#9CA3AF] text-[10px]">{show.dateD}</Text>
                    </View>
                    <View className="w-12 h-12 rounded-lg overflow-hidden bg-[#1A1512]">
                      <Image source={{ uri: show.img }} className="w-full h-full opacity-80" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-[14px] mb-1">{show.title}</Text>
                      <View className="flex-row items-center gap-1">
                        <MapPin color="#9CA3AF" size={10} />
                        <Text className="text-[#9CA3AF] text-[11px]">{show.loc}</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight color="#9CA3AF" size={16} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'About' && (
          <View className="px-5 mb-8">
            
            {/* Artist Bio */}
            <View className="bg-[#0F1115] border border-white/5 rounded-xl p-5 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <User color="#E91E76" size={18} />
                <Text className="text-white text-[13px] font-bold tracking-widest uppercase">Artist Bio</Text>
              </View>
              <Text className="text-[#D1D5DB] text-[14px] leading-6">
                Aarav Nair is a Bengaluru-based singer-songwriter blending stripped-back acoustic arrangements with cinematic vocal modulations. Starting out in underground coffee house sessions, his one-take live recordings have garnered over 3.2M views across blind-judged platforms.
              </Text>
            </View>

            {/* Instruments & Craft */}
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleAction("Inspect Craft")} className="bg-[#0F1115] border border-white/5 rounded-xl p-5 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <Music color="#E91E76" size={18} />
                <Text className="text-white text-[13px] font-bold tracking-widest uppercase">Instruments & Craft (Tap to inspect)</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {['Taylor 814ce Acoustic', 'Shure SM58 Dynamic', 'Strymon Timeline Delay', 'Open D Tuning'].map((item, i) => (
                  <View key={i} className="bg-white/5 border border-white/10 px-3 py-2 rounded-full">
                    <Text className="text-[#D1D5DB] text-[13px]">{item}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* Streaming & Socials */}
            <View className="bg-[#0F1115] border border-white/5 rounded-xl p-5 mb-6">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-white text-[13px] font-bold tracking-widest uppercase">Streaming & Socials</Text>
              </View>
              
              <View className="gap-3">
                <TouchableOpacity activeOpacity={0.7} onPress={() => handleAction("Open Spotify")} className="flex-row items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4">
                  <Text className="text-[#D1D5DB] text-[14px]">Spotify • 184K Monthly Listeners</Text>
                  <ExternalLink color="#9CA3AF" size={16} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => handleAction("Open YouTube")} className="flex-row items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4">
                  <Text className="text-[#D1D5DB] text-[14px]">YouTube • 92K Subscribers</Text>
                  <ExternalLink color="#9CA3AF" size={16} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => handleAction("Open Instagram")} className="flex-row items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4">
                  <Text className="text-[#D1D5DB] text-[14px]">Instagram • @aaravnair</Text>
                  <ExternalLink color="#9CA3AF" size={16} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Booking Button */}
            <TouchableOpacity onPress={handleInvite} activeOpacity={0.8} className="w-full bg-[#E91E76] h-[52px] rounded-full flex-row items-center justify-center">
              <Text className="text-white font-bold text-[14px] tracking-widest uppercase">Inquire for Private Booking</Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsSettingsOpen(false)}>
        <View className="flex-1 bg-[#050608]">
          {activeSettingView === null ? (
            <>
              <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-white/10">
                <Text className="text-white text-[20px] font-bold">Settings & Privacy</Text>
                <TouchableOpacity onPress={() => setIsSettingsOpen(false)} className="w-10 h-10 items-center justify-center bg-white/5 rounded-full">
                  <X color="#fff" size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1">
                <View className="px-5 py-6">
                  <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">ACCOUNT</Text>
                  
                  <SettingsRow icon={<User color="#fff" size={20} />} title="Account Details" onPress={() => Alert.alert("Account Details", "Available soon!")} />
                  <SettingsRow 
                    icon={<Key color="#fff" size={20} />} 
                    title="Privacy & Blind Mode" 
                    subtitle="Manage what is shown before judging" 
                    onPress={() => setActiveSettingView('privacy')}
                  />
                  <SettingsRow icon={<Shield color="#fff" size={20} />} title="Security" onPress={() => Alert.alert("Security", "Security settings are up to date.")} />
                  <SettingsRow icon={<Bell color="#fff" size={20} />} title="Notifications" onPress={() => Alert.alert("Notifications", "You have 3 new notifications")} />

                  <SettingsRow 
                    icon={<User color="#fff" size={20} />} 
                    title="Appearance" 
                    subtitle="Customize app theme and colors" 
                    onPress={() => setActiveSettingView('appearance')}
                  />

                  <View className="h-[1px] w-full bg-white/10 my-6" />

                  <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">CONTENT & ACTIVITY</Text>
                  
                  <SettingsRow icon={<Play color="#fff" size={20} />} title="Watch History" onPress={() => Alert.alert("Watch History", "Opening history...")} />
                  <SettingsRow icon={<CheckCircle color="#fff" size={20} />} title="Verification" subtitle="Apply for verified badge" onPress={() => Alert.alert("Verification", "Application submitted!")} />
                  
                  <View className="h-[1px] w-full bg-white/10 my-6" />

                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    className="flex-row items-center justify-between bg-white/5 p-4 rounded-xl mb-8 border border-white/10"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsSettingsOpen(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <LogOut color="#E91E76" size={20} />
                      <Text className="text-[#E91E76] text-[16px] font-bold">Log out</Text>
                    </View>
                  </TouchableOpacity>

                  <Text className="text-center text-[#6B7280] text-[12px] mb-8">Talent App v1.0.0</Text>
                </View>
              </ScrollView>
            </>
          ) : activeSettingView === 'appearance' ? (
            <>
              <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-white/10">
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity onPress={() => setActiveSettingView(null)} className="w-10 h-10 items-center justify-center bg-white/5 rounded-full">
                    <ChevronLeft color="#fff" size={24} />
                  </TouchableOpacity>
                  <Text className="text-white text-[18px] font-bold">Appearance</Text>
                </View>
              </View>

              <ScrollView className="flex-1">
                <View className="px-5 py-6">
                  
                  <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">THEME</Text>
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1 pr-4">
                      <Text className="text-white text-[16px] font-medium">Dark Mode</Text>
                      <Text className="text-[#9CA3AF] text-[12px] mt-1">
                        Use a dark color scheme to reduce eye strain in low-light environments.
                      </Text>
                    </View>
                    <Switch
                      value={true}
                      onValueChange={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        Alert.alert("Notice", "Light mode is coming soon! Our designers are currently creating the light palette.");
                      }}
                      trackColor={{ false: '#374151', true: '#E91E76' }}
                      thumbColor="#fff"
                    />
                  </View>

                </View>
              </ScrollView>
            </>
          ) : activeSettingView === 'privacy' ? (
            <>
              <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-white/10">
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity onPress={() => setActiveSettingView(null)} className="w-10 h-10 items-center justify-center bg-white/5 rounded-full">
                    <ChevronLeft color="#fff" size={24} />
                  </TouchableOpacity>
                  <Text className="text-white text-[18px] font-bold">Privacy & Blind Mode</Text>
                </View>
              </View>

              <ScrollView className="flex-1">
                <View className="px-5 py-6">
                  
                  <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">DISCOVERABILITY</Text>
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1 pr-4">
                      <Text className="text-white text-[16px] font-medium">Private Account</Text>
                      <Text className="text-[#9CA3AF] text-[12px] mt-1">
                        When your account is private, only people you approve can follow you and watch your videos.
                      </Text>
                    </View>
                    <Switch
                      value={isPrivateAccount}
                      onValueChange={setIsPrivateAccount}
                      trackColor={{ false: '#374151', true: '#E91E76' }}
                      thumbColor="#fff"
                    />
                  </View>

                  <View className="h-[1px] w-full bg-white/10 my-6" />

                  <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">BLIND MODE PREFERENCES</Text>
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1 pr-4">
                      <Text className="text-white text-[16px] font-medium">Enable Blind Mode by Default</Text>
                      <Text className="text-[#9CA3AF] text-[12px] mt-1">
                        Automatically hide video visuals when scrolling your feed until you judge the audio.
                      </Text>
                    </View>
                    <Switch
                      value={isBlindModeEnabled}
                      onValueChange={setIsBlindModeEnabled}
                      trackColor={{ false: '#374151', true: '#E91E76' }}
                      thumbColor="#fff"
                    />
                  </View>

                </View>
              </ScrollView>
            </>
          ) : null}
        </View>
      </Modal>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-[#12141A] w-full rounded-t-3xl border-t border-white/10 flex-col pb-8 pt-4 px-5">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-[20px] font-bold">Invite Aarav Nair</Text>
                <TouchableOpacity onPress={() => setIsInviteModalOpen(false)}>
                  <X color="#9CA3AF" size={24} />
                </TouchableOpacity>
              </View>

              <View className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-2">Performance Details & Rates</Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white text-[14px]">Private Acoustic Set (60 mins)</Text>
                  <Text className="text-white font-bold">₹15,000</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-[14px]">Full Band Show (90 mins)</Text>
                  <Text className="text-white font-bold">₹45,000</Text>
                </View>
              </View>

              <View className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-2">Requirements</Text>
                <Text className="text-[#D1D5DB] text-[13px] leading-5 mb-2">• PA System (2 mains, 1 monitor) if audience over 50</Text>
                <Text className="text-[#D1D5DB] text-[13px] leading-5 mb-2">• 1 Vocal Mic (Shure SM58 preferred), 1 DI Box</Text>
                <Text className="text-[#D1D5DB] text-[13px] leading-5">• Basic stage lighting (warm wash)</Text>
              </View>

              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert("Request Sent", "Your booking request has been sent to Aarav Nair!");
                setIsInviteModalOpen(false);
              }} className="bg-[#E91E76] h-[48px] rounded-full flex-row items-center justify-center mt-2">
                <Text className="text-white font-bold text-[14px] tracking-widest">SEND INQUIRY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function SettingsRow({ icon, title, subtitle, onPress }: { icon: React.ReactNode, title: string, subtitle?: string, onPress?: () => void }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      className="flex-row items-center justify-between mb-6 bg-white/5 p-4 rounded-xl"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
      }}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-[40px] h-[40px] rounded-full bg-white/10 items-center justify-center">
          {icon}
        </View>
        <View>
          <Text className="text-white text-[16px] font-medium">{title}</Text>
          {subtitle && <Text className="text-[#9CA3AF] text-[12px] mt-1">{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight color="#9CA3AF" size={20} />
    </TouchableOpacity>
  );
}
