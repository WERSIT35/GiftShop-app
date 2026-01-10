import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Sign in</h2>

        <!-- OAuth error (optional) -->
        <p class="error" *ngIf="oauthError">{{ oauthError }}</p>

        <button
          type="button"
          class="google-btn"
          (click)="continueWithGoogle()"
          [disabled]="loading"
        >
          <span class="g">G</span>
          Continue with Google
        </button>

        <div class="divider" aria-hidden="true">
          <span>or</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="user@example.com"
              autocomplete="email"
            />
            <small *ngIf="isInvalid('email')">Please enter a valid email</small>
          </div>

          <div class="form-group">
            <label>Password</label>

            <div class="password-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Your password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle"
                (click)="togglePassword()"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>

            <small *ngIf="isInvalid('password')">Password is required</small>
          </div>

          <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <div class="links">
          <a routerLink="/forgot-password">Forgot password?</a>
          <span>•</span>
          <a routerLink="/register">Create account</a>
          <span>•</span>
          <a routerLink="/store">Visit store</a>
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
      padding: var(--space-5);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      border-radius: var(--radius-md);
      padding: var(--space-8);
      box-shadow: var(--shadow-lg);
      background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
      border: 1px solid var(--border-200);
      backdrop-filter: blur(14px);
    }

    h2 {
      text-align: center;
      margin: 0 0 var(--space-6);
      font-size: clamp(1.5rem, 1.5vw + 1.1rem, 2rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .google-btn {
      width: 100%;
      min-height: 44px;
      border-radius: 12px;
      border: 1px solid var(--border-200);
      background: rgba(255,255,255,0.10);
      color: var(--text-900);
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: transform 120ms ease, background 120ms ease;
    }
    .google-btn:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }
    .google-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .g {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(10, 132, 255, 0.18);
      border: 1px solid rgba(10, 132, 255, 0.35);
      font-weight: 800;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: var(--space-5) 0;
      color: var(--text-600);
      font-size: 0.95rem;
    }
    .divider::before, .divider::after {
      content: "";
      height: 1px;
      flex: 1;
      background: rgba(255,255,255,0.12);
    }
    .divider span { padding: 0 6px; }

    .form-group { margin-bottom: var(--space-4); }

    label { display: block; margin-bottom: 8px; color: var(--text-700); font-weight: 600; }

    input {
      width: 100%;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.18);
      color: var(--text-900);
    }

    .password-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .password-wrapper input { flex: 1; }

    .toggle {
      min-height: 44px;
      padding: 0 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.10);
      color: var(--text-900);
      cursor: pointer;
      font-weight: 700;
      white-space: nowrap;
    }

    small { color: var(--danger-500); }

    button[type="submit"] {
      width: 100%;
      min-height: 44px;
      margin-top: var(--space-2);
      padding: 12px 14px;
      background: var(--brand-500);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 120ms ease, background 120ms ease;
    }
    button[type="submit"]:hover { background: var(--brand-700); transform: translateY(-1px); }
    button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .error { color: var(--danger-500); text-align: center; margin: 8px 0; }

    .links {
      margin-top: var(--space-5);
      text-align: center;
      font-size: 0.95rem;
      color: var(--text-700);
    }
    .links a { color: var(--brand-500); text-decoration: none; font-weight: 700; }
    .links span { margin: 0 8px; opacity: 0.7; }

    @media (max-width: 480px) {
      .auth-container { padding: var(--space-4); }
      .auth-card { padding: var(--space-6); }
    }
  `],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  oauthError = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const err = this.route.snapshot.queryParamMap.get('error');

    if (err) this.oauthError = decodeURIComponent(err);

    if (token) {
      localStorage.setItem('authToken', token);

      this.auth.me().subscribe({
        next: (res) => {
          if (res.status === 'success') {
              const role = res.user?.role;
              const target = role === 'admin' ? '/admin' : '/store';
            // Clean URL and go to app
              this.router.navigate([target], { replaceUrl: true });
          } else {
            localStorage.removeItem('authToken');
            this.errorMessage = res.message || 'Google login failed';
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        },
        error: () => {
          localStorage.removeItem('authToken');
          this.errorMessage = 'Google login failed';
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      });
    }
  }

  continueWithGoogle(): void {
    // Requires backend route GET /api/auth/google
    window.location.assign('/api/auth/google');
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private refreshUi(): void {
    // Ensure the view is marked dirty
    this.cdr.markForCheck();

    // Then update AFTER the current change detection completes
    queueMicrotask(() => {
      try {
        this.cdr.detectChanges();
      } catch {
        // ignore
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.refreshUi();

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.status !== 'success') {
          this.errorMessage = res.message || 'Invalid credentials';
          this.refreshUi();
          return;
        }

        const role = res.user?.role;
        this.router.navigate([role === 'admin' ? '/admin' : '/store']);
        this.refreshUi();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
        this.refreshUi();
      },
    });
  }
}
