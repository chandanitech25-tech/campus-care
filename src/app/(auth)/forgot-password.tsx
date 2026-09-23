import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid campus email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={THEME.colors.text} />
          </TouchableOpacity>

          {isSubmitted ? (
            <View style={styles.successState}>
              <View style={styles.successCircle}>
                <Ionicons name="mail-open-outline" size={36} color={THEME.colors.accent} />
              </View>
              <Text style={styles.title}>Check Your Inbox</Text>
              <Text style={styles.subtitle}>
                We've sent password reset instructions to:
              </Text>
              <Text style={styles.emailHighlight}>{email}</Text>
              <Button
                title="Back to Sign In"
                onPress={() => router.replace('/login' as any)}
                variant="primary"
                style={styles.backToLoginBtn}
              />
            </View>
          ) : (
            <View>
              <View style={styles.header}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your campus email to receive a password reset link.
                </Text>
              </View>

              <Input
                label="Campus Email"
                value={email}
                onChangeText={setEmail}
                placeholder="e.g. user@campuscare.edu"
                leftIcon="mail-outline"
                keyboardType="email-address"
                error={error}
                required
              />

              <Button
                title="Send Reset Instructions"
                onPress={handleReset}
                loading={isLoading}
                size="lg"
                style={styles.submitBtn}
              />

              <TouchableOpacity
                onPress={() => router.replace('/login' as any)}
                style={styles.cancelLink}
              >
                <Text style={styles.cancelText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xxl,
    ...THEME.shadows.md,
  },
  backBtn: {
    padding: 6,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignSelf: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  header: {
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.typography.size.heading,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  emailHighlight: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
    marginTop: 4,
    marginBottom: THEME.spacing.xl,
  },
  backToLoginBtn: {
    minWidth: 180,
  },
});
