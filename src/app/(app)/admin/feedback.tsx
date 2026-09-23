import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { TopHeader } from '../../../components/layout/TopHeader';
import { complaintService } from '../../../services/complaintService';
import { ComplaintFeedback } from '../../../types/feedback';
import { StarRating } from '../../../components/feedback/StarRating';
import { THEME } from '../../../constants/theme';
import { formatDateTime } from '../../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AdminFeedbackScreen() {
  const [feedbackList, setFeedbackList] = useState<ComplaintFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isMobile = width < THEME.breakpoints.tablet;

  useEffect(() => {
    async function load() {
      try {
        const data = await complaintService.getFeedback();
        setFeedbackList(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const total = feedbackList.length;
  const avgRating =
    total > 0
      ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
      : '5.0';

  return (
    <View style={styles.container}>
      <TopHeader
        title="Resolution Feedback & Ratings"
        subtitle="User satisfaction ratings collected after issue resolution"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && { paddingBottom: 88 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card Header */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.bigScore}>{avgRating}</Text>
            <StarRating rating={Math.round(Number(avgRating))} readonly size={20} />
            <Text style={styles.scoreCount}>Based on {total} submitted reviews</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreHintTitle}>Campus Resolution Quality</Text>
            <Text style={styles.scoreHintDesc}>
              Students and faculty provide direct post-resolution ratings. Ratings below 3 stars trigger operational review.
            </Text>
          </View>
        </View>

        {/* Feedback List */}
        <View style={styles.listSection}>
          <Text style={styles.listHeader}>Recent Student & Faculty Reviews</Text>

          {feedbackList.map((item) => (
            <View key={item.id} style={styles.feedbackItem}>
              <View style={styles.itemHeader}>
                <View style={styles.userRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.userRole}>{item.userRole}</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>
              </View>

              <View style={styles.ratingRow}>
                <StarRating rating={item.rating} readonly size={16} />
                <Text style={styles.ratingNum}>{item.rating}.0 / 5.0</Text>
              </View>

              {item.comment ? (
                <Text style={styles.commentText}>"{item.comment}"</Text>
              ) : (
                <Text style={styles.noCommentText}>No written remarks provided.</Text>
              )}

              <TouchableOpacity
                onPress={() => router.push(`/complaints/${item.complaintId}` as any)}
                style={styles.ticketLink}
              >
                <Ionicons name="link-outline" size={13} color={THEME.colors.primary} />
                <Text style={styles.ticketLinkText}>View Related Complaint</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  scoreCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...THEME.shadows.sm,
    gap: 24,
    flexWrap: 'wrap',
  },
  scoreLeft: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: THEME.colors.border,
  },
  bigScore: {
    fontSize: 44,
    fontWeight: THEME.typography.weight.bold,
    color: '#D97706',
    lineHeight: 52,
  },
  scoreCount: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  scoreRight: {
    flex: 1,
    minWidth: 200,
  },
  scoreHintTitle: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  scoreHintDesc: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  listSection: {
    gap: 12,
  },
  listHeader: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  feedbackItem: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
    ...THEME.shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.primary,
  },
  userName: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
  },
  userRole: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  dateText: {
    fontSize: 11,
    color: THEME.colors.textLight,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingNum: {
    fontSize: THEME.typography.size.xs,
    fontWeight: THEME.typography.weight.bold,
    color: '#D97706',
  },
  commentText: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 10,
  },
  noCommentText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textLight,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  ticketLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketLinkText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.semibold,
  },
});
