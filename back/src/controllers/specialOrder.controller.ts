import type { Request, Response } from 'express';
import SpecialOrder from '../models/SpecialOrder';
import sendEmail from '../utils/mailer';
import { generateUniqueCode } from '../utils/publicCode';

function pickRecipient(): string {
  return (
    process.env.SPECIAL_ORDERS_EMAIL_TO ||
    process.env.SUPERUSER_EMAIL ||
    process.env.SMTP_USER ||
    ''
  );
}

export const createSpecialOrder = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      productType,
      quantity,
      voltage,
      wattage,
      lengthMm,
      diameterMm,
      sheathMaterial,
      termination,
      leadLengthMm,
      mounting,
      notes,
    } = req.body || {};

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ status: 'error', message: 'name is required' });
    }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ status: 'error', message: 'email is required' });
    }

    const code = await generateUniqueCode(SpecialOrder, { length: 6, field: 'code' });

    const doc = await SpecialOrder.create({
      code,
      userId: null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: typeof phone === 'string' ? phone.trim() : null,

      productType: typeof productType === 'string' && productType.trim() ? productType.trim() : 'tubular_heating_element',
      quantity: quantity != null ? Number(quantity) : null,

      voltage: typeof voltage === 'string' ? voltage.trim() : null,
      wattage: typeof wattage === 'string' ? wattage.trim() : null,
      lengthMm: lengthMm != null && String(lengthMm).trim() ? Number(lengthMm) : null,
      diameterMm: diameterMm != null && String(diameterMm).trim() ? Number(diameterMm) : null,
      sheathMaterial: typeof sheathMaterial === 'string' ? sheathMaterial.trim() : null,
      termination: typeof termination === 'string' ? termination.trim() : null,
      leadLengthMm: leadLengthMm != null && String(leadLengthMm).trim() ? Number(leadLengthMm) : null,
      mounting: typeof mounting === 'string' ? mounting.trim() : null,

      notes: typeof notes === 'string' ? notes.trim() : null,

      status: 'new',
    });

    const to = pickRecipient();
    if (to) {
      const subject = `New Special Order ${doc.code || doc._id}`;
      const ref = escapeHtml(doc.code || String(doc._id));
      const html = buildSpecialOrderEmailHtml({
        reference: ref,
        name: escapeHtml(doc.name),
        email: escapeHtml(doc.email),
        phone: escapeHtml(doc.phone || '-'),
        product: escapeHtml(doc.productType),
        quantity: String(doc.quantity ?? '-'),
        voltage: escapeHtml(doc.voltage || '-'),
        wattage: escapeHtml(doc.wattage || '-'),
        lengthMm: String(doc.lengthMm ?? '-'),
        diameterMm: String(doc.diameterMm ?? '-'),
        sheathMaterial: escapeHtml(doc.sheathMaterial || '-'),
        termination: escapeHtml(doc.termination || '-'),
        leadLengthMm: String(doc.leadLengthMm ?? '-'),
        mounting: escapeHtml(doc.mounting || '-'),
        notes: escapeHtml(doc.notes || ''),
      });

      const text = buildSpecialOrderEmailText({
        reference: doc.code || String(doc._id),
        name: doc.name,
        email: doc.email,
        phone: doc.phone || '-',
        product: doc.productType,
        quantity: doc.quantity ?? '-',
        voltage: doc.voltage || '-',
        wattage: doc.wattage || '-',
        lengthMm: doc.lengthMm ?? '-',
        diameterMm: doc.diameterMm ?? '-',
        sheathMaterial: doc.sheathMaterial || '-',
        termination: doc.termination || '-',
        leadLengthMm: doc.leadLengthMm ?? '-',
        mounting: doc.mounting || '-',
        notes: doc.notes || '',
      });

      // Fire-and-forget; don't block the API response on email delivery.
      sendEmail({ to, subject, html, text, replyTo: doc.email }).catch((e) =>
        console.error('[specialOrder] email failed:', e)
      );
    }

    return res.status(201).json({
      status: 'success',
      message: 'Special order request submitted',
      order: { id: doc._id, code: doc.code },
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err?.message || 'Failed to submit special order' });
  }
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildSpecialOrderEmailHtml(data: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  voltage: string;
  wattage: string;
  lengthMm: string;
  diameterMm: string;
  sheathMaterial: string;
  termination: string;
  leadLengthMm: string;
  mounting: string;
  notes: string;
}): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:700;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;vertical-align:top;">${value}</td>
    </tr>
  `;

  return `
  <div style="background:#f6f7fb;padding:24px 0;">
    <div style="max-width:720px;margin:0 auto;padding:0 16px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="padding:18px 20px;background:#111827;color:#ffffff;">
          <div style="font-size:14px;opacity:0.9;letter-spacing:0.04em;text-transform:uppercase;">GiftShop</div>
          <div style="font-size:20px;font-weight:800;margin-top:6px;">New Special Order</div>
          <div style="margin-top:6px;font-size:14px;opacity:0.95;">Reference: <span style="font-weight:800;">${data.reference}</span></div>
        </div>

        <div style="padding:18px 20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              ${row('Name', data.name)}
              ${row('Email', data.email)}
              ${row('Phone', data.phone)}
              ${row('Product', data.product)}
              ${row('Quantity', data.quantity)}
              ${row('Voltage', data.voltage)}
              ${row('Wattage', data.wattage)}
              ${row('Length (mm)', data.lengthMm)}
              ${row('Diameter (mm)', data.diameterMm)}
              ${row('Sheath material', data.sheathMaterial)}
              ${row('Termination', data.termination)}
              ${row('Lead length (mm)', data.leadLengthMm)}
              ${row('Mounting', data.mounting)}
            </tbody>
          </table>

          <div style="margin-top:16px;">
            <div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:8px;">Notes</div>
            <div style="white-space:pre-wrap;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px;color:#111827;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">${data.notes || '-'}</div>
          </div>
        </div>

        <div style="padding:14px 20px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;">
          Reply to this email to contact the customer.
        </div>
      </div>
    </div>
  </div>
  `;
}

function buildSpecialOrderEmailText(data: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: any;
  voltage: any;
  wattage: any;
  lengthMm: any;
  diameterMm: any;
  sheathMaterial: any;
  termination: any;
  leadLengthMm: any;
  mounting: any;
  notes: string;
}): string {
  return [
    'New Special Order',
    `Reference: ${data.reference}`,
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    '',
    `Product: ${data.product}`,
    `Quantity: ${data.quantity}`,
    `Voltage: ${data.voltage}`,
    `Wattage: ${data.wattage}`,
    `Length (mm): ${data.lengthMm}`,
    `Diameter (mm): ${data.diameterMm}`,
    `Sheath material: ${data.sheathMaterial}`,
    `Termination: ${data.termination}`,
    `Lead length (mm): ${data.leadLengthMm}`,
    `Mounting: ${data.mounting}`,
    '',
    'Notes:',
    data.notes || '-',
  ].join('\n');
}
