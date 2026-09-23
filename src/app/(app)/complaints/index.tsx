import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  Platform,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useComplaints } from '../../../context/ComplaintContext';
import { TopHeader } from '../../../components/layout/TopHeader';
import { ComplaintCard } from '../../../components/complaints/ComplaintCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { THEME } from '../../../constants/theme';
import { COMPLAINT_CATEGORIES, CATEGORY_LIST } from '../../../constants/categories';
import { COMPLAINT_PRIORITIES, PRIORITY_LIST } from '../../../constants/priority';
import { COMPLAINT_STATUSES, STATUS_ORDER } from '../../../constants/status';
import { DEPARTMENTS } from '../../../constants/departments';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ComplaintPriority, ComplaintStatus } from '../../../types/complaint';

export default function ComplaintsListScreen() {
  const { user, role } = useAuth();
  const { complaints } = useComplaints();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ status?: string; priority?: string; category?: string }>();

  const isDesktop = width >= THEME.breakpoints.tablet;
  const isAdmin = role === 'ADMIN';

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(params.status || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>(params.priority || 'ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'priority' | 'sla'>('recent');
  const [scope, setScope] = useState<'MY' | 'CAMPUS'>('MY');

  useEffect(() => {
    if (params.status) setSelectedStatus(params.status);
    if (params.category) setSelectedCategory(params.category);
    if (params.priority) setSelectedPriority(params.priority);
  }, [params.status, params.category, params.priority]);

  // Filter complaints based on role and active filters
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Scope filter for non-admin
      if (!isAdmin) {
        if (scope === 'MY' && c.createdBy.id !== user?.id) {
          return false;
        }
        if (scope === 'CAMPUS' && c.isAnonymous && c.createdBy.id !== user?.id) {
          return false;
        }
      }

      // Search query (title, description, ticket number, room)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.ticketNumber.toLowerCase().includes(q) ||
          c.location.building.toLowerCase().includes(q) ||
          c.location.roomArea.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;

      // Priority filter
      if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) return false;

      // Department filter
      if (selectedDept !== 'ALL' && c.assignedDepartmentId !== selectedDept) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder: Record<ComplaintPriority, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'sla') {
        return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
      }
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    complaints,
    isAdmin,
    user?.id,
    searchQuery,
    selectedStatus,
    selectedCategory,
    selectedPriority,
    selectedDept,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
    setSelectedDept('ALL');
    setSortBy('recent');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    selectedDept !== 'ALL' ||
    sortBy !== 'recent';

  return (
    <View style={styles.container}>
      <TopHeader
        title={isAdmin ? 'All Campus Complaints' : 'My Complaints'}
        subtitle={`Showing ${filteredComplaints.length} of ${complaints.length} tickets`}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/complaints/create' as any)}
            style={styles.newIssueBtn}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.newIssueText}>Report Issue</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, !isDesktop && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search & Filter Bar */}
        <View style={styles.filterSection}>
          {!isAdmin && (
            <View style={styles.scopeTabs}>
              <TouchableOpacity
                onPress={() => setScope('MY')}
                style={[styles.scopeTab, scope === 'MY' && styles.scopeTabActive]}
              >
                <Ionicons
                  name="person-outline"
                  size={14}
                  color={scope === 'MY' ? THEME.colors.primary : THEME.colors.textMuted}
                />
                <Text style={[styles.scopeTabText, scope === 'MY' && styles.scopeTabTextActive]}>
                  My Complaints
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setScope('CAMPUS')}
                style={[styles.scopeTab, scope === 'CAMPUS' && styles.scopeTabActive]}
              >
                <Ionicons
                  name="globe-outline"
                  size={14}
                  color={scope === 'CAMPUS' ? THEME.colors.primary : THEME.colors.textMuted}
                />
                <Text style={[styles.scopeTabText, scope === 'CAMPUS' && styles.scopeTabTextActive]}>
                  All Campus Issues
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search Input */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by ticket #, title, keywords, or building..."
              placeholderTextColor={THEME.colors.textLight}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={THEME.colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Status Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <TouchableOpacity
              onPress={() => setSelectedStatus('ALL')}
              style={[styles.chip, selectedStatus === 'ALL' && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedStatus === 'ALL' && styles.chipTextActive]}>
                All Statuses
              </Text>
            </TouchableOpacity>

            {STATUS_ORDER.map((statusKey) => {
              const cfg = COMPLAINT_STATUSES[statusKey];
              const isSelected = selectedStatus === statusKey;
              return (
                <TouchableOpacity
                  key={statusKey}
                  onPress={() => setSelectedStatus(statusKey)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <View style={[styles.chipDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Dropdown Filters & Sorting Row */}
          <View style={styles.filterRow}>
            {/* Category Filter */}
            <View style={styles.filterSelect}>
              <Text style={styles.filterSelectLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterMiniScroll}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory('ALL')}
                  style={[styles.miniChip, selectedCategory === 'ALL' && styles.miniChipActive]}
                >
                  <Text style={[styles.miniChipText, selectedCategory === 'ALL' && styles.miniChipTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>
                {CATEGORY_LIST.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[styles.miniChip, selectedCategory === cat.id && styles.miniChipActive]}
                  >
                    <Text
                      style={[
                        styles.miniChipText,
                        selectedCategory === cat.id && styles.miniChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority & Sort Row */}
            <View style={styles.sortPriorityRow}>
              {/* Priority Chips */}
              <View style={styles.priorityGroup}>
                <Text style={styles.filterSelectLabel}>Priority:</Text>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setSelectedPriority(p)}
                    style={[styles.miniChip, selectedPriority === p && styles.miniChipActive]}
                  >
                    <Text style={[styles.miniChipText, selectedPriority === p && styles.miniChipTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort selector */}
              <View style={styles.sortGroup}>
                <Text style={styles.filterSelectLabel}>Sort by:</Text>
                <TouchableOpacity
                  onPress={() => setSortBy('recent')}
                  style={[styles.miniChip, sortBy === 'recent' && styles.miniChipActive]}
                >
                  <Text style={[styles.miniChipText, sortBy === 'recent' && styles.miniChipTextActive]}>
                    Recent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy('priority')}
                  style={[styles.miniChip, sortBy === 'priority' && styles.miniChipActive]}
                >
                  <Text style={[styles.miniChipText, sortBy === 'priority' && styles.miniChipTextActive]}>
                    Priority
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy('sla')}
                  style={[styles.miniChip, sortBy === 'sla' && styles.miniChipActive]}
                >
                  <Text style={[styles.miniChipText, sortBy === 'sla' && styles.miniChipTextActive]}>
                    SLA Due
                  </Text>
                </TouchableOpacity>
              </View>

              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
                  <Ionicons name="refresh-outline" size={14} color={THEME.colors.danger} />
                  <Text style={styles.resetBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <EmptyState
            title="No Matching Complaints"
            description="No complaints matched your current search filters. Try adjusting your query or resetting filters."
            actionLabel={hasActiveFilters ? 'Clear Filters' : 'Report an Issue'}
            onAction={hasActiveFilters ? resetFilters : () => router.push('/complaints/create' as any)}
          />
        ) : (
          <View style={styles.listContainer}>
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
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
  newIssueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    gap: 4,
  },
  newIssueText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  filterSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  scopeTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 3,
    marginBottom: 12,
    gap: 4,
  },
  scopeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
    gap: 6,
  },
  scopeTabActive: {
    backgroundColor: '#FFFFFF',
    ...THEME.shadows.sm,
  },
  scopeTabText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  scopeTabTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: THEME.colors.text,
    fontSize: THEME.typography.size.sm,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chipText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  chipTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  filterRow: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 10,
    gap: 8,
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterSelectLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.textMuted,
    marginRight: 8,
  },
  filterMiniScroll: {
    flex: 1,
  },
  sortPriorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  priorityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 4,
  },
  miniChipActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  miniChipText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  miniChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    fontSize: 11,
    color: THEME.colors.danger,
    fontWeight: THEME.typography.weight.semibold,
  },
  listContainer: {
    width: '100%',
  },
});
