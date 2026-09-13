// Dev email driver — logs instead of sending. Set EMAIL_DRIVER=smtp or
// brevo (see the other drivers in this folder and backend/.env.example) to
// send for real — nothing else in the app needs to change. Logs the HTML
// body too (when a caller passes one, e.g. the booking lifecycle emails in
// bookingEmailTemplates.js) so it can be eyeballed/pasted into a browser
// during dev without needing a real send.
async function sendEmail({ to, subject, text, html }) {
  console.log('--- [dev email] ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('--- text ---');
  console.log(text);
  if (html) {
    console.log('--- html ---');
    console.log(html);
  }
  console.log('-------------------');
}

module.exports = { sendEmail };
