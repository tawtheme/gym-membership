import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Member } from '../../../models/member.interface';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
  standalone: false
})
export class MemberDetailComponent {
  @Input() member!: Member;

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Member>();
  @Output() delete = new EventEmitter<Member>();

  onClose() {
    this.close.emit();
  }

  onEdit() {
    this.edit.emit(this.member);
  }

  onDelete() {
    this.delete.emit(this.member);
  }
}

