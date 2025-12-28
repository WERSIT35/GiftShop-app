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
    background: var(--bg-gradient);
    padding: var(--space-5);
  }

  .auth-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
    border: 1px solid var(--border-200);
    backdrop-filter: blur(14px);
    padding: var(--space-8);
    width: 100%;
    max-width: 440px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  h2 {
    text-align: center;
    margin: 0 0 var(--space-6);
    font-size: clamp(1.5rem, 1.5vw + 1.1rem, 2rem);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  label {
    display: block;
    margin-bottom: var(--space-4);
    color: var(--text-700);
    font-weight: 700;
  }

  input {
    width: 100%;
    padding: 12px 14px;
    margin-top: var(--space-2);
    border-radius: 12px;
    border: 1px solid var(--border-200);
    background: rgba(0,0,0,0.18);
    color: var(--text-900);
    font-size: 1rem;
  }

  button[type="submit"] {
    width: 100%;
    min-height: 44px;
    padding: 12px 14px;
    background: var(--brand-500);
    color: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 800;
    transition: transform 120ms ease, background 120ms ease;
  }
  button[type="submit"]:hover { background: var(--brand-700); transform: translateY(-1px); }
  button:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .password-field { display: flex; gap: 10px; align-items: center; }
  .password-field input { flex: 1; }

  .toggle {
    min-height: 44px;
    padding: 0 12px;
    font-size: 0.95rem;
    border: 1px solid var(--border-200);
    background: rgba(255,255,255,0.10);
    color: var(--text-900);
    border-radius: 12px;
    cursor: pointer;
    font-weight: 800;
    white-space: nowrap;
  }

  .alert {
    padding: 12px 14px;
    margin-bottom: var(--space-4);
    border-radius: 12px;
    font-size: 0.95rem;
    border: 1px solid var(--border-200);
    background: rgba(0,0,0,0.18);
  }
  .alert.error {
    border-color: rgba(255, 69, 58, 0.35);
    background: rgba(255, 69, 58, 0.12);
    color: var(--text-900);
  }
  .alert.success {
    border-color: rgba(50, 215, 75, 0.35);
    background: rgba(50, 215, 75, 0.12);
    color: var(--text-900);
  }

  .switch {
    margin-top: var(--space-4);
    text-align: center;
    font-size: 0.95rem;
    color: var(--text-600);
  }
  .switch a { font-weight: 800; }

  @media (max-width: 480px) {
    .auth-container { padding: var(--space-4); }
    .auth-card { padding: var(--space-6); }
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
