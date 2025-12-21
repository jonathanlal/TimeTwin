import { Redirect } from 'expo-router';

export default function CaptureRedirect() {
  console.log('Redirecting to capture...');
  return <Redirect href="/(tabs)/index?action=capture" />;
}
