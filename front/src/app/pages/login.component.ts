import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Login</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- EMAIL -->
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="user@example.com"
            />
            <small *ngIf="isInvalid('email')">
              Please enter a valid email
            </small>
          </div>

          <!-- PASSWORD -->
          <div class="form-group">
            <label>Password</label>

            <div class="password-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Your password"
              />
              <button
                type="button"
                class="toggle"
                (click)="togglePassword()"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>

            <small *ngIf="isInvalid('password')">
              Password is required
            </small>
          </div>

          <!-- ERROR MESSAGE -->
          <p class="error" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <!-- SUBMIT -->
          <button
            type="submit"
            [disabled]="form.invalid || loading"
          >
            {{ loading ? 'Logging in…' : 'Login' }}
          </button>
        </form>

        <!-- LINKS -->
        <div class="links">
          <a routerLink="/forgot-password">Forgot password?</a>
          <span>•</span>
          <a routerLink="/register">Create account</a>
        </div>
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
      width: 100%;
      max-width: 420px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
    }

    h2 {
      text-align: center;
      margin-bottom: var(--space-6);
      font-size: clamp(1.5rem, 1.5vw + 1.1rem, 2rem);
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

    .password-wrapper {
      display: flex;
      align-items: center;
    }

    .password-wrapper input {
      flex: 1;
    }

    .toggle {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      margin-left: -44px;
      padding: 0 8px;
    }

    small {
      color: var(--danger-500);
    }

    button[type="submit"] {
      width: 100%;
      padding: var(--space-3);
      background: var(--brand-500);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      margin-top: var(--space-2);
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

    .links {
      margin-top: var(--space-5);
      text-align: center;
      font-size: 0.95rem;
    }

    .links a {
      color: var(--brand-500);
      text-decoration: none;
      font-weight: 600;
    }

    .links span {
      margin: 0 8px;
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: var(--space-4);
      }

      .auth-card {
        padding: var(--space-6);
      }

      .links {
        font-size: 1rem;
      }
    }
  `],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // ✅ FIX: form created AFTER fb is available
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

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

    const { email, password } = this.form.getRawValue();

    this.auth.login({
      email: email!,
      password: password!,
    }).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.status === 'success') {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Login failed';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Login failed. Try again.';
      }
    });
  }
}
