import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { MemberService } from '../../services/member';
import { Member, Reminder } from '../../models/member.interface';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { SqliteService } from '../../services/sqlite.service';
import { SnackbarService } from '../../shared/snackbar/snackbar.service';
import { AddMemberPage } from '../add-member/add-member.page';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  standalone: false,
})
export class MembersPage implements OnInit {
  members: Member[] = [];
  filteredMembers: Member[] = [];
  searchTerm: string = '';
  filterType: string = 'all';
  selectedSection: 'renew' | 'expired' | 'active' | 'all' | null = null;
  notifications: Reminder[] = [];

  constructor(
    private memberService: MemberService,
    private router: Router,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private sqliteService: SqliteService,
    private snackbar: SnackbarService
  ) { }

  async ngOnInit() {
    await this.loadMembers();
    await this.loadNotifications();
  }

  async ionViewWillEnter() {
    await this.loadMembers();
    await this.loadNotifications();
  }

  async loadMembers() {
    try {
      this.members = await this.memberService.getAllMembers();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading members:', error);
      this.showToast('Error loading members', 'danger');
    }
  }

  async loadNotifications() {
    try {
      const allNotifications = await this.sqliteService.getAllReminders();
      // Filter to show only renewal notifications
      this.notifications = allNotifications.filter(n => n.type === 'renewal');
      // Sort by scheduled date, newest first
      this.notifications.sort((a, b) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );
    } catch (error) {
      console.error('Error loading notifications:', error);
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

  viewAllNotifications() {
    // Navigate to a notifications page or show all notifications
    // For now, this can be a placeholder or navigate to a dedicated notifications page
    console.log('View all notifications');
  }


  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredMembers = [...this.members];
  }

  getRenewMembers(): Member[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    return this.getFilteredMembers().filter(member => {
      const endDate = new Date(member.endDate);
      endDate.setHours(0, 0, 0, 0);
      return member.isActive && endDate >= now && endDate <= sevenDaysFromNow;
    });
  }

  getExpiredMembers(): Member[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.getFilteredMembers().filter(member => {
      const endDate = new Date(member.endDate);
      endDate.setHours(0, 0, 0, 0);
      return endDate < now;
    });
  }

  getActiveMembers(): Member[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.getFilteredMembers().filter(member => {
      const endDate = new Date(member.endDate);
      endDate.setHours(0, 0, 0, 0);
      // Active members: isActive and endDate is in the future (not expiring within 7 days)
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return member.isActive && endDate > sevenDaysFromNow;
    });
  }

  getAllMembers(): Member[] {
    return this.getFilteredMembers();
  }

  private getFilteredMembers(): Member[] {
    let filtered = [...this.members];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.phone.includes(this.searchTerm)
      );
    }

    return filtered;
  }

  getSectionCount(members: Member[]): number {
    return members.length;
  }

  async addMember() {
    const modal = await this.modalCtrl.create({
      component: AddMemberPage,
      cssClass: 'add-member-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.success) {
      await this.loadMembers();
    }
  }

  async viewMember(member: Member) {
    const modal = await this.modalCtrl.create({
      component: MemberDetailComponent,
      componentProps: { 
        member,
        onDelete: async (memberToDelete: Member) => {
          await this.deleteMember(memberToDelete);
        }
      },
      cssClass: 'member-detail-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.deleted) {
      await this.loadMembers();
    }
  }

  async editMember(member: Member) {
    const modal = await this.modalCtrl.create({
      component: AddMemberPage,
      componentProps: {
        memberId: member.id,
        memberData: member
      },
      cssClass: 'add-member-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.success) {
      await this.loadMembers();
    }
  }

  viewSection(section: 'renew' | 'expired' | 'active' | 'all') {
    this.selectedSection = section;
  }

  closeSection() {
    this.selectedSection = null;
  }

  getSectionMembers(): Member[] {
    switch (this.selectedSection) {
      case 'renew':
        return this.getRenewMembers();
      case 'active':
        return this.getActiveMembers();
      case 'expired':
        return this.getExpiredMembers();
      case 'all':
        return this.getAllMembers();
      default:
        return [];
    }
  }

  getSectionTitle(): string {
    switch (this.selectedSection) {
      case 'renew':
        return 'Pending Renew';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'all':
        return 'All Member';
      default:
        return '';
    }
  }

  getSectionAvatars(members: Member[]): Member[] {
    return members.slice(0, 3);
  }

  getRemainingCount(members: Member[]): number {
    return Math.max(0, members.length - 3);
  }

  async sendReminder(member: Member) {
    const alert = await this.alertController.create({
      header: 'Send Reminder',
      message: `Send a reminder to ${member.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: async () => {
            try {
              await this.memberService.createReminder({
                memberId: member.id,
                type: 'custom',
                title: 'Gym Reminder',
                message: `Hello ${member.name}, this is a reminder from your gym.`,
                scheduledDate: new Date().toISOString(),
                isSent: false
              });
              this.showToast('Reminder sent!', 'success');
            } catch (error) {
              this.showToast('Error sending reminder', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteMember(member: Member) {
    const alert = await this.alertController.create({
      header: 'Delete Member',
      message: `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
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
              await this.memberService.deleteMember(member.id);
              this.showToast('Member deleted successfully', 'success');
              await this.loadMembers();
            } catch (error) {
              this.showToast('Error deleting member', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getMembershipBadgeColor(type: string): string {
    switch (type) {
      case 'monthly': return 'primary';
      case 'quarterly': return 'secondary';
      case 'yearly': return 'success';
      default: return 'medium';
    }
  }

  getStatusBadgeColor(isActive: boolean, endDate: string): string {
    if (!isActive) return 'danger';

    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'danger';
    if (daysUntilExpiry <= 7) return 'warning';
    return 'success';
  }

  getStatusText(isActive: boolean, endDate: string): string {
    if (!isActive) return 'Inactive';

    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 7) return 'Expiring Soon';
    return 'Active';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  private showToast(message: string, color: string) {
    this.snackbar.show(message, color as any, 3000);
  }
}
