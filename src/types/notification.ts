export type NotificationType =
  | 'COMPLAINT_SUBMITTED'
  | 'COMPLAINT_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'COMPLAINT_RESOLVED'
  | 'COMPLAINT_REOPENED'
  | 'SLA_APPROACHING'
  | 'SLA_BREACHED';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  complaintId?: string;
  read: boolean;
  createdAt: string;
}
