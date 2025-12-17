import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Member, PaymentTransaction } from '../../../models/member.interface';
import { SqliteService } from '../../../services/sqlite.service';
import { UpdatePaymentComponent } from '../update-payment/update-payment.component';
import { AddMemberPage } from '../../add-member/add-member.page';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
  standalone: false
})
export class MemberDetailComponent implements OnInit {
  @Input() member!: Member;
  @Input() onDelete?: (member: Member) => Promise<void>;
  transactions: PaymentTransaction[] = [];

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private sqliteService: SqliteService
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  async loadTransactions() {
    // Load transactions from database / web store
    try {
      const allTransactions = await this.sqliteService.getPaymentTransactions(this.member.id);
      // Use only real transactions; if none, keep list empty
      this.transactions = allTransactions.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactions = [];
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

  async showActions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Member Actions',
      buttons: [
        {
          text: 'Update Payment',
          icon: 'card-outline',
          handler: () => {
            this.updatePayment();
          }
        },
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.edit();
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.delete();
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async updatePayment() {
    const modal = await this.modalCtrl.create({
      component: UpdatePaymentComponent,
      componentProps: {
        member: this.member
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.success) {
      // Reload transactions and update member data
      await this.loadTransactions();
      // Update member if returned
      if (data.member) {
        Object.assign(this.member, data.member);
      }
    }
  }

  async edit() {
    if (!this.member) {
      return;
    }
    
    const modal = await this.modalCtrl.create({
      component: AddMemberPage,
      componentProps: {
        memberId: this.member.id,
        memberData: this.member
      },
      cssClass: 'add-member-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.success) {
      // Reload member data if updated
      if (data.member) {
        Object.assign(this.member, data.member);
      }
      // Dismiss this modal and reload
      this.modalCtrl.dismiss({ updated: true });
    }
  }

  async delete() {
    if (!this.member) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Delete Member',
      message: `Are you sure you want to delete ${this.member.name}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            if (this.onDelete) {
              await this.onDelete(this.member);
            }
            this.modalCtrl.dismiss({ deleted: true });
          }
        }
      ]
    });

    await alert.present();
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

