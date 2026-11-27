import React from 'react';
import StudentPicker from './StudentPicker';
import { studentLabel, studentYearClass } from '../utils/students';

// Full class strings so Tailwind keeps them in the build.
const ACCENTS = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    input: 'focus:border-emerald-500 focus:ring-emerald-100',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700',
    input: 'focus:border-blue-500 focus:ring-blue-100',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-700',
    input: 'focus:border-orange-500 focus:ring-orange-100',
  },
  purple: {
    badge: 'bg-purple-100 text-purple-700',
    input: 'focus:border-purple-500 focus:ring-purple-100',
  },
};

const GRID_COLS = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-3 xl:grid-cols-5',
};

/**
 * "Student & Assessment Details" card — the primary-form layout, shared so
 * secondary forms look the same. Picking a registered student fills
 * name, year group & class and email.
 */
export default function StudentDetailsCard({
  formData,
  setFormData,
  onChange,
  tier = 'secondary',
  step = 1,
  title = 'Student & Assessment Details',
  accent = 'blue',
  showTeacherName = false,
  showTerm = true,
  errors = {},
}) {
  const a = ACCENTS[accent] || ACCENTS.blue;
  const inputClass = (field) =>
    `w-full bg-slate-50 border ${errors[field] ? 'border-rose-400' : 'border-slate-200'} ${a.input} focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4`;
  const labelClass = 'block text-xs font-extrabold text-slate-700 mb-1.5';
  const required = <span className="text-rose-500">*</span>;
  const error = (field) =>
    errors[field] ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors[field]}</p> : null;

  const fieldCount = 3 + (showTeacherName ? 1 : 0) + (showTerm ? 1 : 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200">
      <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
        <span className={`w-7 h-7 rounded-xl ${a.badge} flex items-center justify-center text-xs font-extrabold`}>
          {step}
        </span>
        {title}
      </h2>

      <StudentPicker
        tier={tier}
        value={formData.studentName}
        onSelect={(s) => {
          setFormData((p) => ({
            ...p,
            studentName: studentLabel(s),
            yearGroupAndClass: studentYearClass(s),
            email: s.email || p.email || localStorage.getItem('userEmail') || '',
          }));
        }}
      />

      <div className={`grid grid-cols-1 md:grid-cols-2 ${GRID_COLS[fieldCount]} gap-4`}>
        <div>
          <label className={labelClass}>Student Name {required}</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName || ''}
            onChange={onChange}
            placeholder="e.g. Liam Smith"
            className={inputClass('studentName')}
            required
          />
          {error('studentName')}
        </div>

        <div>
          <label className={labelClass}>Assessor Email {required}</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
            placeholder="assessor@school.edu"
            className={inputClass('email')}
            required
          />
          {error('email')}
        </div>

        <div>
          <label className={labelClass}>Year Group / Class</label>
          <input
            type="text"
            name="yearGroupAndClass"
            value={formData.yearGroupAndClass || ''}
            onChange={onChange}
            placeholder="e.g. Year 8A"
            className={inputClass('yearGroupAndClass')}
          />
          {error('yearGroupAndClass')}
        </div>

        {showTeacherName && (
          <div>
            <label className={labelClass}>Teacher Name</label>
            <input
              type="text"
              name="teacherName"
              value={formData.teacherName || ''}
              onChange={onChange}
              placeholder="Optional"
              className={inputClass('teacherName')}
            />
          </div>
        )}

        {showTerm && (
          <div>
            <label className={labelClass}>Academic Term</label>
            <select
              name="term"
              value={formData.term}
              onChange={onChange}
              className={inputClass('term')}
            >
              <option value="T1">Term 1 (T1)</option>
              <option value="T2">Term 2 (T2)</option>
              <option value="T3">Term 3 (T3)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
