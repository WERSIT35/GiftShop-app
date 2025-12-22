import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Forgot Password</h2>

        <p class="subtitle">
          Enter your email and we’ll send you a reset link.
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <input
            type="email"
            placeholder="Email"
            formControlName="email"
          />

          <p class="success" *ngIf="successMessage">
            {{ successMessage }}
          </p>

          <p class="error" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            [disabled]="loading || form.invalid"
          >
            {{ loading ? 'Sending…' : 'Send Reset Link' }}
          </button>
        </form>

        <p class="back">
          <a routerLink="/login">← Back to login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--bg-gradient);
      padding: var(--space-5);
    }

    .auth-card {
      background: var(--surface-0);
      padding: var(--space-8);
      border-radius: var(--radius-md);
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-lg);
      text-align: center;
    }

    h2 {
      margin-bottom: var(--space-2);
      font-size: clamp(1.4rem, 1.4vw + 1.05rem, 1.9rem);
      line-height: 1.2;
    }
    .subtitle {
      color: var(--text-600);
      margin-bottom: var(--space-5);
      font-size: 1rem;
    }

    input {
      width: 100%;
      padding: var(--space-3);
      margin-bottom: var(--space-3);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-200);
    }

    button {
      width: 100%;
      padding: var(--space-3);
      background: var(--brand-500);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
    }

    button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error {
      color: var(--danger-500);
      margin-bottom: var(--space-2);
    }

    .success {
      color: var(--success-700);
      margin-bottom: var(--space-2);
    }

    .back {
      margin-top: var(--space-4);
    }

    a {
      color: var(--brand-500);
      text-decoration: none;
    }

    @media (max-width: 480px) {
      .auth-container { padding: var(--space-4); }
      .auth-card { padding: var(--space-6); }
    }
  `]
})
export class ForgotPasswordComponent {
  loading = false;
  errorMessage = '';
  successMessage = '';
  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please enter a valid email.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.form.getRawValue().email;

    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage =
          res?.message || 'Reset link sent. Check your email.';

        // Optional auto-redirect
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err?.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Failed to send reset email. Please try again later.';
        }
      }
    });
  }
}
