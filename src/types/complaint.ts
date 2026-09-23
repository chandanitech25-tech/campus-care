import { UserRole } from './user';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintCategory =
  | 'INFRASTRUCTURE'
  | 'ELECTRICITY'
  | 'WATER'
  | 'CLEANLINESS'
  | 'WIFI_INTERNET'
  | 'CLASSROOM'
  | 'WASHROOM'
  | 'CANTEEN'
  | 'TRANSPORT'
  | 'SECURITY'
  | 'LIBRARY'
  | 'ENVIRONMENT'
  | 'OTHER';

export interface LocationInfo {
  building: string;
  floor: string;
  roomArea: string;
}

export interface EvidenceItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  name?: string;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  actorName: string;
  actorRole: string;
  comment?: string;
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location: LocationInfo;
  evidence: EvidenceItem[];
  isAnonymous: boolean;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
  };
  assignedDepartmentId?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  slaTargetHours: number;
  slaDeadline: string;
  timeline: TimelineEvent[];
  internalNotes: InternalNote[];
  feedbackId?: string;
  followersCount: number;
}
