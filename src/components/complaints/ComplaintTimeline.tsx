import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Complaint, ComplaintStatus } from '../../types/complaint';
import { COMPLAINT_STATUSES, STATUS_ORDER } from '../../constants/status';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDateTime } from '../../utils/date';

export interface ComplaintTimelineProps {
  complaint: Complaint;
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ complaint }) => {
  const currentStatus = complaint.status;
  const currentOrder = COMPLAINT_STATUSES[currentStatus]?.order || 1;

  // Map timeline events by status for fast lookup of timestamp & comments
  const eventMap = new Map<ComplaintStatus, any>();
  complaint.timeline.forEach((event) => {
    eventMap.set(event.status, event);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Progress Timeline</Text>
      <View style={styles.timelineList}>
        {STATUS_ORDER.map((statusKey, index) => {
          const config = COMPLAINT_STATUSES[statusKey];
          const isCompleted = config.order < currentOrder || (config.order === currentOrder && (statusKey === 'RESOLVED' || statusKey === 'CLOSED'));
          const isCurrent = config.order === currentOrder && statusKey !== 'CLOSED';
          const isUpcoming = config.order > currentOrder;
          const isLast = index === STATUS_ORDER.length - 1;

          const event = eventMap.get(statusKey);

          let nodeColor = THEME.colors.textLight;
          let nodeBg = THEME.colors.surfaceSubtle;
          let iconName: any = config.icon;

          if (isCompleted) {
            nodeColor = '#FFFFFF';
            nodeBg = THEME.colors.accent;
            iconName = 'checkmark';
          } else if (isCurrent) {
            nodeColor = '#FFFFFF';
            nodeBg = THEME.colors.primary;
          }

          return (
            <View key={statusKey} style={styles.stageItem}>
              {/* Left column: indicator node & connecting line */}
              <View style={styles.indicatorCol}>
                <View
                  style={[
                    styles.nodeCircle,
                    { backgroundColor: nodeBg },
                    isCurrent && styles.nodePulse,
                  ]}
                >
                  <Ionicons name={iconName} size={14} color={nodeColor} />
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      {
                        backgroundColor: isCompleted ? THEME.colors.accent : THEME.colors.border,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Right column: Content details */}
              <View style={[styles.contentCol, !isLast && styles.contentColPadding]}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.stageLabel,
                      isCurrent && styles.stageLabelCurrent,
                      isUpcoming && styles.stageLabelUpcoming,
                    ]}
                  >
                    {config.label}
                  </Text>
                  {event && (
                    <Text style={styles.eventTime}>{formatDateTime(event.timestamp)}</Text>
                  )}
                </View>

                {event?.comment ? (
                  <Text style={styles.commentText}>{event.comment}</Text>
                ) : (
                  <Text style={styles.descText}>{config.description}</Text>
                )}

                {event?.actorName && (
                  <View style={styles.actorRow}>
                    <Ionicons name="person-circle-outline" size={13} color={THEME.colors.textMuted} />
                    <Text style={styles.actorText}>
                      By {event.actorName} ({event.actorRole})
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
  },
  headerTitle: {
    fontSize: THEME.typography.size.md,
    fontWeight: THEME.typography.weight.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
  },
  timelineList: {
    paddingLeft: 4,
  },
  stageItem: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
  },
  nodeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodePulse: {
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.2)',
      } as any,
    }),
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    marginLeft: 12,
  },
  contentColPadding: {
    paddingBottom: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  stageLabel: {
    fontSize: THEME.typography.size.sm,
    fontWeight: THEME.typography.weight.semibold,
    color: THEME.colors.text,
  },
  stageLabelCurrent: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weight.bold,
  },
  stageLabelUpcoming: {
    color: THEME.colors.textLight,
  },
  eventTime: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
  commentText: {
    fontSize: THEME.typography.size.sm,
    color: THEME.colors.text,
    marginTop: 4,
    lineHeight: 18,
  },
  descText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  actorText: {
    fontSize: THEME.typography.size.xs,
    color: THEME.colors.textMuted,
  },
});
