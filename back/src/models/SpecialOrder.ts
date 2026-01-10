import { Schema, model, type Document, type Types } from 'mongoose';

export type SpecialOrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface ISpecialOrder extends Document {
  code?: string | null;
  userId?: Types.ObjectId | null;

  name: string;
  email: string;
  phone?: string | null;

  productType: string; // e.g. tubular heating element
  quantity?: number | null;

  // Common tubular heater specs
  voltage?: string | null;
  wattage?: string | null;
  lengthMm?: number | null;
  diameterMm?: number | null;
  sheathMaterial?: string | null;
  termination?: string | null;
  leadLengthMm?: number | null;
  mounting?: string | null;

  notes?: string | null;

  status: SpecialOrderStatus;
}

const SpecialOrderSchema = new Schema<ISpecialOrder>(
  {
    code: { type: String, default: null, unique: true, sparse: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, default: null },

    productType: { type: String, required: true, default: 'tubular_heating_element' },
    quantity: { type: Number, default: null, min: 1 },

    voltage: { type: String, default: null },
    wattage: { type: String, default: null },
    lengthMm: { type: Number, default: null, min: 1 },
    diameterMm: { type: Number, default: null, min: 1 },
    sheathMaterial: { type: String, default: null },
    termination: { type: String, default: null },
    leadLengthMm: { type: Number, default: null, min: 1 },
    mounting: { type: String, default: null },

    notes: { type: String, default: null },

    status: {
      type: String,
      enum: ['new', 'in_progress', 'completed', 'cancelled'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

export default model<ISpecialOrder>('SpecialOrder', SpecialOrderSchema);
