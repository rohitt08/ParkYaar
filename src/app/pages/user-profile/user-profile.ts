import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { TransactionService, TransactionRecord } from '../../services/transaction';
import { ParkingService } from '../../services/parking';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {
  UserSrv = inject(UserService);
  TxSrv = inject(TransactionService);
  ParkingSrv = inject(ParkingService);

  user: any = null;
  bookings: TransactionRecord[] = [];
  editing: boolean = false;

  ngOnInit() {
    this.user = this.UserSrv.loggedUserData ?? {
      fullName: 'Guest Operator',
      emailId: '',
      role: 'Operator',
    };
    this.loadBookings();
  }

  loadBookings() {
    const email = this.user?.emailId || '';
    this.bookings = email ? this.TxSrv.getByUser(email) : ((this.user?.bookedSlots as TransactionRecord[]) || []);
  }

  saveProfile() {
    const updated = this.UserSrv.updateProfile(this.user as any);
    if (updated) {
      this.editing = false;
      alert('Profile updated');
    } else {
      alert('Unable to update profile locally');
    }
  }

  async releaseBooking(tx: TransactionRecord) {
    if (!confirm(`Release booking for spot ${tx.spotId}? This will mark the spot available.`)) return;
    // mark transaction completed and release spot
    this.TxSrv.updateStatus(tx.id, { status: 'completed', exitTime: new Date().toISOString() });
    this.ParkingSrv.releaseSpot(tx.spotId);
    this.loadBookings();
    alert('Booking released successfully');
  }
}
