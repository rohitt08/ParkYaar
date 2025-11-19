import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParkingService } from '../../services/parking';
import { TransactionService } from '../../services/transaction';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-spot-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spot-detail.html',
  styleUrls: ['./spot-detail.css']
})
export class SpotDetail implements OnInit {
  route = inject(ActivatedRoute);
  ParkingSrv = inject(ParkingService);
  TxSrv = inject(TransactionService);
  UserSrv = inject(UserService);
  Router = inject(Router);
  spotId: string | null = null;
  spotData: any = null;

  ngOnInit() {
    this.spotId = this.route.snapshot.paramMap.get('id');
    // try to read a snapshot placed in localStorage by the main tab (to keep state consistent)
    try {
      const raw = localStorage.getItem('selectedSpot');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id === this.spotId) {
          this.spotData = {
            id: parsed.id,
            status: parsed.status ? parsed.status.charAt(0).toUpperCase() + parsed.status.slice(1) : 'Unknown',
            currentVehicle: parsed.details || null,
            lastOccupied: parsed.status === 'occupied' ? new Date().toISOString() : null,
            floor: parsed.floor || 'Unknown'
          };
          return;
        }
      }
    } catch (e) {
      // ignore parsing errors and fall back to service
    }

    // fallback to reading from ParkingService
    const all = this.ParkingSrv.getLayout() || [];
    const found = all.find(s => s.id === this.spotId);
    if (found) {
      this.spotData = {
        id: found.id,
        status: found.status ? found.status.charAt(0).toUpperCase() + found.status.slice(1) : 'Unknown',
        currentVehicle: found.details || null,
        lastOccupied: found.status === 'occupied' ? new Date().toISOString() : null,
        floor: found.floor || 'Unknown'
      };
    } else {
      // fallback placeholder
      this.spotData = {
        id: this.spotId,
        status: 'Unknown',
        currentVehicle: null,
        lastOccupied: null,
        floor: 'Unknown'
      };
    }
  }

  async releaseCurrentSpot() {
    if (!this.spotId) return;
    if (!confirm(`Release spot ${this.spotId}? This will mark it available and record exit time in history.`)) return;

    // find active transaction for this spot (if any)
    const all = this.TxSrv.getAll();
    const tx = all.find(t => t.spotId === this.spotId && t.status === 'active');
    try {
      if (tx) {
        this.TxSrv.updateStatus(tx.id, { status: 'completed', exitTime: new Date().toISOString() });
      }
      // release the spot
      this.ParkingSrv.releaseSpot(this.spotId);

      // update user's persisted bookedSlots if logged in
      try {
        const user = this.UserSrv.loggedUserData as any;
        if (user && Array.isArray((user as any).bookedSlots)) {
          const updated = (user.bookedSlots as any[]).filter((b: any) => b.spotId !== this.spotId || (tx && b.id !== tx.id));
          (user as any).bookedSlots = updated;
          this.UserSrv.updateProfile({ ...(user as any) });
        }
      } catch (e) {}

      alert('Spot released and history updated.');
      // navigate back to layout/dashboard to see changes
      this.Router.navigateByUrl('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Unable to release spot at this time');
    }
  }
}
