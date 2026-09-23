import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard' as any);
      } else {
        router.replace('/login' as any);
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="shield-checkmark" size={42} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>CampusCare</Text>
      <Text style={styles.subtitle}>Campus Issue & Complaint Management</Text>
      <ActivityIndicator size="large" color={THEME.colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.md,
  },
  title: {
    fontSize: THEME.typography.size.display,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: THEME.typography.size.md,
    color: THEME.colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  spinner: {
    marginTop: THEME.spacing.xxxl,
  },
});
