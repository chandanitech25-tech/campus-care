import React from 'react';
import { ComplaintStatus } from '../../types/complaint';
import { COMPLAINT_STATUSES } from '../../constants/status';
import { Badge } from '../common/Badge';

export interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = false,
}) => {
  const config = COMPLAINT_STATUSES[status] || COMPLAINT_STATUSES.SUBMITTED;

  return (
    <Badge
      label={config.label}
      color={config.textColor}
      bgColor={config.bgColor}
      borderColor={config.borderColor}
      size={size}
      icon={showIcon ? (config.icon as any) : undefined}
      dot={!showIcon}
    />
  );
};
