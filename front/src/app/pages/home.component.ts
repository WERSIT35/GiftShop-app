import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <nav class="navbar">
        <h1 class="logo">Gift Shop</h1>
        <div class="nav-links">
          <span class="user-info" *ngIf="userEmail">Welcome, {{ userEmail }}</span>
          <button (click)="logout()" class="btn btn-logout">Logout</button>
        </div>
      </nav>

      <main class="main-content">
        <h2>Welcome to Gift Shop!</h2>
        <p>You have successfully logged in.</p>
        <p class="info">This is your dashboard. More features coming soon...</p>
      </main>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-gradient);
    }

    .navbar {
      background: rgba(0, 0, 0, 0.2);
      padding: var(--space-5) var(--space-8);
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      gap: var(--space-4);
    }

    .logo {
      color: white;
      margin: 0;
      font-size: clamp(1.4rem, 1.3vw + 1.1rem, 1.8rem);
      font-weight: 600;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-5);
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .user-info {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1rem;
    }

    .btn {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .btn-logout {
      background-color: var(--danger-500);
      color: white;
    }

    .btn-logout:hover {
      background-color: var(--danger-700);
      transform: translateY(-2px);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      text-align: center;
      color: white;
    }

    h2 {
      font-size: clamp(1.8rem, 3vw + 1.1rem, 2.6rem);
      margin-bottom: 20px;
    }

    p {
      font-size: 1.05rem;
      margin: 10px 0;
    }

    .info {
      font-size: 1rem;
      opacity: 0.8;
      margin-top: 30px;
    }

    @media (max-width: 640px) {
      .navbar {
        padding: var(--space-4);
        align-items: flex-start;
      }

      .nav-links {
        width: 100%;
        justify-content: space-between;
        gap: var(--space-3);
      }

      .btn {
        width: 100%;
      }
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
