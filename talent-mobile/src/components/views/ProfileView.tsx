import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Settings, Share, MoreHorizontal, CheckCircle, MapPin, Play, X, Shield, Bell, Key, User, LogOut, ChevronRight, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Switch } from 'react-native';

export function ProfileView({ user, onLogout }: { user?: any, onLogout?: () => void }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingView, setActiveSettingView] = useState<string | null>(null);

  // Privacy Settings State
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [isBlindModeEnabled, setIsBlindModeEnabled] = useState(true);

  // Profile Data State
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    async function fetchProfile() {
      try {
        const response = await fetch(`http://localhost:3000/api/profile/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();
  }, [user?.id]);

  return (
    <View className="flex-1 bg-[#050608]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cover & Avatar */}
        <View className="w-full h-[320px] bg-[#1A1512] relative">
          <Image source={{ uri: 'https://picsum.photos/seed/cover/400/320' }} className="w-full h-full opacity-60" />
          
          <View className="absolute top-12 right-5 flex-row gap-4">
            <TouchableOpacity activeOpacity={0.7}><Share color="#fff" size={24} /></TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setIsSettingsOpen(true)}>
              <Settings color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View className="absolute -bottom-10 left-5">
            <View className="w-[84px] h-[84px] rounded-full border-[3px] border-[#050608] relative">
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} className="w-full h-full rounded-full" />
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-[#10b981] rounded-full border-2 border-[#050608]" />
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View className="px-5 pt-14 mb-6">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-white text-[28px] font-bold">{user?.name || 'Aarav Nair'}</Text>
            <CheckCircle color="#E91E76" fill="#E91E76" size={20} />
          </View>
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-[#9CA3AF] text-[14px]">Singer • Songwriter</Text>
            <Text className="text-[#9CA3AF] text-[14px]">•</Text>
            <MapPin color="#E91E76" size={14} />
            <Text className="text-[#9CA3AF] text-[14px]">Bengaluru, India</Text>
          </View>
          <Text className="text-[#9CA3AF] italic text-[14px]">"Building a life on stage, one performance at a time."</Text>
        </View>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-6" contentContainerStyle={{ paddingRight: 40, gap: 10 }}>
          {[
            { icon: '★', label: 'Blind Score', value: '4.8', color: '#E91E76' },
            { icon: '|||', label: 'Performances', value: profileData ? String(profileData.videosCount) : '0', color: '#9CA3AF' },
            { icon: '📅', label: 'Shows', value: '0', color: '#E91E76' },
            { icon: '👥', label: 'Followers', value: profileData ? String(profileData.followers) : '0', color: '#9CA3AF' },
          ].map((stat, i) => (
            <View key={i} className="bg-[#171922] border border-white/5 rounded-2xl p-4 w-[110px]">
              <Text style={{ color: stat.color, marginBottom: 4 }}>{stat.icon}</Text>
              <Text className="text-white text-[20px] font-bold mb-1">{stat.value}</Text>
              <Text className="text-[#7C8495] text-[11px]">{stat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-5 flex-row gap-3 mb-8">
          <TouchableOpacity activeOpacity={0.7} className="flex-1 bg-white/10 h-[44px] rounded-[8px] items-center justify-center border border-white/20">
            <Text className="text-white font-bold text-[13px]">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} className="flex-1 bg-white/10 h-[44px] rounded-[8px] items-center justify-center border border-white/20">
            <Text className="text-white font-bold text-[13px]">Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs for Grid */}
        <View className="flex-row border-b border-white/10 mb-4 px-5">
          <View className="flex-1 items-center pb-3 border-b-2 border-white">
            <Text className="text-white font-bold">Takes ({profileData ? profileData.videosCount : 0})</Text>
          </View>
          <View className="flex-1 items-center pb-3 opacity-50">
            <Text className="text-white font-bold">Drafts (0)</Text>
          </View>
        </View>

        {/* Video Grid */}
        <View className="flex-row flex-wrap px-1">
          {isLoading ? (
            <Text className="text-white text-center w-full mt-10">Loading...</Text>
          ) : profileData?.videos && profileData.videos.length > 0 ? (
            profileData.videos.map((video: any, index: number) => (
              <View key={video.id} className="w-[33.33%] aspect-[3/4] p-0.5">
                <View className="w-full h-full bg-[#1A1512] rounded-md overflow-hidden relative">
                  {/* Just a placeholder thumbnail for now since we don't have video thumbnails */}
                  <Image source={{ uri: `https://picsum.photos/seed/${video.id}/200/300` }} className="w-full h-full opacity-70" />
                  <View className="absolute bottom-2 left-2 flex-row items-center gap-1">
                    <Play color="#fff" size={10} fill="#fff" />
                    <Text className="text-white text-[10px] font-bold">0</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-[#9CA3AF] text-center w-full mt-10">No videos uploaded yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsSettingsOpen(false)}>
        <View className="flex-1 bg-[#050608]">
          {activeSettingView === null ? (
            <>
              <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-white/10">
                <Text className="text-white text-[18px] font-bold">Settings & Privacy</Text>
                <TouchableOpacity onPress={() => setIsSettingsOpen(false)}>
                  <X color="#fff" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1">
                <View className="px-5 py-6">
                  <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">ACCOUNT</Text>
                  
                  <SettingsRow icon={<User color="#fff" size={20} />} title="Account Details" />
                  <SettingsRow 
                    icon={<Key color="#fff" size={20} />} 
                    title="Privacy & Blind Mode" 
                    subtitle="Manage what is shown before judging" 
                    onPress={() => setActiveSettingView('privacy')}
                  />
                  <SettingsRow icon={<Shield color="#fff" size={20} />} title="Security" />
                  <SettingsRow icon={<Bell color="#fff" size={20} />} title="Notifications" />

                  <SettingsRow 
                    icon={<User color="#fff" size={20} />} 
                    title="Appearance" 
                    subtitle="Customize app theme and colors" 
                    onPress={() => setActiveSettingView('appearance')}
                  />

                  <View className="h-[1px] w-full bg-white/10 my-6" />

                  <Text className="text-[#9CA3AF] text-[13px] font-bold tracking-wider mb-4">CONTENT & ACTIVITY</Text>
                  
                  <SettingsRow icon={<Play color="#fff" size={20} />} title="Watch History" />
                  <SettingsRow icon={<CheckCircle color="#fff" size={20} />} title="Verification" subtitle="Apply for verified badge" />
                  
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
                  <TouchableOpacity onPress={() => setActiveSettingView(null)}>
                    <ChevronLeft color="#fff" size={28} />
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
                        alert("Light mode is coming soon! Our designers are currently creating the light palette.");
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
                  <TouchableOpacity onPress={() => setActiveSettingView(null)}>
                    <ChevronLeft color="#fff" size={28} />
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
    </View>
  );
}

function SettingsRow({ icon, title, subtitle, onPress }: { icon: React.ReactNode, title: string, subtitle?: string, onPress?: () => void }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      className="flex-row items-center justify-between mb-6"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
      }}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-[36px] h-[36px] rounded-full bg-white/10 items-center justify-center">
          {icon}
        </View>
        <View>
          <Text className="text-white text-[16px] font-medium">{title}</Text>
          {subtitle && <Text className="text-[#9CA3AF] text-[12px] mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight color="#9CA3AF" size={20} />
    </TouchableOpacity>
  );
}
