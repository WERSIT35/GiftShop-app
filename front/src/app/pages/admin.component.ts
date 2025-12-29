import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
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
            <ng-container *ngFor="let user of users; trackBy: trackByUserId">
            <tr>
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
                <button
                  class="icon"
                  (click)="onEdit(user)"
                  *ngIf="!editRow || editRow !== user._id"
                  aria-label="Edit user"
                  title="Edit"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-1.34-1.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75L21 5.75Z"/>
                  </svg>
                </button>

                <button
                  class="icon"
                  (click)="onSave(user)"
                  *ngIf="editRow === user._id"
                  aria-label="Save changes"
                  title="Save"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </button>

                <button
                  class="icon"
                  (click)="onCancel()"
                  *ngIf="editRow === user._id"
                  aria-label="Cancel editing"
                  title="Cancel"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.6l6.3-6.3z"/>
                  </svg>
                </button>

                <button
                  class="icon danger"
                  (click)="onDelete(user)"
                  aria-label="Delete user"
                  title="Delete"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M6 7h12l-1 14H7L6 7Zm3-3h6l1 2H8l1-2ZM4 6h16v2H4V6Z"/>
                  </svg>
                </button>

                <button
                  class="icon view"
                  (click)="toggleDetails(user)"
                  [attr.aria-label]="expandedUserId === user._id ? 'Hide details' : 'View details'"
                  [attr.title]="expandedUserId === user._id ? 'Hide details' : 'View details'"
                  type="button"
                >
                  <svg *ngIf="expandedUserId !== user._id" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
                  </svg>
                  <svg *ngIf="expandedUserId === user._id" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M3.27 2 2 3.27l3.06 3.06C3.07 8.1 2 10 2 10s3 7 10 7c2.06 0 3.83-.6 5.3-1.45l3.43 3.43L22 17.73 3.27 2ZM12 15c-2.76 0-5-2.24-5-5 0-.85.22-1.65.6-2.35l1.62 1.62A3 3 0 0 0 12 13c.63 0 1.22-.2 1.7-.54l1.62 1.62c-.7.38-1.5.6-2.32.6Zm9.73-5s-1.1 2.56-3.63 4.51l-1.44-1.44A8.82 8.82 0 0 0 19.7 10c-1.05-1.63-3.4-4-7.7-4-.9 0-1.73.11-2.5.3L7.94 4.74C9.16 4.27 10.5 4 12 4c7 0 10 6 10 6Z"/>
                  </svg>
                </button>
              </td>
            </tr>

            <tr *ngIf="expandedUserId === user._id || closingUserId === user._id" class="details-row">
              <td [attr.colspan]="9">
                <div class="details details-animate" [class.closing]="closingUserId === user._id && expandedUserId !== user._id">
                  <div class="details-inner">
                    <div class="details-head">
                      <img
                        *ngIf="user.avatarUrl"
                        class="avatar"
                        [src]="user.avatarUrl"
                        alt="User avatar"
                        referrerpolicy="no-referrer"
                      />
                      <div class="details-title">
                        <div class="primary">{{ user.name || 'Unnamed user' }}</div>
                        <div class="secondary">{{ user.email }}</div>
                      </div>
                    </div>

                    <div class="sections">
                      <section class="section">
                        <div class="section-title">Account</div>
                        <div class="kv-grid">
                          <div class="kv">
                            <div class="k">User ID</div>
                            <div class="v mono">{{ user._id }}</div>
                          </div>
                          <div class="kv">
                            <div class="k">Role</div>
                            <div class="v">{{ user.role || '-' }}</div>
                          </div>
                          <div class="kv">
                            <div class="k">Email Verified</div>
                            <div class="v">{{ user.isEmailVerified ? 'Yes' : 'No' }}</div>
                          </div>
                          <div class="kv">
                            <div class="k">Created</div>
                            <div class="v">{{ user.createdAt ? (user.createdAt | date:'short') : '-' }}</div>
                          </div>
                        </div>
                      </section>

                      <section class="section">
                        <div class="section-title">Security</div>
                        <div class="kv-grid">
                          <div class="kv">
                            <div class="k">PIN</div>
                            <div class="v mono">{{ user.pinCode || '-' }}</div>
                          </div>
                        </div>
                      </section>

                      <section class="section">
                        <div class="section-title">Activity</div>
                        <div class="kv-grid">
                          <div class="kv">
                            <div class="k">Status</div>
                            <div class="v">{{ user.online ? 'Online' : 'Offline' }}</div>
                          </div>
                          <div class="kv">
                            <div class="k">Last Seen</div>
                            <div class="v">{{ user.lastSeenAt ? (user.lastSeenAt | date:'short') : '-' }}</div>
                          </div>
                          <div class="kv">
                            <div class="k">Last IP</div>
                            <div class="v mono">{{ user.lastIp || '-' }}</div>
                          </div>
                          <div class="kv">
                            <div class="k">IP History</div>
                            <div class="v mono">{{ formatIpHistory(user.ipAddresses) }}</div>
                          </div>
                        </div>
                      </section>

                      <section class="section">
                        <div class="section-title">Integrations</div>
                        <div class="kv-grid">
                          <div class="kv">
                            <div class="k">Google ID</div>
                            <div class="v mono">{{ user.googleId || '-' }}</div>
                          </div>
                          <div class="kv">
                            <div class="k">Avatar URL</div>
                            <div class="v mono">{{ user.avatarUrl || '-' }}</div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            </ng-container>
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
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }

    .details-row td {
      padding: 0;
      border-bottom: 1px solid rgba(255,255,255,0.10);
    }

    .details {
      background: transparent;
    }

    .details-inner {
      padding: 14px;
      background: var(--surface-2);
      border: 1px solid var(--border-200);
      border-radius: 14px;
    }

    .sections {
      display: grid;
      gap: 14px;
    }

    .section {
      display: grid;
      gap: 10px;
    }

    .section-title {
      font-weight: 900;
      letter-spacing: 0.2px;
      color: var(--text-700);
      font-size: 0.78rem;
      text-transform: uppercase;
    }

    .details-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 0 12px;
      border-bottom: 1px solid rgba(255,255,255,0.10);
      margin-bottom: 12px;
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 999px;
      object-fit: cover;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.10);
    }

    .details-title { min-width: 0; }
    .primary { font-weight: 900; }
    .secondary {
      color: var(--text-600);
      font-size: 0.92rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    .kv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 10px 14px;
      align-items: start;
    }

    .kv {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .k {
      color: var(--text-600);
      font-size: 0.85rem;
      font-weight: 800;
    }

    .v {
      color: var(--text-900);
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
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
      margin-right: 0;
      margin-bottom: 6px;
    }

    button.icon {
      width: 40px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    button.view { order: 99; }

    button.danger {
      border-color: rgba(255, 69, 58, 0.35);
      background: rgba(255, 69, 58, 0.12);
      color: rgba(255, 255, 255, 0.92);
    }

    .details-animate {
      overflow: hidden;
      animation: detailsExpand 240ms ease-out;
    }

    .details-animate.closing {
      animation: detailsCollapse 220ms ease-in;
    }

    @keyframes detailsExpand {
      from { max-height: 0; opacity: 0; }
      to { max-height: 1200px; opacity: 1; }
    }

    @keyframes detailsCollapse {
      from { max-height: 1200px; opacity: 1; }
      to { max-height: 0; opacity: 0; }
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

      .details-row td {
        padding: 0;
      }

      .kv-grid {
        grid-template-columns: 1fr;
      }

      td::before {
        content: attr(data-label);
        color: var(--text-600);
        font-weight: 800;
      }

      .actions {
        white-space: normal;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 10px;
      }

      .actions button {
        width: 40px;
        margin-right: 0;
        margin-bottom: 0;
      }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  users: any[] = [];
  loading = false;
  error = '';
  editRow: string | null = null;
  editUser: any = {};
  expandedUserId: string | null = null;
  closingUserId: string | null = null;
  private closingTimerId: number | null = null;
  private refreshIntervalId: number | null = null;
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  private refreshUi(): void {
    try { this.cdr.detectChanges(); } catch {}
  }

  ngOnInit() {
    this.fetchUsers();

    // Keep online/offline status fresh
    this.refreshIntervalId = window.setInterval(() => {
      if (this.loading) return;
      if (this.editRow) return;
      this.fetchUsers();
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      window.clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }

    if (this.closingTimerId) {
      window.clearTimeout(this.closingTimerId);
      this.closingTimerId = null;
    }
  }

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

  toggleDetails(user: any) {
    const id = user?._id;
    if (!id) return;

    // Close currently open details
    if (this.expandedUserId === id) {
      this.startClosing(id);
      return;
    }

    // If some other row is open, close it first (animated)
    if (this.expandedUserId && this.expandedUserId !== id) {
      this.startClosing(this.expandedUserId);
    }

    // Open requested row
    this.expandedUserId = id;
    if (this.closingUserId === id) this.closingUserId = null;

    this.refreshUi();
  }

  private startClosing(id: string): void {
    this.expandedUserId = null;
    this.closingUserId = id;

    if (this.closingTimerId) {
      window.clearTimeout(this.closingTimerId);
      this.closingTimerId = null;
    }

    this.closingTimerId = window.setTimeout(() => {
      if (this.closingUserId === id) {
        this.closingUserId = null;
        this.refreshUi();
      }
      this.closingTimerId = null;
    }, 230);

    this.refreshUi();
  }

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

  formatIpHistory(ipAddresses: any): string {
    if (!Array.isArray(ipAddresses) || ipAddresses.length === 0) return '-';
    return ipAddresses.join(', ');
  }
}
