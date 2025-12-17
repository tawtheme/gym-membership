import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Member } from '../../../../models/member.interface';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss'],
  standalone: false
})
export class MemberProfileComponent implements OnInit {
  @Input() member!: Member;
  
  email: string = '';
  isEmailVerified: boolean = false;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // Extract email if available, or use placeholder
    this.email = this.member.email || 'nirmaljmj@gmail.com';
    this.isEmailVerified = false; // In real app, this would come from member data
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onEditPersonalDetails() {
    // Navigate to edit page or open edit modal
    console.log('Edit personal details');
  }

  onUploadPhoto() {
    // Handle photo upload
    console.log('Upload photo');
  }

  onVerifyEmail() {
    // Handle email verification
    this.isEmailVerified = true;
    console.log('Verify email');
  }

  onFinancialDetails() {
    // Navigate to financial details page
    console.log('Financial details');
  }

  onAdditionalDetails() {
    // Navigate to additional details page
    console.log('Additional details');
  }

  onAddAddress() {
    // Handle add address
    console.log('Add address');
  }

  getInitials(): string {
    if (!this.member?.name) return '?';
    return this.member.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
