import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { studentAPI } from '../services/api';
import {
  getSelectedStudent,
  setSelectedStudent,
  studentLabel,
  studentYearClass,
} from '../utils/students';

/**
 * Pick a registered student instead of typing their details.
 * Selecting a student calls onSelect(student) so the form can fill
 * name / year group & class / email.
 *
 * Props:
 *  - tier: 'primary' | 'secondary' — only students of that tier are listed
 *  - value: the form's current studentName (to show the selected state)
 *  - onSelect(student)
 */
export default function StudentPicker({ tier, value = '', onSelect }) {
  const location = useLocation();
  const [students, setStudents] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    studentAPI
      .list(tier ? { tier } : {})
      .then((list) => {
        if (cancelled) return;
        setStudents(list);
        // Carry over the student picked on the previous assessment
        const remembered = getSelectedStudent();
        if (
          remembered &&
          !value &&
          list.some((s) => s._id === remembered._id)
        ) {
          onSelectRef.current(list.find((s) => s._id === remembered._id));
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setStudents([]);
          setError(e.message);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = useMemo(() => {
    if (!students || !value) return null;
    const v = value.trim().toLowerCase();
    const remembered = getSelectedStudent();
    return (
      (remembered && studentLabel(remembered).toLowerCase() === v
        ? students.find((s) => s._id === remembered._id)
        : null) || students.find((s) => studentLabel(s).toLowerCase() === v) || null
    );
  }, [students, value]);

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [studentLabel(s), s.studentId, s.yearGroup, s.class, s.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [students, query]);

  const choose = (student) => {
    setSelectedStudent(student);
    onSelect(student);
    setQuery('');
    setOpen(false);
  };

  const registerLink = `/students?return=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <div ref={boxRef} className="mb-5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-xs font-extrabold text-slate-700">
          Select Student <span className="text-slate-400 font-semibold">(registered students)</span>
        </label>
        <Link to={registerLink} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
          + Register students
        </Link>
      </div>

      {selected && !open ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-indigo-200 bg-indigo-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0">
              {studentLabel(selected).slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{studentLabel(selected)}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {studentYearClass(selected)} · ID {selected.studentId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={
              students === null
                ? 'Loading students…'
                : students.length === 0
                ? 'No registered students yet'
                : `Search ${students.length} student${students.length === 1 ? '' : 's'} by name, ID, year group or class…`
            }
            disabled={students === null}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-indigo-200 bg-white text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

          {open && students !== null && (
            <div className="absolute z-30 mt-1.5 w-full max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl">
              {students.length === 0 ? (
                <div className="p-4 text-sm text-slate-600">
                  {error ? `Couldn't load students (${error}). ` : 'No students registered yet. '}
                  <Link to={registerLink} className="font-bold text-indigo-600 hover:underline">
                    Register students
                  </Link>{' '}
                  or type the details below.
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No student matches "{query}".</div>
              ) : (
                filtered.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => choose(s)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-indigo-50 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 truncate">{studentLabel(s)}</span>
                      <span className="block text-xs text-slate-500 truncate">{studentYearClass(s)}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">{s.studentId}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
