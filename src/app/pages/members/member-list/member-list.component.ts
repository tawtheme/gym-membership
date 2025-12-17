import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Member } from '../../../models/member.interface';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  standalone: false
})
export class MemberListComponent implements OnChanges {
  @Input() title = '';
  @Input() members: Member[] = [];
  @Input() variant: 'renew' | 'expired' | 'active' | 'all' = 'all';

  @Output() memberClick = new EventEmitter<Member>();

  searchQuery: string = '';
  filteredMembers: Member[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['members']) {
      this.filterMembers();
    }
  }

  onSearchChange() {
    this.filterMembers();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterMembers();
  }

  filterMembers() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredMembers = [...this.members];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredMembers = this.members.filter(member => 
        member.name.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      );
    }
  }

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

