import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/user';
import { MOCK_USERS } from '../services/mockData';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  register: (data: { name: string; email: string; role: UserRole; studentId?: string; department?: string }) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AUTH_STORAGE_KEY = '@campuscare_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(MOCK_USERS.student);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const stored = await storage.getItem<User | null>(AUTH_STORAGE_KEY, MOCK_USERS.student);
        setUser(stored);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (selectedRole: UserRole, email?: string, password?: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check for Chandani's demo credentials
    if (cleanEmail === 'chandani.chaurasiya.sot25@gmail.com') {
      if (cleanPass && cleanPass !== 'Chandani@25') {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
      const targetUser = MOCK_USERS.chandani;
      setUser(targetUser);
      await storage.setItem(AUTH_STORAGE_KEY, targetUser);
      return;
    }

    let targetUser: User;
    if (cleanEmail === MOCK_USERS.admin.email.toLowerCase() || selectedRole === 'ADMIN') {
      targetUser = MOCK_USERS.admin;
    } else if (cleanEmail === MOCK_USERS.faculty.email.toLowerCase() || selectedRole === 'FACULTY') {
      targetUser = MOCK_USERS.faculty;
    } else {
      targetUser = MOCK_USERS.student;
    }

    if (email) {
      targetUser = { ...targetUser, email: email.trim() };
    }

    setUser(targetUser);
    await storage.setItem(AUTH_STORAGE_KEY, targetUser);
  };

  const register = async (data: {
    name: string;
    email: string;
    role: UserRole;
    studentId?: string;
    department?: string;
  }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      studentId: data.studentId,
      department: data.department,
    };
    setUser(newUser);
    await storage.setItem(AUTH_STORAGE_KEY, newUser);
  };

  const switchRole = async (newRole: UserRole) => {
    if (user && user.id === 'user-chandani-1') {
      const updated = { ...user, role: newRole };
      setUser(updated);
      await storage.setItem(AUTH_STORAGE_KEY, updated);
      return;
    }
    await login(newRole);
  };

  const logout = async () => {
    setUser(null);
    await storage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await storage.setItem(AUTH_STORAGE_KEY, updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'STUDENT',
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        switchRole,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
