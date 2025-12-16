import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { MemberService } from '../../services/member';
import { Member } from '../../models/member.interface';
import { MemberDetailComponent } from './member-detail/member-detail.component';

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

  constructor(
    private memberService: MemberService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    await this.loadMembers();
  }

  async ionViewWillEnter() {
    await this.loadMembers();
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
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return this.getFilteredMembers().filter(member => {
      const endDate = new Date(member.endDate);
      return member.isActive && endDate >= now && endDate <= sevenDaysFromNow;
    });
  }

  getExpiredMembers(): Member[] {
    const now = new Date();
    return this.getFilteredMembers().filter(member => {
      const endDate = new Date(member.endDate);
      return endDate < now;
    });
  }

  getActiveMembers(): Member[] {
    const now = new Date();
    return this.getFilteredMembers().filter(member => {
      const endDate = new Date(member.endDate);
      return member.isActive && endDate >= now;
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

  addMember() {
    this.router.navigate(['/add-member']);
  }

  async viewMember(member: Member) {
    const modal = await this.modalCtrl.create({
      component: MemberDetailComponent,
      componentProps: { member },
      cssClass: 'member-detail-modal'
    });

    await modal.present();
  }

  editMember(member: Member) {
    this.router.navigate(['/add-member'], {
      queryParams: { id: member.id, edit: true }
    });
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
