// Guided "Create course" flow: Basics → Price → Cover → Lessons → Publish.
// The course is saved as a draft after the first step, so nothing is lost if the
// admin leaves half-way; it can be finished later from the Courses list.
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { lmsAdminAPI, errorMessage, formatMoney, currencyDecimals, formatDuration, formatBytes } from '../api';
import { CourseCard, TypeIcon, TYPE_LABEL, inputCls } from '../components';
import LessonUploader from './LessonUploader';
import { uploadThumbnail } from './uploadHelpers';

const STEPS = [
  { id: 'basics', label: 'Basics', hint: 'Name & description' },
  { id: 'price', label: 'Price', hint: 'Free or paid' },
  { id: 'cover', label: 'Cover', hint: 'Course image' },
  { id: 'lessons', label: 'Lessons', hint: 'Upload content' },
  { id: 'publish', label: 'Publish', hint: 'Review & go live' },
];

const LEVELS = [
  { id: 'all', label: 'All levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const QUICK_PRICES = { aed: [49, 99, 199, 299, 499], sar: [49, 99, 199, 299, 499], qar: [49, 99, 199, 299, 499], usd: [19, 29, 49, 99, 149], kwd: [5, 10, 15, 25, 40], bhd: [5, 10, 20, 30, 50], omr: [5, 10, 20, 30, 50] };

const FALLBACK_CURRENCIES = [
  { id: 'aed', code: 'AED', label: 'UAE Dirham' },
  { id: 'sar', code: 'SAR', label: 'Saudi Riyal' },
  { id: 'qar', code: 'QAR', label: 'Qatari Riyal' },
  { id: 'kwd', code: 'KWD', label: 'Kuwaiti Dinar' },
  { id: 'bhd', code: 'BHD', label: 'Bahraini Dinar' },
  { id: 'omr', code: 'OMR', label: 'Omani Rial' },
  { id: 'usd', code: 'USD', label: 'US Dollar' },
];

const Glyph = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const CHECK = 'M5 13l4 4L19 7';

const Label = ({ children, hint }) => (
  <span className="block mb-1.5">
    <span className="text-sm font-bold text-slate-800">{children}</span>
    {hint && <span className="block text-xs text-slate-500 mt-0.5">{hint}</span>}
  </span>
);

const primaryBtn = 'inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
const ghostBtn = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors';

const emptyForm = (currency) => ({
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  level: 'all',
  isFree: false,
  currency: currency || 'aed',
  price: '',
});

export default function CourseWizard({ meta, onOpenEditor, onExit }) {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [form, setForm] = useState(() => emptyForm(meta && meta.defaultCurrency));
  const [course, setCourse] = useState(null); // saved draft
  const [section, setSection] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [finished, setFinished] = useState(null); // 'published' | 'draft'
  const coverInput = useRef(null);
  const titleRef = useRef(null);

  const currencies = (meta && meta.currencies) || FALLBACK_CURRENCIES;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    lmsAdminAPI
      .get('/courses')
      .then((r) => setCategories([...new Set(r.data.courses.map((c) => c.category).filter(Boolean))]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (meta && meta.defaultCurrency && !course) setForm((f) => ({ ...f, currency: f.currency || meta.defaultCurrency }));
  }, [meta, course]);

  useEffect(() => {
    if (step === 0 && titleRef.current) titleRef.current.focus();
  }, [step]);

  const goTo = (i) => {
    setStep(i);
    setMaxStep((m) => Math.max(m, i));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const priceError = (() => {
    if (form.isFree) return '';
    if (form.price === '') return 'Enter a price or choose Free';
    const n = Number(form.price);
    if (!Number.isFinite(n) || n <= 0) return 'Price must be more than 0';
    if (!/^\d+(\.\d{1,2})?$/.test(String(form.price).trim())) return 'Use at most 2 decimal places';
    return '';
  })();

  // Save whatever the admin has entered so far (creates the draft on first save).
  const save = async (fields) => {
    if (!course) {
      const { data } = await lmsAdminAPI.post('/courses', fields);
      setCourse(data.course);
      return data.course;
    }
    const { data } = await lmsAdminAPI.put(`/courses/${course._id}`, fields);
    setCourse((c) => ({ ...c, ...data.course }));
    return data.course;
  };

  const next = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (step === 0) {
        if (!form.title.trim()) {
          toast.error('Give your course a title');
          setBusy(false);
          return;
        }
        await save({
          title: form.title,
          shortDescription: form.shortDescription,
          description: form.description,
          category: form.category,
          level: form.level,
          ...(course ? {} : { currency: form.currency }),
        });
      } else if (step === 1) {
        if (priceError) {
          toast.error(priceError);
          setBusy(false);
          return;
        }
        await save({ isFree: form.isFree, currency: form.currency, ...(form.isFree ? {} : { price: form.price }) });
      } else if (step === 2 && !section) {
        // Prepare a section for the lessons step.
        const { data } = await lmsAdminAPI.post(`/courses/${course._id}/sections`, { title: 'Lessons' });
        setSection(data.section);
      }
      goTo(step + 1);
    } catch (e) {
      toast.error(errorMessage(e));
    }
    setBusy(false);
  };

  const pickCover = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image (JPG or PNG)');
      return;
    }
    setCoverBusy(true);
    try {
      const updated = await uploadThumbnail(course._id, file);
      setCourse((c) => ({ ...c, ...updated }));
      toast.success('Cover image added');
    } catch (e) {
      toast.error(errorMessage(e, 'Upload failed'));
    }
    setCoverBusy(false);
  };

  const renameSection = async (title) => {
    if (!section || !title.trim() || title === section.title) return;
    try {
      const { data } = await lmsAdminAPI.put(`/sections/${section._id}`, { title });
      setSection(data.section);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const togglePreview = async (m) => {
    try {
      const { data } = await lmsAdminAPI.put(`/materials/${m._id}`, { isPreview: !m.isPreview });
      setLessons((list) => list.map((l) => (l._id === m._id ? data.material : l)));
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const removeLesson = async (m) => {
    try {
      await lmsAdminAPI.delete(`/materials/${m._id}`);
      setLessons((list) => list.filter((l) => l._id !== m._id));
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const finish = async (publish) => {
    setBusy(true);
    try {
      if (publish) await save({ status: 'published' });
      setFinished(publish ? 'published' : 'draft');
    } catch (e) {
      toast.error(errorMessage(e));
    }
    setBusy(false);
  };

  const restart = () => {
    setStep(0);
    setMaxStep(0);
    setForm(emptyForm(meta && meta.defaultCurrency));
    setCourse(null);
    setSection(null);
    setLessons([]);
    setFinished(null);
  };

  // Live preview of the catalogue card.
  const previewCourse = {
    title: form.title || 'Your course title',
    shortDescription: form.shortDescription || 'A short, catchy description appears here.',
    category: form.category,
    level: form.level,
    isFree: form.isFree,
    price: form.isFree ? 0 : Math.round((Number(form.price) || 0) * 10 ** currencyDecimals(form.currency)),
    currency: form.currency,
    thumbnailUrl: course && course.thumbnailUrl,
    materialCount: lessons.length,
    totalDurationSec: lessons.reduce((n, l) => n + ((l.file && l.file.durationSec) || 0), 0),
    previewCount: lessons.filter((l) => l.isPreview).length,
  };

  const checks = [
    { ok: !!form.title.trim(), label: 'Course title' },
    { ok: form.isFree || !priceError, label: form.isFree ? 'Free course' : 'Price set' },
    { ok: lessons.length > 0, label: `At least one lesson (${lessons.length} added)` },
    { ok: !!(course && course.thumbnailUrl), label: 'Cover image', optional: true },
    { ok: !!form.shortDescription.trim(), label: 'Short description', optional: true },
  ];
  const canPublish = checks.filter((c) => !c.optional).every((c) => c.ok);

  // ── Finished screen ──
  if (finished) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 lg:p-12 text-center">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${finished === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
          <Glyph d={CHECK} className="w-8 h-8" />
        </div>
        <h2 className="mt-5 text-2xl lg:text-3xl font-black text-slate-900">
          {finished === 'published' ? 'Your course is live! 🎉' : 'Saved as a draft'}
        </h2>
        <p className="mt-3 text-slate-600">
          {finished === 'published'
            ? <>“{course.title}” is now on the storefront and learners can {form.isFree ? 'enrol' : 'buy it'} straight away.</>
            : <>“{course.title}” is saved. Publish it from the Courses list when you are ready.</>}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {finished === 'published' && (
            <a href={`/learn/courses/${course.slug}`} target="_blank" rel="noopener noreferrer" className={primaryBtn}>View on storefront ↗</a>
          )}
          <button onClick={() => onOpenEditor(course._id)} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50">
            Edit course details
          </button>
          <button onClick={restart} className={ghostBtn}>+ Create another</button>
          <button onClick={onExit} className={ghostBtn}>Back to courses</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-5">
        <ol className="flex items-center gap-2 overflow-x-auto">
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            const reachable = i <= maxStep && !busy;
            return (
              <li key={s.id} className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && goTo(i)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors ${current ? 'bg-emerald-50' : reachable ? 'hover:bg-slate-50' : ''}`}
                >
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${
                    done ? 'bg-emerald-500 text-white' : current ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? <Glyph d={CHECK} className="w-4 h-4" /> : i + 1}
                  </span>
                  <span className="hidden md:block">
                    <span className={`block text-sm font-bold ${current || done ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                    <span className="block text-[11px] text-slate-400">{s.hint}</span>
                  </span>
                </button>
                {i < STEPS.length - 1 && <span className={`w-6 lg:w-10 h-0.5 rounded ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px] items-start">
        {/* Step body */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Let’s start with the basics</h2>
                <p className="mt-1 text-slate-500">You can change all of this later.</p>
              </div>
              <label className="block">
                <Label hint="Clear and specific works best, e.g. “IELTS Speaking: Band 7 in 30 Days”">Course title *</Label>
                <input ref={titleRef} className={`${inputCls} text-lg font-semibold`} maxLength={200} value={form.title} onChange={(e) => set('title', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && next()} placeholder="e.g. Confident English Speaking" />
              </label>
              <label className="block">
                <Label hint="One sentence shown on the course card">Short description</Label>
                <input className={inputCls} maxLength={300} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="e.g. Speak fluently in everyday situations with daily video practice" />
                <span className="block mt-1 text-right text-[11px] text-slate-400">{form.shortDescription.length}/300</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="block">
                  <Label hint="Groups courses on the storefront">Category</Label>
                  <input className={inputCls} list="lms-categories" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. IELTS, Phonics, Grammar" />
                  <datalist id="lms-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </label>
                <div>
                  <Label hint="Who is this course for?">Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => (
                      <button key={l.id} type="button" onClick={() => set('level', l.id)}
                        className={`rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${form.level === l.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <label className="block">
                <Label hint="What will learners achieve? Who is it for? What is included?">Full description</Label>
                <textarea rows={6} className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder={'In this course you will:\n• …\n• …'} />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">How much does it cost?</h2>
                <p className="mt-1 text-slate-500">Learners pay once and keep lifetime access.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { free: false, title: 'Paid course', text: 'Learners pay once by card, Apple Pay or Google Pay', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                  { free: true, title: 'Free course', text: 'Anyone with an account can enrol at no cost', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
                ].map((o) => {
                  const active = form.isFree === o.free;
                  return (
                    <button key={o.title} type="button" onClick={() => set('isFree', o.free)}
                      className={`text-left rounded-2xl border-2 p-5 transition-all ${active ? 'border-emerald-500 bg-emerald-50/60 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Glyph d={o.icon} /></span>
                      <span className="mt-3 block font-extrabold text-slate-900">{o.title}</span>
                      <span className="mt-1 block text-sm text-slate-500">{o.text}</span>
                    </button>
                  );
                })}
              </div>

              {!form.isFree && (
                <div className="rounded-2xl bg-slate-50 p-5 space-y-4">
                  <div className="grid sm:grid-cols-[200px_1fr] gap-4">
                    <label className="block">
                      <Label>Currency</Label>
                      <select className={inputCls} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                        {currencies.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.label}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <Label>Price</Label>
                      <div className="flex rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden">
                        <span className="px-4 flex items-center bg-slate-100 text-sm font-bold text-slate-600">{form.currency.toUpperCase()}</span>
                        <input type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0.00"
                          className="flex-1 min-w-0 px-4 py-2.5 text-lg font-bold text-slate-900 focus:outline-none" />
                      </div>
                    </label>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">Popular prices</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(QUICK_PRICES[form.currency] || QUICK_PRICES.aed).map((p) => (
                        <button key={p} type="button" onClick={() => set('price', String(p))}
                          className={`rounded-full px-4 py-1.5 text-sm font-bold border transition-colors ${Number(form.price) === p ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'}`}>
                          {form.currency.toUpperCase()} {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  {priceError && form.price !== '' && <p className="text-sm font-semibold text-rose-600">{priceError}</p>}
                </div>
              )}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
                {form.isFree
                  ? 'Learners will enrol for free.'
                  : priceError
                    ? 'Learners will see the price on the course card and course page.'
                    : <>Learners will pay <strong>{formatMoney(previewCourse.price, form.currency)}</strong> once. Stripe fees are deducted from each payment.</>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Add a cover image</h2>
                <p className="mt-1 text-slate-500">Courses with an eye-catching image get far more clicks. A 16:9 image (e.g. 1280×720) works best.</p>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => !coverBusy && coverInput.current && coverInput.current.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && coverInput.current && coverInput.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); pickCover(e.dataTransfer.files[0]); }}
                className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
              >
                {course && course.thumbnailUrl ? (
                  <>
                    <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-slate-800 shadow">Replace image</span>
                  </>
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <span className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                      <Glyph d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-7 h-7" />
                    </span>
                    <span className="mt-3 font-bold text-slate-800">{coverBusy ? 'Uploading…' : 'Drag an image here or click to choose'}</span>
                    <span className="mt-1 text-xs text-slate-500">JPG or PNG</span>
                  </span>
                )}
                {coverBusy && <span className="absolute inset-0 bg-white/70 flex items-center justify-center font-bold text-slate-700">Uploading…</span>}
                <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(e) => { pickCover(e.target.files[0]); e.target.value = ''; }} />
              </div>
              <p className="text-xs text-slate-500">No image? You can skip this — we will show a coloured card with your course title.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Upload your lessons</h2>
                <p className="mt-1 text-slate-500">Drop in your videos, PDFs and worksheets — each file becomes a lesson, in the order you add them.</p>
              </div>
              {section && (
                <label className="block max-w-sm">
                  <Label hint="You can add more sections later in the course editor">Section name</Label>
                  <input className={inputCls} defaultValue={section.title} onBlur={(e) => renameSection(e.target.value)} />
                </label>
              )}
              {section && course && (
                <LessonUploader courseId={course._id} sectionId={section._id} onAdded={(m) => setLessons((l) => [...l, m])} />
              )}
              {lessons.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Lessons in this course ({lessons.length})</h3>
                    <span className="text-xs text-slate-500">Tick <strong>Free preview</strong> to let visitors try a lesson before buying</span>
                  </div>
                  <ul className="mt-3 rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {lessons.map((m, i) => (
                      <li key={m._id} className="px-4 py-3 flex items-center gap-3 text-sm">
                        <span className="w-6 text-center text-xs font-black text-slate-400">{i + 1}</span>
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><TypeIcon type={m.type} /></span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-slate-800 truncate">{m.title}</span>
                          <span className="block text-xs text-slate-500">
                            {TYPE_LABEL[m.type]}
                            {m.file && m.file.durationSec ? ` · ${formatDuration(m.file.durationSec)}` : ''}
                            {m.file && m.file.sizeBytes ? ` · ${formatBytes(m.file.sizeBytes)}` : ''}
                          </span>
                        </span>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={!!m.isPreview} onChange={() => togglePreview(m)} className="w-4 h-4 accent-emerald-600" />
                          Free preview
                        </label>
                        <button onClick={() => removeLesson(m)} className="text-xs font-bold text-rose-600 hover:underline">Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-slate-500">Want to add a web link or a written lesson? You can do that later from <strong>Edit course details</strong>.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Ready to go live?</h2>
                <p className="mt-1 text-slate-500">Publishing puts your course on the storefront straight away.</p>
              </div>
              <ul className="space-y-3">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${c.ok ? 'bg-emerald-500 text-white' : c.optional ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                      {c.ok ? <Glyph d={CHECK} className="w-4 h-4" /> : <span className="text-sm font-black">!</span>}
                    </span>
                    <span className={`font-semibold ${c.ok ? 'text-slate-800' : 'text-slate-600'}`}>
                      {c.label}
                      {!c.ok && c.optional && <span className="ml-2 text-xs font-medium text-amber-600">recommended</span>}
                      {!c.ok && !c.optional && <span className="ml-2 text-xs font-medium text-rose-600">required to publish</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {!canPublish && <p className="text-sm text-slate-500">Go back to finish the required steps, or save it as a draft and come back later.</p>}
            </div>
          )}

          {/* Footer navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {step > 0 ? (
                <button onClick={() => goTo(step - 1)} disabled={busy} className={ghostBtn}>← Back</button>
              ) : (
                <button onClick={onExit} disabled={busy} className={ghostBtn}>Cancel</button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {course && step < 4 && <span className="text-xs text-slate-400">✓ Draft saved</span>}
              {step === 2 && !(course && course.thumbnailUrl) && (
                <button onClick={next} disabled={busy || coverBusy} className={ghostBtn}>Skip for now</button>
              )}
              {step < 4 && (
                <button onClick={next} disabled={busy || coverBusy || (step === 0 && !form.title.trim())} className={primaryBtn}>
                  {busy ? 'Saving…' : step === 3 ? (lessons.length ? 'Continue to publish →' : 'Continue →') : 'Continue →'}
                </button>
              )}
              {step === 4 && (
                <>
                  <button onClick={() => finish(false)} disabled={busy} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    Save as draft
                  </button>
                  <button onClick={() => finish(true)} disabled={busy || !canPublish} className={primaryBtn}>
                    {busy ? 'Publishing…' : '🚀 Publish course'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside className="xl:sticky xl:top-24 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Live preview</p>
          <div className="pointer-events-none select-none">
            <CourseCard course={previewCourse} to="#" />
          </div>
          <p className="text-xs text-slate-500">This is how your course appears on the storefront.</p>
        </aside>
      </div>
    </div>
  );
}
