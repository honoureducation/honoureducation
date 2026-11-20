/**
 * Shared helpers for registered students (Students page + StudentPicker).
 */

export const PRIMARY_YEAR_GROUPS = [
  'FS1',
  'FS2 - KG1',
  'KG2 / Year 1',
  'Grade 1 / Year 2',
  'Grade 2 / Year 3',
  'Grade 3 / Year 4',
  'Grade 4 / Year 5',
  'Grade 5 / Year 6',
];

export const SECONDARY_YEAR_GROUPS = [
  'Year 7 / Grade 6',
  'Year 8 / Grade 7',
  'Year 9 / Grade 8',
  'Year 10 / Grade 9',
  'Year 11 / Grade 10',
  'Year 12 / Grade 11',
  'Year 13 / Grade 12',
];

export const tierForYearGroup = (yearGroup = '') =>
  PRIMARY_YEAR_GROUPS.includes(yearGroup) ||
  (!SECONDARY_YEAR_GROUPS.includes(yearGroup) &&
    /fs1|fs2|kg|grade [1-5]\b|year [1-6]\b/i.test(yearGroup) &&
    !/year (7|8|9|10|11|12|13)\b/i.test(yearGroup))
    ? 'primary'
    : 'secondary';

export const studentLabel = (s) =>
  s ? (s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim()) : '';

export const studentYearClass = (s) =>
  s ? (s.yearGroupAndClass || (s.class ? `${s.yearGroup} - ${s.class}` : s.yearGroup)) : '';

// The student currently being assessed — kept for the browser session so it
// carries over when the teacher moves from one assessment to the next.
const KEY = 'selectedStudent';

export const getSelectedStudent = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setSelectedStudent = (student) => {
  try {
    if (student) sessionStorage.setItem(KEY, JSON.stringify(student));
    else sessionStorage.removeItem(KEY);
  } catch (e) {
    // storage unavailable (private mode) — selection just won't persist
  }
};
