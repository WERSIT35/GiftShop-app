import type { Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';

type Provider = 'stripe' | 'tbc' | 'bog';

function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(secret, {
    apiVersion: '2025-01-27.acacia',
  } as any);
}

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { provider, orderId } = req.body || {};

    if (!provider || (provider !== 'stripe' && provider !== 'tbc' && provider !== 'bog')) {
      return res.status(400).json({ status: 'error', message: 'provider must be stripe|tbc|bog' });
    }

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ status: 'error', message: 'orderId is required' });
    }

    const order = await Order.findById(orderId).exec();
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    if (order.status === 'paid' || order.paymentStatus === 'paid') {
      return res.json({ status: 'success', message: 'Already paid' });
    }

    const providerTyped = provider as Provider;
    order.paymentProvider = providerTyped;

    if (providerTyped === 'stripe') {
      const stripe = getStripe();

      const intent = await stripe.paymentIntents.create({
        amount: order.amountMinor,
        currency: String(order.currency).toLowerCase(),
        receipt_email: order.guestEmail,
        metadata: {
          orderId: String(order._id),
        },
        automatic_payment_methods: { enabled: true },
      });

      order.paymentIntentId = intent.id;
      order.paymentStatus = 'processing';
      await order.save();

      const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        return res.status(500).json({ status: 'error', message: 'STRIPE_PUBLISHABLE_KEY is not set' });
      }

      return res.json({
        status: 'success',
        provider: 'stripe',
        kind: 'clientSecret',
        clientSecret: intent.client_secret,
        publishableKey,
        order: {
          id: order._id,
          code: order.code,
          amountMinor: order.amountMinor,
          currency: order.currency,
        },
      });
    }

    // TBC/BOG stubs: most banks provide hosted checkout + callback verification.
    // We leave the redirect URL configurable so you can wire real endpoints/credentials.
    if (providerTyped === 'tbc') {
      const base = process.env.TBC_PAY_REDIRECT_URL;
      if (!base) {
        return res.status(501).json({
          status: 'error',
          message: 'TBC Pay is not configured yet (set TBC_PAY_REDIRECT_URL and add real API integration).',
        });
      }

      const redirectUrl = `${base}?orderId=${encodeURIComponent(String(order._id))}`;
      order.providerReference = String(order._id);
      order.paymentStatus = 'processing';
      await order.save();

      return res.json({ status: 'success', provider: 'tbc', kind: 'redirectUrl', redirectUrl });
    }

    if (providerTyped === 'bog') {
      const base = process.env.BOG_PAY_REDIRECT_URL;
      if (!base) {
        return res.status(501).json({
          status: 'error',
          message: 'BOG Pay is not configured yet (set BOG_PAY_REDIRECT_URL and add real API integration).',
        });
      }

      const redirectUrl = `${base}?orderId=${encodeURIComponent(String(order._id))}`;
      order.providerReference = String(order._id);
      order.paymentStatus = 'processing';
      await order.save();

      return res.json({ status: 'success', provider: 'bog', kind: 'redirectUrl', redirectUrl });
    }

    return res.status(400).json({ status: 'error', message: 'Unsupported provider' });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err?.message || 'Failed to create payment' });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig || typeof sig !== 'string') {
      return res.status(400).send('Missing stripe-signature');
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).send('STRIPE_WEBHOOK_SECRET not configured');
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(req.body as any, sig, secret);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = (intent.metadata?.orderId || '') as string;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          $set: {
            status: 'paid',
            paymentStatus: 'paid',
            paymentIntentId: intent.id,
            paidAt: new Date(),
          },
        }).exec();
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = (intent.metadata?.orderId || '') as string;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          $set: {
            paymentStatus: 'failed',
            paymentIntentId: intent.id,
          },
        }).exec();
      }
    }

    return res.json({ received: true });
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err?.message || 'unknown'}`);
  }
};
