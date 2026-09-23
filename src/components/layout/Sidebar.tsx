import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { router, usePathname } from 'expo-router';

export const Sidebar: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  const isAdmin = role === 'ADMIN';

  const navItems = [
    { label: 'Dashboard', icon: 'grid-outline', route: '/dashboard' },
    {
      label: isAdmin ? 'All Complaints' : 'My Complaints',
      icon: 'file-tray-full-outline',
      route: '/complaints',
    },
    {
      label: 'Notifications',
      icon: 'notifications-outline',
      route: '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    ...(isAdmin
      ? [
          { label: 'Analytics', icon: 'bar-chart-outline', route: '/admin/analytics' },
          { label: 'SLA Monitoring', icon: 'time-outline', route: '/admin/sla' },
          { label: 'Departments', icon: 'business-outline', route: '/admin/departments' },
          { label: 'Users Directory', icon: 'people-outline', route: '/admin/users' },
          { label: 'Feedback Reviews', icon: 'star-outline', route: '/admin/feedback' },
        ]
      : []),
    { label: 'Profile & Settings', icon: 'person-outline', route: '/profile' },
  ];

  return (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.brandName}>CampusCare</Text>
          <Text style={styles.brandTagline}>Campus Operations</Text>
        </View>
      </View>

      {/* Quick Action: Report an Issue */}
      <View style={styles.quickActionWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/complaints/create' as any)}
          style={styles.reportButton}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.reportButtonText}>Report an Issue</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation items */}
      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.navSectionHeader}>MENU</Text>
        {navItems.map((item) => {
          const isActive =
            pathname === item.route ||
            (item.route !== '/dashboard' && pathname?.startsWith(item.route));

          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={isActive ? THEME.colors.primary : THEME.colors.textMuted}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {item.badge !== undefined && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Role quick switcher */}
        <View style={styles.roleSwitchSection}>
          <Text style={styles.navSectionHeader}>SWITCH ACTIVE ROLE</Text>
          <View style={styles.roleBtnGroup}>
            {(['STUDENT', 'FACULTY', 'ADMIN'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => switchRole(r)}
                style={[styles.roleSwitchBtn, role === r && styles.roleSwitchBtnActive]}
              >
                <Text
                  style={[styles.roleSwitchText, role === r && styles.roleSwitchTextActive]}
                >
                  {r === 'STUDENT' ? 'Student' : r === 'FACULTY' ? 'Faculty' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer / User Profile */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push('/profile' as any)}
          style={styles.userProfile}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <Text style={styles.userRole}>
              {role === 'ADMIN' ? 'Administrator' : role === 'FACULTY' ? 'Faculty' : 'Student'}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} accessibilityLabel="Logout">
            <Ionicons name="log-out-outline" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.brandingFooter}>
          <Text style={styles.brandingText}>CampusCare • by Chandani Chaurasiya</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: THEME.colors.surface,
    borderRightWidth: 1,
    borderRightColor: THEME.colors.border,
    height: '100%',
    flexDirection: 'column',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
    paddingBottom: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandName: {
    fontSize: THEME.typography.size.lg,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  quickActionWrap: {
    padding: THEME.spacing.md,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
  },
  navScroll: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
  },
  navSectionHeader: {
    fontSize: 11,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.textLight,
    letterSpacing: 0.8,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    marginBottom: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.12s ease',
      } as any,
    }),
  },
  navItemActive: {
    backgroundColor: THEME.colors.primaryLight,
  },
  navIcon: {
    marginRight: 10,
  },
  navLabel: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
    flex: 1,
  },
  navLabelActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  badge: {
    backgroundColor: THEME.colors.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: THEME.typography.weight.bold,
  },
  roleSwitchSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
  },
  roleBtnGroup: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 3,
    gap: 2,
    marginTop: 4,
  },
  roleSwitchBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
    alignItems: 'center',
  },
  roleSwitchBtnActive: {
    backgroundColor: '#FFFFFF',
    ...THEME.shadows.sm,
  },
  roleSwitchText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  roleSwitchTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    padding: THEME.spacing.md,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: THEME.colors.primary,
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  userRole: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  logoutBtn: {
    padding: 6,
  },
  brandingFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 10,
    color: THEME.colors.textLight,
    fontWeight: THEME.typography.weight.medium,
    letterSpacing: 0.2,
  },
});
