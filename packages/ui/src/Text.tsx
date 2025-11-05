import React from 'react';
import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@timetwin/theme';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodySmall' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'error' | 'success';
  align?: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = 'primary',
  align = 'left',
  bold = false,
  style,
  children,
  ...props
}: TextProps) {
  const { theme } = useTheme();

  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return theme.colors.text;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'tertiary':
        return theme.colors.textTertiary;
      case 'disabled':
        return theme.colors.textDisabled;
      case 'inverse':
        return theme.colors.textInverse;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  const variantStyle = theme.textStyles[variant];

  return (
    <RNText
      {...props}
      style={[
        {
          ...variantStyle,
          color: getColorValue(),
          textAlign: align,
          fontWeight: bold ? theme.fontWeights.bold : variantStyle.fontWeight,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
