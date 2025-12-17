import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Member, Reminder, BackupSettings } from '../models/member.interface';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  constructor(private dataService: DataService) {}

  // Member CRUD operations
  async addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.dataService.addMember(member);
  }

  async getMember(id: string): Promise<Member | null> {
    return await this.dataService.getMember(id);
  }

  async getAllMembers(): Promise<Member[]> {
    return await this.dataService.getMembers();
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<boolean> {
    return await this.dataService.updateMember(id, updates);
  }

  async deleteMember(id: string): Promise<boolean> {
    return await this.dataService.deleteMember(id);
  }

  // Reminder operations
  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    // For now, reminders are read-only from JSON
    console.warn('addReminder: Not implemented for JSON data');
    return Date.now().toString();
  }

  async getAllReminders(): Promise<Reminder[]> {
    return await this.dataService.getReminders();
  }

  // Backup operations
  async getBackupSettings(): Promise<BackupSettings> {
    return await this.dataService.getBackupSettings();
  }

  async updateBackupSettings(settings: BackupSettings): Promise<void> {
    await this.dataService.updateBackupSettings(settings);
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
    const users = await this.dataService.getUsers();
    const user = users.find(u => u.mobile_number === mobileNumber && u.pin === pin);
    return !!user;
  }

  // Get database file path (not applicable for JSON)
  async getDatabasePath(): Promise<string> {
    return 'assets/data/';
  }
}