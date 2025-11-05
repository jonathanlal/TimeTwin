import React from 'react';
import { View, ActivityIndicator, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@timetwin/theme';
import { Text } from './Text';

export interface LoadingProps extends ViewProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'large', text, fullScreen = false, style, ...props }: LoadingProps) {
  const { theme } = useTheme();

  return (
    <View
      {...props}
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? theme.colors.background : 'transparent' },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {text && (
        <Text variant="body" color="secondary" style={{ marginTop: theme.spacing[3] }}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
