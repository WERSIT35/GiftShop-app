import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { CheckoutService, type PaymentProvider } from '../services/checkout.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <nav class="nav">
        <div class="brand">
          <h1 class="logo">Gift Shop</h1>
          <span class="pill">Guest checkout</span>
        </div>
        <div class="actions">
          <button class="btn" (click)="goLogin()">Login</button>
        </div>
      </nav>

      <main class="main">
        <section class="card">
          <h2>Checkout</h2>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
            <div class="grid">
              <label class="field">
                <span>Email</span>
                <input formControlName="guestEmail" type="email" autocomplete="email" />
              </label>

              <label class="field">
                <span>Name (optional)</span>
                <input formControlName="guestName" type="text" autocomplete="name" />
              </label>

              <label class="field">
                <span>Currency</span>
                <input formControlName="currency" type="text" placeholder="USD" />
              </label>

              <label class="field">
                <span>Payment method</span>
                <select formControlName="provider">
                  <option value="stripe">Apple Pay / Cards (Stripe)</option>
                  <option value="tbc">TBC Pay</option>
                  <option value="bog">BOG Pay</option>
                </select>
              </label>
            </div>

            <h3>Shipping</h3>
            <div class="grid">
              <label class="field span-2">
                <span>Address line 1</span>
                <input formControlName="line1" type="text" autocomplete="address-line1" />
              </label>
              <label class="field span-2">
                <span>Address line 2 (optional)</span>
                <input formControlName="line2" type="text" autocomplete="address-line2" />
              </label>
              <label class="field">
                <span>City</span>
                <input formControlName="city" type="text" autocomplete="address-level2" />
              </label>
              <label class="field">
                <span>Region (optional)</span>
                <input formControlName="region" type="text" autocomplete="address-level1" />
              </label>
              <label class="field">
                <span>Postal code (optional)</span>
                <input formControlName="postalCode" type="text" autocomplete="postal-code" />
              </label>
              <label class="field">
                <span>Country</span>
                <input formControlName="country" type="text" autocomplete="country-name" />
              </label>
            </div>

            <h3>Items</h3>
            <div formArrayName="items" class="items">
              <div class="item" *ngFor="let g of items.controls; let i = index" [formGroupName]="i">
                <label class="field">
                  <span>Name</span>
                  <input formControlName="name" type="text" />
                </label>
                <label class="field">
                  <span>Qty</span>
                  <input formControlName="quantity" type="number" min="1" />
                </label>
                <label class="field">
                  <span>Unit price</span>
                  <input formControlName="unitPrice" type="number" min="0" step="0.01" />
                </label>
                <button class="btn danger" type="button" (click)="removeItem(i)">Remove</button>
              </div>
            </div>

            <div class="row">
              <button class="btn" type="button" (click)="addItem()">Add item</button>
              <button class="btn primary" type="submit" [disabled]="loading || form.invalid">Continue to pay</button>
            </div>

            <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
            <p class="muted" *ngIf="infoMessage">{{ infoMessage }}</p>
          </form>

          <div class="pay" *ngIf="showStripePay">
            <h3>Pay</h3>
            <div #paymentRequestButton></div>
            <p class="muted" *ngIf="stripeNotAvailable">
              Apple Pay is not available on this device/browser.
            </p>
          </div>
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
      .main { max-width: 980px; margin: 0 auto; padding: var(--space-8); }
      .card {
        border-radius: var(--radius-md);
        padding: var(--space-8);
        box-shadow: var(--shadow-lg);
        background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
        border: 1px solid var(--border-200);
        backdrop-filter: blur(14px);
      }
      h2 { margin: 0 0 var(--space-6); font-size: 2rem; letter-spacing: -0.02em; }
      h3 { margin: var(--space-7) 0 var(--space-4); font-size: 1.2rem; }

      .form { display: grid; gap: var(--space-6); }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-4);
      }
      .span-2 { grid-column: 1 / -1; }

      .field { display: grid; gap: 8px; }
      .field span { color: var(--text-700); font-weight: 700; }
      input, select {
        min-height: 44px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border-200);
        background: rgba(255,255,255,0.08);
        color: var(--text-900);
        outline: none;
      }

      .items { display: grid; gap: var(--space-4); }
      .item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr auto;
        gap: var(--space-4);
        align-items: end;
        padding: var(--space-4);
        border: 1px solid var(--border-200);
        border-radius: var(--radius-md);
        background: rgba(255,255,255,0.06);
      }

      .row { display: flex; gap: var(--space-3); flex-wrap: wrap; }

      .btn {
        min-height: 44px;
        padding: 10px 14px;
        border-radius: 12px;
        border: 1px solid var(--border-200);
        background: rgba(255,255,255,0.10);
        color: var(--text-900);
        font-weight: 800;
        cursor: pointer;
      }
      .btn.primary { background: rgba(0, 122, 255, 0.22); border-color: rgba(0, 122, 255, 0.35); }
      .btn.danger { border-color: rgba(255, 69, 58, 0.35); background: rgba(255, 69, 58, 0.12); }
      .btn[disabled] { opacity: 0.6; cursor: not-allowed; }

      .error { color: rgba(255, 69, 58, 0.95); font-weight: 800; }
      .muted { color: var(--text-600); margin: 0; }

      .pay { margin-top: var(--space-8); }

      @media (max-width: 800px) {
        .grid { grid-template-columns: 1fr; }
        .item { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class CheckoutComponent {
  @ViewChild('paymentRequestButton', { static: false }) paymentRequestButton!: ElementRef<HTMLDivElement>;

  loading = false;
  errorMessage = '';
  infoMessage = '';

  showStripePay = false;
  stripeNotAvailable = false;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  private fb = inject(FormBuilder);

  form = this.fb.group({
    guestEmail: ['', [Validators.required, Validators.email]],
    guestName: [''],
    currency: ['USD', [Validators.required]],
    provider: ['stripe' as PaymentProvider, [Validators.required]],

    line1: ['', [Validators.required]],
    line2: [''],
    city: ['', [Validators.required]],
    region: [''],
    postalCode: [''],
    country: ['GE', [Validators.required]],

    items: this.fb.array([
      this.fb.group({
        name: ['Gift item', [Validators.required]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [10, [Validators.required, Validators.min(0)]],
      }),
    ]),
  });

  constructor(
    private checkout: CheckoutService,
    private router: Router
  ) {}

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        name: ['', [Validators.required]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeItem(index: number): void {
    if (this.items.length <= 1) return;
    this.items.removeAt(index);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';
    this.showStripePay = false;
    this.stripeNotAvailable = false;

    const provider = this.form.value.provider as PaymentProvider;

    const checkoutPayload = {
      guestEmail: this.form.value.guestEmail!,
      guestName: this.form.value.guestName || null,
      currency: this.form.value.currency!,
      shippingAddress: {
        line1: this.form.value.line1!,
        line2: this.form.value.line2 || null,
        city: this.form.value.city!,
        region: this.form.value.region || null,
        postalCode: this.form.value.postalCode || null,
        country: this.form.value.country!,
      },
      items: (this.form.value.items as any[]).map((i) => ({
        name: i.name,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };

    this.checkout.createCheckout(checkoutPayload).subscribe({
      next: (orderRes) => {
        if (orderRes.status !== 'success' || !orderRes.order?.id) {
          this.loading = false;
          this.errorMessage = orderRes.message || 'Failed to create order';
          return;
        }

        this.checkout.createPayment(provider, orderRes.order.id).subscribe({
          next: async (payRes) => {
            this.loading = false;

            if (payRes.status !== 'success') {
              this.errorMessage = payRes.message || 'Failed to start payment';
              return;
            }

            if (payRes.kind === 'redirectUrl' && payRes.redirectUrl) {
              window.location.assign(payRes.redirectUrl);
              return;
            }

            if (provider === 'stripe' && payRes.kind === 'clientSecret' && payRes.clientSecret && payRes.publishableKey) {
              await this.initStripePaymentRequest(payRes.publishableKey, payRes.clientSecret, payRes.order?.amountMinor || orderRes.order!.amountMinor, (payRes.order?.currency || orderRes.order!.currency));
              return;
            }

            this.infoMessage = 'Payment started.';
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err?.error?.message || 'Failed to start payment';
          },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Checkout failed';
      },
    });
  }

  private async initStripePaymentRequest(
    publishableKey: string,
    clientSecret: string,
    amountMinor: number,
    currency: string
  ): Promise<void> {
    this.infoMessage = 'Preparing Apple Pay…';

    this.stripe = await loadStripe(publishableKey);
    if (!this.stripe) {
      this.errorMessage = 'Stripe failed to initialize';
      return;
    }

    this.elements = this.stripe.elements();

    const paymentRequest = this.stripe.paymentRequest({
      country: 'US',
      currency: currency.toLowerCase(),
      total: {
        label: 'GiftShop',
        amount: amountMinor,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const canMakePayment = await paymentRequest.canMakePayment();
    this.showStripePay = true;

    if (!canMakePayment) {
      this.stripeNotAvailable = true;
      this.infoMessage = '';
      return;
    }

    paymentRequest.on('paymentmethod', async (ev) => {
      try {
        const { error, paymentIntent } = await this.stripe!.confirmCardPayment(
          clientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          {
            handleActions: false,
          }
        );

        if (error) {
          ev.complete('fail');
          this.errorMessage = error.message || 'Payment failed';
          return;
        }

        ev.complete('success');

        if (paymentIntent && paymentIntent.status === 'requires_action') {
          const { error: actionError } = await this.stripe!.confirmCardPayment(clientSecret);
          if (actionError) {
            this.errorMessage = actionError.message || 'Payment requires action';
            return;
          }
        }

        this.infoMessage = 'Payment succeeded. Thank you!';
      } catch (e: any) {
        this.errorMessage = e?.message || 'Payment failed';
        try { ev.complete('fail'); } catch {}
      }
    });

    // Mount the Payment Request Button
    const prButton = this.elements.create('paymentRequestButton', { paymentRequest });

    // Clear any previous mounts
    if (this.paymentRequestButton?.nativeElement) {
      this.paymentRequestButton.nativeElement.innerHTML = '';
      prButton.mount(this.paymentRequestButton.nativeElement);
    }

    this.infoMessage = '';
  }
}
