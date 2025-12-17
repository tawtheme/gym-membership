import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-no-data-found',
  templateUrl: './no-data-found.component.html',
  styleUrls: ['./no-data-found.component.scss'],
  standalone: false
})
export class NoDataFoundComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'No Data Found';
  @Input() message: string = 'There is no data to display at this time.';
  @Input() showAction: boolean = false;
  @Input() actionLabel: string = 'Add New';
  @Input() actionIcon: string = 'add';

  @Output() onActionClick = new EventEmitter<void>();
}
