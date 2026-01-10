import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { IdleTimeoutService } from '../services/idle-timeout.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private idle: IdleTimeoutService
  ) {}

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']);
      return of(false);
    }

    this.idle.enforceIdleLogout();
    if (!this.authService.isAuthenticated()) return of(false);

    return this.authService.me().pipe(
      map((res) => {
        const role = res.user?.role;
        if (res.status === 'success' && role === 'admin') {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}