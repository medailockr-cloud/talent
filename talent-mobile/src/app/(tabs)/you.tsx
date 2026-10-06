import { ProfileView } from '../../components/views/ProfileView';
import { useAuthStore } from '../../store/authStore';

export default function YouScreen() {
  const { user, logout } = useAuthStore();
  return <ProfileView user={user} onLogout={logout} />;
}
