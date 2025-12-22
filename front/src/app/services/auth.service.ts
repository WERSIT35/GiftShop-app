// FORGOT PASSWORD

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    role?: 'user' | 'admin' | string;
    isEmailVerified?: boolean;
  };
  alreadyVerified?: boolean;
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private readonly API_URL = '/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public get currentUserValue() {
    return this.currentUserSubject?.value;
  }

  constructor(private http: HttpClient) {}

  // REGISTER
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, data)
      .pipe(
        catchError((err) =>
          of({
            status: 'error',
            message: err.error?.message || 'Registration failed',
          } as AuthResponse)
        )
      );
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/forgot-password`, { email })
      .pipe(
        catchError((err) =>
          of({
            status: 'error',
            message: err.error?.message || 'Failed to send reset email.',
          } as AuthResponse)
        )
      );
  }

  // RESET PASSWORD
  resetPassword(data: { token: string; password: string }) {
    return this.http.post<any>('/api/auth/reset-password', data);
  }

  // LOGIN
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data).pipe(
      tap((res) => {
        if (res.status === 'success' && res.token && res.user) {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      }),
      catchError((err) =>
        of({ status: 'error', message: err.error?.message || 'Login failed' } as AuthResponse)
      )
    );
  }

  // VERIFY EMAIL
  verifyEmail(token: string, email: string): Observable<AuthResponse> {
    const params = new HttpParams().set('token', token).set('email', email);
    return this.http
      .get<AuthResponse>(`${this.API_URL}/verify`, { params })
      .pipe(
        catchError((err) =>
          of({
            status: 'error',
            message: err.error?.message || 'Verification failed',
          } as AuthResponse)
        )
      );
  }

  // ME (CURRENT USER)
  me(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/me`).pipe(
      tap((res) => {
        if (res.status === 'success' && res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      }),
      catchError((err) =>
        of({
          status: 'error',
          message: err.error?.message || 'Failed to fetch current user',
        } as AuthResponse)
      )
    );
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // GET TOKEN
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // GET USER
  getUser(): { id: string; email: string; name?: string | null; role?: string; isEmailVerified?: boolean } | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // CHECK AUTHENTICATION
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  
}
