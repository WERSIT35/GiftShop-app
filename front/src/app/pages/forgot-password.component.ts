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
      background: linear-gradient(135deg, #667eea, #764ba2);
      padding: 20px;
    }

    .auth-card {
      background: #fff;
      padding: 32px;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,.2);
      text-align: center;
    }

    h2 { margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 20px; }

    input {
      width: 100%;
      padding: 12px;
      margin-bottom: 14px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    button {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error {
      color: #d32f2f;
      margin-bottom: 10px;
    }

    .success {
      color: #2e7d32;
      margin-bottom: 10px;
    }

    .back {
      margin-top: 16px;
    }

    a {
      color: #667eea;
      text-decoration: none;
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
