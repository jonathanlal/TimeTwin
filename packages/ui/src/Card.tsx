import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@timetwin/theme';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof ReturnType<typeof useTheme>['theme']['spacing'];
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  padding = 4,
  children,
  style,
  ...props
}: CardProps) {
  const { theme } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: theme.borderWidth[1],
          borderColor: theme.colors.border,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surfaceSecondary,
        };
      default:
        return {};
    }
  };

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[padding],
        },
        getVariantStyles(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
