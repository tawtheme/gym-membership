import { Injectable } from '@angular/core';
import { DatabaseOperationsService } from '../database';
import { Member, Reminder, BackupSettings } from '../models/member.interface';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  constructor(private dbOps: DatabaseOperationsService) {}

  // Member CRUD operations
  async addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.dbOps.addMember(member);
  }

  async getMember(id: string): Promise<Member | null> {
    return await this.dbOps.getMember(id);
  }

  async getAllMembers(): Promise<Member[]> {
    return await this.dbOps.getAllMembers();
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<boolean> {
    return await this.dbOps.updateMember(id, updates);
  }

  async deleteMember(id: string): Promise<boolean> {
    return await this.dbOps.deleteMember(id);
  }

  // Reminder operations
  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    return await this.dbOps.addReminder(reminder);
  }

  async getAllReminders(): Promise<Reminder[]> {
    return await this.dbOps.getAllReminders();
  }

  // Backup operations
  async getBackupSettings(): Promise<BackupSettings> {
    return await this.dbOps.getBackupSettings();
  }

  async updateBackupSettings(settings: BackupSettings): Promise<void> {
    await this.dbOps.updateBackupSettings(settings);
  }

  async createBackup(): Promise<string> {
    const members = await this.getAllMembers();
    const reminders = await this.getAllReminders();
    const backupSettings = await this.getBackupSettings();
    
    const backup = {
      timestamp: new Date().toISOString(),
      members,
      reminders,
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
    return await this.dbOps.authenticateUser(mobileNumber, pin);
  }

  // Get database file path
  async getDatabasePath(): Promise<string> {
    return await this.dbOps.getDatabasePath();
  }
}