import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportService, SupportRequest } from '../../../services/support';

@Component({
  selector: 'app-support-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-requests.html',
  styleUrls: ['./support-requests.css']
})
export class SupportRequests implements OnInit {
  service = new SupportService();
  requests: SupportRequest[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(){
    this.requests = this.service.listAll() || [];
  }

  exportJSON(){
    try {
      const data = JSON.stringify(this.requests, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `support-requests-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch(e){}
  }

  clearAll(){
    if (!confirm('Clear all saved support requests? This cannot be undone.')) return;
    this.service.clearAll();
    this.load();
  }
}
