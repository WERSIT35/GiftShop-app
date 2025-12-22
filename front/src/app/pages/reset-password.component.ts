import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Reset Password</h2>

        <form [formGroup]="form" (ngSubmit)="submit()">

          <div class="form-group">
            <label>New Password</label>
            <input
              type="password"
              formControlName="password"
              placeholder="New password"
            />
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirm password"
            />
          </div>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="success">{{ success }}</p>

          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Resetting…' : 'Reset Password' }}
          </button>
        </form>
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
    }

    h2 {
      text-align: center;
      margin-bottom: var(--space-6);
      font-size: clamp(1.4rem, 1.4vw + 1.05rem, 1.9rem);
      line-height: 1.2;
    }

    .form-group {
      margin-bottom: var(--space-4);
    }

    input {
      width: 100%;
      padding: var(--space-3);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-200);
      font-size: 1rem;
    }

    button {
      width: 100%;
      padding: var(--space-3);
      background: var(--brand-500);
      color: var(--surface-0);
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error {
      color: var(--danger-500);
      text-align: center;
      margin-top: var(--space-2);
    }

    .success {
      color: var(--success-600);
      text-align: center;
      margin-top: var(--space-2);
    }

    @media (max-width: 480px) {
      .auth-container { padding: var(--space-4); }
      .auth-card { padding: var(--space-6); }
    }
  `]
})
export class ResetPasswordComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';

  private token: string | null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');

    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  submit(): void {
    if (!this.token) {
      this.error = 'Invalid or expired reset link';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.form.getRawValue();

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.auth.resetPassword({
      token: this.token,
      password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password reset successful. Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Reset failed';
      }
    });
  }
}
