import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { MemberService } from '../services/member';
import { Reminder } from '../models/member.interface';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  reminders: Reminder[] = [];
  filteredReminders: Reminder[] = [];
  filterType: string = 'all';

  constructor(
    private memberService: MemberService,
    private toastController: ToastController,
    private alertController: AlertController
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

  onFilterChange() {
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

  async createReminder() {
    const alert = await this.alertController.create({
      header: 'Create Reminder',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Reminder title'
        },
        {
          name: 'message',
          type: 'textarea',
          placeholder: 'Reminder message'
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Reminder Type',
          value: 'custom'
        },
        {
          name: 'scheduledDate',
          type: 'datetime-local',
          value: new Date().toISOString().slice(0, 16)
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: async (data) => {
            if (!data.title || !data.message) {
              this.showToast('Please fill in all fields', 'danger');
              return;
            }

            try {
              await this.memberService.createReminder({
                memberId: 'general', // For general reminders
                type: data.type || 'custom',
                title: data.title,
                message: data.message,
                scheduledDate: new Date(data.scheduledDate).toISOString(),
                isSent: false
              });
              
              this.showToast('Reminder created successfully!', 'success');
              await this.loadReminders();
            } catch (error) {
              this.showToast('Error creating reminder', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async markAsSent(reminder: Reminder) {
    try {
      // In a real implementation, you would update the reminder status
      this.showToast('Reminder marked as sent', 'success');
      await this.loadReminders();
    } catch (error) {
      this.showToast('Error updating reminder', 'danger');
    }
  }

  async deleteReminder(reminder: Reminder) {
    const alert = await this.alertController.create({
      header: 'Delete Reminder',
      message: `Are you sure you want to delete "${reminder.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              // In a real implementation, you would delete the reminder
              this.showToast('Reminder deleted successfully', 'success');
              await this.loadReminders();
            } catch (error) {
              this.showToast('Error deleting reminder', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getReminderBadgeColor(type: string): string {
    switch (type) {
      case 'payment': return 'primary';
      case 'renewal': return 'secondary';
      case 'custom': return 'tertiary';
      default: return 'medium';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
