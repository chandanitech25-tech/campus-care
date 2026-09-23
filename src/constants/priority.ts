import { ComplaintPriority } from '../types/complaint';

export interface PriorityConfig {
  id: ComplaintPriority;
  label: string;
  slaHours: number;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeTextColor: string;
  description: string;
}

export const COMPLAINT_PRIORITIES: Record<ComplaintPriority, PriorityConfig> = {
  CRITICAL: {
    id: 'CRITICAL',
    label: 'Critical',
    slaHours: 4,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    badgeTextColor: '#991B1B',
    description: 'Immediate danger, major campus-wide disruption, power outage, or severe safety risk (4h SLA).',
  },
  HIGH: {
    id: 'HIGH',
    label: 'High',
    slaHours: 12,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    badgeTextColor: '#9A3412',
    description: 'Significant disruption impacting academic classes or departments (12h SLA).',
  },
  MEDIUM: {
    id: 'MEDIUM',
    label: 'Medium',
    slaHours: 24,
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    badgeTextColor: '#92400E',
    description: 'Standard operational issue affecting regular workflow or comfort (24h SLA).',
  },
  LOW: {
    id: 'LOW',
    label: 'Low',
    slaHours: 72,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    badgeTextColor: '#1E40AF',
    description: 'Minor cosmetic or routine maintenance request (72h SLA).',
  },
};

export const PRIORITY_LIST = Object.values(COMPLAINT_PRIORITIES);
