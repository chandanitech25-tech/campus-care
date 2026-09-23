import React from 'react';
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
import { DEPARTMENTS, MOCK_STAFF } from '../../../constants/departments';
import { THEME } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AdminDepartmentsScreen() {
  const { complaints } = useComplaints();
  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;

  return (
    <View style={styles.container}>
      <TopHeader
        title="Campus Departments & Operations"
        subtitle="Operational divisions, personnel, and assigned resolution workloads"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {DEPARTMENTS.map((dept) => {
            const deptComplaints = complaints.filter((c) => c.assignedDepartmentId === dept.id);
            const activeCount = deptComplaints.filter(
              (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
            ).length;
            const staffList = MOCK_STAFF.filter((s) => s.departmentId === dept.id);

            return (
              <View key={dept.id} style={styles.deptCard}>
                <View style={styles.deptHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={dept.iconName as any} size={22} color={THEME.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deptName}>{dept.name}</Text>
                    <Text style={styles.deptCode}>Code: {dept.code}</Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{activeCount} Active</Text>
                  </View>
                </View>

                {/* Lead Contact Info */}
                <View style={styles.contactSection}>
                  <View style={styles.contactRow}>
                    <Ionicons name="person-outline" size={13} color={THEME.colors.textMuted} />
                    <Text style={styles.contactText}>
                      Lead: <Text style={styles.boldText}>{dept.leadName}</Text>
                    </Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Ionicons name="mail-outline" size={13} color={THEME.colors.textMuted} />
                    <Text style={styles.contactText}>{dept.email}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={13} color={THEME.colors.textMuted} />
                    <Text style={styles.contactText}>{dept.phone}</Text>
                  </View>
                </View>

                {/* Assigned Technicians / Staff */}
                {staffList.length > 0 && (
                  <View style={styles.staffSection}>
                    <Text style={styles.staffHeader}>Specialized Staff ({staffList.length}):</Text>
                    <View style={styles.staffTags}>
                      {staffList.map((s) => (
                        <View key={s.id} style={styles.staffTag}>
                          <Text style={styles.staffTagText}>
                            {s.name} ({s.role})
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Footer Action */}
                <TouchableOpacity
                  onPress={() => router.push(`/complaints` as any)}
                  style={styles.viewTicketsBtn}
                >
                  <Text style={styles.viewTicketsText}>View Department Tickets</Text>
                  <Ionicons name="arrow-forward" size={14} color={THEME.colors.primary} />
                </TouchableOpacity>
              </View>
            );
          })}
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  deptCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deptName: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  deptCode: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  activeBadge: {
    backgroundColor: THEME.colors.warningLight,
    borderWidth: 1,
    borderColor: THEME.colors.warningBorder,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: THEME.typography.weight.bold,
    color: '#92400E',
  },
  contactSection: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  boldText: {
    color: THEME.colors.text,
    fontWeight: THEME.typography.weight.semibold,
  },
  staffSection: {
    marginBottom: 12,
  },
  staffHeader: {
    fontSize: 11,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.textMuted,
    marginBottom: 6,
  },
  staffTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  staffTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  staffTagText: {
    fontSize: 11,
    color: THEME.colors.text,
  },
  viewTicketsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  viewTicketsText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.semibold,
  },
});
