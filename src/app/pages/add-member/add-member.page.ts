import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MemberService } from '../../services/member';
import { Member } from '../../models/member.interface';
import { SnackbarService } from '../../shared/snackbar/snackbar.service';

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
    startDate: undefined,
    endDate: undefined,
    isActive: true,
    notes: ''
  };
  
  isEditMode: boolean = false;
  isLoading: boolean = false;
  photoPreview: string | null = null;
  isStartDatePickerOpen = false;
  startDatePickerValue: string | null = null;

  constructor(
    private memberService: MemberService,
    private modalController: ModalController,
    private snackbar: SnackbarService
  ) {}

  async ngOnInit() {
    if (this.memberData) {
      this.member = { ...this.memberData };
      this.isEditMode = true;
      // Ensure dates are in ISO format for ion-datetime
      if (this.member.startDate) {
        this.member.startDate = new Date(this.member.startDate).toISOString();
      }
      if (this.member.endDate) {
        this.member.endDate = new Date(this.member.endDate).toISOString();
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
        // Ensure dates are in ISO format for ion-datetime
        if (this.member.startDate) {
          this.member.startDate = new Date(this.member.startDate).toISOString();
        }
        if (this.member.endDate) {
          this.member.endDate = new Date(this.member.endDate).toISOString();
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
    this.member.startDate = undefined;
    this.member.endDate = undefined;
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

  openStartDatePicker() {
    this.startDatePickerValue = this.member.startDate || new Date().toISOString();
    this.isStartDatePickerOpen = true;
  }

  closeStartDatePicker() {
    this.isStartDatePickerOpen = false;
  }

  onStartDateSelected(event: any) {
    if (event.detail?.value) {
      this.member.startDate = event.detail.value;
      this.calculateEndDate();
      this.closeStartDatePicker();
    }
  }

  onMembershipTypeChange() {
    if (!this.member.membershipType || !this.member.startDate) {
      return;
    }
    this.calculateEndDate();
  }

  private calculateEndDate() {
    if (!this.member.startDate || !this.member.membershipType) {
      this.member.endDate = undefined;
      return;
    }

    const startDate = new Date(this.member.startDate);
    const endDate = new Date(startDate);

    let daysToAdd = 30; // default for monthly
    switch (this.member.membershipType) {
      case 'monthly':
        daysToAdd = 30;
        break;
      case 'quarterly':
        daysToAdd = 90;
        break;
      case 'yearly':
        daysToAdd = 365;
        break;
    }

    endDate.setDate(endDate.getDate() + daysToAdd);
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
      // Dates are already in ISO format from ion-datetime
      const memberData = {
        ...this.member,
        startDate: this.member.startDate,
        endDate: this.member.endDate
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

  private showToast(message: string, color: string) {
    this.snackbar.show(message, color as any, 3000);
  }
}
