import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { HomeLogoIcon, FlipsLogoIcon, CreateLogoIcon, ShowsLogoIcon, YouLogoIcon } from '@/components/icons/NavigationLogos';

import { HomeView } from '@/components/views/HomeView';
import { FlipsView } from '@/components/views/FlipsView';
import { CreateView } from '@/components/views/CreateView';
import { ShowsView } from '@/components/views/ShowsView';
import { ProfileView } from '@/components/views/ProfileView';
import { AuthView } from '@/components/views/AuthView';

export default function App() {
  const [activeBottomTab, setActiveBottomTab] = useState('HOME');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function loadAuthSession() {
      try {
        const storedToken = await AsyncStorage.getItem('talent_auth_token');
        const storedUser = await AsyncStorage.getItem('talent_current_user');
        
        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth session:', e);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    loadAuthSession();
  }, []);

  const handleAuthSuccess = async (token: string, user: any) => {
    setAuthToken(token);
    setCurrentUser(user);
    setActiveBottomTab('HOME');
    try {
      await AsyncStorage.setItem('talent_auth_token', token);
      await AsyncStorage.setItem('talent_current_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth session:', e);
    }
  };

  const handleLogout = async () => {
    setAuthToken(null);
    setCurrentUser(null);
    try {
      await AsyncStorage.removeItem('talent_auth_token');
      await AsyncStorage.removeItem('talent_current_user');
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
  };

  const renderActiveView = () => {
    switch (activeBottomTab) {
      case 'HOME': return <HomeView user={currentUser} />;
      case 'FLIPS': return <FlipsView />;
      case 'CREATE': return <CreateView user={currentUser} onPublishSuccess={() => setActiveBottomTab('HOME')} onClose={() => setActiveBottomTab('HOME')} />;
      case 'SHOWS': return <ShowsView />;
      case 'YOU': return <ProfileView user={currentUser} onLogout={handleLogout} />;
      default: return <HomeView user={currentUser} />;
    }
  };

  if (isCheckingAuth) {
    return (
      <View className="flex-1 bg-[#050608] items-center justify-center">
        <ActivityIndicator color="#E91E76" size="large" />
      </View>
    );
  }

  if (!authToken) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <View className="flex-1 bg-[#050608]">
      
      {/* Active View Container */}
      <View className="flex-1">
        {renderActiveView()}
      </View>

      {/* Fixed Bottom Navigation Bar */}
      {activeBottomTab !== 'CREATE' && (
        <View className="absolute bottom-0 w-full bg-[#0B0D13]/95 border-t border-white/10 pt-3 pb-6 px-6 z-30">
          <View className="flex-row justify-between items-center w-full">
            {[
              { id: 'HOME', icon: HomeLogoIcon, label: 'Home', isCustom: true },
              { id: 'FLIPS', icon: FlipsLogoIcon, label: 'Flips', isCustom: true },
              { id: 'CREATE', icon: CreateLogoIcon, label: 'Create', isCustom: true },
              { id: 'SHOWS', icon: ShowsLogoIcon, label: 'Shows', isCustom: true },
              { id: 'YOU', icon: YouLogoIcon, label: 'You', isCustom: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeBottomTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveBottomTab(tab.id);
                  }}
                  className="items-center justify-center gap-1.5"
                >
                  {tab.isCustom ? (
                    <Icon
                      size={24}
                      color={isActive ? '#E91E76' : '#9CA3AF'}
                      isActive={isActive}
                    />
                  ) : (
                    <Icon
                      size={24}
                      color={isActive ? '#E91E76' : '#9CA3AF'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  )}
                  <Text
                    className={`text-[10px] font-medium tracking-wide ${
                      isActive ? 'text-white' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
