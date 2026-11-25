import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { lmsAdminAPI, errorMessage, toMajor, uploadFile, formatBytes, formatDuration, formatDate } from '../api';
import { Spinner, Thumb, TypeIcon, TYPE_LABEL, Pill, inputCls, btnPrimary, btnSecondary } from '../components';
import { readDuration } from './uploadHelpers';
import LessonUploader from './LessonUploader';

const FILE_TYPES = ['video', 'pdf', 'document', 'audio', 'image'];
const ACCEPT = {
  video: 'video/*',
  pdf: 'application/pdf,.pdf',
  document: '.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.odt,.odp',
  audio: 'audio/*',
  image: 'image/*',
};

const FALLBACK_CURRENCIES = [
  { id: 'aed', code: 'AED', label: 'UAE Dirham' },
  { id: 'sar', code: 'SAR', label: 'Saudi Riyal' },
  { id: 'qar', code: 'QAR', label: 'Qatari Riyal' },
  { id: 'kwd', code: 'KWD', label: 'Kuwaiti Dinar' },
  { id: 'bhd', code: 'BHD', label: 'Bahraini Dinar' },
  { id: 'omr', code: 'OMR', label: 'Omani Rial' },
  { id: 'usd', code: 'USD', label: 'US Dollar' },
];

const Label = ({ children }) => <span className="block text-sm font-semibold text-slate-700 mb-1.5">{children}</span>;

