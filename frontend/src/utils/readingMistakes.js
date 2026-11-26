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

// Speech recognition spells some short words as sound-alikes ("son" for "sun").
// They sound identical when read aloud, so treat them as the same word.
const SOUND_ALIKES = { son: 'sun', webb: 'web', bugg: 'bug', dogg: 'dog' };

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
  if (SOUND_ALIKES[w]) w = SOUND_ALIKES[w];
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

// Strip common endings — speech recognition often drops or adds them
// ("rush"/"rushed", "head"/"heads", "cheer"/"cheering").
function stem(w) {
  return w.replace(/(ing|ed|es|s|ly)$/, '');
}

// Rough sound key so recognition spellings that sound the same still match
// ("there"/"their", "rafi"/"raffy", "asha"/"asher").
function soundKey(w) {
  return w
    .replace(/ph/g, 'f')
    .replace(/ck|q/g, 'k')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k')
    .replace(/z/g, 's')
    .replace(/(.)\1+/g, '$1') // double letters
    .replace(/(?!^)[aeiouyhw]/g, '') // vowels / silent letters after the first letter
    .replace(/^[aeiou]/, 'a'); // any starting vowel
}

// Very common short words that speech recognition frequently drops, merges or
// mis-spells even when the pupil read them correctly.
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'so', 'as', 'at', 'on', 'in', 'of', 'to', 'for',
  'by', 'up', 'with', 'from', 'into', 'onto', 'her', 'his', 'him', 'he', 'she', 'it', 'its',
  'we', 'us', 'our', 'you', 'they', 'them', 'their', 'there', 'then', 'than', 'that', 'this',
  'is', 'was', 'are', 'were', 'be', 'been', 'had', 'has', 'have', 'do', 'did', 'not', 'no',
  'my', 'me', 'i', 'all', 'each', 'who', 'what', 'when', 'where', 'which', 'if', 'out', 'off',
]);

// Speech recognition often spells differently (practised/practiced, colour/color).
// Treat close spellings and sound-alikes as a correct reading, not a mistake.
function isSameWord(target, spoken) {
  if (target === spoken) return true;
  if (!target || !spoken) return false;
  const longest = Math.max(target.length, spoken.length);
  if (longest >= 4 && stem(target) === stem(spoken)) return true;
  if (longest >= 5 && soundKey(target) === soundKey(spoken)) return true;
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

  // dp[i][j] = cost of aligning target[0..i) with spoken[0..j).
  // Extra (inserted) words cost slightly more than skipped or misread ones, so a
  // skipped line followed by more reading is aligned as a skip, not as the pupil
  // stopping early and then saying random extra words.
  const SUB = 10;
  const OMIT = 10;
  const INS = 12;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i * OMIT;
  for (let j = 0; j <= m; j++) dp[0][j] = j * INS;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = isSameWord(target[i - 1].norm, spoken[j - 1].norm);
      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + (match ? 0 : SUB), // match / substitution
        dp[i - 1][j] + OMIT, // omission (word skipped)
        dp[i][j - 1] + INS, // insertion (extra word)
      );
    }
  }

  // If the pupil stopped part-way, don't count the unread tail as omissions
  // until they have clearly finished: find the best end point in the target.
  // A small cost per unread word stops a skipped line being mistaken for
  // the pupil stopping early (an unread tail is still far cheaper than omissions).
  const TAIL = 3;
  let endI = n;
  let best = dp[n][m];
  for (let i = 0; i <= n; i++) {
    const cost = dp[i][m] + (n - i) * TAIL;
    if (cost < best) {
      best = cost;
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
      if (dp[i][j] === dp[i - 1][j - 1] + (match ? 0 : SUB)) {
        words[i - 1] = match
          ? { word: target[i - 1].raw, status: 'correct' }
          : { word: target[i - 1].raw, status: 'substituted', said: spoken[j - 1].raw };
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + OMIT) {
      words[i - 1] = { word: target[i - 1].raw, status: 'omitted' };
      i--;
    } else {
      insertions.unshift({ word: spoken[j - 1].raw, beforeIndex: i });
      j--;
    }
  }

  // Benefit of the doubt for small words the microphone tends to drop or
  // confuse: a short gap (1–2 words) made only of common function words, inside
  // otherwise-correct reading, is treated as read correctly. Longer gaps
  // (e.g. a skipped line) and content-word mistakes are still flagged.
  for (let k = 0; k < endI; ) {
    if (words[k].status !== 'omitted' && words[k].status !== 'substituted') { k++; continue; }
    let e = k;
    while (e < endI && (words[e].status === 'omitted' || words[e].status === 'substituted')) e++;
    const run = words.slice(k, e);
    const allFunction = run.every((w) => FUNCTION_WORDS.has(normaliseWord(w.word))
      && (w.status === 'omitted' || FUNCTION_WORDS.has(normaliseWord(w.said))));
    if (run.length <= 2 && allFunction) {
      for (let x = k; x < e; x++) words[x] = { word: words[x].word, status: 'correct' };
    }
    k = e;
  }

  return finaliseAnalysis(words, insertions, n, endI);
}

// Recount totals from per-word statuses (used after alignment and after teacher overrides)
function finaliseAnalysis(words, insertions, n, endI) {
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

/**
 * Apply the teacher's manual word marks on top of the AI analysis.
 * @param {object} analysis  result of analyseReading
 * @param {object} overrides { [wordIndex]: 'correct' | 'error' }
 */
export function applyReadingOverrides(analysis, overrides) {
  const keys = Object.keys(overrides || {});
  if (!analysis || keys.length === 0) return analysis;

  // Teacher marking without any captured reading: unmarked words count as read well
  const manualOnly = !analysis.hasReading;
  const words = analysis.words.map((w, i) => {
    const o = overrides[i];
    if (o === 'correct') return { word: w.word, status: 'correct' };
    if (o === 'error') return { word: w.word, status: 'substituted', said: '' };
    if (manualOnly) return { word: w.word, status: 'correct', unmarked: true };
    return w;
  });

  const lastMarked = Math.max(...keys.map(Number));
  const endI = manualOnly
    ? analysis.totalWords
    : Math.max(analysis.wordsReached || 0, lastMarked + 1);
  // Words before a teacher mark that the AI never reached were read — count them as read well
  for (let i = 0; i < endI; i++) {
    if (words[i].status === 'pending') words[i] = { word: words[i].word, status: 'correct' };
  }
  return finaliseAnalysis(words, analysis.insertions || [], analysis.totalWords, endI);
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
        .map((s) => (s.said
          ? `"${normaliseWord(s.word)}"→"${normaliseWord(s.said)}"`
          : `"${normaliseWord(s.word)}"`))
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
