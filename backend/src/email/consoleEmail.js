// Dev email driver — logs instead of sending. Swap EMAIL_DRIVER=smtp (once
// an ./smtpEmail.js implementing the same sendEmail() is written, e.g. with
// nodemailer against a real SMTP relay) to send for real — nothing else in
// the app needs to change.
async function sendEmail({ to, subject, text }) {
  console.log('--- [dev email] ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(text);
  console.log('-------------------');
}

module.exports = { sendEmail };
