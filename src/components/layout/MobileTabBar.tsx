import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const MobileTabBar: React.FC = () => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 6);

  const tabs = [
    { label: 'Home', icon: 'grid-outline', activeIcon: 'grid', route: '/dashboard' },
    {
      label: 'Complaints',
      icon: 'file-tray-full-outline',
      activeIcon: 'file-tray-full',
      route: '/complaints',
    },
    {
      label: 'Report',
      icon: 'add-circle',
      activeIcon: 'add-circle',
      route: '/complaints/create',
      isPrimary: true,
    },
    {
      label: 'Alerts',
      icon: 'notifications-outline',
      activeIcon: 'notifications',
      route: '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: isAdmin ? 'Admin' : 'Profile',
      icon: isAdmin ? 'shield-checkmark-outline' : 'person-outline',
      activeIcon: isAdmin ? 'shield-checkmark' : 'person',
      route: isAdmin ? '/admin/analytics' : '/profile',
    },
  ];

  return (
    <View style={[styles.tabBar, { height: 56 + bottomPadding, paddingBottom: bottomPadding }]}>
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.route ||
          (tab.route !== '/dashboard' && pathname?.startsWith(tab.route));

        if (tab.isPrimary) {
          return (
            <TouchableOpacity
              key={tab.route}
              onPress={() => router.push(tab.route as any)}
              style={styles.primaryTabItem}
              activeOpacity={0.8}
            >
              <View style={styles.primaryCircle}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.primaryLabel}>Report</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.route}
            onPress={() => router.push(tab.route as any)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isActive ? THEME.colors.primary : THEME.colors.textMuted}
              />
              {tab.badge !== undefined && (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 12 : 4,
    paddingTop: 4,
    ...THEME.shadows.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
    fontWeight: THEME.typography.weight.medium,
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: THEME.colors.danger,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: THEME.typography.weight.bold,
  },
  primaryTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -16,
  },
  primaryCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.md,
  },
  primaryLabel: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
    marginTop: 2,
  },
});
