import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { learnerAPI, errorMessage, formatPrice, formatDuration } from '../api';
import { CourseCard, EmptyState, Thumb } from '../components';
import { useLearner } from '../LearnerContext';

// Where a card or button should send someone: signed-out visitors sign in first
// and come back to the course afterwards.
const courseLink = (learner, slug) =>
  learner ? `/learn/courses/${slug}` : `/learn/login?next=${encodeURIComponent(`/learn/courses/${slug}`)}`;

const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  infinity: 'M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z',
  device: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  play: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  cursor: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  check: 'M5 13l4 4L19 7',
};

const TRUST = [
  { icon: 'lock', label: 'Secure checkout by Stripe' },
  { icon: 'infinity', label: 'Pay once, keep forever' },
  { icon: 'device', label: 'Learn on any device' },
  { icon: 'globe', label: 'Pay in AED, SAR, QAR, KWD & more' },
];

const STEPS = [
  { icon: 'cursor', title: 'Pick a course', text: 'Browse the catalogue and watch the free preview lessons before you decide.' },
  { icon: 'card', title: 'Pay once, securely', text: 'Check out with card, Apple Pay or Google Pay. No subscription, no hidden fees.' },
  { icon: 'play', title: 'Start learning instantly', text: 'Your course unlocks straight away. Learn at your own pace and pick up where you left off.' },
];

const FEATURES = [
  { icon: 'play', title: 'Video lessons', text: 'Clear, focused lessons you can pause, replay and revisit any time.' },
  { icon: 'download', title: 'Downloadable resources', text: 'Worksheets, PDFs and notes to practise with offline.' },
  { icon: 'chart', title: 'Track your progress', text: 'See exactly how far you have come and resume from your last lesson.' },
  { icon: 'eye', title: 'Try before you buy', text: 'Many courses include free preview lessons so you know what to expect.' },
];

const FAQS = [
  { q: 'How long do I have access to a course?', a: 'For life. You pay once and the course stays in “My courses” for as long as your account is active, including any updates.' },
  { q: 'Which payment methods can I use?', a: 'All major debit and credit cards, plus Apple Pay and Google Pay where your device supports them. Payments are processed securely by Stripe — we never see your card details.' },
  { q: 'Which currencies are supported?', a: 'Prices are shown in the currency set for each course, such as UAE Dirham, Saudi Riyal, Qatari Riyal, Kuwaiti Dinar, Bahraini Dinar, Omani Rial or US Dollar. Your bank handles any conversion.' },
  { q: 'Can I learn on my phone?', a: 'Yes. Courses work in any modern browser on phones, tablets and computers. Your progress syncs across devices.' },
  { q: 'I have a question that is not answered here.', a: 'We are happy to help — send us a message from the Contact page and our team will get back to you.' },
];

function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-video bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-5 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

