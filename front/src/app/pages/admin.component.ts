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
      <h2>Users</h2>

      <div *ngIf="loading" class="muted">Loading users...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="table-wrap" *ngIf="!loading && users && users.length">
        <table>
          <thead>
            <tr>
              <th>Online</th>
              <th>Email</th>
              <th>Name</th>
              <th>PIN</th>
              <th>Last Seen</th>
              <th>Role</th>
              <th>Email Verified</th>
              <th>Created At</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let user of users; trackBy: trackByUserId">
              <td [attr.data-label]="'Online'">
                <span
                  class="status-dot"
                  [class.online]="user.online"
                  [class.offline]="!user.online"
                  [attr.title]="user.online ? 'Online' : 'Offline'"
                  aria-hidden="true"
                ></span>
              </td>

              <td [attr.data-label]="'Email'">
                <div class="cell">
                  <div>{{ user.email }}</div>
                  <div class="sub mono" *ngIf="user.lastIp">IP: {{ user.lastIp }}</div>
                </div>
              </td>

              <td [attr.data-label]="'Name'">
                <span *ngIf="!editRow || editRow !== user._id">{{ user.name }}</span>
                <input *ngIf="editRow === user._id" [(ngModel)]="editUser.name" />
              </td>

              <td [attr.data-label]="'PIN'">{{ user.pinCode || '-' }}</td>

              <td [attr.data-label]="'Last Seen'">{{ user.lastSeenAt ? (user.lastSeenAt | date:'short') : '-' }}</td>

              <td [attr.data-label]="'Role'">
                <span *ngIf="!editRow || editRow !== user._id">{{ user.role }}</span>
                <select *ngIf="editRow === user._id" [(ngModel)]="editUser.role">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>

              <td [attr.data-label]="'Email Verified'">{{ user.isEmailVerified ? 'Yes' : 'No' }}</td>
              <td [attr.data-label]="'Created'">{{ user.createdAt | date:'short' }}</td>

              <td class="actions" [attr.data-label]="'Actions'">
                <button (click)="onEdit(user)" *ngIf="!editRow || editRow !== user._id">Edit</button>
                <button (click)="onSave(user)" *ngIf="editRow === user._id">Save</button>
                <button (click)="onCancel()" *ngIf="editRow === user._id">Cancel</button>
                <button (click)="onDelete(user)" class="danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && users && !users.length" class="muted">No users found.</div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: none;
      width: calc(100% - 32px);
      margin: 16px auto;
      border-radius: var(--radius-md);
      padding: var(--space-8);
      box-shadow: var(--shadow-md);
      background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
      border: 1px solid var(--border-200);
      backdrop-filter: blur(14px);
    }

    h2 {
      margin: 0 0 var(--space-6);
      font-size: clamp(1.4rem, 1.4vw + 1.05rem, 2rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .muted { color: var(--text-600); }
    .error { color: var(--danger-500); margin-bottom: var(--space-4); }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px;
      background: rgba(0,0,0,0.12);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.10);
      text-align: left;
      font-size: 1rem;
      vertical-align: middle;
      color: var(--text-900);
    }

    .status-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.18);
      box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
    }
    .status-dot.online { background: var(--success-600); }
    .status-dot.offline { background: var(--danger-500); }

    .cell { display: grid; gap: 4px; }
    .sub { font-size: 0.85rem; color: var(--text-600); }

    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .small { font-size: 0.9rem; color: var(--text-700); }

    th {
      background: rgba(255,255,255,0.06);
      color: var(--text-700);
      font-weight: 800;
    }

    input, select {
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.18);
      color: var(--text-900);
    }

    .actions-col { width: 240px; }
    .actions {
      white-space: nowrap;
    }

    button {
      min-height: 40px;
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.10);
      color: var(--text-900);
      cursor: pointer;
      font-weight: 800;
      margin-right: 8px;
      margin-bottom: 6px;
    }

    button.danger {
      border-color: rgba(255, 69, 58, 0.35);
      background: rgba(255, 69, 58, 0.12);
      color: rgba(255, 255, 255, 0.92);
    }

    @media (max-width: 720px) {
      .admin-container {
        margin: 16px;
        padding: var(--space-6);
      }

      /* Turn rows into stacked cards */
      table, thead, tbody, th, td, tr { display: block; }
      thead { display: none; }

      tr {
        border-bottom: 1px solid rgba(255,255,255,0.12);
        padding: 10px 0;
      }

      td {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 10px;
        border-bottom: none;
        padding: 10px 14px;
      }

      td::before {
        content: attr(data-label);
        color: var(--text-600);
        font-weight: 800;
      }

      .actions {
        white-space: normal;
      }

      .actions button {
        width: 100%;
        margin-right: 0;
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
    try { this.cdr.detectChanges(); } catch {}
  }

  ngOnInit() { this.fetchUsers(); }

  fetchUsers() {
    this.loading = true;
    this.error = '';
    this.refreshUi();

    const watchdog = window.setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Still waiting for /api/users. Open DevTools → Network and check if the request is pending/blocked.';
        this.refreshUi();
      }
    }, 9000);

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
          if (res && Array.isArray(res.users)) this.users = res.users;
          else { this.users = []; this.error = 'API did not return users array.'; }
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

  onEdit(user: any) { this.editRow = user._id; this.editUser = { ...user }; }
  onCancel() { this.editRow = null; this.editUser = {}; }

  onSave(user: any) {
    this.adminService.updateUser(user._id, this.editUser).subscribe({
      next: () => { this.editRow = null; this.editUser = {}; this.fetchUsers(); },
      error: (err: any) => { this.error = err.error?.message || 'Failed to update user'; }
    });
  }

  onDelete(user: any) {
    if (confirm(`Delete user ${user.email}?`)) {
      this.adminService.deleteUser(user._id).subscribe({
        next: () => this.fetchUsers(),
        error: (err: any) => { this.error = err.error?.message || 'Failed to delete user'; }
      });
    }
  }

  trackByUserId(index: number, user: any) { return user._id; }
}
