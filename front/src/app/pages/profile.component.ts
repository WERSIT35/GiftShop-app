import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <nav class="nav">
        <a routerLink="/home" class="link">← Back</a>
        <h2>Profile</h2>
        <span></span>
      </nav>

      <main class="main">
        <section class="card" *ngIf="user">
          <div class="row">
            <img
              class="avatar"
              *ngIf="user.avatarUrl; else placeholder"
              [src]="user.avatarUrl!"
              alt="Profile picture"
              referrerpolicy="no-referrer"
            />
            <ng-template #placeholder>
              <div class="avatar placeholder" aria-hidden="true"></div>
            </ng-template>

            <div class="meta">
              <div class="name">{{ user.name || 'Unnamed user' }}</div>
              <div class="email">{{ user.email }}</div>
              <div class="role" *ngIf="user.role">Role: {{ user.role }}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: var(--bg-gradient);
      }

      .nav {
        position: sticky;
        top: 0;
        z-index: 10;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-5) var(--space-8);
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.06)
        );
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(14px);
      }

      .link {
        color: var(--brand-500);
        text-decoration: none;
        font-weight: 800;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        letter-spacing: -0.02em;
        line-height: 1.15;
        font-weight: 900;
      }

      .main {
        max-width: 980px;
        margin: 0 auto;
        padding: var(--space-8);
        display: flex;
        justify-content: center;
      }

      .card {
        width: 100%;
        max-width: 680px;
        border-radius: var(--radius-md);
        padding: var(--space-8);
        box-shadow: var(--shadow-lg);
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.06)
        );
        border: 1px solid var(--border-200);
        backdrop-filter: blur(14px);
      }

      .row {
        display: flex;
        gap: var(--space-6);
        align-items: center;
      }

      .avatar {
        width: 84px;
        height: 84px;
        border-radius: 999px;
        object-fit: cover;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.1);
      }

      .avatar.placeholder {
        background: rgba(255, 255, 255, 0.1);
      }

      .name {
        font-weight: 900;
        font-size: 1.1rem;
      }

      .email,
      .role {
        color: var(--text-600);
        margin-top: 6px;
      }

      @media (max-width: 640px) {
        .nav {
          padding: var(--space-4);
        }
        .main {
          padding: var(--space-5);
        }
        .row {
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  user: ReturnType<AuthService['getUser']> = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();

    // If user isn't in localStorage yet (e.g. first load after Google redirect)
    // fetch it from /me.
    if (!this.user) {
      this.auth.me().subscribe((res) => {
        if (res.status === 'success' && res.user) {
          this.user = res.user as any;
        } else {
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
