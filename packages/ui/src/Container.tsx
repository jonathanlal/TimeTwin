import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@timetwin/theme';

export interface ContainerProps extends ViewProps {
  padding?: keyof ReturnType<typeof useTheme>['theme']['spacing'];
  centered?: boolean;
  children: React.ReactNode;
}

export function Container({
  padding = 4,
  centered = false,
  children,
  style,
  ...props
}: ContainerProps) {
  const { theme } = useTheme();

  return (
    <View
      {...props}
      style={[
        styles.container,
        {
          padding: theme.spacing[padding],
          backgroundColor: theme.colors.background,
        },
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
