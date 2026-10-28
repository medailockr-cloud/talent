import { ShowStageIcon } from '../../components/ui/ShowStageIcon';
import { Tabs, usePathname } from 'expo-router';
import { Home, PlaySquare, PlusSquare, User } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useThemeStore } from '../../store/themeStore';
import { Image, View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const { isTabBarHidden } = useUIStore();
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isWeb = Platform.OS === 'web';
  const bottomInset = isWeb 
    ? (insets.bottom > 0 ? insets.bottom : 6)
    : Platform.OS === 'ios' 
      ? Math.max(insets.bottom, 24) 
      : Math.max(insets.bottom, 10);

  const tabHeight = isWeb
    ? 68 + (insets.bottom > 0 ? insets.bottom : 0)
    : Platform.OS === 'ios'
      ? 56 + bottomInset
      : 60 + bottomInset;

  const defaultTabBarStyle = {
    backgroundColor: theme.tabBg,
    borderTopColor: theme.tabBorder,
    borderTopWidth: isWeb ? 1 : 0,
    elevation: 0,
    shadowOpacity: 0,
    height: tabHeight,
    paddingTop: 4,
    paddingBottom: bottomInset,
  };

  const isCreateRoute = pathname ? pathname.includes('create') : false;
  const hideTabBar = (isTabBarHidden && isCreateRoute) || (isWeb && (!!pathname?.includes('flips') || !!pathname?.includes('shows')));
  const isFlipsRoute = pathname ? pathname.includes('flips') : false;
  const statusBarStyle = isFlipsRoute ? 'light' : (theme.isDark ? 'light' : 'dark');

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarStyle: hideTabBar ? { display: 'none' } : defaultTabBarStyle,
        tabBarLabel: ({ color, children }) => (
          <Text
            style={{
              color: String(color),
              fontSize: 10,
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: 14,
              paddingTop: 1,
            }}>
            {children}
          </Text>
        ),
        tabBarIconStyle: {
          height: 24,
          width: 24,
          marginBottom: 1,
        },
        tabBarItemStyle: {
          outline: 'none',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        } as any,
        tabBarActiveTintColor: theme.tabActiveTint,
        tabBarInactiveTintColor: theme.tabInactiveTint,
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
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <PlusSquare color={color} size={22} />,
          tabBarStyle: hideTabBar ? { display: 'none' } : defaultTabBarStyle,
        }}
      />
      <Tabs.Screen
        name="shows"
        options={{
          title: 'Shows',
          tabBarIcon: ({ color }) => <ShowStageIcon color={color} size={23} />,
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
    </>
  );
}

