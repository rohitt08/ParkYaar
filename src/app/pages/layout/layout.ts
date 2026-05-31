import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { UserService } from '../../services/user';
import { ParkingService, ParkingSpot } from '../../services/parking';
import { PaymentService } from '../../services/payment';
import { TransactionService } from '../../services/transaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, FormsModule, RouterOutlet, Header, RouterLink],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class Layout implements OnInit {

  UserSrv = inject(UserService);
  Router = inject(Router);
  ParkingSrv = inject(ParkingService);
  PaymentSrv = inject(PaymentService);
  TxSrv = inject(TransactionService);

  spots: ParkingSpot[] = [];
  allSpots: ParkingSpot[] = [];
  // Booking modal state
  bookingVisible: boolean = false;
  bookingSpot: ParkingSpot | null = null;
  bookingVehicleNumber: string = '';
  bookingVehicleType: 'car' | 'bike' | 'suv' = 'car';

  ngOnInit(): void {
    // initial load
    this.loadLayout();
  }

  get totalSpots(): number {
    return this.spots?.length ?? 0;
  }

  get availableCount(): number {
    return (this.spots || []).filter(s => s.status === 'available').length;
  }

  get occupiedCount(): number {
    return (this.spots || []).filter(s => s.status === 'occupied').length;
  }

  get occupancyRate(): number {
    const total = this.totalSpots;
    if (!total) return 0;
    return Math.round((this.occupiedCount / total) * 100);
  }

  // filter bindings
  selectedSite: string = '';
  selectedBuilding: string = '';
  selectedFloor: string = '';
  statusFilter: string = '';
  viewMode: 'grid' | 'list' = 'grid';
  // UI enhancements
  currentFloorTab: string = '';
  searchQuery: string = '';

  // computed visible spots after filters, tabs and search
  get visibleSpots(): ParkingSpot[] {
    const base = (this.spots || []).slice();
    let out = base;
    // apply current floor tab if set
    if (this.currentFloorTab) {
      const cf = this.currentFloorTab;
      out = out.filter(s => {
        const sf = (s.floor || '').toString();
        const norm = (f: string) => {
          if (!f) return '';
          const v = f.toLowerCase();
          if (v.includes('first') || v === '1' || v === '1st') return 'First';
          if (v.includes('second') || v === '2' || v === '2nd') return 'Second';
          if (v.includes('ground') || v.includes('basement') || v === 'g' || v === 'lg' || v.includes('lower')) return 'Ground';
          return v.charAt(0).toUpperCase() + v.slice(1);
        };
        return norm(sf) === cf;
      });
    }
    // apply search by id
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      out = out.filter(s => (s.id || '').toLowerCase().includes(q));
    }

    // apply status filter if set (allows 'available','occupied','reserved','maintenance')
    if (this.statusFilter && this.statusFilter.trim()) {
      const sf = this.statusFilter.trim().toLowerCase();
      out = out.filter(s => (s.status || '').toLowerCase() === sf);
    }
    return out;
  }

  get reservedCount(): number { return (this.spots || []).filter(s => s.status === 'reserved').length; }
  get maintenanceCount(): number { return (this.spots || []).filter(s => s.status === 'maintenance').length; }

  constructor() {}

  logoff() {
    localStorage.removeItem('parkUser');
    this.Router.navigateByUrl('/login');
  }

  applyFilters() {
    // client-side filtering using mock data fields
    const site = (this.selectedSite || '').trim();
    const building = (this.selectedBuilding || '').trim();
    const floor = (this.selectedFloor || '').trim();

    // normalize filter values so dropdown (Ground/First/Second) will match various
    // floor naming conventions coming from different parking layouts (eg. "Lower Ground",
    // "Basement", "G", "Ground Floor", etc.). This ensures the filter works on every
    // layout even if spot.floor values vary.
    const normalize = (f: string | undefined | null) => {
      if (!f) return '';
      const v = (f || '').toString().toLowerCase().trim();
      if (!v) return '';
      // map first/second explicitly
      if (v.includes('first') || v === '1' || v === '1st') return 'First';
      if (v.includes('second') || v === '2' || v === '2nd') return 'Second';
      // treat anything with 'ground', 'g', 'basement', 'lower' as Ground for dropdown
      if (v.includes('ground') || v.includes('basement') || v === 'g' || v === 'lg' || v.includes('lower')) return 'Ground';
      // fallback: if it starts with a digit map 0/1/2 heuristically
      const m = v.match(/^\d+/);
      if (m) {
        const n = parseInt(m[0], 10);
        if (n === 0 || n === 1) return 'Ground';
        if (n === 2) return 'First';
        if (n === 3) return 'Second';
      }
      // otherwise return original trimmed value (capitalized) so exact matches still work
      return v.charAt(0).toUpperCase() + v.slice(1);
    };

    const wantedFloor = normalize(floor);
    console.log('Applying filters', { site, building, floor: wantedFloor });

    this.spots = (this.allSpots || []).filter((s) => {
      if (site && s.site !== site) return false;
      if (building && s.building !== building) return false;
      if (wantedFloor) {
        const spotFloor = normalize(s.floor || '');
        if (spotFloor !== wantedFloor) return false;
      }
      return true;
    });
  }

  resetFilters() {
    this.selectedSite = '';
    this.selectedBuilding = '';
    this.selectedFloor = '';
    // restore original layout data
    this.spots = [...(this.allSpots || [])];
    console.log('Filters reset');
  }

  refreshLayout() {
    console.log('Refreshing parking layout...');
    this.allSpots = this.ParkingSrv.refreshLayout();
    // re-apply any active filters
    this.applyFilters();
  }

  loadLayout() {
    this.allSpots = this.ParkingSrv.getLayout();
    this.spots = [...this.allSpots];
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
    console.log('View changed to', mode);
  }

  setFloorTab(floor: string) {
    this.currentFloorTab = floor || '';
  }

  onSearchChange() {
    // visibleSpots is a getter so update will reflect automatically; keep for future debounce
  }

  selectSpot(spotId: string) {
    // find the spot
    const spot = (this.allSpots || []).find(s => s.id === spotId) || null;
    if (!spot) return;

    // If spot is available, show booking modal to collect vehicle details
    if (spot.status === 'available') {
      this.bookingSpot = spot;
      this.bookingVehicleNumber = '';
      this.bookingVehicleType = 'car';
      this.bookingVisible = true;
      return;
    }

    // otherwise, navigate to the spot detail route within the SPA (do not open a new tab)
    try {
      if (spot) localStorage.setItem('selectedSpot', JSON.stringify(spot));
    } catch (e) {}
    // navigate to the spot detail route within the SPA
    this.Router.navigateByUrl(`/spot/${spotId}`);
  }

  cancelBooking() {
    this.bookingVisible = false;
    this.bookingSpot = null;
    this.bookingVehicleNumber = '';
  }

  bookNow() {
    if (!this.bookingSpot) return;
    const id = this.bookingSpot.id;
    const vehicleNumber = (this.bookingVehicleNumber || '').trim();
    const vehicleType = this.bookingVehicleType;
    if (!vehicleNumber) {
      alert('Please enter vehicle number');
      return;
    }

    // simple pricing: base rate depending on type
    const base = vehicleType === 'bike' ? 20 : vehicleType === 'suv' ? 80 : 50;
    const amount = base; // could be extended to duration-based

  // show a basic confirm + payment flow
  const proceed = confirm(`Pay ₹${amount} to confirm booking for spot ${id}?`);
    if (!proceed) return;

    // disable UI while processing by keeping bookingVisible true (caller can show spinner)
  // capture previous counts for animated bump/count-up
  const prevTotal = this.totalSpots;
  const prevAvailable = this.availableCount;
  const prevOccupied = this.occupiedCount;

  this.PaymentSrv.processPayment(amount, 'card').then((res) => {
      if (!res.success) {
        alert('Payment failed: ' + (res.message || 'Unknown'));
        return;
      }

      // mark spot occupied
      const updated = this.ParkingSrv.occupySpot(id, vehicleNumber, vehicleType);
      if (!updated) {
        alert('Unable to book the spot after payment. Contact admin.');
        return;
      }

      // create transaction record
      const userEmail = this.UserSrv.loggedUserData?.emailId || 'guest@local';
      const tx = this.TxSrv.add({
        userEmail,
        spotId: id,
        vehicleNumber,
        vehicleType,
        amount,
        entryTime: new Date().toISOString(),
        exitTime: null,
        status: 'active',
        paymentId: res.paymentId
      });

      // update user's profile with a simple bookedSlots list (persisted in localStorage via UserService)
      try {
        const existing = this.UserSrv.loggedUserData || null;
        if (existing) {
          const prev = (existing as any).bookedSlots || [];
          (existing as any).bookedSlots = [tx, ...prev];
          this.UserSrv.updateProfile({ ...(existing as any) });
        }
      } catch (e) {}

      // refresh local caches
      this.allSpots = this.ParkingSrv.getLayout();
      this.applyFilters();
      this.bookingVisible = false;
      this.bookingSpot = null;

      // animate stat counts from previous to new value
      try {
        const totals = [
          { selector: '.stat-card:nth-child(1) .stat-value', from: prevTotal, to: this.totalSpots },
          { selector: '.stat-card:nth-child(2) .stat-value', from: prevAvailable, to: this.availableCount },
          { selector: '.stat-card:nth-child(3) .stat-value', from: prevOccupied, to: this.occupiedCount },
        ];
        totals.forEach(t => {
          const el = document.querySelector(t.selector) as HTMLElement | null;
          if (!el) return;
          const duration = 700;
          const start = performance.now();
          const from = t.from;
          const to = t.to;
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const v = Math.round(from + (to - from) * p);
            el.textContent = String(v);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      } catch (e) {}

      // highlight newly-occupied spot briefly and scroll it into view
      try {
        const el = document.getElementById(`spot-${id}`);
        if (el) {
          // scroll to center the spot smoothly
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          el.classList.add('newly');
          setTimeout(() => el.classList.remove('newly'), 900);
        }
      } catch (e) {}

      // bump the stat cards briefly for attention
      try {
        const stats = Array.from(document.querySelectorAll('.stat-card')) as HTMLElement[];
        stats.forEach(s => s.classList.add('bumped'));
        setTimeout(() => stats.forEach(s => s.classList.remove('bumped')), 800);
      } catch (e) {}

      // ARIA live announcement for screen readers
      try {
        const live = document.getElementById('aria-live');
        if (live) {
          live.textContent = `Booking successful for spot ${id}`;
          // clear after announced
          setTimeout(() => { if (live) live.textContent = ''; }, 3000);
        }
      } catch (e) {}

      // show a non-blocking toast notification instead of alert
      try { this.showToast(`Booking successful! Payment ID: ${res.paymentId || tx.id}`, 'success'); } catch(e) {}
      console.log('Booked spot', id, vehicleNumber, vehicleType, tx);
    });
  }

  // Lightweight DOM toast (keeps things simple without adding services/components)
  showToast(message: string, type: 'success' | 'info' = 'info', duration = 3500) {
    try {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.textContent = message;
      container.appendChild(el);
      // auto-hide
      setTimeout(() => {
        el.classList.add('hide');
        setTimeout(() => { try { container.removeChild(el); } catch(e) {} }, 300);
      }, duration);
    } catch (e) {}
  }

  openProfile() {
    // navigate to profile within the SPA
    this.Router.navigateByUrl('/profile');
  }

  get showDashboard(): boolean {
    const url = this.Router?.url || '';
    // show the embedded parking layout only for dashboard route (or root)
    return url === '' || url === '/' || url.includes('/dashboard');
  }
}
 
