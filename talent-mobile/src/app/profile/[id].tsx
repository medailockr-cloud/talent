import { useLocalSearchParams, useRouter } from 'expo-router';
import { ProfileView } from '../../components/views/ProfileView';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ProfileView 
      user={{ id: id as string }} 
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }} 
    />
  );
}
