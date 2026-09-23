import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useComplaints } from '../../../context/ComplaintContext';
import { TopHeader } from '../../../components/layout/TopHeader';
import { StatCard } from '../../../components/analytics/StatCard';
import { ResponsiveBarChart } from '../../../components/analytics/ResponsiveBarChart';
import { ResponsiveDonutChart } from '../../../components/analytics/ResponsiveDonutChart';
import { computeAnalytics } from '../../../services/analyticsService';
import { THEME } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminAnalyticsScreen() {
  const { complaints } = useComplaints();
  const { width } = useWindowDimensions();
  const isDesktop = width >= THEME.breakpoints.tablet;
  const isMobile = width < THEME.breakpoints.tablet;

  const analytics = useMemo(() => computeAnalytics(complaints), [complaints]);

  const trendBarData = analytics.monthlyTrends.map((t) => ({
    label: t.month,
    value: t.submitted,
    secondaryValue: t.resolved,
  }));

  const categorySegments = analytics.categories.map((c) => ({
    label: c.label,
    count: c.count,
    color: c.color,
  }));

  const prioritySegments = analytics.priorities.map((p) => ({
    label: p.label,
    count: p.count,
    color: p.color,
  }));

  return (
    <View style={styles.container}>
      <TopHeader
        title="Campus Analytics & SLA Intelligence"
        subtitle="Performance metrics, resolution velocity, and operational trends"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Stat Cards Grid */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Complaints"
            value={analytics.totalComplaints}
            subtitle="Campus-wide logged issues"
            icon="albums-outline"
            color="#4F46E5"
            bgColor="#EEF2FF"
          />
          <StatCard
            title="Avg Resolution Time"
            value={`${analytics.avgResolutionHours}h`}
            subtitle="Target threshold: < 12h"
            icon="speedometer-outline"
            color="#10B981"
            bgColor="#ECFDF5"
          />
          <StatCard
            title="SLA Breached"
            value={analytics.slaBreachedCount}
            subtitle={analytics.slaBreachedCount > 0 ? 'Urgent dispatch required' : 'All tickets on track'}
            icon="alert-circle-outline"
            color={analytics.slaBreachedCount > 0 ? '#DC2626' : '#10B981'}
            bgColor={analytics.slaBreachedCount > 0 ? '#FEF2F2' : '#ECFDF5'}
          />
          <StatCard
            title="Resolution Rate"
            value={`${analytics.totalComplaints > 0 ? Math.round((analytics.resolvedComplaints / analytics.totalComplaints) * 100) : 0}%`}
            subtitle={`${analytics.resolvedComplaints} of ${analytics.totalComplaints} closed`}
            icon="ribbon-outline"
            color="#8B5CF6"
            bgColor="#F5F3FF"
          />
        </View>

        {/* Trends Chart Row */}
        <View style={styles.chartSection}>
          <ResponsiveBarChart
            title="Monthly Complaint Volume & Resolution Trends"
            subtitle="Comparison between new incoming complaints vs resolved tickets"
            data={trendBarData}
            primaryLabel="Submitted"
            secondaryLabel="Resolved"
          />
        </View>

        {/* 2-Column Row for Category & Priority Breakdown */}
        <View style={[styles.twoColRow, isDesktop && styles.twoColDesktop]}>
          <View style={[styles.chartCol, isDesktop && { flex: 1 }]}>
            <ResponsiveDonutChart
              title="Complaints by Category"
              subtitle="Distribution across campus facilities & services"
              segments={categorySegments}
            />
          </View>
          <View style={[styles.chartCol, isDesktop && { flex: 1 }]}>
            <ResponsiveDonutChart
              title="Complaints by Priority"
              subtitle="Severity levels and SLA allocation"
              segments={prioritySegments}
            />
          </View>
        </View>

        {/* Department Performance & SLA Compliance Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Department Workload & SLA Compliance</Text>
          <Text style={styles.tableSubtitle}>Current active load and SLA adherence by department</Text>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 3 }]}>DEPARTMENT</Text>
              <Text style={[styles.th, { flex: 2, textAlign: 'center' }]}>ACTIVE</Text>
              <Text style={[styles.th, { flex: 2, textAlign: 'center' }]}>RESOLVED</Text>
              <Text style={[styles.th, { flex: 2, textAlign: 'center' }]}>SLA BREACHES</Text>
            </View>

            {analytics.departments.map((dept) => (
              <View key={dept.departmentId} style={styles.tableRow}>
                <View style={[styles.tdCol, { flex: 3, flexDirection: 'row', alignItems: 'center' }]}>
                  <Ionicons name="business-outline" size={14} color={THEME.colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.deptNameText}>{dept.departmentName}</Text>
                </View>
                <Text style={[styles.tdText, styles.centerText, { flex: 2 }]}>{dept.count}</Text>
                <Text style={[styles.tdText, styles.centerText, { flex: 2, color: THEME.colors.accent, fontWeight: '700' }]}>
                  {dept.resolvedCount}
                </Text>
                <Text
                  style={[
                    styles.tdText,
                    styles.centerText,
                    {
                      flex: 2,
                      color: dept.slaBreachCount > 0 ? THEME.colors.danger : THEME.colors.textMuted,
                      fontWeight: dept.slaBreachCount > 0 ? '700' : '400',
                    },
                  ]}
                >
                  {dept.slaBreachCount}
                </Text>
              </View>
            ))}
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
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chartSection: {
    width: '100%',
  },
  twoColRow: {
    flexDirection: 'column',
    gap: THEME.spacing.lg,
  },
  twoColDesktop: {
    flexDirection: 'row',
  },
  chartCol: {
    width: '100%',
  },
  tableCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  tableTitle: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  tableSubtitle: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  table: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.sm,
  },
  th: {
    fontSize: 11,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    alignItems: 'center',
  },
  tdCol: {
    paddingVertical: 2,
  },
  tdText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
  },
  deptNameText: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  centerText: {
    textAlign: 'center',
  },
});
