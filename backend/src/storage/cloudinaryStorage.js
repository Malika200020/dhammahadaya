// Real storage driver — Cloudinary. Configured entirely by env:
// CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET — see
// backend/.env.example. Chosen over the r2 driver for its CDN delivery and
// on-the-fly image transforms (auto format/quality), useful for the photo
// galleries and article cover images this app uploads.
const cloudinary = require('cloudinary').v2;

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set when STORAGE_DRIVER=cloudinary (see backend/.env.example)'
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

async function saveFile(buffer, _originalName, _mimetype) {
  ensureConfigured();
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dhammahadaya', resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });
  // public_id is what destroy() needs back to delete this exact asset later.
  return { key: result.public_id, url: result.secure_url };
}

async function deleteFile(key) {
  ensureConfigured();
  await cloudinary.uploader.destroy(key, { resource_type: 'image' });
}

module.exports = { saveFile, deleteFile };
