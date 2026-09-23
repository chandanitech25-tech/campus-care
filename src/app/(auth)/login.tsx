import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { UserRole } from '../../types/user';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleDemoSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError(null);
    if (selectedRole === 'ADMIN') {
      setEmail('jordan.lee@admin.campuscare.edu');
      setPassword('DemoAdmin@2024');
    } else if (selectedRole === 'FACULTY') {
      setEmail('elena.vasquez@faculty.campuscare.edu');
      setPassword('DemoFaculty@2024');
    } else {
      setEmail('chandani.chaurasiya.sot25@gmail.com');
      setPassword('Chandani@25');
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError('Please enter your campus email.');
      return;
    }

    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(role, trimmedEmail, trimmedPassword);
      router.replace('/dashboard' as any);
    } catch (e: any) {
      setError(e.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authCard}>
          {/* Logo & Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Welcome to CampusCare</Text>
            <Text style={styles.subtitle}>
              Campus Issue & Operations Management Platform
            </Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.form}>
            <Input
              label="Campus Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              placeholder="Enter your campus email"
              leftIcon="mail-outline"
              keyboardType="email-address"
              required
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              placeholder="Enter your password"
              secureTextEntry
              leftIcon="lock-closed-outline"
              required
            />

            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={() => router.push('/forgot-password' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={THEME.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Prominent Login CTA */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              variant="primary"
              style={styles.submitBtn}
            />

            {/* Subtle Demo Role Access */}
            <View style={styles.demoSection}>
              <Text style={styles.demoSectionLabel}>QUICK DEMO ROLES</Text>
              <View style={styles.demoButtonGroup}>
                <TouchableOpacity
                  onPress={() => handleRoleDemoSelect('STUDENT')}
                  style={[styles.demoBtn, role === 'STUDENT' && styles.demoBtnActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="school-outline"
                    size={14}
                    color={role === 'STUDENT' ? THEME.colors.primary : THEME.colors.textMuted}
                  />
                  <Text style={[styles.demoBtnText, role === 'STUDENT' && styles.demoBtnTextActive]}>
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRoleDemoSelect('FACULTY')}
                  style={[styles.demoBtn, role === 'FACULTY' && styles.demoBtnActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={14}
                    color={role === 'FACULTY' ? THEME.colors.primary : THEME.colors.textMuted}
                  />
                  <Text style={[styles.demoBtnText, role === 'FACULTY' && styles.demoBtnTextActive]}>
                    Faculty
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRoleDemoSelect('ADMIN')}
                  style={[styles.demoBtn, role === 'ADMIN' && styles.demoBtnActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color={role === 'ADMIN' ? THEME.colors.primary : THEME.colors.textMuted}
                  />
                  <Text style={[styles.demoBtnText, role === 'ADMIN' && styles.demoBtnTextActive]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register' as any)}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.brandingFooter}>
          <Text style={styles.brandingText}>CampusCare • Created by Chandani Chaurasiya</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Very light cool blue/gray
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: THEME.spacing.xl,
    ...THEME.shadows.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...THEME.shadows.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: THEME.typography.weight.bold,
    color: '#0F172A', // Dark Navy / Slate
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569', // Clear, readable slate
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: THEME.spacing.md,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.semibold,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: THEME.radius.md,
    marginBottom: THEME.spacing.md,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: THEME.typography.weight.medium,
    flex: 1,
    lineHeight: 16,
  },
  submitBtn: {
    marginTop: 4,
    marginBottom: THEME.spacing.lg,
    minHeight: 48,
    backgroundColor: THEME.colors.primary,
  },
  demoSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: THEME.radius.md,
    padding: 10,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoSectionLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weight.bold,
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  demoBtnActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  demoBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: THEME.typography.weight.medium,
  },
  demoBtnTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  registerPrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  brandingFooter: {
    marginTop: 24,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: THEME.typography.weight.medium,
  },
});
