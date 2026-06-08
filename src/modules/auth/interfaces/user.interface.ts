// src/modules/auth/interfaces/user.interface.ts

export interface User {
  id: string;
  firebaseUid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role: 'admin' | 'manager' | 'viewer';
  isActive: boolean;
  authProvider: 'google' | 'phone';
  createdAt: Date;
  updatedAt: Date;
}

export const USER_ROLES = ['admin', 'manager', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];