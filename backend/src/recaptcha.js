// reCAPTCHA verification (build-spec §13), gated by RECAPTCHA_ENABLED — off
// by default so local dev/testing isn't blocked on a live Google key.
async function verifyRecaptcha(token) {
  if (process.env.RECAPTCHA_ENABLED !== 'true') return true;
  if (!token) return false;

  const params = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY || '', response: token });
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body: params });
  const body = await res.json();
  return Boolean(body.success);
}

module.exports = { verifyRecaptcha };
