/**
 * Auto-scoring for reading assessments, from the AI reading results
 * produced by AIAssistantConductor (mode="reading").
 *
 * Words the pupil never reached count as mistakes, so stopping early
 * lowers the score. Teachers can always override any suggested value.
 */
import { normaliseWord } from './readingMistakes';

/** Totals across every text/line in the assessment */
export function aggregateReading(results = []) {
  let totalWords = 0;
  let correct = 0;
  let errors = 0;
  let itemsRead = 0;
  const perItem = results.map((r) => {
    const a = r?.analysis;
    const words = a?.totalWords || 0;
    totalWords += words;
    if (!a || !a.hasReading) {
      errors += words;
      return { read: false, words, correct: 0, errors: words, accuracy: 0 };
    }
    itemsRead += 1;
    const unread = Math.max(0, words - (a.wordsReached || 0));
    const itemErrors = a.errorCount + unread;
    correct += a.correctCount;
    errors += itemErrors;
    return {
      read: true,
      words,
      correct: a.correctCount,
      errors: itemErrors,
      accuracy: words ? Math.round((a.correctCount / words) * 100) : 0,
    };
  });
  const items = results.length || 1;
  return {
    perItem,
    itemsRead,
    totalWords,
    correct,
    errors,
    hasReading: itemsRead > 0,
    accuracy: totalWords ? Math.round((correct / totalWords) * 100) : 0,
    errorsPer100: totalWords ? Math.round((errors / totalWords) * 100) : 0,
    mistakesPerLine: errors / items,
  };
}

/**
 * FS1 / FS2: judge ONE picture word the pupil read on its own.
 *   fluent  – said the word straight away ("hen", or "hen hen")
 *   support – got there by sounding out / self-correcting ("h-e-n… hen", "hat… hen")
 *   error   – never said the word ("hat", "ham")
 * @returns 'fluent' | 'support' | 'error' | null (nothing heard yet)
 */
export function judgeCvcWord(target, spoken) {
  const t = normaliseWord(target);
  const tokens = String(spoken || '')
    .split(/[\s,.;!?-]+/)
    .map(normaliseWord)
    .filter(Boolean);
  if (!tokens.length || !t) return null;
  if (tokens.every((w) => w === t)) return 'fluent';
  if (tokens.includes(t)) return 'support';
  // Only the sounds, blended by the listener: "h e n"
  if (tokens.every((w) => w.length === 1) && tokens.join('') === t) return 'support';
  return 'error';
}

/** Totals for FS1 / FS2 from the per-word marks (teacher overrides included) */
export function aggregateWordStatuses(statuses = []) {
  const perItem = statuses.map((s) => ({
    read: !!s,
    words: 1,
    support: s === 'support',
    correct: s === 'fluent' ? 1 : 0,
    errors: s === 'error' ? 1 : 0,
    accuracy: s === 'fluent' ? 100 : s === 'support' ? 50 : 0,
  }));
  const total = statuses.length;
  const fluent = statuses.filter((s) => s === 'fluent').length;
  const support = statuses.filter((s) => s === 'support').length;
  const errors = total - fluent - support;
  const itemsRead = statuses.filter(Boolean).length;
  return {
    perItem,
    itemsRead,
    totalWords: total,
    correct: fluent,
    errors,
    hasReading: itemsRead > 0,
    accuracy: total ? Math.round(((fluent + support / 2) / total) * 100) : 0,
    errorsPer100: total ? Math.round((errors / total) * 100) : 0,
    mistakesPerLine: errors,
  };
}

/**
 * FS1 / FS2 picture card: the pupil reads all the words in one go, so the card
 * is a single reading item. This splits its word-by-word result back into one
 * entry per picture word (same shape as aggregateReading).
 */
export function aggregateWordCard(result, wordCount) {
  const words = result?.analysis?.hasReading ? result.analysis.words : [];
  const perItem = Array.from({ length: wordCount }, (_, i) => {
    const w = words[i];
    const read = !!w && w.status !== 'pending';
    const correct = read && w.status === 'correct';
    return { read, words: 1, correct: correct ? 1 : 0, errors: read && !correct ? 1 : 0, accuracy: correct ? 100 : 0 };
  });
  const itemsRead = perItem.filter((p) => p.read).length;
  const correct = perItem.filter((p) => p.correct).length;
  const errors = wordCount - correct;
  return {
    perItem,
    itemsRead,
    totalWords: wordCount,
    correct,
    errors,
    hasReading: itemsRead > 0,
    accuracy: wordCount ? Math.round((correct / wordCount) * 100) : 0,
    errorsPer100: wordCount ? Math.round((errors / wordCount) * 100) : 0,
    mistakesPerLine: errors,
  };
}

/** Accuracy /10 and fluency label for the primary Teacher Notes box */
export function accuracyOutOf10(agg) {
  return agg.hasReading ? String(Math.round(agg.accuracy / 10)) : null;
}

export function fluencyLabel(agg) {
  if (!agg.hasReading) return null;
  if (agg.errorsPer100 <= 5) return 'Smooth';
  if (agg.errorsPer100 <= 15) return 'Some hesitation';
  return 'Many pauses';
}

/** Primary passages (KG2 – Grade 5): rubric is "mistakes per line" */
export function primaryPassageLevel(agg) {
  if (!agg.hasReading) return null;
  if (agg.accuracy < 50) return 'A1.0–A1.2'; // majority mistakes
  if (agg.mistakesPerLine > 4) return 'A2.0–A2.2'; // over 5 per line
  if (agg.mistakesPerLine > 2) return 'A2.3–B1.1'; // 3–4 per line
  if (agg.errors > 0) return 'B1.2–B1.3'; // 1–2 per line
  return 'B2–C1'; // no mistakes
}

export function passageStatus(item) {
  if (!item.read) return null;
  if (item.accuracy >= 95) return 'accurate';
  if (item.accuracy >= 75) return 'hesitant';
  return 'struggled';
}

/** FS1 / FS2 CVC picture words: based on how many words were read correctly */
export function cvcLevel(agg) {
  if (!agg.hasReading) return null;
  // Words read with support (sounding out) count as half
  const right = agg.perItem.reduce(
    (n, p) => n + (p.read && p.errors === 0 ? (p.support ? 0.5 : 1) : 0),
    0,
  );
  const total = agg.perItem.length;
  const share = total ? right / total : 0;
  if (share === 1) return 'B2–C1';
  if (share >= 0.8) return 'B1.2–B1.3';
  if (share >= 0.6) return 'A2.3–B1.1';
  if (share >= 0.45) return 'A2.0–A2.2';
  if (share > 0) return 'A1.0–A1.2';
  return 'Pre-A1';
}

export function cvcStatus(item) {
  if (!item.read) return null;
  return item.errors === 0 ? 'fluent' : 'error';
}

/** Secondary (junior & senior): rubric is "errors per 100 words" */
export function secondaryLevel(agg) {
  if (!agg.hasReading) return null;
  const e = agg.errorsPer100;
  if (e <= 5) return 'C2 - Mastery';
  if (e <= 10) return 'C1 - Advanced';
  if (e <= 14) return 'B2 - Proficient';
  if (e <= 17) return 'B1 - Secure';
  if (e <= 22) return 'A2 - Developing';
  return 'A1 - Emerging';
}
