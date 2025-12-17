import { Component, OnInit } from '@angular/core';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { PaymentTransaction, Member } from '../models/member.interface';
import { UpdatePaymentComponent } from '../pages/members/update-payment/update-payment.component';

@Component({
  selector: 'app-payments',
  templateUrl: 'payments.page.html',
  styleUrls: ['payments.page.scss'],
  standalone: false,
})
export class PaymentsPage implements OnInit {
  allTransactions: PaymentTransaction[] = [];

  constructor(
    private toastController: ToastController,
    private dataService: DataService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadAllTransactions();
  }

  async loadAllTransactions() {
    try {
      this.allTransactions = await this.dataService.getPaymentTransactions();
      // Sort by date, newest first
      this.allTransactions.sort((a, b) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.allTransactions = [];
    }
  }

  async openAddPayment() {
    try {
      // Load all members for selection
      const members = await this.dataService.getMembers();
      
      if (members.length === 0) {
        this.showToast('No members found. Please add a member first.', 'warning');
        return;
      }

      // Create alert with member selection
      const inputs = members.map(member => ({
        type: 'radio' as const,
        label: `${member.name} (${member.membershipType})`,
        value: member.id,
        checked: false
      }));

      const alert = await this.alertController.create({
        header: 'Select Member',
        inputs: inputs,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Select',
            handler: async (memberId) => {
              if (memberId) {
                const selectedMember = members.find(m => m.id === memberId);
                if (selectedMember) {
                  await this.openUpdatePaymentModal(selectedMember);
                }
              }
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error opening add payment:', error);
      this.showToast('Error loading members. Please try again.', 'danger');
    }
  }

  async openUpdatePaymentModal(member: Member) {
    const modal = await this.modalController.create({
      component: UpdatePaymentComponent,
      componentProps: {
        member: member
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.success) {
      // Reload transactions after successful payment
      await this.loadAllTransactions();
      this.showToast('Payment added successfully', 'success');
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
