import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MembersPageRoutingModule } from './members-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { MembersPage } from './members.page';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { PaymentTransactionsComponent } from './payment-transactions/payment-transactions.component';
import { UpdatePaymentComponent } from './update-payment/update-payment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembersPageRoutingModule,
    SharedModule
  ],
  declarations: [MembersPage, MemberListComponent, MemberDetailComponent, PaymentTransactionsComponent, MemberProfileComponent, UpdatePaymentComponent],
  exports: [PaymentTransactionsComponent, UpdatePaymentComponent]
})
export class MembersPageModule {}
