import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { TopHeader } from '../../components/layout/TopHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { THEME } from '../../constants/theme';
import { complaintService } from '../../services/complaintService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { UserRole } from '../../types/user';

export default function ProfileScreen() {
  const { user, role, switchRole, logout, updateProfile } = useAuth();
  const { refreshComplaints } = useComplaints();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    Alert.alert(
      'Reset Demo Data',
      'This will restore all complaints, notifications, and feedback to the original realistic seed data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await complaintService.resetToDemoData();
            await refreshComplaints();
            Alert.alert('Reset Complete', 'Demo data has been restored.');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;

  return (
    <View style={styles.container}>
      <TopHeader title="Profile & Account Settings" subtitle="Manage your campus credentials and active role" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userNameText}>{user?.name}</Text>
              <Text style={styles.userEmailText}>{user?.email}</Text>
              <View style={styles.rolePill}>
                <Ionicons name="shield-checkmark" size={12} color={THEME.colors.primary} />
                <Text style={styles.rolePillText}>Active Role: {role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Role Switcher Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Switch Active Role</Text>
          <Text style={styles.cardSubtitle}>
            Toggle between student, faculty, and administrator perspectives to test access permissions.
          </Text>

          <View style={styles.roleGrid}>
            {(['STUDENT', 'FACULTY', 'ADMIN'] as const).map((r) => {
              const isSelected = role === r;
              let iconName: any = 'school-outline';
              let desc = 'File complaints, upload evidence, track progress, and provide feedback.';
              if (r === 'FACULTY') {
                iconName = 'briefcase-outline';
                desc = 'Report classroom & department issues, view announcements, and give feedback.';
              } else if (r === 'ADMIN') {
                iconName = 'shield-checkmark-outline';
                desc = 'Assign departments, monitor SLAs, update lifecycle, view analytics & feedback.';
              }

              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => switchRole(r)}
                  style={[styles.roleOption, isSelected && styles.roleOptionActive]}
                >
                  <View style={styles.roleTopRow}>
                    <Ionicons
                      name={iconName}
                      size={20}
                      color={isSelected ? THEME.colors.primary : THEME.colors.textMuted}
                    />
                    <Text style={[styles.roleLabel, isSelected && styles.roleLabelActive]}>
                      {r === 'STUDENT' ? 'Student' : r === 'FACULTY' ? 'Faculty' : 'Administrator'}
                    </Text>
                    {isSelected && (
                      <View style={styles.activeCheck}>
                        <Ionicons name="checkmark-circle" size={18} color={THEME.colors.primary} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.roleDesc}>{desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Edit Details Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <Text style={styles.cardSubtitle}>Update your contact profile</Text>

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            leftIcon="person-outline"
          />

          <Input
            label="Contact Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +1 (555) 000-0000"
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />

          {user?.studentId && (
            <Input
              label="Student Identification Number"
              value={user.studentId}
              onChangeText={() => {}}
              editable={false}
              leftIcon="id-card-outline"
            />
          )}

          {user?.department && (
            <Input
              label="Department"
              value={user.department}
              onChangeText={() => {}}
              editable={false}
              leftIcon="business-outline"
            />
          )}

          {savedSuccess && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={16} color={THEME.colors.accent} />
              <Text style={styles.successText}>Profile updated successfully.</Text>
            </View>
          )}

          <Button
            title="Save Changes"
            variant="primary"
            loading={isSaving}
            onPress={handleSaveProfile}
            style={{ alignSelf: 'flex-start', marginTop: 6 }}
          />
        </View>

        {/* About CampusCare Product Identity Card */}
        <View style={styles.card}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutLogoCircle}>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutTitle}>CampusCare</Text>
              <Text style={styles.aboutSubtitle}>
                Campus Issue & Complaint Management Platform
              </Text>
            </View>
          </View>

          <View style={styles.aboutDivider} />

          <View style={styles.aboutMetaList}>
            <View style={styles.aboutMetaRow}>
              <Text style={styles.aboutMetaKey}>Creator / Owner</Text>
              <Text style={styles.aboutMetaVal}>Chandani Chaurasiya</Text>
            </View>
            <View style={styles.aboutMetaRow}>
              <Text style={styles.aboutMetaKey}>Version</Text>
              <Text style={styles.aboutMetaVal}>v1.0.0 (Production Release)</Text>
            </View>
            <View style={styles.aboutMetaRow}>
              <Text style={styles.aboutMetaKey}>Technology Stack</Text>
              <Text style={styles.aboutMetaVal}>Expo SDK 57 • React Native Web • TypeScript</Text>
            </View>
            <View style={styles.aboutMetaRow}>
              <Text style={styles.aboutMetaKey}>Navigation</Text>
              <Text style={styles.aboutMetaVal}>Expo Router (File-based Routing)</Text>
            </View>
            <View style={styles.aboutMetaRow}>
              <Text style={styles.aboutMetaKey}>SLA Engine</Text>
              <Text style={styles.aboutMetaVal}>4-Tier Priority Matrix (Critical 4h to Low 72h)</Text>
            </View>
          </View>
        </View>

        {/* System & Demo Controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Demo & System Controls</Text>
          <Text style={styles.cardSubtitle}>Developer and presentation testing tools</Text>

          <View style={styles.controlRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>Restore Demo Dataset</Text>
              <Text style={styles.controlDesc}>
                Reset all complaints, notifications, and feedback to initial sample data.
              </Text>
            </View>
            <Button
              title="Reset Data"
              variant="outline"
              size="sm"
              icon="refresh-outline"
              onPress={handleResetData}
            />
          </View>

          <View style={[styles.controlRow, { borderTopWidth: 1, borderTopColor: THEME.colors.border, paddingTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>Sign Out</Text>
              <Text style={styles.controlDesc}>Log out of your current session on this device.</Text>
            </View>
            <Button
              title="Sign Out"
              variant="danger"
              size="sm"
              icon="log-out-outline"
              onPress={handleLogout}
            />
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
    gap: THEME.spacing.lg,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    ...THEME.shadows.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.primaryBorder,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
  userNameText: {
    fontSize: THEME.typography.size.lg,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  userEmailText: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  rolePillText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  cardTitle: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  cardSubtitle: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  roleGrid: {
    gap: 10,
  },
  roleOption: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
  },
  roleOptionActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  roleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
    flex: 1,
  },
  roleLabelActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  activeCheck: {
    marginLeft: 'auto',
  },
  roleDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accentLight,
    padding: 8,
    borderRadius: THEME.radius.sm,
    gap: 6,
    marginBottom: 10,
  },
  successText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.accent,
    fontWeight: THEME.typography.weight.semibold,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  controlTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  controlDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  aboutLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutTitle: {
    fontSize: THEME.typography.size.lg,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  aboutSubtitle: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 14,
  },
  aboutMetaList: {
    gap: 8,
  },
  aboutMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  aboutMetaKey: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  aboutMetaVal: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
    fontWeight: THEME.typography.weight.semibold,
  },
});
