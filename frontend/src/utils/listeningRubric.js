/**
 * AI Keywords & Rubric for Listening Assessment Part 1
 * Year 7 - 13 / Grade 6 - 12
 * 100% Free In-Browser Semantic Understanding & Voice Acknowledgement
 */

export const GENERAL_CATEGORIES = {
  pronouns: ['he', 'she', 'they', 'student', 'i', 'we', 'my', 'his', 'her', 'our', 'them'],
  time: ['later', 'after', 'future', 'plan', 'plans', 'next', 'before', 'tonight', 'soon', 'will', 'going to']
};

export const LISTENING_PART_1_QUESTIONS = [
  {
    id: 1,
    question: 'What is your name?',
    keyPhrases: [
      'name', 'my name is', 'i am', "i'm", 'he is', 'she is', 'call me',
      'they call me', 'everyone calls me', 'it is', "it's", 'this is'
    ],
    relatablePhrases: [
      'myself', 'first name', 'surname', 'family name'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 2,
    question: 'What is your age?',
    keyPhrases: [
      'age', 'years old', 'i am', "i'm", 'years', 'year old',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
      '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'
    ],
    relatablePhrases: [
      'turning', 'turned', 'almost', 'nearly', 'birthday'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 3,
    question: 'What language do you speak at home?',
    keyPhrases: [
      'language', 'speak', 'at home', 'english', 'arabic', 'urdu', 'mother tongue',
      'hindi', 'tagalog', 'filipino', 'french', 'spanish', 'bengali', 'persian', 'farsi',
      'turkish', 'russian', 'malayalam', 'tamil', 'telugu', 'somali', 'pashto', 'punjabi',
      'swahili', 'mandarin', 'chinese', 'japanese', 'korean', 'german', 'italian'
    ],
    relatablePhrases: [
      'first language', 'native language', 'talk with my parents', 'communicate',
      'bilingual', 'home language', 'with family', 'dialect'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 4,
    question: 'Where do you live?',
    keyPhrases: [
      'live', 'city', 'town', 'country', 'abu dhabi', 'home',
      'dubai', 'sharjah', 'ajman', 'al ain', 'uae', 'united arab emirates',
      'house', 'apartment', 'flat', 'villa'
    ],
    relatablePhrases: [
      'khalifa city', 'yas island', 'reem island', 'corniche', 'al reem', 'al bateen',
      'downtown', 'neighborhood', 'suburb', 'area', 'stay in', 'reside', 'compound', 'near the'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 5,
    question: 'Have you got brothers and sisters?',
    keyPhrases: [
      'brothers', 'sisters', 'siblings', 'brother', 'sister', 'yes', 'no',
      'only child', 'have got', 'have one', 'have two', 'have three', 'have four',
      'none', "don't have", 'do not have', 'no siblings', 'just me'
    ],
    relatablePhrases: [
      'twin', 'older brother', 'younger brother', 'older sister', 'younger sister',
      'elder', 'baby brother', 'baby sister', 'family', 'sibling'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 6,
    question: 'What hobbies or sports do you like?',
    keyPhrases: [
      'hobbies', 'sports', 'football', 'reading', 'swimming', 'gaming', 'like',
      'soccer', 'basketball', 'cricket', 'drawing', 'painting', 'games', 'play',
      'video games', 'music', 'tennis', 'badminton', 'volleyball', 'running',
      'athletics', 'karate', 'gymnastics', 'cycling', 'bike', 'guitar', 'piano'
    ],
    relatablePhrases: [
      'playstation', 'ps5', 'xbox', 'fortnite', 'roblox', 'fifa', 'minecraft',
      'watching movies', 'sketching', 'anime', 'cooking', 'baking', 'coding',
      'chess', 'martial arts', 'listening to music', 'enjoy', 'favourite hobby'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 7,
    question: 'How did you come to school today?',
    keyPhrases: [
      'bus', 'car', 'walk', 'walked', 'taxi', 'transport', 'came by',
      'drive', 'drove', 'by bus', 'by car', 'by foot', 'school bus', 'bicycle',
      'bike', 'cycle', 'scooter', 'metro', 'train', 'on foot'
    ],
    relatablePhrases: [
      'dropped me', 'picked me', 'dad drove', 'mom drove', 'mother took me',
      'father brought me', 'parents', 'driver', 'uber', 'careem', 'rode with'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 8,
    question: 'Did you go to school in another place? Where?',
    keyPhrases: [
      'yes', 'no', 'another school', 'country', 'city', 'location',
      'different school', 'before', 'moved', 'transferred', 'other school', 'came from',
      'never', 'always here', 'first school'
    ],
    relatablePhrases: [
      'in my country', 'studied in', 'egypt', 'uk', 'england', 'india', 'pakistan',
      'philippines', 'syria', 'jordan', 'lebanon', 'canada', 'america', 'usa',
      'dubai', 'sharjah', 'another place', 'overseas', 'abroad', 'foreign'
    ],
    categoryKeywords: ['pronouns', 'time']
  },
  {
    id: 9,
    question: 'Tell me about your last school.',
    keyPhrases: [
      'last school', 'teachers', 'subjects', 'friends', 'building', 'experience',
      'old school', 'good', 'nice', 'big', 'small', 'students', 'liked', 'miss it',
      'fun', 'previous school', 'strict', 'classmates', 'campus'
    ],
    relatablePhrases: [
      'playground', 'principal', 'uniform', 'class size', 'different', 'enjoyed it',
      'memories', 'friendly', 'lots of friends', 'activities'
    ],
    categoryKeywords: ['pronouns', 'time']
  },
  {
    id: 10,
    question: 'What was your best subject?',
    keyPhrases: [
      'best subject', 'favourite', 'favorite', 'maths', 'math', 'science', 'english', 'art',
      'history', 'geography', 'pe', 'physical education', 'ict', 'computer', 'music',
      'biology', 'chemistry', 'physics', 'drama', 'social studies'
    ],
    relatablePhrases: [
      'good at', 'enjoy most', 'prefer', 'easiest', 'love', 'highest score', 'top mark'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 11,
    question: 'What did you not like in school?',
    keyPhrases: [
      'dislike', "didn't like", 'did not like', 'homework', 'subject', 'rules', 'behaviour', 'behavior',
      'hate', 'exams', 'tests', 'strict', 'boring', 'detention', 'hard', 'difficult'
    ],
    relatablePhrases: [
      'waking up early', 'morning', 'canteen', 'food', 'uniform', 'noise', 'long hours',
      'strict teachers', 'stress', 'quizzes', 'too much work'
    ],
    categoryKeywords: ['pronouns']
  },
  {
    id: 12,
    question: 'What will you do after school today?',
    keyPhrases: [
      'after school', 'go home', 'study', 'play', 'activities', 'plans',
      'relax', 'sleep', 'homework', 'eat', 'videogames', 'friends', 'sports', 'tv'
    ],
    relatablePhrases: [
      'take a nap', 'rest', 'watch netflix', 'youtube', 'hang out', 'dinner',
      'football practice', 'gym', 'cycling', 'family time', 'chilling'
    ],
    categoryKeywords: ['time', 'pronouns']
  },
  {
    id: 13,
    question: 'What would you like to do when you finish school?',
    keyPhrases: [
      'future', 'job', 'career', 'university', 'study', 'work', 'dream',
      'college', 'doctor', 'engineer', 'pilot', 'teacher', 'business', 'degree',
      'work as', 'scientist', 'lawyer', 'nurse', 'architect', 'programmer', 'police'
    ],
    relatablePhrases: [
      'software engineer', 'dentist', 'businessman', 'businesswoman', 'entrepreneur',
      'artist', 'chef', 'help people', 'earn money', 'travel the world', 'higher education'
    ],
    categoryKeywords: ['time', 'pronouns']
  }
];

export const QUESTIONS_TEXT = LISTENING_PART_1_QUESTIONS.map(q => q.question);

/**
 * Computes Levenshtein edit distance between two strings
 */
export function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1 || !s2) return Math.max(s1 ? s1.length : 0, s2 ? s2.length : 0);
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Fast fuzzy matching for spoken words — accommodates accents, dropped letters, and slight STT errors
 */
export function isFuzzyWordMatch(word, target) {
  const w = (word || "").toLowerCase();
  const t = (target || "").toLowerCase();
  if (w === t) return true;
  if (Math.abs(w.length - t.length) > 2) return false;
  if (t.length <= 4) {
    return t.length >= 3 && levenshteinDistance(w, t) <= 1;
  }
  if (t.length <= 8) {
    return levenshteinDistance(w, t) <= (t.length >= 7 ? 2 : 1);
  }
  return levenshteinDistance(w, t) <= 2;
}

const NUMBER_WORDS_MAP = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
};

/**
 * Phonetic & common speech-to-text sound-alike normalizer.
 * Fixes common browser speech engine misinterpretations for ESL accents.
 */
function normalizeSpokenText(text) {
  if (!text) return "";
  let clean = text.toLowerCase();

  // Contraction & colloquial expansions
  const contractions = [
    { regex: /\bi['’]m\b|\bim\b/g, replace: "i am" },
    { regex: /\bcan['’]t\b|\bcant\b/g, replace: "cannot" },
    { regex: /\bdon['’]t\b|\bdont\b/g, replace: "do not" },
    { regex: /\bdidn['’]t\b|\bdidnt\b/g, replace: "did not" },
    { regex: /\bit['’]s\b|\bits\b/g, replace: "it is" },
    { regex: /\bthey['’]re\b|\btheyre\b/g, replace: "they are" },
    { regex: /\bwe['’]re\b|\bwere\b/g, replace: "we are" },
    { regex: /\bwanna\b/g, replace: "want to" },
    { regex: /\bgonna\b/g, replace: "going to" },
    { regex: /\bdunno\b/g, replace: "do not know" },
    { regex: /\bcos\b|\bcuz\b/g, replace: "because" },
    { regex: /\byeah\b|\byep\b|\bya\b/g, replace: "yes" },
    { regex: /\bnope\b|\bnah\b/g, replace: "no" },
    { regex: /\bmum\b|\bmommy\b|\bmummy\b/g, replace: "mom" },
    { regex: /\bdaddy\b|\bpapa\b/g, replace: "dad" },
  ];

  contractions.forEach(({ regex, replace }) => {
    clean = clean.replace(regex, replace);
  });

  const soundAlikes = [
    { regex: /\babu\s+daby\b|\babudhabi\b|\babu\s+dhabee\b/g, replace: "abu dhabi" },
    { regex: /\bmath\b/g, replace: "maths" },
    { regex: /\bfort\s+night\b/g, replace: "fortnite" },
    { regex: /\bplay\s+station\b/g, replace: "playstation" },
    { regex: /\bone\s+foot\b/g, replace: "on foot" },
    { regex: /\bby\s+call\b|\bby\s+care\b/g, replace: "by car" },
    { regex: /\byear\s+old\b/g, replace: "years old" },
    { regex: /\bfoot\s+ball\b|\bfootbal\b/g, replace: "football" },
    { regex: /\bv\s+game\b|\bvideo\s+game\b/g, replace: "videogames" },
    { regex: /\buni\b/g, replace: "university" },
    { regex: /\bfavorit\b|\bfavourit\b|\bfav\b/g, replace: "favourite" },
    { regex: /\bscool\b|\bskool\b/g, replace: "school" },
    { regex: /\blibary\b/g, replace: "library" },
    { regex: /\bsience\b/g, replace: "science" },
    { regex: /\bbusy\b(?=\s+stop|\s+drive)/g, replace: "bus" },
    { regex: /\bengland\b|\bbritain\b|\buk\b/g, replace: "united kingdom" },
  ];

  soundAlikes.forEach(({ regex, replace }) => {
    clean = clean.replace(regex, replace);
  });

  return clean;
}

/**
 * Checks if a phrase matches in spoken text (exact, contiguous with filler tolerance, or single-word fuzzy)
 */
function matchesPhraseFuzzy(text, phrase, wordsList) {
  const normPhrase = (phrase || "").toLowerCase().trim();
  if (!normPhrase) return false;

  // Direct exact substring match
  const escaped = normPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const directRegex = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i");
  if (directRegex.test(text)) return true;

  // Multi-word phrase check (allow 0 or 1 filler word in between)
  const parts = normPhrase.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    const pattern = parts
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("(?:\\s+\\w+){0,1}\\s+");
    return new RegExp(`(?:^|\\b)${pattern}(?:\\b|$)`, "i").test(text);
  }

  // Single word fuzzy matching across spoken word tokens
  return wordsList.some((w) => isFuzzyWordMatch(w, normPhrase));
}

const FILLERS_RE = /\b(um+|uh+|er+|ah+|hmm+|you\s+know|basically|actually|well|i\s+mean)\b/gi;
// A sentence needs a subject the pupil says ("I", "my", "we", "it", "there"...)
const SUBJECT_RE = /\b(i|my|me|mine|we|our|us|he|his|she|her|they|their|them|it|there|this|that)\b/;
// ...or a verb ("Pizza is my favourite", "Ali and Omar play with me")
const VERB_RE = /\b(am|is|are|was|were|be|been|have|has|had|do|does|did|like|likes|liked|love|loves|live|lives|lived|go|goes|went|play|plays|played|eat|eats|ate|can|will|call|called|born|got|get|gets|come|came|walk|walked|take|took|want|wants|enjoy|enjoys|wake|wakes|woke|travel|travels|watch|watches|read|reads|help|helps|work|works|study|studies)\b/;
const MIN_SENTENCE_WORDS = 3;

/**
 * Is this a full-sentence answer to the question?
 * One- or two-word answers ("Shakir", "Yes", "Pizza") are NOT acceptable —
 * the pupil must answer in a sentence ("My name is Shakir").
 * @returns {{ acceptable: boolean|null, wordCount: number, reason: string }}
 *          acceptable is null when nothing has been said yet.
 */
/** Spoken text prepared for keyword matching: "6:30" → "6 30", "six" → "6" */
function keywordText(answerText) {
  let text = normalizeSpokenText(answerText || '')
    .replace(/(\d)[:.](\d)/g, '$1 $2')
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const withDigits = Object.entries(NUMBER_WORDS_MAP).reduce(
    (t, [word, digit]) => t.replace(new RegExp(`\\b${word}\\b`, 'g'), digit),
    text,
  );
  return { text, withDigits, words: text.split(' ').filter(Boolean) };
}

/**
 * Which of the given keywords/phrases appear in the answer (fuzzy, accent-tolerant).
 * Keywords are only used internally for marking — never shown on screen.
 */
export function findKeywords(answerText, phrases = []) {
  const { text, withDigits, words } = keywordText(answerText);
  if (!text) return [];
  return phrases.filter(
    (p) => matchesPhraseFuzzy(text, p, words) || matchesPhraseFuzzy(withDigits, p, words),
  );
}

/**
 * Marks an answer against an answer key made of "ideas". Each idea is a list of
 * alternative keywords; an idea counts if any one of them is said.
 *   key = { ideas: [["bus"], ["football","soccer"]], need?: number }
 * 2 = every needed idea given in a full sentence, 1 = partly right, 0 = wrong / none.
 */
export function scoreAgainstKey(answerText, key) {
  const ideas = key?.ideas || [];
  const need = Math.min(key?.need || ideas.length, ideas.length);
  const sentence = judgeSentenceAnswer('', answerText);
  if (!sentence.wordCount) return { score: 0, matched: 0, need, reason: 'No response' };
  const matched = ideas.filter((alts) => findKeywords(answerText, alts).length > 0).length;
  if (matched === 0) {
    return { score: 0, matched, need, reason: 'Answer does not match the listening text' };
  }
  if (matched >= need && sentence.acceptable) {
    return { score: 2, matched, need, reason: 'Correct and complete answer' };
  }
  return {
    score: 1,
    matched,
    need,
    reason:
      matched < need
        ? `Partly correct (${matched} of ${need} key points)`
        : `Correct, but ${sentence.reason.toLowerCase()}`,
  };
}

/**
 * @param keyPhrases optional words that show the answer is ON TOPIC for the
 *        question (e.g. "born", "from" for "Where were you born?"). When given,
 *        a sentence that doesn't use any of them is not acceptable.
 */
export function judgeSentenceAnswer(questionText, answerText, keyPhrases = null) {
  const normalized = normalizeSpokenText(answerText || '').replace(FILLERS_RE, ' ');
  const words = normalized.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount === 0) return { acceptable: null, wordCount, reason: 'No response yet' };
  if (wordCount < MIN_SENTENCE_WORDS) {
    return {
      acceptable: false,
      wordCount,
      reason: `${wordCount === 1 ? 'One-word' : 'Two-word'} answer: a full sentence is needed`,
    };
  }
  const joined = words.join(' ');
  if (!SUBJECT_RE.test(joined) && !VERB_RE.test(joined)) {
    return { acceptable: false, wordCount, reason: 'Not a full sentence (just a list of words)' };
  }
  if (keyPhrases && keyPhrases.length && findKeywords(answerText, keyPhrases).length === 0) {
    return { acceptable: false, wordCount, reason: 'Does not answer the question asked' };
  }
  return {
    acceptable: true,
    wordCount,
    reason: keyPhrases ? 'Full-sentence answer to the question' : 'Full-sentence answer',
  };
}

/**
 * Fast real-time evaluation of a student's answer.
 * Understands both target keywords and natural/relatable everyday student expressions.
 * Runs 100% free with 0ms latency in the browser.
 */
export function evaluateAnswer(questionIndex, answerText, customItem = null) {
  if (!answerText || !answerText.trim()) {
    return {
      score: 0,
      detectedKeywords: [],
      relatableKeywords: [],
      wordCount: 0,
      confidence: "none",
      reason: "No response recorded",
    };
  }

  const raw = answerText.trim();
  const normalized = normalizeSpokenText(raw);

  // Clean filler words ("um", "uh", "like", "you know") for cleaner semantic analysis
  const withoutFillers = normalized.replace(
    /\b(um+|uh+|er+|ah+|like|you\s+know|basically|actually|well|i\s+mean)\b/gi,
    " "
  );
  const words = withoutFillers
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const wordCount = words.length;

  // Also build normalized string where number words are converted to digits
  let normalizedWithDigits = normalized;
  Object.entries(NUMBER_WORDS_MAP).forEach(([word, digit]) => {
    normalizedWithDigits = normalizedWithDigits.replace(
      new RegExp(`\\b${word}\\b`, "g"),
      digit
    );
  });

  const item =
    customItem ||
    (LISTENING_PART_1_QUESTIONS && LISTENING_PART_1_QUESTIONS[questionIndex]);

  if (!item) {
    const judged = judgeSentenceAnswer("", raw);
    const score = judged.acceptable ? 2 : judged.wordCount >= 2 ? 1 : 0;
    return {
      score,
      detectedKeywords: [],
      relatableKeywords: [],
      wordCount,
      confidence: score === 2 ? "medium" : wordCount > 0 ? "low" : "none",
      reason: judged.acceptable ? "Full-sentence response" : judged.reason,
    };
  }

  const rawKeyPhrases =
    item.keyPhrases || item.aiKeywords || item.keywords || [];
  const rawRelatablePhrases = item.relatablePhrases || [];

  const detectedKeywords = [];
  const relatableKeywords = [];

  // Match main key phrases (sorted by length descending for greedy match)
  const sortedPhrases = [...rawKeyPhrases].sort((a, b) => b.length - a.length);
  for (const phrase of sortedPhrases) {
    if (
      matchesPhraseFuzzy(normalized, phrase, words) ||
      matchesPhraseFuzzy(normalizedWithDigits, phrase, words)
    ) {
      if (!detectedKeywords.includes(phrase)) {
        detectedKeywords.push(phrase);
      }
    }
  }

  // Match relatable / semantic phrases
  const sortedRelatable = [...rawRelatablePhrases].sort(
    (a, b) => b.length - a.length
  );
  for (const phrase of sortedRelatable) {
    if (
      matchesPhraseFuzzy(normalized, phrase, words) ||
      matchesPhraseFuzzy(normalizedWithDigits, phrase, words)
    ) {
      if (
        !relatableKeywords.includes(phrase) &&
        !detectedKeywords.includes(phrase)
      ) {
        relatableKeywords.push(phrase);
      }
    }
  }

  // Detect general categories (pronouns, time markers)
  const detectedCategories = [];
  (item.categoryKeywords || []).forEach((cat) => {
    const list = GENERAL_CATEGORIES[cat] || [];
    list.forEach((w) => {
      const regex = new RegExp(`(?:^|\\b)${w}(?:\\b|$)`, "i");
      if (
        (regex.test(normalized) || regex.test(normalizedWithDigits)) &&
        !detectedCategories.includes(w)
      ) {
        detectedCategories.push(w);
      }
    });
  });

  // Number / Age detection
  const hasNumbers = /\b\d{1,2}\b/.test(normalizedWithDigits);
  if (!customItem && questionIndex === 1 && hasNumbers) {
    const num = normalizedWithDigits.match(/\b\d{1,2}\b/)[0];
    if (!detectedKeywords.includes(`${num} years`)) {
      detectedKeywords.push(`${num} years`);
    }
  }

  const totalMatches = detectedKeywords.length + relatableKeywords.length;

  let score = 0;
  let reason = "";

  if (wordCount === 0) {
    score = 0;
    reason = "No response";
  } else if (!customItem && questionIndex === 0) {
    // Q1: Name
    // Must actually give a name ("My name is…", "I am…", "Call me…")
    if (totalMatches > 0) {
      score = 2;
      reason = "Full comprehension: Name provided";
    } else {
      score = 0;
      reason = "Not acceptable: answer does not give a name";
    }
  } else if (!customItem && questionIndex === 1) {
    // Q2: Age
    if (totalMatches > 0 || hasNumbers) {
      score = 2;
      reason = "Full comprehension: Age provided";
    } else if (wordCount > 0) {
      score = 1;
      reason = "Some comprehension";
    }
  } else if (!customItem && questionIndex === 4) {
    // Q5: Brothers & Sisters
    if (
      totalMatches >= 1 &&
      (wordCount >= 2 ||
        normalized.includes("yes") ||
        normalized.includes("no") ||
        normalized.includes("only child") ||
        normalized.includes("none"))
    ) {
      score = 2;
      reason = "Full comprehension: Family details provided";
    } else if (totalMatches >= 1 || wordCount >= 1) {
      score = 1;
      reason = "Some comprehension: Brief family answer";
    }
  } else if (totalMatches >= 2 || (totalMatches >= 1 && wordCount >= 3)) {
    // Target keywords or relatable phrasing in full context
    score = 2;
    reason = `Full comprehension (${totalMatches} relevant keyword/concept${
      totalMatches > 1 ? "s" : ""
    } matched)`;
  } else if (totalMatches >= 1) {
    // Good response with a relatable keyword
    score = wordCount >= 2 ? 2 : 1;
    reason =
      wordCount >= 2
        ? "Full comprehension: Direct relatable answer"
        : "Some comprehension: Keyword mentioned";
  } else {
    // No keyword for this question: the answer doesn't show the pupil understood it
    score = 0;
    reason =
      wordCount >= 1
        ? "Not acceptable: answer does not match the question"
        : "No response";
  }

  // One-word answers are not acceptable; two words earn at most partial credit.
  // Full marks need a full sentence (e.g. "My name is Sara", not "Sara").
  const sentence = judgeSentenceAnswer(item.question || "", raw);
  if (sentence.wordCount <= 1) {
    score = 0;
    reason = "Not acceptable: one-word answer (a full sentence is needed)";
  } else if (!sentence.acceptable && score > 1) {
    score = 1;
    reason = `Partial: ${sentence.reason}`;
  }

  return {
    score,
    detectedKeywords,
    relatableKeywords,
    wordCount,
    confidence: totalMatches > 0 ? "high" : wordCount > 2 ? "medium" : "low",
    reason,
  };
}

/**
 * Generates natural, relatable spoken voice acknowledgements (100% Free via SpeechSynthesis).
 * Gives the student an encouraging conversational experience!
 */
export function getRelatableVoiceAck(questionIndex, studentAnswer, evaluation) {
  if (!studentAnswer || !studentAnswer.trim() || evaluation.score === 0) {
    return "Thank you. Let's move to the next question.";
  }

  const text = studentAnswer.toLowerCase();

  switch (questionIndex) {
    case 0: { // Name
      const words = studentAnswer.trim().split(/\s+/);
      const name = words[words.length - 1];
      return `Nice to meet you, ${name}! Let's continue.`;
    }
    case 1: // Age
      return "Got it, thank you! Let's go to the next question.";
    case 2: // Language
      return "That's wonderful! It's great to be multilingual.";
    case 3: // Where do you live
      if (text.includes('abu dhabi')) return "Abu Dhabi is a wonderful city to live in!";
      return "Thank you, that's good to know.";
    case 4: // Brothers/Sisters
      return "Thank you for telling me about your family.";
    case 5: // Hobbies/Sports
      return "That sounds like a lot of fun! Good for you.";
    case 6: // Transport
      return "Good to hear you arrived safely today.";
    case 7: // School elsewhere
      return "Thank you for sharing your school journey.";
    case 8: // Last school
      return "Thank you for telling me about your previous school.";
    case 9: // Best subject
      return "That is a fantastic subject to enjoy!";
    case 10: // Dislike
      return "I understand, thank you for being honest.";
    case 11: // After school
      return "Enjoy your plans after school today!";
    case 12: // Future finish school
      return "That is an inspiring ambition for your future! Well done, you have completed the assessment.";
    default:
      return "Thank you! Moving on.";
  }
}
