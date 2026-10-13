import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, SafeAreaView, Platform } from 'react-native';
import { Ticket, MapPin, Calendar, Star, Users, Music, Play, Navigation, X, Clock, Map, ChevronRight, Check, Camera } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { resolveMediaUrl } from '../../utils/api';

export function ShowsView() {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [showModal, setShowModal] = useState(false);

  const cities = ['All Cities', 'Bengaluru', 'Mumbai', 'Kochi', 'Delhi NCR'];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      <ScrollView className="flex-1 pt-14" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="px-5 mb-5 flex-row items-start justify-between">
          <View>
            <View className="flex-row items-center gap-3 mb-1">
              <View 
                style={{ backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }}
                className="w-8 h-8 rounded-lg items-center justify-center border"
              >
                <Ticket color={theme.primary} size={16} />
              </View>
              <Text className="text-[28px] font-serif font-bold tracking-tight" style={{ color: theme.text }}>Shows</Text>
            </View>
            <Text className="text-[13px]" style={{ color: theme.textSecondary }}>Live concerts • Venue previews • Past gig archives & ratings</Text>
          </View>
          <TouchableOpacity 
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border"
            style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
          >
            <Star color={theme.primary} size={12} fill={theme.primary} />
            <View>
              <Text className="text-[10px] font-bold" style={{ color: theme.text }}>Audition</Text>
              <Text className="text-[10px] font-bold" style={{ color: theme.text }}>Take</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="px-5 mb-4 flex-row gap-2">
          <TouchableOpacity 
            onPress={() => setActiveTab('upcoming')}
            style={activeTab === 'upcoming' 
              ? { backgroundColor: theme.primary } 
              : { backgroundColor: theme.surfaceBg, borderColor: theme.border }}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${activeTab === 'upcoming' ? 'border-transparent shadow-md' : ''}`}
          >
            <Calendar color={activeTab === 'upcoming' ? '#fff' : theme.textSecondary} size={14} />
            <Text 
              className="font-bold text-[13px]"
              style={{ color: activeTab === 'upcoming' ? '#ffffff' : theme.textSecondary }}
            >
              Upcoming Shows (4)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('archive')}
            style={activeTab === 'archive' 
              ? { backgroundColor: theme.primary } 
              : { backgroundColor: theme.surfaceBg, borderColor: theme.border }}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${activeTab === 'archive' ? 'border-transparent shadow-md' : ''}`}
          >
            <Ticket color={activeTab === 'archive' ? '#fff' : theme.textSecondary} size={14} />
            <Text 
              className="font-bold text-[13px]"
              style={{ color: activeTab === 'archive' ? '#ffffff' : theme.textSecondary }}
            >
              Previous Archive (3)
            </Text>
          </TouchableOpacity>
        </View>

        {/* City Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 px-5" contentContainerStyle={{ paddingRight: 40, gap: 8 }}>
          {cities.map(city => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity 
                key={city}
                onPress={() => setSelectedCity(city)}
                style={isSelected 
                  ? { borderColor: theme.primary, backgroundColor: theme.primary + '15' } 
                  : { borderColor: theme.border, backgroundColor: theme.cardBg }}
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

        {activeTab === 'upcoming' ? (
          <>
            <View className="px-5 mb-3 flex-row justify-between items-center">
              <Text className="text-[12px] font-medium" style={{ color: theme.textSecondary }}>Confirmed live stage dates & RSVP list</Text>
              <Text className="text-[#E91E76] text-[12px] font-bold">Priority Judge Passes</Text>
            </View>

            {/* Featured Upcoming */}
            <View className="px-5 mb-8">
              <View className="w-full bg-[#100C09] rounded-3xl overflow-hidden border border-white/10 relative">
                {Platform.OS === 'web' ? (
                  <video
                    src={resolveMediaUrl("http://localhost:3000/uploads/performer_1.mp4")}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="https://images.unsplash.com/photo-1516280440503-6c8c4a93883a?w=800&q=80"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 240, objectFit: 'cover', opacity: 0.45 }}
                  />
                ) : (
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1516280440503-6c8c4a93883a?w=800&q=80' }} className="w-full h-[220px] absolute top-0 opacity-40" />
                )}
                <View className="w-full h-[240px] absolute top-0 bg-gradient-to-t from-[#100C09] to-transparent" />
                
                <View className="p-4">
                  <View className="bg-[#E91E76] self-start px-2 py-1 rounded-md mb-20 flex-row items-center gap-1">
                    <Star color="#fff" size={10} fill="#fff" />
                    <Text className="text-white text-[10px] font-bold tracking-wider">SELLING FAST</Text>
                  </View>

                  <View className="flex-row items-center gap-2 mb-2">
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-white/90 text-[11px] font-medium">Aarav Nair • Acoustic Indie</Text>
                  </View>
                  
                  <Text className="text-white text-[22px] font-serif font-bold leading-tight mb-1">Aarav Nair: Live at The Next Stage</Text>
                  <Text className="text-[#9CA3AF] text-[12px] mb-3">Intimate Candlelight Acoustic & Raw Vocals</Text>

                  <View className="flex-row items-center gap-1.5 mb-4">
                    <MapPin color="#E91E76" size={12} />
                    <Text className="text-white/60 text-[11px]">The Next Stage, Indiranagar • 24 OCT</Text>
                  </View>

                  <View className="flex-row items-center justify-between mb-5">
                    <View className="flex-row items-center gap-2">
                      <View className="flex-row">
                        <Image source={{ uri: 'https://i.pravatar.cc/100?img=33' }} className="w-6 h-6 rounded-full border border-black z-30" />
                        <Image source={{ uri: 'https://i.pravatar.cc/100?img=47' }} className="w-6 h-6 rounded-full border border-black -ml-2 z-20" />
                        <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} className="w-6 h-6 rounded-full border border-black -ml-2 z-10" />
                      </View>
                      <Text className="text-white text-[11px]"><Text className="font-bold">439</Text> visiting</Text>
                    </View>
                    <View className="bg-[#059669]/20 px-3 py-1.5 rounded-full border border-[#059669]/30 flex-row items-center gap-1">
                      <Check color="#34D399" size={12} />
                      <Text className="text-[#34D399] text-[11px] font-bold">You're Visiting</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => setShowModal(true)} className="flex-1 bg-white/10 py-3.5 rounded-xl border border-white/5 flex-row items-center justify-center gap-2">
                      <Play color="#fff" size={14} fill="#fff" />
                      <Text className="text-white font-bold text-[12px] text-center">Preview Show &{'\n'}Seating</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-[#E91E76] py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-[#E91E76]/30">
                      <Ticket color="#fff" size={16} />
                      <Text className="text-white font-bold text-[14px]">Passes (₹799)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <Text className="font-serif text-[18px] font-bold px-5 mb-4" style={{ color: theme.text }}>All Scheduled Live Shows</Text>
            
            <View className="px-5">
              <View 
                className="w-full p-3 rounded-2xl border flex-row items-center gap-3"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <View 
                  className="w-14 h-16 rounded-xl border items-center justify-center"
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                >
                  <Text className="text-[20px] font-bold" style={{ color: theme.text }}>24</Text>
                  <Text className="text-[#E91E76] text-[10px] font-bold">OCT</Text>
                </View>
                <View className="flex-1 justify-center">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="bg-[#E91E76]/10 px-1.5 py-0.5 rounded border border-[#E91E76]/20">
                      <Text className="text-[#E91E76] text-[8px] font-bold">SELLING FAST</Text>
                    </View>
                    <Text className="text-[10px]" style={{ color: theme.textSecondary }}>8:00 PM IST (Doors open 7:1...</Text>
                  </View>
                  <Text className="font-bold text-[14px] mb-0.5" style={{ color: theme.text }} numberOfLines={1}>Aarav Nair: Live at The Next Stage</Text>
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }} numberOfLines={1}>Aarav Nair • Acoustic Indie</Text>
                </View>
                <View className="w-16 h-16 rounded-xl overflow-hidden relative">
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1516280440503-6c8c4a93883a?w=200&q=80' }} className="w-full h-full opacity-60" />
                  <View className="absolute inset-0 items-center justify-center">
                    <Play color="#fff" size={16} fill="#fff" />
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <View className="px-5 mb-4 flex-row justify-between items-center">
              <Text className="text-[12px] font-medium max-w-[200px]" style={{ color: theme.textSecondary }}>Historical gig logs, verified ratings & attendee reviews</Text>
              <Text className="text-[#EAB308] text-[12px] font-bold max-w-[80px] text-right">100% Sold Out Archive</Text>
            </View>

            <View className="px-5 mb-6">
              <View 
                className="w-full rounded-3xl p-4 border"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="border border-[#EAB308]/50 bg-[#EAB308]/10 px-2 py-0.5 rounded-md">
                        <Text className="text-[#EAB308] text-[9px] font-bold">SOLD OUT • 1,420 CAPACITY</Text>
                      </View>
                      <Text className="text-[11px]" style={{ color: theme.textSecondary }}>14 Dec 2025</Text>
                    </View>
                    <Text className="text-[18px] font-serif font-bold leading-tight w-[220px]" style={{ color: theme.text }}>Bacardi NH7 Weekender (The Acoustic Forest)</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center gap-1 bg-[#EAB308]/10 px-2 py-1 rounded border border-[#EAB308]/20 mb-1">
                      <Star color="#EAB308" size={12} fill="#EAB308" />
                      <Text className="text-[#EAB308] font-bold text-[12px]">4.9</Text>
                    </View>
                    <Text className="text-[9px]" style={{ color: theme.textSecondary }}>342 ratings</Text>
                  </View>
                </View>

                <Text className="text-[12px] mb-1" style={{ color: theme.textSecondary }}>Aarav Nair • Pune</Text>
                <View className="flex-row items-center gap-1 mb-4">
                  <MapPin color="#E91E76" size={12} />
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }}>Mahalakshmi Lawns, Pune</Text>
                </View>

                <View 
                  className="flex-row items-center justify-between p-3 rounded-xl border mb-4"
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                >
                  <View className="flex-row items-center gap-2">
                    <Users color="#E91E76" size={14} />
                    <Text className="text-[12px]" style={{ color: theme.text }}><Text className="font-bold">1420</Text> people visited</Text>
                  </View>
                  <TouchableOpacity 
                    className="px-3 py-1.5 rounded-full border"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                  >
                    <Text className="font-medium text-[11px]" style={{ color: theme.text }}>+ I Was There</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>Setlist played at show:</Text>
                  </View>
                  <Text className="text-[12px] leading-relaxed" style={{ color: theme.textSecondary }}>1. Kasoor (Acoustic Festival Edit) • 2. Baarishein (Full Crowd Sin...</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ gap: 8 }}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1540039155732-d6741b684cb3?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                </ScrollView>

                <View className="flex-row gap-3">
                  <TouchableOpacity 
                    className="flex-[2] py-3 rounded-xl border flex-row items-center justify-center gap-2"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Play color={theme.text} size={14} fill={theme.text} />
                    <Text className="font-bold text-[13px]" style={{ color: theme.text }}>Replay & Full Recap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-[#EAB308]/10 py-3 rounded-xl border border-[#EAB308]/20 flex-row items-center justify-center gap-1.5">
                    <Star color="#EAB308" size={12} fill="#EAB308" />
                    <Text className="text-[#EAB308] font-bold text-[12px]">Write Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="px-5">
              <View 
                className="w-full rounded-3xl p-4 border opacity-80"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="border border-[#EAB308]/50 bg-[#EAB308]/10 px-2 py-0.5 rounded-md">
                        <Text className="text-[#EAB308] text-[9px] font-bold uppercase">Strict 220 Seat Capacity (Sold Out in 4 Mins)</Text>
                      </View>
                      <Text className="text-[11px] w-12" style={{ color: theme.textSecondary }}>18 Nov 2025</Text>
                    </View>
                    <Text className="text-[18px] font-serif font-bold leading-tight w-[220px]" style={{ color: theme.text }}>Prithvi Theatre Candlelight Sessions</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center gap-1 bg-[#EAB308]/10 px-2 py-1 rounded border border-[#EAB308]/20 mb-1">
                      <Star color="#EAB308" size={12} fill="#EAB308" />
                      <Text className="text-[#EAB308] font-bold text-[12px]">5</Text>
                    </View>
                    <Text className="text-[9px]" style={{ color: theme.textSecondary }}>198 ratings</Text>
                  </View>
                </View>
                <Text className="text-[12px] mb-1" style={{ color: theme.textSecondary }}>Aarav Nair • Mumbai</Text>
                <View className="flex-row items-center gap-1 mb-4">
                  <MapPin color="#E91E76" size={12} />
                  <Text className="text-[11px]" style={{ color: theme.textSecondary }}>Prithvi Theatre, Juhu</Text>
                </View>
                <View 
                  className="flex-row items-center justify-between p-3 rounded-xl border"
                  style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                >
                  <View className="flex-row items-center gap-2">
                    <Users color="#E91E76" size={14} />
                    <Text className="text-[12px]" style={{ color: theme.text }}><Text className="font-bold">221</Text> people visited</Text>
                  </View>
                  <TouchableOpacity className="bg-[#EAB308]/20 px-3 py-1.5 rounded-full border border-[#EAB308]/30">
                    <Text className="text-[#EAB308] font-bold text-[11px]">✓ I Was There (Alumni)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Show Preview Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/70 justify-end">
          <View 
            className="h-[92%] rounded-t-3xl border-t overflow-hidden"
            style={{ backgroundColor: theme.bg, borderTopColor: theme.border }}
          >
            {/* Modal Header */}
            <View 
              className="flex-row items-center justify-between p-4 border-b"
              style={{ borderBottomColor: theme.border }}
            >
              <View className="flex-row items-center gap-2">
                <View className="bg-[#E91E76] px-2 py-0.5 rounded">
                  <Text className="text-white text-[9px] font-bold">SHOW PREVIEW</Text>
                </View>
                <Text className="font-bold text-[13px]" style={{ color: theme.text }}>Aarav Nair: Live at The Next ...</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowModal(false)} 
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.surfaceBg }}
              >
                <X color={theme.text} size={16} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 100 }}>
              <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-1">Intimate Candlelight Acoustic & Raw Vocals</Text>
              <Text className="text-[28px] font-serif font-bold leading-tight mb-3" style={{ color: theme.text }}>Aarav Nair: Live at The Next Stage</Text>
              <View className="flex-row items-center gap-4 mb-6">
                <View className="flex-row items-center gap-1.5">
                  <Calendar color="#E91E76" size={14} />
                  <Text className="text-[13px]" style={{ color: theme.textSecondary }}>Friday, 24 Oct 2026</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Clock color="#E91E76" size={14} />
                  <Text className="text-[13px]" style={{ color: theme.textSecondary }}>8:00 PM IST (Doors open 7:15 PM)</Text>
                </View>
              </View>

              {/* Live Stage Video Preview */}
              <View 
                className="mb-6 rounded-2xl overflow-hidden border aspect-video relative"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                {Platform.OS === 'web' ? (
                  <video
                    src={resolveMediaUrl("http://localhost:3000/uploads/performer_1.mp4")}
                    controls
                    autoPlay
                    muted
                    playsInline
                    poster="https://images.unsplash.com/photo-1516280440503-6c8c4a93883a?w=800&q=80"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1516280440503-6c8c4a93883a?w=800&q=80' }} className="w-full h-full opacity-80" />
                )}
              </View>

              {/* Who's Visiting Block */}
              <View 
                className="rounded-2xl p-4 border mb-5"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center gap-2">
                    <Users color={theme.primary} size={16} />
                    <Text className="font-bold text-[15px]" style={{ color: theme.text }}>Who's Visiting (439)</Text>
                  </View>
                  <Text className="text-[#34D399] text-[10px] font-medium">Verified Judges Attending</Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  <View 
                    className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-[12px]" style={{ color: theme.text }}>Dr. Ananya K.</Text>
                  </View>
                  <View 
                    className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=33' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-[12px]" style={{ color: theme.text }}>Rohan Dev</Text>
                  </View>
                  <View 
                    className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=47' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-[12px]" style={{ color: theme.text }}>Pooja Iyer</Text>
                  </View>
                  <View 
                    className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=49' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-[12px]" style={{ color: theme.text }}>Meera Sen</Text>
                  </View>
                  <View 
                    className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=59' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-[12px]" style={{ color: theme.text }}>Vikram Joshi</Text>
                  </View>
                  <View 
                    className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=68' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-[12px]" style={{ color: theme.text }}>Shreya Patel</Text>
                  </View>
                  <View className="flex-row items-center gap-1 bg-[#059669]/20 px-2.5 py-1.5 rounded-full border border-[#059669]/30">
                    <Check color="#34D399" size={12} />
                    <Text className="text-[#34D399] font-bold text-[12px]">You (Attending)</Text>
                  </View>
                </View>
                <TouchableOpacity className="w-full bg-[#059669]/10 py-3 rounded-full border border-[#059669]/30 flex-row items-center justify-center gap-2">
                  <Check color="#34D399" size={14} />
                  <Text className="text-[#34D399] font-medium text-[13px]">You Are Listed as Visiting (Tap to cancel)</Text>
                </TouchableOpacity>
              </View>

              {/* Venue */}
              <View 
                className="rounded-2xl p-4 border mb-5"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <Text className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: theme.textSecondary }}>Venue & Coordinates</Text>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-4">
                    <Text className="font-bold text-[15px] mb-1" style={{ color: theme.text }}>The Next Stage, Indiranagar</Text>
                    <Text className="text-[12px] mb-2 leading-relaxed" style={{ color: theme.textSecondary }}>142/B, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038</Text>
                    <Text className="text-[11px]" style={{ color: theme.textSecondary }}>Age Limit: 16+ (Minors accompanied by guardian)</Text>
                    <Text className="text-[11px]" style={{ color: theme.textSecondary }}>• Dress: Smart Casual / Indie Bohemian</Text>
                  </View>
                  <TouchableOpacity 
                    className="px-3 py-2 rounded-xl flex-row items-center gap-1.5 border"
                    style={{ backgroundColor: theme.surfaceBg, borderColor: theme.border }}
                  >
                    <Navigation color={theme.text} size={12} />
                    <Text className="text-[11px] font-bold" style={{ color: theme.text }}>Map Guide</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Photos */}
              <View 
                className="rounded-2xl p-4 border mb-5"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <Camera color={theme.primary} size={12} />
                    <Text className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.textSecondary }}>Stage & Venue Photos (4)</Text>
                  </View>
                  <Text className="text-[10px]" style={{ color: theme.textSecondary }}>Tap to expand</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1540039155732-d6741b684cb3?w=300' }} className="w-[48%] h-24 rounded-xl" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300' }} className="w-[48%] h-24 rounded-xl" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=300' }} className="w-[48%] h-24 rounded-xl" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300' }} className="w-[48%] h-24 rounded-xl" />
                </View>
              </View>

              {/* Timeline */}
              <View 
                className="rounded-2xl p-4 border mb-5"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <Text className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: theme.textSecondary }}>Show Itinerary Timeline</Text>
                <View className="gap-3">
                  <View className="flex-row gap-4">
                    <Text className="font-bold text-[11px] w-14" style={{ color: theme.primary }}>07:15 PM</Text>
                    <Text className="text-[12px] flex-1 leading-snug" style={{ color: theme.text }}>Doors open & Acoustic warm-up cocktail mixer</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="font-bold text-[11px] w-14" style={{ color: theme.primary }}>07:45 PM</Text>
                    <Text className="text-[12px] flex-1 leading-snug" style={{ color: theme.text }}>Unplugged opening take: Maya Sen (Violin intro)</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="font-bold text-[11px] w-14" style={{ color: theme.primary }}>08:15 PM</Text>
                    <Text className="text-[12px] flex-1 leading-snug" style={{ color: theme.text }}>Main Acoustic Stage Set: Aarav Nair (12-song journey)</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="font-bold text-[11px] w-14" style={{ color: theme.primary }}>09:30 PM</Text>
                    <Text className="text-[12px] flex-1 leading-snug" style={{ color: theme.text }}>Judge blind critique session & Fan Q&A</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="font-bold text-[11px] w-14" style={{ color: theme.primary }}>10:00 PM</Text>
                    <Text className="text-[12px] flex-1 leading-snug" style={{ color: theme.text }}>Curator wrap & Vinyl signing booth</Text>
                  </View>
                </View>
              </View>

              {/* Setlist */}
              <View 
                className="rounded-2xl p-4 border mb-5"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <Text className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: theme.textSecondary }}>Expected Acoustic Setlist</Text>
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Music color={theme.primary} size={12} />
                    <Text className="text-[12px]" style={{ color: theme.text }}>1. Kasoor (Acoustic Fingerstyle)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color={theme.primary} size={12} />
                    <Text className="text-[12px]" style={{ color: theme.text }}>2. Baarishein (Slow Vocal Swells)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color={theme.primary} size={12} />
                    <Text className="text-[12px]" style={{ color: theme.text }}>3. Amber Glow (Unreleased Single)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color={theme.primary} size={12} />
                    <Text className="text-[12px]" style={{ color: theme.text }}>4. Riha (Solo Fingerpicked Open-D)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color={theme.primary} size={12} />
                    <Text className="text-[12px]" style={{ color: theme.text }}>5. Kho Gaye Hum Kahan (Acoustic Duet)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color={theme.primary} size={12} />
                    <Text className="text-[12px]" style={{ color: theme.text }}>6. Midnight Rail (Encore Crowd Choir)</Text>
                  </View>
                </View>
              </View>

              {/* Experience Preview */}
              <View 
                className="rounded-2xl p-4 border mb-10"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <Text className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: theme.textSecondary }}>Seating & Experience Preview</Text>
                <Text className="text-[13px] leading-relaxed" style={{ color: theme.textSecondary }}>Tiered amphitheatre floor seating on plush linen floor cushions, plus reserved front-row Judge tables with dedicated in-ear monitor tap feeds.</Text>
              </View>
            </ScrollView>

            <View 
              className="p-5 pb-8 border-t"
              style={{ backgroundColor: theme.cardBg, borderTopColor: theme.border }}
            >
              <TouchableOpacity 
                style={{ backgroundColor: theme.primary }}
                className="w-full py-4 rounded-full items-center shadow-lg"
              >
                <Text className="text-white font-bold text-[16px]">RESERVE PASSES (₹799)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
