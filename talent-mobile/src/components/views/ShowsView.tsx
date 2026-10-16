import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
  RefreshControl,
} from 'react-native';
import {
  Ticket,
  MapPin,
  Calendar,
  Star,
  Users,
  Music,
  Navigation,
  X,
  Clock,
  ChevronRight,
  Check,
  Camera,
  QrCode,
  Plus,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { api, resolveMediaUrl } from '../../utils/api';
import { AppVideoPlayer } from '../ui/AppVideoPlayer';

export function ShowsView() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'archive'>('upcoming');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected Show Preview Modal
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // Create Show Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newDate, setNewDate] = useState('2026-11-20T20:00:00Z');
  const [newImage, setNewImage] = useState('');
  const [creatingShow, setCreatingShow] = useState(false);

  const cities = ['All Cities', 'Bengaluru', 'Mumbai', 'Kochi', 'Delhi NCR'];

  const fetchShows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/shows', {
        params: {
          city: selectedCity !== 'All Cities' ? selectedCity : undefined,
          status: activeTab,
        },
      });
      if (Array.isArray(res.data)) {
        setShows(res.data);
      }
    } catch (err) {
      console.warn('Failed to load shows from API:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCity, activeTab]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShows();
  };

  const handleToggleRSVP = async (show: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setRsvpLoading(true);
      const res = await api.post(`/shows/${show.id}/book`);
      const isBooked = res.data.isBooked;

      // Update in local state
      setShows((prev) =>
        prev.map((s) => {
          if (s.id === show.id) {
            const nextCount = isBooked ? s.visiting + 1 : Math.max(0, s.visiting - 1);
            return {
              ...s,
              isBooked,
              visiting: nextCount,
              ticketCode: res.data.ticketCode || `PASS-${s.id}-${user?.id || 1}`,
            };
          }
          return s;
        })
      );

      if (selectedShow && selectedShow.id === show.id) {
        setSelectedShow((prev: any) => ({
          ...prev,
          isBooked,
          visiting: isBooked ? prev.visiting + 1 : Math.max(0, prev.visiting - 1),
          ticketCode: res.data.ticketCode || `PASS-${prev.id}-${user?.id || 1}`,
        }));
      }

      if (isBooked) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'RSVP Confirmed! 🎟️',
          `Your Digital Entry Pass for "${show.title}" is ready in your preview modal.`
        );
      }
    } catch (err) {
      console.error('RSVP error:', err);
      Alert.alert('Error', 'Could not update RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCreateShow = async () => {
    if (!newTitle.trim() || !newLocation.trim()) {
      Alert.alert('Missing Details', 'Please provide a show title and venue location.');
      return;
    }

    try {
      setCreatingShow(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const locString = newLocation.includes(newCity)
        ? newLocation
        : `${newLocation}, ${newCity}`;

      const res = await api.post('/shows', {
        title: newTitle.trim(),
        location: locString,
        date: newDate,
        image: newImage.trim() || '',
      });

      if (res.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewLocation('');
        setNewImage('');
        fetchShows();
        Alert.alert('Show Published!', 'Your live concert date is now visible to judges and fans.');
      }
    } catch (err: any) {
      console.error('Error creating show:', err);
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create show.');
    } finally {
      setCreatingShow(false);
    }
  };

  const formatShowDate = (dateStr?: string) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShowTime = (dateStr?: string) => {
    if (!dateStr) return '8:00 PM';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      <ScrollView
        className="flex-1 pt-14"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View className="px-5 mb-5 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center gap-2.5 mb-1">
              <View
                style={{ backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }}
                className="w-8 h-8 rounded-lg items-center justify-center border"
              >
                <Ticket color={theme.primary} size={16} />
              </View>
              <Text className="text-[28px] font-bold tracking-tight" style={{ color: theme.text }}>
                Shows
              </Text>
            </View>
            <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
              Live gigs • Intimate acoustic sessions • Verified RSVP passes
            </Text>
          </View>

          {/* Create Show Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsCreateModalOpen(true);
            }}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border shadow-sm"
            style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
          >
            <Plus color="#ffffff" size={14} strokeWidth={2.5} />
            <Text className="text-[12px] font-bold text-white">Post Show</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs: Upcoming vs Archive */}
        <View className="px-5 mb-4 flex-row gap-2">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('upcoming');
            }}
            style={
              activeTab === 'upcoming'
                ? { backgroundColor: theme.primary }
                : { backgroundColor: theme.surfaceBg, borderColor: theme.border }
            }
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
              activeTab === 'upcoming' ? 'border-transparent shadow-md' : ''
            }`}
          >
            <Calendar color={activeTab === 'upcoming' ? '#fff' : theme.textSecondary} size={14} />
            <Text
              className="font-bold text-[13px]"
              style={{ color: activeTab === 'upcoming' ? '#ffffff' : theme.textSecondary }}
            >
              Upcoming Shows
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('archive');
            }}
            style={
              activeTab === 'archive'
                ? { backgroundColor: theme.primary }
                : { backgroundColor: theme.surfaceBg, borderColor: theme.border }
            }
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
              activeTab === 'archive' ? 'border-transparent shadow-md' : ''
            }`}
          >
            <Ticket color={activeTab === 'archive' ? '#fff' : theme.textSecondary} size={14} />
            <Text
              className="font-bold text-[13px]"
              style={{ color: activeTab === 'archive' ? '#ffffff' : theme.textSecondary }}
            >
              Past Archives
            </Text>
          </TouchableOpacity>
        </View>

        {/* City Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5 px-5"
          contentContainerStyle={{ paddingRight: 40, gap: 8 }}
        >
          {cities.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCity(city);
                }}
                style={
                  isSelected
                    ? { borderColor: theme.primary, backgroundColor: theme.primary + '20' }
                    : { borderColor: theme.border, backgroundColor: theme.cardBg }
                }
                className="px-4 py-2 rounded-full border"
              >
                <Text
                  className="font-medium text-[12px]"
                  style={{ color: isSelected ? theme.primary : theme.textSecondary }}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Shows Feed Cards */}
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text className="text-[13px] mt-3" style={{ color: theme.textSecondary }}>
              Loading stage dates...
            </Text>
          </View>
        ) : shows.length === 0 ? (
          <View className="items-center justify-center py-16 px-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: theme.surfaceBg }}
            >
              <Ticket color={theme.textSecondary} size={28} />
            </View>
            <Text className="text-[16px] font-bold mb-1" style={{ color: theme.text }}>
              No shows found for {selectedCity}
            </Text>
            <Text className="text-[13px] text-center max-w-xs mb-6" style={{ color: theme.textSecondary }}>
              Be the first artist to schedule a live gig in this city!
            </Text>
            <TouchableOpacity
              onPress={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-full"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-white font-bold text-[13px]">Post a Show Date</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-5 gap-6">
            {shows.map((show) => {
              const isBooked = show.isBooked;
              return (
                <View
                  key={show.id}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                  className="rounded-3xl border overflow-hidden shadow-lg"
                >
                  {/* Show Banner Image / Media Preview */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedShow(show);
                    }}
                    className="h-44 w-full relative bg-black"
                  >
                    <Image
                      source={{
                        uri: show.image || '',
                      }}
                      className="w-full h-full opacity-80"
                      resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {/* Top Badges */}
                    <View className="absolute top-3 inset-x-3 flex-row items-center justify-between">
                      <View className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex-row items-center gap-1.5">
                        <Calendar color="#E50914" size={11} />
                        <Text className="text-white text-[11px] font-bold">
                          {formatShowDate(show.date)}
                        </Text>
                      </View>

                      {isBooked ? (
                        <View className="bg-[#10B981] px-3 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
                          <Check color="#fff" size={12} strokeWidth={2.5} />
                          <Text className="text-white text-[10px] font-bold uppercase">Pass Booked</Text>
                        </View>
                      ) : (
                        <View className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex-row items-center gap-1.5">
                          <Users color="#fff" size={11} />
                          <Text className="text-white/90 text-[10px] font-semibold">
                            {show.visiting} RSVP'd
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Host Avatar & Name Bottom Overlay */}
                    <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Image
                          source={{
                            uri:
                              show.host?.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                show.host?.name || show.host?.username || 'Artist'
                              )}&background=E50914&color=fff`,
                          }}
                          className="w-6 h-6 rounded-full border border-white/40"
                        />
                        <Text className="text-white text-[12px] font-medium" numberOfLines={1}>
                          {show.host?.name || show.host?.username || 'Featured Artist'}
                        </Text>
                      </View>

                      <Text className="text-white/80 text-[11px] font-medium">
                        {formatShowTime(show.date)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Body Content */}
                  <View className="p-4">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedShow(show)}
                    >
                      <Text
                        className="text-[18px] font-bold mb-1 leading-snug"
                        style={{ color: theme.text }}
                      >
                        {show.title}
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-1.5 mb-4">
                      <MapPin color={theme.primary} size={14} />
                      <Text
                        className="text-[13px] flex-1"
                        style={{ color: theme.textSecondary }}
                        numberOfLines={1}
                      >
                        {show.location}
                      </Text>
                    </View>

                    {/* Action Bar */}
                    <View className="flex-row items-center justify-between pt-3 border-t" style={{ borderTopColor: theme.border }}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedShow(show)}
                        className="flex-row items-center gap-1 py-1"
                      >
                        <Text className="text-[12px] font-bold" style={{ color: theme.primary }}>
                          View Stage Preview
                        </Text>
                        <ChevronRight color={theme.primary} size={14} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleToggleRSVP(show)}
                        disabled={rsvpLoading}
                        style={{
                          backgroundColor: isBooked ? '#10B981' : theme.primary,
                        }}
                        className="px-4 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm"
                      >
                        {isBooked ? (
                          <>
                            <QrCode color="#fff" size={13} />
                            <Text className="text-white font-bold text-[12px]">View QR Pass</Text>
                          </>
                        ) : (
                          <>
                            <Ticket color="#fff" size={13} />
                            <Text className="text-white font-bold text-[12px]">RSVP Free Pass</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Show Preview & Digital QR Pass Modal */}
      {selectedShow && (
        <Modal visible={true} transparent={true} animationType="slide" onRequestClose={() => setSelectedShow(null)}>
          <View className="flex-1 bg-black/80 justify-end">
            <View
              className="h-[90%] rounded-t-3xl border-t overflow-hidden"
              style={{ backgroundColor: theme.bg, borderTopColor: theme.border }}
            >
              {/* Modal Top Bar */}
              <View
                className="flex-row items-center justify-between p-4 border-b"
                style={{ borderBottomColor: theme.border }}
              >
                <View className="flex-row items-center gap-2">
                  <View className="bg-[#E50914] px-2 py-0.5 rounded">
                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Show Details</Text>
                  </View>
                  <Text className="font-bold text-[14px] max-w-[200px]" style={{ color: theme.text }} numberOfLines={1}>
                    {selectedShow.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedShow(null)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.surfaceBg }}
                >
                  <X color={theme.text} size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                <Text className="text-[#E50914] text-[11px] font-bold tracking-widest uppercase mb-1">
                  Verified Artist Concert
                </Text>
                <Text className="text-[24px] font-bold leading-tight mb-3" style={{ color: theme.text }}>
                  {selectedShow.title}
                </Text>

                <View className="flex-row items-center gap-4 mb-5">
                  <View className="flex-row items-center gap-1.5">
                    <Calendar color={theme.primary} size={14} />
                    <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                      {formatShowDate(selectedShow.date)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Clock color={theme.primary} size={14} />
                    <Text className="text-[13px]" style={{ color: theme.textSecondary }}>
                      {formatShowTime(selectedShow.date)}
                    </Text>
                  </View>
                </View>

                {/* DIGITAL QR ENTRY PASS BLOCK (Active when RSVP'd) */}
                {selectedShow.isBooked && (
                  <View
                    style={{ backgroundColor: theme.cardBg, borderColor: '#10B981', borderWidth: 1.5 }}
                    className="rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-1.5">
                        <QrCode color="#10B981" size={16} />
                        <Text className="text-[#10B981] font-bold text-[13px] tracking-wide uppercase">
                          Official Entry Pass
                        </Text>
                      </View>
                      <View className="bg-[#10B981]/20 px-2 py-0.5 rounded border border-[#10B981]/40">
                        <Text className="text-[#10B981] text-[10px] font-bold">VERIFIED GUEST</Text>
                      </View>
                    </View>

                    {/* QR Code Matrix Visual Representation */}
                    <View className="items-center py-3 bg-white rounded-xl mb-3 shadow-sm">
                      <QrCode color="#000" size={100} strokeWidth={2} />
                      <Text className="text-black font-mono font-bold text-[12px] tracking-widest mt-2">
                        {selectedShow.ticketCode || `PASS-${selectedShow.id}-${user?.id || 1}`}
                      </Text>
                      <Text className="text-gray-500 text-[10px] mt-0.5">Show this at the venue door entrance</Text>
                    </View>

                    <Text className="text-[11px] text-center" style={{ color: theme.textSecondary }}>
                      Pass registered to: <Text className="font-bold text-white">@{user?.username || 'You'}</Text>
                    </Text>
                  </View>
                )}

                {/* Venue Details */}
                <View
                  className="rounded-2xl p-4 border mb-5"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                >
                  <Text className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: theme.textSecondary }}>
                    Venue & Navigation
                  </Text>
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-3">
                      <Text className="font-bold text-[15px] mb-1" style={{ color: theme.text }}>
                        {selectedShow.location}
                      </Text>
                      <Text className="text-[11px]" style={{ color: theme.textSecondary }}>
                        All Ages • Doors open 45 minutes before stage start
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const query = encodeURIComponent(selectedShow.location);
                        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
                      }}
                      className="px-3 py-2 rounded-xl flex-row items-center gap-1.5 border"
                      style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                    >
                      <Navigation color={theme.text} size={13} />
                      <Text className="text-[11px] font-bold" style={{ color: theme.text }}>
                        Directions
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* RSVP Bottom Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggleRSVP(selectedShow)}
                  disabled={rsvpLoading}
                  style={{
                    backgroundColor: selectedShow.isBooked ? '#EF4444' : theme.primary,
                  }}
                  className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg mb-4"
                >
                  {selectedShow.isBooked ? (
                    <>
                      <X color="#fff" size={18} />
                      <Text className="text-white font-bold text-[15px]">Cancel My RSVP</Text>
                    </>
                  ) : (
                    <>
                      <Ticket color="#fff" size={18} />
                      <Text className="text-white font-bold text-[15px]">Claim Free RSVP Ticket</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Post / Create Show Modal for Artists */}
      <Modal visible={isCreateModalOpen} transparent={true} animationType="slide" onRequestClose={() => setIsCreateModalOpen(false)}>
        <View className="flex-1 bg-black/75 justify-end">
          <View
            className="h-[80%] rounded-t-3xl border-t p-5"
            style={{ backgroundColor: theme.bg, borderTopColor: theme.border }}
          >
            <View className="flex-row items-center justify-between pb-4 border-b mb-4" style={{ borderBottomColor: theme.border }}>
              <View className="flex-row items-center gap-2">
                <Sparkles color={theme.primary} size={18} />
                <Text className="text-[18px] font-bold" style={{ color: theme.text }}>
                  Schedule Live Show Date
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X color={theme.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-[12px] font-bold mb-1.5" style={{ color: theme.text }}>
                  Concert / Gig Title
                </Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Unplugged Candlelight Session"
                  placeholderTextColor={theme.textSecondary}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                  className="px-4 py-3 rounded-xl border text-[14px]"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[12px] font-bold mb-1.5" style={{ color: theme.text }}>
                  Venue Address & Location
                </Text>
                <TextInput
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="e.g. The Next Stage, Indiranagar"
                  placeholderTextColor={theme.textSecondary}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                  className="px-4 py-3 rounded-xl border text-[14px]"
                />
              </View>

              <View className="mb-4">
                <Text className="text-[12px] font-bold mb-1.5" style={{ color: theme.text }}>
                  City
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Bengaluru', 'Mumbai', 'Kochi', 'Delhi NCR'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setNewCity(c)}
                      style={{
                        backgroundColor: newCity === c ? theme.primary : theme.surfaceBg,
                        borderColor: newCity === c ? theme.primary : theme.border,
                      }}
                      className="px-4 py-2 rounded-full border"
                    >
                      <Text
                        className="text-[12px] font-bold"
                        style={{ color: newCity === c ? '#fff' : theme.textSecondary }}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-[12px] font-bold mb-1.5" style={{ color: theme.text }}>
                  Poster Image URL (Optional)
                </Text>
                <TextInput
                  value={newImage}
                  onChangeText={setNewImage}
                  placeholder="https://example.com/poster.jpg"
                  placeholderTextColor={theme.textSecondary}
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border, color: theme.text }}
                  className="px-4 py-3 rounded-xl border text-[14px]"
                />
              </View>

              <TouchableOpacity
                onPress={handleCreateShow}
                disabled={creatingShow}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-4 rounded-xl items-center justify-center shadow-md mb-6"
              >
                {creatingShow ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-[15px]">Publish Live Date</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
