import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@timetwin/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  leftElement,
  rightElement,
  containerStyle,
  fullWidth = false,
  style,
  editable = true,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.borderFocus;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
              marginBottom: theme.spacing[1],
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            borderWidth: theme.borderWidth[2],
            borderRadius: theme.borderRadius.md,
            backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceSecondary,
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
          },
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}

        <TextInput
          {...props}
          editable={editable}
          style={[
            styles.input,
            {
              color: editable ? theme.colors.text : theme.colors.textDisabled,
              fontSize: theme.fontSizes.base,
              fontWeight: theme.fontWeights.normal,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />

        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            {
              color: error ? theme.colors.error : theme.colors.textSecondary,
              fontSize: theme.fontSizes.xs,
              marginTop: theme.spacing[1],
            },
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fullWidth: {
    flex: 1,
  },
  label: {
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 24,
  },
  leftElement: {
    marginRight: 8,
  },
  rightElement: {
    marginLeft: 8,
  },
  helperText: {
    textAlign: 'left',
  },
});
