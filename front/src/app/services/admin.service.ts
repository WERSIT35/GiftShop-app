import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  private authHeaders(): { headers?: HttpHeaders } {
    const token = localStorage.getItem('authToken');
    if (!token) return {};
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getUsers(): Observable<any> {
    return this.http.get<any>('/api/users', this.authHeaders()).pipe(
      tap(() => console.log('[AdminService] GET /api/users sent')),
      timeout(8000)
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`/api/users/${id}`, this.authHeaders()).pipe(timeout(8000));
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put<any>(`/api/users/${id}`, data, this.authHeaders()).pipe(timeout(8000));
  }
}
