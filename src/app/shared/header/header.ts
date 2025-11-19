import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  private Router = inject(Router);
  private UserSrv = inject(UserService);
  // local UI state for mobile nav toggle
  showNav = false;

  openProfile() {
    // SPA navigation to profile
    this.showNav = false;
    this.Router.navigateByUrl('/profile');
  }

  openSupport() {
    // navigate to support page within SPA
    try { this.Router.navigateByUrl('/support'); } catch (e) { window.location.href = '/support'; }
  }

  logoff() {
    try { localStorage.removeItem('parkUser'); } catch (e) {}
    try { this.Router.navigateByUrl('/login'); } catch (e) { window.location.href = '/login'; }
  }

  toggleNav() {
    this.showNav = !this.showNav;
  }
}
