import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { X, Music, Flashlight, Repeat, Settings2, Sparkles, Clock, Image as ImageIcon, Image as CoverIcon, Check, ChevronLeft, MapPin, ToggleRight, ToggleLeft, Camera, Upload, Folder, Cloud, MoreHorizontal, MessageSquare, Eye, Globe, Zap, UploadCloud, CheckCircle2, FileVideo, Music2, Edit3, ImagePlus, ChevronRight, Scissors, Volume2, Type, BarChart2, Users, Briefcase, Settings, Play, Pause, MonitorPlay, Star, Aperture, Subtitles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';

// --- Types ---
type CreateStep = 
  | 'HOME'
  | 'RECORD'
  | 'UPLOAD'
  | 'CHOOSE_TALENT'
  | 'PREVIEW'
  | 'SET_PURPOSE'
  | 'DETAILS'
  | 'SUMMARY'
  | 'UPLOADING'
  | 'SUCCESS';

export function CreateView({ onClose }: { onClose?: () => void }) {
  // --- Permissions ---
  const [facing, setFacing] = useState<'front' | 'back'>(Platform.OS === 'web' ? 'front' : 'back');
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // --- State ---
  const [step, setStep] = useState<CreateStep>('HOME');
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Form Data
  const [category, setCategory] = useState('Dance');
  const [subCategory, setSubCategory] = useState('Contemporary');
  const [purpose, setPurpose] = useState('Get Discovered');
  const [title, setTitle] = useState('Midnight Movement');
  const [location, setLocation] = useState('Bengaluru, India');
  const [allowJudging, setAllowJudging] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [visibility, setVisibility] = useState('Public');

  // Upload progress simulation
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Editor State
  const [editMode, setEditMode] = useState<'none' | 'trim' | 'cover' | 'sound' | 'filters' | 'caption'>('filters');
  const [activeFilter, setActiveFilter] = useState('Original');
  const [isPlaying, setIsPlaying] = useState(true);

  const previewPlayer = useVideoPlayer(recordedVideoUri, player => {
    player.loop = true;
    player.muted = true; // Auto-play requires muted on web
    player.play();
  });

  // --- Actions ---
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  async function toggleRecord() {
    if (!cameraRef.current) return;
    
    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } else {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
        if (video && video.uri) {
          setRecordedVideoUri(video.uri);
          setStep('PREVIEW');
        }
      } catch (error) {
        console.error("Failed to record video:", error);
        setIsRecording(false);
      }
    }
  }

  const handlePublish = async () => {
    setStep('UPLOADING');
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Execute real upload here
        submitToServer().then(() => {
          setStep('SUCCESS');
        }).catch(err => {
          console.error(err);
          setStep('SUMMARY'); // revert on error
        });
      }
    }, 300);
  };

  const submitToServer = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('authorId', '1'); // Mock user ID
      formData.append('description', '');
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('purpose', purpose);
      formData.append('location', location);
      formData.append('allowJudging', String(allowJudging));
      
      if (recordedVideoUri) {
        // Only append on native or if we have a real file
        if (Platform.OS !== 'web') {
          formData.append('video', {
            uri: recordedVideoUri,
            name: 'video.mp4',
            type: 'video/mp4'
          } as any);
        }
      }
      
      // In a real scenario, use actual API URL
      console.log('Sending to server...', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setRecordedVideoUri(result.assets[0].uri);
        setStep('PREVIEW');
      }
    } catch (error) {
      console.error("Failed to pick video:", error);
    }
  };

  // --- Render Helpers ---
  const TopNav = ({ title, onBack, rightEl }: { title?: string, onBack: () => void, rightEl?: React.ReactNode }) => (
    <View className="flex-row items-center justify-between px-5 mb-8">
      <TouchableOpacity onPress={onBack} className="p-1 -ml-1">
        <ChevronLeft color="#fff" size={28} />
      </TouchableOpacity>
      {title && <Text className="text-white font-semibold text-lg">{title}</Text>}
      <View className="min-w-[28px] items-end">
        {rightEl}
      </View>
    </View>
  );

  // --- Screens ---

  const renderHome = () => (
    <View className="flex-1 bg-[#050608] px-6 pt-16">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white font-serif text-2xl font-bold italic tracking-wider">talent.</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text className="text-white text-4xl font-serif mt-4 mb-2">Create</Text>
      <Text className="text-[#9CA3AF] text-lg mb-12">Show what you can do.</Text>
      
      <TouchableOpacity 
        className="bg-[#E91E76] w-full rounded-2xl p-5 mb-4 flex-row items-center"
        onPress={() => {
          if (!camPermission?.granted) requestCamPermission();
          if (!micPermission?.granted) requestMicPermission();
          setStep('RECORD');
        }}
      >
        <View className="bg-white/20 p-3 rounded-full mr-4">
          <Camera color="#fff" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-1">Record Performance</Text>
          <Text className="text-white/80 text-sm">Start with your camera</Text>
        </View>
        <ChevronRight color="#fff" size={20} opacity={0.7} />
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-[#1A1D24] border border-white/10 w-full rounded-2xl p-5 mb-4 flex-row items-center"
        onPress={() => setStep('UPLOAD')}
      >
        <View className="bg-white/10 p-3 rounded-full mr-4">
          <Upload color="#fff" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-1">Upload Performance</Text>
          <Text className="text-[#9CA3AF] text-sm">Choose from your device</Text>
        </View>
        <ChevronRight color="#fff" size={20} opacity={0.5} />
      </TouchableOpacity>

      <TouchableOpacity className="bg-[#1A1D24] border border-white/10 rounded-2xl p-4 flex-row items-center self-start px-6 mt-2">
        <Folder color="#9CA3AF" size={20} className="mr-3" />
        <Text className="text-white font-medium">Drafts • 2</Text>
        <ChevronRight color="#9CA3AF" size={16} className="ml-2" />
      </TouchableOpacity>
      
      <View className="absolute bottom-10 -left-10 opacity-20 transform -rotate-12">
        <Text className="text-white text-3xl font-serif italic">Your talent.</Text>
        <Text className="text-[#E91E76] text-3xl font-serif italic mt-1">Your stage.</Text>
      </View>
    </View>
  );

  const renderRecord = () => {
    if (!camPermission || !camPermission.granted) {
      return (
        <View className="flex-1 bg-black items-center justify-center">
          <Text className="text-white">Camera permission is required.</Text>
          <TouchableOpacity onPress={requestCamPermission} className="mt-4 bg-[#E91E76] px-4 py-2 rounded">
            <Text className="text-white">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View className="flex-1 bg-black">
        <CameraView ref={cameraRef} className="flex-1 w-full h-full" facing={facing} mode="video">
          <View className="pt-14 px-5 flex-row justify-between items-start z-10">
            <TouchableOpacity onPress={() => setStep('HOME')}>
              <X color="#fff" size={28} />
            </TouchableOpacity>
            
            <View className="flex-row gap-4 items-center">
              <TouchableOpacity>
                <Flashlight color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2">
                <Music color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="absolute right-4 top-40 items-center gap-6 z-10">
            <TouchableOpacity onPress={toggleCameraFacing} className="items-center">
              <Repeat color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Zap color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">Speed</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Clock color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Settings2 color="#fff" size={22} />
              <Text className="text-white text-[10px] mt-1 font-medium">Filters</Text>
            </TouchableOpacity>
          </View>
          
          <View className="absolute bottom-0 inset-x-0 pb-12 pt-20 bg-gradient-to-t from-black via-black/50 to-transparent">
            <View className="flex-row justify-center gap-8 mb-6">
              <Text className="text-[#E91E76] font-bold text-[14px]">Video</Text>
              <Text className="text-white/60 font-semibold text-[14px]">Photo</Text>
            </View>
            
            <View className="flex-row items-center justify-center">
              <TouchableOpacity onPress={toggleRecord} className="items-center justify-center">
                <View className={`rounded-full border-[4px] items-center justify-center transition-all ${isRecording ? 'border-[#E91E76] w-[88px] h-[88px]' : 'border-white/50 w-[80px] h-[80px]'}`}>
                  <View className={`rounded-full bg-[#E91E76] ${isRecording ? 'w-[36px] h-[36px] rounded-md' : 'w-[64px] h-[64px]'}`} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  };

  const renderUpload = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav title="Upload Performance" onBack={() => setStep('HOME')} />
      
      <View className="px-5 mt-4">
        <TouchableOpacity className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-[#E91E76]/50 bg-[#E91E76]/5 items-center justify-center mb-8">
          <UploadCloud color="#E91E76" size={40} className="mb-4" />
          <Text className="text-white font-bold text-lg mb-1">Choose a video</Text>
          <Text className="text-[#9CA3AF] text-sm">Select from your device</Text>
          <Text className="text-[#9CA3AF] text-xs mt-1">(Max 3 minutes)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={pickVideo} className="flex-row justify-between items-center bg-[#1A1D24] p-5 rounded-2xl mb-3">
          <View className="flex-row items-center gap-4">
            <ImageIcon color="#9CA3AF" size={24} />
            <Text className="text-white font-medium text-[16px]">From Gallery</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={pickVideo} className="flex-row justify-between items-center bg-[#1A1D24] p-5 rounded-2xl mb-3">
          <View className="flex-row items-center gap-4">
            <FileVideo color="#9CA3AF" size={24} />
            <Text className="text-white font-medium text-[16px]">From Files</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row justify-between items-center bg-[#1A1D24] p-5 rounded-2xl mb-3">
          <View className="flex-row items-center gap-4">
            <Cloud color="#9CA3AF" size={24} />
            <Text className="text-white font-medium text-[16px]">From Cloud</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
        
        <Text className="text-center text-[#9CA3AF] text-xs mt-6">
          Supported: MP4, MOV, HEVC{'\n'}Max size: 500 MB
        </Text>
      </View>
    </View>
  );

  const renderPreview = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav 
        title={editMode === 'none' ? "Preview & Edit" : editMode === 'trim' ? "Trim Video" : editMode === 'filters' ? "Filters" : "Preview & Edit"} 
        onBack={() => { 
          if (editMode !== 'none') {
            setEditMode('none');
          } else {
            setRecordedVideoUri(null); 
            setStep('RECORD'); 
          }
        }} 
        rightEl={
          <TouchableOpacity onPress={() => setStep('CHOOSE_TALENT')} className="bg-[#E91E76] px-4 py-1.5 rounded-full">
            <Text className="text-white font-bold">Next</Text>
          </TouchableOpacity>
        }
      />
      
      <View className="flex-1 px-5 pb-5">
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => {
            if (isPlaying) {
              previewPlayer.pause();
              setIsPlaying(false);
            } else {
              previewPlayer.play();
              setIsPlaying(true);
            }
          }}
          className="flex-1 rounded-3xl overflow-hidden bg-black mb-4 border border-white/10 relative justify-center items-center"
        >
          {recordedVideoUri && <VideoView player={previewPlayer} className="absolute inset-0 w-full h-full" contentFit="cover" nativeControls={false} />}
          
          {!isPlaying && (
            <View className="w-16 h-16 bg-black/50 rounded-full items-center justify-center backdrop-blur-md">
              <Play color="#fff" size={32} fill="#fff" className="ml-1" />
            </View>
          )}

          {/* Custom Progress Bar matching image */}
          {editMode !== 'trim' && (
            <View className="absolute bottom-4 left-4 right-4 flex-row items-center gap-3">
              <View className="flex-1 h-1.5 bg-white/20 rounded-full flex-row items-center">
                <View className="h-full w-1/3 bg-[#E91E76] rounded-l-full" />
                <View className="w-3.5 h-3.5 bg-white rounded-full -ml-1.5 shadow-md" />
              </View>
              <Text className="text-white text-[10px] font-medium drop-shadow-md">00:12 / 00:58</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Main 5 Editor Buttons */}
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity 
            onPress={() => setEditMode('trim')} 
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border border-white/10 bg-[#1A1D24] ${editMode === 'trim' ? 'border-[#E91E76]' : ''}`}
          >
            <Scissors color={editMode === 'trim' ? "#E91E76" : "#fff"} size={22} className="mb-2" />
            <Text className={editMode === 'trim' ? "text-[#E91E76] text-[10px]" : "text-white text-[10px]"}>Trim</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setEditMode('cover')}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border border-white/10 bg-[#1A1D24] ${editMode === 'cover' ? 'border-[#E91E76]' : ''}`}
          >
            <ImageIcon color={editMode === 'cover' ? "#E91E76" : "#fff"} size={22} className="mb-2" />
            <Text className={editMode === 'cover' ? "text-[#E91E76] text-[10px]" : "text-white text-[10px]"}>Cover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setEditMode('sound')}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border border-white/10 bg-[#1A1D24] ${editMode === 'sound' ? 'border-[#E91E76]' : ''}`}
          >
            <Music2 color={editMode === 'sound' ? "#E91E76" : "#fff"} size={22} className="mb-2" />
            <Text className={editMode === 'sound' ? "text-[#E91E76] text-[10px]" : "text-white text-[10px]"}>Sound</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setEditMode('filters')}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border border-white/10 bg-[#1A1D24] ${editMode === 'filters' ? 'border-[#E91E76] border-2' : ''}`}
          >
            <Aperture color={editMode === 'filters' ? "#E91E76" : "#fff"} size={22} className="mb-2" />
            <Text className={editMode === 'filters' ? "text-[#E91E76] text-[10px]" : "text-white text-[10px]"}>Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setEditMode('caption')}
            className={`w-[18%] aspect-square rounded-2xl items-center justify-center border border-white/10 bg-[#1A1D24] ${editMode === 'caption' ? 'border-[#E91E76]' : ''}`}
          >
            <Subtitles color={editMode === 'caption' ? "#E91E76" : "#fff"} size={22} className="mb-2" />
            <Text className={editMode === 'caption' ? "text-[#E91E76] text-[10px]" : "text-white text-[10px]"}>Captions</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Editor Panel */}
        {editMode === 'trim' ? (
          <View className="w-full h-24 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-medium">00:12</Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={() => {
                  if (isPlaying) { previewPlayer.pause(); setIsPlaying(false); }
                  else { previewPlayer.play(); setIsPlaying(true); }
                }}>
                  {isPlaying ? <Pause color="#fff" size={24} /> : <Play color="#fff" size={24} />}
                </TouchableOpacity>
              </View>
              <Text className="text-white font-medium">00:58</Text>
            </View>
            
            {/* Timeline Editor Mock */}
            <View className="h-14 w-full relative justify-center">
              <View className="absolute inset-0 flex-row overflow-hidden rounded-lg border-2 border-white/20 opacity-50">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <View key={i} className="flex-1 h-full bg-[#2A2D34] border-r border-black" />
                ))}
              </View>
              
              <View className="absolute left-[10%] right-[20%] h-full border-4 border-[#E91E76] rounded-lg bg-transparent">
                <View className="absolute -left-3 top-0 bottom-0 w-3 bg-[#E91E76] rounded-l-md justify-center items-center">
                  <View className="w-1 h-4 bg-white rounded-full" />
                </View>
                <View className="absolute -right-3 top-0 bottom-0 w-3 bg-[#E91E76] rounded-r-md justify-center items-center">
                  <View className="w-1 h-4 bg-white rounded-full" />
                </View>
              </View>
              
              <View className="absolute left-[33%] top-[-8px] bottom-[-8px] w-1 bg-white rounded-full z-10 shadow-lg" />
            </View>
          </View>
        ) : editMode === 'filters' ? (
          <View className="w-full h-[85px] mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 w-full">
              {['Original', 'Stage', 'Studio', 'Natural', 'Low Light', 'B&W', 'Live', 'Auto Fix'].map(filter => (
                <TouchableOpacity 
                  key={filter} 
                  onPress={() => setActiveFilter(filter)}
                  className="items-center mr-3"
                >
                  <View className={`w-14 h-14 rounded-xl overflow-hidden mb-1.5 ${activeFilter === filter ? 'border-2 border-[#E91E76]' : ''}`}>
                    {/* In a real app this would be a thumbnail of the video with the filter applied */}
                    <View className="w-full h-full bg-[#2A2D34]" />
                  </View>
                  <Text className={`text-[10px] ${activeFilter === filter ? 'text-[#E91E76]' : 'text-white/80'}`}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : editMode !== 'none' ? (
          <View className="w-full h-24 items-center justify-center mb-4">
            <Text className="text-[#9CA3AF]">Editing feature coming soon.</Text>
          </View>
        ) : null}

        {/* Best Moment Banner */}
        <View className="bg-[#1A1D24] p-4 rounded-2xl flex-row items-center border border-white/5">
          <Sparkles color="#fff" size={24} className="mr-3" />
          <View className="flex-1 mr-2">
            <Text className="text-white font-bold text-sm mb-0.5">Best Moment</Text>
            <Text className="text-[#9CA3AF] text-[11px]">Let AI find the most engaging part of your video.</Text>
          </View>
          <TouchableOpacity className="bg-[#E91E76] px-5 py-2 rounded-full">
            <Text className="text-white font-bold text-xs">Try</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderChooseTalent = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav onBack={() => setStep('PREVIEW')} />
      <Text className="text-white text-[28px] font-bold px-5 mb-2">What are you showing?</Text>
      <Text className="text-[#9CA3AF] px-5 mb-8">Choose the main talent category.</Text>
      
      <View className="flex-row flex-wrap px-3 mb-6">
        {['Dance', 'Voice', 'Music', 'Acting', 'Comedy', 'Film', 'Art', 'Other'].map((cat) => (
          <TouchableOpacity 
            key={cat}
            onPress={() => setCategory(cat)}
            className={`w-[22%] aspect-square m-[1.5%] rounded-2xl items-center justify-center border-2 ${category === cat ? 'border-[#E91E76] bg-[#E91E76]/10' : 'border-white/5 bg-[#1A1D24]'}`}
          >
            <View className={`w-8 h-8 rounded-full mb-2 ${category === cat ? 'bg-[#E91E76]/20' : 'bg-white/5'}`} />
            <Text className="text-white text-[11px] font-medium">{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {category === 'Dance' && (
        <View className="px-5">
          <Text className="text-white font-medium mb-3">Dance styles <Text className="text-[#9CA3AF] text-sm">(optional)</Text></Text>
          <View className="flex-row flex-wrap gap-2">
            {['Contemporary', 'Hip-Hop', 'Classical', 'Freestyle', 'Ballet', 'Folk', 'Other'].map(sub => (
              <TouchableOpacity 
                key={sub}
                onPress={() => setSubCategory(sub)}
                className={`px-4 py-2 rounded-full border ${subCategory === sub ? 'border-[#E91E76] bg-[#E91E76]/10' : 'border-white/10'}`}
              >
                <Text className={subCategory === sub ? 'text-[#E91E76] font-medium' : 'text-[#9CA3AF]'}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <View className="mt-auto px-5 pb-10 pt-4">
        <TouchableOpacity onPress={() => setStep('SET_PURPOSE')} className="bg-[#E91E76] w-full py-4 rounded-full items-center">
          <Text className="text-white font-bold text-[16px]">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSetPurpose = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav onBack={() => setStep('CHOOSE_TALENT')} />
      <Text className="text-white text-[28px] font-bold px-5 mb-2">What do you want from this performance?</Text>
      <Text className="text-[#9CA3AF] px-5 mb-8">Choose your main goal.</Text>
      
      <View className="px-5 gap-4">
        {[
          { id: 'Get Discovered', desc: 'Show this to new people', icon: <Sparkles color={purpose === 'Get Discovered' ? '#E91E76' : '#fff'} /> },
          { id: 'Get Feedback', desc: 'Let people judge and help you improve', icon: <MessageSquare color={purpose === 'Get Feedback' ? '#E91E76' : '#fff'} /> },
          { id: 'Find Collaborators', desc: 'Find artists, producers and creators', icon: <Globe color={purpose === 'Find Collaborators' ? '#E91E76' : '#fff'} /> },
          { id: 'Find Opportunities', desc: 'Get considered for shows, auditions and projects', icon: <CheckCircle2 color={purpose === 'Find Opportunities' ? '#E91E76' : '#fff'} /> }
        ].map((item) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => setPurpose(item.id)}
            className={`w-full p-5 rounded-2xl border-2 flex-row items-center ${purpose === item.id ? 'border-[#E91E76] bg-[#E91E76]/5' : 'border-white/5 bg-[#1A1D24]'}`}
          >
            <View className="w-12 items-center justify-center">{item.icon}</View>
            <View className="flex-1 ml-2">
              <Text className="text-white font-bold text-lg mb-1">{item.id}</Text>
              <Text className="text-[#9CA3AF] text-sm">{item.desc}</Text>
            </View>
            <ChevronRight color={purpose === item.id ? '#E91E76' : '#9CA3AF'} size={20} />
          </TouchableOpacity>
        ))}
      </View>
      
      <View className="mt-auto px-5 pb-10 pt-4">
        <TouchableOpacity onPress={() => setStep('DETAILS')} className="bg-[#E91E76] w-full py-4 rounded-full items-center">
          <Text className="text-white font-bold text-[16px]">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetails = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#050608]">
      <ScrollView className="flex-1">
        <View className="pt-14">
          <TopNav onBack={() => setStep('SET_PURPOSE')} />
          <Text className="text-white text-[28px] font-bold px-5 mb-2">Performance Details</Text>
          <Text className="text-[#9CA3AF] px-5 mb-8">Add the finishing touches.</Text>
          
          <View className="px-5">
            <View className="flex-row mb-8">
              <View className="w-24 h-36 bg-[#1A1D24] rounded-xl overflow-hidden mr-4">
                {recordedVideoUri && <VideoView player={previewPlayer} className="flex-1 w-full h-full" contentFit="cover" />}
                <View className="absolute bottom-0 w-full bg-black/60 py-1">
                  <Text className="text-white text-[10px] text-center font-medium">Change Cover</Text>
                </View>
              </View>
              
              <View className="flex-1">
                <Text className="text-[#9CA3AF] mb-2 font-medium text-xs uppercase tracking-wider">Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Midnight Movement"
                  placeholderTextColor="#6B7280"
                  className="w-full bg-[#1A1D24] text-white px-4 py-3 rounded-xl border border-white/5 mb-4 font-medium"
                />
                
                <Text className="text-[#9CA3AF] mb-2 font-medium text-xs uppercase tracking-wider">Location</Text>
                <View className="flex-row items-center bg-[#1A1D24] border border-white/5 rounded-xl px-4 py-3">
                  <MapPin color="#E91E76" size={16} className="mr-2" />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Bengaluru, India"
                    placeholderTextColor="#6B7280"
                    className="flex-1 text-white p-0 m-0 font-medium"
                  />
                </View>
              </View>
            </View>
            
            <View className="h-[1px] bg-white/5 w-full mb-6" />
            
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-[16px] mb-1">Allow Judging</Text>
                <Text className="text-[#9CA3AF] text-sm">Let viewers give this performance a Talent Score.</Text>
              </View>
              <TouchableOpacity onPress={() => setAllowJudging(!allowJudging)}>
                {allowJudging ? <ToggleRight color="#E91E76" size={44} /> : <ToggleLeft color="#4B5563" size={44} />}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity className="flex-row justify-between items-center bg-[#1A1D24] p-4 rounded-xl border border-white/5">
              <Text className="text-white font-medium">More settings</Text>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View className="px-5 pb-10 pt-4 bg-[#050608]">
        <TouchableOpacity 
          className={`w-full py-4 rounded-full items-center justify-center ${title.trim() ? 'bg-[#E91E76]' : 'bg-[#E91E76]/50'}`}
          activeOpacity={0.8}
          disabled={!title.trim()}
          onPress={() => setStep('SUMMARY')}
        >
          <Text className="text-white font-bold text-[16px]">Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderSummary = () => (
    <View className="flex-1 bg-[#050608] pt-14">
      <TopNav onBack={() => setStep('DETAILS')} />
      <Text className="text-white text-[28px] font-bold px-5 mb-2">Ready to Publish?</Text>
      <Text className="text-[#9CA3AF] px-5 mb-8">Here's a quick summary.</Text>
      
      <View className="px-5">
        <View className="bg-[#1A1D24] rounded-2xl p-4 flex-row mb-6 border border-white/5">
          <View className="w-20 h-28 bg-[#2A2D34] rounded-lg overflow-hidden mr-4 relative">
             {recordedVideoUri && <VideoView player={previewPlayer} className="flex-1 w-full h-full" contentFit="cover" />}
             <View className="absolute inset-0 items-center justify-center bg-black/20">
               <View className="w-8 h-8 rounded-full bg-black/50 items-center justify-center">
                 <Text className="text-white text-xs">▶</Text>
               </View>
             </View>
          </View>
          
          <View className="flex-1 justify-center">
            <Text className="text-white font-bold text-lg mb-1">{title}</Text>
            <Text className="text-[#E91E76] font-medium text-sm mb-2">{category} • {subCategory}</Text>
            
            <View className="flex-row items-center mb-2">
              <MapPin color="#9CA3AF" size={12} className="mr-1" />
              <Text className="text-[#9CA3AF] text-xs">{location}</Text>
            </View>
            
            <View className="self-start bg-white/5 px-3 py-1 rounded-full flex-row items-center">
              <Sparkles color="#E91E76" size={12} className="mr-1" />
              <Text className="text-[#9CA3AF] text-xs">Goal: {purpose}</Text>
            </View>
          </View>
        </View>
        
        <View className="space-y-4">
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Allow Judging</Text>
            <View className="flex-row items-center">
              <CheckCircle2 color="#10B981" size={16} className="mr-1.5" />
              <Text className="text-[#10B981] font-medium">On</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Comments (Talk)</Text>
            <View className="flex-row items-center">
              <CheckCircle2 color="#10B981" size={16} className="mr-1.5" />
              <Text className="text-[#10B981] font-medium">On</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-white font-medium">Visibility</Text>
            <View className="flex-row items-center">
              <Globe color="#9CA3AF" size={16} className="mr-1.5" />
              <Text className="text-[#9CA3AF] font-medium">Public</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity className="flex-row justify-between items-center bg-[#1A1D24] p-4 rounded-xl border border-white/5 mt-8">
          <Text className="text-white font-medium">More settings</Text>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
      </View>
      
      <View className="mt-auto px-5 pb-10">
        <TouchableOpacity 
          className="w-full py-4 rounded-full items-center justify-center bg-[#E91E76]"
          activeOpacity={0.8}
          onPress={handlePublish}
        >
          <Text className="text-white font-bold text-[16px]">Publish Performance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUploading = () => (
    <View className="flex-1 bg-[#050608] items-center justify-center px-8">
      <Cloud color="#E91E76" size={80} className="mb-8" opacity={0.8} />
      
      <Text className="text-white text-2xl font-bold text-center mb-2">Publishing your{'\n'}performance...</Text>
      <Text className="text-[#9CA3AF] text-center mb-12">This may take a few moments.</Text>
      
      <View className="w-full mb-8">
        <View className="flex-row justify-between mb-2">
          <Text className="text-white font-medium"></Text>
          <Text className="text-[#E91E76] font-bold">{uploadProgress}%</Text>
        </View>
        <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <View className="h-full bg-[#E91E76] rounded-full" style={{ width: `${uploadProgress}%` }} />
        </View>
      </View>
      
      <View className="w-full space-y-4 px-4">
        <View className="flex-row items-center">
          <CheckCircle2 color={uploadProgress > 10 ? "#E91E76" : "#4B5563"} size={20} className="mr-3" />
          <Text className={uploadProgress > 10 ? "text-white font-medium" : "text-[#4B5563]"}>Uploading video</Text>
        </View>
        <View className="flex-row items-center">
          <CheckCircle2 color={uploadProgress > 50 ? "#E91E76" : "#4B5563"} size={20} className="mr-3" />
          <Text className={uploadProgress > 50 ? "text-white font-medium" : "text-[#4B5563]"}>Processing video</Text>
        </View>
        <View className="flex-row items-center">
          <CheckCircle2 color={uploadProgress > 80 ? "#E91E76" : "#4B5563"} size={20} className="mr-3" />
          <Text className={uploadProgress > 80 ? "text-white font-medium" : "text-[#4B5563]"}>Saving details</Text>
        </View>
        <View className="flex-row items-center">
          <CheckCircle2 color={uploadProgress >= 100 ? "#E91E76" : "#4B5563"} size={20} className="mr-3" />
          <Text className={uploadProgress >= 100 ? "text-white font-medium" : "text-[#4B5563]"}>Finalizing...</Text>
        </View>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View className="flex-1 bg-[#050608] items-center justify-center px-6">
      <View className="w-24 h-24 rounded-full bg-[#E91E76] items-center justify-center mb-8 relative">
        <Check color="#fff" size={48} strokeWidth={3} />
        {/* Decorative sparkles */}
        <View className="absolute -top-4 -left-4"><Sparkles color="#fff" size={16} opacity={0.6} /></View>
        <View className="absolute top-0 -right-6"><Sparkles color="#fff" size={20} opacity={0.8} /></View>
        <View className="absolute -bottom-2 -left-8"><Sparkles color="#E91E76" size={14} /></View>
        <View className="absolute -bottom-6 right-0"><Sparkles color="#fff" size={18} opacity={0.5} /></View>
      </View>
      
      <Text className="text-white text-3xl font-bold text-center mb-4">Your performance{'\n'}is live!</Text>
      <Text className="text-[#9CA3AF] text-center mb-12 px-4 leading-relaxed">
        People can now watch, keep,{'\n'}talk and judge your performance.
      </Text>
      
      <TouchableOpacity className="w-full py-4 rounded-full items-center justify-center bg-[#E91E76] mb-4">
        <Text className="text-white font-bold text-[16px]">View Performance</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => { setStep('HOME'); setRecordedVideoUri(null); setTitle(''); }}>
        <Text className="text-[#9CA3AF] font-medium py-3">Create Another</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Main Switch ---
  switch(step) {
    case 'HOME': return renderHome();
    case 'RECORD': return renderRecord();
    case 'UPLOAD': return renderUpload();
    case 'PREVIEW': return renderPreview();
    case 'CHOOSE_TALENT': return renderChooseTalent();
    case 'SET_PURPOSE': return renderSetPurpose();
    case 'DETAILS': return renderDetails();
    case 'SUMMARY': return renderSummary();
    case 'UPLOADING': return renderUploading();
    case 'SUCCESS': return renderSuccess();
    default: return renderHome();
  }
}
