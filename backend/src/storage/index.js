// Storage abstraction: { saveFile(buffer, originalName, mimetype) -> Promise<{key, url}>,
// deleteFile(key) -> Promise<void> }. build-spec §7/§20 calls for Cloudflare
// R2 in production (large PDFs/media shouldn't live on the app server) —
// not set up yet, so STORAGE_DRIVER=local writes to backend/uploads/. To
// add R2 later: write ./r2Storage.js implementing the same two functions
// (R2 is S3-compatible, @aws-sdk/client-s3 works against it) and switch
// STORAGE_DRIVER=r2 — nothing else in the app needs to change.
const driver = process.env.STORAGE_DRIVER || 'local';

let impl;
if (driver === 'local') {
  impl = require('./localStorage');
} else {
  throw new Error(`Unknown STORAGE_DRIVER "${driver}" (only "local" is implemented so far)`);
}

module.exports = impl;
