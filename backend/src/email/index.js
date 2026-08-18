// Email abstraction: { sendEmail({to, subject, text}) -> Promise<void> }.
// EMAIL_DRIVER env var selects the implementation so a real provider
// (SMTP relay, SES, Postmark, etc.) can be wired in later without touching
// any call site — mirrors backend/src/storage/index.js's driver pattern.
const driver = process.env.EMAIL_DRIVER || 'console';

let impl;
if (driver === 'console') {
  impl = require('./consoleEmail');
} else if (driver === 'smtp') {
  impl = require('./smtpEmail');
} else {
  throw new Error(`Unknown EMAIL_DRIVER "${driver}" (expected "console" or "smtp")`);
}

module.exports = impl;
