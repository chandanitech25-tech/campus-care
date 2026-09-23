import { ComplaintStatus } from '../types/complaint';

export interface StatusConfig {
  id: ComplaintStatus;
  label: string;
  order: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  description: string;
}

export const COMPLAINT_STATUSES: Record<ComplaintStatus, StatusConfig> = {
  SUBMITTED: {
    id: 'SUBMITTED',
    label: 'Submitted',
    order: 1,
    color: '#64748B',
    bgColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    textColor: '#334155',
    icon: 'paper-plane-outline',
    description: 'Complaint registered by student/faculty and logged in the system.',
  },
  UNDER_REVIEW: {
    id: 'UNDER_REVIEW',
    label: 'Under Review',
    order: 2,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    textColor: '#1D4ED8',
    icon: 'search-outline',
    description: 'Campus administration is verifying details and assessing priority.',
  },
  ASSIGNED: {
    id: 'ASSIGNED',
    label: 'Assigned',
    order: 3,
    color: '#4338CA',
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    textColor: '#3730A3',
    icon: 'person-add-outline',
    description: 'Assigned to the relevant department and specialized staff member.',
  },
  IN_PROGRESS: {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    order: 4,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    icon: 'hammer-outline',
    description: 'On-site remediation or technical repair is currently underway.',
  },
  RESOLVED: {
    id: 'RESOLVED',
    label: 'Resolved',
    order: 5,
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    icon: 'checkmark-circle-outline',
    description: 'Fix completed. Awaiting user verification and feedback.',
  },
  CLOSED: {
    id: 'CLOSED',
    label: 'Closed',
    order: 6,
    color: '#475569',
    bgColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    textColor: '#1E293B',
    icon: 'lock-closed-outline',
    description: 'Feedback received or ticket closed after confirmation.',
  },
};

export const STATUS_ORDER: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

export const STATUS_LIST = STATUS_ORDER.map((status) => COMPLAINT_STATUSES[status]);
