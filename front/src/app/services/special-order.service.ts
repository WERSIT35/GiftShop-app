import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SpecialOrderRequest {
  name: string;
  email: string;
  phone?: string | null;

  productType?: string;
  quantity?: number | null;

  voltage?: string | null;
  wattage?: string | null;
  lengthMm?: number | null;
  diameterMm?: number | null;
  sheathMaterial?: string | null;
  termination?: string | null;
  leadLengthMm?: number | null;
  mounting?: string | null;

  notes?: string | null;
}

export interface SpecialOrderResponse {
  status: 'success' | 'error';
  message: string;
  order?: { id: string; code?: string | null };
}

@Injectable({ providedIn: 'root' })
export class SpecialOrderService {
  constructor(private http: HttpClient) {}

  submit(payload: SpecialOrderRequest): Observable<SpecialOrderResponse> {
    return this.http.post<SpecialOrderResponse>('/api/special-orders', payload);
  }
}
