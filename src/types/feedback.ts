export interface ComplaintFeedback {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userRole: string;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
}
