import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DuplicateMatch } from '../../utils/similarity';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { router } from 'expo-router';

export interface DuplicateWarningModalProps {
  visible: boolean;
  matches: DuplicateMatch[];
  onProceedAnyway: () => void;
  onFollowExisting: (complaintId: string) => void;
  onClose: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  visible,
  matches,
  onProceedAnyway,
  onFollowExisting,
  onClose,
}) => {
  if (matches.length === 0) return null;
  const topMatch = matches[0];

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Similar Complaint Already Exists"
      subtitle="We detected an unresolved issue reported at this location."
      maxWidth={580}
    >
      <View style={styles.container}>
        <View style={styles.alertBanner}>
          <Ionicons name="alert-circle" size={22} color={THEME.colors.warning} style={styles.alertIcon} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Potential Duplicate Found ({topMatch.score}% match)</Text>
            <Text style={styles.alertText}>
              Submitting a duplicate might delay resolution. You can follow the existing ticket to receive updates when it is resolved.
            </Text>
          </View>
        </View>

        <ScrollView style={styles.matchList} showsVerticalScrollIndicator={false}>
          {matches.slice(0, 3).map((match) => (
            <View key={match.complaint.id} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.ticketNum}>#{match.complaint.ticketNumber}</Text>
                <View style={styles.badgeRow}>
                  <StatusBadge status={match.complaint.status} size="sm" />
                  <PriorityBadge priority={match.complaint.priority} size="sm" />
                </View>
              </View>

              <Text style={styles.matchTitle}>{match.complaint.title}</Text>
              <Text style={styles.matchDesc} numberOfLines={2}>
                {match.complaint.description}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={THEME.colors.textMuted} />
                <Text style={styles.locationText}>
                  {match.complaint.location.building} • {match.complaint.location.roomArea}
                </Text>
              </View>

              {/* Reasons */}
              <View style={styles.reasonsBox}>
                <Text style={styles.reasonsTitle}>Match reasons:</Text>
                {match.reasons.map((r, i) => (
                  <Text key={i} style={styles.reasonItem}>
                    • {r}
                  </Text>
                ))}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    router.push(`/complaints/${match.complaint.id}` as any);
                  }}
                  style={styles.viewLink}
                >
                  <Ionicons name="eye-outline" size={15} color={THEME.colors.primary} />
                  <Text style={styles.viewLinkText}>View Details</Text>
                </TouchableOpacity>

                <Button
                  title={`Follow Complaint (${match.complaint.followersCount})`}
                  variant="secondary"
                  size="sm"
                  icon="notifications-outline"
                  onPress={() => onFollowExisting(match.complaint.id)}
                />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.modalFooter}>
          <Button
            title="Continue Creating Anyway"
            variant="outline"
            onPress={onProceedAnyway}
            style={styles.footerBtn}
          />
          <Button
            title="Cancel"
            variant="secondary"
            onPress={onClose}
            style={styles.footerBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.warningLight,
    borderWidth: 1,
    borderColor: THEME.colors.warningBorder,
    borderRadius: THEME.radius.md,
    padding: 12,
    marginBottom: 14,
  },
  alertIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: '#92400E',
  },
  alertText: {
    fontSize: THEME.typography.size.xs,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  matchList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  matchCard: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
    marginBottom: 10,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketNum: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  matchTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginBottom: 2,
  },
  matchDesc: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    lineHeight: 16,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  reasonsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
  },
  reasonsTitle: {
    fontSize: 11,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.textMuted,
  },
  reasonItem: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewLinkText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.semibold,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
  },
  footerBtn: {
    minWidth: 140,
  },
});
