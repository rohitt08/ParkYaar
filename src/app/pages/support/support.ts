import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportService, SupportRequest } from '../../services/support';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrls: ['./support.css'],
})
export class Support {
  private Router = inject(Router);
  private SupportSrv = new SupportService();

  name: string = '';
  email: string = '';
  spotId: string = '';
  bookingId: string = '';
  message: string = '';

  success: boolean = false;
  error: string | null = null;

  submit() {
    this.error = null;
    if (!this.email || !this.message) {
      this.error = 'Please provide at least your email and a message.';
      return;
    }

    const payload = {
      id: 's-' + Date.now(),
      name: this.name || 'Anonymous',
      email: this.email,
      spotId: this.spotId || null,
      bookingId: this.bookingId || null,
      message: this.message,
      createdAt: new Date().toISOString(),
    };

    // attempt to submit via service (network or fallback to local)
    (async () => {
      const req: SupportRequest = payload as SupportRequest;
      const res = await this.SupportSrv.submit(req);
      if (!res.ok) {
        this.error = res.message || 'Unable to submit support request';
        return;
      }
      this.success = true;
      // clear form
      this.name = '';
      this.email = '';
      this.spotId = '';
      this.bookingId = '';
      this.message = '';
      // show simple toast
      try {
        const container = document.getElementById('toast-container');
        if (container) {
          const el = document.createElement('div');
          el.className = 'toast success';
          el.textContent = 'Support request submitted';
          container.appendChild(el);
          setTimeout(() => { el.classList.add('hide'); setTimeout(()=>container.removeChild(el),300); }, 3000);
        }
      } catch (e) {}
    })();
  }

  goBack() {
    try { this.Router.navigateByUrl('/dashboard'); } catch (e) { window.location.href = '/'; }
  }
}
