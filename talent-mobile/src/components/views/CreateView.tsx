import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { X, Music, Flashlight, Repeat, Settings2, Sparkles, Clock, Image as ImageIcon, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useVideoPlayer, VideoView } from 'expo-video';

export function CreateView({ user, onPublishSuccess }: { user?: any, onPublishSuccess?: () => void }) {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  // Preview / Publish State
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const previewPlayer = useVideoPlayer(recordedVideoUri || '', player => {
    player.loop = true;
    player.play();
  });

  if (!cameraPermission || !micPermission) {
    return <View className="flex-1 bg-black" />;
  }

  const hasAllPermissions = cameraPermission.granted && micPermission.granted;

  if (!hasAllPermissions) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Sparkles color="#E91E63" size={48} className="mb-6" />
        <Text className="text-white text-xl font-bold text-center mb-3">Allow Access</Text>
        <Text className="text-[#9CA3AF] text-center mb-8">
          To record your talents and share them with the world, we need access to your camera and microphone.
        </Text>
        <TouchableOpacity 
          className="bg-[#E91E63] w-full py-4 rounded-full items-center"
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}
        >
          <Text className="text-white font-bold text-[16px]">Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function toggleRecord() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isRecording) {
      setIsRecording(true);
      if (cameraRef.current) {
        try {
          const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
          if (video && video.uri) {
            setRecordedVideoUri(video.uri);
          }
        } catch (error) {
          console.error("Failed to record video:", error);
        } finally {
          setIsRecording(false);
        }
      }
    } else {
      setIsRecording(false);
      if (cameraRef.current) {
        cameraRef.current.stopRecording();
      }
    }
  }

  async function handlePublish() {
    if (!title.trim() || !recordedVideoUri || !user) return;
    
    setIsPublishing(true);
    try {
      const response = await fetch('http://localhost:3000/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          url: recordedVideoUri,
          authorId: user.id
        })
      });
      
      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (onPublishSuccess) onPublishSuccess();
      }
    } catch (error) {
      console.error("Publish failed:", error);
    } finally {
      setIsPublishing(false);
    }
  }

  if (recordedVideoUri) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black">
        <View className="flex-1 relative">
          <VideoView player={previewPlayer} style={StyleSheet.absoluteFill} contentFit="cover" />
          
          <View className="absolute top-14 left-5 right-5 flex-row justify-between items-center z-10">
            <TouchableOpacity 
              className="w-[40px] h-[40px] bg-black/50 rounded-full items-center justify-center"
              onPress={() => setRecordedVideoUri(null)}
            >
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-0 w-full bg-black/80 px-6 pt-6 pb-10 rounded-t-3xl border-t border-white/10">
            <Text className="text-white text-lg font-bold mb-4">Post your performance</Text>
            
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Describe your talent... #singing #dance"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-[#1A1D24] text-white px-5 py-4 rounded-xl border border-white/5 mb-6"
              multiline
            />

            <TouchableOpacity 
              className={`w-full py-4 rounded-full items-center justify-center flex-row ${title.trim() ? 'bg-[#E91E76]' : 'bg-[#E91E76]/50'}`}
              activeOpacity={0.8}
              disabled={!title.trim() || isPublishing}
              onPress={handlePublish}
            >
              {isPublishing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Check color="#fff" size={20} className="mr-2" />
                  <Text className="text-white font-bold text-[16px]">Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill} 
        facing={facing}
        mode="video"
      >
        {/* Top Controls */}
        <View className="pt-14 px-5 flex-row justify-between items-start">
          <TouchableOpacity 
            className="w-[40px] h-[40px] bg-black/40 rounded-full items-center justify-center border border-white/10"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <X color="#fff" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-black/40 px-4 py-2 rounded-full border border-white/10 flex-row items-center gap-2"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Music color="#fff" size={14} />
            <Text className="text-white text-[13px] font-medium">Add Sound</Text>
          </TouchableOpacity>

          <View className="w-[40px]" /> {/* Spacer for centering */}
        </View>

        {/* Right Sidebar Controls */}
        <View className="absolute right-4 top-32 items-center gap-6 bg-black/20 rounded-full py-5 px-2 border border-white/10">
          <SidebarButton icon={<Repeat color="#fff" size={24} />} label="Flip" onPress={toggleCameraFacing} />
          <SidebarButton icon={<Flashlight color="#fff" size={24} />} label="Flash" />
          <SidebarButton icon={<Settings2 color="#fff" size={24} />} label="Filters" />
          <SidebarButton icon={<Clock color="#fff" size={24} />} label="Timer" />
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-0 inset-x-0 pb-12 pt-8 bg-gradient-to-t from-black/80 to-transparent">
          {/* Mode Selector */}
          <View className="flex-row justify-center gap-8 mb-6">
            <Text className="text-white/60 font-semibold text-[13px]">15s</Text>
            <Text className="text-white font-bold text-[13px]">60s</Text>
            <Text className="text-white/60 font-semibold text-[13px]">Photo</Text>
          </View>

          {/* Record Button Area */}
          <View className="flex-row items-center justify-center gap-12">
            <TouchableOpacity className="items-center gap-1">
              <View className="w-[40px] h-[40px] rounded-[10px] overflow-hidden border border-white/20 bg-white/10 items-center justify-center">
                <ImageIcon color="#fff" size={20} />
              </View>
              <Text className="text-white/80 text-[11px] font-medium">Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={toggleRecord}
              className={`w-[80px] h-[80px] rounded-full border-4 items-center justify-center transition-all ${isRecording ? 'border-red-500/50' : 'border-white/50'}`}
            >
              <View className={`rounded-full bg-red-500 ${isRecording ? 'w-[30px] h-[30px] rounded-md' : 'w-[64px] h-[64px]'}`} />
            </TouchableOpacity>

            <TouchableOpacity className="items-center gap-1">
              <View className="w-[40px] h-[40px] rounded-[10px] overflow-hidden border border-white/20 bg-white/10 items-center justify-center">
                <Sparkles color="#fff" size={20} />
              </View>
              <Text className="text-white/80 text-[11px] font-medium">Effects</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

function SidebarButton({ icon, label, onPress }: { icon: React.ReactNode, label: string, onPress?: () => void }) {
  return (
    <TouchableOpacity className="items-center gap-1" onPress={onPress}>
      {icon}
      <Text className="text-white text-[10px] font-medium drop-shadow-md">{label}</Text>
    </TouchableOpacity>
  );
}
