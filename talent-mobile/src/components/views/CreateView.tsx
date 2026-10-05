import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { X, Music, Flashlight, Repeat, Settings2, Sparkles, Clock, Image as ImageIcon, Check, ChevronLeft, MapPin, ToggleRight, ToggleLeft, Camera, Upload, Folder, Cloud, MoreHorizontal, MessageSquare, Eye, Globe, Zap, UploadCloud, CheckCircle2, FileVideo, Music2, Edit3, ImagePlus, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Haptics from 'expo-haptics';
import { Switch } from 'react-native';
import { X, Camera, Upload, Folder, Image as ImageIcon, ChevronLeft, Scissors, Image as CoverIcon, Volume2, Type, ChevronRight, BarChart2, MessageSquare, Users, Briefcase, CheckCircle2, Settings, MapPin, Check, Repeat, Flashlight, Clock, Play, Pause, MonitorPlay, Music, Star } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

type Step = 'HOME' | 'PRE_PERMISSION' | 'RECORD' | 'UPLOAD' | 'CATEGORY' | 'PREVIEW' | 'PURPOSE' | 'DETAILS' | 'REVIEW' | 'PUBLISHING' | 'SUCCESS';

const CATEGORIES = {
  Dance: ['Contemporary', 'Hip-Hop', 'Classical', 'Freestyle', 'Ballet', 'Folk', 'Other'],
  Voice: ['Pop', 'Classical', 'Indie', 'R&B', 'Rap', 'Folk', 'Other'],
  Music: ['Guitar', 'Piano', 'Drums', 'Violin', 'Production', 'Other'],
  Acting: ['Drama', 'Comedy', 'Monologue', 'Screen Acting', 'Theatre', 'Other'],
  Comedy: ['Stand-up', 'Sketch', 'Improv', 'Other'],
  Film: ['Directing', 'Cinematography', 'Editing', 'Writing', 'Other'],
  Art: ['Illustration', 'Painting', 'Digital', 'Design', 'Other'],
  Other: []
};

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

export default function CreateView({ onClose }: { onClose?: () => void }) {
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

  // Upload Progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('Uploading video');

  // Preview Player
  const previewPlayer = useVideoPlayer(draft.videoUri || '', player => {
    player.loop = true;
    player.pause();
  });
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecordFlow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!cameraPermission?.granted || !micPermission?.granted) {
      setStep('PRE_PERMISSION');
    } else {
      setStep('RECORD');
    }
  };

  const handleRequestPermissions = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const cam = await requestCameraPermission();
    const mic = await requestMicPermission();
    if (cam.granted) {
      setStep('RECORD');
    }
  };

  const toggleRecord = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!isRecording) {
      setIsRecording(true);
      if (cameraRef.current) {
        try {
          const video = await cameraRef.current.recordAsync({ maxDuration: 180 });
          if (video && video.uri) {
            updateDraft({ videoUri: video.uri });
            setStep('CATEGORY'); // Proceed to category selection
          }
        } catch (error) {
          console.error("Recording failed", error);
        } finally {
          setIsRecording(false);
        }
      }
    } else {
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
  };

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
  };

  const startPublishing = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep('PUBLISHING');
    setUploadProgress(0);
    setUploadStage('Uploading video');

    // Simulate upload progress
    const stages = ['Uploading video', 'Processing video', 'Saving details', 'Finalizing'];
    let currentProgress = 0;
    let currentStageIndex = 0;

    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress > 25 && currentStageIndex === 0) { currentStageIndex = 1; setUploadStage(stages[1]); }
      if (currentProgress > 60 && currentStageIndex === 1) { currentStageIndex = 2; setUploadStage(stages[2]); }
      if (currentProgress > 90 && currentStageIndex === 2) { currentStageIndex = 3; setUploadStage(stages[3]); }
      
      setUploadProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setStep('SUCCESS');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 200);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const TopBar = ({ title, onBack, rightAction }: any) => (
    <View className="pt-14 pb-4 px-5 flex-row justify-between items-center z-10 bg-[#050608]">
      <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onBack(); }} className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
        <ChevronLeft color="#fff" size={24} />
      </TouchableOpacity>
      <Text className="text-white font-bold text-[16px]">{title}</Text>
      <View className="w-10">{rightAction}</View>
    </View>
  );

  // ----------------------------------------------------
  // SCREENS
  // ----------------------------------------------------

  if (step === 'HOME') {
    return (
      <View className="flex-1 bg-black">
        {/* Cinematic deep background glow */}
        <View className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] bg-[#E91E76]/10 rounded-full opacity-60" style={{ filter: 'blur(80px)' }} />
        <View className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#E91E76]/5 rounded-full opacity-40" style={{ filter: 'blur(100px)' }} />
        
        <View className="pt-24 px-6 flex-1 relative z-10">
          <Text className="text-white/60 text-[20px] font-serif italic tracking-widest mb-1 uppercase">Your Stage.</Text>
          <Text className="text-white text-[56px] font-bold tracking-tighter mb-2 leading-tight">Create{'\n'}Magic.</Text>
          <Text className="text-[#9CA3AF] text-[16px] mb-14 font-medium max-w-[250px] leading-relaxed">Unleash your talent with our premium cinematic recording suite.</Text>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleStartRecordFlow}
            className="w-full bg-[#E91E76] rounded-3xl p-5 mb-5 flex-row items-center shadow-[0_0_30px_rgba(233,30,118,0.3)] border border-[#E91E76]"
          >
            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30 backdrop-blur-md">
              <Camera color="#fff" size={26} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-[18px] mb-1 tracking-tight">Record Performance</Text>
              <Text className="text-white/80 text-[13px] font-medium">Start the cinematic camera</Text>
            </View>
            <ChevronRight color="#fff" size={22} className="opacity-90" />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setStep('UPLOAD')}
            className="w-full bg-white/5 rounded-3xl p-5 mb-10 flex-row items-center border border-white/10 backdrop-blur-lg"
          >
            <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center mr-4 border border-white/5">
              <Upload color="#fff" size={26} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-[18px] mb-1 tracking-tight">Upload Performance</Text>
              <Text className="text-[#9CA3AF] text-[13px] font-medium">Import from your gallery</Text>
            </View>
            <ChevronRight color="#9CA3AF" size={22} className="opacity-60" />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between mt-auto mb-8">
            <TouchableOpacity className="flex-row items-center bg-white/5 px-5 py-3 rounded-full border border-white/10 backdrop-blur-md">
              <Folder color="#9CA3AF" size={16} className="mr-2" />
              <Text className="text-white font-medium text-[13px] tracking-wide">Drafts · 2</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center gap-1 opacity-50">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Premium</Text>
              <Star color="#fff" size={10} fill="#fff" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  const renderContent = () => {
  if (step === 'PRE_PERMISSION') {
    return (
      <View className="flex-1 bg-[#050608]">
        <TopBar title="" onBack={() => setStep('HOME')} />
        <View className="flex-1 px-6 justify-center pb-20">
          <View className="w-16 h-16 bg-[#E91E76]/20 rounded-full items-center justify-center mb-6">
            <Camera color="#E91E76" size={32} />
          </View>
          <Text className="text-white text-[28px] font-bold mb-3 tracking-tight">Enable access</Text>
          
          <View className="bg-[#11131A] p-5 rounded-2xl border border-white/5 mb-8">
            <View className="flex-row items-center gap-4 mb-4 pb-4 border-b border-white/5">
              <Camera color="#fff" size={24} />
              <View className="flex-1">
                <Text className="text-white font-bold text-[15px] mb-1">Camera</Text>
                <Text className="text-[#9CA3AF] text-[13px]">Lets you record your performance.</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-4">
              <Volume2 color="#fff" size={24} />
              <View className="flex-1">
                <Text className="text-white font-bold text-[15px] mb-1">Microphone</Text>
                <Text className="text-[#9CA3AF] text-[13px]">Captures your performance audio.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleRequestPermissions} className="w-full bg-[#E91E76] py-4 rounded-full items-center mb-4">
            <Text className="text-white font-bold text-[16px]">Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('HOME')} className="w-full py-4 items-center">
            <Text className="text-[#9CA3AF] font-bold text-[16px]">Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'RECORD') {
    return (
      <View className="flex-1 bg-black">
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} mode="video">
          <View className="pt-14 px-5 flex-row justify-between items-start z-20">
            <TouchableOpacity onPress={() => setStep('HOME')} className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/20">
              <X color="#fff" size={24} />
            </TouchableOpacity>
            
            {isRecording && (
              <View className="bg-red-500/80 px-4 py-1.5 rounded-full flex-row items-center gap-2 border border-white/20">
                <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <Text className="text-white font-bold tracking-widest">{formatTime(recordingDuration)}</Text>
              </View>
            )}

            <View className="w-10" />
          </View>

          {!isRecording && (
            <View className="absolute right-4 top-32 items-center gap-6 bg-black/30 rounded-full py-5 px-2 border border-white/10 z-20">
              <TouchableOpacity 
                className="items-center gap-1" 
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFacing(f => f === 'back' ? 'front' : 'back');
                  } catch (e) {
                    console.log("Flip not supported on this device");
                  }
                }}
              >
                <Repeat color="#fff" size={24} />
                <Text className="text-white text-[10px] font-medium mt-1">Flip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="items-center gap-1"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (Platform.OS === 'web') {
                    window.alert("Timer feature coming soon!");
                  }
                }}
              >
                <Clock color="#fff" size={24} />
                <Text className="text-white text-[10px] font-medium mt-1">Timer</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="absolute bottom-0 inset-x-0 pb-12 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
            <View className="flex-row items-center justify-center gap-12">
              <View className="w-12 h-12" /> {/* Spacer */}
              
              <TouchableOpacity activeOpacity={0.8} onPress={toggleRecord} className={`w-[80px] h-[80px] rounded-full border-4 items-center justify-center transition-all ${isRecording ? 'border-[#E91E76]/50' : 'border-white/50'}`}>
                <View className={`rounded-full bg-[#E91E76] ${isRecording ? 'w-[32px] h-[32px] rounded-xl' : 'w-[64px] h-[64px]'}`} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('UPLOAD')} className="items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20 overflow-hidden">
                 <ImageIcon color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (step === 'UPLOAD') {
    return (
      <View className="flex-1 bg-[#050608]">
        <TopBar title="Upload Performance" onBack={() => setStep('HOME')} />
        <View className="flex-1 px-6 pt-6">
          <View className="w-full bg-[#11131A] border border-white/5 rounded-3xl p-8 items-center justify-center mb-8 h-[240px]">
            <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-4">
              <Upload color="#fff" size={32} />
            </View>
            <Text className="text-white text-[20px] font-bold mb-2">Choose a video</Text>
            <Text className="text-[#9CA3AF] text-[14px]">Select from your device (Max 3 mins)</Text>
          </View>

          <TouchableOpacity onPress={pickVideo} className="w-full bg-[#1A1D24] rounded-2xl p-5 mb-4 flex-row items-center border border-white/5">
            <ImageIcon color="#fff" size={24} className="mr-4" />
            <Text className="text-white font-bold text-[16px]">From Gallery</Text>
            <ChevronRight color="#9CA3AF" size={20} className="ml-auto" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={pickVideo} className="w-full bg-[#1A1D24] rounded-2xl p-5 mb-4 flex-row items-center border border-white/5">
            <Folder color="#fff" size={24} className="mr-4" />
            <Text className="text-white font-bold text-[16px]">From Files</Text>
            <ChevronRight color="#9CA3AF" size={20} className="ml-auto" />
          </TouchableOpacity>

          <Text className="text-center text-[#6B7280] text-[12px] mt-auto mb-10">Supported: MP4, MOV, HEVC{'\n'}Max size: 500 MB</Text>
        </View>
      </View>
    );
  }

  if (step === 'CATEGORY') {
    const categories = Object.keys(CATEGORIES);
    const subcats = draft.category ? CATEGORIES[draft.category as keyof typeof CATEGORIES] : [];

    return (
      <View className="flex-1 bg-[#050608]">
        <TopBar title="" onBack={() => setStep('HOME')} />
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <Text className="text-white text-[28px] font-bold tracking-tight mb-2">What are you showing?</Text>
          <Text className="text-[#9CA3AF] text-[15px] mb-8">Choose the main talent category.</Text>

          <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
            {categories.map((cat, i) => {
              const isSelected = draft.category === cat;
              return (
                <TouchableOpacity 
                  key={i} 
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateDraft({ category: cat, subcategory: null }); }}
                  className={`w-[48%] h-[110px] rounded-2xl p-4 justify-between border ${isSelected ? 'border-[#E91E76] bg-[#E91E76]/10' : 'border-white/5 bg-[#11131A]'}`}
                >
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                    {cat === 'Dance' && <MonitorPlay color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                    {cat === 'Voice' && <Volume2 color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                    {cat === 'Music' && <Music color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                    {cat === 'Acting' && <Users color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                    {cat === 'Comedy' && <MessageSquare color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                    {cat === 'Film' && <Camera color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                    {cat === 'Art' && <ImageIcon color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                    {cat === 'Other' && <Star color={isSelected ? '#E91E76' : '#fff'} size={20} />}
                  </View>
                  <Text className={`font-bold text-[15px] ${isSelected ? 'text-[#E91E76]' : 'text-white'}`}>{cat}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {draft.category && subcats.length > 0 && (
            <View className="mb-10 animate-fade-in">
              <Text className="text-white font-medium text-[15px] mb-4">{draft.category} styles <Text className="text-[#6B7280]">(optional)</Text></Text>
              <View className="flex-row flex-wrap gap-3">
                {subcats.map((sub, i) => (
                  <TouchableOpacity 
                    key={i}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateDraft({ subcategory: draft.subcategory === sub ? null : sub }); }}
                    className={`px-5 py-2.5 rounded-full border ${draft.subcategory === sub ? 'border-[#E91E76] bg-[#E91E76]/10' : 'border-white/10 bg-[#11131A]'}`}
                  >
                    <Text className={`font-medium text-[13px] ${draft.subcategory === sub ? 'text-[#E91E76]' : 'text-white'}`}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="h-20" />
        </ScrollView>
        <View className="absolute bottom-0 w-full p-6 pb-8 bg-gradient-to-t from-[#050608] via-[#050608] to-transparent">
          <TouchableOpacity 
            onPress={() => setStep('PREVIEW')} 
            disabled={!draft.category}
            className={`w-full py-4 rounded-full items-center ${draft.category ? 'bg-[#E91E76]' : 'bg-[#E91E76]/30'}`}
          >
            <Text className="text-white font-bold text-[16px]">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'PREVIEW') {
    return (
      <View className="flex-1 bg-[#050608]">
        <TopBar 
          title="Preview & Edit" 
          onBack={() => setStep('CATEGORY')} 
          rightAction={
            <TouchableOpacity onPress={() => setStep('PURPOSE')} className="bg-[#E91E76] px-4 py-1.5 rounded-full"><Text className="text-white font-bold text-[13px]">Next</Text></TouchableOpacity>
          } 
        />
        <View className="flex-1 px-5 pt-2 pb-8">
          <View className="flex-1 bg-[#100C09] rounded-3xl overflow-hidden border border-white/10 relative">
            <VideoView player={previewPlayer} style={StyleSheet.absoluteFill} contentFit="cover" />
            
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                if (isPlaying) { previewPlayer.pause(); setIsPlaying(false); }
                else { previewPlayer.play(); setIsPlaying(true); }
              }}
              className="absolute inset-0 items-center justify-center bg-black/10"
            >
              {!isPlaying && (
                <View className="w-16 h-16 bg-black/40 rounded-full border border-white/30 items-center justify-center pl-1">
                  <Play color="#fff" size={32} fill="#fff" />
                </View>
              )}
            </TouchableOpacity>
            
            <View className="absolute bottom-4 left-4 right-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 bg-[#E91E76] rounded-full" />
                <View className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
                  <View className="w-1/3 h-full bg-[#E91E76]" />
                </View>
              </View>
              <View className="bg-black/60 px-2.5 py-1 rounded-md border border-white/20">
                <Text className="text-white text-[11px] font-bold">00:12 / 00:58</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center mt-6 px-4">
            <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Trim editor opening...') : null} className="items-center gap-2">
              <View className="w-12 h-12 rounded-2xl bg-[#11131A] border border-white/10 items-center justify-center"><Scissors color="#fff" size={20} /></View>
              <Text className="text-white text-[11px] font-medium">Trim</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Cover selector opening...') : null} className="items-center gap-2">
              <View className="w-12 h-12 rounded-2xl bg-[#11131A] border border-white/10 items-center justify-center"><CoverIcon color="#fff" size={20} /></View>
              <Text className="text-white text-[11px] font-medium">Cover</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Sound settings opening...') : null} className="items-center gap-2">
              <View className="w-12 h-12 rounded-2xl bg-[#11131A] border border-white/10 items-center justify-center"><Volume2 color="#fff" size={20} /></View>
              <Text className="text-white text-[11px] font-medium">Sound</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Platform.OS === 'web' ? window.alert('Caption editor opening...') : null} className="items-center gap-2">
              <View className="w-12 h-12 rounded-2xl bg-[#11131A] border border-white/10 items-center justify-center"><Type color="#fff" size={20} /></View>
              <Text className="text-white text-[11px] font-medium">Caption</Text>
            </TouchableOpacity>
          </View>
        </View>
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

  if (step === 'PURPOSE') {
    const purposes = [
      { id: 'GET DISCOVERED', title: 'Get Discovered', desc: 'Show this to new people', icon: <BarChart2 color={draft.purpose.includes('GET DISCOVERED') ? '#E91E76' : '#fff'} size={24} /> },
      { id: 'GET FEEDBACK', title: 'Get Feedback', desc: 'Let people judge and help you improve', icon: <MessageSquare color={draft.purpose.includes('GET FEEDBACK') ? '#E91E76' : '#fff'} size={24} /> },
      { id: 'FIND COLLABORATORS', title: 'Find Collaborators', desc: 'Find artists, producers and creators', icon: <Users color={draft.purpose.includes('FIND COLLABORATORS') ? '#E91E76' : '#fff'} size={24} /> },
      { id: 'FIND OPPORTUNITIES', title: 'Find Opportunities', desc: 'Get considered for shows and projects', icon: <Briefcase color={draft.purpose.includes('FIND OPPORTUNITIES') ? '#E91E76' : '#fff'} size={24} /> },
    ];

    return (
      <View className="flex-1 bg-[#050608]">
        <TopBar title="" onBack={() => setStep('PREVIEW')} />
        <View className="flex-1 px-6 pt-4">
          <Text className="text-white text-[28px] font-bold tracking-tight mb-2 leading-tight">What do you want from{'\n'}this performance?</Text>
          <Text className="text-[#9CA3AF] text-[15px] mb-8">Choose your main goal.</Text>
          
          <View className="gap-4">
            {purposes.map(p => {
              const isSelected = draft.purpose.includes(p.id);
              return (
                <TouchableOpacity 
                  key={p.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const newPurpose = isSelected ? draft.purpose.filter(id => id !== p.id) : [...draft.purpose, p.id];
                    updateDraft({ purpose: newPurpose, allowJudging: p.id === 'GET FEEDBACK' && !isSelected ? true : draft.allowJudging });
                  }}
                  className={`w-full p-5 rounded-2xl border flex-row items-center gap-4 ${isSelected ? 'border-[#E91E76] bg-[#E91E76]/10' : 'border-white/5 bg-[#11131A]'}`}
                >
                  <View className="w-12 h-12 bg-white/5 rounded-xl items-center justify-center">
                    {p.icon}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold text-[16px] mb-1 ${isSelected ? 'text-[#E91E76]' : 'text-white'}`}>{p.title}</Text>
                    <Text className="text-[#9CA3AF] text-[13px]">{p.desc}</Text>
                  </View>
                  {isSelected && <Check color="#E91E76" size={20} />}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
        <View className="p-6 bg-[#050608]">
          <TouchableOpacity onPress={() => setStep('DETAILS')} disabled={draft.purpose.length === 0} className={`w-full py-4 rounded-full items-center ${draft.purpose.length > 0 ? 'bg-[#E91E76]' : 'bg-[#E91E76]/30'}`}>
            <Text className="text-white font-bold text-[16px]">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'DETAILS') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#050608]">
        <TopBar title="" onBack={() => setStep('PURPOSE')} />
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text className="text-white text-[28px] font-bold tracking-tight mb-2">Performance Details</Text>
          <Text className="text-[#9CA3AF] text-[15px] mb-8">Add the finishing touches.</Text>

          <View className="flex-row gap-5 mb-8">
            <View className="w-[100px] h-[140px] bg-[#11131A] rounded-2xl border border-white/10 overflow-hidden relative">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=400&q=80' }} className="w-full h-full opacity-80" />
              <View className="absolute bottom-0 inset-x-0 bg-black/60 py-1.5"><Text className="text-white text-center text-[10px] font-bold uppercase">Change Cover</Text></View>
            </View>
            
            <View className="flex-1 pt-1">
              <Text className="text-[#9CA3AF] text-[12px] font-bold uppercase tracking-wider mb-2">Title</Text>
              <TextInput 
                value={draft.title}
                onChangeText={(t) => updateDraft({ title: t })}
                placeholder="Name your performance"
                placeholderTextColor="#6B7280"
                className="w-full bg-[#11131A] text-white px-4 py-3 rounded-xl border border-white/5 mb-4 text-[15px]"
              />
              <Text className="text-[#9CA3AF] text-[12px] font-bold uppercase tracking-wider mb-2">Location</Text>
              <TouchableOpacity className="w-full bg-[#11131A] px-4 py-3 rounded-xl border border-white/5 flex-row items-center gap-2">
                <MapPin color="#E91E76" size={16} />
                <Text className="text-white text-[15px]">Bengaluru, India</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="w-full h-[1px] bg-white/5 mb-6" />

          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1 pr-6">
              <Text className="text-white font-bold text-[16px] mb-1">Allow Judging</Text>
              <Text className="text-[#9CA3AF] text-[13px]">Let viewers give this performance a Talent Score.</Text>
            </View>
            <Switch 
              value={draft.allowJudging} 
              onValueChange={(v) => updateDraft({ allowJudging: v })} 
              trackColor={{ false: '#374151', true: '#E91E76' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity className="flex-row justify-between items-center bg-[#11131A] p-4 rounded-2xl border border-white/5 mb-10">
            <Text className="text-white font-medium text-[15px]">More settings</Text>
            <ChevronRight color="#9CA3AF" size={20} />
          </TouchableOpacity>

        </ScrollView>
        <View className="p-6 bg-[#050608]">
          <TouchableOpacity 
            onPress={() => {
              if (!draft.title.trim()) {
                if (Platform.OS === 'web') window.alert('Please enter a title for your performance.');
                return;
              }
              startPublishing();
            }} 
            className="w-full py-4 rounded-full items-center bg-[#E91E76] shadow-lg shadow-[#E91E76]/30"
          >
            <Text className="text-white font-bold text-[16px]">Post Performance</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (step === 'REVIEW') {
    return (
      <View className="flex-1 bg-[#050608]">
        <TopBar title="" onBack={() => setStep('DETAILS')} />
        <View className="flex-1 px-6 pt-4">
          <Text className="text-white text-[28px] font-bold tracking-tight mb-2">Ready to Publish?</Text>
          <Text className="text-[#9CA3AF] text-[15px] mb-8">Here's a quick summary.</Text>
          
          <View className="bg-[#11131A] p-5 rounded-3xl border border-white/5 mb-8 flex-row gap-4 shadow-xl">
            <View className="w-[80px] h-[110px] rounded-xl overflow-hidden border border-white/10">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1470229722913-7c092db65f8c?w=400&q=80' }} className="w-full h-full opacity-90" />
              <View className="absolute inset-0 bg-black/20 items-center justify-center"><Play color="#fff" size={24} fill="#fff" /></View>
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-white text-[18px] font-bold mb-1" numberOfLines={1}>{draft.title}</Text>
              <Text className="text-[#E91E76] text-[13px] font-medium mb-3">{draft.category} {draft.subcategory ? `· ${draft.subcategory}` : ''}</Text>
              <View className="flex-row items-center gap-1.5 mb-2">
                <MapPin color="#9CA3AF" size={12} />
                <Text className="text-[#9CA3AF] text-[12px]">Bengaluru, India</Text>
              </View>
              <View className="bg-[#E91E76]/10 self-start px-2 py-1 rounded border border-[#E91E76]/20 flex-row items-center gap-1.5">
                <BarChart2 color="#E91E76" size={12} />
                <Text className="text-[#E91E76] text-[10px] font-bold uppercase tracking-wider">Goal: {draft.purpose.join(', ')}</Text>
              </View>
            </View>
          </View>

          <View className="px-2 gap-5 mb-8">
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-medium text-[15px]">Allow Judging</Text>
              <View className="flex-row items-center gap-1.5"><CheckCircle2 color="#10B981" size={16} /><Text className="text-[#10B981] font-bold text-[14px]">On</Text></View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-medium text-[15px]">Comments (Talk)</Text>
              <View className="flex-row items-center gap-1.5"><CheckCircle2 color="#10B981" size={16} /><Text className="text-[#10B981] font-bold text-[14px]">On</Text></View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-medium text-[15px]">Visibility</Text>
              <View className="flex-row items-center gap-1.5"><Users color="#9CA3AF" size={16} /><Text className="text-[#9CA3AF] font-bold text-[14px]">Public</Text></View>
            </View>
          </View>
          
          <TouchableOpacity className="flex-row justify-between items-center bg-[#11131A] p-4 rounded-2xl border border-white/5">
            <Text className="text-white font-medium text-[15px]">More settings</Text>
            <ChevronRight color="#9CA3AF" size={20} />
          </TouchableOpacity>
        </View>
        <View className="p-6 bg-[#050608]">
          <TouchableOpacity onPress={startPublishing} className="w-full bg-[#E91E76] py-4 rounded-full items-center shadow-lg shadow-[#E91E76]/30">
            <Text className="text-white font-bold text-[16px]">Publish Performance</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'PUBLISHING') {
    return (
      <View className="flex-1 bg-[#050608] items-center justify-center px-10">
        <View className="w-24 h-24 mb-8">
          <Upload color="#E91E76" size={80} className="absolute inset-0 opacity-20" style={{ transform: [{ scale: 1.2 }] }} />
          <Upload color="#E91E76" size={80} className="animate-pulse" />
        </View>
        
        <Text className="text-white text-[28px] font-bold tracking-tight text-center mb-2">Publishing your{'\n'}performance...</Text>
        <Text className="text-[#9CA3AF] text-[15px] mb-12">This may take a few moments.</Text>

        <View className="w-full mb-8">
          <View className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
            <View className="h-full bg-[#E91E76] rounded-full" style={{ width: `${uploadProgress}%` }} />
          </View>
          <Text className="text-right text-[#9CA3AF] text-[12px] font-bold">{uploadProgress}%</Text>
        </View>

        <View className="w-full gap-4 px-4">
          {['Uploading video', 'Processing video', 'Saving details', 'Finalizing'].map((stage, i) => {
            const isCompleted = uploadProgress > (i + 1) * 25 || (i === 3 && uploadProgress === 100);
            const isActive = uploadStage === stage;
            
            return (
              <View key={i} className="flex-row items-center gap-3">
                {isCompleted ? (
                  <CheckCircle2 color="#E91E76" size={20} />
                ) : isActive ? (
                  <ActivityIndicator color="#E91E76" size="small" />
                ) : (
                  <View className="w-5 h-5 rounded-full border border-white/20" />
                )}
                <Text className={`font-medium text-[15px] ${isCompleted ? 'text-white' : isActive ? 'text-[#E91E76]' : 'text-[#6B7280]'}`}>{stage}</Text>
              </View>
            )
          })}
        </View>
      </View>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <View className="flex-1 bg-[#050608] px-6">
        <View className="flex-1 items-center justify-center pt-10">
          <View className="w-32 h-32 mb-10 relative items-center justify-center">
            {/* Confetti simulation */}
            <View className="absolute w-2 h-2 bg-[#E91E76] rounded-full top-0 left-4" />
            <View className="absolute w-3 h-3 bg-white rounded-sm top-8 right-0" style={{ transform: [{ rotate: '45deg' }] }} />
            <View className="absolute w-2 h-2 bg-[#10B981] rounded-full bottom-4 left-0" />
            <View className="absolute w-2 h-2 bg-[#E91E76] rounded-full bottom-10 right-4" />
            
            <View className="w-24 h-24 bg-[#E91E76] rounded-full items-center justify-center shadow-xl shadow-[#E91E76]/40">
              <Check color="#fff" size={48} strokeWidth={3} />
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
        
        <TouchableOpacity className="flex-row justify-between items-center bg-[#1A1D24] p-5 rounded-2xl mb-3">
          <View className="flex-row items-center gap-4">
            <ImageIcon color="#9CA3AF" size={24} />
            <Text className="text-white font-medium text-[16px]">From Gallery</Text>
          </View>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row justify-between items-center bg-[#1A1D24] p-5 rounded-2xl mb-3">
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
        title="Preview & Edit" 
        onBack={() => { setRecordedVideoUri(null); setStep('RECORD'); }} 
        rightEl={
          <TouchableOpacity onPress={() => setStep('CHOOSE_TALENT')} className="bg-[#E91E76] px-4 py-1.5 rounded-full">
            <Text className="text-white font-bold">Next</Text>
          </TouchableOpacity>
        }
      />
      
      <View className="flex-1 px-5 pb-5">
        <View className="flex-1 rounded-3xl overflow-hidden bg-black mb-6 border border-white/10 relative">
          {recordedVideoUri && <VideoView player={previewPlayer} style={StyleSheet.absoluteFill} contentFit="cover" />}
          
          {/* Progress bar mock */}
          <View className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <View className="h-full w-1/3 bg-[#E91E76]" />
          </View>
          <Text className="absolute bottom-6 right-4 text-white text-[10px] font-medium drop-shadow-md">00:12 / 00:58</Text>
        </View>
        
        <View className="flex-row justify-between px-2">
          <TouchableOpacity className="items-center">
            <Edit3 color="#fff" size={24} className="mb-2" />
            <Text className="text-white text-xs">Trim</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <ImagePlus color="#fff" size={24} className="mb-2" />
            <Text className="text-white text-xs">Cover</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Music2 color="#fff" size={24} className="mb-2" />
            <Text className="text-white text-xs">Sound</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <MessageSquare color="#fff" size={24} className="mb-2" />
            <Text className="text-white text-xs">Caption</Text>
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
                {recordedVideoUri && <VideoView player={previewPlayer} style={StyleSheet.absoluteFill} contentFit="cover" />}
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
             {recordedVideoUri && <VideoView player={previewPlayer} style={StyleSheet.absoluteFill} contentFit="cover" />}
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

          <Text className="text-white text-[32px] font-bold tracking-tight text-center mb-3">Your performance{'\n'}is live!</Text>
          <Text className="text-[#9CA3AF] text-[15px] text-center px-4 leading-relaxed mb-12">
            People can now watch, keep, talk and judge your performance in the talent ecosystem.
          </Text>

          <TouchableOpacity className="w-full bg-[#E91E76] py-4 rounded-full items-center shadow-lg shadow-[#E91E76]/30 mb-4">
            <Text className="text-white font-bold text-[16px]">View Performance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              setDraft({ videoUri: null, category: null, subcategory: null, purpose: null, title: '', location: '', allowJudging: true, allowTalk: true, visibility: 'Public' });
              setStep('HOME');
            }} 
            className="w-full py-4 rounded-full items-center"
          >
            <Text className="text-[#9CA3AF] font-bold text-[16px]">Create Another</Text>
          </TouchableOpacity>
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
