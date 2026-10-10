import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { api } from '../../utils/api';

export function AuthView({ onAuthSuccess }: { onAuthSuccess: (token: string, user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin) {
      if (username.length < 3) {
        setError('Username must be at least 3 characters long');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError('Password must contain at least one lowercase letter');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number');
        return;
      }
    }
    
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { username, password }
        : { username, password, name };

      const res = await api.post(endpoint, body);
      const data = res.data;
      
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#050608] justify-center px-8"
    >
      <View className="mb-10 items-center">
        <View className="flex-row items-baseline mb-4">
          <Text className="font-bold text-[44px] tracking-[-0.02em] text-white leading-none">talent</Text>
          <Text className="font-bold text-[44px] text-[#E91E76] leading-none ml-[0.5px]">.</Text>
        </View>
        <Text className="text-[#9CA3AF] text-center">
          {isLogin ? 'Welcome back! Sign in to continue.' : 'Join the community of talented creators.'}
        </Text>
      </View>

      <View className="space-y-4">
        {!isLogin && (
          <View>
            <Text className="text-white font-medium mb-1.5 ml-1">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jane Doe"
              placeholderTextColor="#4B5563"
              className="w-full bg-[#1A1D24] text-white px-5 py-4 rounded-2xl border border-white/5"
            />
          </View>
        )}

        <View>
          <Text className="text-white font-medium mb-1.5 ml-1">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="e.g. janedoe"
            placeholderTextColor="#4B5563"
            className="w-full bg-[#1A1D24] text-white px-5 py-4 rounded-2xl border border-white/5"
          />
        </View>

        <View>
          <Text className="text-white font-medium mb-1.5 ml-1">Password</Text>
          <View className="flex-row items-center w-full bg-[#1A1D24] rounded-2xl border border-white/5 pr-4">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              className="flex-1 text-white px-5 py-4"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <Text className="text-red-500 text-sm mt-2 text-center">{error}</Text>
        ) : null}

        <TouchableOpacity 
          className="w-full bg-[#E91E76] py-4 rounded-2xl mt-4 items-center justify-center flex-row"
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSubmit();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-6 p-2 items-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          <Text className="text-[#9CA3AF]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text className="text-[#E91E76] font-semibold">
              {isLogin ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
