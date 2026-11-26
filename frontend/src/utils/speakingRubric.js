/**
 * Secondary Speaking rubric (Year 7–13).
 *
 * Each of the 6 questions is marked 0 / 1 / 2 and the demand rises question by
 * question, in line with the CEFR bands (Q1–2 ≈ A2/B1, Q3 ≈ B1, Q4 ≈ B2,
 * Q5 ≈ C1, Q6 ≈ C2):
 *
 *   2 — Proficient: relevant to the question with enough distinct ideas, a
 *       full spoken sentence (not just words), long enough for the task, and
 *       uses the language the task needs (sequencing / reasons / contrast).
 *   1 — Unsure: some relevant content, but too short, a word list, missing
 *       ideas, or missing the linking language the question asks for.
 *   0 — No response, or nothing relevant to the question / pictures.
 *
 * Internal marking only — the idea lists are never shown on screen.
 */

// ── Language features ────────────────────────────────────────
const SEQUENCING = ['first', 'firstly', 'at first', 'then', 'next', 'after', 'afterwards', 'after that', 'later', 'finally', 'in the end', 'at the end', 'eventually', 'before', 'when', 'while', 'meanwhile', 'suddenly', 'so'];
const REASON = ['because', 'since', 'as a result', 'so', 'so that', 'therefore', 'that is why', "that's why", 'thanks to', 'due to', 'which helped', 'helped', 'this shows', 'which means', 'this means'];
const CONTRAST = ['but', 'however', 'whereas', 'while', 'on the other hand', 'although', 'though', 'instead', 'differently', 'different', 'might think', 'may think', 'could think', 'might see', 'may see', 'could see', 'might feel', 'may feel'];

const VERB_RE = /\b(am|is|are|was|were|be|been|being|have|has|had|do|does|did|can|could|will|would|should|might|may|must|see|saw|seen|think|thought|go|goes|went|get|gets|got|make|makes|made|help|helps|helped|work|works|worked|win|wins|won|look|looks|looked|feel|feels|felt|show|shows|showed|happen|happens|happened|change|changes|changed|stop|stops|stopped|need|needs|needed|want|wants|wanted|try|tries|tried|come|comes|came|take|takes|took|stand|stands|stood|fall|falls|fell)\b|\b\w{3,}(ing|ed)\b/;

// ── Per-question criteria ────────────────────────────────────
// ideas: groups of alternative words — each group is one relevant idea
// need: ideas required for full marks · minWords: length for full marks
// features: linking language required for full marks
// audiences (Q6): distinct viewpoints required

const AUDIENCE_WORDS = ['fans', 'fan', 'children', 'kids', 'young people', 'teenagers', 'adults', 'parents', 'teachers', 'students', 'pupils', 'drivers', 'driver', 'engineers', 'mechanics', 'sponsors', 'viewers', 'spectators', 'coaches', 'actors', 'directors', 'critics', 'audience', 'families', 'grandparents', 'business', 'managers', 'athletes', 'some people', 'other people', 'others', 'someone', 'people who'];

