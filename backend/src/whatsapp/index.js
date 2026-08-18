// WhatsApp integration (build-spec §10, deferred half) — sends a booking
// confirmation over WhatsApp alongside (never instead of) the existing
// sponsor email, once an admin has linked a number by scanning a QR code.
// Fully gated behind WHATSAPP_ENABLED (default false, see backend/.env.example):
// when disabled, this module never requires whatsapp-web.js and never
// launches a browser — every exported function short-circuits first.
const path = require('path');
const os = require('os');

function isEnabled() {
  return process.env.WHATSAPP_ENABLED === 'true';
}

// Module-level session state — lazily populated only when enabled.
let client = null;
let status = 'disabled'; // disabled | initializing | qr | linked | auth-failure | disconnected
let qrDataUrl = null;
let initPromise = null;

// Outside the repo by default (~/.dhammahadaya/whatsapp-session), so a
// linked session survives without ever needing a gitignore rule. Override
// via WHATSAPP_SESSION_DIR if that default path isn't writable/desired.
function sessionDir() {
  return process.env.WHATSAPP_SESSION_DIR || path.join(os.homedir(), '.dhammahadaya', 'whatsapp-session');
}

// Starts the WhatsApp client. Safe to call more than once — a call while
// one is already initializing/linked is a no-op (returns the same
// in-flight promise), and reconnection after a disconnect calls this again
// internally so the admin screen naturally cycles back to a fresh QR.
async function initWhatsapp() {
  if (!isEnabled()) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { Client, LocalAuth } = require('whatsapp-web.js');
    const QRCode = require('qrcode');

    status = 'initializing';
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: sessionDir() }),
      webVersionCache: { type: 'local', path: path.join(sessionDir(), 'wwebjs_cache') },
      puppeteer: { headless: true },
    });

    client.on('qr', async (qr) => {
      status = 'qr';
      try {
        qrDataUrl = await QRCode.toDataURL(qr);
      } catch (err) {
        console.error('Failed to render WhatsApp QR code:', err);
        qrDataUrl = null;
      }
    });

    client.on('ready', () => {
      status = 'linked';
      qrDataUrl = null;
      console.log('WhatsApp client linked and ready.');
    });

    client.on('auth_failure', (msg) => {
      status = 'auth-failure';
      qrDataUrl = null;
      console.error('WhatsApp authentication failed:', msg);
    });

    client.on('disconnected', (reason) => {
      console.error('WhatsApp client disconnected:', reason);
      status = 'disconnected';
      qrDataUrl = null;
      client = null;
      initPromise = null;
      initWhatsapp().catch((err) => console.error('WhatsApp re-init after disconnect failed:', err));
    });

    await client.initialize();
  })().catch((err) => {
    console.error('Failed to initialize WhatsApp client:', err);
    status = 'auth-failure';
    initPromise = null;
  });

  return initPromise;
}

// GET-able snapshot for the admin status/QR screen.
function getStatus() {
  if (!isEnabled()) return { enabled: false, status: 'disabled', qr: null };
  return { enabled: true, status, qr: status === 'qr' ? qrDataUrl : null };
}

// Sri Lankan numbers only — the only kind the booking form realistically
// collects. Accepts: local with leading 0 (07XXXXXXXX), bare subscriber
// number with no leading 0 (7XXXXXXXX), or already carrying the country
// code with or without a leading '+' (947XXXXXXXX / +947XXXXXXXX). Anything
// else — wrong length, non-Sri-Lankan, letters, empty — is unnormalizable
// and returns null; callers must treat that as "skip WhatsApp, don't fail
// anything else".
function normalizePhoneToWhatsappId(rawPhone) {
  if (!rawPhone) return null;
  const digitsAndPlus = String(rawPhone).replace(/[^\d+]/g, '');
  const stripped = digitsAndPlus.startsWith('+') ? digitsAndPlus.slice(1) : digitsAndPlus;

  let national;
  if (/^0\d{9}$/.test(stripped)) {
    national = '94' + stripped.slice(1);
  } else if (/^94\d{9}$/.test(stripped)) {
    national = stripped;
  } else if (/^7\d{8}$/.test(stripped)) {
    national = '94' + stripped;
  } else {
    return null;
  }
  return `${national}@c.us`;
}

// Fire-and-forget by design: never throws, always resolves with a result
// object describing what happened (or why nothing was sent), so a caller
// can log it without a try/catch and without it ever affecting the
// caller's own response — mirrors the admin-notification email pattern.
async function sendWhatsappMessage(rawPhone, text) {
  if (!isEnabled()) return { sent: false, reason: 'disabled' };

  const chatId = normalizePhoneToWhatsappId(rawPhone);
  if (!chatId) return { sent: false, reason: 'unnormalizable-phone' };

  if (status !== 'linked' || !client) {
    return { sent: false, reason: 'not-linked' };
  }

  try {
    await client.sendMessage(chatId, text);
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: 'send-error', error: err.message };
  }
}

module.exports = { initWhatsapp, getStatus, sendWhatsappMessage, normalizePhoneToWhatsappId };
