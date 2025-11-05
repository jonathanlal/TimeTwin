import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Container, Text, Input, Button } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { signUp } from '@timetwin/api-sdk';

export default function SignupScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (username && username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { error } = await signUp({
        email,
        password,
        username: username || undefined,
        timezone,
      });

      if (error) {
        Alert.alert('Signup Failed', error.message);
        return;
      }

      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container padding={0}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: theme.spacing[6] }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { marginBottom: theme.spacing[6] }]}>
            <Text variant="h2" align="center" style={{ marginBottom: theme.spacing[2] }}>
              Create Account
            </Text>
            <Text variant="body" color="secondary" align="center">
              Join TimeTwin and start tracking
            </Text>
          </View>

          <View style={[styles.form, { gap: theme.spacing[4] }]}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Input
              label="Username (optional)"
              placeholder="johndoe"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors({ ...errors, username: undefined });
              }}
              error={errors.username}
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="newPassword"
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: undefined });
              }}
              error={errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="newPassword"
            />

            <Button
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              fullWidth
              style={{ marginTop: theme.spacing[2] }}
            >
              Create Account
            </Button>

            <Button
              variant="ghost"
              onPress={() => router.back()}
              disabled={loading}
              fullWidth
            >
              Already have an account? Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
});
