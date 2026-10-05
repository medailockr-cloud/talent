import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, SafeAreaView } from 'react-native';
import { Ticket, MapPin, Calendar, Star, Users, Music, Play, Navigation, X, Clock, Map, ChevronRight, Check, Camera } from 'lucide-react-native';

export function ShowsView() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [showModal, setShowModal] = useState(false);

  const cities = ['All Cities', 'Bengaluru', 'Mumbai', 'Kochi', 'Delhi NCR'];

  return (
    <View className="flex-1 bg-[#050608]">
      <ScrollView className="flex-1 pt-14" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="px-5 mb-5 flex-row items-start justify-between">
          <View>
            <View className="flex-row items-center gap-3 mb-1">
              <View className="w-8 h-8 rounded-lg bg-[#E91E76]/10 items-center justify-center border border-[#E91E76]/20">
                <Ticket color="#E91E76" size={16} />
              </View>
              <Text className="text-white text-[28px] font-serif font-bold tracking-tight">Shows</Text>
            </View>
            <Text className="text-[#9CA3AF] text-[13px]">Live concerts • Venue previews • Past gig archives & ratings</Text>
          </View>
          <TouchableOpacity className="flex-row items-center gap-1.5 bg-[#171922] px-3 py-2 rounded-full border border-white/10">
            <Star color="#E91E76" size={12} fill="#E91E76" />
            <View>
              <Text className="text-white text-[10px] font-bold">Audition</Text>
              <Text className="text-white text-[10px] font-bold">Take</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="px-5 mb-4 flex-row gap-2">
          <TouchableOpacity 
            onPress={() => setActiveTab('upcoming')}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${activeTab === 'upcoming' ? 'bg-[#E91E76]' : 'bg-[#171922] border border-white/5'}`}
          >
            <Calendar color={activeTab === 'upcoming' ? '#fff' : '#9CA3AF'} size={14} />
            <Text className={`font-bold text-[13px] ${activeTab === 'upcoming' ? 'text-white' : 'text-[#9CA3AF]'}`}>Upcoming Shows (4)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('archive')}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${activeTab === 'archive' ? 'bg-[#E91E76]' : 'bg-[#171922] border border-white/5'}`}
          >
            <Ticket color={activeTab === 'archive' ? '#fff' : '#9CA3AF'} size={14} />
            <Text className={`font-bold text-[13px] ${activeTab === 'archive' ? 'text-white' : 'text-[#9CA3AF]'}`}>Previous Archive (3)</Text>
          </TouchableOpacity>
        </View>

        {/* City Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 px-5" contentContainerStyle={{ paddingRight: 40, gap: 8 }}>
          {cities.map(city => (
            <TouchableOpacity 
              key={city}
              onPress={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full border ${selectedCity === city ? 'border-[#E91E76] bg-[#E91E76]/10' : 'border-white/10 bg-[#171922]'}`}
            >
              <Text className={`font-medium text-[12px] ${selectedCity === city ? 'text-white' : 'text-[#9CA3AF]'}`}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'upcoming' ? (
          <>
            <View className="px-5 mb-3 flex-row justify-between items-center">
              <Text className="text-[#9CA3AF] text-[12px] font-medium">Confirmed live stage dates & RSVP list</Text>
              <Text className="text-[#E91E76] text-[12px] font-bold">Priority Judge Passes</Text>
            </View>

            {/* Featured Upcoming */}
            <View className="px-5 mb-8">
              <View className="w-full bg-[#100C09] rounded-3xl overflow-hidden border border-white/10 relative">
                <Image source={{ uri: 'https://images.unsplash.com/photo-1516280440503-6c8c4a93883a?w=800&q=80' }} className="w-full h-[220px] absolute top-0 opacity-40" />
                <View className="w-full h-[220px] absolute top-0 bg-gradient-to-t from-[#100C09] to-transparent" />
                
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

            <Text className="text-white font-serif text-[18px] font-bold px-5 mb-4">All Scheduled Live Shows</Text>
            
            <View className="px-5">
              <View className="w-full bg-[#11131A] p-3 rounded-2xl border border-white/5 flex-row items-center gap-3">
                <View className="w-14 h-16 bg-[#1A1C23] rounded-xl border border-white/5 items-center justify-center">
                  <Text className="text-white text-[20px] font-bold">24</Text>
                  <Text className="text-[#E91E76] text-[10px] font-bold">OCT</Text>
                </View>
                <View className="flex-1 justify-center">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="bg-[#E91E76]/10 px-1.5 py-0.5 rounded border border-[#E91E76]/20">
                      <Text className="text-[#E91E76] text-[8px] font-bold">SELLING FAST</Text>
                    </View>
                    <Text className="text-[#9CA3AF] text-[10px]">8:00 PM IST (Doors open 7:1...</Text>
                  </View>
                  <Text className="text-white font-bold text-[14px] mb-0.5" numberOfLines={1}>Aarav Nair: Live at The Next Stage</Text>
                  <Text className="text-[#9CA3AF] text-[11px]" numberOfLines={1}>Aarav Nair • Acoustic Indie</Text>
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
              <Text className="text-[#9CA3AF] text-[12px] font-medium max-w-[200px]">Historical gig logs, verified ratings & attendee reviews</Text>
              <Text className="text-[#EAB308] text-[12px] font-bold max-w-[80px] text-right">100% Sold Out Archive</Text>
            </View>

            <View className="px-5 mb-6">
              <View className="w-full bg-[#11131A] rounded-3xl p-4 border border-white/5">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="border border-[#EAB308]/50 bg-[#EAB308]/10 px-2 py-0.5 rounded-md">
                        <Text className="text-[#EAB308] text-[9px] font-bold">SOLD OUT • 1,420 CAPACITY</Text>
                      </View>
                      <Text className="text-[#9CA3AF] text-[11px]">14 Dec 2025</Text>
                    </View>
                    <Text className="text-white text-[18px] font-serif font-bold leading-tight w-[220px]">Bacardi NH7 Weekender (The Acoustic Forest)</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center gap-1 bg-[#EAB308]/10 px-2 py-1 rounded border border-[#EAB308]/20 mb-1">
                      <Star color="#EAB308" size={12} fill="#EAB308" />
                      <Text className="text-[#EAB308] font-bold text-[12px]">4.9</Text>
                    </View>
                    <Text className="text-[#9CA3AF] text-[9px]">342 ratings</Text>
                  </View>
                </View>

                <Text className="text-white/60 text-[12px] mb-1">Aarav Nair • Pune</Text>
                <View className="flex-row items-center gap-1 mb-4">
                  <MapPin color="#E91E76" size={12} />
                  <Text className="text-[#9CA3AF] text-[11px]">Mahalakshmi Lawns, Pune</Text>
                </View>

                <View className="flex-row items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 mb-4">
                  <View className="flex-row items-center gap-2">
                    <Users color="#E91E76" size={14} />
                    <Text className="text-white text-[12px]"><Text className="font-bold">1420</Text> people visited</Text>
                  </View>
                  <TouchableOpacity className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <Text className="text-white font-medium text-[11px]">+ I Was There</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase">Setlist played at show:</Text>
                  </View>
                  <Text className="text-white/80 text-[12px] leading-relaxed">1. Kasoor (Acoustic Festival Edit) • 2. Baarishein (Full Crowd Sin...</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ gap: 8 }}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1540039155732-d6741b684cb3?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200' }} className="w-24 h-16 rounded-xl opacity-80" />
                </ScrollView>

                <View className="flex-row gap-3">
                  <TouchableOpacity className="flex-[2] bg-white/10 py-3 rounded-xl border border-white/5 flex-row items-center justify-center gap-2">
                    <Play color="#fff" size={14} fill="#fff" />
                    <Text className="text-white font-bold text-[13px]">Replay & Full Recap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-[#EAB308]/10 py-3 rounded-xl border border-[#EAB308]/20 flex-row items-center justify-center gap-1.5">
                    <Star color="#EAB308" size={12} fill="#EAB308" />
                    <Text className="text-[#EAB308] font-bold text-[12px]">Write Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="px-5">
              <View className="w-full bg-[#11131A] rounded-3xl p-4 border border-white/5 opacity-80">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="border border-[#EAB308]/50 bg-[#EAB308]/10 px-2 py-0.5 rounded-md">
                        <Text className="text-[#EAB308] text-[9px] font-bold uppercase">Strict 220 Seat Capacity (Sold Out in 4 Mins)</Text>
                      </View>
                      <Text className="text-[#9CA3AF] text-[11px] w-12">18 Nov 2025</Text>
                    </View>
                    <Text className="text-white text-[18px] font-serif font-bold leading-tight w-[220px]">Prithvi Theatre Candlelight Sessions</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center gap-1 bg-[#EAB308]/10 px-2 py-1 rounded border border-[#EAB308]/20 mb-1">
                      <Star color="#EAB308" size={12} fill="#EAB308" />
                      <Text className="text-[#EAB308] font-bold text-[12px]">5</Text>
                    </View>
                    <Text className="text-[#9CA3AF] text-[9px]">198 ratings</Text>
                  </View>
                </View>
                <Text className="text-white/60 text-[12px] mb-1">Aarav Nair • Mumbai</Text>
                <View className="flex-row items-center gap-1 mb-4">
                  <MapPin color="#E91E76" size={12} />
                  <Text className="text-[#9CA3AF] text-[11px]">Prithvi Theatre, Juhu</Text>
                </View>
                <View className="flex-row items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                  <View className="flex-row items-center gap-2">
                    <Users color="#E91E76" size={14} />
                    <Text className="text-white text-[12px]"><Text className="font-bold">221</Text> people visited</Text>
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
        <View className="flex-1 bg-black/90 justify-end">
          <View className="bg-[#0D0F15] h-[92%] rounded-t-3xl border-t border-white/10 overflow-hidden">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-white/5">
              <View className="flex-row items-center gap-2">
                <View className="bg-[#E91E76] px-2 py-0.5 rounded">
                  <Text className="text-white text-[9px] font-bold">SHOW PREVIEW</Text>
                </View>
                <Text className="text-white font-bold text-[13px]">Aarav Nair: Live at The Next ...</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} className="w-8 h-8 bg-white/10 rounded-full items-center justify-center">
                <X color="#fff" size={16} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 100 }}>
              <Text className="text-[#E91E76] text-[10px] font-bold tracking-widest uppercase mb-1">Intimate Candlelight Acoustic & Raw Vocals</Text>
              <Text className="text-white text-[28px] font-serif font-bold leading-tight mb-3">Aarav Nair: Live at The Next Stage</Text>
              <View className="flex-row items-center gap-4 mb-6">
                <View className="flex-row items-center gap-1.5">
                  <Calendar color="#E91E76" size={14} />
                  <Text className="text-[#9CA3AF] text-[13px]">Friday, 24 Oct 2026</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Clock color="#E91E76" size={14} />
                  <Text className="text-[#9CA3AF] text-[13px]">8:00 PM IST (Doors open 7:15 PM)</Text>
                </View>
              </View>

              {/* Who's Visiting Block */}
              <View className="bg-[#13151D] rounded-2xl p-4 border border-white/5 mb-5">
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center gap-2">
                    <Users color="#E91E76" size={16} />
                    <Text className="text-white font-bold text-[15px]">Who's Visiting (439)</Text>
                  </View>
                  <Text className="text-[#34D399] text-[10px] font-medium">Verified Judges Attending</Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  <View className="flex-row items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5">
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-white text-[12px]">Dr. Ananya K.</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5">
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=33' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-white text-[12px]">Rohan Dev</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5">
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=47' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-white text-[12px]">Meera Sen</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5">
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=59' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-white text-[12px]">Vikram Joshi</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5">
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=68' }} className="w-5 h-5 rounded-full" />
                    <Text className="text-white text-[12px]">Shreya Patel</Text>
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
              <View className="bg-[#13151D] rounded-2xl p-4 border border-white/5 mb-5">
                <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-3">Venue & Coordinates</Text>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-4">
                    <Text className="text-white font-bold text-[15px] mb-1">The Next Stage, Indiranagar</Text>
                    <Text className="text-[#9CA3AF] text-[12px] mb-2 leading-relaxed">142/B, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038</Text>
                    <Text className="text-[#9CA3AF] text-[11px]">Age Limit: 16+ (Minors accompanied by guardian)</Text>
                    <Text className="text-[#9CA3AF] text-[11px]">• Dress: Smart Casual / Indie Bohemian</Text>
                  </View>
                  <TouchableOpacity className="bg-white/10 px-3 py-2 rounded-xl flex-row items-center gap-1.5 border border-white/5">
                    <Navigation color="#fff" size={12} />
                    <Text className="text-white text-[11px] font-bold">Map Guide</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Photos */}
              <View className="bg-[#13151D] rounded-2xl p-4 border border-white/5 mb-5">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-1.5">
                    <Camera color="#E91E76" size={12} />
                    <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase">Stage & Venue Photos (4)</Text>
                  </View>
                  <Text className="text-white/40 text-[10px]">Tap to expand</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1540039155732-d6741b684cb3?w=300' }} className="w-[48%] h-24 rounded-xl" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300' }} className="w-[48%] h-24 rounded-xl" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=300' }} className="w-[48%] h-24 rounded-xl" />
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300' }} className="w-[48%] h-24 rounded-xl" />
                </View>
              </View>

              {/* Timeline */}
              <View className="bg-[#13151D] rounded-2xl p-4 border border-white/5 mb-5">
                <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-4">Show Itinerary Timeline</Text>
                <View className="gap-3">
                  <View className="flex-row gap-4">
                    <Text className="text-[#E91E76] font-bold text-[11px] w-14">07:15 PM</Text>
                    <Text className="text-white/80 text-[12px] flex-1 leading-snug">Doors open & Acoustic warm-up cocktail mixer</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="text-[#E91E76] font-bold text-[11px] w-14">07:45 PM</Text>
                    <Text className="text-white/80 text-[12px] flex-1 leading-snug">Unplugged opening take: Maya Sen (Violin intro)</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="text-[#E91E76] font-bold text-[11px] w-14">08:15 PM</Text>
                    <Text className="text-white/80 text-[12px] flex-1 leading-snug">Main Acoustic Stage Set: Aarav Nair (12-song journey)</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="text-[#E91E76] font-bold text-[11px] w-14">09:30 PM</Text>
                    <Text className="text-white/80 text-[12px] flex-1 leading-snug">Judge blind critique session & Fan Q&A</Text>
                  </View>
                  <View className="flex-row gap-4">
                    <Text className="text-[#E91E76] font-bold text-[11px] w-14">10:00 PM</Text>
                    <Text className="text-white/80 text-[12px] flex-1 leading-snug">Curator wrap & Vinyl signing booth</Text>
                  </View>
                </View>
              </View>

              {/* Setlist */}
              <View className="bg-[#13151D] rounded-2xl p-4 border border-white/5 mb-5">
                <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-3">Expected Acoustic Setlist</Text>
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-white/90 text-[12px]">1. Kasoor (Acoustic Fingerstyle)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-white/90 text-[12px]">2. Baarishein (Slow Vocal Swells)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-white/90 text-[12px]">3. Amber Glow (Unreleased Single)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-white/90 text-[12px]">4. Riha (Solo Fingerpicked Open-D)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-white/90 text-[12px]">5. Kho Gaye Hum Kahan (Acoustic Duet)</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Music color="#E91E76" size={12} />
                    <Text className="text-white/90 text-[12px]">6. Midnight Rail (Encore Crowd Choir)</Text>
                  </View>
                </View>
              </View>

              {/* Experience Preview */}
              <View className="bg-[#13151D] rounded-2xl p-4 border border-white/5 mb-10">
                <Text className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mb-2">Seating & Experience Preview</Text>
                <Text className="text-white/80 text-[13px] leading-relaxed">Tiered amphitheatre floor seating on plush linen floor cushions, plus reserved front-row Judge tables with dedicated in-ear monitor tap feeds.</Text>
              </View>
            </ScrollView>

            <View className="p-5 pb-8 bg-[#0D0F15] border-t border-white/5">
              <TouchableOpacity className="w-full bg-[#E91E76] py-4 rounded-full items-center">
                <Text className="text-white font-bold text-[16px]">RESERVE PASSES (₹799)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
