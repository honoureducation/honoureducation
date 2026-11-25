import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { learnerAPI, errorMessage, formatPrice, formatDuration } from '../api';
import { useLearner } from '../LearnerContext';
import { Spinner, EmptyState, Thumb, TypeIcon, TYPE_LABEL, btnPrimary } from '../components';
import MaterialViewer from './MaterialViewer';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { learner } = useLearner();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (params.get('checkout') === 'cancelled') toast.info('Checkout cancelled — you have not been charged.');
  }, [params]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    learnerAPI
      .get(`/courses/${slug}`)
      .then((r) => alive && (setCourse(r.data.course), setEnrolled(r.data.enrolled), setError('')))
      .catch((e) => alive && setError(errorMessage(e, 'Course not found')))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [slug, learner]);

  const openPreview = async (m) => {
    try {
      const { data } = await learnerAPI.get(`/courses/${slug}/materials/${m._id}`);
      setPreview(data.material);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const buy = async () => {
    if (!learner) {
      navigate(`/learn/login?next=${encodeURIComponent(`/learn/courses/${slug}`)}`);
      return;
    }
    setBusy(true);
    try {
      if (course.isFree || !course.price) {
        await learnerAPI.post(`/courses/${slug}/enroll-free`);
        toast.success('You are enrolled!');
        navigate(`/learn/my-courses/${slug}`);
      } else {
        const { data } = await learnerAPI.post('/checkout', { courseId: course._id });
        window.location.assign(data.url);
        return;
      }
    } catch (e) {
      toast.error(errorMessage(e, 'Could not start checkout'));
    }
    setBusy(false);
  };

  if (loading) return <Spinner />;
  if (error || !course)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState title="Course not found" action={<Link className={btnPrimary} to="/learn">Browse courses</Link>}>{error}</EmptyState>
      </div>
    );

  const total = course.curriculum.reduce((n, s) => n + s.materials.length, 0);

  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-[1fr_380px] items-start">
          <div>
            <Link to="/learn" className="text-sm text-slate-400 hover:text-white">← All courses</Link>
            {course.category && <p className="mt-4 text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">{course.category}</p>}
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{course.title}</h1>
            {course.shortDescription && <p className="mt-4 text-lg text-slate-300 max-w-2xl">{course.shortDescription}</p>}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <span>{total} lesson{total === 1 ? '' : 's'}</span>
              {course.totalDurationSec > 0 && <span>{formatDuration(course.totalDurationSec)} of video</span>}
              {course.level && course.level !== 'all' && <span className="capitalize">{course.level}</span>}
              <span>Lifetime access</span>
            </div>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video"><Thumb url={course.thumbnailUrl} title={course.title} /></div>
            <div className="p-6">
              {enrolled ? (
                <>
                  <p className="text-emerald-600 font-bold">You own this course</p>
                  <Link to={`/learn/my-courses/${course.slug}`} className={`${btnPrimary} w-full mt-4`}>Go to course</Link>
                </>
              ) : (
                <>
                  <p className="text-3xl font-black">{formatPrice(course)}</p>
                  <p className="text-sm text-slate-500 mt-1">One-time payment · lifetime access</p>
                  <button onClick={buy} disabled={busy} className={`${btnPrimary} w-full mt-5 py-3 text-base`}>
                    {busy ? 'Please wait…' : course.isFree || !course.price ? 'Enrol for free' : 'Buy now'}
                  </button>
                  {!course.isFree && course.price > 0 && (
                    <p className="text-xs text-slate-400 mt-3 text-center">Secure payment by Stripe · cards, Apple Pay and Google Pay</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {course.description && (
            <section>
              <h2 className="text-xl font-black text-slate-900">About this course</h2>
              <div className="mt-4 text-slate-700 leading-relaxed whitespace-pre-line">{course.description}</div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-black text-slate-900">Course content</h2>
            <div className="mt-4 space-y-4">
              {course.curriculum.length === 0 && <p className="text-slate-500">Content is being added.</p>}
              {course.curriculum.map((s) => (
                <div key={s._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">{s.title}</div>
                  <ul className="divide-y divide-slate-100">
                    {s.materials.map((m) => (
                      <li key={m._id} className="px-5 py-3 flex items-center gap-3 text-sm">
                        <span className="text-slate-400"><TypeIcon type={m.type} /></span>
                        <span className="flex-1 text-slate-700">{m.title}</span>
                        <span className="text-xs text-slate-400">{TYPE_LABEL[m.type]}{m.durationSec ? ` · ${formatDuration(m.durationSec)}` : ''}</span>
                        {m.isPreview && !enrolled && (
                          <button onClick={() => openPreview(m)} className="text-xs font-bold text-blue-600 hover:underline">Preview</button>
                        )}
                        {!m.isPreview && !enrolled && (
                          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-label="Locked">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Preview · {preview.title}</h3>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none" aria-label="Close">×</button>
            </div>
            <div className="p-5"><MaterialViewer material={preview} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
