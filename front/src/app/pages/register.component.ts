import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthResponse } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <form class="auth-card" [formGroup]="form" (ngSubmit)="onSubmit()">

        <h2>Create Account</h2>

        <!-- SUCCESS -->
        <div *ngIf="successMessage" class="alert success">
          {{ successMessage }}
        </div>

        <!-- ERROR -->
        <div *ngIf="errorMessage" class="alert error">
          {{ errorMessage }}
        </div>

        <label>
          Full Name (Optional)
          <input type="text" formControlName="name">
        </label>

        <label>
          Email
          <input type="email" formControlName="email">
        </label>

        <label>
          Password
          <div class="password-field">
            <input
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
            />
            <button
              type="button"
              class="toggle"
              (click)="togglePassword()">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </label>

        <button type="submit" [disabled]="loading">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <p class="switch">
          Already have an account?
          <a routerLink="/login">Login here</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f4f6fb;
    }
    .auth-card {
      background: #fff;
      padding: 32px;
      width: 100%;
      max-width: 420px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,.1);
    }
    label {
      display: block;
      margin-bottom: 16px;
    }
    input {
      width: 100%;
      padding: 10px;
      margin-top: 6px;
    }
    button[type="submit"] {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      opacity: .6;
    }
    .password-field {
      display: flex;
      gap: 6px;
    }
    .toggle {
      padding: 10px;
      font-size: 12px;
    }
    .alert {
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 4px;
      font-size: 14px;
    }
    .alert.error {
      background: #fdecea;
      color: #c0392b;
    }
    .alert.success {
      background: #e8f8f5;
      color: #1e8449;
    }
    .switch {
      margin-top: 16px;
      text-align: center;
    }
  `]
})
export class RegisterComponent {

  /* =========================
     DEPENDENCY INJECTION
  ========================= */
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  /* =========================
     UI STATE
  ========================= */
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  /* =========================
     FORM
  ========================= */
  form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /* =========================
     ACTIONS
  ========================= */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { name, email, password } = this.form.getRawValue();

    this.authService.register({
      name: name || undefined,
      email,
      password
    }).subscribe({
      next: (res: AuthResponse) => {
        this.loading = false;

        if (res.status === 'success') {
          this.successMessage =
            'Registration successful. Please verify your email before signing in.';
          this.form.reset();
        } else {
          this.errorMessage = res.message || 'Registration failed.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ||
          err.message ||
          'Registration failed.';
      }
    });
  }
}
