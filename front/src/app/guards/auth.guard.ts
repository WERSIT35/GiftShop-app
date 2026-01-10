import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IdleTimeoutService } from '../services/idle-timeout.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const idle = inject(IdleTimeoutService);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  idle.enforceIdleLogout();
  if (!authService.isAuthenticated()) return false;

  return true;
};
