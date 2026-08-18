const app = require('./app');
const { initWhatsapp } = require('./whatsapp');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// No-op when WHATSAPP_ENABLED isn't "true" — doesn't even require
// whatsapp-web.js in that case.
initWhatsapp().catch((err) => console.error('WhatsApp init failed:', err));