const RUBRIC_JUNIOR = [
  { // Q1 — describe picture 1 (race)
    ideas: [
      ['race', 'racing', 'races', 'formula', 'grand prix', 'competition', 'competing'],
      ['car', 'cars', 'vehicle', 'vehicles'],
      ['track', 'circuit', 'road', 'corner', 'bend', 'curve'],
      ['driver', 'drivers', 'helmet', 'helmets', 'racer', 'racers'],
      ['fast', 'speed', 'quick', 'overtake', 'overtaking', 'chasing', 'leading', 'in front', 'behind', 'first', 'second', 'third'],
    ],
    need: 3, minWords: 10, features: [],
  },
  { // Q2 — what happens next (pit stop)
    ideas: [
      ['pit', 'pit stop', 'pit lane', 'stops', 'stopped', 'garage', 'box'],
      ['tyre', 'tyres', 'tire', 'tires', 'wheel', 'wheels'],
      ['change', 'changing', 'changed', 'fix', 'fixing', 'fixed', 'repair', 'repairing', 'replace', 'replacing'],
      ['mechanic', 'mechanics', 'crew', 'team', 'engineer', 'engineers', 'worker', 'workers'],
      ['quick', 'quickly', 'fast', 'hurry', 'seconds', 'rush'],
    ],
    need: 2, minWords: 12, features: [{ list: SEQUENCING, count: 1, label: 'sequencing' }],
  },
  { // Q3 — whole story
    ideas: [
      ['race', 'racing', 'track', 'cars', 'overtake', 'driving'],
      ['pit', 'pit stop', 'tyre', 'tyres', 'tire', 'tires', 'wheel', 'wheels', 'fix', 'fixed', 'mechanic', 'mechanics', 'crew', 'change', 'changed'],
      ['win', 'won', 'wins', 'winner', 'winning', 'first place', 'celebrate', 'celebrating', 'celebrated', 'trophy', 'champion', 'cheer', 'cheering', 'happy', 'victory'],
    ],
    need: 3, minWords: 30, features: [{ list: SEQUENCING, count: 2, label: 'sequencing' }],
  },
  { // Q4 — why celebrating & what helped
    ideas: [
      ['win', 'won', 'winning', 'winner', 'first', 'victory', 'champion', 'trophy', 'race'],
      ['team', 'teamwork', 'crew', 'mechanics', 'together', 'pit stop', 'fast pit', 'quick', 'practice', 'practise', 'hard work', 'skill', 'skills', 'support', 'helped', 'strategy', 'tyres', 'tires'],
    ],
    need: 2, minWords: 18, features: [{ list: REASON, count: 1, label: 'reason' }],
  },
  { // Q5 — teamwork & pressure
    ideas: [
      ['teamwork', 'team', 'together', 'cooperate', 'cooperation', 'help each other', 'communicate', 'communication', 'everyone', 'support', 'trust'],
      ['pressure', 'stress', 'stressful', 'calm', 'focus', 'focused', 'quick', 'quickly', 'fast', 'time', 'hurry', 'nervous'],
      ['problem', 'problems', 'solve', 'solving', 'solution', 'fix', 'challenge', 'difficult', 'mistake'],
    ],
    need: 3, minWords: 22, features: [{ list: REASON, count: 1, label: 'reason' }],
  },
  { // Q6 — different audiences
    ideas: [],
    audiences: 2, minWords: 25,
    features: [{ list: CONTRAST, count: 1, label: 'contrast' }, { list: REASON, count: 1, label: 'reason' }],
  },
];

const RUBRIC_SENIOR = [
  { // Q1 — describe picture 1 (classroom planning)
    ideas: [
      ['students', 'student', 'pupils', 'teenagers', 'group', 'class', 'classmates', 'people', 'friends'],
      ['classroom', 'school', 'room', 'blackboard', 'board', 'window', 'windows'],
      ['paper', 'papers', 'script', 'scripts', 'sheets', 'notes', 'pages', 'floor', 'mess', 'messy', 'bag'],
      ['talking', 'discussing', 'discussion', 'planning', 'plan', 'practising', 'practicing', 'rehearsing', 'reading', 'preparing', 'drama', 'play', 'teacher', 'standing', 'circle', 'thinking', 'worried', 'confused'],
    ],
    need: 3, minWords: 10, features: [],
  },
  { // Q2 — what happens next (stage rehearsal)
    ideas: [
      ['stage', 'theatre', 'theater', 'lights', 'light', 'spotlight', 'spotlights'],
      ['perform', 'performing', 'performance', 'rehearse', 'rehearsing', 'rehearsal', 'acting', 'act', 'actors', 'play', 'drama', 'show', 'scene'],
      ['help', 'helping', 'helped', 'catch', 'catching', 'fall', 'falling', 'fell', 'hold', 'holding', 'together', 'move', 'moving', 'fight', 'dance'],
    ],
    need: 2, minWords: 12, features: [{ list: SEQUENCING, count: 1, label: 'sequencing' }],
  },
  { // Q3 — whole story
    ideas: [
      ['classroom', 'class', 'papers', 'scripts', 'script', 'planning', 'plan', 'prepare', 'preparing', 'practise', 'practice', 'practicing', 'discuss', 'discussing'],
      ['stage', 'rehearse', 'rehearsing', 'rehearsal', 'perform', 'performing', 'acting', 'lights', 'show', 'scene', 'theatre', 'theater'],
      ['line', 'lined', 'bow', 'end', 'finish', 'finished', 'audience', 'applause', 'clap', 'clapping', 'proud', 'success', 'successful', 'watching', 'standing', 'final', 'performance'],
    ],
    need: 3, minWords: 30, features: [{ list: SEQUENCING, count: 2, label: 'sequencing' }],
  },
  { // Q4 — why lined up & what helped
    ideas: [
      ['line', 'lined', 'bow', 'bowing', 'finish', 'finished', 'end', 'applause', 'audience', 'show', 'performance', 'curtain', 'watch', 'watching', 'proud', 'thank', 'thanking', 'waiting', 'results', 'feedback'],
      ['team', 'teamwork', 'together', 'practice', 'practise', 'practised', 'practiced', 'rehearse', 'rehearsed', 'rehearsal', 'prepare', 'prepared', 'preparation', 'hard work', 'help', 'helped', 'support', 'confidence', 'trust'],
    ],
    need: 2, minWords: 18, features: [{ list: REASON, count: 1, label: 'reason' }],
  },
  { // Q5 — teamwork & pressure
    ideas: [
      ['teamwork', 'team', 'together', 'cooperate', 'cooperation', 'help each other', 'communicate', 'communication', 'everyone', 'support', 'trust'],
      ['pressure', 'stress', 'stressful', 'calm', 'focus', 'focused', 'nervous', 'time', 'deadline', 'confidence', 'confident'],
      ['problem', 'problems', 'solve', 'solving', 'solution', 'fix', 'challenge', 'difficult', 'mistake', 'mistakes', 'mess'],
    ],
    need: 3, minWords: 22, features: [{ list: REASON, count: 1, label: 'reason' }],
  },
  { // Q6 — different audiences
    ideas: [],
    audiences: 2, minWords: 25,
    features: [{ list: CONTRAST, count: 1, label: 'contrast' }, { list: REASON, count: 1, label: 'reason' }],
  },
];

