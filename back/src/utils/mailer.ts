// back/src/utils/mailer.ts - SECURE VERSION
import nodemailer from "nodemailer";

console.log("📧 EMAIL SYSTEM - Initializing...");

const GMAIL_USER = process.env.SMTP_USER;
const GMAIL_PASS = process.env.SMTP_PASS;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("❌ GMAIL CREDENTIALS NOT FOUND IN .env!");
  console.error("Add to .env: SMTP_USER, SMTP_PASS, EMAIL_FROM");
  console.error("Using Ethereal test account for development...");
}

let transporter: nodemailer.Transporter;

if (GMAIL_USER && GMAIL_PASS) {
  console.log(`✅ Gmail credentials loaded from .env`);
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    tls: { rejectUnauthorized: false }
  });

  transporter.verify()
    .then(() => console.log("✅ GMAIL SMTP CONNECTION VERIFIED!"))
    .catch(error => {
      console.error("❌ GMAIL CONNECTION FAILED:", error.message);
      if (error.code === "EAUTH") {
        console.error("💡 Check App Password: https://myaccount.google.com/apppasswords");
      }
      console.error("⚠️  Falling back to Ethereal test account...");
    });
} else {
  console.warn("⚠️  No Gmail credentials - using Ethereal test account");
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log(`\n📤 Sending email to: ${to}`);
    console.log(`📝 Subject: ${subject}`);
    
    // If no real transporter, create Ethereal test account
    if (!transporter) {
      console.log("Creating Ethereal test account...");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      console.log("📬 Using Ethereal test account. Check preview URL.");
    }
    
    const from = process.env.EMAIL_FROM || `"GiftShop" <${GMAIL_USER || "noreply@giftshop.com"}>`;
    
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: html,
      text: html.replace(/<[^>]*>/g, "")
    });
    
    // Check if it's a test email (Ethereal)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`👁️  Ethereal Preview: ${previewUrl}`);
      return { 
        success: true, 
        previewUrl: previewUrl,
        isTest: true
      };
    }
    
    console.log(`✅ REAL EMAIL SENT SUCCESSFULLY!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      isTest: false
    };
    
  } catch (error: any) {
    console.error("❌ EMAIL SEND FAILED:", error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export default { sendEmail };