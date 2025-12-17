import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {
  @Input() message: string | null = null;
  @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'info';
  @Input() visible = false;
}

