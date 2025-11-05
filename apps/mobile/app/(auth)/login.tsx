import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Container, Text, Input, Button } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { signIn } from '@timetwin/api-sdk';

export default function LoginScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signIn({ email, password });

      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      // Navigation to main app is handled by auth state change
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Login error:', error);
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
          <View style={[styles.header, { marginBottom: theme.spacing[8] }]}>
            <Text variant="h1" align="center" style={{ marginBottom: theme.spacing[2] }}>
              TimeTwin
            </Text>
            <Text variant="body" color="secondary" align="center">
              Track your time, compete with others
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
              textContentType="password"
            />

            <Button
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              fullWidth
              style={{ marginTop: theme.spacing[2] }}
            >
              Sign In
            </Button>

            <Button
              variant="ghost"
              onPress={() => router.push('/(auth)/signup')}
              disabled={loading}
              fullWidth
            >
              Don't have an account? Sign Up
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
