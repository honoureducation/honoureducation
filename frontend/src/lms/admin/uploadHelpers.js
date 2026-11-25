import { lmsAdminAPI, uploadFile } from '../api';

// Guess the material type from a file.
export const detectType = (file) => {
  const t = file.type || '';
  const name = (file.name || '').toLowerCase();
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'audio';
  if (t.startsWith('image/')) return 'image';
  if (t === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  return 'document';
};

// "week-1_intro video.mp4" → "Week 1 intro video"
export const titleFromFile = (name) => {
  const base = String(name || 'Untitled').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Untitled';
};

// Read a media file's duration in the browser before uploading.
export const readDuration = (file) =>
  new Promise((resolve) => {
    if (!/^(video|audio)\//.test(file.type)) return resolve(undefined);
    const el = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
    const url = URL.createObjectURL(file);
    let settled = false;
    const done = (v) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(v);
    };
    el.preload = 'metadata';
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? Math.round(el.duration) : undefined);
    el.onerror = () => done(undefined);
    setTimeout(() => done(undefined), 8000);
    el.src = url;
  });

// Upload a file for a course and return the `file` payload a material needs.
export const uploadCourseFile = async (courseId, file, onProgress, purpose = 'material') => {
  const contentType = file.type || 'application/octet-stream';
  const [{ data: target }, durationSec] = await Promise.all([
    lmsAdminAPI.post(`/courses/${courseId}/upload-url`, { fileName: file.name, contentType, purpose }),
    purpose === 'material' ? readDuration(file) : Promise.resolve(undefined),
  ]);
  await uploadFile({ ...target, headers: { 'Content-Type': contentType } }, file, onProgress);
  return { storageKey: target.storageKey, originalName: file.name, mimeType: contentType, durationSec };
};

export const uploadThumbnail = async (courseId, file) => {
  const { storageKey } = await uploadCourseFile(courseId, file, null, 'thumbnail');
  const { data } = await lmsAdminAPI.put(`/courses/${courseId}/thumbnail`, { storageKey });
  return data.course;
};
