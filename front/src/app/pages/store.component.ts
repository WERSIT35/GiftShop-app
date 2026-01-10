import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SpecialOrderService } from '../services/special-order.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <nav class="nav">
        <div class="brand">
          <h1 class="logo">Tubular Heating Elements</h1>
          <span class="pill">Many options • Custom builds</span>
        </div>

        <div class="actions">
          <a class="btn" routerLink="/checkout">Checkout</a>
          <a class="btn" routerLink="/login">Login</a>
        </div>
      </nav>

      <main class="main">
        <section class="hero card">
          <h2>Industrial tubular heaters — made to spec</h2>
          <p class="muted">
            Choose straight, U-shape, M-shape, or custom geometry. We support multiple sheath materials,
            terminations, and mounting styles.
          </p>
          <div class="chips">
            <span class="chip">Stainless steel</span>
            <span class="chip">Incoloy</span>
            <span class="chip">Copper</span>
            <span class="chip">Finned options</span>
            <span class="chip">High-temp lead wires</span>
          </div>
        </section>

        <section class="grid">
          <section class="card">
            <h3>Options we offer</h3>
            <ul class="list">
              <li><b>Shapes:</b> Straight, U, W/M, hairpin, custom bends</li>
              <li><b>Diameters:</b> common sizes like 6.5mm / 8mm / 10mm / 12mm (custom too)</li>
              <li><b>Lengths:</b> custom length in mm</li>
              <li><b>Power:</b> choose voltage + wattage to match your application</li>
              <li><b>Terminations:</b> studs, leads, ceramic terminals, custom</li>
              <li><b>Mounting:</b> brackets, flanges, compression fittings</li>
            </ul>
          </section>

          <section class="card">
            <h3>Special orders</h3>
            <p class="muted">Tell us what you need and we’ll confirm price and lead time.</p>

            <form [formGroup]="form" (ngSubmit)="submit()" class="form">
              <div class="two">
                <label class="field">
                  <span>Name</span>
                  <input formControlName="name" type="text" autocomplete="name" />
                </label>

                <label class="field">
                  <span>Email</span>
                  <input formControlName="email" type="email" autocomplete="email" />
                </label>

                <label class="field">
                  <span>Phone (optional)</span>
                  <input formControlName="phone" type="tel" autocomplete="tel" />
                </label>

                <label class="field">
                  <span>Quantity</span>
                  <input formControlName="quantity" type="number" min="1" />
                </label>

                <label class="field">
                  <span>Voltage</span>
                  <input formControlName="voltage" type="text" placeholder="e.g. 220V" />
                </label>

                <label class="field">
                  <span>Wattage</span>
                  <input formControlName="wattage" type="text" placeholder="e.g. 2000W" />
                </label>

                <label class="field">
                  <span>Length (mm)</span>
                  <input formControlName="lengthMm" type="number" min="1" />
                </label>

                <label class="field">
                  <span>Diameter (mm)</span>
                  <input formControlName="diameterMm" type="number" min="1" />
                </label>

                <label class="field">
                  <span>Sheath material</span>
                  <select formControlName="sheathMaterial">
                    <option value="">Select</option>
                    <option value="stainless_steel">Stainless steel</option>
                    <option value="incoloy">Incoloy</option>
                    <option value="copper">Copper</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label class="field">
                  <span>Termination</span>
                  <select formControlName="termination">
                    <option value="">Select</option>
                    <option value="leads">Leads</option>
                    <option value="studs">Studs</option>
                    <option value="ceramic">Ceramic terminal</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label class="field">
                  <span>Mounting</span>
                  <input formControlName="mounting" type="text" placeholder="bracket / flange / fitting" />
                </label>

                <label class="field">
                  <span>Lead length (mm)</span>
                  <input formControlName="leadLengthMm" type="number" min="1" />
                </label>
              </div>

              <label class="field">
                <span>Notes (shape, bending, application, environment, etc.)</span>
                <textarea formControlName="notes" rows="5"></textarea>
              </label>

              <button class="btn primary" type="submit" [disabled]="loading || form.invalid">
                {{ loading ? 'Sending…' : 'Send request' }}
              </button>

              <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
              <p class="ok" *ngIf="successMessage">{{ successMessage }}</p>
            </form>
          </section>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      .page { min-height: 100vh; background: var(--bg-gradient); }
      .nav {
        position: sticky; top: 0; z-index: 10;
        display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
        padding: var(--space-5) var(--space-8);
        background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
        border-bottom: 1px solid rgba(255,255,255,0.10);
        backdrop-filter: blur(14px);
      }
      .brand { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
      .logo { margin: 0; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; }
      .pill {
        display: inline-flex; align-items: center;
        padding: 8px 12px; border-radius: 999px;
        border: 1px solid var(--border-200);
        background: rgba(0,0,0,0.18);
        color: var(--text-700);
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
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .btn.primary { background: rgba(0, 122, 255, 0.22); border-color: rgba(0, 122, 255, 0.35); }

      .main { max-width: 1100px; margin: 0 auto; padding: var(--space-8); }
      .card {
        border-radius: var(--radius-md);
        padding: var(--space-8);
        box-shadow: var(--shadow-lg);
        background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
        border: 1px solid var(--border-200);
        backdrop-filter: blur(14px);
      }
      .hero { margin-bottom: var(--space-8); }
      h2 { margin: 0 0 var(--space-4); font-size: 2.1rem; letter-spacing: -0.02em; }
      h3 { margin: 0 0 var(--space-4); font-size: 1.25rem; }
      .muted { color: var(--text-600); margin: 0; }

      .chips { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }
      .chip {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--border-200);
        background: rgba(255,255,255,0.06);
        color: var(--text-800);
        font-weight: 700;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: var(--space-6);
        align-items: start;
      }

      .list { margin: 0; padding-left: 18px; color: var(--text-700); }
      .list li { margin: 10px 0; }

      .form { display: grid; gap: var(--space-5); }
      .two {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-4);
      }
      .field { display: grid; gap: 8px; }
      .field span { color: var(--text-700); font-weight: 700; }
      input, select, textarea {
        min-height: 44px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border-200);
        background: rgba(255,255,255,0.08);
        color: var(--text-900);
        outline: none;
        resize: vertical;
      }
      textarea { min-height: auto; }

      .error { color: rgba(255, 69, 58, 0.95); font-weight: 800; margin: 0; }
      .ok { color: rgba(52, 199, 89, 0.95); font-weight: 800; margin: 0; }

      @media (max-width: 920px) {
        .grid { grid-template-columns: 1fr; }
        .two { grid-template-columns: 1fr; }
        .nav { padding: var(--space-4); flex-direction: column; align-items: stretch; }
        .actions { width: 100%; }
      }
    `,
  ],
})
export class StoreComponent {
  private fb = inject(FormBuilder);
  private api = inject(SpecialOrderService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],

    quantity: [1, [Validators.min(1)]],
    voltage: [''],
    wattage: [''],
    lengthMm: [null as number | null],
    diameterMm: [null as number | null],
    sheathMaterial: [''],
    termination: [''],
    mounting: [''],
    leadLengthMm: [null as number | null],

    notes: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const v = this.form.value;
    this.api
      .submit({
        name: v.name!,
        email: v.email!,
        phone: v.phone || null,
        productType: 'tubular_heating_element',
        quantity: v.quantity != null ? Number(v.quantity) : null,
        voltage: v.voltage || null,
        wattage: v.wattage || null,
        lengthMm: v.lengthMm != null ? Number(v.lengthMm) : null,
        diameterMm: v.diameterMm != null ? Number(v.diameterMm) : null,
        sheathMaterial: v.sheathMaterial || null,
        termination: v.termination || null,
        mounting: v.mounting || null,
        leadLengthMm: v.leadLengthMm != null ? Number(v.leadLengthMm) : null,
        notes: v.notes || null,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.status !== 'success') {
            this.errorMessage = res.message || 'Failed to send request';
            return;
          }
          const ref = res.order?.code || null;
          this.successMessage = ref
            ? `Request sent. Reference: ${ref}`
            : 'Request sent. We will contact you soon.';
          this.form.reset({
            name: '',
            email: '',
            phone: '',
            quantity: 1,
            voltage: '',
            wattage: '',
            lengthMm: null,
            diameterMm: null,
            sheathMaterial: '',
            termination: '',
            mounting: '',
            leadLengthMm: null,
            notes: '',
          });
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Failed to send request';
        },
      });
  }
}
