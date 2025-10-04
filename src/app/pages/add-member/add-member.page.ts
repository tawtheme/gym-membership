import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { MemberService } from '../../services/member';
import { Member } from '../../models/member.interface';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.page.html',
  styleUrls: ['./add-member.page.scss'],
  standalone: false,
})
export class AddMemberPage implements OnInit {
  member: Partial<Member> = {
    name: '',
    phone: '',
    email: '',
    membershipType: 'monthly',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isActive: true,
    notes: ''
  };
  
  isEditMode: boolean = false;
  isLoading: boolean = false;
  memberId: string | null = null;

  constructor(
    private memberService: MemberService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.memberId = this.route.snapshot.queryParams['id'];
    this.isEditMode = this.route.snapshot.queryParams['edit'] === 'true';
    
    if (this.isEditMode && this.memberId) {
      await this.loadMember();
    } else {
      this.setDefaultDates();
    }
  }

  async loadMember() {
    if (!this.memberId) return;
    
    try {
      const member = await this.memberService.getMember(this.memberId);
      if (member) {
        this.member = { ...member };
      }
    } catch (error) {
      console.error('Error loading member:', error);
      this.showToast('Error loading member details', 'danger');
    }
  }

  setDefaultDates() {
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    this.member.startDate = today.toISOString();
    this.member.endDate = oneMonthFromNow.toISOString();
  }

  onMembershipTypeChange() {
    if (!this.member.membershipType || !this.member.startDate) return;
    
    const startDate = new Date(this.member.startDate);
    const endDate = new Date(startDate);
    
    switch (this.member.membershipType) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    this.member.endDate = endDate.toISOString();
  }

  async onSubmit() {
    if (!this.member.name || !this.member.phone || !this.member.membershipType || 
        !this.member.startDate || !this.member.endDate) {
      this.showToast('Please fill in all required fields', 'danger');
      return;
    }

    this.isLoading = true;

    try {
      if (this.isEditMode && this.memberId) {
        await this.memberService.updateMember(this.memberId, this.member);
        this.showToast('Member updated successfully!', 'success');
      } else {
        await this.memberService.addMember(this.member as Omit<Member, 'id' | 'createdAt' | 'updatedAt'>);
        this.showToast('Member added successfully!', 'success');
      }
      
      this.router.navigate(['/tabs/members']);
    } catch (error) {
      console.error('Error saving member:', error);
      this.showToast('Error saving member. Please try again.', 'danger');
    } finally {
      this.isLoading = false;
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
