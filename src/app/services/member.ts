import { Injectable } from '@angular/core';
import { StorageService } from './storage';
import { Member as MemberModel, Reminder } from '../models/member.interface';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private storageService: StorageService) {}

  async addMember(memberData: Omit<MemberModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const memberId = await this.storageService.addMember(memberData);
    
    // Create automatic reminders based on membership type
    await this.createAutomaticReminders(memberId, memberData);
    
    return memberId;
  }

  async getAllMembers(): Promise<MemberModel[]> {
    return await this.storageService.getAllMembers();
  }

  async getMember(id: string): Promise<MemberModel | null> {
    return await this.storageService.getMember(id);
  }

  async updateMember(id: string, updates: Partial<MemberModel>): Promise<boolean> {
    return await this.storageService.updateMember(id, updates);
  }

  async deleteMember(id: string): Promise<boolean> {
    return await this.storageService.deleteMember(id);
  }

  async getActiveMembers(): Promise<MemberModel[]> {
    const members = await this.getAllMembers();
    return members.filter(member => member.isActive);
  }

  async getExpiringMembers(days: number = 7): Promise<MemberModel[]> {
    const members = await this.getActiveMembers();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    return members.filter(member => {
      const endDate = new Date(member.endDate);
      return endDate <= targetDate;
    });
  }

  async createReminder(reminderData: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    const reminderId = await this.storageService.addReminder(reminderData);
    
    // Schedule local notification
    await this.scheduleNotification(reminderData);
    
    return reminderId;
  }

  async getAllReminders(): Promise<Reminder[]> {
    return await this.storageService.getAllReminders();
  }

  async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    const reminders = await this.getAllReminders();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    return reminders.filter(reminder => {
      const scheduledDate = new Date(reminder.scheduledDate);
      return scheduledDate <= targetDate && !reminder.isSent;
    });
  }

  private async createAutomaticReminders(memberId: string, member: Omit<MemberModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const endDate = new Date(member.endDate);
    const reminderDate = new Date(endDate);
    reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before expiry

    // Payment reminder
    await this.createReminder({
      memberId,
      type: 'payment',
      title: 'Payment Reminder',
      message: `Payment reminder for ${member.name}. Membership expires on ${member.endDate}`,
      scheduledDate: reminderDate.toISOString(),
      isSent: false
    });

    // Renewal reminder
    await this.createReminder({
      memberId,
      type: 'renewal',
      title: 'Membership Renewal',
      message: `Time to renew membership for ${member.name}. Contact gym for renewal.`,
      scheduledDate: endDate.toISOString(),
      isSent: false
    });
  }

  private async scheduleNotification(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<void> {
    try {
      const scheduledDate = new Date(reminder.scheduledDate);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: reminder.title,
            body: reminder.message,
            id: Date.now(),
            schedule: {
              at: scheduledDate
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async checkAndSendReminders(): Promise<void> {
    const upcomingReminders = await this.getUpcomingReminders(1);
    
    for (const reminder of upcomingReminders) {
      if (!reminder.isSent) {
        // Mark as sent
        await this.storageService.updateMember(reminder.memberId, {});
        // You could also implement SMS/email sending here
        console.log(`Sending reminder: ${reminder.title} - ${reminder.message}`);
      }
    }
  }
}
