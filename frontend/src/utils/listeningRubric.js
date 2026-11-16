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
 * Phonetic & common speech-to-text sound-alike normalizer.
 * Fixes common browser speech engine misinterpretations for ESL accents.
 */
function normalizeSpokenText(text) {
  if (!text) return '';
  let clean = text.toLowerCase();

  const soundAlikes = [
    { regex: /\babu\s+daby\b|\babudhabi\b|\babu\s+dhabee\b/g, replace: 'abu dhabi' },
    { regex: /\bmath\b/g, replace: 'maths' },
    { regex: /\bfort\s+night\b/g, replace: 'fortnite' },
    { regex: /\bplay\s+station\b/g, replace: 'playstation' },
    { regex: /\bone\s+foot\b/g, replace: 'on foot' },
    { regex: /\bby\s+call\b/g, replace: 'by car' },
    { regex: /\byear\s+old\b/g, replace: 'years old' },
    { regex: /\bfoot\s+ball\b/g, replace: 'football' },
    { regex: /\bv\s+game\b|\bvideo\s+game\b/g, replace: 'videogames' },
    { regex: /\buni\b/g, replace: 'university' }
  ];

  soundAlikes.forEach(({ regex, replace }) => {
    clean = clean.replace(regex, replace);
  });

  return clean;
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
      confidence: 'none',
      reason: 'No response recorded'
    };
  }

  const raw = answerText.trim();
  const normalized = normalizeSpokenText(raw);
  const words = normalized.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const item = customItem || (LISTENING_PART_1_QUESTIONS && LISTENING_PART_1_QUESTIONS[questionIndex]);
  if (!item) {
    return {
      score: wordCount >= 3 ? 2 : (wordCount > 0 ? 1 : 0),
      detectedKeywords: [],
      relatableKeywords: [],
      wordCount,
      confidence: wordCount >= 3 ? 'medium' : (wordCount > 0 ? 'low' : 'none'),
      reason: wordCount >= 3 ? 'Spoken response provided' : (wordCount > 0 ? 'Brief response' : 'No response')
    };
  }

  const rawKeyPhrases = item.keyPhrases || item.aiKeywords || item.keywords || [];
  const rawRelatablePhrases = item.relatablePhrases || [];

  const detectedKeywords = [];
  const relatableKeywords = [];

  // Match main key phrases (sorted by length descending for greedy match)
  const sortedPhrases = [...rawKeyPhrases].sort((a, b) => b.length - a.length);
  for (const phrase of sortedPhrases) {
    const escaped = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, 'i');
    if (regex.test(normalized)) {
      if (!detectedKeywords.includes(phrase)) {
        detectedKeywords.push(phrase);
      }
    }
  }

  // Match relatable / semantic phrases
  const sortedRelatable = [...rawRelatablePhrases].sort((a, b) => b.length - a.length);
  for (const phrase of sortedRelatable) {
    const escaped = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, 'i');
    if (regex.test(normalized)) {
      if (!relatableKeywords.includes(phrase) && !detectedKeywords.includes(phrase)) {
        relatableKeywords.push(phrase);
      }
    }
  }

  // Detect general categories (pronouns, time markers)
  const detectedCategories = [];
  (item.categoryKeywords || []).forEach(cat => {
    const list = GENERAL_CATEGORIES[cat] || [];
    list.forEach(w => {
      const regex = new RegExp(`(?:^|\\b)${w}(?:\\b|$)`, 'i');
      if (regex.test(normalized) && !detectedCategories.includes(w)) {
        detectedCategories.push(w);
      }
    });
  });

  const hasNumbers = /\b\d{1,2}\b/.test(normalized);
  if (!customItem && questionIndex === 1 && hasNumbers) {
    const num = normalized.match(/\b\d{1,2}\b/)[0];
    if (!detectedKeywords.includes(`${num} years`)) {
      detectedKeywords.push(`${num} years`);
    }
  }

  const totalMatches = detectedKeywords.length + relatableKeywords.length;

  let score = 0;
  let reason = '';

  if (wordCount === 0) {
    score = 0;
    reason = 'No response';
  } else if (!customItem && questionIndex === 0) {
    // Q1: Name
    if (totalMatches > 0 || wordCount >= 1) {
      score = 2;
      reason = 'Full comprehension: Name provided';
    } else {
      score = 1;
      reason = 'Some comprehension';
    }
  } else if (!customItem && questionIndex === 1) {
    // Q2: Age
    if (totalMatches > 0 || hasNumbers) {
      score = 2;
      reason = 'Full comprehension: Age provided';
    } else if (wordCount > 0) {
      score = 1;
      reason = 'Some comprehension';
    }
  } else if (!customItem && questionIndex === 4) {
    // Q5: Brothers & Sisters
    if (totalMatches >= 1 && (wordCount >= 2 || normalized.includes('yes') || normalized.includes('no'))) {
      score = 2;
      reason = 'Full comprehension: Family details provided';
    } else if (totalMatches >= 1 || wordCount >= 1) {
      score = 1;
      reason = 'Some comprehension: Brief family answer';
    }
  } else if (totalMatches >= 2 || (totalMatches >= 1 && wordCount >= 3)) {
    // Target keywords or relatable phrasing in full context
    score = 2;
    reason = `Full comprehension (${totalMatches} relevant keyword/concept${totalMatches > 1 ? 's' : ''} matched)`;
  } else if (totalMatches >= 1) {
    // Good response with a relatable keyword
    score = wordCount >= 2 ? 2 : 1;
    reason = wordCount >= 2 ? 'Full comprehension: Direct relatable answer' : 'Some comprehension: Keyword mentioned';
  } else if (detectedCategories.length > 0 || wordCount >= 3) {
    score = 1;
    reason = 'Some comprehension: General context detected';
  } else {
    score = wordCount >= 1 ? 1 : 0;
    reason = wordCount >= 1 ? 'Minimal response' : 'No response';
  }

  return {
    score,
    detectedKeywords,
    relatableKeywords,
    wordCount,
    confidence: totalMatches > 0 ? 'high' : (wordCount > 2 ? 'medium' : 'low'),
    reason
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
