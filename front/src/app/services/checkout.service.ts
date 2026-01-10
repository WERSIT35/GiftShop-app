import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PaymentProvider = 'stripe' | 'tbc' | 'bog';

export interface CheckoutItem {
  name: string;
  quantity: number;
  unitPrice: number; // major units (e.g. 12.34)
}

export interface ShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface CreateCheckoutRequest {
  guestEmail: string;
  guestName?: string | null;
  currency: string;
  shippingAddress: ShippingAddress;
  items: CheckoutItem[];
}

export interface CreateCheckoutResponse {
  status: 'success' | 'error';
  message: string;
  order?: {
    id: string;
    code?: string | null;
    currency: string;
    amountMinor: number;
    status: string;
  };
}

export interface CreatePaymentResponse {
  status: 'success' | 'error';
  message?: string;
  provider?: PaymentProvider;
  kind?: 'clientSecret' | 'redirectUrl';
  clientSecret?: string | null;
  publishableKey?: string;
  redirectUrl?: string;
  order?: {
    id: string;
    code?: string | null;
    amountMinor: number;
    currency: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(private http: HttpClient) {}

  createCheckout(payload: CreateCheckoutRequest): Observable<CreateCheckoutResponse> {
    return this.http.post<CreateCheckoutResponse>('/api/checkout', payload);
  }

  createPayment(provider: PaymentProvider, orderId: string): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>('/api/payments/create', { provider, orderId });
  }
}
