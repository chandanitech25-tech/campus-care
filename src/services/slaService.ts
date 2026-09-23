import { ComplaintPriority, ComplaintStatus } from '../types/complaint';
import { COMPLAINT_PRIORITIES } from '../constants/priority';

export type SlaStatus =
  | 'ON_TRACK'
  | 'APPROACHING_BREACH'
  | 'BREACHED'
  | 'RESOLVED_ON_TIME'
  | 'RESOLVED_BREACHED';

export interface SlaEvaluation {
  status: SlaStatus;
  targetHours: number;
  deadlineDate: Date;
  isBreached: boolean;
  isResolved: boolean;
  remainingMs: number;
  remainingFormatted: string;
  percentageUsed: number;
  badgeLabel: string;
  badgeColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
}

/**
 * Calculates the SLA deadline for a complaint given creation time and priority.
 */
export function calculateSlaDeadline(createdAt: string | Date, priority: ComplaintPriority): Date {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const hours = COMPLAINT_PRIORITIES[priority]?.slaHours || 24;
  return new Date(created.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Evaluates the SLA performance and remaining time for a complaint.
 */
export function evaluateSla(
  createdAt: string,
  priority: ComplaintPriority,
  status: ComplaintStatus,
  resolvedAt?: string
): SlaEvaluation {
  const createdTime = new Date(createdAt).getTime();
  const targetHours = COMPLAINT_PRIORITIES[priority]?.slaHours || 24;
  const totalWindowMs = targetHours * 60 * 60 * 1000;
  const deadlineDate = new Date(createdTime + totalWindowMs);
  const deadlineTime = deadlineDate.getTime();

  const isResolved = status === 'RESOLVED' || status === 'CLOSED';
  const evaluationTime = isResolved && resolvedAt ? new Date(resolvedAt).getTime() : Date.now();

  const remainingMs = deadlineTime - evaluationTime;
  const timeElapsedMs = evaluationTime - createdTime;
  const percentageUsed = Math.min(100, Math.max(0, Math.round((timeElapsedMs / totalWindowMs) * 100)));

  if (isResolved) {
    if (evaluationTime <= deadlineTime) {
      return {
        status: 'RESOLVED_ON_TIME',
        targetHours,
        deadlineDate,
        isBreached: false,
        isResolved: true,
        remainingMs: 0,
        remainingFormatted: 'Met SLA',
        percentageUsed,
        badgeLabel: 'SLA Met',
        badgeColor: '#10B981',
        badgeBgColor: '#ECFDF5',
        badgeTextColor: '#047857',
      };
    } else {
      const breachedByHours = Math.round((evaluationTime - deadlineTime) / (60 * 60 * 1000));
      return {
        status: 'RESOLVED_BREACHED',
        targetHours,
        deadlineDate,
        isBreached: true,
        isResolved: true,
        remainingMs,
        remainingFormatted: `Breached (+${breachedByHours}h)`,
        percentageUsed: 100,
        badgeLabel: 'SLA Missed',
        badgeColor: '#EF4444',
        badgeBgColor: '#FEF2F2',
        badgeTextColor: '#991B1B',
      };
    }
  }

  // Active / Open ticket evaluation
  if (remainingMs <= 0) {
    const overdueHours = Math.abs(Math.floor(remainingMs / (60 * 60 * 1000)));
    const overdueMins = Math.abs(Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000)));
    return {
      status: 'BREACHED',
      targetHours,
      deadlineDate,
      isBreached: true,
      isResolved: false,
      remainingMs,
      remainingFormatted: overdueHours > 0 ? `Overdue by ${overdueHours}h ${overdueMins}m` : `Overdue by ${overdueMins}m`,
      percentageUsed: 100,
      badgeLabel: 'SLA Breached',
      badgeColor: '#DC2626',
      badgeBgColor: '#FEF2F2',
      badgeTextColor: '#991B1B',
    };
  }

  // Within target window
  const hoursLeft = Math.floor(remainingMs / (60 * 60 * 1000));
  const minsLeft = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  const remainingFormatted = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m left` : `${minsLeft}m left`;

  // Approaching breach if remaining time is <= 30% of SLA window or < 2 hours
  const isApproaching = percentageUsed >= 70 || remainingMs <= 2 * 60 * 60 * 1000;

  if (isApproaching) {
    return {
      status: 'APPROACHING_BREACH',
      targetHours,
      deadlineDate,
      isBreached: false,
      isResolved: false,
      remainingMs,
      remainingFormatted,
      percentageUsed,
      badgeLabel: `At Risk (${remainingFormatted})`,
      badgeColor: '#F59E0B',
      badgeBgColor: '#FFFBEB',
      badgeTextColor: '#B45309',
    };
  }

  return {
    status: 'ON_TRACK',
    targetHours,
    deadlineDate,
    isBreached: false,
    isResolved: false,
    remainingMs,
    remainingFormatted,
    percentageUsed,
    badgeLabel: remainingFormatted,
    badgeColor: '#10B981',
    badgeBgColor: '#ECFDF5',
    badgeTextColor: '#047857',
  };
}
