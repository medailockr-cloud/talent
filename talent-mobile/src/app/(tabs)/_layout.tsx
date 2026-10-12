import { Tabs } from 'expo-router';
import { Home, PlaySquare, PlusSquare, Ticket, User } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Image, View } from 'react-native';

export default function TabsLayout() {
  const { user } = useAuthStore();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#888888',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="flips"
        options={{
          title: 'Flips',
          tabBarIcon: ({ color }) => <PlaySquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <PlusSquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="shows"
        options={{
          title: 'Shows',
          tabBarIcon: ({ color }) => <Ticket color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => (
            user?.avatarUrl ? (
              <View style={{ width: 24, height: 24, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: color }}>
                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
              </View>
            ) : (
              <User color={color} size={24} />
            )
          ),
        }}
      />
    </Tabs>
  );
}
