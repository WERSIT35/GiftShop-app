import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class IdleTimeoutService {
  private static readonly LAST_ACTIVITY_KEY = 'lastActivityAt';

  // Change this if you want a different inactivity limit.
  private readonly idleTimeoutMs = 15 * 60 * 1000; // 15 minutes

  private readonly checkIntervalMs = 30 * 1000; // 30 seconds
  private readonly persistThrottleMs = 30 * 1000; // 30 seconds

  private started = false;
  private checkTimerId: number | null = null;
  private lastPersistAt = 0;

  constructor(private auth: AuthService, private router: Router) {}

  start(): void {
    if (this.started) return;
    this.started = true;

    // If a user returns after a long idle (e.g. closed laptop/browser), enforce immediately.
    this.enforceIdleLogout();

    const onActivity = () => {
      if (!this.auth.isAuthenticated()) return;
      this.touchThrottled();
    };

    // User activity signals
    const events: Array<keyof DocumentEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    for (const eventName of events) {
      document.addEventListener(eventName, onActivity, { passive: true });
    }

    // If another tab updates activity/logout, reflect it here.
    window.addEventListener('storage', (e) => {
      if (e.key === 'authToken' || e.key === IdleTimeoutService.LAST_ACTIVITY_KEY) {
        this.enforceIdleLogout();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.enforceIdleLogout();
      }
    });

    this.checkTimerId = window.setInterval(() => this.enforceIdleLogout(), this.checkIntervalMs);
  }

  touch(): void {
    localStorage.setItem(IdleTimeoutService.LAST_ACTIVITY_KEY, String(Date.now()));
  }

  clear(): void {
    localStorage.removeItem(IdleTimeoutService.LAST_ACTIVITY_KEY);
  }

  isIdleExpired(): boolean {
    const last = this.getLastActivityAt();
    if (!last) return false;
    return Date.now() - last > this.idleTimeoutMs;
  }

  enforceIdleLogout(): void {
    if (!this.auth.isAuthenticated()) return;

    // If we have no activity marker (older sessions), treat now as first activity.
    const last = this.getLastActivityAt();
    if (!last) {
      this.touch();
      return;
    }

    if (!this.isIdleExpired()) return;

    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private getLastActivityAt(): number | null {
    const raw = localStorage.getItem(IdleTimeoutService.LAST_ACTIVITY_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private touchThrottled(): void {
    const now = Date.now();
    if (now - this.lastPersistAt < this.persistThrottleMs) return;
    this.lastPersistAt = now;
    this.touch();
  }
}
