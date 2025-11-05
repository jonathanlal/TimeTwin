import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@timetwin/theme';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.primaryDisabled : theme.colors.primary,
          borderColor: disabled ? theme.colors.primaryDisabled : theme.colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.primaryDisabled : theme.colors.secondary,
          borderColor: disabled ? theme.colors.primaryDisabled : theme.colors.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: disabled ? theme.colors.borderSecondary : theme.colors.border,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing[2],
          paddingHorizontal: theme.spacing[3],
        };
      case 'md':
        return {
          paddingVertical: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing[4],
          paddingHorizontal: theme.spacing[6],
        };
      default:
        return {};
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return variant === 'outline' || variant === 'ghost'
        ? theme.colors.textDisabled
        : theme.colors.textInverse;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.textInverse;
      case 'outline':
      case 'ghost':
        return theme.colors.text;
      default:
        return theme.colors.text;
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'sm':
        return theme.fontSizes.sm;
      case 'md':
        return theme.fontSizes.base;
      case 'lg':
        return theme.fontSizes.lg;
      default:
        return theme.fontSizes.base;
    }
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getTextSize(),
              fontWeight: theme.fontWeights.semibold,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
