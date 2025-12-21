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
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .auth-card {
      background: white;
      padding: 32px;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 15px 30px rgba(0,0,0,.2);
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

    button {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error {
      color: #e74c3c;
      text-align: center;
      margin-top: 10px;
    }

    .success {
      color: #27ae60;
      text-align: center;
      margin-top: 10px;
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
