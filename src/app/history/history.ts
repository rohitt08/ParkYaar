import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { TransactionService, TransactionRecord } from '../services/transaction';

@Component({
  selector: 'app-history',
  imports: [CommonModule, Header],
  templateUrl: './history.html',
  styleUrls: ['./history.css'],
})
export class History implements OnInit {
  allHistory: TransactionRecord[] = [];
  filteredHistory: TransactionRecord[] = [];
  selectedFilter: string = 'all';

  constructor(private txSrv: TransactionService) {}

  ngOnInit() {
    this.loadParkingHistory();
  }

  loadParkingHistory() {
    this.allHistory = this.txSrv.getAll();
    this.filteredHistory = [...this.allHistory];
  }

  filterHistory(type: string) {
    this.selectedFilter = type;
    if (type === 'all') {
      this.filteredHistory = [...this.allHistory];
    } else {
      this.filteredHistory = this.allHistory.filter(item => 
        (item.vehicleType || '').toLowerCase() === type.toLowerCase()
      );
    }
  }

  getTotalRevenue(): number {
    return this.filteredHistory.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
}
 
