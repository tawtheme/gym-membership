import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Member, PaymentTransaction, Reminder, BackupSettings } from '../models/member.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private membersCache: Member[] | null = null;
  private transactionsCache: PaymentTransaction[] | null = null;
  private remindersCache: Reminder[] | null = null;
  private backupSettingsCache: BackupSettings | null = null;

  constructor(private http: HttpClient) {}

  // Users
  async getUsers(): Promise<any[]> {
    try {
      const data = await this.http.get<any[]>('assets/data/users.json').toPromise();
      return data || [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Members
  async getMembers(): Promise<Member[]> {
    if (this.membersCache) {
      return this.membersCache;
    }
    try {
      const data = await this.http.get<Member[]>('assets/data/members.json').toPromise();
      this.membersCache = data || [];
      return this.membersCache;
    } catch (error) {
      console.error('Error loading members:', error);
      return [];
    }
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
    try {
      const data = await this.http.get<PaymentTransaction[]>('assets/data/payment-transactions.json').toPromise();
      this.transactionsCache = data || [];
      return memberId 
        ? this.transactionsCache.filter(t => t.memberId === memberId)
        : this.transactionsCache;
    } catch (error) {
      console.error('Error loading payment transactions:', error);
      return [];
    }
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
    try {
      const data = await this.http.get<Reminder[]>('assets/data/reminders.json').toPromise();
      this.remindersCache = data || [];
      return this.remindersCache;
    } catch (error) {
      console.error('Error loading reminders:', error);
      return [];
    }
  }

  // Backup Settings
  async getBackupSettings(): Promise<BackupSettings> {
    if (this.backupSettingsCache) {
      return this.backupSettingsCache;
    }
    try {
      const data = await this.http.get<BackupSettings>('assets/data/backup-settings.json').toPromise();
      this.backupSettingsCache = data || { frequency: 'weekly', isEnabled: false };
      return this.backupSettingsCache;
    } catch (error) {
      console.error('Error loading backup settings:', error);
      return { frequency: 'weekly', isEnabled: false };
    }
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
