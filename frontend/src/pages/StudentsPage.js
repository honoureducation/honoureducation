import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { studentAPI } from '../services/api';
import {
  PRIMARY_YEAR_GROUPS,
  SECONDARY_YEAR_GROUPS,
  tierForYearGroup,
  studentLabel,
  getSelectedStudent,
  setSelectedStudent,
} from '../utils/students';

const EMPTY_FORM = { fullName: '', studentId: '', yearGroup: '', class: '', email: '' };

const CSV_TEMPLATE =
  'Student Name,Student ID,Year Group,Class,Email\n' +
  'Aisha Khan,1001,Grade 2 / Year 3,B,\n' +
  'Omar Ali,1002,Year 8 / Grade 7,A,omar.ali@school.edu\n';

// ---- CSV helpers -------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const HEADER_MAP = {
  name: 'fullName', fullname: 'fullName', studentname: 'fullName', pupilname: 'fullName',
  firstname: 'firstName', lastname: 'lastName', surname: 'lastName',
  studentid: 'studentId', id: 'studentId', admissionno: 'studentId', admissionnumber: 'studentId', rollno: 'studentId',
  yeargroup: 'yearGroup', year: 'yearGroup', grade: 'yearGroup', stage: 'yearGroup',
  class: 'class', section: 'class', classname: 'class',
  email: 'email', emailaddress: 'email', studentemail: 'email',
};

// Map common spellings ("Year 8", "grade 2", "KG2") to the app's year groups
export function normaliseYearGroup(raw = '') {
  const v = String(raw).trim();
  if (!v) return '';
  const all = [...PRIMARY_YEAR_GROUPS, ...SECONDARY_YEAR_GROUPS];
  const exact = all.find((y) => y.toLowerCase() === v.toLowerCase());
  if (exact) return exact;
  const s = v.toLowerCase();
  if (/^fs\s*1$|nursery/.test(s)) return 'FS1';
  if (/fs\s*2|kg\s*1|reception/.test(s)) return 'FS2 - KG1';
  if (/kg\s*2/.test(s)) return 'KG2 / Year 1';
  const year = s.match(/year\s*(\d{1,2})/);
  if (year) {
    const n = Number(year[1]);
    if (n === 1) return 'KG2 / Year 1';
    if (n >= 2 && n <= 6) return `Grade ${n - 1} / Year ${n}`;
    if (n >= 7 && n <= 13) return `Year ${n} / Grade ${n - 1}`;
  }
  const grade = s.match(/grade\s*(\d{1,2})/);
  if (grade) {
    const n = Number(grade[1]);
    if (n >= 1 && n <= 5) return `Grade ${n} / Year ${n + 1}`;
    if (n >= 6 && n <= 12) return `Year ${n + 1} / Grade ${n}`;
  }
  return v;
}

function rowsToStudents(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => HEADER_MAP[h.toLowerCase().replace(/[^a-z]/g, '')] || null);
  return rows.slice(1).map((r) => {
    const o = {};
    headers.forEach((key, i) => {
      if (key) o[key] = (r[i] || '').trim();
    });
    if (o.yearGroup) o.yearGroup = normaliseYearGroup(o.yearGroup);
    return o;
  });
}

const rowName = (r) => (r.fullName || `${r.firstName || ''} ${r.lastName || ''}`).trim();
const rowError = (r) => (!rowName(r) ? 'Missing name' : !r.yearGroup ? 'Missing year group' : '');

