import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthResponse, AuthService } from '../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-container">
      <div class="verify-card">
        <div class="status-icon" [ngClass]="status">
          <span *ngIf="status === 'loading'">⏳</span>
          <span *ngIf="status === 'success'">✓</span>
          <span *ngIf="status === 'error'">✕</span>
          <span *ngIf="status === 'already'">ℹ️</span>
        </div>

        <h2>{{ getTitle() }}</h2>
        <p class="message">{{ message }}</p>

        <div class="actions" *ngIf="status !== 'loading'">
          <a routerLink="/login" class="btn btn-primary">Go to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .verify-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: var(--bg-gradient);
        padding: var(--space-5);
      }

      .verify-card {
        background: var(--surface-0);
        border-radius: var(--radius-md);
        padding: var(--space-8);
        box-shadow: var(--shadow-lg);
        width: 100%;
        max-width: 400px;
        text-align: center;
      }

      .status-icon {
        font-size: 3rem;
        margin-bottom: var(--space-5);
      }
      h2 {
        font-size: clamp(1.4rem, 1.4vw + 1.05rem, 1.9rem);
        line-height: 1.2;
        margin-bottom: var(--space-3);
      }
      .message {
        margin-bottom: var(--space-5);
        color: var(--text-600);
        font-size: 1rem;
      }
      .btn-primary {
        background-color: var(--brand-500);
        color: var(--surface-0);
        padding: 12px 24px;
        border-radius: var(--radius-sm);
        text-decoration: none;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
      }
      .btn-primary:hover {
        background-color: var(--brand-700);
      }

      @media (max-width: 480px) {
        .verify-container { padding: var(--space-4); }
        .verify-card { padding: var(--space-6); }
      }
    `,
  ],
})
export class VerifyComponent implements OnInit, OnDestroy {
  status: 'loading' | 'success' | 'error' | 'already' = 'loading';
  message = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Add this
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!token || !email) {
      this.setStatus('error', 'Invalid verification link.');
      return;
    }

    this.authService
      .verifyEmail(token, email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: AuthResponse) => {
          console.log('Verification response:', res);

          // ✅ SUCCESS if we reached here
          if (res?.alreadyVerified) {
            this.setStatus('already', res.message || 'Email already verified.');
          } else {
            this.setStatus('success', res?.message || 'Email verified successfully.');
          }
        },
        error: (err) => {
          console.error('Verification error:', err);
          this.setStatus(
            'error',
            err.error?.message || 'Verification failed. The link may be invalid or expired.'
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setStatus(status: 'loading' | 'success' | 'error' | 'already', message: string): void {
    this.status = status;
    this.message = message;
    this.cdr.detectChanges(); // Force change detection
  }

  getTitle(): string {
    switch (this.status) {
      case 'loading':
        return 'Verifying Email...';
      case 'success':
        return 'Email Verified!';
      case 'already':
        return 'Email Already Verified';
      case 'error':
        return 'Verification Failed';
      default:
        return '';
    }
  }
}
