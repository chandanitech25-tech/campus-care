import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { TopHeader } from '../../components/layout/TopHeader';
import { StatCard } from '../../components/analytics/StatCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ResponsiveDonutChart } from '../../components/analytics/ResponsiveDonutChart';
import { EmptyState } from '../../components/common/EmptyState';
import { THEME } from '../../constants/theme';
import { COMPLAINT_CATEGORIES } from '../../constants/categories';
import { COMPLAINT_STATUSES, STATUS_ORDER } from '../../constants/status';
import { formatTimeAgo } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user, role } = useAuth();
  const { complaints } = useComplaints();
  const { width } = useWindowDimensions();

  const isMobile = width < THEME.breakpoints.tablet;
  const isDesktop = width >= THEME.breakpoints.desktop;
  const isAdmin = role === 'ADMIN';

  // Filter complaints based on role
  const userComplaints = useMemo(() => {
    return complaints.filter((c) =>
      isAdmin
        ? true
        : c.createdBy.id === user?.id || (role === 'FACULTY' && !c.isAnonymous)
    );
  }, [complaints, isAdmin, user?.id, role]);

  // Compute core statistics
  const totalCount = userComplaints.length;
  const pendingCount = userComplaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  ).length;
  const inProgressCount = userComplaints.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = userComplaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;
  const criticalCount = userComplaints.filter((c) => c.priority === 'CRITICAL').length;

  // Impact metrics
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  const departmentsEngaged = useMemo(() => {
    return new Set(userComplaints.map((c) => c.assignedDepartmentId).filter(Boolean)).size;
  }, [userComplaints]);

  // Contextual critical issue
  const userCriticalIssue = userComplaints.find(
    (c) => c.priority === 'CRITICAL' && c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  // Category breakdown for donut chart
  const categorySegments = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    userComplaints.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    return Object.keys(categoryCounts)
      .map((catKey) => {
        const config = (COMPLAINT_CATEGORIES as any)[catKey];
        return {
          label: config?.label || catKey,
          count: categoryCounts[catKey],
          color: config?.color || THEME.colors.primary,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [userComplaints]);

  // Recent complaints
  const recentComplaints = userComplaints.slice(0, 4);

  // Recent Activity Feed: Extracted from actual complaint timeline events
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      complaintId: string;
      complaintTitle: string;
      ticketNumber: string;
      status: string;
      actorName: string;
      actorRole: string;
      comment?: string;
      timestamp: string;
    }> = [];

    userComplaints.forEach((c) => {
      c.timeline.forEach((tl) => {
        activities.push({
          id: tl.id,
          complaintId: c.id,
          complaintTitle: c.title,
          ticketNumber: c.ticketNumber,
          status: tl.status,
          actorName: tl.actorName,
          actorRole: tl.actorRole,
          comment: tl.comment,
          timestamp: tl.timestamp,
        });
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [userComplaints]);

  // Greeting name
  const displayName = user?.name ? user.name.split(' ')[0] : 'Chandani';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return { name: 'document-text-outline' as const, color: '#64748B' };
      case 'UNDER_REVIEW':
        return { name: 'search-outline' as const, color: '#2563EB' };
      case 'ASSIGNED':
        return { name: 'person-add-outline' as const, color: '#4338CA' };
      case 'IN_PROGRESS':
        return { name: 'construct-outline' as const, color: '#D97706' };
      case 'RESOLVED':
        return { name: 'checkmark-circle-outline' as const, color: '#0D9488' };
      case 'CLOSED':
        return { name: 'lock-closed-outline' as const, color: '#475569' };
      default:
        return { name: 'ellipse-outline' as const, color: THEME.colors.primary };
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title={isAdmin ? 'Admin Overview' : 'Dashboard'}
        subtitle="Operational overview and ticket management"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/complaints/create' as any)}
            style={styles.headerActionBtn}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.headerActionText}>New Issue</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: isMobile ? 16 : 24,
            paddingBottom: isMobile ? 88 : 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Dashboard Header & Greeting (Clean hierarchy, no duplicate welcome) */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.dashboardCategory}>
            {isAdmin ? 'ADMIN DASHBOARD' : 'CAMPUS DASHBOARD'}
          </Text>
          <View style={styles.greetingRow}>
            <Text style={[styles.welcomeTitle, isMobile && styles.welcomeTitleMobile]}>
              Hello, {displayName} 👋
            </Text>
            <View style={styles.roleTag}>
              <Ionicons
                name={role === 'ADMIN' ? 'shield-checkmark' : role === 'FACULTY' ? 'briefcase' : 'school'}
                size={12}
                color={THEME.colors.primary}
              />
              <Text style={styles.roleTagText}>
                {role === 'ADMIN' ? 'Admin' : role === 'FACULTY' ? 'Faculty' : 'Student'}
              </Text>
            </View>
          </View>
          <Text style={styles.welcomeSubtitle}>
            Here's what's happening on your campus today.
          </Text>
        </View>

        {/* 2. Contextual Critical Issue Card (Redesigned compact structure) */}
        {criticalCount > 0 && (
          <View style={styles.criticalCard}>
            <View style={styles.criticalTopRow}>
              <View style={styles.criticalBadge}>
                <Ionicons name="alert-circle" size={13} color="#DC2626" />
                <Text style={styles.criticalBadgeText}>Critical Issue</Text>
              </View>
              <Text style={styles.criticalSlaTag}>4h SLA Active</Text>
            </View>

            <Text style={styles.criticalTitle} numberOfLines={2}>
              {userCriticalIssue
                ? userCriticalIssue.title
                : `${criticalCount} Critical Issue${criticalCount > 1 ? 's' : ''} Requiring Attention`}
            </Text>

            <View style={styles.criticalFooter}>
              <View style={styles.criticalLocationRow}>
                <Ionicons name="location-outline" size={13} color="#B91C1C" />
                <Text style={styles.criticalLocationText} numberOfLines={1}>
                  {userCriticalIssue
                    ? `${userCriticalIssue.location.building} • ${userCriticalIssue.location.roomArea}`
                    : 'Campus Facilities • High Severity Hazard'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  userCriticalIssue
                    ? router.push(`/complaints/${userCriticalIssue.id}` as any)
                    : router.push('/complaints?priority=CRITICAL' as any)
                }
                style={styles.criticalViewBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.criticalViewBtnText}>View Issue</Text>
                <Ionicons name="arrow-forward" size={12} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. Primary "Report an Issue" Hero Card (Compact for mobile) */}
        {!isAdmin && (
          <View style={[styles.heroCard, isMobile && styles.heroCardMobile]}>
            <View style={styles.heroTextCol}>
              <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                Notice an issue on campus?
              </Text>
              <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                Report facilities, internet, sanitation, or safety concerns.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/complaints/create' as any)}
                style={styles.heroCta}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.heroCtaText}>+ Report an Issue</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroIconCol}>
              <Ionicons name="megaphone-outline" size={isMobile ? 44 : 60} color="rgba(255,255,255,0.22)" />
            </View>
          </View>
        )}

        {/* 4. Core Issue Statistics Cards (Compact 2-column grid on mobile) */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Issues"
            value={totalCount}
            icon="file-tray-full-outline"
            color="#4338CA"
            bgColor="#EEF2FF"
            style={isMobile ? styles.statCardHalf : undefined}
          />
          <StatCard
            title="Pending Review"
            value={pendingCount}
            icon="hourglass-outline"
            color="#2563EB"
            bgColor="#EFF6FF"
            style={isMobile ? styles.statCardHalf : undefined}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon="hammer-outline"
            color="#D97706"
            bgColor="#FFFBEB"
            style={isMobile ? styles.statCardHalf : undefined}
          />
          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon="checkmark-circle-outline"
            color="#0D9488"
            bgColor="#ECFDF5"
            style={isMobile ? styles.statCardHalf : undefined}
          />
          <StatCard
            title="Critical"
            value={criticalCount}
            icon="alert-circle-outline"
            color="#DC2626"
            bgColor="#FEF2F2"
            style={isMobile ? styles.statCardFull : undefined}
          />
        </View>

        {/* Two-Column Responsive Section: Recent Complaints & Side Modules */}
        <View style={[styles.twoColSection, !isMobile && styles.twoColRow]}>
          {/* Main Column */}
          <View style={[styles.mainCol, !isMobile && { flex: 3 }]}>
            {/* 5. Recent Complaints */}
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Recent Complaints</Text>
                <Text style={styles.sectionSubtitle}>
                  Latest campus reports and resolution status
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/complaints' as any)}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={THEME.colors.primary} />
              </TouchableOpacity>
            </View>

            {recentComplaints.length === 0 ? (
              <EmptyState
                title="No Complaints Yet"
                description="You haven't submitted any complaints. Click 'Report an Issue' to notify campus facilities."
                actionLabel="Report an Issue"
                onAction={() => router.push('/complaints/create' as any)}
              />
            ) : (
              recentComplaints.map((c) => (
                <ComplaintCard key={c.id} complaint={c} />
              ))
            )}

            {/* 6. My Campus Impact Section */}
            {!isAdmin && (
              <View style={styles.impactCard}>
                <View style={styles.impactHeader}>
                  <View style={styles.impactIconCircle}>
                    <Ionicons name="ribbon-outline" size={20} color={THEME.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.impactTitle}>My Campus Impact</Text>
                    <Text style={styles.impactSubtitle}>
                      Your contribution to improving university facilities
                    </Text>
                  </View>
                </View>

                {totalCount === 0 ? (
                  <View style={styles.impactEmpty}>
                    <Text style={styles.impactEmptyText}>
                      No campus reports submitted yet. When you report an issue, your resolution rate and campus impact will appear here.
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.impactGrid}>
                      <View style={styles.impactMetric}>
                        <Text style={styles.impactVal}>{totalCount}</Text>
                        <Text style={styles.impactLabel}>Issues Reported</Text>
                      </View>
                      <View style={styles.impactMetric}>
                        <Text style={[styles.impactVal, { color: '#0D9488' }]}>
                          {resolvedCount}
                        </Text>
                        <Text style={styles.impactLabel}>Resolved</Text>
                      </View>
                      <View style={styles.impactMetric}>
                        <Text style={[styles.impactVal, { color: THEME.colors.primary }]}>
                          {resolutionRate}%
                        </Text>
                        <Text style={styles.impactLabel}>Resolution Rate</Text>
                      </View>
                      <View style={styles.impactMetric}>
                        <Text style={styles.impactVal}>{departmentsEngaged}</Text>
                        <Text style={styles.impactLabel}>Depts Engaged</Text>
                      </View>
                    </View>
                    <Text style={styles.impactFooterText}>
                      Every issue you report helps create a safer, cleaner, and better campus for everyone.
                    </Text>
                  </>
                )}
              </View>
            )}

            {/* 7. Recent Activity Section */}
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>Recent Activity</Text>
                <Text style={styles.activitySubtitle}>
                  Real-time updates across your campus tickets
                </Text>
              </View>

              {recentActivities.length === 0 ? (
                <View style={styles.activityEmpty}>
                  <Text style={styles.activityEmptyText}>No recent activity logged yet.</Text>
                </View>
              ) : (
                <View style={styles.activityList}>
                  {recentActivities.map((act) => {
                    const iconInfo = getStatusIcon(act.status);
                    return (
                      <TouchableOpacity
                        key={act.id}
                        onPress={() => router.push(`/complaints/${act.complaintId}` as any)}
                        style={styles.activityRow}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.activityIconCircle, { backgroundColor: `${iconInfo.color}15` }]}>
                          <Ionicons name={iconInfo.name} size={16} color={iconInfo.color} />
                        </View>
                        <View style={styles.activityContent}>
                          <View style={styles.activityTopRow}>
                            <Text style={styles.activityTicketNum}>#{act.ticketNumber}</Text>
                            <Text style={styles.activityTime}>{formatTimeAgo(act.timestamp)}</Text>
                          </View>
                          <Text style={styles.activityTitleText} numberOfLines={1}>
                            {act.complaintTitle}
                          </Text>
                          <Text style={styles.activityComment} numberOfLines={2}>
                            {act.comment || `Status changed to ${act.status.replace('_', ' ')}.`}
                          </Text>
                          <Text style={styles.activityActor}>
                            By {act.actorName} ({act.actorRole})
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color={THEME.colors.textLight} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 8. Quick Actions Section */}
            <View style={styles.quickActionsCard}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  onPress={() => router.push('/complaints/create' as any)}
                  style={styles.quickActionBtn}
                >
                  <Ionicons name="add-circle-outline" size={18} color={THEME.colors.primary} />
                  <Text style={styles.quickActionText}>Report Issue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/complaints' as any)}
                  style={styles.quickActionBtn}
                >
                  <Ionicons name="list-outline" size={18} color={THEME.colors.primary} />
                  <Text style={styles.quickActionText}>All Tickets</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/notifications' as any)}
                  style={styles.quickActionBtn}
                >
                  <Ionicons name="notifications-outline" size={18} color={THEME.colors.primary} />
                  <Text style={styles.quickActionText}>Alerts</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/profile' as any)}
                  style={styles.quickActionBtn}
                >
                  <Ionicons name="person-outline" size={18} color={THEME.colors.primary} />
                  <Text style={styles.quickActionText}>My Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Secondary / Side Column */}
          <View style={[styles.sideCol, !isMobile && { flex: 2 }]}>
            {/* Category breakdown */}
            {categorySegments.length > 0 && (
              <View style={styles.sideCardWrap}>
                <ResponsiveDonutChart
                  title="Issues by Category"
                  subtitle="Top reported campus problem areas"
                  segments={categorySegments}
                />
              </View>
            )}

            {/* Status pipeline overview */}
            <View style={styles.statusOverviewCard}>
              <Text style={styles.statusCardTitle}>Status Pipeline</Text>
              <Text style={styles.statusCardSubtitle}>Current distribution across resolution stages</Text>

              <View style={styles.statusPipeline}>
                {STATUS_ORDER.map((statusKey) => {
                  const config = COMPLAINT_STATUSES[statusKey];
                  const count = userComplaints.filter((c) => c.status === statusKey).length;
                  return (
                    <TouchableOpacity
                      key={statusKey}
                      onPress={() => router.push(`/complaints?status=${statusKey}` as any)}
                      style={styles.pipelineRow}
                    >
                      <View style={styles.pipelineLabelCol}>
                        <View style={[styles.pipelineDot, { backgroundColor: config.color }]} />
                        <Text style={styles.pipelineLabel}>{config.label}</Text>
                      </View>
                      <View style={styles.pipelineCountBadge}>
                        <Text style={[styles.pipelineCountText, { color: config.color }]}>
                          {count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Admin Shortcuts (if admin) */}
            {isAdmin && (
              <View style={styles.adminNavCard}>
                <Text style={styles.adminNavTitle}>Admin Portals</Text>
                <TouchableOpacity
                  onPress={() => router.push('/admin/analytics' as any)}
                  style={styles.adminNavRow}
                >
                  <Ionicons name="bar-chart-outline" size={18} color={THEME.colors.primary} />
                  <Text style={styles.adminNavText}>Analytics & SLA Intelligence</Text>
                  <Ionicons name="chevron-forward" size={14} color={THEME.colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/admin/sla' as any)}
                  style={styles.adminNavRow}
                >
                  <Ionicons name="time-outline" size={18} color={THEME.colors.warning} />
                  <Text style={styles.adminNavText}>SLA Monitoring Board</Text>
                  <Ionicons name="chevron-forward" size={14} color={THEME.colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/admin/departments' as any)}
                  style={styles.adminNavRow}
                >
                  <Ionicons name="business-outline" size={18} color={THEME.colors.accent} />
                  <Text style={styles.adminNavText}>Departments & Routing</Text>
                  <Ionicons name="chevron-forward" size={14} color={THEME.colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/admin/feedback' as any)}
                  style={styles.adminNavRow}
                >
                  <Ionicons name="star-outline" size={18} color="#F59E0B" />
                  <Text style={styles.adminNavText}>Feedback & Reviews</Text>
                  <Ionicons name="chevron-forward" size={14} color={THEME.colors.textLight} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    gap: 4,
  },
  headerActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: THEME.typography.weight.semibold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 18,
    gap: 16,
  },
  welcomeHeader: {
    marginBottom: 4,
    gap: 4,
  },
  dashboardCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A', // Dark Navy / Slate - bold & prominent
    letterSpacing: -0.5,
  },
  welcomeTitleMobile: {
    fontSize: 24,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569', // Slate-600 - clearly readable
    lineHeight: 20,
    marginTop: 2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  criticalCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: THEME.radius.lg,
    padding: 12,
    gap: 8,
  },
  criticalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  criticalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  criticalSlaTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
  },
  criticalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    lineHeight: 18,
  },
  criticalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  criticalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 140,
  },
  criticalLocationText: {
    fontSize: 11,
    color: '#B91C1C',
  },
  criticalViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.sm,
  },
  criticalViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  heroCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...THEME.shadows.md,
  },
  heroCardMobile: {
    padding: 14,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroTitleMobile: {
    fontSize: 16,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    lineHeight: 18,
    marginBottom: 12,
  },
  heroSubtitleMobile: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: THEME.radius.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroIconCol: {
    paddingLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCardHalf: {
    minWidth: '47%',
    flexBasis: '47%',
    flexGrow: 1,
  },
  statCardFull: {
    minWidth: '100%',
    flexBasis: '100%',
  },
  twoColSection: {
    flexDirection: 'column',
    gap: 16,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainCol: {
    width: '100%',
    gap: 16,
  },
  sideCol: {
    width: '100%',
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  sideCardWrap: {
    width: '100%',
  },
  statusOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...THEME.shadows.sm,
  },
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  statusPipeline: {
    gap: 8,
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pipelineLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pipelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pipelineLabel: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  pipelineCountBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pipelineCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    ...THEME.shadows.sm,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  impactIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  impactSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  impactEmpty: {
    paddingVertical: 12,
  },
  impactEmptyText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  impactMetric: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  impactVal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  impactLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  impactFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    ...THEME.shadows.sm,
  },
  activityHeader: {
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  activityEmpty: {
    paddingVertical: 12,
  },
  activityEmptyText: {
    fontSize: 12,
    color: '#64748B',
  },
  activityList: {
    gap: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityTicketNum: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  activityTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  activityComment: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  activityActor: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...THEME.shadows.sm,
  },
  quickActionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  adminNavCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 8,
    ...THEME.shadows.sm,
  },
  adminNavTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  adminNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  adminNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
});
