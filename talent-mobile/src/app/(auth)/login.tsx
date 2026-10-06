import React from 'react';
import { AuthView } from '../../components/views/AuthView';
import { useAuthStore } from '../../store/authStore';
import { router } from 'expo-router';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  return (
    <AuthView 
      onAuthSuccess={async (token, user) => {
        await login(token, user);
        router.replace('/');
      }} 
    />
  );
}
