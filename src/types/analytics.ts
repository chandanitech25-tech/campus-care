import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from './complaint';

export interface CategoryMetric {
  category: ComplaintCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DepartmentMetric {
  departmentId: string;
  departmentName: string;
  count: number;
  resolvedCount: number;
  slaBreachCount: number;
}

export interface StatusMetric {
  status: ComplaintStatus;
  label: string;
  count: number;
  color: string;
}

export interface PriorityMetric {
  priority: ComplaintPriority;
  label: string;
  count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  submitted: number;
  resolved: number;
}

export interface AnalyticsSummary {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  criticalComplaints: number;
  slaBreachedCount: number;
  avgResolutionHours: number;
  categories: CategoryMetric[];
  departments: DepartmentMetric[];
  statuses: StatusMetric[];
  priorities: PriorityMetric[];
  monthlyTrends: MonthlyTrend[];
}
