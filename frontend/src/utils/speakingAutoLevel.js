/**
 * Picks a CEFR rubric level from the pupil's spoken answers, following the
 * descriptors used on the primary speaking sheets:
 *   A1.0–A1.2  1–3 word answers or none
 *   A2.0–A2.2  2–5 word answers, short simple sentences
 *   A2.3–B1.1  5–10 words, includes conjunctions
 *   B1.2–B1.3  more fluent, adds details, uses conjunctions confidently
 *   B2–C1      fluent, extended, strong vocabulary
 * (Pre-A1 is used on sheets that have it, for no / single-word output.)
 *
 * Answers are also checked against the stage key words (internal only, never
 * shown): off-topic answers pull the level down so a long but unrelated
 * answer cannot score highly.
 *
 * The teacher can always override the selected level.
 */
import { findKeywords } from "./listeningRubric";

const FILLERS = /\b(um+|uh+|er+|ah+|hmm+)\b/gi;
const CONJUNCTIONS = /\b(and|but|because|so|then|when|after|before|while|or|if|until|also|next|finally)\b/;
// Words of 7+ letters are a simple proxy for "strong vocabulary"
const LONG_WORD = /^[a-z]{7,}$/;

function analyse(text) {
  const words = String(text || '')
    .toLowerCase()
    .replace(FILLERS, ' ')
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return {
    words: words.length,
    conjunction: CONJUNCTIONS.test(words.join(' ')),
    longWords: words.filter((w) => LONG_WORD.test(w)).length,
  };
}

/**
 * @param {string[]} answers   captured answer per question
 * @param {number}   questionCount
 * @param {{level:string}[]} rubric  the active rubric rows (lowest first)
 * @param {string[]} [keywords]       topic key words for the stage pictures
 * @returns {{ level: string|null, avgWords: number, answered: number, reason: string }}
 */
export function speakingAutoLevel(answers = [], questionCount, rubric = [], keywords = []) {
  const total = questionCount || answers.length;
  const given = answers.slice(0, total).filter((a) => String(a || "").trim());
  const stats = given.map(analyse);
  const answered = stats.length;
  if (!answered || !rubric.length) {
    return { level: null, avgWords: 0, answered: 0, reason: 'No answers captured yet' };
  }
  const allWords = stats.reduce((n, a) => n + a.words, 0);
  if (!allWords) {
    return { level: null, avgWords: 0, answered: 0, reason: 'No answers captured yet' };
  }
  const avgWords = allWords / answered;
  const conjShare = stats.filter((a) => a.conjunction).length / answered;
  const longShare = stats.reduce((n, a) => n + a.longWords, 0) / allWords;

  let target;
  if (avgWords <= 1.5) target = 'Pre-A1';
  else if (avgWords <= 3) target = 'A1.0–A1.2';
  else if (avgWords <= 5) target = 'A2.0–A2.2';
  else if (avgWords <= 10 || conjShare < 0.5) target = 'A2.3–B1.1';
  else if (avgWords <= 12 || longShare < 0.08) target = 'B1.2–B1.3';
  else target = 'B2–C1';

  const levels = rubric.map((r) => r.level);
  let idx = levels.indexOf(target);
  if (idx < 0) idx = target === 'Pre-A1' ? 0 : levels.length - 1;
  // Answering fewer than half the questions pulls the level down one band
  if (answered < Math.ceil(total / 2)) idx = Math.max(0, idx - 1);

  // Relevance: how many answers talk about the pictures (key words)
  let onTopic = null;
  if (keywords.length) {
    onTopic = given.filter((a) => findKeywords(a, keywords).length > 0).length;
    const share = onTopic / answered;
    if (onTopic === 0) idx = 0; // nothing about the pictures
    else if (share < 0.5) idx = Math.max(0, idx - 2); // mostly off topic
    else if (share < 0.75) idx = Math.max(0, idx - 1); // partly off topic
  }

  return {
    level: levels[idx],
    avgWords: Math.round(avgWords * 10) / 10,
    answered,
    reason: `${answered}/${total} answered · about ${Math.round(avgWords)} words per answer${
      conjShare >= 0.5 ? ' · uses conjunctions' : ''
    }${onTopic === null ? '' : ` · ${onTopic}/${answered} on topic`}`,
  };
}
