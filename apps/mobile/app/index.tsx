import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Loading } from '@timetwin/ui';

/**
 * Root index - redirects to auth or main app based on auth state
 */
export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // TEMPORARY: Bypass auth for development/testing
  // return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
