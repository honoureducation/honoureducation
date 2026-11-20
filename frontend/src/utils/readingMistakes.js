/**
 * Reading-aloud mistake analysis.
 *
 * Compares the target text a pupil was asked to read with what speech
 * recognition heard, using a word-level alignment (edit distance). Produces:
 *  - per-word status for the target text: correct | substituted | omitted
 *  - inserted (extra) words the pupil added
 *  - accuracy % and errors per 100 words (matches the CEFR rubric wording)
 */

const NUMBER_WORDS = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
  7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve',
  15: 'fifteen', 17: 'seventeen', 20: 'twenty', 45: 'forty-five', 100: 'hundred',
};

// Lowercase, strip accents/punctuation so "São" == "sao", "field's" == "fields"
export function normaliseWord(word) {
  if (!word) return '';
  let w = String(word)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9-]/g, '');
  if (/^\d+$/.test(w) && NUMBER_WORDS[w]) w = NUMBER_WORDS[w];
  return w.replace(/-/g, '');
}

function tokenise(text) {
  return String(text || '')
    .replace(/[—–]/g, ' ')
    .split(/\s+/)
    .map((raw) => ({ raw, norm: normaliseWord(raw) }))
    .filter((t) => t.norm.length > 0);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

// Speech recognition often spells differently (practised/practiced, colour/color).
// Treat very close spellings as a correct reading, not a mistake.
function isSameWord(target, spoken) {
  if (target === spoken) return true;
  const longest = Math.max(target.length, spoken.length);
  if (longest < 5) return false;
  return levenshtein(target, spoken) <= (longest >= 8 ? 2 : 1);
}

/**
 * @param {string} targetText  The text the pupil was asked to read
 * @param {string} spokenText  What speech recognition captured
 */
export function analyseReading(targetText, spokenText) {
  const target = tokenise(targetText);
  const spoken = tokenise(spokenText);
  const n = target.length;
  const m = spoken.length;

  const empty = {
    words: target.map((t) => ({ word: t.raw, status: 'pending' })),
    insertions: [],
    substitutions: [],
    omissions: [],
    totalWords: n,
    correctCount: 0,
    errorCount: 0,
    accuracy: 0,
    errorsPer100: 0,
    hasReading: false,
  };
  if (!m || !n) return empty;

  // dp[i][j] = cost of aligning target[0..i) with spoken[0..j)
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = isSameWord(target[i - 1].norm, spoken[j - 1].norm);
      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + (match ? 0 : 1), // match / substitution
        dp[i - 1][j] + 1, // omission (word skipped)
        dp[i][j - 1] + 1, // insertion (extra word)
      );
    }
  }

  // If the pupil stopped part-way, don't count the unread tail as omissions
  // until they have clearly finished: find the best end point in the target.
  let endI = n;
  let best = dp[n][m];
  for (let i = 0; i <= n; i++) {
    if (dp[i][m] < best) {
      best = dp[i][m];
      endI = i;
    }
  }

  const words = target.map((t) => ({ word: t.raw, status: 'pending' }));
  const insertions = [];
  let i = endI;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const match = isSameWord(target[i - 1].norm, spoken[j - 1].norm);
      if (dp[i][j] === dp[i - 1][j - 1] + (match ? 0 : 1)) {
        words[i - 1] = match
          ? { word: target[i - 1].raw, status: 'correct' }
          : { word: target[i - 1].raw, status: 'substituted', said: spoken[j - 1].raw };
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      words[i - 1] = { word: target[i - 1].raw, status: 'omitted' };
      i--;
    } else {
      insertions.unshift({ word: spoken[j - 1].raw, beforeIndex: i });
      j--;
    }
  }

  const readWords = words.slice(0, endI);
  const substitutions = readWords
    .map((w, idx) => ({ ...w, index: idx }))
    .filter((w) => w.status === 'substituted');
  const omissions = readWords
    .map((w, idx) => ({ ...w, index: idx }))
    .filter((w) => w.status === 'omitted');
  const correctCount = readWords.filter((w) => w.status === 'correct').length;
  const errorCount = substitutions.length + omissions.length + insertions.length;
  const attempted = Math.max(endI, 1);

  return {
    words,
    insertions,
    substitutions,
    omissions,
    totalWords: n,
    wordsReached: endI,
    finished: endI === n,
    correctCount,
    errorCount,
    accuracy: Math.round((correctCount / attempted) * 100),
    errorsPer100: Math.round((errorCount / attempted) * 100),
    hasReading: true,
  };
}

/** One-line teacher-note summary of a reading analysis */
export function summariseReading(label, analysis) {
  if (!analysis || !analysis.hasReading) return `${label}: not read`;
  const parts = [
    `${label}: ${analysis.accuracy}% accuracy, ${analysis.errorCount} error(s) (${analysis.errorsPer100}/100 words)`,
  ];
  if (!analysis.finished) {
    parts.push(`stopped after ${analysis.wordsReached}/${analysis.totalWords} words`);
  }
  if (analysis.substitutions.length) {
    parts.push(
      `misread: ${analysis.substitutions
        .map((s) => `"${normaliseWord(s.word)}"→"${normaliseWord(s.said)}"`)
        .join(', ')}`,
    );
  }
  if (analysis.omissions.length) {
    parts.push(`skipped: ${analysis.omissions.map((o) => normaliseWord(o.word)).join(', ')}`);
  }
  if (analysis.insertions.length) {
    parts.push(`added: ${analysis.insertions.map((x) => normaliseWord(x.word)).join(', ')}`);
  }
  return parts.join(' | ');
}
