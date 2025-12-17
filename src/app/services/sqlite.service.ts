import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Member, Reminder, BackupSettings, PaymentTransaction } from '../models/member.interface';
import { DatabaseOperationsService } from '../database';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  constructor(
    private dbOps: DatabaseOperationsService,
    private dataService: DataService
  ) {
    this.isNative = Capacitor.getPlatform() !== 'web';
    if (!this.isNative) {
      console.log('SqliteService: running on web - using in-memory DataService instead of SQLite');
    }
  }

  private isNative: boolean;

  // Member CRUD operations
  async addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (this.isNative) {
      return await this.dbOps.addMember(member);
    }
    return await this.dataService.addMember(member);
  }

  async getMember(id: string): Promise<Member | null> {
    if (this.isNative) {
      return await this.dbOps.getMember(id);
    }
    return await this.dataService.getMember(id);
  }

  async getAllMembers(): Promise<Member[]> {
    if (this.isNative) {
      return await this.dbOps.getAllMembers();
    }
    return await this.dataService.getMembers();
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<boolean> {
    if (this.isNative) {
      return await this.dbOps.updateMember(id, updates);
    }
    return await this.dataService.updateMember(id, updates);
  }

  async deleteMember(id: string): Promise<boolean> {
    if (this.isNative) {
      return await this.dbOps.deleteMember(id);
    }
    return await this.dataService.deleteMember(id);
  }

  // Reminder operations
  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    if (this.isNative) {
      return await this.dbOps.addReminder(reminder);
    }
    return await this.dataService.addReminder(reminder);
  }

  async getAllReminders(): Promise<Reminder[]> {
    if (this.isNative) {
      return await this.dbOps.getAllReminders();
    }
    return await this.dataService.getReminders();
  }

  // Payment transaction operations
  async addPaymentTransaction(transaction: Omit<PaymentTransaction, 'id' | 'createdAt'>): Promise<string> {
    if (this.isNative) {
      return await this.dbOps.addPaymentTransaction(transaction);
    }
    return await this.dataService.addPaymentTransaction(transaction);
  }

  async getPaymentTransactions(memberId?: string): Promise<PaymentTransaction[]> {
    if (this.isNative) {
      return await this.dbOps.getPaymentTransactions(memberId);
    }
    return await this.dataService.getPaymentTransactions(memberId);
  }

  // Backup operations
  async getBackupSettings(): Promise<BackupSettings> {
    if (this.isNative) {
      return await this.dbOps.getBackupSettings();
    }
    return await this.dataService.getBackupSettings();
  }

  async updateBackupSettings(settings: BackupSettings): Promise<void> {
    if (this.isNative) {
      await this.dbOps.updateBackupSettings(settings);
    } else {
      await this.dataService.updateBackupSettings(settings);
    }
  }

  async clearAllData(): Promise<void> {
    if (this.isNative) {
      await this.dbOps.clearAllData();
    } else {
      // On web, just clear in-memory caches
      this.dataService.clearCache();
    }
  }

  async createBackup(): Promise<string> {
    const members = await this.getAllMembers();
    const reminders = await this.getAllReminders();
    const payments = await this.getPaymentTransactions();
    const backupSettings = await this.getBackupSettings();
    
    const backup = {
      timestamp: new Date().toISOString(),
      members,
      reminders,
      payments,
      backupSettings
    };
    
    return JSON.stringify(backup, null, 2);
  }

  async restoreBackup(backupData: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupData);
      
      // Clear existing data
      // Note: This would need to be implemented in DatabaseOperationsService
      console.log('Backup restore functionality needs to be implemented');
      return true;
    } catch (error) {
      console.error('Backup restore error:', error);
      return false;
    }
  }

  // User authentication
  async authenticateUser(mobileNumber: string, pin: string): Promise<boolean> {
    if (this.isNative) {
      return await this.dbOps.authenticateUser(mobileNumber, pin);
    }
    const users = await this.dataService.getUsers();
    const user = users.find(u => u.mobile_number === mobileNumber && u.pin === pin);
    return !!user;
  }

  // Get database file path (not applicable for JSON)
  async getDatabasePath(): Promise<string> {
    if (this.isNative) {
      return await this.dbOps.getDatabasePath();
    }
    return 'web-in-memory';
  }
}