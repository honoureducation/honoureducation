// Private file storage for course materials.
//
// Production: any S3-compatible bucket (Cloudflare R2 or AWS S3). Files stay private;
// the browser uploads straight to the bucket with a presigned PUT and learners get
// short-lived presigned GET links.
//
// Development (no bucket configured): files go to backend/uploads/lms and the same
// upload/download flow is served by the API with signed one-time-style tokens.
// Render's disk is wiped on deploy, so local mode must not be used in production.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { LMS_JWT_SECRET, SIGNED_URL_TTL } = require('../config');

const BUCKET = process.env.LMS_S3_BUCKET;
const useS3 = !!(BUCKET && process.env.LMS_S3_ACCESS_KEY_ID && process.env.LMS_S3_SECRET_ACCESS_KEY);
const LOCAL_ROOT = process.env.LMS_LOCAL_UPLOAD_DIR
  ? path.resolve(process.env.LMS_LOCAL_UPLOAD_DIR)
  : path.resolve(__dirname, '..', '..', 'uploads', 'lms');

if (!useS3 && process.env.NODE_ENV === 'production') {
  console.warn('[lms] No LMS_S3_* bucket configured — course files are stored on local disk and will be lost on redeploy.');
}

let s3;
let s3sdk;
let presigner;
const getS3 = () => {
  if (!s3) {
    s3sdk = require('@aws-sdk/client-s3');
    presigner = require('@aws-sdk/s3-request-presigner');
    s3 = new s3sdk.S3Client({
      region: process.env.LMS_S3_REGION || 'auto',
      endpoint: process.env.LMS_S3_ENDPOINT || undefined, // e.g. https://<account>.r2.cloudflarestorage.com
      forcePathStyle: !!process.env.LMS_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.LMS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.LMS_S3_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
};

const sanitizeName = (name) =>
  String(name || 'file')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(-80) || 'file';

const buildKey = (courseId, fileName, purpose = 'material') => {
  const id = crypto.randomUUID();
  const prefix = purpose === 'thumbnail' ? 'thumb' : 'm';
  return `lms/courses/${courseId}/${prefix}-${id}-${sanitizeName(fileName)}`;
};

const keyBelongsToCourse = (key, courseId) =>
  typeof key === 'string' && key.startsWith(`lms/courses/${courseId}/`) && !key.includes('..');

const localPath = (key) => {
  const p = path.resolve(LOCAL_ROOT, key);
  if (!p.startsWith(LOCAL_ROOT + path.sep)) throw new Error('Invalid storage key');
  return p;
};

const contentDisposition = (fileName, inline) => {
  const safe = sanitizeName(fileName);
  return `${inline ? 'inline' : 'attachment'}; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(fileName || safe)}`;
};

// apiBase is the public origin of this API (e.g. https://api.example.com); only used in local mode.
const getUploadTarget = async ({ key, contentType, apiBase }) => {
  if (useS3) {
    const client = getS3();
    const cmd = new s3sdk.PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
    const url = await presigner.getSignedUrl(client, cmd, { expiresIn: 60 * 30 });
    return { uploadUrl: url, method: 'PUT', headers: { 'Content-Type': contentType } };
  }
  const token = jwt.sign({ typ: 'lms_upload', key, ct: contentType }, LMS_JWT_SECRET, { expiresIn: '30m' });
  return {
    uploadUrl: `${apiBase}/api/lms/files/upload/${token}`,
    method: 'PUT',
    headers: { 'Content-Type': contentType },
  };
};

const getDownloadUrl = async ({ key, fileName, mimeType, inline = true, apiBase, ttl = SIGNED_URL_TTL }) => {
  if (!key) return null;
  if (useS3) {
    const client = getS3();
    const cmd = new s3sdk.GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: contentDisposition(fileName, inline),
      ResponseContentType: mimeType || undefined,
    });
    return presigner.getSignedUrl(client, cmd, { expiresIn: ttl });
  }
  const token = jwt.sign({ typ: 'lms_download', key, fn: fileName, mt: mimeType, inl: inline }, LMS_JWT_SECRET, {
    expiresIn: ttl,
  });
  return `${apiBase}/api/lms/files/download/${token}`;
};

// Returns { sizeBytes } or null when the object does not exist.
const statObject = async (key) => {
  try {
    if (useS3) {
      const out = await getS3().send(new s3sdk.HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      return { sizeBytes: out.ContentLength, mimeType: out.ContentType };
    }
    const st = await fs.promises.stat(localPath(key));
    return { sizeBytes: st.size };
  } catch (e) {
    return null;
  }
};

const deleteObject = async (key) => {
  if (!key) return;
  try {
    if (useS3) {
      await getS3().send(new s3sdk.DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    } else {
      await fs.promises.unlink(localPath(key));
    }
  } catch (e) {
    console.warn('[lms] could not delete file', key, e.message);
  }
};

// ── Local-mode handlers (mounted before express.json so the body stream is untouched) ──
const MAX_LOCAL_UPLOAD = 2 * 1024 * 1024 * 1024; // 2 GB

const handleLocalUpload = async (req, res) => {
  if (useS3) return res.status(404).json({ message: 'Not found' });
  let payload;
  try {
    payload = jwt.verify(req.params.token, LMS_JWT_SECRET);
    if (payload.typ !== 'lms_upload') throw new Error('bad token');
  } catch (e) {
    return res.status(401).json({ message: 'Upload link expired or invalid' });
  }
  const dest = localPath(payload.key);
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  let received = 0;
  const out = fs.createWriteStream(dest);
  let aborted = false;
  req.on('data', (chunk) => {
    received += chunk.length;
    if (received > MAX_LOCAL_UPLOAD && !aborted) {
      aborted = true;
      req.unpipe(out);
      out.destroy();
      fs.promises.unlink(dest).catch(() => {});
      res.status(413).json({ message: 'File too large' });
    }
  });
  req.pipe(out);
  out.on('finish', () => !aborted && res.status(200).json({ ok: true, sizeBytes: received }));
  out.on('error', (err) => {
    if (aborted) return;
    console.error('[lms] local upload failed', err);
    res.status(500).json({ message: 'Upload failed' });
  });
};

const handleLocalDownload = (req, res) => {
  if (useS3) return res.status(404).json({ message: 'Not found' });
  let payload;
  try {
    payload = jwt.verify(req.params.token, LMS_JWT_SECRET);
    if (payload.typ !== 'lms_download') throw new Error('bad token');
  } catch (e) {
    return res.status(401).json({ message: 'Link expired or invalid' });
  }
  let file;
  try {
    file = localPath(payload.key);
  } catch (e) {
    return res.status(400).json({ message: 'Invalid file' });
  }
  if (!fs.existsSync(file)) return res.status(404).json({ message: 'File not found' });
  res.setHeader('Content-Disposition', contentDisposition(payload.fn, payload.inl));
  res.setHeader('Cache-Control', 'private, max-age=600');
  // sendFile handles Range requests, so video seeking works.
  return res.sendFile(file, { headers: payload.mt ? { 'Content-Type': payload.mt } : {} });
};

module.exports = {
  useS3,
  buildKey,
  keyBelongsToCourse,
  getUploadTarget,
  getDownloadUrl,
  statObject,
  deleteObject,
  handleLocalUpload,
  handleLocalDownload,
};
