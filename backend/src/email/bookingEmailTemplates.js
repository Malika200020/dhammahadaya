// Shared HTML/text template for every sponsor-facing sponsorship-booking
// email (received, confirmed, declined, cancelled, date-changed) — one
// place for the branded look so all five stay visually consistent. Each
// stage function below returns { subject, text, html }, ready to pass
// straight to sendEmail(). The admin-facing "new booking" notification
// (sponsorship.js) deliberately stays plain text — it's an internal alert,
// not a sponsor-facing message, so it doesn't need the branded treatment.
//
// Colors match the site's own brand tokens (frontend/src/styles/tokens.css)
// so the email reads as the same brand, not a generic notification.
const BRAND_NAME = 'Dhammahadaya Senasanaya';
const COLOR_ACCENT = '#fda042'; // --color-primary
const COLOR_INK = '#45311c'; // --color-text-accent / --color-ink
const COLOR_MUTED = '#7a6852'; // --color-text-muted
const COLOR_BORDER = '#f0d9bd'; // --color-border
const COLOR_BG = '#fffaf3'; // --color-background
// Sinhala needs a font stack that actually has the glyphs — same fallback
// order as the site's own body font (frontend/src/styles/tokens.css) so
// Sinhala text renders as real characters rather than tofu boxes on
// clients that have one of these fonts installed.
const FONT_STACK = "'Noto Sans Sinhala', 'Iskoola Pota', Arial, sans-serif";

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// booking.date is a plain 'YYYY-MM-DD' string (see backend/src/db.js's
// custom DATE parser) — parsed with an explicit local-midnight time so it
// can't drift a day depending on the server's timezone, same reasoning as
// db.js's own comment on this exact pitfall.
function formatDate(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function wrapHtml({ title, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background:${COLOR_BG}; font-family:${FONT_STACK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR_BG}; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid ${COLOR_BORDER};">
          <tr>
            <td style="background:${COLOR_ACCENT}; padding:20px 28px;">
              <span style="font-size:18px; font-weight:700; color:${COLOR_INK}; font-family:${FONT_STACK};">${escapeHtml(BRAND_NAME)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px; color:${COLOR_INK}; font-family:${FONT_STACK};">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px; border-top:1px solid ${COLOR_BORDER}; font-size:12px; color:${COLOR_MUTED}; font-family:${FONT_STACK};">
              This is an automated message from ${escapeHtml(BRAND_NAME)}. Please do not reply directly to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailsTableHtml(rows) {
  const cells = rows
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 12px 6px 16px; font-size:14px; color:${COLOR_MUTED}; white-space:nowrap; vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:6px 16px 6px 0; font-size:14px; color:${COLOR_INK}; font-weight:600;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0; border-collapse:collapse; background:${COLOR_BG}; border:1px solid ${COLOR_BORDER}; border-radius:8px;"><tr><td style="padding:8px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cells}</table></td></tr></table>`;
}

function composeBookingEmail({ subject, greetingName, introLines, detailRows, closingLines }) {
  const text = [
    `Dear ${greetingName},`,
    '',
    ...introLines,
    '',
    ...detailRows.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([label, value]) => `${label}: ${value}`),
    '',
    ...closingLines,
  ].join('\n');

  const paragraph = (line) => `<p style="font-size:15px; line-height:1.6; margin:0 0 12px;">${escapeHtml(line)}</p>`;

  const bodyHtml = [
    paragraph(`Dear ${greetingName},`),
    ...introLines.map(paragraph),
    detailsTableHtml(detailRows),
    ...closingLines.map((line, i) =>
      i === closingLines.length - 1
        ? `<p style="font-size:15px; line-height:1.6; margin:12px 0 0; font-weight:600;">${escapeHtml(line)}</p>`
        : paragraph(line)
    ),
  ].join('');

  return { subject, text, html: wrapHtml({ title: subject, bodyHtml }) };
}

// pending -> submitted, awaiting review.
function bookingReceivedEmail(booking) {
  return composeBookingEmail({
    subject: 'Your sponsorship booking request has been received',
    greetingName: booking.name,
    introLines: [
      'Thank you for your sponsorship booking request. We have received it and it is now pending review by the monastery.',
      "We'll email you again as soon as it has been reviewed.",
    ],
    detailRows: [
      ['Date requested', formatDate(booking.date)],
      ['Status', 'Pending review'],
      ['Objective', booking.objective],
    ],
    closingLines: ['Thank you for your generosity — may the Triple Gem protect you.', 'Dhammahadaya Forest Monastery'],
  });
}

// pending -> booked. Bank details are specific to this daily-dana
// sponsorship account (client-provided, 2026-09) — a different account
// from the one on the Development Projects page, so deliberately not
// reused from DevelopmentPage.jsx/DevelopmentBankDetails. Built directly
// (not via composeBookingEmail) since this is the one email with a second,
// differently-purposed details table (the bank account) alongside the
// booking's own details — greetingName still carries booking.name, same as
// every other stage email, so the sponsor's name is always in the greeting.
function bookingConfirmedEmail(booking) {
  const subject = 'Your Dhammahadaya sponsorship booking is confirmed';
  const dateStr = formatDate(booking.date);

  const bankRows = [
    ['Account Name', 'Dhammahadaya Senasanaya'],
    ['Account Number', '1097 6100 4111'],
    ['Bank Name', 'Sampath Bank'],
    ['Branch', 'Balangoda'],
    ['SWIFT Code', 'BSAMLKLX'],
  ];

  const introLines = [
    `Your sponsorship booking for: ${dateStr} has been approved.`,
    'We offer merit to you for offering to sponsor daily requirements at the Dhammahadaya Monastery in Balangoda. There are meditating Monks residing at the Monastery and these donations will support the alms, medicines, travel, education, and the maintenance of the Monastery so as to allow the Monks to focus on treading on the righteous path.',
    `We respectfully confirm and accept ${dateStr}, which you have chosen for the daily donation. Kindly deposit the donation in the following Bank account.`,
  ];
  const afterBankLines = [
    'In order to maintain a proper record of accounts by the Treasurer, we kindly request you to Email or WhatsApp a photo or scan of the remittance advice to,',
  ];
  const contactRows = [
    ['Email', 'dhammahadayasenasanaya@gmail.com'],
    ['Mobile', '+94 70 216 4642'],
  ];
  const closingLines = [
    'May the merits gained by this meritorious deed helps you and your loved ones to tread the samsaric journey with ease till you reach the supreme bliss of Nibbana in the shortest possible time.',
    'May the Triple-gem protect you!',
    'Dhammahadaya Senasanaya',
  ];

  const text = [
    `Dear ${booking.name},`,
    '',
    ...introLines,
    '',
    ...bankRows.map(([label, value]) => `${label}: ${value}`),
    '',
    ...afterBankLines,
    '',
    ...contactRows.map(([label, value]) => `${label}: ${value}`),
    '',
    ...closingLines,
  ].join('\n');

  const paragraph = (line) => `<p style="font-size:15px; line-height:1.6; margin:0 0 12px;">${escapeHtml(line)}</p>`;

  const bodyHtml = [
    paragraph(`Dear ${booking.name},`),
    ...introLines.map(paragraph),
    detailsTableHtml(bankRows),
    ...afterBankLines.map(paragraph),
    detailsTableHtml(contactRows),
    ...closingLines.map((line, i) =>
      i === closingLines.length - 1
        ? `<p style="font-size:15px; line-height:1.6; margin:12px 0 0; font-weight:600;">${escapeHtml(line)}</p>`
        : paragraph(line)
    ),
  ].join('');

  return { subject, text, html: wrapHtml({ title: subject, bodyHtml }) };
}

// pending -> declined.
function bookingDeclinedEmail(booking) {
  return composeBookingEmail({
    subject: 'Update on your sponsorship booking request',
    greetingName: booking.name,
    introLines: [
      "We're sorry to let you know that the monastery was unable to confirm your requested date.",
      'You are welcome to submit a new request for a different date at any time.',
    ],
    detailRows: [
      ['Date requested', formatDate(booking.date)],
      ['Status', 'Not confirmed'],
    ],
    closingLines: ['Thank you for your understanding and continued support.', 'Dhammahadaya Forest Monastery'],
  });
}

// booked -> cancelled (a confirmed booking withdrawn afterwards).
function bookingCancelledEmail(booking) {
  return composeBookingEmail({
    subject: 'Your confirmed sponsorship booking has been cancelled',
    greetingName: booking.name,
    introLines: [
      'We regret to inform you that your previously confirmed sponsorship booking has been cancelled by the monastery.',
      'The date has been released. Please feel free to submit a new booking request, or contact the monastery office with any questions.',
    ],
    detailRows: [
      ['Date', formatDate(booking.date)],
      ['Status', 'Cancelled'],
    ],
    closingLines: ['We apologize for any inconvenience.', 'Dhammahadaya Forest Monastery'],
  });
}

// booked, date changed by an admin edit.
function bookingDateChangedEmail(previousDate, booking) {
  return composeBookingEmail({
    subject: 'Your sponsorship booking date has changed',
    greetingName: booking.name,
    introLines: ['Your confirmed sponsorship booking has been rescheduled by the monastery.'],
    detailRows: [
      ['Previous date', formatDate(previousDate)],
      ['New date', formatDate(booking.date)],
      ['Status', 'Confirmed'],
    ],
    closingLines: ['Thank you for your generosity and understanding.', 'Dhammahadaya Forest Monastery'],
  });
}

module.exports = {
  bookingReceivedEmail,
  bookingConfirmedEmail,
  bookingDeclinedEmail,
  bookingCancelledEmail,
  bookingDateChangedEmail,
};
