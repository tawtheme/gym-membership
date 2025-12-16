import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Member, PaymentTransaction } from '../../../models/member.interface';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
  standalone: false
})
export class MemberDetailComponent implements OnInit {
  @Input() member!: Member;
  transactions: PaymentTransaction[] = [];

  constructor(
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    // For now, create mock transactions based on member data
    // In a real app, this would fetch from a service
    this.transactions = [];
    
    if (this.member.lastPaymentDate) {
      // Create a transaction from last payment date
      this.transactions.push({
        id: '1',
        memberId: this.member.id,
        amount: this.getMembershipAmount(),
        paymentDate: this.member.lastPaymentDate,
        paymentMode: 'cash',
        description: `${this.member.membershipType} membership payment`,
        createdAt: this.member.lastPaymentDate
      });
    }

    // Add initial payment if start date exists
    if (this.member.startDate && this.member.startDate !== this.member.lastPaymentDate) {
      this.transactions.push({
        id: '0',
        memberId: this.member.id,
        amount: this.getMembershipAmount(),
        paymentDate: this.member.startDate,
        paymentMode: 'cash',
        description: `Initial ${this.member.membershipType} membership payment`,
        createdAt: this.member.startDate
      });
    }

    // Sort by date, newest first
    this.transactions.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  getMembershipAmount(): number {
    // Mock amounts - in real app, this would come from settings or member data
    switch (this.member.membershipType) {
      case 'monthly': return 1000;
      case 'quarterly': return 2700;
      case 'yearly': return 10000;
      default: return 0;
    }
  }

  getPaymentModeIcon(mode: string): string {
    switch (mode) {
      case 'cash': return 'money';
      case 'card': return 'card';
      case 'online': return 'globe';
      case 'upi': return 'phone-portrait';
      default: return 'wallet';
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  edit() {
    if (!this.member) {
      return;
    }
    this.modalCtrl.dismiss();
    this.router.navigate(['/add-member'], {
      queryParams: { id: this.member.id, edit: true }
    });
  }

  // --- Derived payment / timeline helpers for UI ---

  get hasDates(): boolean {
    return !!(this.member && this.member.startDate && this.member.endDate);
  }

  get totalDays(): number {
    if (!this.hasDates) {
      return 0;
    }
    const start = new Date(this.member.startDate);
    const end = new Date(this.member.endDate);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)), 0);
    return days || 1;
  }

  get daysLeft(): number {
    if (!this.hasDates) {
      return 0;
    }
    const today = new Date();
    const end = new Date(this.member.endDate);
    const diffMs = end.setHours(0, 0, 0, 0) - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
  }

  get daysUsed(): number {
    if (!this.hasDates) {
      return 0;
    }
    return Math.max(this.totalDays - this.daysLeft, 0);
  }

  get usedPercent(): number {
    if (!this.hasDates || this.totalDays === 0) {
      return 0;
    }
    const pct = (this.daysUsed / this.totalDays) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }

  get isExpired(): boolean {
    return this.hasDates && this.daysLeft === 0;
  }
}

