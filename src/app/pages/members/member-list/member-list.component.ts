import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Member } from '../../../models/member.interface';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  standalone: false
})
export class MemberListComponent {
  @Input() title = '';
  @Input() members: Member[] = [];
  @Input() variant: 'renew' | 'expired' | 'active' | 'all' = 'all';

  @Output() memberClick = new EventEmitter<Member>();

  onMemberClick(member: Member) {
    this.memberClick.emit(member);
  }

  getVariantIcon(): string {
    switch (this.variant) {
      case 'renew':
        return '🔄';
      case 'expired':
        return '⏰';
      case 'active':
        return '✅';
      case 'all':
      default:
        return '👥';
    }
  }
}