export default function CourseEditor({ courseId, meta, onBack }) {
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [thumbBusy, setThumbBusy] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [materialModal, setMaterialModal] = useState(null); // { section, material? }
  const [uploadSection, setUploadSection] = useState(null); // section id showing the bulk uploader

  const load = useCallback(async () => {
    try {
      const { data } = await lmsAdminAPI.get(`/courses/${courseId}`);
      const c = data.course;
      setCourse(c);
      setCurriculum(data.curriculum);
      setForm({
        title: c.title || '',
        slug: c.slug || '',
        shortDescription: c.shortDescription || '',
        description: c.description || '',
        category: c.category || '',
        level: c.level || 'all',
        tags: (c.tags || []).join(', '),
        currency: c.currency,
        price: c.price ? String(toMajor(c.price, c.currency)) : '',
        isFree: !!c.isFree,
      });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  if (!course || !form) return <Spinner />;

  const currencies = (meta && meta.currencies) || FALLBACK_CURRENCIES;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const saveDetails = async (e) => {
    e && e.preventDefault();
    setSaving(true);
    try {
      const { data } = await lmsAdminAPI.put(`/courses/${courseId}`, form);
      setCourse((c) => ({ ...c, ...data.course }));
      setForm((f) => ({ ...f, slug: data.course.slug }));
      toast.success('Course saved');
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status) => {
    if (status === 'published' && !(await saveDetails())) return;
    try {
      const { data } = await lmsAdminAPI.put(`/courses/${courseId}`, { status });
      setCourse((c) => ({ ...c, ...data.course }));
      toast.success(status === 'published' ? 'Course is live' : status === 'archived' ? 'Course archived' : 'Course unpublished');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${course.title}" and all its files? This cannot be undone.`)) return;
    try {
      await lmsAdminAPI.delete(`/courses/${courseId}`);
      toast.success('Course deleted');
      onBack();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const uploadThumb = async (file) => {
    if (!file) return;
    setThumbBusy(true);
    try {
      const { data: target } = await lmsAdminAPI.post(`/courses/${courseId}/upload-url`, { fileName: file.name, contentType: file.type, purpose: 'thumbnail' });
      await uploadFile(target, file);
      const { data } = await lmsAdminAPI.put(`/courses/${courseId}/thumbnail`, { storageKey: target.storageKey });
      setCourse((c) => ({ ...c, ...data.course }));
      toast.success('Cover image updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setThumbBusy(false);
    }
  };

  // ── Curriculum ──
  const saveOrder = async (next) => {
    setCurriculum(next);
    try {
      await lmsAdminAPI.put(`/courses/${courseId}/reorder`, {
        sections: next.map((s) => ({ id: s._id, materials: s.materials.map((m) => m._id) })),
      });
    } catch (err) {
      toast.error(errorMessage(err));
      load();
    }
  };

  const moveSection = (i, d) => {
    const next = [...curriculum];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    saveOrder(next);
  };

  const moveMaterial = (si, mi, d) => {
    const next = curriculum.map((s) => ({ ...s, materials: [...s.materials] }));
    const list = next[si].materials;
    const j = mi + d;
    if (j < 0 || j >= list.length) return;
    [list[mi], list[j]] = [list[j], list[mi]];
    saveOrder(next);
  };

  const addSection = async (e) => {
    e.preventDefault();
    if (!newSection.trim()) return;
    try {
      await lmsAdminAPI.post(`/courses/${courseId}/sections`, { title: newSection });
      setNewSection('');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const renameSection = async (s) => {
    const title = window.prompt('Section title', s.title);
    if (!title || title === s.title) return;
    try {
      await lmsAdminAPI.put(`/sections/${s._id}`, { title });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const deleteSection = async (s) => {
    if (!window.confirm(`Delete section "${s.title}" and its ${s.materials.length} material(s)?`)) return;
    try {
      await lmsAdminAPI.delete(`/sections/${s._id}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const deleteMaterial = async (m) => {
    if (!window.confirm(`Delete "${m.title}"?`)) return;
    try {
      await lmsAdminAPI.delete(`/materials/${m._id}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const previewMaterial = async (m) => {
    const win = window.open('', '_blank');
    try {
      const { data } = await lmsAdminAPI.get(`/materials/${m._id}/preview`);
      if (data.url && win) win.location.href = data.url;
      else if (win) { win.document.body.innerText = data.body || 'Nothing to preview'; }
    } catch (err) {
      if (win) win.close();
      toast.error(errorMessage(err));
    }
  };

  const iconBtn = 'p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800">← All courses</button>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-black text-slate-900">{course.title}</h2>
            <Pill value={course.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">{course.enrollmentCount || 0} enrolled · /learn/courses/{course.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.status === 'published' && (
            <a href={`/learn/courses/${course.slug}`} target="_blank" rel="noopener noreferrer" className={btnSecondary}>View page ↗</a>
          )}
          {course.status !== 'published' && <button onClick={() => setStatus('published')} className={btnPrimary}>Publish</button>}
          {course.status === 'published' && <button onClick={() => setStatus('draft')} className={btnSecondary}>Unpublish</button>}
          {course.status !== 'archived' && <button onClick={() => setStatus('archived')} className={btnSecondary}>Archive</button>}
          <button onClick={remove} className="inline-flex items-center rounded-xl px-4 py-2.5 font-bold text-rose-600 hover:bg-rose-50">Delete</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <form onSubmit={saveDetails} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Details</h3>
          <label className="block"><Label>Title</Label><input className={inputCls} value={form.title} onChange={set('title')} required /></label>
          <label className="block"><Label>URL slug</Label><input className={inputCls} value={form.slug} onChange={set('slug')} /></label>
          <label className="block"><Label>Short description (shown on course cards)</Label><input className={inputCls} maxLength={300} value={form.shortDescription} onChange={set('shortDescription')} /></label>
          <label className="block"><Label>Full description</Label><textarea rows={7} className={inputCls} value={form.description} onChange={set('description')} /></label>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block"><Label>Category</Label><input className={inputCls} value={form.category} onChange={set('category')} /></label>
            <label className="block"><Label>Level</Label>
              <select className={inputCls} value={form.level} onChange={set('level')}>
                <option value="all">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="block"><Label>Tags (comma separated)</Label><input className={inputCls} value={form.tags} onChange={set('tags')} /></label>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.isFree} onChange={set('isFree')} className="w-4 h-4" /> This course is free
            </label>
            {!form.isFree && (
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block"><Label>Currency</Label>
                  <select className={inputCls} value={form.currency} onChange={set('currency')}>
                    {currencies.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.label}</option>)}
                  </select>
                </label>
                <label className="block"><Label>Price</Label>
                  <input type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={set('price')} placeholder="e.g. 199" />
                </label>
              </div>
            )}
          </div>
          <button disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save details'}</button>
        </form>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 self-start">
          <h3 className="font-bold text-slate-900">Cover image</h3>
          <div className="aspect-video rounded-xl overflow-hidden"><Thumb url={course.thumbnailUrl} title={course.title} /></div>
          <label className={`${btnSecondary} w-full cursor-pointer`}>
            {thumbBusy ? 'Uploading…' : course.thumbnailUrl ? 'Replace image' : 'Upload image'}
            <input type="file" accept="image/*" className="hidden" disabled={thumbBusy} onChange={(e) => uploadThumb(e.target.files[0])} />
          </label>
          <p className="text-xs text-slate-500">16:9 works best, e.g. 1280×720.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-900">Course content</h3>
        {curriculum.length === 0 && <p className="text-sm text-slate-500">Add a section (e.g. "Week 1" or "Introduction"), then upload materials into it.</p>}
        {curriculum.map((s, si) => (
          <div key={s._id} className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="flex-1 font-bold text-slate-800">{s.title}</span>
              <button className={iconBtn} disabled={si === 0} onClick={() => moveSection(si, -1)} title="Move up">↑</button>
              <button className={iconBtn} disabled={si === curriculum.length - 1} onClick={() => moveSection(si, 1)} title="Move down">↓</button>
              <button className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2" onClick={() => renameSection(s)}>Rename</button>
              <button className="text-xs font-bold text-rose-600 hover:underline px-2" onClick={() => deleteSection(s)}>Delete</button>
            </div>
            <ul className="divide-y divide-slate-100">
              {s.materials.map((m, mi) => (
                <li key={m._id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="text-slate-400"><TypeIcon type={m.type} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="font-medium text-slate-800">{m.title}</span>
                    <span className="block text-xs text-slate-400">
                      {TYPE_LABEL[m.type]}
                      {m.file && m.file.sizeBytes ? ` · ${formatBytes(m.file.sizeBytes)}` : ''}
                      {m.file && m.file.durationSec ? ` · ${formatDuration(m.file.durationSec)}` : ''}
                      {m.isPreview ? ' · free preview' : ''}
                      {m.downloadable ? ' · downloadable' : ''}
                    </span>
                  </span>
                  <button className={iconBtn} disabled={mi === 0} onClick={() => moveMaterial(si, mi, -1)} title="Move up">↑</button>
                  <button className={iconBtn} disabled={mi === s.materials.length - 1} onClick={() => moveMaterial(si, mi, 1)} title="Move down">↓</button>
                  <button className="text-xs font-bold text-slate-500 hover:text-slate-900 px-1" onClick={() => previewMaterial(m)}>View</button>
                  <button className="text-xs font-bold text-blue-600 hover:underline px-1" onClick={() => setMaterialModal({ section: s, material: m })}>Edit</button>
                  <button className="text-xs font-bold text-rose-600 hover:underline px-1" onClick={() => deleteMaterial(m)}>Delete</button>
                </li>
              ))}
              <li className="px-4 py-2.5 space-y-3">
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setUploadSection(uploadSection === s._id ? null : s._id)} className="text-sm font-bold text-emerald-600 hover:underline">
                    {uploadSection === s._id ? '− Hide uploader' : '⇪ Upload files'}
                  </button>
                  <button onClick={() => setMaterialModal({ section: s })} className="text-sm font-bold text-blue-600 hover:underline">+ Add link, text or single file</button>
                </div>
                {uploadSection === s._id && (
                  <LessonUploader compact courseId={courseId} sectionId={s._id} onAdded={(m) => setCurriculum((list) => list.map((x) => (x._id === s._id ? { ...x, materials: [...x.materials, m] } : x)))} />
                )}
              </li>
            </ul>
          </div>
        ))}
        <form onSubmit={addSection} className="flex flex-col sm:flex-row gap-3">
          <input className={inputCls} placeholder="New section title" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
          <button className={`${btnSecondary} shrink-0`} disabled={!newSection.trim()}>Add section</button>
        </form>
      </div>

      <CourseEnrollments courseId={courseId} />

      {materialModal && (
        <MaterialModal
          courseId={courseId}
          section={materialModal.section}
          material={materialModal.material}
          onClose={() => setMaterialModal(null)}
          onSaved={() => { setMaterialModal(null); load(); }}
        />
      )}
    </div>
  );
}

function MaterialModal({ courseId, section, material, onClose, onSaved }) {
  const editing = !!material;
  const [form, setForm] = useState({
    type: material ? material.type : 'video',
    title: material ? material.title : '',
    description: material ? material.description || '' : '',
    externalUrl: material ? material.externalUrl || '' : '',
    body: material ? material.body || '' : '',
    isPreview: material ? !!material.isPreview : false,
    downloadable: material ? !!material.downloadable : false,
  });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const isFileType = FILE_TYPES.includes(form.type);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const pickFile = (f) => {
    setFile(f || null);
    if (f && !form.title) setForm((x) => ({ ...x, title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isFileType && !file && !(material && material.file && material.file.storageKey && material.type === form.type)) {
      toast.error('Please choose a file to upload');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form };
      if (isFileType && file) {
        const contentType = file.type || 'application/octet-stream';
        const [{ data: target }, durationSec] = await Promise.all([
          lmsAdminAPI.post(`/courses/${courseId}/upload-url`, { fileName: file.name, contentType, purpose: 'material' }),
          readDuration(file),
        ]);
        setProgress(0);
        await uploadFile({ ...target, headers: { 'Content-Type': contentType } }, file, setProgress);
        payload.file = { storageKey: target.storageKey, originalName: file.name, mimeType: contentType, durationSec };
      }
      if (editing) await lmsAdminAPI.put(`/materials/${material._id}`, payload);
      else await lmsAdminAPI.post(`/sections/${section._id}/materials`, payload);
      toast.success(editing ? 'Material updated' : 'Material added');
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4" onClick={() => !busy && onClose()}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{editing ? 'Edit material' : `Add material to "${section.title}"`}</h3>
          <button type="button" disabled={busy} onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close">×</button>
        </div>

        <label className="block"><Label>Type</Label>
          <select className={inputCls} value={form.type} onChange={set('type')} disabled={busy}>
            {Object.entries(TYPE_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>

        {isFileType && (
          <label className="block"><Label>File</Label>
            <input type="file" accept={ACCEPT[form.type]} disabled={busy} onChange={(e) => pickFile(e.target.files[0])} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700" />
            {editing && material.file && material.file.originalName && !file && (
              <span className="block text-xs text-slate-500 mt-1">Current: {material.file.originalName} — choose a file only to replace it.</span>
            )}
            {file && <span className="block text-xs text-slate-500 mt-1">{formatBytes(file.size)}</span>}
          </label>
        )}

        <label className="block"><Label>Title</Label><input required className={inputCls} value={form.title} onChange={set('title')} disabled={busy} /></label>
        {form.type === 'link' && <label className="block"><Label>URL</Label><input required type="url" className={inputCls} value={form.externalUrl} onChange={set('externalUrl')} placeholder="https://" disabled={busy} /></label>}
        {form.type === 'text' && <label className="block"><Label>Content</Label><textarea rows={8} className={inputCls} value={form.body} onChange={set('body')} disabled={busy} /></label>}
        <label className="block"><Label>Description (optional)</Label><textarea rows={3} className={inputCls} value={form.description} onChange={set('description')} disabled={busy} /></label>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isPreview} onChange={set('isPreview')} disabled={busy} className="w-4 h-4" /> Free preview (anyone can view before buying)</label>
          {isFileType && <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.downloadable} onChange={set('downloadable')} disabled={busy} className="w-4 h-4" /> Learners can download this file</label>}
        </div>

        {progress !== null && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1"><span>Uploading…</span><span>{progress}%</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className={btnSecondary}>Cancel</button>
          <button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : editing ? 'Save' : 'Add material'}</button>
        </div>
      </form>
    </div>
  );
}

function CourseEnrollments({ courseId }) {
  const [list, setList] = useState(null);
  const load = useCallback(() => {
    lmsAdminAPI.get('/enrollments', { params: { course: courseId, limit: 100 } }).then((r) => setList(r.data.enrollments)).catch(() => setList([]));
  }, [courseId]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (e, status) => {
    if (status === 'revoked' && !window.confirm('Remove this learner\'s access to the course? This does not refund them.')) return;
    try {
      await lmsAdminAPI.patch(`/enrollments/${e._id}`, { status });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (!list) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-slate-900">Enrolled learners ({list.length})</h3>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">Nobody has enrolled yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {list.map((e) => (
            <li key={e._id} className="py-2.5 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex-1 min-w-[180px]">
                <span className="font-semibold text-slate-800">{e.learner ? `${e.learner.firstName} ${e.learner.lastName}` : 'Deleted learner'}</span>
                <span className="block text-xs text-slate-500">{e.learner && e.learner.email} · {e.source.replace('_', ' ')} · {formatDate(e.createdAt)}</span>
              </span>
              <span className="text-xs text-slate-500">{e.progressPercent}% done</span>
              <Pill value={e.status} />
              {e.status === 'active' && <button onClick={() => setStatus(e, 'revoked')} className="text-xs font-bold text-rose-600 hover:underline">Revoke</button>}
              {e.status === 'revoked' && <button onClick={() => setStatus(e, 'active')} className="text-xs font-bold text-emerald-600 hover:underline">Restore</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
