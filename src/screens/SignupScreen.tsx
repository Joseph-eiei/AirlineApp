import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../constants/colors';

interface SignupScreenProps {
  onSignup: (username: string, password: string) => Promise<void>;
  isLoading?: boolean;
  onBackToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignup,
  isLoading = false,
  onBackToLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      username.trim().length >= 3 &&
      password.length >= 6 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }, [username, password, confirmPassword]);

  const handleSubmit = async () => {
    if (!canSubmit || isLoading) {
      return;
    }

    try {
      setError(null);
      await onSignup(username.trim(), password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create account.';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle='dark-content' backgroundColor={colors.background} />
      <View style={styles.inner}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Only a username and password are required.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Choose a username"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Re-enter your password"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>

        {password !== confirmPassword && confirmPassword.length > 0 ? (
          <Text style={styles.helper}>Passwords must match.</Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || isLoading}
          style={[styles.primaryButton, (!canSubmit || isLoading) && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account?</Text>
          <TouchableOpacity onPress={onBackToLogin} accessibilityRole="button">
            <Text style={styles.switchAction}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    backgroundColor: '#F9F9F9',
  },
  helper: {
    color: colors.muted,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    color: colors.muted,
  },
  switchAction: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 6,
  },
  error: {
    color: '#D55C5A',
    marginTop: 8,
  },
});
