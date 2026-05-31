import { Injectable } from '@angular/core';

export interface ParkingSpot {
  id: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  details?: string | null;
  floor?: string;
  site?: string;
  building?: string;
  vehicleType?: 'car' | 'bike' | 'suv' | null;
}

@Injectable({ providedIn: 'root' })
export class ParkingService {
  private spots: ParkingSpot[] = [];
  private STORAGE_KEY = 'parkLayout_v1';

  constructor() {
    // try to restore from storage first
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        this.spots = JSON.parse(raw) || [];
      }
    } catch (e) {}
    if (!this.spots || this.spots.length === 0) this.resetMockData();
  }

  getLayout(): ParkingSpot[] {
    // Return a sanitized shallow copy. This prevents showing stale vehicle details
    // for spots that are available and ensures occupied spots have reasonable
    // details. If we modify the in-memory array during sanitization, persist it
    // back to storage so the saved layout stays consistent.
    let dirty = false;
    const sanitized = this.spots.map(s => {
      const next = { ...s } as ParkingSpot;
      if (next.status === 'available') {
        if (next.details || next.vehicleType) {
          next.details = null;
          next.vehicleType = null;
          dirty = true;
        }
      } else if (next.status === 'occupied') {
        // ensure occupied spots have a vehicle number and a type
        if (!next.details) {
          const num = Math.floor(1000 + Math.random() * 9000);
          const alpha = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
          next.details = `DL-${Math.floor(1 + Math.random()*99)} ${alpha} ${num}`;
          dirty = true;
        }
        if (!next.vehicleType) {
          next.vehicleType = 'car';
          dirty = true;
        }
      }
      return next;
    });
    if (dirty) {
      this.spots = sanitized;
      this.persist();
    }
    return [...sanitized];
  }

  refreshLayout(): ParkingSpot[] {
    // simulate a data change: randomly toggle some spot statuses
    this.spots = this.spots.map((s, i) => {
      if (Math.random() > 0.85) {
        // flip between available and occupied
        const next: ParkingSpot = { ...s };
        // toggle status
        next.status = next.status === 'available' ? 'occupied' : 'available';
        // if spot becomes available, clear any vehicle info
        if (next.status === 'available') {
          next.details = null;
          next.vehicleType = null;
        } else {
          // if it becomes occupied and has no details, assign a generated vehicle number and type
          if (!next.details) {
            const num = Math.floor(1000 + Math.random() * 9000);
            const alpha = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
            next.details = `DL-${Math.floor(1 + Math.random()*99)} ${alpha} ${num}`;
          }
          if (!next.vehicleType) {
            const types: ParkingSpot['vehicleType'][] = ['car', 'bike', 'suv'];
            next.vehicleType = types[Math.floor(Math.random() * types.length)];
          }
        }
        return next;
      }
      return { ...s };
    });
    this.persist();
    return [...this.spots];
  }

  /**
   * Mark a spot as occupied and attach vehicle details.
   * Returns the updated spot or null if not found.
   */
  occupySpot(id: string, vehicleNumber: string, vehicleType: 'car' | 'bike' | 'suv') {
    const idx = this.spots.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const next = { ...this.spots[idx] } as ParkingSpot;
    next.status = 'occupied';
    next.details = vehicleNumber;
    next.vehicleType = vehicleType;
    this.spots[idx] = next;
    this.persist();
    return { ...next };
  }

  releaseSpot(id: string) {
    const idx = this.spots.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const next = { ...this.spots[idx] } as ParkingSpot;
    next.status = 'available';
    next.details = null;
    next.vehicleType = null;
    this.spots[idx] = next;
    this.persist();
    return { ...next };
  }

  resetMockData() {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    this.spots = [];
    const floors = ['Lower Ground', 'Ground', 'First', 'Second'];
    const sites = ['pavillion', 'nexus'];
    const buildings = ['main', 'annex'];

    rows.forEach((r) => {
      for (let i = 1; i <= 10; i++) {
        const id = `${r}${i}`;
        const rand = Math.random();
        const status: ParkingSpot['status'] = rand > 0.8 ? 'reserved' : rand > 0.6 ? 'occupied' : rand > 0.55 ? 'maintenance' : 'available';
        const floor = floors[i % floors.length];
        const site = sites[i % sites.length];
        const building = buildings[i % buildings.length];
        this.spots.push({
          id,
          status,
          details: status === 'occupied' ? `XX ${Math.floor(Math.random() * 99)} AB ${Math.floor(Math.random() * 9999)}` : null,
          floor,
          site,
          building,
        });
      }
    });
    this.persist();
  }

  private persist() {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.spots)); } catch(e) {}
  }
}
 
