import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <nav class="nav">
        <div class="brand">
          <h1 class="logo">Gift Shop</h1>
          <span class="pill" *ngIf="userEmail">Signed in as {{ userEmail }}</span>
        </div>

        <div class="actions">
          <button (click)="logout()" class="btn danger">Logout</button>
        </div>
      </nav>

      <main class="main">
        <section class="card">
          <h2>Welcome back</h2>
          <p class="muted">You have successfully logged in.</p>
          <p class="muted">This is your dashboard. More features coming soon…</p>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: var(--bg-gradient);
    }

    .nav {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-5) var(--space-8);
      background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
      border-bottom: 1px solid rgba(255,255,255,0.10);
      backdrop-filter: blur(14px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      min-width: 0;
      flex-wrap: wrap;
    }

    .logo {
      margin: 0;
      font-size: clamp(1.25rem, 1.2vw + 1rem, 1.6rem);
      letter-spacing: -0.02em;
      font-weight: 800;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--border-200);
      background: rgba(0,0,0,0.18);
      color: var(--text-700);
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .actions { display: flex; gap: var(--space-3); }

    .btn {
      min-height: 44px;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--border-200);
      background: rgba(255,255,255,0.10);
      color: var(--text-900);
      font-weight: 800;
      cursor: pointer;
      transition: transform 120ms ease, background 120ms ease;
    }
    .btn:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }

    .btn.danger {
      border-color: rgba(255, 69, 58, 0.35);
      background: rgba(255, 69, 58, 0.12);
    }
    .btn.danger:hover {
      background: rgba(255, 69, 58, 0.18);
    }

    .main {
      max-width: 980px;
      margin: 0 auto;
      padding: var(--space-8);
    }

    .card {
      border-radius: var(--radius-md);
      padding: var(--space-8);
      box-shadow: var(--shadow-lg);
      background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
      border: 1px solid var(--border-200);
      backdrop-filter: blur(14px);
    }

    h2 {
      margin: 0 0 var(--space-4);
      font-size: clamp(1.6rem, 2.5vw + 1rem, 2.3rem);
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .muted { color: var(--text-600); margin: 10px 0; }

    @media (max-width: 640px) {
      .nav { padding: var(--space-4); }
      .main { padding: var(--space-5); }
      .btn { width: 100%; }
      .actions { width: 100%; }
      .nav { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class HomeComponent {
  userEmail: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getUser();
    this.userEmail = user?.email || null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
