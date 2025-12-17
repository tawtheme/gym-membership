export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  membershipType: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  memberId: string;
  type: 'payment' | 'renewal' | 'custom';
  title: string;
  message: string;
  scheduledDate: string;
  isSent: boolean;
  createdAt: string;
}

export interface BackupSettings {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastBackup?: string;
  nextBackup?: string;
  isEnabled: boolean;
}

export interface PaymentTransaction {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'cash' | 'card' | 'online' | 'upi';
  description?: string;
  createdAt: string;
}
