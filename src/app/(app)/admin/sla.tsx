import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useComplaints } from '../../../context/ComplaintContext';
import { TopHeader } from '../../../components/layout/TopHeader';
import { evaluateSla, SlaEvaluation } from '../../../services/slaService';
import { COMPLAINT_PRIORITIES, PRIORITY_LIST } from '../../../constants/priority';
import { StatusBadge } from '../../../components/complaints/StatusBadge';
import { PriorityBadge } from '../../../components/complaints/PriorityBadge';
import { THEME } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SlaMonitoringScreen() {
  const { complaints } = useComplaints();
  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;
  const [filterTab, setFilterTab] = useState<'ALL' | 'BREACHED' | 'AT_RISK' | 'ON_TRACK'>('ALL');

  // Compute SLA evaluation for all unresolved complaints
  const activeEvaluations = useMemo(() => {
    return complaints
      .filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED')
      .map((c) => {
        const sla = evaluateSla(c.createdAt, c.priority, c.status, c.resolvedAt);
        return {
          complaint: c,
          sla,
        };
      })
      .sort((a, b) => a.sla.remainingMs - b.sla.remainingMs); // Most urgent first
  }, [complaints]);

  const breachedCount = activeEvaluations.filter((item) => item.sla.isBreached).length;
  const atRiskCount = activeEvaluations.filter((item) => item.sla.status === 'APPROACHING_BREACH').length;
  const onTrackCount = activeEvaluations.filter((item) => item.sla.status === 'ON_TRACK').length;

  const displayedList = activeEvaluations.filter((item) => {
    if (filterTab === 'BREACHED') return item.sla.isBreached;
    if (filterTab === 'AT_RISK') return item.sla.status === 'APPROACHING_BREACH';
    if (filterTab === 'ON_TRACK') return item.sla.status === 'ON_TRACK';
    return true;
  });

  return (
    <View style={styles.container}>
      <TopHeader
        title="SLA Monitoring Board"
        subtitle="Live tracking of resolution deadlines and SLA compliance"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* SLA Config Tiers Banner */}
        <View style={styles.tiersGrid}>
          {PRIORITY_LIST.map((tier) => (
            <View key={tier.id} style={[styles.tierCard, { borderColor: tier.borderColor, backgroundColor: tier.bgColor }]}>
              <View style={styles.tierTopRow}>
                <Text style={[styles.tierLabel, { color: tier.badgeTextColor }]}>{tier.label}</Text>
                <View style={[styles.tierHoursBadge, { backgroundColor: tier.color }]}>
                  <Text style={styles.tierHoursText}>{tier.slaHours}h SLA</Text>
                </View>
              </View>
              <Text style={styles.tierDesc} numberOfLines={2}>
                {tier.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Status Summary Tabs */}
        <View style={styles.summaryBar}>
          <TouchableOpacity
            onPress={() => setFilterTab('ALL')}
            style={[styles.tabBtn, filterTab === 'ALL' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, filterTab === 'ALL' && styles.tabTextActive]}>
              All Active ({activeEvaluations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterTab('BREACHED')}
            style={[styles.tabBtn, filterTab === 'BREACHED' && styles.tabBtnActive]}
          >
            <View style={[styles.dot, { backgroundColor: THEME.colors.danger }]} />
            <Text style={[styles.tabText, filterTab === 'BREACHED' && styles.tabTextActive]}>
              Breached ({breachedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterTab('AT_RISK')}
            style={[styles.tabBtn, filterTab === 'AT_RISK' && styles.tabBtnActive]}
          >
            <View style={[styles.dot, { backgroundColor: THEME.colors.warning }]} />
            <Text style={[styles.tabText, filterTab === 'AT_RISK' && styles.tabTextActive]}>
              At Risk ({atRiskCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterTab('ON_TRACK')}
            style={[styles.tabBtn, filterTab === 'ON_TRACK' && styles.tabBtnActive]}
          >
            <View style={[styles.dot, { backgroundColor: THEME.colors.accent }]} />
            <Text style={[styles.tabText, filterTab === 'ON_TRACK' && styles.tabTextActive]}>
              On Track ({onTrackCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Urgent Ticket Queue */}
        <View style={styles.queueContainer}>
          <Text style={styles.queueHeader}>
            {filterTab === 'BREACHED'
              ? 'SLA Breached Tickets'
              : filterTab === 'AT_RISK'
              ? 'Tickets Approaching Breach Window'
              : filterTab === 'ON_TRACK'
              ? 'On-Track Active Tickets'
              : 'All Active Tickets by SLA Urgency'}
          </Text>

          {displayedList.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={THEME.colors.accent} />
              <Text style={styles.emptyTitle}>No SLA Violations</Text>
              <Text style={styles.emptyDesc}>No active tickets currently match this SLA filter.</Text>
            </View>
          ) : (
            displayedList.map(({ complaint, sla }) => (
              <TouchableOpacity
                key={complaint.id}
                activeOpacity={0.88}
                onPress={() => router.push(`/complaints/${complaint.id}` as any)}
                style={styles.slaTicketCard}
              >
                <View style={styles.ticketTop}>
                  <View style={styles.ticketIdRow}>
                    <Text style={styles.ticketNum}>#{complaint.ticketNumber}</Text>
                    <PriorityBadge priority={complaint.priority} size="sm" />
                    <StatusBadge status={complaint.status} size="sm" />
                  </View>

                  <View
                    style={[
                      styles.slaCountdownBadge,
                      { backgroundColor: sla.badgeBgColor, borderColor: sla.badgeColor },
                    ]}
                  >
                    <Ionicons
                      name={sla.isBreached ? 'alert-circle' : 'time-outline'}
                      size={14}
                      color={sla.badgeTextColor}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.slaCountdownText, { color: sla.badgeTextColor }]}>
                      {sla.badgeLabel}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ticketTitle}>{complaint.title}</Text>

                <View style={styles.ticketLocation}>
                  <Ionicons name="location-outline" size={13} color={THEME.colors.textMuted} />
                  <Text style={styles.locText}>
                    {complaint.location.building} • {complaint.location.roomArea}
                  </Text>
                </View>

                {/* Progress bar of SLA window */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(sla.percentageUsed, 100)}%`,
                          backgroundColor: sla.isBreached
                            ? THEME.colors.danger
                            : sla.status === 'APPROACHING_BREACH'
                            ? THEME.colors.warning
                            : THEME.colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPctText}>{sla.percentageUsed}% SLA used</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  },
  tiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tierCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    padding: 12,
    ...THEME.shadows.sm,
  },
  tierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierLabel: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
  },
  tierHoursBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tierHoursText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: THEME.typography.weight.bold,
  },
  tierDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 14,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    flexWrap: 'wrap',
    gap: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.primaryLight,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tabText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  tabTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  queueContainer: {
    gap: 10,
  },
  queueHeader: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  slaTicketCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    ...THEME.shadows.sm,
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketNum: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
  slaCountdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
  },
  slaCountdownText: {
    fontSize: 11,
    fontWeight: THEME.typography.weight.bold,
  },
  ticketTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginBottom: 6,
  },
  ticketLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressPctText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    width: 75,
    textAlign: 'right',
  },
  emptyWrap: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyTitle: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
