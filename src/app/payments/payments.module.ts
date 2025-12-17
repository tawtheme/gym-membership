import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsPage } from './payments.page';
import { MembersPageModule } from '../pages/members/members.module';
import { SharedModule } from '../shared/shared.module';

import { PaymentsPageRoutingModule } from './payments-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PaymentsPageRoutingModule,
    MembersPageModule,
    SharedModule
  ],
  declarations: [PaymentsPage]
})
export class PaymentsPageModule {}
