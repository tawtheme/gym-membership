import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';
import { SnackbarService } from '../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  styleUrls: ['account.page.scss'],
  standalone: false,
})
export class AccountPage implements OnInit {
  currentUser: string | null = null;
  userName: string = 'John Doe';
  userEmail: string = 'john.doe@example.com';
  userAddress: string = '123 Main Street, City, State 12345';
  monthlyActivePlan: string = 'Premium Plan';
  settings = {
    notifications: true,
    autoBackup: false
  };

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private alertController: AlertController,
    private snackbar: SnackbarService
  ) {}

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    await this.loadSettings();
  }

  async loadSettings() {
    try {
      // For now, use default settings since we don't have app_settings in SQLite
      // You can add an app_settings table to SQLite if needed
      this.settings = {
        notifications: true,
        autoBackup: false
      };
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      // For now, just log since we don't have app_settings in SQLite
      console.log('Settings saved:', this.settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async onNotificationToggle() {
    await this.saveSettings();
    this.showToast(
      this.settings.notifications ? 'Notifications enabled' : 'Notifications disabled',
      this.settings.notifications ? 'success' : 'warning'
    );
  }

  async onAutoBackupToggle() {
    await this.saveSettings();
    this.showToast(
      this.settings.autoBackup ? 'Auto backup enabled' : 'Auto backup disabled',
      this.settings.autoBackup ? 'success' : 'warning'
    );
  }

  async clearAllData() {
    const alert = await this.alertController.create({
      header: 'Clear All Data',
      message: 'Are you sure you want to delete all members and reminders? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete All',
          role: 'destructive',
          handler: async () => {
            try {
              // Clear all data - you would need to implement this in SQLite service
              this.showToast('Clear data functionality needs to be implemented in SQLite', 'warning');
            } catch (error) {
              this.showToast('Error clearing data', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async exportAllData() {
    try {
      const backupData = await this.storageService.createBackup();
      
      // Create a downloadable file
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gym_data_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      this.showToast('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('Error exporting data', 'danger');
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: async () => {
            await this.authService.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  private showToast(message: string, color: string) {
    // keep long duration for design testing on account page
    this.snackbar.show(message, color as any, 180000);
  }
}
