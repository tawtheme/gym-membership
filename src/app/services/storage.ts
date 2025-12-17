import { Injectable } from '@angular/core';
import { Member, Reminder, BackupSettings } from '../models/member.interface';
import { SqliteService } from './sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private sqliteService: SqliteService) {}

  // Member CRUD operations
  async addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.sqliteService.addMember(member);
  }

  async getMember(id: string): Promise<Member | null> {
    return await this.sqliteService.getMember(id);
  }

  async getAllMembers(): Promise<Member[]> {
    return await this.sqliteService.getAllMembers();
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<boolean> {
    return await this.sqliteService.updateMember(id, updates);
  }

  async deleteMember(id: string): Promise<boolean> {
    return await this.sqliteService.deleteMember(id);
  }

  // Reminder operations
  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    return await this.sqliteService.addReminder(reminder);
  }

  async getAllReminders(): Promise<Reminder[]> {
    return await this.sqliteService.getAllReminders();
  }

  // Backup operations
  async getBackupSettings(): Promise<BackupSettings> {
    return await this.sqliteService.getBackupSettings();
  }

  async updateBackupSettings(settings: BackupSettings): Promise<void> {
    await this.sqliteService.updateBackupSettings(settings);
  }

  async createBackup(): Promise<string> {
    return await this.sqliteService.createBackup();
  }

  async restoreBackup(backupData: string): Promise<boolean> {
    return await this.sqliteService.restoreBackup(backupData);
  }

  async clearAllData(): Promise<void> {
    await this.sqliteService.clearAllData();
  }

}
