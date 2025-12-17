import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { MemberService } from '../../services/member';
import { Member } from '../../models/member.interface';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.page.html',
  styleUrls: ['./add-member.page.scss'],
  standalone: false,
})
export class AddMemberPage implements OnInit {
  @Input() memberId?: string;
  @Input() memberData?: Partial<Member>;

  member: Partial<Member> = {
    name: '',
    phone: '',
    email: '',
    address: '',
    membershipType: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isActive: true,
    notes: ''
  };
  
  isEditMode: boolean = false;
  isLoading: boolean = false;
  photoPreview: string | null = null;

  constructor(
    private memberService: MemberService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    if (this.memberData) {
      this.member = { ...this.memberData };
      this.isEditMode = true;
      // Convert ISO dates to date input format (YYYY-MM-DD)
      if (this.member.startDate) {
        this.member.startDate = new Date(this.member.startDate).toISOString().split('T')[0];
      }
      if (this.member.endDate) {
        this.member.endDate = new Date(this.member.endDate).toISOString().split('T')[0];
      }
    } else if (this.memberId) {
      this.isEditMode = true;
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
        // Convert ISO dates to date input format (YYYY-MM-DD)
        if (this.member.startDate) {
          this.member.startDate = new Date(this.member.startDate).toISOString().split('T')[0];
        }
        if (this.member.endDate) {
          this.member.endDate = new Date(this.member.endDate).toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error('Error loading member:', error);
      this.showToast('Error loading member details', 'danger');
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  setDefaultDates() {
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    this.member.startDate = today.toISOString().split('T')[0];
    this.member.endDate = oneMonthFromNow.toISOString().split('T')[0];
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
        // Convert to base64 for storage
        this.member.avatarUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.member.avatarUrl = undefined;
    this.photoPreview = null;
    // Reset file input
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  goBack() {
    this.dismiss();
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
    
    this.member.endDate = endDate.toISOString().split('T')[0];
  }

  async onSubmit() {
    if (!this.member.name || !this.member.phone || !this.member.membershipType || 
        !this.member.startDate || !this.member.endDate) {
      this.showToast('Please fill in all required fields', 'danger');
      return;
    }

    this.isLoading = true;

    try {
      // Convert date strings to ISO format for storage
      const memberData = {
        ...this.member,
        startDate: new Date(this.member.startDate!).toISOString(),
        endDate: new Date(this.member.endDate!).toISOString()
      };

      if (this.isEditMode && this.memberId) {
        await this.memberService.updateMember(this.memberId, memberData);
        this.showToast('Member updated successfully!', 'success');
        this.modalController.dismiss({ success: true, member: { ...memberData, id: this.memberId } });
      } else {
        const newMemberId = await this.memberService.addMember(memberData as Omit<Member, 'id' | 'createdAt' | 'updatedAt'>);
        this.showToast('Member added successfully!', 'success');
        this.modalController.dismiss({ success: true, memberId: newMemberId });
      }
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
