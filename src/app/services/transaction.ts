import { Injectable } from '@angular/core';

export interface TransactionRecord {
  id: string;
  userEmail: string;
  spotId: string;
  vehicleNumber: string;
  vehicleType: string;
  amount: number;
  entryTime: string; // ISO
  exitTime?: string | null; // ISO or null
  status: 'active' | 'completed' | 'cancelled';
  paymentId?: string;
}

const STORAGE_KEY = 'parkTransactions_v1';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _tx: TransactionRecord[] = [];

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this._tx = JSON.parse(raw) || [];
    } catch (e) {
      this._tx = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._tx));
    } catch (e) {}
  }

  getAll(): TransactionRecord[] {
    return [...this._tx].sort((a,b) => b.entryTime.localeCompare(a.entryTime));
  }

  getByUser(email: string) {
    return this._tx.filter(t => t.userEmail === email).sort((a,b) => b.entryTime.localeCompare(a.entryTime));
  }

  add(record: Omit<TransactionRecord, 'id'>) {
    const id = `TX-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`;
    const rec = { ...record, id } as TransactionRecord;
    this._tx.push(rec);
    this.persist();
    return rec;
  }

  updateStatus(id: string, patch: Partial<TransactionRecord>) {
    const idx = this._tx.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this._tx[idx] = { ...this._tx[idx], ...patch };
    this.persist();
    return this._tx[idx];
  }
}
