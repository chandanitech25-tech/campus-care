import { storage } from './storage';
import { Complaint, ComplaintPriority, ComplaintStatus, InternalNote, LocationInfo, TimelineEvent, EvidenceItem } from '../types/complaint';
import { ComplaintFeedback } from '../types/feedback';
import { AppNotification } from '../types/notification';
import { INITIAL_COMPLAINTS, INITIAL_FEEDBACK, INITIAL_NOTIFICATIONS } from './mockData';
import { calculateSlaDeadline } from './slaService';
import { COMPLAINT_PRIORITIES } from '../constants/priority';
import { COMPLAINT_CATEGORIES } from '../constants/categories';
import { DEPARTMENTS, MOCK_STAFF } from '../constants/departments';

const STORAGE_KEYS = {
  COMPLAINTS: '@campuscare_complaints',
  FEEDBACK: '@campuscare_feedback',
  NOTIFICATIONS: '@campuscare_notifications',
};

class ComplaintService {
  private async getStoredComplaints(): Promise<Complaint[]> {
    return storage.getItem<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }

  private async saveComplaints(complaints: Complaint[]): Promise<void> {
    await storage.setItem(STORAGE_KEYS.COMPLAINTS, complaints);
  }

  async getComplaints(): Promise<Complaint[]> {
    return this.getStoredComplaints();
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    const complaints = await this.getStoredComplaints();
    return complaints.find((c) => c.id === id) || null;
  }

  async createComplaint(data: {
    title: string;
    description: string;
    category: Complaint['category'];
    priority: ComplaintPriority;
    location: LocationInfo;
    evidence: EvidenceItem[];
    isAnonymous: boolean;
    user: { id: string; name: string; role: Complaint['createdBy']['role']; email: string };
  }): Promise<Complaint> {
    const complaints = await this.getStoredComplaints();
    const nextNum = complaints.length + 101;
    const ticketNumber = `CC-2024-${String(nextNum).padStart(5, '0')}`;
    const now = new Date().toISOString();
    const slaTargetHours = COMPLAINT_PRIORITIES[data.priority].slaHours;
    const slaDeadline = calculateSlaDeadline(now, data.priority).toISOString();

    // Auto-assign default department based on category
    const catConfig = COMPLAINT_CATEGORIES[data.category];
    const defaultDept = DEPARTMENTS.find((d) => d.code === catConfig?.defaultDepartmentCode);

    const initialTimeline: TimelineEvent[] = [
      {
        id: `tl-${Date.now()}-1`,
        status: 'SUBMITTED',
        timestamp: now,
        actorName: data.isAnonymous ? 'Anonymous' : data.user.name,
        actorRole: data.user.role === 'STUDENT' ? 'Student' : data.user.role === 'FACULTY' ? 'Faculty' : 'Admin',
        comment: 'Complaint officially registered in CampusCare.',
      },
    ];

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      priority: data.priority,
      status: 'SUBMITTED',
      location: data.location,
      evidence: data.evidence,
      isAnonymous: data.isAnonymous,
      createdBy: {
        id: data.user.id,
        name: data.isAnonymous ? 'Anonymous Student' : data.user.name,
        role: data.user.role,
        email: data.user.email,
      },
      assignedDepartmentId: defaultDept?.id,
      createdAt: now,
      updatedAt: now,
      slaTargetHours,
      slaDeadline,
      timeline: initialTimeline,
      internalNotes: [],
      followersCount: 1,
    };

    const updated = [newComplaint, ...complaints];
    await this.saveComplaints(updated);

    // Create a notification for the submitter
    await this.addNotification({
      userId: data.user.id,
      title: 'Complaint Submitted Successfully',
      message: `Ticket #${ticketNumber} has been logged under ${catConfig?.label || 'General'}.`,
      type: 'COMPLAINT_SUBMITTED',
      complaintId: newComplaint.id,
    });

