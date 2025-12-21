import { View } from 'react-native';

// This is a dummy component because the tab is handled via listeners in _layout.tsx
// to redirect to the home screen with auto-capture action.
// We need this file to exist so Expo Router can register the route name 'capture_action'
export default function CaptureActionScreen() {
  return <View />;
}
