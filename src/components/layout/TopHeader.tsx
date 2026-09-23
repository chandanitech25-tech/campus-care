import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { router } from 'expo-router';

export interface TopHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { user, role } = useAuth();
  const { unreadCount } = useNotifications();
  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      <View style={styles.left}>
        {showBack ? (
          <>
            <TouchableOpacity
              onPress={onBack || (() => router.back())}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={20} color={THEME.colors.text} />
            </TouchableOpacity>
            <View style={styles.titleWrap}>
              <Text style={[styles.title, isMobile && styles.titleMobile]} numberOfLines={1}>
                {title}
              </Text>
              {!isMobile && subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </>
        ) : isMobile ? (
          <TouchableOpacity
            style={styles.mobileBrandRow}
            onPress={() => router.push('/dashboard' as any)}
            activeOpacity={0.8}
            accessibilityLabel="CampusCare Home"
          >
            <View style={styles.brandIconWrap}>
              <Ionicons name="shield-checkmark" size={17} color="#FFFFFF" />
            </View>
            <Text style={styles.brandText}>CampusCare</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      <View style={styles.right}>
        {/* Desktop rightAction only */}
        {!isMobile && rightAction}

        {/* Notifications Icon with Badge */}
        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          style={styles.iconBtn}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={22} color={THEME.colors.text} />
          {unreadCount > 0 && (
            <View style={styles.badgeDot}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Avatar / Profile */}
        <TouchableOpacity
          onPress={() => router.push('/profile' as any)}
          style={isMobile ? styles.avatarBtnMobile : styles.userPill}
          accessibilityLabel="Profile & Settings"
          accessibilityRole="button"
        >
          <View style={styles.pillAvatar}>
            <Text style={styles.pillAvatarText}>{user?.name?.charAt(0) || 'C'}</Text>
          </View>
          {!isMobile && (
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>{role}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerMobile: {
    height: 52,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleWrap: {
    flex: 1,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  title: {
    fontSize: THEME.typography.size.lg,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  titleMobile: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  mobileBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: -0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: THEME.colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: THEME.typography.weight.bold,
  },
  avatarBtnMobile: {
    padding: 2,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 4,
    paddingRight: 8,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  pillAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: THEME.typography.weight.bold,
  },
  roleTag: {
    backgroundColor: THEME.colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
});
