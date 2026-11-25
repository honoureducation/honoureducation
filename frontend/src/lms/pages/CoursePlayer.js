import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { learnerAPI, errorMessage, formatDuration } from '../api';
import { Spinner, EmptyState, ProgressBar, TypeIcon, btnPrimary, btnSecondary } from '../components';
import MaterialViewer from './MaterialViewer';

export default function CoursePlayer() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    learnerAPI
      .get(`/me/courses/${slug}`)
      .then((r) => {
        setCourse(r.data.course);
        setProgress(r.data.progressPercent);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  const flat = useMemo(() => (course ? course.curriculum.flatMap((s) => s.materials) : []), [course]);
  const currentId = params.get('m') || (flat.find((m) => !m.completed) || flat[0] || {})._id;
  const index = flat.findIndex((m) => m._id === currentId);
  const current = flat[index];

  useEffect(() => {
    if (!currentId) return;
    let alive = true;
    setContentLoading(true);
    learnerAPI
      .get(`/me/materials/${currentId}`)
      .then((r) => alive && setContent(r.data.material))
      .catch((e) => alive && (setContent(null), toast.error(errorMessage(e))))
      .finally(() => alive && setContentLoading(false));
    return () => { alive = false; };
  }, [currentId]);

  const go = (id) => {
    setParams({ m: id });
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const patchMaterial = (id, patch) =>
    setCourse((c) => ({
      ...c,
      curriculum: c.curriculum.map((s) => ({ ...s, materials: s.materials.map((m) => (m._id === id ? { ...m, ...patch } : m)) })),
    }));

  const save = useCallback(async (id, body) => {
    try {
      const { data } = await learnerAPI.post(`/me/materials/${id}/progress`, body);
      setProgress(data.progressPercent);
    } catch (e) { /* progress saving is best-effort */ }
  }, []);

  const setCompleted = async (completed) => {
    patchMaterial(current._id, { completed });
    await save(current._id, { completed });
    if (completed && flat[index + 1]) go(flat[index + 1]._id);
  };

  const onPosition = (pos, dur) => {
    const body = { lastPositionSec: pos };
    if (dur && pos / dur >= 0.9 && !current.completed) {
      body.completed = true;
      patchMaterial(current._id, { completed: true });
    }
    save(current._id, body);
  };

  const onEnded = () => {
    if (!current.completed) {
      patchMaterial(current._id, { completed: true });
      save(current._id, { completed: true });
    }
  };

  if (loading) return <Spinner />;
  if (error || !course)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState title="Course unavailable" action={<Link to="/learn/my-courses" className={btnPrimary}>My courses</Link>}>{error}</EmptyState>
      </div>
    );

  const sidebar = (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5"><span>Your progress</span><span>{progress}%</span></div>
        <ProgressBar value={progress} />
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {course.curriculum.map((s) => (
          <div key={s._id}>
            <div className="px-4 py-2.5 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">{s.title}</div>
            {s.materials.map((m) => (
              <button
                key={m._id}
                onClick={() => go(m._id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 text-sm border-b border-slate-100 ${
                  m._id === currentId ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                  {m.completed && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </span>
                <span className="flex-1">
                  <span className="block font-medium leading-snug">{m.title}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <TypeIcon type={m.type} className="w-3.5 h-3.5" />
                    {m.durationSec ? formatDuration(m.durationSec) : m.type}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/learn/my-courses" className="text-sm text-slate-500 hover:text-slate-800">← My courses</Link>
          <h1 className="text-2xl font-black text-slate-900 mt-1">{course.title}</h1>
        </div>
        <button onClick={() => setSidebarOpen((v) => !v)} className={`${btnSecondary} lg:hidden`}>Contents</button>
      </div>

      {flat.length === 0 ? (
        <EmptyState title="No lessons yet">The instructor is still adding content to this course.</EmptyState>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
          <div className={sidebarOpen ? 'hidden lg:block' : ''}>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{current && current.title}</h2>
              {contentLoading ? (
                <Spinner />
              ) : content ? (
                <MaterialViewer material={content} startAt={current && current.lastPositionSec} onPosition={onPosition} onEnded={onEnded} />
              ) : (
                <p className="text-slate-500">This lesson could not be loaded.</p>
              )}
            </div>
            {current && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button disabled={index <= 0} onClick={() => go(flat[index - 1]._id)} className={btnSecondary}>← Previous</button>
                {current.completed ? (
                  <button onClick={() => setCompleted(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-800">Completed ✓ · mark as not done</button>
                ) : (
                  <button onClick={() => setCompleted(true)} className={btnPrimary}>Mark as complete</button>
                )}
                <button disabled={index >= flat.length - 1} onClick={() => go(flat[index + 1]._id)} className={btnSecondary}>Next →</button>
              </div>
            )}
          </div>
          <aside className={sidebarOpen ? '' : 'hidden lg:block'}>{sidebar}</aside>
        </div>
      )}
    </div>
  );
}
