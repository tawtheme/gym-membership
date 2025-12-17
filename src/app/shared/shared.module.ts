import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from './no-data-found/no-data-found.component';

@NgModule({
  declarations: [NoDataFoundComponent],
  imports: [CommonModule],
  exports: [NoDataFoundComponent]
})
export class SharedModule {}
