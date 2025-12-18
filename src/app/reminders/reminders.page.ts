import { Component, OnInit } from '@angular/core';
import { MemberService } from '../services/member';
import { Reminder } from '../models/member.interface';
import { SnackbarService } from '../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-reminders',
  templateUrl: 'reminders.page.html',
  styleUrls: ['reminders.page.scss'],
  standalone: false,
})
export class RemindersPage implements OnInit {
  reminders: Reminder[] = [];
  filteredReminders: Reminder[] = [];
  filterType: 'all' | 'upcoming' | 'sent' = 'all';

  isCreateReminderOpen: boolean = false;
  reminderForm = {
    title: '',
    message: '',
    type: 'custom',
    scheduledDate: new Date().toISOString()
  };

  constructor(
    private memberService: MemberService,
    private snackbar: SnackbarService
  ) {}

  async ngOnInit() {
    await this.loadReminders();
  }

  async ionViewWillEnter() {
    await this.loadReminders();
  }

  async loadReminders() {
    try {
      this.reminders = await this.memberService.getAllReminders();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading reminders:', error);
      this.showToast('Error loading reminders', 'danger');
    }
  }

  setFilterTab(tab: 'all' | 'upcoming' | 'sent') {
    this.filterType = tab;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.reminders];

    switch (this.filterType) {
      case 'upcoming':
        const now = new Date();
        filtered = filtered.filter(reminder => {
          const scheduledDate = new Date(reminder.scheduledDate);
          return scheduledDate > now && !reminder.isSent;
        });
        break;
      case 'sent':
        filtered = filtered.filter(reminder => reminder.isSent);
        break;
    }

    this.filteredReminders = filtered.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }

  createReminder() {
    this.reminderForm = {
      title: '',
      message: '',
      type: 'custom',
      scheduledDate: new Date().toISOString()
    };
    this.isCreateReminderOpen = true;
  }

  closeCreateReminder() {
    this.isCreateReminderOpen = false;
  }

  onScheduledDateChange(event: any) {
    if (event.detail?.value) {
      this.reminderForm.scheduledDate = event.detail.value;
    }
  }

  async saveReminder() {
    if (!this.reminderForm.title || !this.reminderForm.message) {
      this.showToast('Please fill in all fields', 'danger');
      return;
    }

    try {
      await this.memberService.createReminder({
        memberId: 'general', // For general reminders
        type: (this.reminderForm.type || 'custom') as Reminder['type'],
        title: this.reminderForm.title,
        message: this.reminderForm.message,
        scheduledDate: this.reminderForm.scheduledDate, // Already in ISO format from ion-datetime
        isSent: false
      });
      
      this.showToast('Reminder created successfully!', 'success');
      this.closeCreateReminder();
      await this.loadReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      this.showToast('Error creating reminder', 'danger');
    }
  }

  formatScheduledDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private showToast(message: string, color: string) {
    this.snackbar.show(message, color as any, 3000);
  }
}
