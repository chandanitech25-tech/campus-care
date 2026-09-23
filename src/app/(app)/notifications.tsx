import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNotifications } from '../../context/NotificationContext';
import { TopHeader } from '../../components/layout/TopHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { THEME } from '../../constants/theme';
import { formatTimeAgo } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NotificationType } from '../../types/notification';

export default function NotificationsScreen() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'COMPLAINT_RESOLVED':
        return { name: 'checkmark-circle-outline' as const, color: THEME.colors.accent, bg: THEME.colors.accentLight };
      case 'SLA_BREACHED':
        return { name: 'alert-circle-outline' as const, color: THEME.colors.danger, bg: THEME.colors.dangerLight };
      case 'SLA_APPROACHING':
        return { name: 'warning-outline' as const, color: THEME.colors.warning, bg: THEME.colors.warningLight };
      case 'COMPLAINT_ASSIGNED':
        return { name: 'person-add-outline' as const, color: '#8B5CF6', bg: '#F5F3FF' };
      case 'STATUS_CHANGED':
        return { name: 'sync-outline' as const, color: THEME.colors.info, bg: THEME.colors.infoLight };
      case 'COMPLAINT_SUBMITTED':
      default:
        return { name: 'paper-plane-outline' as const, color: THEME.colors.primary, bg: THEME.colors.primaryLight };
    }
  };

  const handleNotificationPress = (notif: any) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    if (notif.complaintId) {
      router.push(`/complaints/${notif.complaintId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Notifications Center"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Toggle */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilterUnreadOnly(false)}
            style={[styles.filterTab, !filterUnreadOnly && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, !filterUnreadOnly && styles.filterTabTextActive]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterUnreadOnly(true)}
            style={[styles.filterTab, filterUnreadOnly && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filterUnreadOnly && styles.filterTabTextActive]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {displayedNotifications.length === 0 ? (
          <EmptyState
            title={filterUnreadOnly ? 'No Unread Notifications' : 'No Notifications'}
            description={
              filterUnreadOnly
                ? 'You have reviewed all current campus notifications.'
                : 'You have no notifications yet. You will receive updates when complaints change status.'
            }
            icon="notifications-off-outline"
          />
        ) : (
          <View style={styles.notifList}>
            {displayedNotifications.map((notif) => {
              const iconData = getNotifIcon(notif.type);
              return (
                <TouchableOpacity
                  key={notif.id}
                  activeOpacity={0.8}
                  onPress={() => handleNotificationPress(notif)}
                  style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                >
                  <View style={[styles.iconBox, { backgroundColor: iconData.bg }]}>
                    <Ionicons name={iconData.name} size={20} color={iconData.color} />
                  </View>

                  <View style={styles.notifBody}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                        {notif.title}
                      </Text>
                      <Text style={styles.notifTime}>{formatTimeAgo(notif.createdAt)}</Text>
                    </View>

                    <Text style={styles.notifMessage}>{notif.message}</Text>

                    {notif.complaintId && (
                      <View style={styles.viewLinkRow}>
                        <Text style={styles.viewLinkText}>View ticket details</Text>
                        <Ionicons name="arrow-forward" size={12} color={THEME.colors.primary} />
                      </View>
                    )}
                  </View>

                  {!notif.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.semibold,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterTabActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  filterTabText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  filterTabTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  notifList: {
    gap: 8,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    ...THEME.shadows.sm,
  },
  notifCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: THEME.colors.primaryBorder,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifBody: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  notifTitleUnread: {
    color: THEME.colors.text,
    fontWeight: THEME.typography.weight.bold,
  },
  notifTime: {
    fontSize: 11,
    color: THEME.colors.textLight,
  },
  notifMessage: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    lineHeight: 18,
  },
  viewLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  viewLinkText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.semibold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
});
