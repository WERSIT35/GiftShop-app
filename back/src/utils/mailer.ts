// src/utils/mailer.ts
import nodemailer from "nodemailer";

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

let transporter: nodemailer.Transporter | null = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text, replyTo }: SendEmailArgs) => {
  if (!to) {
    throw new Error("No recipient email provided");
  }

  const transport = await createTransporter();

  return transport.sendMail({
    from: process.env.EMAIL_FROM || `"GiftShop" <noreply@giftshop.com>`,
    to,
    subject,
    html,
    text,
    replyTo,
  });
};

export default sendEmail;
