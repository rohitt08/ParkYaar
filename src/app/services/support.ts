export interface SupportRequest {
  id: string;
  name: string | null;
  email: string;
  spotId?: string | null;
  bookingId?: string | null;
  message: string;
  createdAt: string;
}

export class SupportService {
  private storageKey = 'parkSupportRequests_v1';
  // configurable endpoint; consumers may set a different url in runtime configs
  endpoint = '/api/support';

  async submit(request: SupportRequest): Promise<{ ok: boolean; message?: string }>{
    // try POST to configured endpoint first
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (res.ok) return { ok: true };
      // if server returns non-ok, fall through to local save
    } catch (e) {
      // network error or not available - we'll fall back to local storage
    }

    try {
      const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      existing.unshift(request);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
      return { ok: true, message: 'Saved locally' };
    } catch (e) {
      return { ok: false, message: 'Failed to save support request' };
    }
  }

  listAll(): SupportRequest[] {
    try { return JSON.parse(localStorage.getItem(this.storageKey) || '[]'); } catch (e) { return []; }
  }

  clearAll(){ try { localStorage.removeItem(this.storageKey); } catch(e){} }
}
 
