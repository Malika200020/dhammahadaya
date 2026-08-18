// Dev email driver — logs instead of sending. Set EMAIL_DRIVER=smtp (see
// ./smtpEmail.js and backend/.env.example) to send for real — nothing
// else in the app needs to change.
async function sendEmail({ to, subject, text }) {
  console.log('--- [dev email] ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(text);
  console.log('-------------------');
}

module.exports = { sendEmail };
