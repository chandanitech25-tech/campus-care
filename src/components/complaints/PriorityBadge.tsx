import React from 'react';
import { ComplaintPriority } from '../../types/complaint';
import { COMPLAINT_PRIORITIES } from '../../constants/priority';
import { Badge } from '../common/Badge';

export interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
  showHours?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showHours = false,
}) => {
  const config = COMPLAINT_PRIORITIES[priority] || COMPLAINT_PRIORITIES.MEDIUM;
  const label = showHours ? `${config.label} (${config.slaHours}h SLA)` : config.label;

  return (
    <Badge
      label={label}
      color={config.badgeTextColor}
      bgColor={config.bgColor}
      borderColor={config.borderColor}
      size={size}
      dot
    />
  );
};
