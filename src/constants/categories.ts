import { ComplaintCategory } from '../types/complaint';

export interface CategoryConfig {
  id: ComplaintCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  defaultDepartmentCode: string;
  description: string;
}

export const COMPLAINT_CATEGORIES: Record<ComplaintCategory, CategoryConfig> = {
  INFRASTRUCTURE: {
    id: 'INFRASTRUCTURE',
    label: 'Infrastructure',
    icon: 'business-outline',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    defaultDepartmentCode: 'MAINT',
    description: 'Structural issues, doors, windows, paint, masonry, or campus fixtures.',
  },
  ELECTRICITY: {
    id: 'ELECTRICITY',
    label: 'Electricity',
    icon: 'flash-outline',
    color: '#EAB308',
    bgColor: '#FEFCE8',
    defaultDepartmentCode: 'ELEC',
    description: 'Power outages, switchboards, lights, fans, or faulty wiring.',
  },
  WATER: {
    id: 'WATER',
    label: 'Water',
    icon: 'water-outline',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    defaultDepartmentCode: 'MAINT',
    description: 'Water coolers, supply disruptions, leakages, or purification units.',
  },
  CLEANLINESS: {
    id: 'CLEANLINESS',
    label: 'Cleanliness',
    icon: 'trash-outline',
    color: '#10B981',
    bgColor: '#ECFDF5',
    defaultDepartmentCode: 'HOUSE',
    description: 'Corridor litter, garbage disposal, dusting, or general hygiene.',
  },
  WIFI_INTERNET: {
    id: 'WIFI_INTERNET',
    label: 'Wi-Fi / Internet',
    icon: 'wifi-outline',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    defaultDepartmentCode: 'IT',
    description: 'Network outages, slow speeds, captive portal logins, or router faults.',
  },
  CLASSROOM: {
    id: 'CLASSROOM',
    label: 'Classroom',
    icon: 'school-outline',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    defaultDepartmentCode: 'ADMIN',
    description: 'Projectors, smartboards, podium mics, podiums, benches, or ACs.',
  },
  WASHROOM: {
    id: 'WASHROOM',
    label: 'Washroom',
    icon: 'fitness-outline',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    defaultDepartmentCode: 'HOUSE',
    description: 'Sanitation, taps, flushes, soap dispensers, or odor problems.',
  },
  CANTEEN: {
    id: 'CANTEEN',
    label: 'Canteen',
    icon: 'restaurant-outline',
    color: '#F97316',
    bgColor: '#FFF7ED',
    defaultDepartmentCode: 'CANT',
    description: 'Food quality, hygiene, pricing, seating, or billing disputes.',
  },
  TRANSPORT: {
    id: 'TRANSPORT',
    label: 'Transport',
    icon: 'bus-outline',
    color: '#14B8A6',
    bgColor: '#F0FDFA',
    defaultDepartmentCode: 'TRANS',
    description: 'Bus schedule delays, driver conduct, vehicle maintenance, or stops.',
  },
  SECURITY: {
    id: 'SECURITY',
    label: 'Security',
    icon: 'shield-checkmark-outline',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    defaultDepartmentCode: 'SEC',
    description: 'Lost and found, gate security, unauthorized entry, or safety hazards.',
  },
  LIBRARY: {
    id: 'LIBRARY',
    label: 'Library',
    icon: 'book-outline',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    defaultDepartmentCode: 'LIB',
    description: 'Book cataloging, reading hall AC, noise disturbance, or digital kiosks.',
  },
  ENVIRONMENT: {
    id: 'ENVIRONMENT',
    label: 'Environment',
    icon: 'leaf-outline',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    defaultDepartmentCode: 'MAINT',
    description: 'Campus lawns, tree hazards, stray animals, or drainage issues.',
  },
  OTHER: {
    id: 'OTHER',
    label: 'Other',
    icon: 'help-circle-outline',
    color: '#64748B',
    bgColor: '#F8FAFC',
    defaultDepartmentCode: 'ADMIN',
    description: 'Miscellaneous campus requests or unlisted concerns.',
  },
};

export const CATEGORY_LIST = Object.values(COMPLAINT_CATEGORIES);
