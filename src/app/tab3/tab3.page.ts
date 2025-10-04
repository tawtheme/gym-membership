import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { StorageService } from '../services/storage';
import { BackupSettings } from '../models/member.interface';
import { SqliteService } from '../services/sqlite.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  backupSettings: BackupSettings = {
    frequency: 'weekly',
    isEnabled: false
  };
  
  lastBackupDate: string | null = null;
  nextBackupDate: string | null = null;
  isCreatingBackup: boolean = false;
  isRestoringBackup: boolean = false;

  constructor(
    private storageService: StorageService,
    private sqliteService: SqliteService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadBackupSettings();
    await this.loadBackupInfo();
  }

  async loadBackupSettings() {
    this.backupSettings = await this.storageService.getBackupSettings();
  }

  async loadBackupInfo() {
    try {
      const settings = await this.storageService.getBackupSettings();
      this.lastBackupDate = settings.lastBackup || null;
      this.calculateNextBackupDate();
    } catch (error) {
      console.error('Error loading backup info:', error);
    }
  }

  calculateNextBackupDate() {
    if (!this.lastBackupDate || !this.backupSettings.isEnabled) {
      this.nextBackupDate = null;
      return;
    }

    const lastBackup = new Date(this.lastBackupDate);
    const nextBackup = new Date(lastBackup);

    switch (this.backupSettings.frequency) {
      case 'daily':
        nextBackup.setDate(nextBackup.getDate() + 1);
        break;
      case 'weekly':
        nextBackup.setDate(nextBackup.getDate() + 7);
        break;
      case 'monthly':
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        break;
      case 'yearly':
        nextBackup.setFullYear(nextBackup.getFullYear() + 1);
        break;
    }

    this.nextBackupDate = nextBackup.toISOString();
  }

  async onBackupToggleChange() {
    await this.storageService.updateBackupSettings(this.backupSettings);
    this.calculateNextBackupDate();
    
    if (this.backupSettings.isEnabled) {
      this.showToast('Automatic backup enabled', 'success');
    } else {
      this.showToast('Automatic backup disabled', 'warning');
    }
  }

  async onFrequencyChange() {
    await this.storageService.updateBackupSettings(this.backupSettings);
    this.calculateNextBackupDate();
    this.showToast(`Backup frequency set to ${this.backupSettings.frequency}`, 'success');
  }

  async createBackup() {
    this.isCreatingBackup = true;

    try {
      const backupData = await this.storageService.createBackup();
      
      // Save backup to file
      const fileName = `gym_backup_${new Date().toISOString().split('T')[0]}.json`;
      await Filesystem.writeFile({
        path: fileName,
        data: backupData,
        directory: Directory.Documents
      });

      // Share the backup file
      await Share.share({
        title: 'Gym Membership Backup',
        text: 'Gym membership data backup',
        url: `file://${fileName}`,
        dialogTitle: 'Share backup file'
      });

      this.showToast('Backup created and shared successfully!', 'success');
      await this.loadBackupInfo();
    } catch (error) {
      console.error('Error creating backup:', error);
      this.showToast('Error creating backup', 'danger');
    } finally {
      this.isCreatingBackup = false;
    }
  }

  async restoreBackup() {
    this.isRestoringBackup = true;

    try {
      // In a real app, you would use a file picker here
      // For demo purposes, we'll show an alert
      const alert = await this.alertController.create({
        header: 'Restore Backup',
        message: 'Please select a backup file to restore from.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Select File',
            handler: async () => {
              // In a real implementation, you would use a file picker
              this.showToast('File picker not implemented in demo', 'warning');
            }
          }
        ]
      });
      await alert.present();
    } catch (error) {
      console.error('Error restoring backup:', error);
      this.showToast('Error restoring backup', 'danger');
    } finally {
      this.isRestoringBackup = false;
    }
  }

  async exportData() {
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

  async importData() {
    try {
      // In a real app, you would use a file picker here
      const alert = await this.alertController.create({
        header: 'Import Data',
        message: 'Please select a data file to import.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Select File',
            handler: async () => {
              // In a real implementation, you would use a file picker
              this.showToast('File picker not implemented in demo', 'warning');
            }
          }
        ]
      });
      await alert.present();
    } catch (error) {
      console.error('Error importing data:', error);
      this.showToast('Error importing data', 'danger');
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  async showDatabaseInfo() {
    try {
      const dbPath = await this.sqliteService.getDatabasePath();
      const alert = await this.alertController.create({
        header: 'Database Information',
        message: `Database File: ${dbPath}\n\nLocation:\n• iOS: App Documents folder\n• Android: App data directory\n• Web: IndexedDB storage`,
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      this.showToast('Error getting database info', 'danger');
    }
  }

  async inspectDatabase() {
    try {
      const members = await this.storageService.getAllMembers();
      const reminders = await this.storageService.getAllReminders();
      const settings = await this.storageService.getBackupSettings();

      // Log to console for debugging
      console.log('=== DATABASE INSPECTION ===');
      console.log('Members:', members);
      console.log('Reminders:', reminders);
      console.log('Backup Settings:', settings);
      console.log('========================');

      const message = `
        <strong>Database Tables:</strong><br><br>
        <strong>Members Table:</strong><br>
        • Total Records: ${members.length}<br>
        • Active Members: ${members.filter(m => m.isActive).length}<br>
        • Inactive Members: ${members.filter(m => !m.isActive).length}<br><br>
        
        <strong>Reminders Table:</strong><br>
        • Total Reminders: ${reminders.length}<br>
        • Sent Reminders: ${reminders.filter(r => r.isSent).length}<br>
        • Pending Reminders: ${reminders.filter(r => !r.isSent).length}<br><br>
        
        <strong>Backup Settings:</strong><br>
        • Frequency: ${settings.frequency}<br>
        • Enabled: ${settings.isEnabled ? 'Yes' : 'No'}<br>
        • Last Backup: ${settings.lastBackup || 'Never'}
      `;

      const alert = await this.alertController.create({
        header: 'Database Inspector',
        message: message,
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      this.showToast('Error inspecting database', 'danger');
    }
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
