import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemindersPage } from './reminders.page';
import { SharedModule } from '../shared/shared.module';

import { RemindersPageRoutingModule } from './reminders-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RemindersPageRoutingModule,
    SharedModule
  ],
  declarations: [RemindersPage]
})
export class RemindersPageModule {}
