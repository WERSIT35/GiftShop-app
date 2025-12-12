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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .navbar {
      background: rgba(0, 0, 0, 0.2);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .logo {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-info {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }

    .btn {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-logout {
      background-color: #e74c3c;
      color: white;
    }

    .btn-logout:hover {
      background-color: #c0392b;
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
      font-size: 40px;
      margin-bottom: 20px;
    }

    p {
      font-size: 18px;
      margin: 10px 0;
    }

    .info {
      font-size: 16px;
      opacity: 0.8;
      margin-top: 30px;
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
