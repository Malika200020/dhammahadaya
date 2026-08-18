// Real email driver — sends via nodemailer against whatever SMTP relay is
// configured by env (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM,
// see backend/.env.example). No provider is hardcoded: any standard SMTP
// service (SES SMTP endpoint, Postmark, Mailgun, a real mailbox, etc.)
// works as long as it speaks SMTP with those credentials.
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error(
      'SMTP_HOST, SMTP_USER, and SMTP_PASS must be set when EMAIL_DRIVER=smtp (see backend/.env.example)'
    );
  }

  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host,
    port,
    // Port 465 is implicit TLS; everything else (587, 25) starts plain and
    // upgrades via STARTTLS, which nodemailer does automatically when
    // `secure` is false. SMTP_SECURE lets that be overridden explicitly.
    secure: process.env.SMTP_SECURE === 'true' || (process.env.SMTP_SECURE !== 'false' && port === 465),
    auth: { user, pass },
  });
  return transporter;
}

async function sendEmail({ to, subject, text }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await getTransporter().sendMail({ from, to, subject, text });
}

module.exports = { sendEmail };
