import React from 'react';

/**
 * Year-group selector used across all Primary assessment forms.
 * One clean, evenly spaced grid instead of a wrapping pill row.
 */

// Display label + year subtitle for each stage value used by the forms
const STAGE_META = {
  FS1: { short: 'FS1', sub: 'Nursery' },
  'FS2 - KG1': { short: 'FS2 - KG1', sub: 'Reception' },
  'KG2 / Year 1': { short: 'KG2', sub: 'Year 1' },
  'KG2 / Year 1 (Phase 4 & 5)': { short: 'KG2', sub: 'Phase 4 & 5' },
  'Grade 1 / Year 2': { short: 'Grade 1', sub: 'Year 2' },
  'Grade 2 / Year 3': { short: 'Grade 2', sub: 'Year 3' },
  'Grade 3 / Year 4': { short: 'Grade 3', sub: 'Year 4' },
  'Grade 4 / Year 5': { short: 'Grade 4', sub: 'Year 5' },
  'Grade 5 / Year 6': { short: 'Grade 5', sub: 'Year 6' },
};

export const PRIMARY_STAGES = [
  'FS1',
  'FS2 - KG1',
  'KG2 / Year 1',
  'Grade 1 / Year 2',
  'Grade 2 / Year 3',
  'Grade 3 / Year 4',
  'Grade 4 / Year 5',
];

// Full class strings so Tailwind keeps them in the build
const THEMES = {
  emerald: { active: 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20', ring: 'focus-visible:ring-emerald-300', accent: 'text-emerald-700' },
  violet: { active: 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-600/20', ring: 'focus-visible:ring-violet-300', accent: 'text-violet-700' },
  pink: { active: 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-600/20', ring: 'focus-visible:ring-pink-300', accent: 'text-pink-700' },
  cyan: { active: 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-600/20', ring: 'focus-visible:ring-cyan-300', accent: 'text-cyan-700' },
  amber: { active: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20', ring: 'focus-visible:ring-amber-300', accent: 'text-amber-700' },
};

const LG_COLS = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
};

export default function StageSelector({
  stages = PRIMARY_STAGES,
  value,
  onChange,
  theme = 'emerald',
  labels = {}, // optional per-stage { short, sub } overrides
}) {
  const t = THEMES[theme] || THEMES.emerald;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
          Select year group
        </span>
        <span className={`text-xs font-bold ${t.accent}`}>{value}</span>
      </div>
      <div
        role="radiogroup"
        aria-label="Year group"
        className={`grid grid-cols-2 sm:grid-cols-4 ${LG_COLS[stages.length] || 'lg:grid-cols-8'} gap-2`}
      >
        {stages.map((stage) => {
          const meta = labels[stage] || STAGE_META[stage] || { short: stage, sub: '' };
          const active = value === stage;
          return (
            <button
              key={stage}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(stage)}
              title={stage}
              className={`flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl border transition-all duration-150 focus:outline-none focus-visible:ring-4 ${t.ring} ${
                active
                  ? t.active
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <span className="text-sm font-black leading-tight">{meta.short}</span>
              {meta.sub && (
                <span className={`text-[11px] font-semibold mt-0.5 ${active ? 'text-white/85' : 'text-slate-500'}`}>
                  {meta.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
