// Dropdown at the top of the admin sidebar to switch between the existing
// assessment dashboard and the course store dashboard.
import React, { useEffect, useRef, useState } from 'react';

export const WORKSPACES = [
  {
    id: 'assessments',
    label: 'Assessments',
    description: 'Teachers, students & records',
    icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    tone: 'bg-indigo-500',
  },
  {
    id: 'courses',
    label: 'Courses',
    description: 'Catalogue, sales & learners',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    tone: 'bg-emerald-500',
  },
];

const WS_KEY = 'admin_workspace';

export const readWorkspace = () => {
  try {
    return localStorage.getItem(WS_KEY) === 'courses' ? 'courses' : 'assessments';
  } catch (e) {
    return 'assessments';
  }
};

export const saveWorkspace = (ws) => {
  try { localStorage.setItem(WS_KEY, ws); } catch (e) { /* ignore */ }
};

const Glyph = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

export default function WorkspaceSwitcher({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = WORKSPACES.find((w) => w.id === value) || WORKSPACES[0];

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mb-6">
      <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2.5 text-left hover:border-slate-500 hover:bg-slate-800 transition-colors"
      >
        <span className={`shrink-0 w-8 h-8 rounded-lg ${current.tone} text-white flex items-center justify-center`}>
          <Glyph d={current.icon} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-white leading-tight">{current.label}</span>
          <span className="block text-[11px] text-slate-400 truncate">{current.description}</span>
        </span>
        <Glyph d="M8 9l4-4 4 4m0 6l-4 4-4-4" className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul role="listbox" className="absolute z-50 mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-2xl shadow-black/40">
          {WORKSPACES.map((w) => {
            const selected = w.id === current.id;
            return (
              <li key={w.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setOpen(false);
                    if (!selected) onChange(w.id);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${selected ? 'bg-slate-700/70' : 'hover:bg-slate-700/50'}`}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-lg ${w.tone} text-white flex items-center justify-center`}>
                    <Glyph d={w.icon} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-white leading-tight">{w.label}</span>
                    <span className="block text-[11px] text-slate-400 truncate">{w.description}</span>
                  </span>
                  {selected && <Glyph d="M5 13l4 4L19 7" className="w-4 h-4 text-emerald-400" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
