import React from 'react';
import { ComplaintPriority, ComplaintStatus } from '../../types/complaint';
import { evaluateSla } from '../../services/slaService';
import { Badge } from '../common/Badge';

export interface SlaBadgeProps {
  createdAt: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolvedAt?: string;
  size?: 'sm' | 'md';
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({
  createdAt,
  priority,
  status,
  resolvedAt,
  size = 'md',
}) => {
  const sla = evaluateSla(createdAt, priority, status, resolvedAt);

  let iconName: any = 'time-outline';
  if (sla.isBreached) {
    iconName = 'alert-circle-outline';
  } else if (sla.isResolved) {
    iconName = 'checkmark-circle-outline';
  } else if (sla.status === 'APPROACHING_BREACH') {
    iconName = 'warning-outline';
  }

  return (
    <Badge
      label={sla.badgeLabel}
      color={sla.badgeTextColor}
      bgColor={sla.badgeBgColor}
      borderColor={sla.badgeColor}
      size={size}
      icon={iconName}
    />
  );
};
