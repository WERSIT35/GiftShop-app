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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .verify-card {
        background: white;
        border-radius: 8px;
        padding: 40px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
        text-align: center;
      }

      .status-icon {
        font-size: 48px;
        margin-bottom: 20px;
      }
      .message {
        margin-bottom: 20px;
        color: #555;
      }
      .btn-primary {
        background-color: #667eea;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        text-decoration: none;
      }
      .btn-primary:hover {
        background-color: #5568d3;
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
