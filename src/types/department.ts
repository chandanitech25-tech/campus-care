export interface Department {
  id: string;
  name: string;
  code: string;
  leadName: string;
  email: string;
  phone: string;
  staffCount: number;
  activeTicketsCount: number;
  iconName: string;
}

export interface StaffMember {
  id: string;
  name: string;
  departmentId: string;
  role: string;
  email: string;
  phone: string;
}
