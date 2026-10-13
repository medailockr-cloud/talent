import { Tabs } from 'expo-router';
import { Home, PlaySquare, PlusSquare, Ticket, User } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Image, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const isWeb = Platform.OS === 'web';
  const bottomInset = isWeb 
    ? (insets.bottom > 0 ? insets.bottom : 6)
    : Platform.OS === 'ios' 
      ? Math.max(insets.bottom, 24) 
      : Math.max(insets.bottom, 8);

  const tabHeight = isWeb
    ? 64 + (insets.bottom > 0 ? insets.bottom : 0)
    : Platform.OS === 'ios'
      ? 54 + bottomInset
      : 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#222222',
          height: tabHeight,
          paddingTop: isWeb ? 4 : 6,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1,
          lineHeight: 12,
        },
        tabBarIconStyle: {
          marginTop: 1,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#888888',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="flips"
        options={{
          title: 'Flips',
          tabBarIcon: ({ color }) => <PlaySquare color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <PlusSquare color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="shows"
        options={{
          title: 'Shows',
          tabBarIcon: ({ color }) => <Ticket color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => (
            user?.avatarUrl ? (
              <View style={{ width: 22, height: 22, borderRadius: 11, overflow: 'hidden', borderWidth: 1, borderColor: color }}>
                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
              </View>
            ) : (
              <User color={color} size={22} />
            )
          ),
        }}
      />
    </Tabs>
  );
}

