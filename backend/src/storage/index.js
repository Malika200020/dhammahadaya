// Storage abstraction: { saveFile(buffer, originalName, mimetype) -> Promise<{key, url}>,
// deleteFile(key) -> Promise<void> }. STORAGE_DRIVER=local (dev default)
// writes to backend/uploads/; STORAGE_DRIVER=r2 (see ./r2Storage.js and
// backend/.env.example) sends to Cloudflare R2 — nothing else in the app
// needs to change either way.
const driver = process.env.STORAGE_DRIVER || 'local';

let impl;
if (driver === 'local') {
  impl = require('./localStorage');
} else if (driver === 'r2') {
  impl = require('./r2Storage');
} else {
  throw new Error(`Unknown STORAGE_DRIVER "${driver}" (expected "local" or "r2")`);
}

module.exports = impl;