function FeaturedCourse({ course, learner }) {
  return (
    <Link
      to={courseLink(learner, course.slug)}
      className="group block bg-white/10 backdrop-blur-md rounded-3xl p-3 border border-white/15 shadow-2xl shadow-blue-950/50 hover:bg-white/15 transition-colors"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden">
        <Thumb url={course.thumbnailUrl} title={course.title} className="group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950 shadow">★ Featured</span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full bg-white/90 text-blue-700 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </span>
      </div>
      <div className="px-3 pt-4 pb-2 text-white">
        {course.category && <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-300">{course.category}</p>}
        <p className="mt-1 text-lg font-extrabold leading-snug">{course.title}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-300">
            {course.materialCount} lessons{course.totalDurationSec ? ` · ${formatDuration(course.totalDurationSec)}` : ''}
          </span>
          <span className="rounded-xl bg-white px-3 py-1.5 text-sm font-black text-slate-900">{formatPrice(course)}</span>
        </div>
      </div>
    </Link>
  );
}

function HeroArt() {
  // Shown when there is no course to feature yet.
  return (
    <div className="relative mx-auto w-full max-w-md aspect-square">
      <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 rotate-6 opacity-60" />
      <div className="absolute inset-6 rounded-[2.5rem] bg-white/10 backdrop-blur border border-white/20 -rotate-3 flex flex-col justify-center gap-4 p-8">
        {['Watch', 'Practise', 'Progress'].map((t, i) => (
          <div key={t} className="flex items-center gap-4 rounded-2xl bg-white/90 p-4 shadow-lg" style={{ marginLeft: `${i * 18}px` }}>
            <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Icon d={ICONS[['play', 'download', 'chart'][i]]} />
            </span>
            <span className="font-bold text-slate-800">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Catalog() {
  const { learner } = useLearner();
  const [data, setData] = useState({ courses: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [featured, setFeatured] = useState(null);
  const coursesRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    learnerAPI
      .get('/courses', { params: { search: query || undefined, category: category || undefined } })
      .then((r) => {
        if (!alive) return;
        setData(r.data);
        setError('');
        // Feature the newest course from the unfiltered list.
        if (!query && !category) setFeatured(r.data.courses[0] || null);
      })
      .catch((e) => alive && setError(errorMessage(e, 'Could not load courses')))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [query, category]);

  const filtering = !!(query || category);
  const freeCount = useMemo(() => data.courses.filter((c) => c.isFree || !c.price).length, [data.courses]);

  const scrollToCourses = () => coursesRef.current && coursesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setQuery(search.trim());
    scrollToCourses();
  };

  return (
    <div className="bg-slate-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-blue-600/40 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute top-20 -right-24 w-[26rem] h-[26rem] rounded-full bg-indigo-600/40 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 w-[24rem] h-[24rem] rounded-full bg-cyan-500/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid gap-14 lg:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Honour Education Online Courses
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
              Learn new skills.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Go further, faster.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
              Courses from the educators behind Honour Education. Pay once, keep lifetime access and learn at your own pace, on any device.
            </p>

            <form onSubmit={onSearchSubmit} className="mt-8 flex max-w-xl rounded-2xl bg-white p-1.5 shadow-2xl shadow-blue-950/40 focus-within:ring-4 focus-within:ring-blue-500/30">
              <span className="pl-3 flex items-center text-slate-400"><Icon d={ICONS.search} /></span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What do you want to learn?"
                aria-label="Search courses"
                className="flex-1 min-w-0 bg-transparent px-3 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button className="rounded-xl bg-blue-600 px-5 sm:px-6 font-bold text-white hover:bg-blue-700 transition-colors">Search</button>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <button onClick={scrollToCourses} className="inline-flex items-center gap-2 font-bold text-white hover:text-blue-300 transition-colors">
                Explore all courses <span aria-hidden="true">↓</span>
              </button>
              {!loading && data.courses.length > 0 && !filtering && (
                <span className="text-slate-400">
                  {data.courses.length} course{data.courses.length === 1 ? '' : 's'} available
                  {freeCount > 0 ? ` · ${freeCount} free` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:block">
            {featured ? <FeaturedCourse course={featured} learner={learner} /> : <HeroArt />}
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="shrink-0 w-9 h-9 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center"><Icon d={ICONS[t.icon]} className="w-4 h-4" /></span>
                <span className="font-semibold leading-tight">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses ──────────────────────────────────────────────────────── */}
      <section ref={coursesRef} className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Course catalogue</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {query ? <>Results for “{query}”</> : category ? category : 'Find your next course'}
            </h2>
          </div>
          {filtering && (
            <button
              onClick={() => { setSearch(''); setQuery(''); setCategory(''); }}
              className="self-start md:self-auto text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              Clear filters ✕
            </button>
          )}
        </div>

        {data.categories.length > 0 && (
          <div className="mt-6 -mx-4 px-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {['', ...data.categories].map((c) => (
              <button
                key={c || 'all'}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  category === c
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                {c || 'All courses'}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <EmptyState title="Courses are unavailable right now">{error}</EmptyState>
          ) : data.courses.length === 0 ? (
            filtering ? (
              <EmptyState title="No courses match your search">Try a different word, or browse all courses.</EmptyState>
            ) : (
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 sm:p-14 text-center text-white shadow-xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Coming soon</p>
                <h3 className="mt-3 text-3xl font-black">New courses are launching soon</h3>
                <p className="mt-3 text-blue-100 max-w-lg mx-auto">We are preparing our first courses. Get in touch to hear as soon as they are available.</p>
                <Link to="/contact" className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-blue-700 hover:bg-blue-50">Contact us</Link>
              </div>
            )
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.courses.map((c) => (
                <CourseCard key={c._id} course={c} to={courseLink(learner, c.slug)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">How it works</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Start learning in three simple steps</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center px-4">
                <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/30">
                  <Icon d={ICONS[s.icon]} className="w-8 h-8" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 text-sm font-black flex items-center justify-center ring-4 ring-white">{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-slate-500 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why learn with us ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Why Honour Education</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Everything you need to learn with confidence</h2>
            <p className="mt-4 text-lg text-slate-500 leading-relaxed">
              Built by educators who assess and teach learners every day — so every course is practical, structured and easy to follow.
            </p>
            <ul className="mt-6 space-y-3">
              {['No subscription — buy only what you need', 'Instant access right after payment', 'Receipts emailed for every purchase'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Icon d={ICONS.check} className="w-3.5 h-3.5" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-3xl p-6 border transition-all hover:-translate-y-1 hover:shadow-xl ${
                  i === 0 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200'
                }`}
              >
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i === 0 ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                  <Icon d={ICONS[f.icon]} className="w-6 h-6" />
                </span>
                <h3 className={`mt-5 text-lg font-extrabold ${i === 0 ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                <p className={`mt-2 leading-relaxed ${i === 0 ? 'text-slate-300' : 'text-slate-500'}`}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">FAQ</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Questions? We have answers</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className={`rounded-2xl border transition-colors ${open ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-slate-900"
                  >
                    {f.q}
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform ${open ? 'bg-blue-600 text-white rotate-45' : 'bg-slate-100 text-slate-500'}`}>+</span>
                  </button>
                  {open && (
                    <p className="px-5 pb-5 -mt-1 text-slate-600 leading-relaxed">
                      {f.a}
                      {i === FAQS.length - 1 && (
                        <> <Link to="/contact" className="font-bold text-blue-600 hover:underline">Contact us →</Link></>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final call to action ─────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 px-6 py-14 sm:px-14 text-center text-white shadow-2xl shadow-indigo-900/30">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-300/20 blur-2xl" />
          <h2 className="relative text-3xl sm:text-4xl font-black tracking-tight">Your next skill is one click away</h2>
          <p className="relative mt-4 text-lg text-blue-100 max-w-xl mx-auto">Choose a course today and start learning in minutes — with lifetime access to everything inside.</p>
          <button
            onClick={() => { setCategory(''); setSearch(''); setQuery(''); scrollToCourses(); }}
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-black text-indigo-700 shadow-lg hover:bg-blue-50 hover:-translate-y-0.5 transition-all"
          >
            Browse courses <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
