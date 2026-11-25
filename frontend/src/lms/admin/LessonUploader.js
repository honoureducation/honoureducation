// Drag-and-drop several files at once; each becomes a lesson in the given section.
import React, { useRef, useState } from 'react';
import { lmsAdminAPI, errorMessage, formatBytes } from '../api';
import { TypeIcon, TYPE_LABEL } from '../components';
import { detectType, titleFromFile, uploadCourseFile } from './uploadHelpers';

const ACCEPT = 'video/*,audio/*,image/*,application/pdf,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.odt,.odp';

export default function LessonUploader({ courseId, sectionId, onAdded, compact = false }) {
  const [items, setItems] = useState([]); // { key, name, size, type, progress, status, error }
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const patch = (key, p) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...p } : i)));

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !sectionId) return;
    const queued = files.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      file: f,
      name: f.name,
      size: f.size,
      type: detectType(f),
      progress: 0,
      status: 'waiting',
    }));
    setItems((list) => [...list, ...queued]);

    // Upload one at a time so lesson order matches the order the files were picked.
    for (const q of queued) {
      patch(q.key, { status: 'uploading' });
      try {
        const file = await uploadCourseFile(courseId, q.file, (p) => patch(q.key, { progress: p }));
        const { data } = await lmsAdminAPI.post(`/sections/${sectionId}/materials`, {
          type: q.type,
          title: titleFromFile(q.name),
          file,
        });
        patch(q.key, { status: 'done', progress: 100 });
        if (onAdded) onAdded(data.material);
      } catch (e) {
        patch(q.key, { status: 'error', error: errorMessage(e, 'Upload failed') });
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const busy = items.some((i) => i.status === 'uploading' || i.status === 'waiting');

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current && inputRef.current.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`cursor-pointer rounded-2xl border-2 border-dashed text-center transition-colors ${compact ? 'px-4 py-5' : 'px-6 py-10'} ${
          dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50'
        }`}
      >
        <div className={`mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 ${compact ? 'w-10 h-10' : 'w-14 h-14'}`}>
          <svg className={compact ? 'w-5 h-5' : 'w-7 h-7'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className={`mt-3 font-bold text-slate-800 ${compact ? 'text-sm' : ''}`}>
          {dragging ? 'Drop to upload' : 'Drag & drop lesson files here'}
        </p>
        <p className="mt-1 text-xs text-slate-500">or click to choose · videos, PDFs, audio, images, Word/PowerPoint — several at once</p>
        <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {items.length > 0 && (
        <ul className="rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white">
          {items.map((i) => (
            <li key={i.key} className="px-4 py-3 flex items-center gap-3 text-sm">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"><TypeIcon type={i.type} /></span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-slate-800 truncate">{titleFromFile(i.name)}</span>
                <span className="block text-xs text-slate-500">
                  {TYPE_LABEL[i.type]} · {formatBytes(i.size)}
                  {i.status === 'error' && <span className="text-rose-600"> · {i.error}</span>}
                </span>
                {i.status === 'uploading' && (
                  <span className="mt-1.5 block h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <span className="block h-full bg-emerald-500 transition-all" style={{ width: `${i.progress}%` }} />
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs font-bold">
                {i.status === 'waiting' && <span className="text-slate-400">Waiting…</span>}
                {i.status === 'uploading' && <span className="text-emerald-600">{i.progress}%</span>}
                {i.status === 'done' && <span className="text-emerald-600">✓ Added</span>}
                {i.status === 'error' && <span className="text-rose-600">Failed</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {busy && <p className="text-xs text-slate-500">Keep this page open until all uploads finish.</p>}
    </div>
  );
}
