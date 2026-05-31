import { Injectable } from '@angular/core';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  // Simulate a payment gateway. In real app, replace with actual payment SDK/API integration.
  processPayment(amount: number, method: string = 'card'): Promise<PaymentResult> {
    return new Promise((resolve) => {
      // small delay to simulate network/payment processing
      setTimeout(() => {
        // simulate success 95% of the time
        const ok = Math.random() > 0.05;
        if (ok) {
          resolve({ success: true, paymentId: `PAY-${Date.now()}` });
        } else {
          resolve({ success: false, message: 'Payment failed due to network error' });
        }
      }, 900);
    });
  }
}
 
