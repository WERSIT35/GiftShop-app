import type { Request, Response } from 'express';
import Order from '../models/Order';
import { generateUniqueCode } from '../utils/publicCode';

function normalizeCurrency(currency: unknown): string {
  const c = typeof currency === 'string' ? currency.trim().toUpperCase() : 'USD';
  return c || 'USD';
}

function minorUnitFactor(currency: string): number {
  // Most currencies use 2 decimals. Extend if you need JPY(0), etc.
  // GEL uses 2 decimals.
  const zeroDecimal = new Set(['JPY', 'KRW']);
  return zeroDecimal.has(currency) ? 1 : 100;
}

function toMinor(amountMajor: number, currency: string): number {
  const factor = minorUnitFactor(currency);
  return Math.round(amountMajor * factor);
}

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const {
      guestEmail,
      guestName,
      currency,
      shippingAddress,
      items,
    } = req.body || {};

    if (!guestEmail || typeof guestEmail !== 'string') {
      return res.status(400).json({ status: 'error', message: 'guestEmail is required' });
    }

    const normalizedCurrency = normalizeCurrency(currency);

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({ status: 'error', message: 'shippingAddress is required' });
    }

    const { line1, line2, city, region, postalCode, country } = shippingAddress as any;

    if (!line1 || !city || !country) {
      return res.status(400).json({ status: 'error', message: 'shippingAddress.line1, city, country are required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'items[] is required' });
    }

    const normalizedItems = items.map((item: any) => {
      const name = typeof item?.name === 'string' ? item.name.trim() : '';
      const quantity = Number(item?.quantity);
      const unitPrice = Number(item?.unitPrice);

      if (!name) throw new Error('Each item.name is required');
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Each item.quantity must be > 0');
      if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Each item.unitPrice must be >= 0');

      return {
        name,
        quantity,
        unitPriceMinor: toMinor(unitPrice, normalizedCurrency),
      };
    });

    const amountMinor = normalizedItems.reduce(
      (sum: number, item: any) => sum + item.unitPriceMinor * item.quantity,
      0
    );

    const code = await generateUniqueCode(Order, { length: 6, field: 'code' });

    const order = await Order.create({
      code,
      userId: null,
      guestEmail: guestEmail.toLowerCase(),
      guestName: typeof guestName === 'string' ? guestName : null,
      currency: normalizedCurrency,
      amountMinor,
      items: normalizedItems,
      shippingAddress: {
        line1,
        line2: line2 ?? null,
        city,
        region: region ?? null,
        postalCode: postalCode ?? null,
        country,
      },
      status: 'pending_payment',
      paymentStatus: 'requires_payment',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Order created',
      order: {
        id: order._id,
        code: order.code,
        currency: order.currency,
        amountMinor: order.amountMinor,
        status: order.status,
      },
    });
  } catch (err: any) {
    return res.status(400).json({ status: 'error', message: err?.message || 'Checkout failed' });
  }
};
