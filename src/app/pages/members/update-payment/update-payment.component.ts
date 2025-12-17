import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Member, PaymentTransaction } from '../../../models/member.interface';
import { SqliteService } from '../../../services/sqlite.service';
import { MemberService } from '../../../services/member';
import { SnackbarService } from '../../../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-update-payment',
  templateUrl: './update-payment.component.html',
  styleUrls: ['./update-payment.component.scss'],
  standalone: false
})
export class UpdatePaymentComponent implements OnInit {
  @Input() member!: Member;

  paymentAmount: number = 0;
  paymentDate: string = new Date().toISOString();
  paymentMode: 'cash' | 'card' | 'online' | 'upi' = 'cash';
  description: string = '';

  membershipAmounts = {
    monthly: 1000,
    quarterly: 2700,
    yearly: 10000
  };

  constructor(
    private modalController: ModalController,
    private sqliteService: SqliteService,
    private memberService: MemberService,
    private snackbar: SnackbarService
  ) { }

  ngOnInit() {
    // Set default amount based on membership type
    this.paymentAmount = this.membershipAmounts[this.member.membershipType];
    this.description = `${this.member.membershipType} membership payment`;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getPaymentModeIcon(mode: string): string {
    const icons: { [key: string]: string } = {
      cash: 'payments',
      card: 'credit_card',
      online: 'account_balance',
      upi: 'qr_code'
    };
    return icons[mode] || 'payment';
  }

  onPaymentDateChange(event: any) {
    if (event.detail?.value) {
      this.paymentDate = event.detail.value;
    }
  }

  async savePayment() {
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      this.showToast('Please enter a valid payment amount', 'danger');
      return;
    }

    if (!this.paymentDate) {
      this.showToast('Please select a payment date', 'danger');
      return;
    }

    try {
      // Create payment transaction
      const transaction: Omit<PaymentTransaction, 'id' | 'createdAt'> = {
        memberId: this.member.id,
        amount: this.paymentAmount,
        paymentDate: this.paymentDate, // Already in ISO format from ion-datetime
        paymentMode: this.paymentMode,
        description: this.description || `${this.member.membershipType} membership payment`
      };

      await this.sqliteService.addPaymentTransaction(transaction);

      // Update member's last payment date and extend membership
      const paymentDateObj = new Date(this.paymentDate);
      const updatedMember: Partial<Member> = {
        lastPaymentDate: this.paymentDate, // Already in ISO format
        isActive: true
      };

      // Calculate new end date based on membership type
      const newEndDate = new Date(paymentDateObj);
      switch (this.member.membershipType) {
        case 'monthly':
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          break;
        case 'quarterly':
          newEndDate.setMonth(newEndDate.getMonth() + 3);
          break;
        case 'yearly':
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          break;
      }
      updatedMember.endDate = newEndDate.toISOString();
      updatedMember.nextPaymentDate = newEndDate.toISOString();

      await this.memberService.updateMember(this.member.id, updatedMember);

      this.showToast('Payment recorded successfully', 'success');
      this.modalController.dismiss({ success: true, member: { ...this.member, ...updatedMember } });
    } catch (error) {
      console.error('Error saving payment:', error);
      this.showToast('Error saving payment. Please try again.', 'danger');
    }
  }

  private showToast(message: string, color: string) {
    this.snackbar.show(message, color as any, 2000);
  }
}
