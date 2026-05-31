import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { TransactionService } from '../services/transaction';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class Reports implements OnInit {

  totalVehicles: number = 0;
  totalRevenue: number = 0;
  vehicleTypeBreakdown: { type: string; count: number; percentage: number }[] = [];

  // simple daily stats derived from transactions (group by day)
  get dailyStats(): { day: string; vehicles: number; revenue: number }[] {
    const tx = this.txSrv.getAll();
    const groups: Record<string, { vehicles: number; revenue: number }> = {};
    tx.forEach(t => {
      const d = t.entryTime ? new Date(t.entryTime).toLocaleDateString() : 'Unknown';
      groups[d] = groups[d] || { vehicles: 0, revenue: 0 };
      groups[d].vehicles += 1;
      groups[d].revenue += (t.amount || 0);
    });
    // convert to array sorted by date (most recent first)
    return Object.keys(groups)
      .map(k => ({ day: k, vehicles: groups[k].vehicles, revenue: groups[k].revenue }))
      .sort((a, b) => (new Date(b.day).getTime() || 0) - (new Date(a.day).getTime() || 0));
  }

  constructor(private txSrv: TransactionService) {}

  ngOnInit() {
    this.loadReportData();
  }

  loadReportData() {
    const tx = this.txSrv.getAll();
    this.totalVehicles = tx.length;
    this.totalRevenue = tx.reduce((s, t) => s + (t.amount || 0), 0);

    const counts: Record<string, number> = {};
    tx.forEach(t => {
      const k = (t.vehicleType || 'Unknown').toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });

    const breakdown = Object.keys(counts).map(k => ({ type: k.toUpperCase(), count: counts[k] }));
    const total = breakdown.reduce((s, b) => s + b.count, 0) || 1;
    this.vehicleTypeBreakdown = breakdown.map(b => ({ type: b.type, count: b.count, percentage: Math.round((b.count / total) * 1000) / 10 }));
  }
}
 
