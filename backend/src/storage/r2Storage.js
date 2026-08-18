// Real storage driver — Cloudflare R2, via the S3-compatible API
// (@aws-sdk/client-s3 works against it unmodified). Configured entirely by
// env: R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_BUCKET/
// R2_PUBLIC_URL — see backend/.env.example.
const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

let client = null;

function getClient() {
  if (client) return client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY must be set when STORAGE_DRIVER=r2 (see backend/.env.example)'
    );
  }

  client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

function requireBucket() {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('R2_BUCKET must be set when STORAGE_DRIVER=r2 (see backend/.env.example)');
  return bucket;
}

function requirePublicBase() {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) {
    throw new Error(
      'R2_PUBLIC_URL must be set when STORAGE_DRIVER=r2 — the bucket\'s public r2.dev URL or a custom domain fronting it (see backend/.env.example)'
    );
  }
  return base.replace(/\/$/, '');
}

async function saveFile(buffer, originalName, mimetype) {
  const bucket = requireBucket();
  const ext = path.extname(originalName) || '';
  const key = `${crypto.randomUUID()}${ext}`;

  await getClient().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mimetype })
  );

  return { key, url: `${requirePublicBase()}/${key}` };
}

async function deleteFile(key) {
  const bucket = requireBucket();
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

module.exports = { saveFile, deleteFile };
