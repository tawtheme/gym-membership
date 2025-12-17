import { Injectable } from '@angular/core';
import { Member, PaymentTransaction, Reminder, BackupSettings } from '../models/member.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private membersCache: Member[] | null = null;
  private transactionsCache: PaymentTransaction[] | null = null;
  private remindersCache: Reminder[] | null = null;
  private backupSettingsCache: BackupSettings | null = null;
  // NOTE: This service is now a **pure in-memory/web-only** store.
  // It no longer loads JSON files from assets. All data starts empty
  // in the browser and lives only for the duration of the session.

  // Users
  async getUsers(): Promise<any[]> {
    // Simple web-only default user for login when SQLite is not available
    return [
      {
        mobile_number: '9816810805',
        pin: '4842'
      }
    ];
  }

  // Members
  async getMembers(): Promise<Member[]> {
    if (this.membersCache) {
      return this.membersCache;
    }
    // Start with empty list on web
    this.membersCache = [];
    return this.membersCache;
  }

  async getMember(id: string): Promise<Member | null> {
    const members = await this.getMembers();
    return members.find(m => m.id === id) || null;
  }

  async addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const members = await this.getMembers();
    const newMember: Member = {
      ...member,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.membersCache = [...members, newMember];
    return newMember.id;
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<boolean> {
    const members = await this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1 || !this.membersCache) return false;
    
    this.membersCache[index] = {
      ...this.membersCache[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return true;
  }

  async deleteMember(id: string): Promise<boolean> {
    const members = await this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.membersCache = members.filter(m => m.id !== id);
    // Also delete related transactions and reminders
    if (this.transactionsCache) {
      this.transactionsCache = this.transactionsCache.filter(t => t.memberId !== id);
    }
    if (this.remindersCache) {
      this.remindersCache = this.remindersCache.filter(r => r.memberId !== id);
    }
    return true;
  }

  // Payment Transactions
  async getPaymentTransactions(memberId?: string): Promise<PaymentTransaction[]> {
    if (this.transactionsCache) {
      return memberId 
        ? this.transactionsCache.filter(t => t.memberId === memberId)
        : this.transactionsCache;
    }
    this.transactionsCache = [];
    return memberId 
      ? this.transactionsCache.filter(t => t.memberId === memberId)
      : this.transactionsCache;
  }

  async addPaymentTransaction(transaction: Omit<PaymentTransaction, 'id' | 'createdAt'>): Promise<string> {
    const transactions = await this.getPaymentTransactions();
    const newTransaction: PaymentTransaction = {
      ...transaction,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString()
    };
    this.transactionsCache = [...transactions, newTransaction];
    return newTransaction.id;
  }

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    if (this.remindersCache) {
      return this.remindersCache;
    }
    this.remindersCache = [];
    return this.remindersCache;
  }

  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    const reminders = await this.getReminders();
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString()
    };
    this.remindersCache = [...reminders, newReminder];
    return newReminder.id;
  }

  // Backup Settings
  async getBackupSettings(): Promise<BackupSettings> {
    if (this.backupSettingsCache) {
      return this.backupSettingsCache;
    }
    this.backupSettingsCache = { frequency: 'weekly', isEnabled: false };
    return this.backupSettingsCache;
  }

  async updateBackupSettings(settings: BackupSettings): Promise<void> {
    this.backupSettingsCache = { ...settings };
  }

  // Clear cache (useful for testing or refresh)
  clearCache(): void {
    this.membersCache = null;
    this.transactionsCache = null;
    this.remindersCache = null;
    this.backupSettingsCache = null;
  }
}
