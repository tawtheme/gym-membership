import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../services/storage';
import { SnackbarService } from '../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  styleUrls: ['account.page.scss'],
  standalone: false,
})
export class AccountPage implements OnInit {
  settings = {
    notifications: true,
    autoBackup: false
  };

  constructor(
    private storageService: StorageService,
    private alertController: AlertController,
    private snackbar: SnackbarService
  ) {}

  async ngOnInit() {
    // Settings are initialized with defaults
  }

  async onNotificationToggle() {
    this.showToast(
      this.settings.notifications ? 'Notifications enabled' : 'Notifications disabled',
      this.settings.notifications ? 'success' : 'warning'
    );
  }

  async onAutoBackupToggle() {
    this.showToast(
      this.settings.autoBackup ? 'Auto backup enabled' : 'Auto backup disabled',
      this.settings.autoBackup ? 'success' : 'warning'
    );
  }

  async clearAllData() {
    const alert = await this.alertController.create({
      header: 'Clear All Data',
      message: 'This will permanently delete all members, reminders, and payment history.\n\nYour login details will NOT be removed.\n\nDo you want to continue?',
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
              await this.storageService.clearAllData();
              this.showToast('All data cleared successfully.', 'success');
            } catch (error) {
              console.error('Error clearing data:', error);
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


  private showToast(message: string, color: string) {
    // keep long duration for design testing on account page
    this.snackbar.show(message, color as any, 180000);
  }
}
