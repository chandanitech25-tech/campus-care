import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useComplaints } from '../../../context/ComplaintContext';
import { TopHeader } from '../../../components/layout/TopHeader';
import { PriorityBadge } from '../../../components/complaints/PriorityBadge';
import { StatusBadge } from '../../../components/complaints/StatusBadge';
import { SlaBadge } from '../../../components/complaints/SlaBadge';
import { ComplaintTimeline } from '../../../components/complaints/ComplaintTimeline';
import { FeedbackModal } from '../../../components/feedback/FeedbackModal';
import { StarRating } from '../../../components/feedback/StarRating';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Modal } from '../../../components/common/Modal';
import { THEME } from '../../../constants/theme';
import { COMPLAINT_CATEGORIES } from '../../../constants/categories';
import { COMPLAINT_STATUSES, STATUS_ORDER } from '../../../constants/status';
import { COMPLAINT_PRIORITIES, PRIORITY_LIST } from '../../../constants/priority';
import { DEPARTMENTS, MOCK_STAFF } from '../../../constants/departments';
import { ComplaintPriority, ComplaintStatus } from '../../../types/complaint';
import { ComplaintFeedback } from '../../../types/feedback';
import { complaintService } from '../../../services/complaintService';
import { formatDateTime } from '../../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, role } = useAuth();
  const {
    getComplaintById,
    updateStatus,
    assignComplaint,
    updatePriority,
    addNote,
    followComplaint,
    submitFeedback,
  } = useComplaints();
  const { width } = useWindowDimensions();

  const isDesktop = width >= THEME.breakpoints.tablet;
  const isAdmin = role === 'ADMIN';

  const complaint = getComplaintById(id);

  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form states for modals
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('UNDER_REVIEW');
  const [statusComment, setStatusComment] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(DEPARTMENTS[0].id);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('HIGH');
  const [noteText, setNoteText] = useState('');
  const [feedback, setFeedback] = useState<ComplaintFeedback | null>(null);

  useEffect(() => {
    async function loadFeedback() {
      if (complaint) {
        const allFeedback = await complaintService.getFeedback();
        const found = allFeedback.find((f) => f.complaintId === complaint.id);
        if (found) setFeedback(found);
      }
    }
    loadFeedback();
  }, [complaint?.id, complaint?.feedbackId]);

  if (!complaint) {
    return (
      <View style={styles.container}>
        <TopHeader title="Complaint Details" showBack />
        <View style={styles.notFoundWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={THEME.colors.textMuted} />
          <Text style={styles.notFoundTitle}>Complaint Not Found</Text>
          <Text style={styles.notFoundSub}>The requested ticket does not exist or has been removed.</Text>
          <Button
            title="Back to Complaints"
            onPress={() => router.replace('/complaints' as any)}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  const categoryConfig = COMPLAINT_CATEGORIES[complaint.category];
  const assignedDept = DEPARTMENTS.find((d) => d.id === complaint.assignedDepartmentId);
  const isResolvedOrClosed = complaint.status === 'RESOLVED' || complaint.status === 'CLOSED';
  const hasFeedback = !!feedback || !!complaint.feedbackId;

  // Handlers for Admin actions
  const handleUpdateStatus = async () => {
    try {
      await updateStatus(complaint.id, newStatus, statusComment.trim() || undefined);
      setShowStatusModal(false);
      setStatusComment('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update status.');
    }
  };

  const handleAssign = async () => {
    try {
      await assignComplaint(complaint.id, selectedDeptId, selectedStaffId || undefined);
      setShowAssignModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to assign department.');
    }
  };

  const handleUpdatePriority = async () => {
    try {
      await updatePriority(complaint.id, newPriority);
      setShowPriorityModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update priority.');
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addNote(complaint.id, noteText.trim());
      setShowNoteModal(false);
      setNoteText('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add note.');
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title={`Ticket #${complaint.ticketNumber}`}
        subtitle={`Logged on ${formatDateTime(complaint.createdAt)}`}
        showBack
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, !isDesktop && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main layout row on desktop */}
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          {/* Left / Main Column */}
          <View style={[styles.mainCol, isDesktop && { flex: 3 }]}>
            {/* Header info card */}
            <View style={styles.card}>
              <View style={styles.badgeBar}>
                <View style={styles.badgeGroup}>
                  <StatusBadge status={complaint.status} showIcon />
                  <PriorityBadge priority={complaint.priority} showHours />
                  <SlaBadge
                    createdAt={complaint.createdAt}
                    priority={complaint.priority}
                    status={complaint.status}
                    resolvedAt={complaint.resolvedAt}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => followComplaint(complaint.id)}
                  style={styles.followBtn}
                >
                  <Ionicons name="notifications-outline" size={16} color={THEME.colors.primary} />
                  <Text style={styles.followBtnText}>
                    Follow ({complaint.followersCount})
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.title}>{complaint.title}</Text>

              {categoryConfig && (
                <View style={styles.categoryRow}>
                  <View
                    style={[
                      styles.categoryPill,
                      { backgroundColor: categoryConfig.bgColor, borderColor: categoryConfig.color },
                    ]}
                  >
                    <Ionicons
                      name={categoryConfig.icon as any}
                      size={14}
                      color={categoryConfig.color}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                      {categoryConfig.label}
                    </Text>
                  </View>
                  <Text style={styles.categoryDesc}>{categoryConfig.description}</Text>
                </View>
              )}

              <Text style={styles.description}>{complaint.description}</Text>

              {/* Location details */}
              <View style={styles.locationBox}>
                <View style={styles.locationItem}>
                  <Ionicons name="business-outline" size={16} color={THEME.colors.textMuted} />
                  <Text style={styles.locationVal}>{complaint.location.building}</Text>
                </View>
                <View style={styles.locationItem}>
                  <Ionicons name="layers-outline" size={16} color={THEME.colors.textMuted} />
                  <Text style={styles.locationVal}>{complaint.location.floor}</Text>
                </View>
                <View style={styles.locationItem}>
                  <Ionicons name="location-outline" size={16} color={THEME.colors.textMuted} />
                  <Text style={styles.locationVal}>{complaint.location.roomArea}</Text>
                </View>
              </View>

              {/* Evidence Gallery if present */}
              {complaint.evidence.length > 0 && (
                <View style={styles.evidenceSection}>
                  <Text style={styles.sectionLabel}>Attached Evidence</Text>
                  <View style={styles.evidenceRow}>
                    {complaint.evidence.map((ev) => (
                      <View key={ev.id} style={styles.evidenceWrap}>
                        <Image source={{ uri: ev.uri }} style={styles.evidenceImg} />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Visual 6-Stage Timeline */}
            <View style={styles.timelineCardWrap}>
              <ComplaintTimeline complaint={complaint} />
            </View>

            {/* Feedback Section (if resolved) */}
            {isResolvedOrClosed && (
              <View style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.feedbackIconCircle}>
                    <Ionicons name="star" size={20} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.feedbackCardTitle}>Resolution Feedback</Text>
                    <Text style={styles.feedbackCardSub}>Student/Faculty satisfaction rating</Text>
                  </View>
                </View>

                {hasFeedback ? (
                  <View style={styles.feedbackGivenBox}>
                    <View style={styles.starRow}>
                      <StarRating rating={feedback?.rating || 5} readonly size={22} />
                      <Text style={styles.ratingNum}>{feedback?.rating || 5}.0 / 5.0</Text>
                    </View>
                    {feedback?.comment ? (
                      <Text style={styles.feedbackComment}>"{feedback.comment}"</Text>
                    ) : (
                      <Text style={[styles.feedbackComment, { fontStyle: 'normal', color: THEME.colors.textMuted }]}>
                        No written comments provided.
                      </Text>
                    )}
                    <Text style={styles.feedbackAuthor}>
                      - Submitted by {feedback?.userName || user?.name || 'Chandani Chaurasiya'} ({feedback?.userRole || 'Student'})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.feedbackPromptBox}>
                    <Text style={styles.feedbackPromptText}>
                      This issue has been resolved. How satisfied are you with the resolution?
                    </Text>
                    <Button
                      title="Leave Feedback"
                      icon="star-outline"
                      variant="primary"
                      onPress={() => setShowFeedbackModal(true)}
                      style={{ alignSelf: 'flex-start', marginTop: 10 }}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Internal Staff Notes (visible to Admin / Staff) */}
            {isAdmin && (
              <View style={styles.notesCard}>
                <View style={styles.notesHeader}>
                  <View>
                    <Text style={styles.notesTitle}>Internal Staff Notes</Text>
                    <Text style={styles.notesSub}>Confidential operational remarks</Text>
                  </View>
                  <Button
                    title="Add Note"
                    icon="chatbox-outline"
                    variant="outline"
                    size="sm"
                    onPress={() => setShowNoteModal(true)}
                  />
                </View>

                {complaint.internalNotes.length === 0 ? (
                  <Text style={styles.noNotesText}>No internal notes logged yet.</Text>
                ) : (
                  complaint.internalNotes.map((note) => (
                    <View key={note.id} style={styles.noteItem}>
                      <View style={styles.noteHeader}>
                        <Text style={styles.noteAuthor}>{note.authorName}</Text>
                        <Text style={styles.noteTime}>{formatDateTime(note.createdAt)}</Text>
                      </View>
                      <Text style={styles.noteBody}>{note.text}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Right / Sidebar Column */}
          <View style={[styles.sideCol, isDesktop && { flex: 2 }]}>
            {/* Admin Management Actions Panel */}
            {isAdmin && (
              <View style={styles.adminActionCard}>
                <Text style={styles.adminActionTitle}>Admin Management</Text>
                <Text style={styles.adminActionSub}>Dispatch, reassign, or update lifecycle</Text>

                <View style={styles.adminBtnStack}>
                  <Button
                    title="Change Status"
                    icon="sync-outline"
                    variant="primary"
                    onPress={() => {
                      setNewStatus(complaint.status);
                      setShowStatusModal(true);
                    }}
                    style={styles.adminBtn}
                  />

                  <Button
                    title="Assign Dept / Staff"
                    icon="people-outline"
                    variant="outline"
                    onPress={() => {
                      if (complaint.assignedDepartmentId) setSelectedDeptId(complaint.assignedDepartmentId);
                      if (complaint.assignedStaffId) setSelectedStaffId(complaint.assignedStaffId);
                      setShowAssignModal(true);
                    }}
                    style={styles.adminBtn}
                  />

                  <Button
                    title="Change Priority"
                    icon="flag-outline"
                    variant="secondary"
                    onPress={() => {
                      setNewPriority(complaint.priority);
                      setShowPriorityModal(true);
                    }}
                    style={styles.adminBtn}
                  />
                </View>
              </View>
            )}

            {/* Department & Assignment Card */}
            <View style={styles.deptCard}>
              <Text style={styles.deptCardTitle}>Assigned Department</Text>
              <View style={styles.deptInfoRow}>
                <View style={styles.deptIconBox}>
                  <Ionicons name="construct-outline" size={20} color={THEME.colors.primary} />
                </View>
                <View>
                  <Text style={styles.deptName}>{assignedDept?.name || 'Unassigned'}</Text>
                  <Text style={styles.deptLead}>Lead: {assignedDept?.leadName || 'Operations Desk'}</Text>
                </View>
              </View>
              {complaint.assignedStaffName && (
                <View style={styles.staffAssignedBox}>
                  <Ionicons name="person-outline" size={14} color={THEME.colors.accent} />
                  <Text style={styles.staffAssignedText}>
                    Assigned Technician: <Text style={{ fontWeight: '700' }}>{complaint.assignedStaffName}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Submitter Information */}
            <View style={styles.submitterCard}>
              <Text style={styles.submitterTitle}>Submitter Information</Text>
              <View style={styles.submitterRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {complaint.isAnonymous ? '?' : complaint.createdBy.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submitterName}>
                    {complaint.isAnonymous ? 'Anonymous Student' : complaint.createdBy.name}
                  </Text>
                  <Text style={styles.submitterRole}>
                    {complaint.createdBy.role} • {complaint.isAnonymous ? 'Confidential' : complaint.createdBy.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal: Change Status */}
      <Modal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Complaint Status"
        subtitle={`Current Status: ${complaint.status}`}
      >
        <View style={styles.modalBody}>
          <Text style={styles.modalLabel}>Select New Status:</Text>
          <View style={styles.statusOptionGroup}>
            {STATUS_ORDER.map((statusKey) => {
              const cfg = COMPLAINT_STATUSES[statusKey];
              const isSelected = newStatus === statusKey;
              return (
                <TouchableOpacity
                  key={statusKey}
                  onPress={() => setNewStatus(statusKey)}
                  style={[
                    styles.statusModalOption,
                    isSelected && { borderColor: cfg.color, backgroundColor: cfg.bgColor },
                  ]}
                >
                  <View style={[styles.optionDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.statusOptionText, isSelected && { color: cfg.color, fontWeight: '700' }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Resolution / Status Notes (Optional)"
            value={statusComment}
            onChangeText={setStatusComment}
            placeholder="Add a remark for the timeline (e.g. Technician dispatched)..."
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowStatusModal(false)} />
            <Button title="Confirm Update" variant="primary" onPress={handleUpdateStatus} />
          </View>
        </View>
      </Modal>

      {/* Modal: Assign Department & Staff */}
      <Modal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Department & Staff"
        subtitle="Route this ticket to the appropriate campus operations team."
      >
        <View style={styles.modalBody}>
          <Text style={styles.modalLabel}>Department:</Text>
          <View style={styles.deptOptionGrid}>
            {DEPARTMENTS.map((dept) => {
              const isSelected = selectedDeptId === dept.id;
              return (
                <TouchableOpacity
                  key={dept.id}
                  onPress={() => {
                    setSelectedDeptId(dept.id);
                    setSelectedStaffId('');
                  }}
                  style={[styles.deptModalOption, isSelected && styles.deptModalOptionActive]}
                >
                  <Text style={[styles.deptModalText, isSelected && styles.deptModalTextActive]}>
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.modalLabel, { marginTop: 12 }]}>Specialized Technician (Optional):</Text>
          <View style={styles.staffOptionList}>
            <TouchableOpacity
              onPress={() => setSelectedStaffId('')}
              style={[styles.staffOption, !selectedStaffId && styles.staffOptionActive]}
            >
              <Text style={[styles.staffText, !selectedStaffId && styles.staffTextActive]}>
                Any Available Staff
              </Text>
            </TouchableOpacity>
            {MOCK_STAFF.filter((s) => s.departmentId === selectedDeptId).map((staff) => {
              const isSelected = selectedStaffId === staff.id;
              return (
                <TouchableOpacity
                  key={staff.id}
                  onPress={() => setSelectedStaffId(staff.id)}
                  style={[styles.staffOption, isSelected && styles.staffOptionActive]}
                >
                  <Text style={[styles.staffText, isSelected && styles.staffTextActive]}>
                    {staff.name} ({staff.role})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowAssignModal(false)} />
            <Button title="Assign Ticket" variant="primary" onPress={handleAssign} />
          </View>
        </View>
      </Modal>

      {/* Modal: Update Priority */}
      <Modal
        visible={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        title="Change Priority Level"
        subtitle="Modifying priority reconfigures the SLA target window."
      >
        <View style={styles.modalBody}>
          {PRIORITY_LIST.map((p) => {
            const isSelected = newPriority === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setNewPriority(p.id)}
                style={[
                  styles.priorityModalOption,
                  isSelected && { borderColor: p.color, backgroundColor: p.bgColor },
                ]}
              >
                <View style={styles.priorityModalTop}>
                  <Text style={[styles.priorityModalLabel, isSelected && { color: p.badgeTextColor, fontWeight: '700' }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.priorityModalSla, { color: p.color }]}>{p.slaHours}h SLA</Text>
                </View>
                <Text style={styles.priorityModalDesc}>{p.description}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowPriorityModal(false)} />
            <Button title="Save Priority" variant="primary" onPress={handleUpdatePriority} />
          </View>
        </View>
      </Modal>

      {/* Modal: Internal Note */}
      <Modal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Internal Note"
        subtitle="Visible only to administrators and campus staff."
      >
        <View style={styles.modalBody}>
          <Input
            label="Internal Remark"
            value={noteText}
            onChangeText={setNoteText}
            placeholder="e.g. Replaced leaking valve gasket. Awaiting water pressure test."
            multiline
            numberOfLines={4}
            required
          />

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowNoteModal(false)} />
            <Button title="Save Note" variant="primary" onPress={handleAddNote} />
          </View>
        </View>
      </Modal>

      {/* Modal: Feedback */}
      <FeedbackModal
        visible={showFeedbackModal}
        complaintId={complaint.id}
        complaintTitle={complaint.title}
        onSubmit={async (rating, comment) => {
          await submitFeedback(complaint.id, rating, comment);
          const allFeedback = await complaintService.getFeedback();
          const found = allFeedback.find((f) => f.complaintId === complaint.id);
          if (found) setFeedback(found);
        }}
        onClose={() => setShowFeedbackModal(false)}
      />
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
  mainLayout: {
    flexDirection: 'column',
    gap: THEME.spacing.lg,
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainCol: {
    width: '100%',
    gap: THEME.spacing.lg,
  },
  sideCol: {
    width: '100%',
    gap: THEME.spacing.lg,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    ...THEME.shadows.sm,
  },
  badgeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.primaryLight,
    gap: 4,
  },
  followBtnText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.semibold,
  },
  title: {
    fontSize: THEME.typography.size.xl,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.semibold,
  },
  categoryDesc: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  description: {
    fontSize: THEME.typography.size.md,
    color: THEME.colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  locationBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 12,
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationVal: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
    fontWeight: THEME.typography.weight.medium,
  },
  evidenceSection: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.textMuted,
    marginBottom: 8,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  evidenceWrap: {
    width: 100,
    height: 100,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  evidenceImg: {
    width: '100%',
    height: '100%',
  },
  timelineCardWrap: {
    width: '100%',
  },
  feedbackCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  feedbackIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackCardTitle: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  feedbackCardSub: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  feedbackGivenBox: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 12,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ratingNum: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: '#D97706',
  },
  feedbackComment: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 6,
  },
  feedbackAuthor: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  feedbackPromptBox: {
    paddingTop: 4,
  },
  feedbackPromptText: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  notesSub: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  noNotesText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textLight,
    fontStyle: 'italic',
  },
  noteItem: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 10,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  noteTime: {
    fontSize: 10,
    color: THEME.colors.textLight,
  },
  noteBody: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
    lineHeight: 16,
  },
  adminActionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  adminActionTitle: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  adminActionSub: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  adminBtnStack: {
    gap: 8,
  },
  adminBtn: {
    width: '100%',
  },
  deptCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  deptCardTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginBottom: 10,
  },
  deptInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deptIconBox: {
    width: 38,
    height: 38,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptName: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  deptLead: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  staffAssignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accentLight,
    borderRadius: THEME.radius.sm,
    padding: 6,
    marginTop: 10,
    gap: 6,
  },
  staffAssignedText: {
    fontSize: 11,
    color: '#065F46',
  },
  submitterCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  submitterTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginBottom: 10,
  },
  submitterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
  submitterName: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  submitterRole: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xxxl,
  },
  notFoundTitle: {
    fontSize: THEME.typography.size.lg,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginTop: 12,
  },
  notFoundSub: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalBody: {
    gap: 10,
  },
  modalLabel: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  statusOptionGroup: {
    gap: 6,
    marginBottom: 8,
  },
  statusModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.text,
  },
  deptOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  deptModalOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  deptModalOptionActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  deptModalText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
  },
  deptModalTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  staffOptionList: {
    gap: 6,
  },
  staffOption: {
    padding: 8,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  staffOptionActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  staffText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.text,
  },
  staffTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  priorityModalOption: {
    padding: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceSubtle,
    marginBottom: 6,
  },
  priorityModalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityModalLabel: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  priorityModalSla: {
    fontSize: 11,
    fontWeight: '700',
  },
  priorityModalDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
    marginTop: 6,
  },
});