// ---- Page --------------------------------------------------------------
export default function StudentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvName, setCsvName] = useState('');
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const load = async () => {
    try {
      setStudents(await studentAPI.list());
    } catch (e) {
      toast.error(`Couldn't load students: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error('Please enter the student name.');
    if (!form.yearGroup) return toast.error('Please choose a year group.');
    setSaving(true);
    try {
      const student = await studentAPI.create({ ...form, tier: tierForYearGroup(form.yearGroup) });
      setStudents((prev) => [student, ...prev]);
      setForm((f) => ({ ...EMPTY_FORM, yearGroup: f.yearGroup, class: f.class })); // keep year/class for the next pupil
      toast.success(`${studentLabel(student)} registered`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      toast.error('Please upload a .csv file (in Excel: File → Save As → CSV).');
      return;
    }
    const text = await file.text();
    const rows = rowsToStudents(parseCsv(text.replace(/^﻿/, '')));
    if (rows.length === 0) {
      toast.error('No students found. Check the file has a header row and at least one student.');
      return;
    }
    setCsvName(file.name);
    setCsvRows(rows);
  };

  const validCsvRows = csvRows.filter((r) => !rowError(r));

  const handleImport = async () => {
    if (validCsvRows.length === 0) return;
    setImporting(true);
    try {
      const results = await studentAPI.bulkImport(
        validCsvRows.map((r) => ({ ...r, tier: tierForYearGroup(r.yearGroup) })),
      );
      setStudents((prev) => [...(results.students || []), ...prev]);
      if (results.failed > 0) {
        toast.warn(
          `${results.successful} imported, ${results.failed} skipped (${results.errors
            .slice(0, 3)
            .map((er) => `${er.name || 'row ' + er.row}: ${er.error}`)
            .join('; ')}${results.errors.length > 3 ? '…' : ''})`,
          { autoClose: 8000 },
        );
      } else {
        toast.success(`${results.successful} students imported`);
      }
      setCsvRows([]);
      setCsvName('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Remove ${studentLabel(s)} from your students?`)) return;
    try {
      await studentAPI.remove(s._id);
      setStudents((prev) => prev.filter((x) => x._id !== s._id));
      const remembered = getSelectedStudent();
      if (remembered && remembered._id === s._id) setSelectedStudent(null);
      toast.success('Student removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        (tierFilter === 'all' || (s.tier || tierForYearGroup(s.yearGroup)) === tierFilter) &&
        (!q ||
          [studentLabel(s), s.studentId, s.yearGroup, s.class, s.email]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))),
    );
  }, [students, search, tierFilter]);

  const inputCls =
    'w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Step 1 · Before assessing</p>
            <h1 className="text-3xl font-black text-slate-900 mt-1">My Students</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Register your students once — add them one by one or upload a CSV. On every assessment you then just
              search and pick the student instead of typing their details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(returnTo || '/assessments')}
            disabled={students.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            {returnTo ? 'Back to Assessment' : 'Continue to Assessments'} →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add one student */}
          <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900">Add a student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  className={inputCls}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Aisha Khan"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Year Group <span className="text-rose-500">*</span>
                </label>
                <select
                  className={inputCls}
                  value={form.yearGroup}
                  onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                >
                  <option value="">Choose…</option>
                  <optgroup label="Primary">
                    {PRIMARY_YEAR_GROUPS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Secondary">
                    {SECONDARY_YEAR_GROUPS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Class / Section</label>
                <input
                  className={inputCls}
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  placeholder="e.g. B"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Student ID <span className="text-slate-400 font-semibold">(optional)</span>
                </label>
                <input
                  className={inputCls}
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  placeholder="Auto-generated if blank"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Email <span className="text-slate-400 font-semibold">(optional)</span>
                </label>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@school.edu"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Student'}
            </button>
          </form>

          {/* CSV upload */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-black text-slate-900">Upload a class list (CSV)</h2>
              <button type="button" onClick={downloadTemplate} className="text-xs font-bold text-indigo-600 hover:underline">
                ⬇ Download template
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Columns: <strong>Student Name</strong>, <strong>Year Group</strong> (required), Student ID, Class, Email.
              Year groups like "Year 8" or "Grade 2" are recognised automatically. From Excel use File → Save As → CSV.
            </p>

            <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition-colors">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm font-bold text-slate-700">{csvName || 'Choose a CSV file'}</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>

            {csvRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">
                    {validCsvRows.length} ready to import
                    {csvRows.length - validCsvRows.length > 0 && (
                      <span className="text-rose-600"> · {csvRows.length - validCsvRows.length} with problems (skipped)</span>
                    )}
                  </span>
                  <button type="button" onClick={() => { setCsvRows([]); setCsvName(''); }} className="text-slate-400 hover:text-slate-600">
                    Clear
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs">
                    <tbody>
                      {csvRows.map((r, i) => {
                        const err = rowError(r);
                        return (
                          <tr key={i} className={`border-b border-slate-100 last:border-b-0 ${err ? 'bg-rose-50' : ''}`}>
                            <td className="px-3 py-1.5 font-semibold text-slate-800">{rowName(r) || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.yearGroup || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.class}</td>
                            <td className="px-3 py-1.5 text-rose-600 font-semibold">{err}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || validCsvRows.length === 0}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {importing ? 'Importing…' : `Import ${validCsvRows.length} Students`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Student list */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">
              Registered Students <span className="text-slate-400 font-bold">({students.length})</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {['all', 'primary', 'secondary'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTierFilter(t)}
                    className={`px-3 py-1.5 rounded-lg capitalize ${tierFilter === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, year group, class…"
                className="sm:w-72 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading students…</p>
          ) : students.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No students yet. Add a student or upload a CSV above to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Year Group</th>
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-bold text-slate-900">{studentLabel(s)}</td>
                      <td className="px-5 py-3 text-slate-500">{s.studentId}</td>
                      <td className="px-5 py-3 text-slate-700">{s.yearGroup}</td>
                      <td className="px-5 py-3 text-slate-700">{s.class || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{s.email || '—'}</td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <Link
                          to={`/assessments?tier=${s.tier || tierForYearGroup(s.yearGroup)}`}
                          onClick={() => setSelectedStudent(s)}
                          className="text-xs font-bold text-indigo-600 hover:underline mr-4"
                        >
                          Assess →
                        </Link>
                        <button type="button" onClick={() => handleDelete(s)} className="text-xs font-bold text-rose-600 hover:underline">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500">No student matches your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