// Teacher-facing descriptor of what earns full marks (no keyword lists)
export const SPEAKING_DESCRIPTORS = [
  'Full marks: a full sentence describing at least three things in the picture (people, place, action).',
  'Full marks: says what happens next in a full sentence, with detail, using a sequencing word (then, next, after…).',
  'Full marks: tells the story across all three pictures in order, linked with sequencing words.',
  'Full marks: explains why, with a reason (because, so…) and what helped them succeed.',
  'Full marks: explains teamwork, pressure and problem-solving, with reasons.',
  'Full marks: compares at least two audiences’ views, using contrast (but, however, whereas…) and reasons.',
];

// ── Helpers ──────────────────────────────────────────────────
function normalise(text) {
  return ` ${String(text || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function has(normText, phrase) {
  return normText.includes(` ${phrase} `);
}

function countDistinct(normText, list) {
  return list.filter((p) => has(normText, p)).length;
}

const FILLERS = new Set(['um', 'umm', 'uh', 'uhh', 'er', 'erm', 'ah', 'hmm', 'like', 'yeah', 'ok', 'okay']);

/**
 * Score one spoken answer.
 * @returns {{ score: 0|1|2, reason: string }}
 */
export function scoreSpeakingAnswer(answerText, questionIndex, yearGroup = 'junior') {
  const rubric = (yearGroup === 'senior' ? RUBRIC_SENIOR : RUBRIC_JUNIOR)[questionIndex];
  const norm = normalise(answerText);
  const words = norm.trim().split(' ').filter((w) => w && !FILLERS.has(w));
  if (!rubric || words.length === 0) return { score: 0, reason: 'No response' };

  const wordCount = words.length;
  const isSentence = wordCount >= 4 && VERB_RE.test(norm);

  // Relevance
  let relevant;
  let enoughContent;
  if (rubric.audiences) {
    const audiences = countDistinct(norm, AUDIENCE_WORDS);
    relevant = audiences >= 1 || countDistinct(norm, CONTRAST) >= 1;
    enoughContent = audiences >= rubric.audiences;
  } else {
    const matched = rubric.ideas.filter((group) => group.some((p) => has(norm, p))).length;
    relevant = matched >= 1;
    enoughContent = matched >= rubric.need;
  }

  if (!relevant) {
    return { score: 0, reason: 'Not relevant to the question or pictures' };
  }

  const missingFeatures = (rubric.features || []).filter((f) => countDistinct(norm, f.list) < f.count);
  const longEnough = wordCount >= rubric.minWords;

  if (enoughContent && isSentence && longEnough && missingFeatures.length === 0) {
    return { score: 2, reason: 'Relevant, developed answer in full sentences' };
  }

  // Explain what held it back
  const gaps = [];
  if (!isSentence) gaps.push('too brief — not a full sentence');
  if (!enoughContent) gaps.push(rubric.audiences ? 'needs more than one point of view' : 'needs more relevant detail');
  if (!longEnough && isSentence) gaps.push('answer too short for this question');
  missingFeatures.forEach((f) => {
    if (f.label === 'sequencing') gaps.push('no sequencing words (then, next, after…)');
    if (f.label === 'reason') gaps.push('no reason given (because, so…)');
    if (f.label === 'contrast') gaps.push('no contrast (but, however, whereas…)');
  });
  return { score: 1, reason: `Partly answered — ${gaps.join('; ')}` };
}

export function getSpeakingCefr(total) {
  if (total <= 2) return 'A1';
  if (total <= 4) return 'A2';
  if (total <= 6) return 'B1';
  if (total <= 8) return 'B2';
  if (total <= 10) return 'C1';
  return 'C2';
}
