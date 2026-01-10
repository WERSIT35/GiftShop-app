import { Schema, model, type Document, type Types } from 'mongoose';

export type OrderStatus = 'pending_payment' | 'paid' | 'cancelled';
export type PaymentProvider = 'stripe' | 'tbc' | 'bog';
export type PaymentStatus = 'requires_payment' | 'processing' | 'paid' | 'failed' | 'cancelled';

export interface IOrderItem {
  name: string;
  quantity: number;
  unitPriceMinor: number; // integer (e.g. cents)
}

export interface IShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface IOrder extends Document {
  code?: string | null;
  userId?: Types.ObjectId | null;

  guestEmail: string;
  guestName?: string | null;

  shippingAddress: IShippingAddress;

  currency: string;
  amountMinor: number;

  items: IOrderItem[];

  status: OrderStatus;

  paymentProvider?: PaymentProvider | null;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string | null; // Stripe
  providerReference?: string | null; // TBC/BOG reference

  paidAt?: Date | null;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceMinor: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    line1: { type: String, required: true },
    line2: { type: String, default: null },
    city: { type: String, required: true },
    region: { type: String, default: null },
    postalCode: { type: String, default: null },
    country: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    code: { type: String, default: null, unique: true, sparse: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    guestEmail: { type: String, required: true, lowercase: true, index: true },
    guestName: { type: String, default: null },

    shippingAddress: { type: ShippingAddressSchema, required: true },

    currency: { type: String, required: true, uppercase: true, default: 'USD' },
    amountMinor: { type: Number, required: true, min: 0 },

    items: { type: [OrderItemSchema], required: true },

    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'cancelled'],
      default: 'pending_payment',
    },

    paymentProvider: { type: String, enum: ['stripe', 'tbc', 'bog'], default: null },
    paymentStatus: {
      type: String,
      enum: ['requires_payment', 'processing', 'paid', 'failed', 'cancelled'],
      default: 'requires_payment',
    },

    paymentIntentId: { type: String, default: null },
    providerReference: { type: String, default: null },

    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model<IOrder>('Order', OrderSchema);