    return newComplaint;
  }

  async updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    actorName: string,
    actorRole: string,
    comment?: string
  ): Promise<Complaint | null> {
    const complaints = await this.getStoredComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const now = new Date().toISOString();

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      status: newStatus,
      timestamp: now,
      actorName,
      actorRole,
      comment: comment || `Status updated to ${newStatus.replace('_', ' ')}.`,
    };

    const updatedComplaint: Complaint = {
      ...complaint,
      status: newStatus,
      updatedAt: now,
      resolvedAt: newStatus === 'RESOLVED' ? now : complaint.resolvedAt,
      closedAt: newStatus === 'CLOSED' ? now : complaint.closedAt,
      timeline: [...complaint.timeline, timelineEvent],
    };

    complaints[index] = updatedComplaint;
    await this.saveComplaints(complaints);

    // Notify submitter of status change
    await this.addNotification({
      userId: complaint.createdBy.id,
      title: `Status: ${newStatus.replace('_', ' ')}`,
      message: `Your complaint #${complaint.ticketNumber} "${complaint.title}" is now ${newStatus.replace('_', ' ')}.`,
      type: newStatus === 'RESOLVED' ? 'COMPLAINT_RESOLVED' : 'STATUS_CHANGED',
      complaintId: complaint.id,
    });

    return updatedComplaint;
  }

  async assignComplaint(
    complaintId: string,
    departmentId: string,
    staffId?: string,
    actorName: string = 'Admin'
  ): Promise<Complaint | null> {
    const complaints = await this.getStoredComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const now = new Date().toISOString();
    const dept = DEPARTMENTS.find((d) => d.id === departmentId);
    const staff = MOCK_STAFF.find((s) => s.id === staffId);

    const timelineComment = staff
      ? `Assigned to ${dept?.name} Dept, technician: ${staff.name}.`
      : `Assigned to ${dept?.name || 'Department'}.`;

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'ASSIGNED',
      timestamp: now,
      actorName,
      actorRole: 'Admin',
      comment: timelineComment,
    };

    const updatedComplaint: Complaint = {
      ...complaint,
      assignedDepartmentId: departmentId,
      assignedStaffId: staffId,
      assignedStaffName: staff?.name,
      status: complaint.status === 'SUBMITTED' || complaint.status === 'UNDER_REVIEW' ? 'ASSIGNED' : complaint.status,
      updatedAt: now,
      timeline: [...complaint.timeline, timelineEvent],
    };

    complaints[index] = updatedComplaint;
    await this.saveComplaints(complaints);

    // Notify user
    await this.addNotification({
      userId: complaint.createdBy.id,
      title: 'Department Assigned',
      message: `Your complaint #${complaint.ticketNumber} has been assigned to ${dept?.name || 'the department'}.`,
      type: 'COMPLAINT_ASSIGNED',
      complaintId: complaint.id,
    });

    return updatedComplaint;
  }

  async updatePriority(
    complaintId: string,
    priority: ComplaintPriority,
    actorName: string = 'Admin'
  ): Promise<Complaint | null> {
    const complaints = await this.getStoredComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const now = new Date().toISOString();
    const slaTargetHours = COMPLAINT_PRIORITIES[priority].slaHours;
    const slaDeadline = calculateSlaDeadline(complaint.createdAt, priority).toISOString();

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      status: complaint.status,
      timestamp: now,
      actorName,
      actorRole: 'Admin',
      comment: `Priority updated from ${complaint.priority} to ${priority} (${slaTargetHours}h SLA).`,
    };

    const updated: Complaint = {
      ...complaint,
      priority,
      slaTargetHours,
      slaDeadline,
      updatedAt: now,
      timeline: [...complaint.timeline, timelineEvent],
    };

    complaints[index] = updated;
    await this.saveComplaints(complaints);
    return updated;
  }

  async addInternalNote(
    complaintId: string,
    authorId: string,
    authorName: string,
    text: string
  ): Promise<Complaint | null> {
    const complaints = await this.getStoredComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const newNote: InternalNote = {
      id: `note-${Date.now()}`,
      authorId,
      authorName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated: Complaint = {
      ...complaint,
      internalNotes: [...complaint.internalNotes, newNote],
      updatedAt: new Date().toISOString(),
    };

    complaints[index] = updated;
    await this.saveComplaints(complaints);
    return updated;
  }

  async followComplaint(complaintId: string): Promise<Complaint | null> {
    const complaints = await this.getStoredComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const updated: Complaint = {
      ...complaint,
      followersCount: complaint.followersCount + 1,
    };

    complaints[index] = updated;
    await this.saveComplaints(complaints);
    return updated;
  }

  // Feedback Methods
  async getFeedback(): Promise<ComplaintFeedback[]> {
    return storage.getItem<ComplaintFeedback[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
  }

  async submitFeedback(data: {
    complaintId: string;
    userId: string;
    userName: string;
    userRole: string;
    rating: number;
    comment?: string;
  }): Promise<ComplaintFeedback> {
    const feedbackList = await this.getFeedback();
    const existing = feedbackList.find((f) => f.complaintId === data.complaintId);
    if (existing) {
      throw new Error('Feedback already submitted for this complaint.');
    }

    const newFeedback: ComplaintFeedback = {
      id: `fb-${Date.now()}`,
      complaintId: data.complaintId,
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      rating: data.rating,
      comment: data.comment?.trim(),
      createdAt: new Date().toISOString(),
    };

    await storage.setItem(STORAGE_KEYS.FEEDBACK, [newFeedback, ...feedbackList]);

    // Update complaint with feedbackId
    const complaints = await this.getStoredComplaints();
    const compIdx = complaints.findIndex((c) => c.id === data.complaintId);
    if (compIdx !== -1) {
      complaints[compIdx].feedbackId = newFeedback.id;
      complaints[compIdx].updatedAt = new Date().toISOString();
      await this.saveComplaints(complaints);
    }

    return newFeedback;
  }

  // Notifications Methods
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const all = await storage.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return all;
    return all.filter((n) => n.userId === userId || n.userId === 'all');
  }

  async addNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification> {
    const all = await this.getNotifications();
    const newNotif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...all]);
    return newNotif;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const all = await this.getNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  async markAllNotificationsAsRead(userId?: string): Promise<void> {
    const all = await this.getNotifications();
    const updated = all.map((n) => (!userId || n.userId === userId ? { ...n, read: true } : n));
    await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  async resetToDemoData(): Promise<void> {
    await storage.setItem(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    await storage.setItem(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
    await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
}

export const complaintService = new ComplaintService();
