const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function saveFile(buffer, originalName, _mimetype) {
  const ext = path.extname(originalName) || '';
  const key = `${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, key), buffer);
  // Relative URL — served by the `/uploads` static mount in app.js. Kept
  // relative (not absolute-with-host) so it works unchanged behind
  // whatever host/proxy fronts the API in any environment.
  return { key, url: `/uploads/${key}` };
}

async function deleteFile(key) {
  const filePath = path.join(UPLOAD_DIR, key);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

module.exports = { saveFile, deleteFile, UPLOAD_DIR };
