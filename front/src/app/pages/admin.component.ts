import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <h2>Users List</h2>
      <div *ngIf="loading">Loading users...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
        <div class="table-wrap" *ngIf="!loading && users && users.length">
          <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email Verified</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users; trackBy: trackByUserId">
              <td>{{ user.email }}</td>
              <td>
                <span *ngIf="!editRow || editRow !== user._id">{{ user.name }}</span>
                <input *ngIf="editRow === user._id" [(ngModel)]="editUser.name" />
              </td>
              <td>
                <span *ngIf="!editRow || editRow !== user._id">{{ user.role }}</span>
                <select *ngIf="editRow === user._id" [(ngModel)]="editUser.role">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>{{ user.isEmailVerified ? 'Yes' : 'No' }}</td>
              <td>{{ user.createdAt | date:'short' }}</td>
              <td>
                <button (click)="onEdit(user)" *ngIf="!editRow || editRow !== user._id">Edit</button>
                <button (click)="onSave(user)" *ngIf="editRow === user._id">Save</button>
                <button (click)="onCancel()" *ngIf="editRow === user._id">Cancel</button>
                <button (click)="onDelete(user)" style="color:red;">Delete</button>
              </td>
            </tr>
          </tbody>
          </table>
        </div>
      <div *ngIf="!loading && users && !users.length">No users found.</div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 980px;
      margin: 40px auto;
      background: var(--surface-0);
      border-radius: var(--radius-md);
      padding: var(--space-8);
      box-shadow: var(--shadow-md);
    }

    h2 {
      margin-bottom: var(--space-6);
      font-size: clamp(1.4rem, 1.4vw + 1.05rem, 2rem);
      line-height: 1.2;
    }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid var(--border-200);
      border-radius: var(--radius-md);
    }

    table {
      width: 100%;
      min-width: 780px;
      border-collapse: collapse;
      margin-bottom: 0;
    }

    th, td {
      padding: 12px;
      border-bottom: 1px solid var(--border-200);
      text-align: left;
      font-size: 1rem;
      vertical-align: middle;
    }

    th {
      background: var(--surface-1);
      font-weight: 700;
    }

    input, select {
      width: 100%;
      padding: 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-200);
      font-size: 1rem;
      background: var(--surface-0);
    }

    button {
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-200);
      background: var(--surface-1);
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      margin-right: 8px;
    }

    .error { color: var(--danger-500); margin-bottom: var(--space-4); }

    @media (max-width: 640px) {
      .admin-container {
        margin: 16px;
        padding: var(--space-6);
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error = '';
    editRow: string | null = null;
    editUser: any = {};
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  private refreshUi(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // ignore if view is destroyed during navigation
    }
  }

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.error = '';
    this.refreshUi();

    // Absolute failsafe: if something prevents the HTTP observable from ever resolving,
    // stop showing an infinite spinner and surface a useful message.
    const watchdog = window.setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Still waiting for /api/users. Open DevTools → Network and check if the request is pending/blocked.';
        this.refreshUi();
      }
    }, 9000);

    console.log('Fetching users from /api/users...');

    this.adminService
      .getUsers()
      .pipe(
        timeout(8000),
        finalize(() => {
          window.clearTimeout(watchdog);
          this.loading = false;
          this.refreshUi();
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('Admin users API response:', res);
          if (res && Array.isArray(res.users)) {
            this.users = res.users;
          } else {
            this.users = [];
            this.error = 'API did not return users array.';
          }
          this.refreshUi();
        },
        error: (err: any) => {
          if (err?.name === 'TimeoutError') {
            this.error = 'Request timed out. Backend/proxy might be unreachable from the browser.';
            this.refreshUi();
            return;
          }
          this.error = err.error?.message || 'Failed to load users';
          this.refreshUi();
        },
      });
  }

  onEdit(user: any) {
    this.editRow = user._id;
    this.editUser = { ...user };
  }

  onCancel() {
    this.editRow = null;
    this.editUser = {};
  }

  onSave(user: any) {
    this.adminService.updateUser(user._id, this.editUser).subscribe({
      next: () => {
        this.editRow = null;
        this.editUser = {};
        this.fetchUsers();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to update user';
      }
    });
  }

  onDelete(user: any) {
    if (confirm(`Delete user ${user.email}?`)) {
      this.adminService.deleteUser(user._id).subscribe({
        next: () => this.fetchUsers(),
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to delete user';
        }
      });
    }
  }

  trackByUserId(index: number, user: any) {
    return user._id;
  }
}
