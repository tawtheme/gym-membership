import { Component, Input, OnInit } from '@angular/core';
import { PaymentTransaction } from '../../../models/member.interface';
import { SqliteService } from '../../../services/sqlite.service';

interface GroupedTransactions {
  month: string;
  year: number;
  transactions: PaymentTransaction[];
}

@Component({
  selector: 'app-payment-transactions',
  templateUrl: './payment-transactions.component.html',
  styleUrls: ['./payment-transactions.component.scss'],
  standalone: false
})
export class PaymentTransactionsComponent implements OnInit {
  @Input() transactions: PaymentTransaction[] = [];
  @Input() memberName?: string;
  
  searchTerm: string = '';
  groupedTransactions: GroupedTransactions[] = [];
  filteredTransactions: PaymentTransaction[] = [];
  filterTab: 'all' | 'recent' | 'thisMonth' = 'all';

  constructor(private sqliteService: SqliteService) {}

  async ngOnInit() {
    // If transactions are provided via input, use them; otherwise load from service
    if (this.transactions && this.transactions.length > 0) {
      // Transactions already provided
    } else {
      // Load all transactions if memberName is provided
      try {
        this.transactions = await this.sqliteService.getPaymentTransactions();
      } catch (error) {
        console.error('Error loading transactions:', error);
        this.transactions = [];
      }
    }
    this.filterTransactions();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.filterTransactions();
  }

  setFilterTab(tab: 'all' | 'recent' | 'thisMonth') {
    this.filterTab = tab;
    this.filterTransactions();
  }

  filterTransactions() {
    let filtered = [...this.transactions];

    // Apply tab filter
    const now = new Date();
    switch (this.filterTab) {
      case 'recent':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter(t => {
          const paymentDate = new Date(t.paymentDate);
          return paymentDate >= sevenDaysAgo;
        });
        break;
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(t => {
          const paymentDate = new Date(t.paymentDate);
          return paymentDate >= startOfMonth;
        });
        break;
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(term) ||
        t.paymentMode.toLowerCase().includes(term) ||
        t.amount.toString().includes(term)
      );
    }

    this.filteredTransactions = filtered;
  }

  groupTransactions() {
    const groups = new Map<string, PaymentTransaction[]>();

    this.filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.paymentDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(transaction);
    });

    this.groupedTransactions = Array.from(groups.entries())
      .map(([monthKey, transactions]) => {
        const date = new Date(transactions[0].paymentDate);
        return {
          month: date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase(),
          year: date.getFullYear(),
          transactions: transactions.sort((a, b) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          )
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return new Date(b.month + ' 1, ' + b.year).getTime() - 
               new Date(a.month + ' 1, ' + a.year).getTime();
      });
  }

  getPaymentModeIcon(mode: string): string {
    switch (mode) {
      case 'cash': return 'money';
      case 'card': return 'credit_card';
      case 'online': return 'language';
      case 'upi': return 'phone_android';
      default: return 'account_balance_wallet';
    }
  }

  getPaymentModeColor(mode: string): string {
    switch (mode) {
      case 'cash': return 'var(--color-primary-500)';
      case 'card': return 'var(--color-success-500)';
      case 'online': return 'var(--color-primary-600)';
      case 'upi': return 'var(--color-primary-700)';
      default: return 'var(--color-neutral-500)';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  formatScheduledDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
}
