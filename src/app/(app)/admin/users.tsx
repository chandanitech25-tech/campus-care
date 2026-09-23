import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { TopHeader } from '../../../components/layout/TopHeader';
import { MOCK_USERS } from '../../../services/mockData';
import { THEME } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { User, UserRole } from '../../../types/user';

const DEMO_USERS: User[] = [
  MOCK_USERS.chandani,
  MOCK_USERS.student,
  MOCK_USERS.faculty,
  MOCK_USERS.admin,
  {
    id: 'user-stu-2',
    name: 'Chloe Bennett',
    email: 'chloe.b@student.campuscare.edu',
    role: 'STUDENT',
    studentId: 'STU-2024-5102',
    department: 'Civil & Architectural Eng.',
  },
  {
    id: 'user-fac-2',
    name: 'Dr. Robert Oppenheim',
    email: 'r.oppenheim@faculty.campuscare.edu',
    role: 'FACULTY',
    department: 'Physics & Material Science',
  },
  {
    id: 'user-stu-3',
    name: 'Devon Wright',
    email: 'devon.w@student.campuscare.edu',
    role: 'STUDENT',
    studentId: 'STU-2024-3319',
    department: 'School of Management',
  },
];

export default function AdminUsersScreen() {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredUsers = DEMO_USERS.filter((u) => {
    if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentId && u.studentId.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;

  return (
    <View style={styles.container}>
      <TopHeader
        title="Campus User Management"
        subtitle="Manage student, faculty, and administrative campus accounts"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search and Role Filter */}
        <View style={styles.filterCard}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={THEME.colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, email, student ID, or department..."
              placeholderTextColor={THEME.colors.textLight}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.roleTabs}>
            {['ALL', 'STUDENT', 'FACULTY', 'ADMIN'].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRole(r)}
                style={[styles.roleTab, selectedRole === r && styles.roleTabActive]}
              >
                <Text style={[styles.roleTabText, selectedRole === r && styles.roleTabTextActive]}>
                  {r === 'ALL' ? 'All Roles' : r === 'STUDENT' ? 'Students' : r === 'FACULTY' ? 'Faculty' : 'Admins'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* User Directory List */}
        <View style={styles.userList}>
          {filteredUsers.map((u) => {
            let roleBadgeBg = THEME.colors.primaryLight;
            let roleBadgeColor = THEME.colors.primary;
            if (u.role === 'ADMIN') {
              roleBadgeBg = '#FEF2F2';
              roleBadgeColor = '#DC2626';
            } else if (u.role === 'FACULTY') {
              roleBadgeBg = '#FFFBEB';
              roleBadgeColor = '#D97706';
            }

            return (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{u.name.charAt(0)}</Text>
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleBadgeBg }]}>
                      <Text style={[styles.roleBadgeText, { color: roleBadgeColor }]}>
                        {u.role}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.userEmail}>{u.email}</Text>

                  <View style={styles.metaRow}>
                    {u.studentId && (
                      <View style={styles.metaPill}>
                        <Ionicons name="id-card-outline" size={12} color={THEME.colors.textMuted} />
                        <Text style={styles.metaText}>{u.studentId}</Text>
                      </View>
                    )}
                    {u.department && (
                      <View style={styles.metaPill}>
                        <Ionicons name="school-outline" size={12} color={THEME.colors.textMuted} />
                        <Text style={styles.metaText}>{u.department}</Text>
                      </View>
                    )}
                  </View>
                </View>
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
    gap: THEME.spacing.lg,
  },
  filterCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    ...THEME.shadows.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: THEME.colors.text,
    fontSize: THEME.typography.size.sm,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  roleTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  roleTabActive: {
    backgroundColor: THEME.colors.primaryLight,
  },
  roleTabText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weight.medium,
  },
  roleTabTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  userList: {
    gap: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    ...THEME.shadows.sm,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: THEME.typography.weight.bold,
  },
  userEmail: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
});
