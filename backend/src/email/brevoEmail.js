// Real email driver — sends via Brevo's transactional email HTTP API
// (https://api.brevo.com/v3/smtp/email). Unlike smtpEmail.js this goes out
// over HTTPS/443, so it works on hosts (Render's free tier included) that
// block outbound SMTP ports 25/465/587. Needs BREVO_API_KEY and
// BREVO_FROM_EMAIL (the sender must be verified in Brevo's dashboard first
// — see backend/.env.example).
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendEmail({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    throw new Error(
      'BREVO_API_KEY and BREVO_FROM_EMAIL must be set when EMAIL_DRIVER=brevo (see backend/.env.example)'
    );
  }
  const fromName = process.env.BREVO_FROM_NAME || 'Dhammahadaya Senasanaya';

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    // Brevo's JSON body is sent and parsed as UTF-8 regardless of these
    // fields' content, so Sinhala text round-trips correctly on its own —
    // htmlContent's own <meta charset="UTF-8"> (see
    // bookingEmailTemplates.js) is what makes the *rendered* email client
    // decode it correctly. textContent is included alongside html as the
    // plain-text fallback for clients that can't render HTML.
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo send failed (${res.status}): ${body}`);
  }
}

module.exports = { sendEmail };
