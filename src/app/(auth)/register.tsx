import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { UserRole } from '../../types/user';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid campus email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        role,
        studentId: role === 'STUDENT' ? studentId.trim() || 'STU-2024-9999' : undefined,
        department: department.trim() || (role === 'FACULTY' ? 'General Faculty' : 'General Student'),
      });
      router.replace('/dashboard' as any);
    } catch (e: any) {
      setError(e.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
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

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CampusCare to report and track issues</Text>
          </View>

          {/* Role selector */}
          <View style={styles.roleSelector}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleTabs}>
              <TouchableOpacity
                onPress={() => setRole('STUDENT')}
                style={[styles.roleTab, role === 'STUDENT' && styles.roleTabActive]}
              >
                <Ionicons
                  name="school-outline"
                  size={16}
                  color={role === 'STUDENT' ? THEME.colors.primary : THEME.colors.textMuted}
                />
                <Text style={[styles.roleTabText, role === 'STUDENT' && styles.roleTabTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole('FACULTY')}
                style={[styles.roleTab, role === 'FACULTY' && styles.roleTabActive]}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={16}
                  color={role === 'FACULTY' ? THEME.colors.primary : THEME.colors.textMuted}
                />
                <Text style={[styles.roleTabText, role === 'FACULTY' && styles.roleTabTextActive]}>
                  Faculty
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jordan Miller"
              leftIcon="person-outline"
              required
            />

            <Input
              label="Campus Email"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. j.miller@campuscare.edu"
              leftIcon="mail-outline"
              keyboardType="email-address"
              required
            />

            {role === 'STUDENT' ? (
              <Input
                label="Student ID (Optional)"
                value={studentId}
                onChangeText={setStudentId}
                placeholder="e.g. STU-2024-1029"
                leftIcon="id-card-outline"
              />
            ) : (
              <Input
                label="Academic Department"
                value={department}
                onChangeText={setDepartment}
                placeholder="e.g. Computer Science"
                leftIcon="business-outline"
              />
            )}

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a secure password"
              secureTextEntry
              leftIcon="lock-closed-outline"
              required
            />

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={THEME.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              style={styles.submitBtn}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login' as any)}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.brandingFooter}>
          <Text style={styles.brandingText}>CampusCare • Created by Chandani Chaurasiya</Text>
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
    maxWidth: 460,
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
    marginTop: 4,
  },
  roleSelector: {
    marginBottom: THEME.spacing.lg,
  },
  roleLabel: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.medium,
    color: THEME.colors.text,
    marginBottom: 6,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 4,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
    ...THEME.shadows.sm,
  },
  roleTabText: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  roleTabTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  form: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.dangerLight,
    padding: 10,
    borderRadius: THEME.radius.md,
    marginBottom: THEME.spacing.md,
    gap: 6,
  },
  errorText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.danger,
    flex: 1,
  },
  submitBtn: {
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
  },
  loginLink: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  brandingFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
});
