import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DatabaseInitService } from './database-init.service';
import { TABLE_NAMES } from './database.config';

@Injectable({
  providedIn: 'root'
})
export class DatabaseOperationsService {
  private database: SQLiteDBConnection | null = null;

  constructor(private dbInitService: DatabaseInitService) {
    console.log('DatabaseOperationsService constructor called');
    this.initializeDatabase().catch(error => {
      console.error('Failed to initialize database in constructor:', error);
    });
  }

  private async initializeDatabase() {
    console.log('DatabaseOperationsService: Starting database initialization...');
    try {
      this.database = await this.dbInitService.initializeDatabase();
      console.log('DatabaseOperationsService: Database initialized successfully');
    } catch (error) {
      console.error('DatabaseOperationsService: Database initialization failed:', error);
      throw error;
    }
  }

  // User operations
  async authenticateUser(mobileNumber: string, pin: string): Promise<boolean> {
    if (!this.database) throw new Error('Database not initialized');
    
    const result = await this.database.query(
      `SELECT * FROM ${TABLE_NAMES.USERS} WHERE mobile_number = ? AND pin = ?`, 
      [mobileNumber, pin]
    );
    
    return !!(result.values && result.values.length > 0);
  }

  async addUser(mobileNumber: string, pin: string): Promise<boolean> {
    if (!this.database) throw new Error('Database not initialized');
    
    try {
      const now = new Date().toISOString();
      await this.database.run(`
        INSERT INTO ${TABLE_NAMES.USERS} (mobile_number, pin, created_at, updated_at) 
        VALUES (?, ?, ?, ?)
      `, [mobileNumber, pin, now, now]);
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  }

  // Member operations
  async addMember(member: any): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');
    
    const id = this.generateId();
    const now = new Date().toISOString();
    
    await this.database.run(`
      INSERT INTO ${TABLE_NAMES.MEMBERS} (id, name, phone, email, membership_type, start_date, end_date, is_active, last_payment_date, next_payment_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, member.name, member.phone, member.email || null, member.membershipType, member.startDate, member.endDate, member.isActive ? 1 : 0, member.lastPaymentDate || null, member.nextPaymentDate || null, member.notes || null, now, now]);
    
    return id;
  }

  async getAllMembers(): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');
    
    const result = await this.database.query(`SELECT * FROM ${TABLE_NAMES.MEMBERS} ORDER BY created_at DESC`);
    return result.values ? result.values.map((row: any) => this.mapRowToMember(row)) : [];
  }

  async getMember(id: string): Promise<any | null> {
    if (!this.database) throw new Error('Database not initialized');
    
    const result = await this.database.query(`SELECT * FROM ${TABLE_NAMES.MEMBERS} WHERE id = ?`, [id]);
    if (result.values && result.values.length > 0) {
      return this.mapRowToMember(result.values[0]);
    }
    return null;
  }

  async updateMember(id: string, updates: any): Promise<boolean> {
    if (!this.database) throw new Error('Database not initialized');
    
    const setClause = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        setClause.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (setClause.length === 0) return false;
    
    setClause.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    await this.database.run(
      `UPDATE ${TABLE_NAMES.MEMBERS} SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );
    
    return true;
  }

  async deleteMember(id: string): Promise<boolean> {
    if (!this.database) throw new Error('Database not initialized');
    
    await this.database.run(`DELETE FROM ${TABLE_NAMES.MEMBERS} WHERE id = ?`, [id]);
    await this.database.run(`DELETE FROM ${TABLE_NAMES.REMINDERS} WHERE member_id = ?`, [id]);
    return true;
  }

  // Reminder operations
  async addReminder(reminder: any): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');
    
    const id = this.generateId();
    const now = new Date().toISOString();
    
    await this.database.run(`
      INSERT INTO ${TABLE_NAMES.REMINDERS} (id, member_id, type, title, message, scheduled_date, is_sent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, reminder.memberId, reminder.type, reminder.title, reminder.message, reminder.scheduledDate, reminder.isSent ? 1 : 0, now]);
    
    return id;
  }

  async getAllReminders(): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');
    
    const result = await this.database.query(`SELECT * FROM ${TABLE_NAMES.REMINDERS} ORDER BY scheduled_date ASC`);
    return result.values ? result.values.map((row: any) => this.mapRowToReminder(row)) : [];
  }

  // Backup operations
  async getBackupSettings(): Promise<any> {
    if (!this.database) throw new Error('Database not initialized');
    
    const result = await this.database.query(`SELECT * FROM ${TABLE_NAMES.BACKUP_SETTINGS} LIMIT 1`);
    if (result.values && result.values.length > 0) {
      const row = result.values[0];
      return {
        frequency: row['frequency'],
        isEnabled: row['is_enabled'] === 1,
        lastBackup: row['last_backup'],
        nextBackup: row['next_backup']
      };
    }
    
    return { frequency: 'weekly', isEnabled: false };
  }

  async updateBackupSettings(settings: any): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    await this.database.run(`
      UPDATE ${TABLE_NAMES.BACKUP_SETTINGS} 
      SET frequency = ?, is_enabled = ?, last_backup = ?, next_backup = ?
    `, [settings.frequency, settings.isEnabled ? 1 : 0, settings.lastBackup || null, settings.nextBackup || null]);
  }

  // Helper methods
  private mapRowToMember(row: any): any {
    return {
      id: row['id'],
      name: row['name'],
      phone: row['phone'],
      email: row['email'],
      membershipType: row['membership_type'],
      startDate: row['start_date'],
      endDate: row['end_date'],
      isActive: row['is_active'] === 1,
      lastPaymentDate: row['last_payment_date'],
      nextPaymentDate: row['next_payment_date'],
      notes: row['notes'],
      createdAt: row['created_at'],
      updatedAt: row['updated_at']
    };
  }

  private mapRowToReminder(row: any): any {
    return {
      id: row['id'],
      memberId: row['member_id'],
      type: row['type'],
      title: row['title'],
      message: row['message'],
      scheduledDate: row['scheduled_date'],
      isSent: row['is_sent'] === 1,
      createdAt: row['created_at']
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get database file path
  async getDatabasePath(): Promise<string> {
    return 'gym_membership.db';
  }
}
