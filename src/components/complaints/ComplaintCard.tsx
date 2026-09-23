import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Complaint } from '../../types/complaint';
import { COMPLAINT_CATEGORIES } from '../../constants/categories';
import { THEME } from '../../constants/theme';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { SlaBadge } from './SlaBadge';
import { Ionicons } from '@expo/vector-icons';
import { formatTimeAgo } from '../../utils/date';
import { router } from 'expo-router';

export interface ComplaintCardProps {
  complaint: Complaint;
  onPress?: () => void;
  showAdminControls?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onPress,
}) => {
  const categoryConfig = COMPLAINT_CATEGORIES[complaint.category];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/complaints/${complaint.id}` as any);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`Complaint #${complaint.ticketNumber}: ${complaint.title}`}
    >
      {/* Top row: Ticket # + Category + Time */}
      <View style={styles.topRow}>
        <View style={styles.ticketGroup}>
          <Text style={styles.ticketNumber}>#{complaint.ticketNumber}</Text>
          {categoryConfig && (
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: categoryConfig.bgColor, borderColor: categoryConfig.color },
              ]}
            >
              <Ionicons
                name={categoryConfig.icon as any}
                size={12}
                color={categoryConfig.color}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                {categoryConfig.label}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(complaint.createdAt)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {complaint.title}
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {complaint.description}
      </Text>

      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color={THEME.colors.textMuted} />
        <Text style={styles.locationText} numberOfLines={1}>
          {complaint.location.building} • {complaint.location.floor} ({complaint.location.roomArea})
        </Text>
      </View>

      {/* Badges footer */}
      <View style={styles.footerRow}>
        <View style={styles.badgeGroup}>
          <StatusBadge status={complaint.status} size="sm" showIcon />
          <PriorityBadge priority={complaint.priority} size="sm" />
          <SlaBadge
            createdAt={complaint.createdAt}
            priority={complaint.priority}
            status={complaint.status}
            resolvedAt={complaint.resolvedAt}
            size="sm"
          />
        </View>

        {complaint.followersCount > 1 && (
          <View style={styles.followersBadge}>
            <Ionicons name="people-outline" size={12} color={THEME.colors.textMuted} />
            <Text style={styles.followersText}>{complaint.followersCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.sm,
    ...Platform.select({
      web: {
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketNumber: {
    fontSize: THEME.typography.size.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.medium,
  },
  timeAgo: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textLight,
  },
  title: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 10,
    marginTop: 2,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  followersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  followersText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
});
