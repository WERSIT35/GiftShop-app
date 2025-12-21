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
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .auth-card {
      background: #fff;
      padding: 32px;
      width: 100%;
      max-width: 420px;
      border-radius: 8px;
      box-shadow: 0 15px 30px rgba(0,0,0,.2);
    }

    h2 {
      text-align: center;
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    input {
      width: 100%;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ccc;
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
      font-size: 18px;
      margin-left: -40px;
    }

    small {
      color: #e74c3c;
    }

    button[type="submit"] {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error {
      color: #e74c3c;
      text-align: center;
      margin-top: 8px;
    }

    .links {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
    }

    .links a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .links span {
      margin: 0 8px;
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
