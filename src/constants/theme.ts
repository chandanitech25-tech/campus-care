import { Platform } from 'react-native';

export const THEME = {
  colors: {
    primary: '#4338CA', // Deep Indigo-700
    primaryHover: '#3730A3', // Indigo-800
    primaryLight: '#EEF2FF', // Indigo-50
    primaryBorder: '#C7D2FE', // Indigo-200

    accent: '#0D9488', // Teal-600
    accentLight: '#F0FDFA', // Teal-50
    accentBorder: '#99F6E4',

    secondary: '#10B981', // Emerald-500
    secondaryLight: '#ECFDF5',

    warning: '#D97706', // Amber-600
    warningLight: '#FFFBEB',
    warningBorder: '#FDE68A',

    danger: '#DC2626', // Red-600
    dangerLight: '#FEF2F2',
    dangerBorder: '#FECACA',

    info: '#2563EB', // Blue-600
    infoLight: '#EFF6FF',
    infoBorder: '#BFDBFE',

    // Grayscale
    background: '#F8FAFC', // Slate-50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9', // Slate-100
    border: '#E2E8F0', // Slate-200
    borderFocus: '#4338CA',

    // Text
    text: '#0F172A', // Slate-900
    textMuted: '#64748B', // Slate-500
    textLight: '#94A3B8', // Slate-400
    textInverse: '#FFFFFF',

    // Status colors
    statusSubmitted: '#64748B',
    statusUnderReview: '#2563EB',
    statusAssigned: '#7C3AED',
    statusInProgress: '#D97706',
    statusResolved: '#0D9488',
    statusClosed: '#475569',
  },

  typography: {
    fontFamily: {
      sans: 'System',
    },
    size: {
      xs: 12,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      heading: 26,
      display: 32,
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },

  layout: {
    inputHeight: 44,
    buttonHeight: 44,
    buttonHeightSm: 34,
    cardPadding: 16,
  },

  shadows: {
    sm: Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      },
    }) as any,
    md: Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
      },
    }) as any,
    lg: Platform.select({
      web: {
        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      },
    }) as any,
  },

  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1280,
  },
};

export const CAMPUS_BUILDINGS = [
  'Engineering Block A',
  'Science Block B',
  'Management & Law Block C',
  'Central Library',
  'Main Administrative Complex',
  'Student Activity Center (SAC)',
  'Boys Hostel Block 1',
  'Boys Hostel Block 2',
  'Girls Hostel Block 1',
  'Sports Complex & Gym',
  'Central Canteen & Food Court',
];

export const CAMPUS_FLOORS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  'Basement',
  'Open Campus Grounds',
];
