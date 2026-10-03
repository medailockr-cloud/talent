import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Search, EyeOff, Flame, Lock, Play, Pause, Maximize2, MoreHorizontal, X, Heart, MessageCircle, Gavel } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFeed } from '@/hooks/useFeed';

const HEADER_HEIGHT = 175;

function FeedVideoCard({ video, playingVideoId, setPlayingVideoId, user }: { video: any, playingVideoId: string | null, setPlayingVideoId: (id: string | null) => void, user?: any }) {
  const isPlaying = playingVideoId === video.id;
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  
  const [isJudging, setIsJudging] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(video.userRating || null);
  const [averageRating, setAverageRating] = useState<number>(video.averageRating || 0);

  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>(video.comments || []);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount || 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !user) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`http://localhost:3000/api/videos/${video.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, text: commentText.trim() }),
      });
      const data = await res.json();
      setComments([{ ...data, author: data.user?.name || data.user?.username || user.name || user.username }, ...comments]);
      setCommentsCount(commentsCount + 1);
      setCommentText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to submit comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRate = async (score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserRating(score);
    setIsJudging(false);

    try {
      const res = await fetch(`http://localhost:3000/api/videos/${video.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, score }),
      });
      const data = await res.json();
      if (data.averageRating) setAverageRating(data.averageRating);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to submit rating.');
    }
  };

  const handleLike = async () => {
    if (!user) return Alert.alert('Login Required', 'You must be logged in to like videos.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    
    try {
      await fetch(`http://localhost:3000/api/videos/${video.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (e) {
      console.error(e);
      // Revert on failure
      setIsLiked(isLiked);
      setLikesCount(isLiked ? likesCount : likesCount - 1);
    }
  };
  const player = useVideoPlayer(video.url, player => {
    player.loop = true;
  });

  React.useEffect(() => {
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  return (
    <>
      <View className="flex-col pb-3.5 mb-3.5 border-b border-white/[0.08]">
      <View className="relative w-full aspect-[16/9.35] rounded-[18px] overflow-hidden border border-white/15 bg-[#100C09]">
        <VideoView
          style={{ width: '100%', height: '100%' }}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls={false}
        />
        <View className="absolute inset-x-0 top-0 h-14 bg-black/40" />
        
        <View className="absolute top-3 left-3.5 flex-row items-center gap-2">
          <Text className="text-[10.5px] font-medium tracking-[0.11em] text-white/95 uppercase">PERFORMANCE</Text>
          <Text className="text-white/80 text-[10.5px]">•</Text>
          <Text className="text-white/95 text-[10.5px] tracking-[0.11em]">0:58</Text>
        </View>

        <View className="absolute top-2.5 right-2.5">
          <TouchableOpacity 
            activeOpacity={0.7} 
            className="h-[26px] px-2.5 rounded-[7px] bg-black/60 border border-white/20 flex-row items-center gap-1.5"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Visibility Status', 'This video is currently hidden due to blind mode.');
            }}
          >
            <EyeOff color="#fff" size={12} strokeWidth={1.8} />
            <Text className="text-[9.5px] font-medium tracking-[0.09em] text-white/90 uppercase">POPULARITY HIDDEN</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          activeOpacity={0.7} 
          className={`absolute top-1/2 left-1/2 -ml-[26px] -mt-[26px] w-[52px] h-[52px] rounded-full bg-black/45 border-[1.5px] border-white/85 items-center justify-center ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (isPlaying) {
              setPlayingVideoId(null);
            } else {
              setPlayingVideoId(video.id);
            }
          }}
        >
          {isPlaying ? (
            <Pause color="#fff" fill="#fff" size={20} />
          ) : (
            <Play color="#fff" fill="#fff" size={20} className="ml-1" />
          )}
        </TouchableOpacity>

        <View className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1.5">
          <TouchableOpacity 
            activeOpacity={0.7} 
            className="w-[27px] h-[27px] rounded-[7px] bg-black/65 border border-white/20 items-center justify-center"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Fullscreen', 'Enter fullscreen viewing mode');
            }}
          >
            <Maximize2 color="#fff" size={13} strokeWidth={2} />
          </TouchableOpacity>
          <View className="h-[27px] px-2.5 rounded-[7px] bg-black/65 border border-white/20 items-center justify-center">
            <Text className="text-[11px] font-medium text-white/95 tracking-[0.05em]">00:58 / 01:00</Text>
          </View>
        </View>
      </View>

      <View className="mt-2.5 flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <TouchableOpacity 
            activeOpacity={0.7} 
            className="flex-row items-center gap-2.5"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Profile', `View ${video.author}'s profile`);
            }}
          >
            <View className="w-[30px] h-[30px] rounded-full bg-[#1A1D24] overflow-hidden border-[1.5px] border-white/10">
              <Image source={{ uri: video.avatar }} className="w-full h-full" />
            </View>
            <View className="flex-col pb-0.5">
              <Text className="text-white text-[13px] font-bold tracking-tight">{video.author}</Text>
              <Text className="text-[#8E95A5] text-[11px] tracking-tight">{video.role || 'Creator'}</Text>
              <Text className="text-white/90 text-[12px] mt-1">{video.title}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            activeOpacity={0.7} 
            className="flex-row items-center gap-1.5 px-3 h-[30px] rounded-full bg-[#171922] border border-white/[0.06] mt-1"
            onPress={handleLike}
          >
            <Heart color={isLiked ? "#E91E76" : "#9CA3AF"} fill={isLiked ? "#E91E76" : "transparent"} size={16} />
            <Text className="text-[#9CA3AF] text-[12px] font-medium">{likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.7} 
            className="flex-row items-center gap-1.5 px-3 h-[30px] rounded-full bg-[#171922] border border-white/[0.06] mt-1"
            onPress={() => {
              if (!user) return Alert.alert('Login Required', 'You must be logged in to judge videos.');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsJudging(true);
            }}
          >
            <Gavel color={userRating ? "#E91E76" : "#9CA3AF"} size={16} />
            <Text className="text-[#9CA3AF] text-[12px] font-medium">{averageRating ? averageRating.toFixed(1) : 'Rate'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.7} 
            className="flex-row items-center gap-1.5 px-3 h-[30px] rounded-full bg-[#171922] border border-white/[0.06] mt-1"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsCommenting(true);
            }}
          >
            <MessageCircle color="#9CA3AF" size={16} />
            <Text className="text-[#9CA3AF] text-[12px] font-medium">{commentsCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.7} 
            className="w-[30px] h-[30px] rounded-full bg-[#171922] border border-white/[0.06] items-center justify-center mt-1 ml-1"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('More Options', 'Share, Report, or copy link to this take');
            }}
          >
            <MoreHorizontal color="#9CA3AF" size={16} />
          </TouchableOpacity>
        </View>
        </View>
      </View>

      {/* Judging Overlay Modal */}
      {isJudging && (
        <View className="absolute inset-0 z-50 bg-black/60 items-center justify-center p-4">
          <View className="bg-[#171922] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-lg font-bold">Judge this take</Text>
              <TouchableOpacity onPress={() => setIsJudging(false)}>
                <X color="#9CA3AF" size={24} />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row flex-wrap justify-center gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <TouchableOpacity
                  key={score}
                  onPress={() => handleRate(score)}
                  activeOpacity={0.7}
                  className={`w-12 h-12 rounded-full items-center justify-center border ${
                    userRating === score 
                      ? 'bg-[#E91E76] border-[#E91E76]' 
                      : 'bg-[#2A2D3A] border-white/5'
                  }`}
                >
                  <Text className={`text-lg font-bold ${userRating === score ? 'text-white' : 'text-gray-300'}`}>
                    {score}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text className="text-gray-400 text-center mt-6 text-sm">Select a score from 1 to 10</Text>
          </View>
        </View>
      )}

      {/* Comments Overlay Modal */}
      <Modal visible={isCommenting} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-[#171922] w-full h-[65%] rounded-t-3xl border-t border-white/10 flex-col pb-6">
              <View className="flex-row justify-between items-center p-5 border-b border-white/10">
                <Text className="text-white text-lg font-bold">Comments ({commentsCount})</Text>
                <TouchableOpacity onPress={() => setIsCommenting(false)}>
                  <X color="#9CA3AF" size={24} />
                </TouchableOpacity>
              </View>
              
              <View className="flex-1 p-5">
                {comments.length === 0 ? (
                  <Text className="text-gray-400 text-center mt-10">No comments yet. Be the first!</Text>
                ) : (
                  <Animated.ScrollView showsVerticalScrollIndicator={false}>
                    {comments.map((c: any, index: number) => (
                      <View key={c.id || index} className="mb-4 flex-row gap-3">
                        <View className="w-8 h-8 rounded-full bg-[#2A2D3A] items-center justify-center">
                          <Text className="text-white text-xs font-bold">{c.author ? c.author[0].toUpperCase() : 'U'}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-[#9CA3AF] text-xs font-bold mb-1">{c.author}</Text>
                          <Text className="text-white text-sm">{c.text}</Text>
                        </View>
                      </View>
                    ))}
                  </Animated.ScrollView>
                )}
              </View>
              
              <View className="p-4 border-t border-white/10 flex-row items-center bg-[#050608]">
                {user ? (
                  <>
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Add comment..."
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 bg-[#1A1D24] text-white px-4 py-3 rounded-full border border-white/5"
                      onSubmitEditing={handleCommentSubmit}
                      returnKeyType="send"
                    />
                    <TouchableOpacity 
                      className={`ml-3 px-4 py-3 rounded-full ${commentText.trim() ? 'bg-[#E91E76]' : 'bg-[#E91E76]/50'}`}
                      disabled={!commentText.trim() || isSubmittingComment}
                      onPress={handleCommentSubmit}
                    >
                      <Text className="text-white font-bold text-sm">Post</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text className="text-gray-400 text-sm text-center w-full py-2">Log in to comment</Text>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

export function HomeView({ user }: { user?: any }) {
  const [activeFeedTab, setActiveFeedTab] = useState('For You');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const { videos, isLoading } = useFeed(user?.id);
  
  const filteredVideos = videos.filter(v => 
    searchQuery.trim() === '' ? true : 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: '#050608',
      paddingBottom: 4,
    };
  });

  if (isSearchOpen) {
    return (
      <View className="flex-1 bg-[#0B0D13]">
        <View className="px-4 pt-12 pb-4">
          <View className="flex-row items-center w-full bg-[#1A1D24] rounded-full px-4 h-11 border border-white/5">
            <Search color="#9CA3AF" size={18} />
            <TextInput 
              className="flex-1 ml-2 text-white font-medium text-[15px]"
              placeholder="Search"
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}>
              <X color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-[1px]">
          <View className="flex-row flex-wrap">
            {filteredVideos.map((video, index) => (
              <View key={video.id} className="w-[33.33%] p-[1px]">
                <TouchableOpacity 
                  activeOpacity={0.8}
                  className="aspect-[3/4.5] bg-[#1A1D24] relative overflow-hidden"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPlayingVideoId(video.id);
                    setIsSearchOpen(false);
                  }}
                >
                  <Image source={{ uri: `https://picsum.photos/seed/${index + 40}/300/450` }} className="w-full h-full" />
                  
                  <View className="absolute top-2 right-2 w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <Play color="black" fill="black" size={11} className="ml-0.5" />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View className="h-32" />
        </Animated.ScrollView>

        <TouchableOpacity 
          activeOpacity={0.85}
          className="absolute bottom-8 right-4 bg-[#21242D] rounded-full px-4 h-12 flex-row items-center gap-2.5 border border-white/10 shadow-lg"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Messages', 'Open messages');
          }}
        >
          <View className="relative">
            <Text className="text-white text-lg">💬</Text>
            <View className="absolute -bottom-1 -right-2 bg-[#E91E76] rounded-full w-[15px] h-[15px] items-center justify-center border-[1.5px] border-[#21242D]">
              <Text className="text-white text-[8px] font-bold">2</Text>
            </View>
          </View>
          <Text className="text-white font-medium text-[14px]">Messages</Text>
          <View className="flex-row ml-1 -space-x-2">
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} className="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#21242D]" />
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} className="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#21242D]" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050608]"><Animated.View style={headerStyle}>
          <View className="px-4 pt-12 pb-2 flex-row items-center justify-between">
            <View className="flex-row items-baseline">
              <Text className="font-bold text-[33px] tracking-[-0.02em] text-white leading-none">talent</Text>
              <Text className="font-bold text-[33px] text-[#E91E76] leading-none ml-[0.5px]">.</Text>
            </View>
            <View className="flex-row items-center gap-3.5">
              <TouchableOpacity 
                activeOpacity={0.7} 
                className="w-10 h-10 rounded-full items-center justify-center -mr-2"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsSearchOpen(true);
                }}
              >
                <Search color="#E5E7EB" size={23} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </View>
          <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>{['For You', 'Rising', 'Nearby', 'Live', 'All Genres'].map((tab) => {
              const isActive = activeFeedTab === tab;
              return (
                <TouchableOpacity activeOpacity={0.7}
                  key={tab}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveFeedTab(tab);
                  }}
                  className={`h-[34px] px-4 rounded-full flex-row items-center justify-center ${
                    isActive ? 'bg-[#42112B] border-[1.5px] border-[#E52177]' : 'bg-[#13151C] border border-[#252834]'
                  }`}
                >
                  <Text className={`text-[12.5px] ${isActive ? 'text-white font-semibold' : 'text-[#D1D5DB] font-medium'}`}>
                    {tab}
                  </Text>
                  {tab === 'Live' && (
                    <View className="w-[6px] h-[6px] rounded-full bg-[#EC267F] ml-1.5 -mt-1.5" />
                  )}
                </TouchableOpacity>
              )
            })}</Animated.ScrollView>
          <View className="px-4 pb-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-[#8E95A5] font-medium text-[11px]">Filter:</Text>
              <TouchableOpacity 
                activeOpacity={0.7} 
                className="px-2.5 py-0.5 rounded-full bg-white/20"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Filter', 'Show all takes');
                }}
              >
                <Text className="text-white font-semibold text-[11px]">All (13)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7} 
                className="px-2.5 py-0.5 rounded-full flex-row items-center gap-1"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Filter', 'Show only hidden takes');
                }}
              >
                <EyeOff color="#E91E76" size={12} />
                <Text className="text-[#9CA3AF] text-[11px]">Hidden (7)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7} 
                className="px-2.5 py-0.5 rounded-full flex-row items-center gap-1"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Filter', 'Show only showing takes');
                }}
              >
                <Flame color="#fbbf24" size={12} />
                <Text className="text-[#9CA3AF] text-[11px]">Showing (6)</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-[#7C8495] text-[10px]">13 takes</Text>
          </View>
        </Animated.View><Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingHorizontal: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >{isLoading ? (
          <Text className="text-white text-center mt-10">Loading videos from backend...</Text>
        ) : filteredVideos.length === 0 ? (
          <Text className="text-white text-center mt-10">No videos found.</Text>
        ) : (
          filteredVideos.map((video) => (
            <FeedVideoCard 
              key={video.id} 
              video={video} 
              playingVideoId={playingVideoId} 
              setPlayingVideoId={setPlayingVideoId}
              user={user}
            />
          ))
      )}</Animated.ScrollView></View>
  );
}
