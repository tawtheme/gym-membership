import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { MemberService } from '../../services/member';
import { Member } from '../../models/member.interface';

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

  constructor(
    private memberService: MemberService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

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
    this.searchTerm = event.detail.value;
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.members];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.phone.includes(this.searchTerm)
      );
    }

    // Apply type filter
    switch (this.filterType) {
      case 'active':
        filtered = filtered.filter(member => member.isActive);
        break;
      case 'expiring':
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        filtered = filtered.filter(member => {
          const endDate = new Date(member.endDate);
          return endDate <= sevenDaysFromNow && member.isActive;
        });
        break;
    }

    this.filteredMembers = filtered;
  }

  addMember() {
    this.router.navigate(['/add-member']);
  }

  editMember(member: Member) {
    this.router.navigate(['/add-member'], { 
      queryParams: { id: member.id, edit: true } 
    });
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
