import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { PaymentTransaction, Member } from '../models/member.interface';
import { UpdatePaymentComponent } from '../pages/members/update-payment/update-payment.component';
import { SnackbarService } from '../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-payments',
  templateUrl: 'payments.page.html',
  styleUrls: ['payments.page.scss'],
  standalone: false,
})
export class PaymentsPage implements OnInit {
  allTransactions: PaymentTransaction[] = [];
  membersForSelection: Member[] = [];
  filteredMembersForSelection: Member[] = [];
  selectedMemberId: string | null = null;
  isMemberSelectOpen = false;
  memberSearchQuery: string = '';

  constructor(
    private dataService: DataService,
    private modalController: ModalController,
    private alertController: AlertController,
    private snackbar: SnackbarService
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

      this.membersForSelection = members;
      this.filteredMembersForSelection = [...members];
      this.selectedMemberId = null;
      this.memberSearchQuery = '';
      this.isMemberSelectOpen = true;
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

  closeMemberSelect() {
    this.isMemberSelectOpen = false;
  }

  onMemberSearchChange(event: any) {
    const query = (event.target?.value || '').toLowerCase();
    this.memberSearchQuery = query;
    this.filteredMembersForSelection = this.membersForSelection.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.membershipType.toLowerCase().includes(query)
    );
  }

  async onMemberSelected(memberId: string) {
    this.isMemberSelectOpen = false;
    const selectedMember = this.membersForSelection.find(m => m.id === memberId);
    if (selectedMember) {
      await this.openUpdatePaymentModal(selectedMember);
    }
  }

  private showToast(message: string, color: string) {
    this.snackbar.show(message, color as any, 3000);
  }
}
