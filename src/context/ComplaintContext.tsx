import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Complaint, ComplaintPriority, ComplaintStatus, EvidenceItem, LocationInfo } from '../types/complaint';
import { complaintService } from '../services/complaintService';
import { useAuth } from './AuthContext';

interface ComplaintContextType {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;
  refreshComplaints: () => Promise<void>;
  getComplaintById: (id: string) => Complaint | undefined;
  createComplaint: (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    priority: ComplaintPriority;
    location: LocationInfo;
    evidence: EvidenceItem[];
    isAnonymous: boolean;
  }) => Promise<Complaint>;
  updateStatus: (
    complaintId: string,
    status: ComplaintStatus,
    comment?: string
  ) => Promise<Complaint | null>;
  assignComplaint: (
    complaintId: string,
    departmentId: string,
    staffId?: string
  ) => Promise<Complaint | null>;
  updatePriority: (complaintId: string, priority: ComplaintPriority) => Promise<Complaint | null>;
  addNote: (complaintId: string, text: string) => Promise<Complaint | null>;
  followComplaint: (complaintId: string) => Promise<void>;
  submitFeedback: (complaintId: string, rating: number, comment?: string) => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await complaintService.getComplaints();
      setComplaints(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshComplaints();
  }, [refreshComplaints]);

  const getComplaintById = (id: string) => {
    return complaints.find((c) => c.id === id);
  };

  const createComplaint = async (data: {
    title: string;
    description: string;
    category: Complaint['category'];
    priority: ComplaintPriority;
    location: LocationInfo;
    evidence: EvidenceItem[];
    isAnonymous: boolean;
  }): Promise<Complaint> => {
    if (!user) throw new Error('You must be logged in to report an issue.');

    const newComplaint = await complaintService.createComplaint({
      ...data,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  const updateStatus = async (
    complaintId: string,
    status: ComplaintStatus,
    comment?: string
  ): Promise<Complaint | null> => {
    const actorName = user?.name || 'Staff Member';
    const actorRole = user?.role === 'ADMIN' ? 'Admin' : 'Staff';
    const updated = await complaintService.updateComplaintStatus(
      complaintId,
      status,
      actorName,
      actorRole,
      comment
    );

    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
    }
    return updated;
  };

  const assignComplaint = async (
    complaintId: string,
    departmentId: string,
    staffId?: string
  ): Promise<Complaint | null> => {
    const actorName = user?.name || 'Admin';
    const updated = await complaintService.assignComplaint(
      complaintId,
      departmentId,
      staffId,
      actorName
    );

    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
    }
    return updated;
  };

  const updatePriority = async (
    complaintId: string,
    priority: ComplaintPriority
  ): Promise<Complaint | null> => {
    const actorName = user?.name || 'Admin';
    const updated = await complaintService.updatePriority(complaintId, priority, actorName);
    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
    }
    return updated;
  };

  const addNote = async (complaintId: string, text: string): Promise<Complaint | null> => {
    if (!user) return null;
    const updated = await complaintService.addInternalNote(
      complaintId,
      user.id,
      user.name,
      text
    );
    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
    }
    return updated;
  };

  const followComplaint = async (complaintId: string): Promise<void> => {
    const updated = await complaintService.followComplaint(complaintId);
    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
    }
  };

  const submitFeedback = async (
    complaintId: string,
    rating: number,
    comment?: string
  ): Promise<void> => {
    if (!user) throw new Error('Must be logged in to submit feedback');
    await complaintService.submitFeedback({
      complaintId,
      userId: user.id,
      userName: user.name,
      userRole: user.role === 'STUDENT' ? 'Student' : 'Faculty',
      rating,
      comment,
    });
    await refreshComplaints();
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        isLoading,
        error,
        refreshComplaints,
        getComplaintById,
        createComplaint,
        updateStatus,
        assignComplaint,
        updatePriority,
        addNote,
        followComplaint,
        submitFeedback,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export function useComplaints(): ComplaintContextType {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
