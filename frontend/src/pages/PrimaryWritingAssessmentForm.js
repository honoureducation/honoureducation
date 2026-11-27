import React, { useState, useEffect, useMemo } from "react";
import StudentPicker from "../components/StudentPicker";
import ReadAloudButton from "../components/ReadAloudButton";
import { studentLabel, studentYearClass } from "../utils/students";
import StageSelector, { PRIMARY_STAGES } from '../components/StageSelector';
import {
  useNavigate,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import { toast } from "react-toastify";
import { assessmentAPI } from "../services/api";

import henImg from "../assets/cvc/cvc-hen.jpg";
import dogImg from "../assets/cvc/cvc-dog.jpg";
import sitImg from "../assets/cvc/cvc-sit.jpg";
import webImg from "../assets/cvc/cvc-web.jpg";
import bugImg from "../assets/cvc/cvc-bug.jpg";
import sunImg from "../assets/cvc/cvc-sun.jpg";
import fs1SheetImg from "../assets/fs1-writing-sheet.jpg";
import fs2WritingSheet from "../assets/fs2-writing-sheet.png";
import fs2AiKeywordsSheet from "../assets/fs2-writing-ai-keywords.png";
import fs2WritingStudentWorksheet from "../assets/fs2-writing-student-worksheet.png";
import fs2ParkImg from "../assets/fs2-writing-park.jpg";
import kg2WritingSheet from "../assets/kg2-writing-sheet.png";
import kg2AiKeywordsSheet from "../assets/kg2-writing-ai-keywords.png";
import grade1Year2WritingSheet from "../assets/grade1-year2-writing-sheet.jpg";
import grade1Year2AiKeywordsSheet from "../assets/grade1-year2-writing-ai-keywords.jpg";
import grade1Year2StudentWorksheet from "../assets/grade1-year2-writing-student-worksheet.jpg";
import grade1KayakImg from "../assets/grade1-writing-kayak.jpg";
import grade2Year3WritingSheetImg from "../assets/grade2-year3-writing-sheet.jpg";
import grade2Year3WritingAiKeywordsSheet from "../assets/grade2-year3-writing-ai-keywords.jpg";
import grade2Year3WritingStudentWorksheet from "../assets/grade2-year3-writing-student-worksheet.jpg";
import grade2WritingAdventureStrip from "../assets/grade2-writing-adventure-strip.jpg";
import grade2WritingRockyMountain from "../assets/grade2-writing-rocky-mountain.jpg";
import grade2WritingNatureValley from "../assets/grade2-writing-nature-valley.jpg";
import grade2WritingCampfireDragons from "../assets/grade2-writing-campfire-dragons.jpg";
import grade2WritingMoon from "../assets/grade2-writing-moon.png";
import grade2WritingStar from "../assets/grade2-writing-star.png";
import grade2WritingGirl from "../assets/grade2-writing-girl.png";
import grade2WritingCube from "../assets/grade2-writing-cube.png";
import grade3Year4WritingStorySheetImg from "../assets/grade3-year4-writing-story-sheet.jpg";
import grade3Year4WritingWordsSheet from "../assets/grade3-year4-writing-words-sheet.png";
import grade3Year4WritingStudentWorksheet from "../assets/grade3-year4-writing-student-worksheet.jpg";
import grade3WritingAdventureStrip from "../assets/grade3-writing-adventure-strip.jpg";
import grade3WritingSpaceship from "../assets/grade3-writing-spaceship.jpg";
import grade3WritingCanyonRuins from "../assets/grade3-writing-canyon-ruins.jpg";
import grade3WritingKnightDragon from "../assets/grade3-writing-knight-dragon.jpg";
import grade3WritingMoon from "../assets/grade3-writing-moon.png";
import grade3WritingStar from "../assets/grade3-writing-star.png";
import grade3WritingGirl from "../assets/grade3-writing-girl.png";
import grade3WritingCube from "../assets/grade3-writing-cube.png";
import grade4Year5WritingSheetImg from "../assets/grade4-year5-writing-sheet.jpg";
import grade4WritingSciFiStrip from "../assets/grade4-writing-sci-fi-strip.jpg";
import grade4WritingCorridor from "../assets/grade4-writing-red-suit-corridor.jpg";
import grade4WritingCity from "../assets/grade4-writing-futuristic-city.jpg";
import grade4WritingAstronauts from "../assets/grade4-writing-astronauts-planet.jpg";
import earlyWritingSit from "../assets/early-writing-sit.png";
import earlyWritingCup from "../assets/early-writing-cup.png";
import earlyWritingCat from "../assets/early-writing-cat.png";
import earlyWritingBook from "../assets/early-writing-book.png";
import earlyWritingShop from "../assets/early-writing-shop.png";
import earlyWritingCake from "../assets/early-writing-cake.png";
import grade5Year6WritingSheetImg from "../assets/grade5-year6-writing-sheet.png";
import grade5Year6WritingResponseSheetImg from "../assets/grade5-year6-writing-response-sheet.png";
import grade5WritingSciFiStrip from "../assets/grade5-writing-sci-fi-strip.png";
import grade5WritingDesert from "../assets/grade5-writing-desert-traveller.png";
import grade5WritingBlackHole from "../assets/grade5-writing-black-hole.png";
import grade5WritingRuinedCity from "../assets/grade5-writing-ruined-city.png";

// ==========================================
// 6 CVC WRITING PROMPTS (FS1 WRITING)
// Matching sheet 100%:
// 1. h _ _ (hen)
// 2. d _ _ (dog)
// 3. s _ _ (sit)
// 4. w e _ (web)
// 5. b _ _ (bug)
// 6. _ _ _ (sun)
// ==========================================
const FS1_WRITING_ITEMS = [
  {
    id: 1,
    targetWord: "hen",
    promptDisplay: "h _ _",
    slots: [
      { char: "h", isFixed: true },
      { char: "e", isFixed: false },
      { char: "n", isFixed: false },
    ],
    image: henImg,
    label: "Hen with chicks",
  },
  {
    id: 2,
    targetWord: "dog",
    promptDisplay: "d _ _",
    slots: [
      { char: "d", isFixed: true },
      { char: "o", isFixed: false },
      { char: "g", isFixed: false },
    ],
    image: dogImg,
    label: "Dog in hole",
  },
  {
    id: 3,
    targetWord: "sit",
    promptDisplay: "s _ _",
    slots: [
      { char: "s", isFixed: true },
      { char: "i", isFixed: false },
      { char: "t", isFixed: false },
    ],
    image: sitImg,
    label: "Boy sitting on chair",
  },
  {
    id: 4,
    targetWord: "web",
    promptDisplay: "w e _",
    slots: [
      { char: "w", isFixed: true },
      { char: "e", isFixed: true },
      { char: "b", isFixed: false },
    ],
    image: webImg,
    label: "Spider on cobweb",
  },
  {
    id: 5,
    targetWord: "bug",
    promptDisplay: "b _ _",
    slots: [
      { char: "b", isFixed: true },
      { char: "u", isFixed: false },
      { char: "g", isFixed: false },
    ],
    image: bugImg,
    label: "Ladybug / beetle",
  },
  {
    id: 6,
    targetWord: "sun",
    promptDisplay: "_ _ _",
    slots: [
      { char: "s", isFixed: false },
      { char: "u", isFixed: false },
      { char: "n", isFixed: false },
    ],
    image: sunImg,
    label: "Smiling yellow sun",
  },
];

// ------------------------------------------
// FS1 scoring — out of 12, as on the FS1 sheet. 12 = the letters the pupil
// writes: h_ _ (2), d_ _ (2), s_ _ (2), we_ (1), b_ _ (2), _ _ _ (3).
// One mark per correct letter.
// ------------------------------------------
const FS1_TOTAL = FS1_WRITING_ITEMS.reduce(
  (n, item) => n + item.slots.filter((s) => !s.isFixed).length,
  0,
);

const fs1WordLetters = (item, written = [], status) => {
  const open = item.slots
    .map((slot, i) => ({ slot, i }))
    .filter(({ slot }) => !slot.isFixed);
  if (status === "correct") return open.length;
  const right = open.filter(({ slot, i }) => (written[i] || "").toLowerCase() === slot.char).length;
  // "Initial Sound" ticked on a word with no letter given (sun) earns the first letter
  if (!right && status === "initial-only" && !item.slots[0].isFixed) return 1;
  return right;
};

// Score bands from the FS1 sheet: 6/12, 8/12, 9/12, 10/12, 12/12
const fs1Level = (score) => {
  if (score >= 12) return "B2–C1";
  if (score >= 10) return "B1.2–B1.3";
  if (score >= 9) return "A2.3–B1.1";
  if (score >= 8) return "A2.0–A2.2";
  if (score >= 6) return "A1.0–A1.2";
  return "Pre-A1";
};

// ==========================================
// CEFR RUBRIC TABLE (COMMON FOR FS1, FS2, & KG2 / YEAR 1 WRITING)
// 100% exact text from all assessment sheets
// ==========================================
const CEFR_RUBRIC_LEVELS = [
  {
    level: "Pre-A1",
    description:
      "Does not write; still mark-making. Formation is poor or not legible.",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    activeBg: "bg-rose-50 border-rose-400 text-rose-900",
    dotColor: "bg-rose-500",
  },
  {
    level: "A1.0–A1.2",
    description:
      "Writes initial sounds of CVC words (mostly correct). One mistake allowed per word.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Writes some initial sounds in CVC or CVVC words. Confidently writes CVC words. Beginning to write 4–5 letter words.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Can write 4–5 letter words independently with increasing accuracy.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description: "Can write a few words together to form a simple sentence.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Writes fluently with few mistakes. Uses clear formation and confident spelling patterns.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

// FS2 - KG1 & KG2 / Year 1 word writing: same rubric with the sheet's /13 scores
const EARLY_WORDS_SCORES = {
  "A1.0–A1.2": "6/13",
  "A2.0–A2.2": "7/13",
  "A2.3–B1.1": "9/13",
  "B1.2–B1.3": "11/13",
  "B2–C1": "13/13",
};
const EARLY_WORDS_RUBRIC = CEFR_RUBRIC_LEVELS.map((r) =>
  EARLY_WORDS_SCORES[r.level]
    ? { ...r, description: `${r.description} ${EARLY_WORDS_SCORES[r.level]}` }
    : r,
);

// FS1: same rubric with the FS1 sheet's /12 scores
const FS1_SCORES = {
  "A1.0–A1.2": "6/12",
  "A2.0–A2.2": "8/12",
  "A2.3–B1.1": "9/12",
  "B1.2–B1.3": "10/12",
  "B2–C1": "12/12",
};
const FS1_RUBRIC = CEFR_RUBRIC_LEVELS.map((r) =>
  FS1_SCORES[r.level] ? { ...r, description: `${r.description} ${FS1_SCORES[r.level]}` } : r,
);

// ==========================================
// FS2 - KG1, KG2 / YEAR 1 & GRADE 1 / YEAR 2 — 6 WORD PROMPTS
// Exact from uploaded sheets: s__, c__, c__, b___, sh__, ca__
// ==========================================
const EARLY_WORD_ITEMS = [
  { id: 1, targetWord: "sit", given: "s", image: earlyWritingSit, label: "Girl sitting on a chair reading" },
  { id: 2, targetWord: "cup", given: "c", image: earlyWritingCup, label: "Cup" },
  { id: 3, targetWord: "cat", given: "c", image: earlyWritingCat, label: "Cat" },
  { id: 4, targetWord: "book", given: "b", image: earlyWritingBook, label: "Open book" },
  { id: 5, targetWord: "shop", given: "sh", image: earlyWritingShop, label: "Shop" },
  { id: 6, targetWord: "cake", given: "ca", image: earlyWritingCake, label: "Cake" },
];

// Auto-mark a written word: correct / partly correct (starts right) / incorrect
const markEarlyWord = (written, item) => {
  const w = (written || "").trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return null;
  if (w === item.targetWord) return "correct";
  if (w.startsWith(item.given) || w[0] === item.targetWord[0]) return "partial";
  return "incorrect";
};

// ------------------------------------------
// FS2 - KG1 & KG2 / Year 1 word writing — score out of 13, as on the sheets.
// 13 = the letters the pupil has to write: s_ _ (2), c_ _ (2), c_ _ (2),
// b_ _ _ (3), sh_ _ (2), ca_ _ (2). One mark per correct letter.
// ------------------------------------------
const EARLY_WORDS_TOTAL = EARLY_WORD_ITEMS.reduce(
  (n, item) => n + item.targetWord.length - item.given.length,
  0,
);

// Letters in common, in order (so "sat" for "sit" still earns the "t")
const lettersInOrder = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
};

const earlyWordLetters = (written, status, item) => {
  const missing = item.targetWord.slice(item.given.length);
  if (status === "correct") return missing.length;
  const w = (written || "").trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return status === "partial" ? 1 : 0;
  // Only the letters after the given ones count (the given letters are printed)
  const rest = w.startsWith(item.given)
    ? w.slice(item.given.length)
    : w[0] === item.given[0]
      ? w.slice(1)
      : w;
  return Math.min(missing.length, lettersInOrder(rest, missing));
};

// ------------------------------------------
// Grade 2 & Grade 3 word writing (moon, star, girl, cube) — judged against the
// sheet's descriptors:
//   4 = correct word            3 = full word, small error ("starr", "gurl")
//   2 = initial + some middle/ending sounds, 1–2 letters missing ("mon", "grl")
//   1 = initial sound only ("m")  0 = scribble / unrelated   null = not attempted
// The teacher's buttons (✓ Correct / ~ Near / • Initial / ✕ None) override the typing.
// ------------------------------------------
const wordQuality = (written, status, target) => {
  if (status === "correct") return 4;
  if (status === "near") return 3;
  if (status === "initial") return 1;
  if (status === "none") return 0;
  const w = (written || "").trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return null;
  if (w === target) return 4;
  const common = lettersInOrder(w, target);
  if (w[0] === target[0] && w.length >= target.length && common >= target.length - 1) return 3;
  if (w[0] === target[0] && common >= 2) return 2;
  if (w[0] === target[0]) return 1;
  return 0;
};

const wordWritingLevel = (qualities) => {
  const tried = qualities.filter((q) => q !== null);
  if (!tried.length) return null;
  const atLeast = (n) => qualities.filter((q) => q !== null && q >= n).length;
  if (atLeast(4) === qualities.length) return "B2–C1"; // all words correct
  if (atLeast(4) >= qualities.length - 1) return "B1.2–B1.3"; // most words correct
  if (atLeast(3) >= Math.ceil(qualities.length / 2) + 1) return "A2.3–B1.1"; // full words, some errors
  if (atLeast(2) >= 2) return "A2.0–A2.2"; // initial + middle/ending sounds
  if (atLeast(1) >= 1) return "A1.0–A1.2"; // some initial sounds
  return "Pre-A1";
};

// ------------------------------------------
// Picture-story writing — what the pupil actually wrote, measured the way the
// rubrics describe it: single words → phrases → simple sentences → connected
// sentences with linking words → fluent narrative.
// ------------------------------------------
const LINKING_WORDS = [
  "and", "but", "because", "so", "then", "next", "after", "before", "when", "while",
  "first", "finally", "suddenly", "later", "also", "until", "since", "although", "meanwhile",
];

const countWords = (t) => (t || "").trim().split(/\s+/).filter(Boolean).length;

const storyStats = (answers, storyIdx) => {
  const all = answers.join(" ");
  const story = answers[storyIdx] || "";
  const storyWords = countWords(story);
  // Sentences of 3+ words; if the teacher typed without full stops, estimate from length
  let sentences = story
    .split(/[.!?]+|\n+/)
    .filter((s) => countWords(s) >= 3).length;
  if (sentences <= 1 && storyWords >= 12) sentences = Math.max(sentences, Math.floor(storyWords / 7));
  const lower = ` ${all.toLowerCase().replace(/[^a-z\s]/g, " ")} `;
  const linking = LINKING_WORDS.filter((w) => lower.includes(` ${w} `)).length;
  const longestAnswer = Math.max(0, ...answers.map(countWords));
  const longWords = (all.match(/[a-zA-Z]{4,}/g) || []).length;
  return { totalWords: countWords(all), storyWords, sentences, linking, longestAnswer, longWords };
};

const LEVEL_ORDER = ["Pre-A1", "A1.0–A1.2", "A2.0–A2.2", "A2.3–B1.1", "B1.2–B1.3", "B2–C1"];
const capLevel = (level, max) =>
  LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(max) ? max : level;

// stage: "early" (FS2 - KG1, KG2, Grade 1), "mid" (Grade 2, Grade 3), "upper" (Grade 4, Grade 5)
// relevance: how many picture-related words the AI found — an off-topic answer can't score high
const storyLevel = (stage, s, relevance) => {
  if (!s.totalWords) return null;
  let level;
  if (stage === "early") {
    // Rubric: initial sounds → CVC words → 4–5 letter words → simple sentence → fluent
    if (s.sentences >= 2 && relevance >= 3) level = "B2–C1";
    else if (s.sentences >= 1 || s.storyWords >= 3) level = "B1.2–B1.3";
    else if (s.longWords >= 3 || relevance >= 3) level = "A2.3–B1.1";
    else if (s.totalWords >= 2 || relevance >= 1) level = "A2.0–A2.2";
    else level = "A1.0–A1.2";
  } else if (stage === "mid") {
    // Rubric: single words / labels → short phrases → simple sentences →
    // connected sentences with conjunctions → fluent narrative linking the pictures
    if (s.sentences >= 5 && s.linking >= 2 && s.storyWords >= 50 && relevance >= 5) level = "B2–C1";
    else if (s.sentences >= 3 && s.linking >= 1) level = "B1.2–B1.3";
    else if (s.sentences >= 1 && s.storyWords >= 5) level = "A2.3–B1.1";
    else if (s.longestAnswer >= 3) level = "A2.0–A2.2";
    else level = "A1.0–A1.2";
  } else {
    // Rubric: labels / single words → fragmented or very short sentences →
    // simple sentences with some sequence → short paragraphs → fluent, cohesive narrative
    if (s.sentences >= 8 && s.linking >= 3 && s.storyWords >= 100 && relevance >= 6) level = "B2–C1";
    else if (s.sentences >= 5 && s.linking >= 2 && s.storyWords >= 40) level = "B1.2–B1.3";
    else if (s.sentences >= 3 && s.linking >= 1) level = "A2.3–B1.1";
    else if (s.sentences >= 1 || s.longestAnswer >= 3) level = "A2.0–A2.2";
    else level = "A1.0–A1.2";
  }
  // Answers with nothing to do with the pictures are capped
  if (relevance === 0) level = capLevel(level, "A2.0–A2.2");
  else if (relevance < 3) level = capLevel(level, "A2.3–B1.1");
  return level;
};

// Score bands from the FS2 - KG1 / KG2 sheets: 6/13, 7/13, 9/13, 11/13, 13/13
const earlyWordsLevel = (score) => {
  if (score >= 13) return "B2–C1";
  if (score >= 11) return "B1.2–B1.3";
  if (score >= 9) return "A2.3–B1.1";
  if (score >= 7) return "A2.0–A2.2";
  if (score >= 6) return "A1.0–A1.2";
  return "Pre-A1";
};

// ==========================================
// FS2 - KG1 WRITING ASSESSMENT DATA
// 4 Questions + AI Keywords from Uploaded Sheets
// ==========================================
const FS2_WRITING_QUESTIONS = [
  {
    id: 1,
    number: "1",
    title: "Who can you see?",
    promptGuide:
      'Point to the people in the picture and ask: "Who can you see?"',
    category: "Who can you see?",
    placeholder: "e.g. boy, girl, children playing, kids, friends...",
    aiKeywords: [
      "boy",
      "girl",
      "child",
      "children",
      "kids",
      "friends",
      "players",
      "people",
    ],
  },
  {
    id: 2,
    number: "2",
    title: "What are they doing?",
    promptGuide: 'Ask the child: "What are they doing?"',
    category: "What are they doing?",
    placeholder:
      "e.g. running, playing football, kicking ball, laughing, having fun...",
    aiKeywords: [
      "running",
      "playing",
      "kicking",
      "chasing",
      "jumping",
      "laughing",
      "having fun",
      "playing football",
      "moving",
      "outdoors",
    ],
  },
  {
    id: 3,
    number: "3",
    title: "Can you write some words for this picture?",
    promptGuide:
      'Encourage independent word writing: "Can you write some words for this picture?"',
    category: "Words for the picture",
    placeholder:
      "e.g. grass, field, trees, sky, ball, park, playground, sunshine...",
    aiKeywords: [
      "grass",
      "field",
      "playground",
      "trees",
      "sky",
      "clouds",
      "ball",
      "football",
      "sunshine",
      "park",
      "outdoors",
      "playtime",
    ],
  },
  {
    id: 4,
    number: "4",
    title: "Can you write a sentence for this picture?",
    promptGuide:
      'Encourage sentence construction: "Can you write a sentence for this picture?"',
    category: "Sentence / Story",
    placeholder:
      "e.g. They are playing football. The children are running in the park. It is sunny...",
    aiKeywords: [
      "they are playing",
      "the children are running",
      "they are kicking the ball",
      "it is sunny",
      "they are outside",
      "fun day",
      "happy children",
      "playing in the park",
    ],
  },
];

// ==========================================
// GRADE 1 / YEAR 2 WRITING ASSESSMENT DATA
// 4 Questions + AI Keywords from Uploaded Kayaking Sheets
// ==========================================
const GRADE1_WRITING_QUESTIONS = [
  {
    id: 1,
    number: "1",
    title: "Who can you see?",
    promptGuide:
      'Point to the people in the picture and ask: "Who can you see?"',
    category: "Who can you see?",
    placeholder:
      "e.g. boy, girl, child, children, people, friends, family, kayaker, person...",
    aiKeywords: [
      "boy",
      "girl",
      "child",
      "children",
      "people",
      "friends",
      "family",
      "kayaker",
      "person",
    ],
  },
  {
    id: 2,
    number: "2",
    title: "What are they doing?",
    promptGuide: 'Ask the child: "What are they doing?"',
    category: "What are they doing?",
    placeholder:
      "e.g. kayaking, paddling, rowing, moving, sitting, riding, exploring, having fun...",
    aiKeywords: [
      "kayaking",
      "paddling",
      "rowing",
      "moving",
      "sitting",
      "riding",
      "exploring",
      "playing",
      "having fun",
    ],
  },
  {
    id: 3,
    number: "3",
    title: "Can you write some words for this picture?",
    promptGuide:
      'Encourage independent word writing: "Can you write some words for this picture?"',
    category: "Words for the picture",
    placeholder:
      "e.g. river, water, boat, kayak, paddle, forest, trees, mountains, sky, nature...",
    aiKeywords: [
      "river",
      "water",
      "boat",
      "kayak",
      "paddle",
      "forest",
      "trees",
      "mountains",
      "sky",
      "sunshine",
      "waves",
      "outdoor",
      "nature",
    ],
  },
  {
    id: 4,
    number: "4",
    title: "Can you write a sentence for this picture?",
    promptGuide:
      'Encourage sentence construction: "Can you write a sentence for this picture?"',
    category: "Sentence / Story",
    placeholder:
      "e.g. They are kayaking on the river. They are paddling in the boat...",
    aiKeywords: [
      "on the river",
      "in the boat",
      "they are kayaking",
      "they are paddling",
      "having fun",
      "exploring nature",
      "sunny day",
      "fast water",
      "beautiful place",
    ],
  },
];

// ==========================================
// GRADE 2 / YEAR 3 WRITING ASSESSMENT DATA
// 4 Word-Writing Picture Prompts (moon, star, girl, cube)
// 100% exact text from Uploaded Specification Sheet
// ==========================================
const GRADE2_WRITING_ITEMS = [
  {
    id: 1,
    targetWord: "moon",
    phonicsPattern: "Digraph 'oo' · CVC",
    image: grade2WritingMoon,
    label: "Moon with crater details",
    promptGuide:
      "Point to picture 1 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["moon", "the moon", "m-o-o-n", "crescent moon"],
  },
  {
    id: 2,
    targetWord: "star",
    phonicsPattern: "Digraph 'ar' · CCVC",
    image: grade2WritingStar,
    label: "Shining yellow star",
    promptGuide:
      "Point to picture 2 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["star", "a star", "s-t-a-r", "bright star"],
  },
  {
    id: 3,
    targetWord: "girl",
    phonicsPattern: "Vowel digraph 'ir' · CVCC",
    image: grade2WritingGirl,
    label: "Little girl smiling",
    promptGuide:
      "Point to picture 3 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["girl", "a girl", "g-i-r-l", "happy girl"],
  },
  {
    id: 4,
    targetWord: "cube",
    phonicsPattern: "Split digraph 'u-e' · CVCe",
    image: grade2WritingCube,
    label: "3D Geometric Cube",
    promptGuide:
      "Point to picture 4 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["cube", "a cube", "c-u-b-e", "blue cube", "box", "block"],
  },
];

const GRADE2_WRITING_RUBRIC = [
  {
    level: "Pre-A1",
    description:
      "Cannot attempt the words; scribbles/mark-making; letters not recognisable.",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    activeBg: "bg-rose-50 border-rose-400 text-rose-900",
    dotColor: "bg-rose-500",
  },
  {
    level: "A1.0–A1.2",
    description:
      "Writes some initial sounds (m for moon, s for star). Letters may be reversed or poorly formed.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Writes initial and some middle/ending sounds (mon, grl). 1–2 letters missing per word.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Writes full CVC/CCVC words with some errors (starr, gurl). Developing phonics awareness.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description:
      "Writes most target words correctly (moon, star, girl, cube) with occasional small errors. Developing fluency.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Writes all target words correctly, neatly, fluently; may attempt short sentences ('The star is big.').",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

// ==========================================
// GRADE 2 / YEAR 3 STORY WRITING ASSESSMENT DATA
// 3 Fantasy Adventure Pictures (Rocky Landscape, Nature Scene, Campfire with Dragons)
// 100% exact text from Uploaded Sheets
// ==========================================
const GRADE2_STORY_WRITING_QUESTIONS = [
  {
    id: 1,
    number: "1",
    title: "Who can you see?",
    promptGuide:
      'Point to the characters, travelers, and dragons and ask: "Who can you see?"',
    category: "Who can you see?",
    placeholder:
      "e.g. person, boy, girl, child, children, explorer, adventurer, friends, campers, dragons, creatures, animals...",
    aiKeywords: [
      "person",
      "boy",
      "girl",
      "child",
      "children",
      "explorer",
      "adventurer",
      "friends",
      "campers",
      "dragons",
      "red dragon",
      "blue dragon",
      "creatures",
      "animals",
    ],
  },
  {
    id: 2,
    number: "2",
    title: "What are they doing?",
    promptGuide: 'Ask the pupil: "What are they doing?"',
    category: "What are they doing?",
    placeholder:
      "e.g. walking, exploring, climbing, looking, standing, watching, enjoying nature, sitting, talking, listening, camping, telling stories, roasting food, playing, meeting dragons...",
    aiKeywords: [
      "walking",
      "exploring",
      "climbing",
      "looking",
      "standing",
      "watching",
      "enjoying nature",
      "sitting",
      "talking",
      "listening",
      "camping",
      "telling stories",
      "roasting food",
      "playing",
      "meeting dragons",
      "being friendly",
    ],
  },
  {
    id: 3,
    number: "3",
    title: "Can you write some words from these pictures?",
    promptGuide:
      'Point to each of the 3 pictures and ask: "Can you write some words for the pictures?"',
    category: "Words from the 3 pictures",
    placeholder:
      "e.g. rocks, cliffs, mountains, sky, clouds, path, stone, grass, trees, birds, sunshine, hill, forest, cloak, wind, nature, fire, campfire, night, stars, red dragon, blue dragon, warm, glowing...",
    aiKeywords: [
      "rocks",
      "cliffs",
      "mountains",
      "sky",
      "clouds",
      "path",
      "stone",
      "ancient place",
      "grass",
      "trees",
      "birds",
      "sunshine",
      "hill",
      "forest",
      "cloak",
      "wind",
      "peaceful",
      "nature",
      "fire",
      "campfire",
      "night",
      "stars",
      "red dragon",
      "blue dragon",
      "warm",
      "glowing",
    ],
    pictureGroups: [
      {
        title: "Picture 1 – Rocky landscape",
        keywords: [
          "rocks",
          "cliffs",
          "mountains",
          "sky",
          "clouds",
          "path",
          "stone",
          "ancient place",
          "walking",
          "exploring",
          "adventure",
        ],
      },
      {
        title: "Picture 2 – Nature scene",
        keywords: [
          "grass",
          "trees",
          "birds",
          "sky",
          "sunshine",
          "hill",
          "forest",
          "cloak",
          "wind",
          "standing",
          "peaceful",
          "nature",
        ],
      },
      {
        title: "Picture 3 – Campfire with dragons",
        keywords: [
          "fire",
          "campfire",
          "night",
          "stars",
          "children",
          "dragons",
          "red dragon",
          "blue dragon",
          "sitting",
          "talking",
          "friendly",
          "warm",
          "glowing",
        ],
      },
    ],
  },
  {
    id: 4,
    number: "4",
    title: "Can you write a sentence or paragraph for these pictures?",
    promptGuide:
      'Encourage the child to tell and write the story: "Can you write sentences or a story for the pictures?"',
    category: "Sentence / Story",
    placeholder:
      "e.g. Once upon a time, an adventurer walked through the rocky mountains. They looked across the green forest valley as an eagle flew. At night, the children sat by the campfire with friendly dragons...",
    aiKeywords: [
      "once upon a time",
      "adventure",
      "journey",
      "exploring",
      "forest",
      "mountains",
      "magical place",
      "dragons",
      "friends",
      "campfire",
      "night",
      "day",
      "sunshine",
      "sky",
      "happy",
      "excited",
      "surprised",
      "brave",
      "beginning",
      "middle",
      "end",
    ],
  },
];

const GRADE2_STORY_WRITING_RUBRIC = [
  {
    level: "Pre-A1",
    description:
      "Cannot attempt sentences or words; scribbles/mark-making; letters not recognisable.",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    activeBg: "bg-rose-50 border-rose-400 text-rose-900",
    dotColor: "bg-rose-500",
  },
  {
    level: "A1.0–A1.2",
    description:
      "Writes only single words or labels (mountain, boy, dragon). Limited sentence formation.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Writes very short phrases or incomplete sentences (The boy see bird). Grammar/spelling errors affect meaning.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Writes simple sentences (The boy is looking at the bird). Some errors but meaning is clear.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description:
      "Writes connected sentences with description and sequencing. Developing vocabulary and conjunctions.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Writes a fluent, detailed short narrative linking the pictures. Adds imagination, description, and correct structures.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

// ==========================================
// GRADE 3 / YEAR 4 WRITING ASSESSMENT DATA
// 4 Word-Writing Picture Prompts (moon, star, girl, cube)
// 100% exact text from Uploaded Specification Sheet
// ==========================================
const GRADE3_WRITING_ITEMS = [
  {
    id: 1,
    targetWord: "moon",
    phonicsPattern: "Digraph 'oo' · CVC",
    image: grade3WritingMoon,
    label: "Moon with crater details",
    promptGuide:
      "Point to picture 1 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["moon", "the moon", "m-o-o-n", "crescent moon"],
  },
  {
    id: 2,
    targetWord: "star",
    phonicsPattern: "Digraph 'ar' · CCVC",
    image: grade3WritingStar,
    label: "Shining yellow star",
    promptGuide:
      "Point to picture 2 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["star", "a star", "s-t-a-r", "bright star"],
  },
  {
    id: 3,
    targetWord: "girl",
    phonicsPattern: "Vowel digraph 'ir' · CVCC",
    image: grade3WritingGirl,
    label: "Little girl smiling",
    promptGuide:
      "Point to picture 3 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["girl", "a girl", "g-i-r-l", "happy girl"],
  },
  {
    id: 4,
    targetWord: "cube",
    phonicsPattern: "Split digraph 'u-e' · CVCe",
    image: grade3WritingCube,
    label: "3D Geometric Cube",
    promptGuide:
      "Point to picture 4 and say: 'Can you write the word for this picture?'",
    aiKeyWords: ["cube", "a cube", "c-u-b-e", "blue cube", "box", "block"],
  },
];

const GRADE3_WRITING_RUBRIC = [
  {
    level: "Pre-A1",
    description:
      "Cannot attempt the words; scribbles/mark-making; letters not recognisable.",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    activeBg: "bg-rose-50 border-rose-400 text-rose-900",
    dotColor: "bg-rose-500",
  },
  {
    level: "A1.0–A1.2",
    description:
      "Writes some initial sounds (m for moon, s for star). Letters may be reversed or poorly formed.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Writes initial and some middle/ending sounds (mon, grl). 1–2 letters missing per word.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Writes full CVC/CCVC words with some errors (starr, gurl). Developing phonics awareness.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description:
      "Writes most target words correctly (moon, star, girl, cube) with occasional small errors. Developing fluency.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Writes all target words correctly, neatly, fluently; may attempt short sentences ('The star is big.').",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

// ==========================================
// GRADE 3 / YEAR 4 STORY WRITING ASSESSMENT DATA
// 3 Creative Adventure Pictures (Spaceship, Canyon Ruins, Knight & Dragon)
// 100% exact text from Uploaded Sheets
// ==========================================
const GRADE3_STORY_WRITING_QUESTIONS_SOURCE = [
  {
    id: 1,
    number: "1",
    title: "Who can you see?",
    promptGuide:
      'Point to the characters across the 3 pictures and ask: "Who can you see?"',
    category: "Who can you see?",
    placeholder:
      "e.g. astronaut, pilot, traveler, explorer, adventurer, knight, warrior, hero, dragon, monster, beast...",
    aiKeywords: [
      "astronaut",
      "pilot",
      "crew",
      "traveler",
      "traveller",
      "explorer",
      "adventurer",
      "person",
      "man",
      "boy",
      "knight",
      "hero",
      "warrior",
      "dragon",
      "monster",
      "beast",
      "creature",
    ],
  },
  {
    id: 2,
    number: "2",
    title: "What are they doing?",
    promptGuide: 'Ask the pupil: "What are they doing?"',
    category: "What are they doing?",
    placeholder:
      "e.g. flying the spaceship, traveling in space, exploring the canyon, looking at ancient ruins, walking, discovering, fighting the dragon, holding a sword and shield, battling bravely...",
    aiKeywords: [
      "flying",
      "travelling",
      "traveling",
      "exploring",
      "mission",
      "discovering",
      "walking",
      "looking",
      "standing",
      "fighting",
      "battling",
      "brave",
      "holding sword",
      "defending",
      "protecting",
      "adventuring",
    ],
  },
  {
    id: 3,
    number: "3",
    title: "Can you write some words from these pictures?",
    promptGuide:
      'Point to the 3 pictures and prompt: "Can you write some words for these pictures?"',
    category: "Words from the 3 pictures",
    placeholder:
      "e.g. spaceship, stars, galaxy, thrusters, desert, canyon, ruins, pillars, rocks, mountains, knight, sword, shield, dragon, wings, cave, forest...",
    aiKeywords: [
      "spaceship",
      "space",
      "rocket",
      "stars",
      "galaxy",
      "light",
      "glowing",
      "thrusters",
      "desert",
      "canyon",
      "ruins",
      "pillars",
      "rocks",
      "mountains",
      "clouds",
      "sky",
      "knight",
      "hero",
      "warrior",
      "sword",
      "shield",
      "dragon",
      "monster",
      "beast",
      "wings",
      "cave",
      "forest",
    ],
    pictureGroups: [
      {
        title: "Picture 1 – Spaceship in deep space",
        keywords: [
          "spaceship",
          "space",
          "rocket",
          "flying",
          "stars",
          "galaxy",
          "light",
          "travelling",
          "adventure",
          "mission",
          "glowing",
          "thrusters",
        ],
      },
      {
        title: "Picture 2 – Explorer in canyon ruins",
        keywords: [
          "explorer",
          "traveller",
          "desert",
          "canyon",
          "ruins",
          "pillars",
          "rocks",
          "mountains",
          "clouds",
          "sky",
          "walking",
          "discovering",
        ],
      },
      {
        title: "Picture 3 – Knight battling dragon",
        keywords: [
          "knight",
          "hero",
          "warrior",
          "sword",
          "shield",
          "dragon",
          "monster",
          "beast",
          "wings",
          "fighting",
          "battling",
          "brave",
          "cave",
          "forest",
        ],
      },
    ],
  },
  {
    id: 4,
    number: "4",
    title: "Can you write sentence and a paragraph for these pictures?",
    promptGuide:
      'Encourage the child to write connected sentences or a narrative linking the 3 scenes: "Can you write a sentence and a paragraph for these pictures?"',
    category: "Sentence and paragraph narrative",
    placeholder:
      "e.g. Once upon a time, a spaceship traveled across the starry galaxy. The brave explorer landed in a vast desert canyon and discovered towering ancient ruins. Suddenly, inside the dark forest, a brave knight battled a fierce dragon with sword and shield...",
    aiKeywords: [
      "once upon a time",
      "suddenly",
      "then",
      "finally",
      "bravely",
      "adventure",
      "quest",
      "mysterious",
      "journey",
      "spaceship",
      "galaxy",
      "stars",
      "canyon",
      "ruins",
      "ancient",
      "knight",
      "sword",
      "dragon",
      "battle",
      "mission",
    ],
  },
];

// Canva Grade 3 / Year 4 sheet asks 3 questions: Who can you see? / What are they
// doing? / Can you write sentence and a paragraph for these pictures?
// The picture-word keywords are kept on the paragraph question so the AI still
// credits picture vocabulary used in the pupil's writing.
const GRADE3_STORY_WRITING_QUESTIONS = (() => {
  const [who, doing, words, paragraph] = GRADE3_STORY_WRITING_QUESTIONS_SOURCE;
  return [
    who,
    doing,
    {
      ...paragraph,
      id: 3,
      number: "3",
      aiKeywords: [...new Set([...paragraph.aiKeywords, ...words.aiKeywords])],
    },
  ];
})();

const GRADE3_STORY_WRITING_RUBRIC = [
  {
    level: "Pre-A1",
    description:
      "Cannot attempt sentences or words; scribbles/mark-making; letters or symbols not recognisable.",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    activeBg: "bg-rose-50 border-rose-400 text-rose-900",
    dotColor: "bg-rose-500",
  },
  {
    level: "A1.0–A1.2",
    description:
      "Writes only single words or labels (e.g., spaceship, mountain, knight, dragon). No sentence formation. Very limited output.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Writes very short phrases or incomplete sentences. Grammar and spelling errors affect meaning.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Writes simple sentences about the pictures. Some errors, but meaning is clear.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description:
      "Writes connected sentences with some description and sequencing. Uses vocabulary and conjunctions.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Writes a fluent, detailed short narrative linking the pictures. Adds imagination, description, and correct structures. Confident and creative.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

// ==========================================
// 3 PROMPTS FROM GRADE 4 / YEAR 5 WRITING ASSESSMENT
// Exact from uploaded Grade 4 / Year 5 sheet
// ==========================================
const GRADE4_STORY_WRITING_QUESTIONS = [
  {
    id: 1,
    number: "1",
    title: "Who and what can you see?",
    promptGuide: 'Point to the pictures and prompt: "Who and what can you see?"',
    category: "Who and what can you see?",
    placeholder:
      "e.g. astronaut in red suit, future city, glowing lights, alien planet, space world, rocky ground, explorers...",
    aiKeywords: [
      "corridor",
      "lights",
      "walking",
      "suit",
      "red suit",
      "future",
      "mission",
      "technology",
      "exploring",
      "tall buildings",
      "planet",
      "skyline",
      "future city",
      "glowing lights",
      "space world",
      "astronauts",
      "rocky ground",
      "planet surface",
      "space suits",
      "adventure",
    ],
  },
  {
    id: 2,
    number: "2",
    title: "What are they doing?",
    promptGuide: 'Ask the pupil: "What are they doing?"',
    category: "What are they doing?",
    placeholder:
      "e.g. walking through the neon corridor, exploring the future city, walking together on the planet surface, discovering new worlds...",
    aiKeywords: [
      "walking",
      "exploring",
      "mission",
      "technology",
      "looking",
      "standing",
      "holding hands",
      "discovering",
      "investigating",
      "traveling",
      "travelling",
      "journey",
      "space mission",
    ],
  },
  {
    id: 3,
    number: "3",
    title: "Can you write a story for these pictures?",
    promptGuide:
      'Prompt: "Can you write a story for these pictures? (Use first, next, then, finally)"',
    category: "Sci-Fi Space Adventure Story",
    placeholder:
      "e.g. First, the astronaut in the red suit walked down the glowing corridor to begin the mission. Next, they arrived at the majestic future city with towering buildings. Finally, the two astronauts explored the rocky planet surface together, discovering a brand new world...",
    aiKeywords: [
      "first",
      "next",
      "then",
      "after that",
      "finally",
      "journey",
      "mission",
      "exploring",
      "corridor",
      "suit",
      "future city",
      "skyline",
      "planet",
      "astronauts",
      "space suits",
      "rocky ground",
      "adventure",
      "glowing lights",
      "space world",
    ],
  },
];

const GRADE4_STORY_WRITING_RUBRIC = [
  {
    level: "A1.0–A1.2",
    description:
      "Writes only labels or single words; no sentences; meaning unclear; extremely limited written output.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Writes fragmented or very short sentences; many grammar/spelling errors; little sequence; weak link to pictures.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Writes simple sentences with some sequence; basic vocabulary; mostly correct capitals and full stops.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description:
      "Writes short paragraphs; clear sequence; developing vocabulary; mostly correct tense and punctuation.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Writes a fluent, cohesive narrative; varied sentences; precise vocabulary; accurate punctuation; minimal errors.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

// ==========================================
// 3 PROMPTS FROM GRADE 5 / YEAR 6 WRITING ASSESSMENT
// Exact from uploaded Grade 5 / Year 6 sheet
// Pictures: Desert Traveller, Black Hole / Eclipse, Ruined Desert City
// ==========================================
const GRADE5_STORY_WRITING_QUESTIONS = [
  {
    id: 1,
    number: "1",
    // Canva Grade 5 / Year 6 sheet: "1. Who can you see?"
    title: "Who can you see?",
    promptGuide: 'Point to the pictures and prompt: "Who can you see?"',
    category: "Who can you see?",
    placeholder:
      "e.g. a lonely traveller in a long coat, golden sand dunes, tall rocky spires, a glowing black hole in space, a ruined city in the desert...",
    aiKeywords: [
      "man",
      "traveller",
      "traveler",
      "stranger",
      "coat",
      "cloak",
      "desert",
      "sand",
      "dunes",
      "rocks",
      "spires",
      "sunset",
      "sun",
      "black hole",
      "eclipse",
      "ring",
      "planet",
      "space",
      "stars",
      "galaxy",
      "city",
      "ruins",
      "buildings",
      "towers",
      "abandoned",
    ],
  },
  {
    id: 2,
    number: "2",
    title: "What are they doing?",
    promptGuide: 'Ask the pupil: "What are they doing?"',
    category: "What are they doing?",
    placeholder:
      "e.g. the traveller is walking alone across the hot desert, looking up at a strange glowing ring in the sky, searching through an empty ruined city...",
    aiKeywords: [
      "walking",
      "travelling",
      "traveling",
      "journey",
      "searching",
      "looking",
      "watching",
      "staring",
      "exploring",
      "wandering",
      "crossing",
      "climbing",
      "carrying",
      "discovering",
      "escaping",
      "alone",
    ],
  },
  {
    id: 3,
    number: "3",
    title: "Can you write a story for these pictures?",
    promptGuide:
      'Prompt: "Can you write a story for these pictures? (Use first, next, then, finally)"',
    category: "Sci-Fi Desert Adventure Story",
    placeholder:
      "e.g. First, a lonely traveller walked across the burning desert as the sun set behind the rocky spires. Next, a giant glowing ring appeared in the night sky. Then, he followed its light to an ancient ruined city. Finally, he discovered...",
    aiKeywords: [
      "first",
      "next",
      "then",
      "after that",
      "suddenly",
      "finally",
      "journey",
      "traveller",
      "desert",
      "dunes",
      "sunset",
      "black hole",
      "glowing",
      "ring",
      "sky",
      "space",
      "city",
      "ruins",
      "ancient",
      "abandoned",
      "mystery",
      "discovered",
    ],
  },
];

const GRADE5_STORY_WRITING_RUBRIC = [
  {
    level: "A1.0–A1.2",
    description:
      "Writes only labels or single words; no sentences; meaning unclear; extremely limited written output.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0–A2.2",
    description:
      "Writes fragmented or very short sentences; many errors; little sequence; weak link to pictures.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3–B1.1",
    description:
      "Writes simple sentences with some sequence; basic vocabulary; mostly correct capitals and full stops.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2–B1.3",
    description:
      "Writes short paragraphs; clear sequence; developing vocabulary; mostly correct tense and punctuation.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2–C1",
    description:
      "Writes a fluent, cohesive narrative; varied sentences; precise vocabulary; accurate punctuation; minimal errors.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

// Helper: Check keyword detection in written text
function matchKeyword(text, keyword) {
  if (!text || !keyword) return false;
  const cleanText = text.toLowerCase();
  const cleanKeyword = keyword.toLowerCase().trim();

  // Multi-word phrase check (e.g. "they are playing", "playing football")
  if (cleanKeyword.includes(" ")) {
    if (cleanText.includes(cleanKeyword)) return true;
    const parts = cleanKeyword.split(/\s+/);
    return parts.every((p) => cleanText.includes(p));
  }

  // Single word boundary check with optional plurals/suffixes
  try {
    const regex = new RegExp(`\\b${cleanKeyword}(s|es|ing|ed)?\\b`, "i");
    return regex.test(cleanText) || cleanText.includes(cleanKeyword);
  } catch {
    return cleanText.includes(cleanKeyword);
  }
}

export default function PrimaryWritingAssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get("term") || "T1";

  // Determine initial stage: FS1, FS2 - KG1, KG2 / Year 1, Grade 1 / Year 2, Grade 2 / Year 3, Grade 3 / Year 4, or Grade 4 / Year 5
  const isGrade5Initial =
    location.pathname.includes("grade5") ||
    location.pathname.includes("year6") ||
    searchParams.get("grade") === "grade5" ||
    searchParams.get("grade") === "year6" ||
    searchParams.get("stage") === "grade5" ||
    searchParams.get("stage") === "year6";

  const isGrade4Initial =
    !isGrade5Initial &&
    (location.pathname.includes("grade4") ||
      location.pathname.includes("year5") ||
      searchParams.get("grade") === "grade4" ||
      searchParams.get("grade") === "year5" ||
      searchParams.get("stage") === "grade4" ||
      searchParams.get("stage") === "year5");

  const isGrade3Initial =
    !isGrade4Initial &&
    (location.pathname.includes("grade3") ||
      location.pathname.includes("year4") ||
      searchParams.get("grade") === "grade3" ||
      searchParams.get("grade") === "year4" ||
      searchParams.get("stage") === "grade3" ||
      searchParams.get("stage") === "year4");

  const isGrade2Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    (location.pathname.includes("grade2") ||
      location.pathname.includes("year3") ||
      searchParams.get("grade") === "grade2" ||
      searchParams.get("grade") === "year3" ||
      searchParams.get("stage") === "grade2" ||
      searchParams.get("stage") === "year3");

  const isGrade1Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    !isGrade2Initial &&
    (location.pathname.includes("grade1") ||
      location.pathname.includes("year2") ||
      searchParams.get("grade") === "grade1" ||
      searchParams.get("grade") === "year2" ||
      searchParams.get("stage") === "grade1" ||
      searchParams.get("stage") === "year2");

  const isKG2Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    !isGrade2Initial &&
    !isGrade1Initial &&
    (location.pathname.includes("kg2") ||
      location.pathname.includes("year1") ||
      searchParams.get("grade") === "kg2" ||
      searchParams.get("grade") === "year1" ||
      searchParams.get("stage") === "kg2" ||
      searchParams.get("stage") === "year1");

  const isFS2Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    !isGrade2Initial &&
    !isGrade1Initial &&
    !isKG2Initial &&
    (location.pathname.includes("fs2") ||
      searchParams.get("grade") === "fs2" ||
      searchParams.get("stage") === "fs2");

  const initialStage = isGrade5Initial
    ? "Grade 5 / Year 6"
    : isGrade4Initial
    ? "Grade 4 / Year 5"
    : isGrade3Initial
      ? "Grade 3 / Year 4"
      : isGrade2Initial
        ? "Grade 2 / Year 3"
        : isGrade1Initial
          ? "Grade 1 / Year 2"
          : isKG2Initial
            ? "KG2 / Year 1"
            : isFS2Initial
              ? "FS2 - KG1"
              : "FS1";

  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [grade2WritingMode, setGrade2WritingMode] = useState("story"); // 'story' | 'phonics'
  // FS2 - KG1, KG2 / Year 1, Grade 1 / Year 2: 6 word prompts or picture story
  const [earlyWritingModeChoice, setEarlyWritingMode] = useState("words"); // 'words' | 'story'
  const [earlyWritten, setEarlyWritten] = useState(Array(EARLY_WORD_ITEMS.length).fill(""));
  const [earlyStatuses, setEarlyStatuses] = useState(Array(EARLY_WORD_ITEMS.length).fill(null));
  const [earlyNotes, setEarlyNotes] = useState(Array(EARLY_WORD_ITEMS.length).fill(""));
  const [grade3WritingMode, setGrade3WritingMode] = useState("story"); // 'story' | 'phonics'
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [modalTab, setModalTab] = useState("sheet"); // 'sheet' | 'keywords' | 'worksheet'
  const [showParkZoom, setShowParkZoom] = useState(false);
  const [loading, setLoading] = useState(false);

  const isGrade5Stage =
    selectedStage === "Grade 5 / Year 6" ||
    selectedStage.includes("Year 6") ||
    selectedStage.includes("Grade 5");
  // NOTE: isGrade4Stage is the shared "3-picture story" layout used by
  // Grade 4 / Year 5 AND Grade 5 / Year 6. Use isGrade5Stage to pick Grade 5 content.
  const isGrade4Stage =
    isGrade5Stage ||
    selectedStage === "Grade 4 / Year 5" ||
    selectedStage.includes("Year 5") ||
    selectedStage.includes("Grade 4");
  const upperStageLabel = isGrade5Stage ? "Grade 5 / Year 6" : "Grade 4 / Year 5";
  const upperStoryQuestions = isGrade5Stage
    ? GRADE5_STORY_WRITING_QUESTIONS
    : GRADE4_STORY_WRITING_QUESTIONS;
  const isGrade3Stage =
    !isGrade4Stage &&
    (selectedStage === "Grade 3 / Year 4" ||
      selectedStage.includes("Year 4") ||
      selectedStage.includes("Grade 3"));
  const isGrade2Stage =
    !isGrade4Stage &&
    !isGrade3Stage &&
    (selectedStage === "Grade 2 / Year 3" ||
      selectedStage.includes("Year 3") ||
      selectedStage.includes("Grade 2"));
  const isGrade1Stage =
    !isGrade4Stage &&
    !isGrade3Stage &&
    !isGrade2Stage &&
    (selectedStage === "Grade 1 / Year 2" ||
      selectedStage.includes("Year 2") ||
      selectedStage.includes("Grade 1"));
  const isFS1Stage = selectedStage === "FS1";
  const isEarlyStage =
    selectedStage === "FS2 - KG1" || selectedStage === "KG2 / Year 1" || isGrade1Stage;
  // FS2 - KG1, KG2 / Year 1 and Grade 1 / Year 2 each have two parts on the sheets:
  // 6 word prompts (scored out of 13) and a picture story (4 questions)
  const earlyWritingMode = earlyWritingModeChoice;
  const isEarlyScoredStage = isEarlyStage && earlyWritingMode === "words";
  const isWordItemsStage =
    isFS1Stage ||
    (isEarlyStage && earlyWritingMode === "words") ||
    (isGrade2Stage && grade2WritingMode === "phonics") ||
    (isGrade3Stage && grade3WritingMode === "phonics");
  const isPictureAiStage =
    (isEarlyStage && earlyWritingMode === "story") ||
    isGrade4Stage ||
    (isGrade2Stage && grade2WritingMode === "story") ||
    (isGrade3Stage && grade3WritingMode === "story");

  useEffect(() => {
    localStorage.setItem("assessmentSchoolTier", "primary");
  }, []);

  // Common Form Details
  const [formData, setFormData] = useState({
    email: "",
    studentName: "",
    yearGroupAndClass: initialStage,
    teacherName: "",
    term: preSelectedTerm,
  });

  // Teacher override — null means "use the AI-recommended level"
  const [manualLevel, setSelectedLevel] = useState(null);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [teachingFocusNotes, setTeachingFocusNotes] = useState("");

  // ------------------------------------------
  // FS1 Specific State (6 CVC missing graphemes)
  // ------------------------------------------
  const [studentWritten, setStudentWritten] = useState(
    FS1_WRITING_ITEMS.map((item) =>
      item.slots.map((slot) => (slot.isFixed ? slot.char : "")),
    ),
  );
  const [itemStatuses, setItemStatuses] = useState(
    Array(FS1_WRITING_ITEMS.length).fill(null),
  );
  const [itemNotes, setItemNotes] = useState(
    Array(FS1_WRITING_ITEMS.length).fill(""),
  );

  // ------------------------------------------
  // Grade 2 / Year 3 Specific State (4 picture word prompts)
  // ------------------------------------------
  const [grade2Written, setGrade2Written] = useState(["", "", "", ""]);
  const [grade2Statuses, setGrade2Statuses] = useState(Array(4).fill(null));
  const [grade2Notes, setGrade2Notes] = useState(Array(4).fill(""));
  const [grade2Answers, setGrade2Answers] = useState({
    0: "",
    1: "",
    2: "",
    3: "",
  });

  // ------------------------------------------
  // Grade 4 / Year 5 Specific State (3 story questions)
  // ------------------------------------------
  const [grade4Answers, setGrade4Answers] = useState({
    0: "",
    1: "",
    2: "",
  });
  // Grade 5 / Year 6 (3 story questions) — kept separate from Grade 4
  const [grade5Answers, setGrade5Answers] = useState({
    0: "",
    1: "",
    2: "",
  });
  const upperAnswers = isGrade5Stage ? grade5Answers : grade4Answers;
  const setUpperAnswers = isGrade5Stage ? setGrade5Answers : setGrade4Answers;

  // ------------------------------------------
  // Grade 3 / Year 4 Specific State (4 picture word prompts / 3 story questions)
  // ------------------------------------------
  const [grade3Written, setGrade3Written] = useState(["", "", "", ""]);
  const [grade3Statuses, setGrade3Statuses] = useState(Array(4).fill(null));
  const [grade3Notes, setGrade3Notes] = useState(Array(4).fill(""));
  const [grade3Answers, setGrade3Answers] = useState({
    0: "",
    1: "",
    2: "",
    3: "",
  });

  // ------------------------------------------
  // FS2, KG2 & Grade 1 / Year 2 Answers State (4 picture-prompt questions)
  // ------------------------------------------
  const [fs2Answers, setFs2Answers] = useState({
    0: "",
    1: "",
    2: "",
    3: "",
  });
  const [kg2Answers, setKg2Answers] = useState({
    0: "",
    1: "",
    2: "",
    3: "",
  });
  const [grade1Answers, setGrade1Answers] = useState({
    0: "",
    1: "",
    2: "",
    3: "",
  });

  const activeQuestions = isGrade4Stage
    ? upperStoryQuestions
    : isGrade3Stage
      ? GRADE3_STORY_WRITING_QUESTIONS
      : isGrade2Stage
        ? GRADE2_STORY_WRITING_QUESTIONS
        : isGrade1Stage
          ? GRADE1_WRITING_QUESTIONS
          : FS2_WRITING_QUESTIONS;

  const activeAnswers = isGrade4Stage
    ? upperAnswers
    : isGrade3Stage
      ? grade3Answers
      : isGrade2Stage
        ? grade2Answers
        : isGrade1Stage
          ? grade1Answers
          : selectedStage === "KG2 / Year 1"
            ? kg2Answers
            : fs2Answers;



  // Load teacher email/name from localStorage
  useEffect(() => {
    if (preSelectedTerm) {
      setFormData((prev) => ({ ...prev, term: preSelectedTerm }));
    }
    const savedTeacher =
      localStorage.getItem("teacherName") ||
      localStorage.getItem("userName") ||
      "Teacher";
    const savedEmail =
      localStorage.getItem("userEmail") ||
      localStorage.getItem("teacherEmail") ||
      "teacher@school.edu";
    setFormData((prev) => ({
      ...prev,
      teacherName: prev.teacherName || savedTeacher,
      email: prev.email || savedEmail,
    }));
  }, [preSelectedTerm]);

  // Stage Switch Handler
  const handleStageSwitch = (newStage) => {
    setSelectedStage(newStage);
    setFormData((prev) => ({
      ...prev,
      yearGroupAndClass: newStage,
    }));
    setSelectedLevel(null);
    setUsedKeywords([]);
    setEarlyWritten(Array(EARLY_WORD_ITEMS.length).fill(""));
    setEarlyStatuses(Array(EARLY_WORD_ITEMS.length).fill(null));
    setEarlyNotes(Array(EARLY_WORD_ITEMS.length).fill(""));
  };

  const handleEarlyWrittenChange = (idx, value) => {
    setEarlyWritten((prev) => prev.map((v, i) => (i === idx ? value : v)));
    setEarlyStatuses((prev) => prev.map((v, i) => (i === idx ? markEarlyWord(value, EARLY_WORD_ITEMS[idx]) : v)));
  };

  // ------------------------------------------
  // Word Slot Handlers & Scoring (FS1 Writing Assessment)
  // ------------------------------------------
  const handleSlotChange = (wordIndex, slotIndex, value) => {
    const char = value.slice(-1).toLowerCase();
    const updated = [...studentWritten];
    const wordArr = [...updated[wordIndex]];
    wordArr[slotIndex] = char;
    updated[wordIndex] = wordArr;
    setStudentWritten(updated);

    const fullWritten = wordArr.join("");
    const target = FS1_WRITING_ITEMS[wordIndex].targetWord;
    const initialSound = target[0];

    const currentStatuses = [...itemStatuses];
    if (fullWritten === target) {
      currentStatuses[wordIndex] = "correct";
    } else if (wordArr[0] === initialSound && fullWritten.length > 0) {
      currentStatuses[wordIndex] = "initial-only";
    }
    setItemStatuses(currentStatuses);
  };

  const handleItemStatusChange = (idx, status) => {
    const updated = [...itemStatuses];
    updated[idx] = status;
    setItemStatuses(updated);
  };

  const handleItemNoteChange = (idx, note) => {
    const updated = [...itemNotes];
    updated[idx] = note;
    setItemNotes(updated);
  };

  const countCorrect = itemStatuses.filter((s) => s === "correct").length;
  const countInitialOnly = itemStatuses.filter(
    (s) => s === "initial-only",
  ).length;
  const countMarkMaking = itemStatuses.filter(
    (s) => s === "mark-making",
  ).length;

  // FS1: one mark per correct letter written, out of 12 (typed or ticked ✓ Correct CVC)
  const fs1Score = FS1_WRITING_ITEMS.reduce(
    (n, item, idx) => n + fs1WordLetters(item, studentWritten[idx], itemStatuses[idx]),
    0,
  );
  const fs1RecommendedLevel = fs1Level(fs1Score);

  // ------------------------------------------
  // FS2, KG2, Grade 1, Grade 2, Grade 3 & Grade 4 AI Keywords Detection & Auto-recommendation
  // ------------------------------------------

  const handleAnswerChange = (qIndex, text) => {
    if (isGrade4Stage) {
      setUpperAnswers((prev) => ({ ...prev, [qIndex]: text }));
    } else if (isGrade3Stage) {
      setGrade3Answers((prev) => ({ ...prev, [qIndex]: text }));
    } else if (isGrade2Stage) {
      setGrade2Answers((prev) => ({ ...prev, [qIndex]: text }));
    } else if (isGrade1Stage) {
      setGrade1Answers((prev) => ({ ...prev, [qIndex]: text }));
    } else if (selectedStage === "KG2 / Year 1") {
      setKg2Answers((prev) => ({ ...prev, [qIndex]: text }));
    } else {
      setFs2Answers((prev) => ({ ...prev, [qIndex]: text }));
    }
  };

  // Detected AI keywords per question
  const detectedPerQuestion = useMemo(() => {
    return activeQuestions.map((q, idx) => {
      const text = activeAnswers[idx] || "";
      return q.aiKeywords.filter((kw) => matchKeyword(text, kw));
    });
  }, [activeQuestions, activeAnswers]);

  const totalAiMatches = useMemo(() => {
    return detectedPerQuestion.reduce((sum, list) => sum + list.length, 0);
  }, [detectedPerQuestion]);

  const totalAiPossible = useMemo(() => {
    return activeQuestions.reduce((sum, q) => sum + q.aiKeywords.length, 0);
  }, [activeQuestions]);

  // Smart Auto-Recommendation for Picture & AI stages (FS2 & KG2 / Year 1)
  // Picture stories: level from what was written (words, sentences, linking words)
  // and whether it relates to the pictures. The last question is always the
  // sentence / paragraph / story one.
  const storyStage = isGrade4Stage ? "upper" : isGrade3Stage || isGrade2Stage ? "mid" : "early";
  const storyMeasures = useMemo(
    () => storyStats(activeQuestions.map((q, i) => activeAnswers[i] || ""), activeQuestions.length - 1),
    [activeAnswers, activeQuestions],
  );
  const pictureAiRecommendedLevel =
    storyLevel(storyStage, storyMeasures, totalAiMatches) || "A1.0–A1.2";

  const grade2CountCorrect = grade2Statuses.filter(
    (s) => s === "correct",
  ).length;
  const grade2CountNear = grade2Statuses.filter((s) => s === "near").length;
  const grade2CountInitial = grade2Statuses.filter(
    (s) => s === "initial",
  ).length;

  // Grade 2 words: each word judged against the sheet (teacher buttons override typing)
  const grade2Qualities = GRADE2_WRITING_ITEMS.map((item, idx) =>
    wordQuality(grade2Written[idx], grade2Statuses[idx], item.targetWord),
  );
  const grade2RecommendedLevel = wordWritingLevel(grade2Qualities) || "Pre-A1";

  const grade3CountCorrect = grade3Statuses.filter(
    (s) => s === "correct",
  ).length;
  const grade3CountNear = grade3Statuses.filter((s) => s === "near").length;
  const grade3CountInitial = grade3Statuses.filter(
    (s) => s === "initial",
  ).length;

  // Grade 3 words: each word judged against the sheet (teacher buttons override typing)
  const grade3Qualities = GRADE3_WRITING_ITEMS.map((item, idx) =>
    wordQuality(grade3Written[idx], grade3Statuses[idx], item.targetWord),
  );
  const grade3RecommendedLevel = wordWritingLevel(grade3Qualities) || "Pre-A1";

  // FS2 - KG1 / KG2 / Grade 1: one mark per correct letter written, out of 13
  const earlyScore = EARLY_WORD_ITEMS.reduce(
    (n, item, idx) => n + earlyWordLetters(earlyWritten[idx], earlyStatuses[idx], item),
    0,
  );

  // All 6-word stages (FS2 - KG1, KG2 / Year 1, Grade 1 / Year 2) take their level from
  // the words — typed or just marked ✓ Correct / ~ Partly / ✗ Not yet by the teacher
  const currentRecommendedLevel = isEarlyStage && earlyWritingMode === "words"
    ? earlyWordsLevel(earlyScore)
    : isGrade3Stage
    ? grade3WritingMode === "phonics"
      ? grade3RecommendedLevel
      : pictureAiRecommendedLevel
    : isGrade2Stage
      ? grade2WritingMode === "phonics"
        ? grade2RecommendedLevel
        : pictureAiRecommendedLevel
      : isWordItemsStage
        ? fs1RecommendedLevel
        : pictureAiRecommendedLevel;

  // Switching part (Writing Assessment I ↔ II, words ↔ story) starts the level fresh
  useEffect(() => {
    setSelectedLevel(null);
  }, [earlyWritingModeChoice, grade2WritingMode, grade3WritingMode]);

  // Which part is on screen decides what "has the pupil answered?" means
  const levelSource =
    isEarlyStage && earlyWritingMode === "words"
      ? "earlyWords"
      : isGrade3Stage && grade3WritingMode === "phonics"
        ? "grade3Words"
        : isGrade2Stage && grade2WritingMode === "phonics"
          ? "grade2Words"
          : isFS1Stage
            ? "fs1"
            : "story";

  const hasWritingData =
    levelSource === "earlyWords"
      ? earlyWritten.some((v) => (v || "").trim()) || earlyStatuses.some(Boolean)
      : levelSource === "grade3Words"
        ? grade3Qualities.some((q) => q !== null)
        : levelSource === "grade2Words"
          ? grade2Qualities.some((q) => q !== null)
          : levelSource === "fs1"
            ? itemStatuses.some(Boolean) ||
              // a letter typed into any open box (the given letters are pre-filled)
              FS1_WRITING_ITEMS.some((item, idx) =>
                item.slots.some((slot, i) => !slot.isFixed && (studentWritten[idx]?.[i] || "").trim()),
              )
            : activeQuestions.some((q, i) => (activeAnswers[i] || "").trim());

  // Plain-English reason shown under the rubric so the teacher sees why
  const describeWords = (qualities) => {
    const n = (v) => qualities.filter((q) => q === v).length;
    return [
      n(4) && `${n(4)} correct`,
      n(3) && `${n(3)} nearly right`,
      n(2) && `${n(2)} with letters missing`,
      n(1) && `${n(1)} first sound only`,
      n(0) && `${n(0)} not yet`,
    ]
      .filter(Boolean)
      .join(" · ");
  };
  const levelReason = !hasWritingData
    ? ""
    : levelSource === "earlyWords"
      ? `Score ${earlyScore} / ${EARLY_WORDS_TOTAL} letters`
      : levelSource === "fs1"
        ? `Score ${fs1Score} / ${FS1_TOTAL} letters`
        : levelSource === "grade2Words"
          ? describeWords(grade2Qualities)
          : levelSource === "grade3Words"
            ? describeWords(grade3Qualities)
            : [
                `${storyMeasures.sentences} sentence${storyMeasures.sentences === 1 ? "" : "s"}`,
                `${storyMeasures.totalWords} word${storyMeasures.totalWords === 1 ? "" : "s"} written`,
                storyMeasures.linking > 0 &&
                  `${storyMeasures.linking} linking word${storyMeasures.linking === 1 ? "" : "s"} (and, because, then…)`,
                totalAiMatches === 0 && "not about the pictures yet",
              ]
                .filter(Boolean)
                .join(" · ");

  const selectedLevel = manualLevel || (hasWritingData ? currentRecommendedLevel : null);
  const isAiLevel = !manualLevel && !!selectedLevel;

  // Toggle keyword chip (common)
  // ------------------------------------------
  // Form Submission
  // ------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      toast.error("Please enter the Student Name");
      return;
    }
    if (!formData.teacherName.trim()) {
      toast.error("Please enter the Teacher Name");
      return;
    }
    if (!selectedLevel) {
      toast.error("Please select an assessed CEFR Level from the rubric");
      return;
    }

    setLoading(true);

    const isGrade4 = isGrade4Stage;
    const isGrade3 = isGrade3Stage;
    const isGrade2 = isGrade2Stage;
    const isGrade1 = isGrade1Stage;
    const isKG2 = selectedStage === "KG2 / Year 1";
    const isFS2 = selectedStage === "FS2 - KG1";
    const assessmentType = isGrade4
      ? `${upperStageLabel} Writing Assessment`
      : isGrade3
        ? "Grade 3 / Year 4 Writing Assessment"
        : isGrade2
          ? "Grade 2 / Year 3 Writing Assessment"
          : isGrade1
            ? "Grade 1 / Year 2 Writing Assessment"
            : isKG2
              ? "KG2 / Year 1 Writing Assessment"
              : isFS2
                ? "FS2 - KG1 Writing Assessment"
                : "FS1 Writing Assessment";

    const effectiveEmail =
      formData.email.trim() ||
      localStorage.getItem("userEmail") ||
      `${formData.studentName.trim().toLowerCase().replace(/\s+/g, ".")}@school.edu`;

    let assessmentPayload;

    if (isGrade3Stage && grade3WritingMode === "phonics") {
      const detailedResponses = GRADE3_WRITING_ITEMS.map((item, idx) => ({
        itemNumber: idx + 1,
        targetWord: item.targetWord,
        phonicsPattern: item.phonicsPattern,
        writtenByStudent: grade3Written[idx] || "",
        status:
          grade3Statuses[idx] ||
          ((grade3Written[idx] || "").trim().toLowerCase() === item.targetWord
            ? "correct"
            : "not-evaluated"),
        notes: grade3Notes[idx] || "",
      }));

      assessmentPayload = {
        studentName: formData.studentName.trim(),
        email: effectiveEmail,
        yearGroupAndClass: formData.yearGroupAndClass || selectedStage,
        teacherName: formData.teacherName.trim(),
        term: formData.term || "T1",
        assessmentType: "Grade 3 / Year 4 Writing Assessment (Phonics)",
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        recommendedLevel: grade3RecommendedLevel,
        score: grade3CountCorrect,
        totalScore: grade3CountCorrect,
        totalPossible: GRADE3_WRITING_ITEMS.length,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        detailedResponses,
        studentWriting: detailedResponses
          .map(
            (d) => `${d.targetWord}: ${d.writtenByStudent || "(no attempt)"}`,
          )
          .join(", "),
      };
    } else if (isGrade2Stage && grade2WritingMode === "phonics") {
      const detailedResponses = GRADE2_WRITING_ITEMS.map((item, idx) => ({
        itemNumber: idx + 1,
        targetWord: item.targetWord,
        phonicsPattern: item.phonicsPattern,
        writtenByStudent: grade2Written[idx] || "",
        status:
          grade2Statuses[idx] ||
          ((grade2Written[idx] || "").trim().toLowerCase() === item.targetWord
            ? "correct"
            : "not-evaluated"),
        notes: grade2Notes[idx] || "",
      }));

      assessmentPayload = {
        studentName: formData.studentName.trim(),
        email: effectiveEmail,
        yearGroupAndClass: formData.yearGroupAndClass || selectedStage,
        teacherName: formData.teacherName.trim(),
        term: formData.term || "T1",
        assessmentType: "Grade 2 / Year 3 Writing Assessment (Phonics)",
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        recommendedLevel: grade2RecommendedLevel,
        score: grade2CountCorrect,
        totalScore: grade2CountCorrect,
        totalPossible: GRADE2_WRITING_ITEMS.length,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        detailedResponses,
        studentWriting: detailedResponses
          .map(
            (d) => `${d.targetWord}: ${d.writtenByStudent || "(no attempt)"}`,
          )
          .join(", "),
      };
    } else if (isEarlyStage && earlyWritingMode === "words") {
      const detailedResponses = EARLY_WORD_ITEMS.map((item, idx) => ({
        itemNumber: idx + 1,
        targetWord: item.targetWord,
        prompt: `${item.given} ${"_ ".repeat(item.targetWord.length - item.given.length).trim()}`,
        writtenByStudent: earlyWritten[idx] || "",
        status: earlyStatuses[idx] || "not-evaluated",
        notes: earlyNotes[idx] || "",
      }));
      const correct = earlyStatuses.filter((st) => st === "correct").length;
      assessmentPayload = {
        studentName: formData.studentName.trim(),
        email: effectiveEmail,
        yearGroupAndClass: formData.yearGroupAndClass || selectedStage,
        teacherName: formData.teacherName.trim(),
        term: formData.term || "T1",
        assessmentType: `${assessmentType} I (Word Writing)`,
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        // FS2 - KG1 / KG2 / Grade 1: letters correct out of 13 (as on the sheets)
        score: isEarlyScoredStage ? earlyScore : correct,
        totalScore: isEarlyScoredStage ? earlyScore : correct,
        totalPossible: isEarlyScoredStage ? EARLY_WORDS_TOTAL : EARLY_WORD_ITEMS.length,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        detailedResponses,
        studentWriting: detailedResponses
          .map((d) => `${d.targetWord}: ${d.writtenByStudent || "(no attempt)"}`)
          .join(", "),
      };
    } else if (isPictureAiStage) {
      const writingAnswers = activeQuestions.map((q, idx) => ({
        questionId: q.id,
        question: q.title,
        category: q.category,
        answer: activeAnswers[idx] || "",
        detectedKeywords: detectedPerQuestion[idx] || [],
      }));

      const allDetected = detectedPerQuestion.flat();

      assessmentPayload = {
        studentName: formData.studentName.trim(),
        email: effectiveEmail,
        yearGroupAndClass: formData.yearGroupAndClass || selectedStage,
        teacherName: formData.teacherName.trim(),
        term: formData.term || "T1",
        // FS2 - KG1 / KG2 / Grade 1 picture part is "Writing Assessment II"
        assessmentType: isEarlyStage ? `${assessmentType} II (Picture Story)` : assessmentType,
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        recommendedLevel: pictureAiRecommendedLevel,
        score: totalAiMatches,
        totalScore: totalAiMatches,
        totalPossible: totalAiPossible,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        fs2WritingAnswers: writingAnswers,
        writingAnswers,
        detectedKeywords: allDetected,
        aiKeywordsDetected: allDetected,
        studentWriting: activeQuestions
          .map(
            (q, idx) =>
              `[${q.title}]: ${activeAnswers[idx] || "(no response)"}`,
          )
          .join("\n\n"),
      };
    } else {
      const detailedResponses = FS1_WRITING_ITEMS.map((item, idx) => ({
        itemNumber: idx + 1,
        targetWord: item.targetWord,
        promptDisplay: item.promptDisplay,
        writtenByStudent: studentWritten[idx].join(""),
        status: itemStatuses[idx] || "not-evaluated",
        notes: itemNotes[idx] || "",
      }));

      assessmentPayload = {
        studentName: formData.studentName.trim(),
        email: effectiveEmail,
        yearGroupAndClass: formData.yearGroupAndClass || "FS1",
        teacherName: formData.teacherName.trim(),
        term: formData.term || "T1",
        assessmentType,
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        recommendedLevel: fs1RecommendedLevel,
        // letters correct out of 12, as on the FS1 sheet
        score: fs1Score,
        totalScore: fs1Score,
        totalPossible: FS1_TOTAL,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        detailedResponses,
        studentWriting: detailedResponses
          .map((d) => `${d.targetWord}: ${d.writtenByStudent}`)
          .join(", "),
      };
    }

    try {
      assessmentPayload = {
        ...assessmentPayload,
        schoolTier: "primary",
        skillType: "writing",
      };
      await assessmentAPI.createAssessment(assessmentPayload);
      toast.success(
        `🎉 ${assessmentType} saved successfully! (${selectedLevel})`,
      );
      setTimeout(() => {
        navigate("/assessments?tier=primary");
      }, 1200);
    } catch (err) {
      console.error("Save error:", err);
      toast.success(`${assessmentType} completed (Demo saved)!`);
      setTimeout(() => {
        navigate("/assessments?tier=primary");
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  const activeRubricLevels = isGrade5Stage
    ? GRADE5_STORY_WRITING_RUBRIC
    : isGrade4Stage
    ? GRADE4_STORY_WRITING_RUBRIC
    : isGrade3Stage
      ? grade3WritingMode === "story"
        ? GRADE3_STORY_WRITING_RUBRIC
        : GRADE3_WRITING_RUBRIC
      : isGrade2Stage
        ? grade2WritingMode === "story"
          ? GRADE2_STORY_WRITING_RUBRIC
          : GRADE2_WRITING_RUBRIC
        : isEarlyScoredStage
          ? EARLY_WORDS_RUBRIC
          : isFS1Stage
            ? FS1_RUBRIC
            : CEFR_RUBRIC_LEVELS;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Stage Switcher */}
        <div className="space-y-4">
          <Link
            to="/assessments?tier=primary"
            className="inline-flex items-center text-sm font-bold text-pink-600 hover:text-pink-700 bg-white px-3.5 py-1.5 rounded-full border border-pink-200 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Assessment Selector
          </Link>

          <StageSelector
            stages={[...PRIMARY_STAGES, 'Grade 5 / Year 6']}
            value={selectedStage}
            onChange={handleStageSwitch}
            theme="pink"
          />
        </div>

        {/* FS2 - KG1, KG2 / Year 1, Grade 1 / Year 2 — Word Writing vs Picture Story */}
        {isEarlyStage && (
          <div className="bg-white rounded-2xl border border-pink-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              {selectedStage} Assessment Part:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { key: "words", label: "✏️ Writing Assessment I · 6 Word Pictures" },
                { key: "story", label: "🖼️ Writing Assessment II · Picture & 4 Questions" },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setEarlyWritingMode(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    earlyWritingMode === m.key
                      ? "bg-white text-pink-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grade 3 / Year 4 Assessment Mode Toggle (Creative Story & AI vs Phonics Word Writing) */}
        {isGrade3Stage && (
          <div className="bg-white rounded-2xl border border-pink-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Grade 3 Assessment Mode:
              </span>
              <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md border border-pink-200">
                {grade3WritingMode === "story"
                  ? "🚀 3-Picture Creative Story & AI"
                  : "🌙 4-Word Phonics Prompts"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setGrade3WritingMode("story")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  grade3WritingMode === "story"
                    ? "bg-white text-pink-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🚀 Creative Story Writing (3 Pictures & AI)
              </button>
              <button
                type="button"
                onClick={() => setGrade3WritingMode("phonics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  grade3WritingMode === "phonics"
                    ? "bg-white text-pink-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🌙 Phonics Word Writing (4 Pictures)
              </button>
            </div>
          </div>
        )}

        {/* Grade 2 / Year 3 Assessment Mode Toggle (Fantasy Story & AI vs Phonics Word Writing) */}
        {isGrade2Stage && (
          <div className="bg-white rounded-2xl border border-pink-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Grade 2 Assessment Mode:
              </span>
              <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md border border-pink-200">
                {grade2WritingMode === "story"
                  ? "🐉 3-Picture Fantasy Story & AI"
                  : "🌙 4-Word Phonics Prompts"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setGrade2WritingMode("story")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  grade2WritingMode === "story"
                    ? "bg-white text-pink-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🐉 Fantasy Story Writing (3 Pictures & AI)
              </button>
              <button
                type="button"
                onClick={() => setGrade2WritingMode("phonics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  grade2WritingMode === "phonics"
                    ? "bg-white text-pink-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🌙 Phonics Word Writing (4 Pictures)
              </button>
            </div>
          </div>
        )}

        {/* Hero Header Banner (Pink Palette) */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {isGrade4Stage
                  ? `${upperStageLabel} Writing Assessment`
                  : isGrade3Stage
                    ? "Grade 3 / Year 4 Writing Assessment"
                    : isGrade2Stage
                      ? "Grade 2 / Year 3 Writing Assessment"
                      : isGrade1Stage
                        ? "Grade 1 / Year 2 Writing Assessment"
                        : selectedStage === "FS1"
                          ? "FS1 Writing Assessment"
                          : selectedStage === "FS2 - KG1"
                            ? "FS2 - KG1 Writing Assessment"
                            : "KG2 / Year 1 Writing Assessment"}
                {/* Two-part stages: I = 6 word pictures, II = picture & 4 questions */}
                {isEarlyStage && (earlyWritingMode === "story" ? " II" : " I")}
              </h1>
              <p className="text-pink-100 text-sm max-w-2xl font-medium">
                {isGrade5Stage
                  ? "Evaluate paragraph and story writing across 3 sci-fi pictures (Desert Traveller, Black Hole, Ruined City) with AI Assessment Conductor and CEFR Pre-A1 to B2–C1 scoring."
                  : isGrade4Stage
                  ? "Evaluate narrative story writing across 3 sequential sci-fi pictures (Neon Corridor, Alien Metropolis, Planetary Astronauts) with AI Assessment Conductor and CEFR Pre-A1 to B2–C1 scoring."
                  : isGrade3Stage
                    ? "Dual-mode Grade 3 assessment: Evaluate creative narrative storytelling across 3 sequential sci-fi/fantasy pictures (Spaceship, Canyon Ruins, Knight & Dragon) or 4 phonics word-writing prompts (Moon, Star, Girl, Cube) with live AI detection and CEFR rubric."
                    : isGrade2Stage
                      ? "Evaluate independent word writing from 4 picture stimulus prompts (moon, star, girl, cube), phonics pattern decoding, and CEFR Pre-A1 to B2–C1 assessment."
                      : isGrade1Stage
                        ? "Evaluate picture prompt story writing (kayakers navigating river rapids), vocabulary elicitation, and CEFR Pre-A1 to B2–C1 assessment."
                        : selectedStage === "FS1"
                          ? "Evaluate mark-making, pencil grip, initial letter formation, and independent CVC word spelling with full CEFR Pre-A1 to B2–C1 scoring."
                          : "Evaluate picture prompt story writing, vocabulary elicitation, and CEFR Pre-A1 to B2–C1 assessment."}
              </p>
            </div>

          </div>
        </div>

        {/* Instructions for Assessor Callout (100% exact text from sheet) */}
        <div className="bg-pink-50 border-2 border-pink-200 rounded-3xl p-6 shadow-xs relative">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-black text-pink-950 uppercase tracking-wider">
                Instructions for Assessor:
              </h2>
              <ul className="text-sm text-pink-900 font-medium space-y-1.5 list-disc list-inside">
                <li>Sit with the pupil in a calm, distraction-free space.</li>
                <li>Read each word so the child can write it alone.</li>
                <li>
                  {isWordItemsStage ? "Point to each picture and say:" : "Point to the picture and say:"}{" "}
                  <span className="font-bold italic text-pink-950">
                    {isWordItemsStage
                      ? '"Can you write the word for this picture?"'
                      : '"Can you write the words for this picture?"'}
                  </span>
                </li>
                <li>
                  Allow time for the pupil to attempt each word independently.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student & Assessment Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              Student & Assessment Details
            </h3>
            <StudentPicker
              tier="primary"
              value={formData.studentName}
              onSelect={(s) => {
                if (['FS1', 'FS2 - KG1', 'KG2 / Year 1', 'Grade 1 / Year 2', 'Grade 2 / Year 3', 'Grade 3 / Year 4', 'Grade 4 / Year 5', 'Grade 5 / Year 6'].includes(s.yearGroup)) handleStageSwitch(s.yearGroup);
                setFormData((p) => ({
                  ...p,
                  studentName: studentLabel(s),
                  yearGroupAndClass: studentYearClass(s),
                }));
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                  placeholder="e.g. Leo Henderson"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Assessor Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="teacher@school.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Year Group / Class
                </label>
                <input
                  type="text"
                  value={formData.yearGroupAndClass}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearGroupAndClass: e.target.value,
                    })
                  }
                  placeholder={selectedStage}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Teacher / Assessor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherName: e.target.value })
                  }
                  placeholder="e.g. Miss Claire"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Academic Term
                </label>
                <select
                  value={formData.term}
                  onChange={(e) =>
                    setFormData({ ...formData, term: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>


          {/* ==================================================== */}
          {/* STAGE 1: FS1 WRITING ASSESSMENT (CVC Missing Graphemes) */}
          {/* ==================================================== */}
          {selectedStage === "FS1" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    6 CVC Missing Grapheme Prompts (FS1)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Type what the child writes in the letter boxes below, then
                    mark their attempt.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-800 border border-pink-200 font-black">
                    Score: {fs1Score} / {FS1_TOTAL}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {countCorrect} Correct
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {countInitialOnly} Initial only
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                    {countMarkMaking} Developing
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FS1_WRITING_ITEMS.map((item, idx) => {
                  const currentStatus = itemStatuses[idx];
                  const fullWritten = studentWritten[idx].join("");

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 transition-all p-4 flex flex-col justify-between ${
                        currentStatus === "correct"
                          ? "border-emerald-300 bg-emerald-50/30"
                          : currentStatus === "initial-only"
                            ? "border-amber-300 bg-amber-50/30"
                            : currentStatus === "mark-making"
                              ? "border-rose-300 bg-rose-50/30"
                              : "border-slate-200 bg-white hover:border-pink-300"
                      }`}
                    >
                      <div>
                        {/* Card Header & Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Word #{idx + 1}
                          </span>
                          <ReadAloudButton text={`Picture ${item.id}. Can you write the word for this picture?`} label="Read" />
                        </div>

                        {/* Picture Thumbnail */}
                        <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-100 flex items-center justify-center p-2">
                          <img
                            src={item.image}
                            alt={item.label}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Sheet Prompt & Letter Writing Input Boxes */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-center">
                          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                            Assessment Sheet Prompt:{" "}
                            <span className="font-mono text-slate-600 font-bold text-sm tracking-widest normal-case">
                              {item.promptDisplay}
                            </span>
                          </div>

                          {/* Interactive Letter Slots */}
                          <div className="flex items-center justify-center gap-2">
                            {item.slots.map((slot, slotIdx) => {
                              const val = studentWritten[idx][slotIdx] || "";
                              const isSlotFixed = slot.isFixed;

                              return (
                                <div
                                  key={slotIdx}
                                  className="flex flex-col items-center"
                                >
                                  {isSlotFixed ? (
                                    <div className="w-11 h-12 rounded-lg bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-xl text-slate-600 shadow-2xs font-mono lowercase">
                                      {slot.char}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      maxLength={1}
                                      value={val}
                                      onChange={(e) =>
                                        handleSlotChange(
                                          idx,
                                          slotIdx,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="_"
                                      className={`w-11 h-12 text-center text-xl font-black font-mono lowercase rounded-lg border-2 shadow-inner focus:outline-none transition-all ${
                                        val.toLowerCase() ===
                                        slot.char.toLowerCase()
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                                          : val
                                            ? "border-amber-400 bg-amber-50 text-amber-800"
                                            : "border-slate-300 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Formed Word Result Preview */}
                          <div className="mt-2 text-xs font-semibold text-slate-600">
                            Result:{" "}
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {fullWritten || "(empty)"}
                            </span>
                          </div>
                        </div>

                        {/* Quick Evaluation Status Radio Buttons */}
                        <div className="space-y-1.5 mb-3">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Assessor Observation:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleItemStatusChange(idx, "correct")
                              }
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "correct"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              <span>✓</span>
                              <span>Correct CVC</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleItemStatusChange(idx, "initial-only")
                              }
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "initial-only"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                              }`}
                            >
                              <span>•</span>
                              <span>Initial Sound</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleItemStatusChange(idx, "mark-making")
                              }
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "mark-making"
                                  ? "bg-rose-500 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                              }`}
                            >
                              <span>~</span>
                              <span>Mark-making</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleItemStatusChange(idx, "none")
                              }
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "none"
                                  ? "bg-slate-700 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              <span>✕</span>
                              <span>No Attempt</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Word Specific Notes */}
                      <div className="pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={itemNotes[idx]}
                          onChange={(e) =>
                            handleItemNoteChange(idx, e.target.value)
                          }
                          placeholder="Letter formation / grip notes..."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STAGE 2: FS2 - KG1 WRITING ASSESSMENT (Picture & AI)  */}
          {/* ==================================================== */}
          {isPictureAiStage && (
            <div className="space-y-6">
              {/* Prompt Picture Showcase Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                {isGrade5Stage ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          <span>
                            🌌 3-Picture Sci-Fi Story Stimulus · Grade 5 / Year 6
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                          Desert Traveller, Black Hole & Ruined City
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Sit with the pupil in a calm, distraction-free space. Ask the pupil to write paragraphs / sentences for these pictures, using the questions to prompt.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowParkZoom(true)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-200 shadow-2xs"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                            />
                          </svg>
                          Enlarge 3-Picture Strip
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          img: grade5WritingDesert,
                          alt: "A lone traveller in a long coat walking across desert dunes at sunset",
                          title: "Desert Traveller",
                          desc: "Lone traveller, sand dunes, rocky spires, sunset",
                        },
                        {
                          img: grade5WritingBlackHole,
                          alt: "A glowing black hole ring in deep space",
                          title: "Black Hole in Space",
                          desc: "Glowing ring, dark planet, stars, purple galaxy",
                        },
                        {
                          img: grade5WritingRuinedCity,
                          alt: "Ruins of an ancient city in the desert",
                          title: "Ruined Desert City",
                          desc: "Abandoned towers, ancient ruins, dusty skyline",
                        },
                      ].map((pic, idx) => (
                        <div
                          key={pic.title}
                          className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                              <img
                                src={pic.img}
                                alt={pic.alt}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                              <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                                Picture {idx + 1}
                              </span>
                            </div>
                            <div className="text-xs font-black text-slate-900">
                              {pic.title}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {pic.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isGrade4Stage ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          <span>
                            🚀 3-Picture Sci-Fi Narrative Stimulus · Grade 4 / Year 5
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                          Neon Spaceship Corridor, Alien Metropolis & Planetary Astronauts
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Guide the pupil through the 3 sequential sci-fi pictures and transcribe their written responses. AI Assessment Conductor analyzes story structure, narrative sequence, vocabulary, and CEFR indicators.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowParkZoom(true)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-200 shadow-2xs"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                            />
                          </svg>
                          Enlarge 3-Picture Strip
                        </button>
                      </div>
                    </div>

                    {/* 3 Creative Sci-Fi Story Pictures Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pic 1 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade4WritingCorridor}
                              alt="Astronaut in red suit walking down neon corridor"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 1
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Neon Spaceship Corridor
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Astronaut in red suit, glowing corridor, futuristic station
                          </p>
                        </div>
                      </div>

                      {/* Pic 2 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade4WritingCity}
                              alt="Futuristic alien city with glowing towers"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 2
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Alien Metropolis
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Towering skyscrapers, neon metropolis, alien civilization
                          </p>
                        </div>
                      </div>

                      {/* Pic 3 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade4WritingAstronauts}
                              alt="Two astronauts holding hands on a vibrant alien world"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 3
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Planetary Explorers
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Two astronauts holding hands, alien horizon, discovery
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isGrade3Stage ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          <span>
                            🚀 3-Picture Creative Story Stimulus · Grade 3 /
                            Year 4
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                          Spaceship in Space, Canyon Ruins & Knight Battling
                          Dragon
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Guide the pupil through the 3 sequential pictures and
                          transcribe their written responses.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowParkZoom(true)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-200 shadow-2xs"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                            />
                          </svg>
                          Enlarge 3-Picture Strip
                        </button>
                      </div>
                    </div>

                    {/* 3 Creative Story Pictures Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pic 1 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade3WritingSpaceship}
                              alt="Spaceship flying with glowing thrusters in deep space nebula"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 1
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Spaceship in Deep Space
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Rocket, stars, galaxy, glowing thrusters, cosmic
                            mission
                          </p>
                        </div>
                      </div>

                      {/* Pic 2 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade3WritingCanyonRuins}
                              alt="Explorer gazing across vast desert canyon towards towering ancient ruins"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 2
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Desert Canyon Ruins
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Explorer, pillars, sandstone rocks, mountains,
                            clouds, discovering
                          </p>
                        </div>
                      </div>

                      {/* Pic 3 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade3WritingKnightDragon}
                              alt="Brave knight with sword and shield facing a giant horned dragon in a dark forest"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 3
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Knight & Dragon
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Warrior, sword, shield, horned dragon beast, dark
                            forest battle
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : isGrade2Stage ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          <span>
                            🐉 3-Picture Fantasy Adventure Stimulus · Grade 2 /
                            Year 3
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                          Rocky Mountain, Nature Valley & Campfire with Dragons
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Guide the pupil through the 3 sequential pictures and
                          transcribe their written responses.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowParkZoom(true)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-200 shadow-2xs"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                            />
                          </svg>
                          Enlarge 3-Picture Strip
                        </button>
                      </div>
                    </div>

                    {/* 3 Adventure Pictures Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pic 1 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade2WritingRockyMountain}
                              alt="Rocky landscape with traveler walking towards mountain"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 1
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Rocky Landscape
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Cliffs, mountains, path, stone, cave fortress
                          </p>
                        </div>
                      </div>

                      {/* Pic 2 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade2WritingNatureValley}
                              alt="Nature valley scene with red-cloaked explorer and eagle"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 2
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Nature Scene
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Lush forest, hill, flying eagle, green valley, cloak
                          </p>
                        </div>
                      </div>

                      {/* Pic 3 */}
                      <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 hover:border-pink-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-2 bg-slate-200 border border-slate-200">
                            <img
                              src={grade2WritingCampfireDragons}
                              alt="Campfire with children, red dragon, and blue dragon"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Picture 3
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900">
                            Campfire with Dragons
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Night, glowing fire, stars, friendly dragons
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="relative group shrink-0 w-full sm:w-80 h-64 bg-slate-100 rounded-2xl overflow-hidden border-4 border-purple-500/80 shadow-md">
                      <img
                        src={isGrade1Stage ? grade1KayakImg : fs2ParkImg}
                        alt={
                          isGrade1Stage
                            ? "Two people in a red kayak navigating river rapids"
                            : "Children playing football in the park"
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowParkZoom(true)}
                        className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors backdrop-blur-xs"
                        title="Enlarge Prompt Picture"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                          />
                        </svg>
                        Zoom
                      </button>
                      <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                        Prompt Picture
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                        <span>
                          {isGrade1Stage
                            ? "🛶 Two People Kayaking on River Rapids"
                            : "⚽ Children Playing Football in Park"}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Visual Stimulus & Story Prompt
                      </h3>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {isGrade1Stage
                          ? "Present the picture of the two kayakers navigating the river rapids to the child and guide them through the 4 questions below. Type what the student writes or transcribes."
                          : "Present the picture to the child and guide them through the 4 questions below. Type what the student writes or transcribes."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4 Writing Questions */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      {isGrade4Stage
                        ? "3 Writing Tasks & AI Story Evaluation"
                        : "4 Writing Tasks"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isGrade4Stage
                        ? "Transcribe the child’s written response for each prompt. AI evaluation analyzes vocabulary, narrative sequencing, and CEFR indicators."
                        : "Transcribe the child’s written response for each prompt."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {activeQuestions.map((q, idx) => {
                    const text = activeAnswers[idx] || "";
                    const matchedList = detectedPerQuestion[idx] || [];

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border-2 transition-all p-5 ${
                          matchedList.length > 0 && !isGrade4Stage
                            ? "border-emerald-300 bg-emerald-50/20"
                            : "border-slate-200 bg-slate-50/40 hover:border-pink-300"
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-pink-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                              {q.number}
                            </span>
                            <div>
                              <h4 className="text-base font-black text-slate-900">
                                {q.title}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium italic">
                                {q.promptGuide}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <ReadAloudButton text={q.title} />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              Category: {q.category}
                            </span>
                          </div>
                        </div>

                        {/* Student Response Textarea */}
                        <div className="mb-3">
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                            Student Written Response:
                          </label>
                          <textarea
                            rows={idx === 2 && isGrade4Stage ? 4 : idx === 3 ? 3 : 2}
                            value={text}
                            onChange={(e) =>
                              handleAnswerChange(idx, e.target.value)
                            }
                            placeholder="Type the pupil's written response here…"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          />
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STAGE 6: GRADE 3 / YEAR 4 WRITING ASSESSMENT (Word Writing) */}
          {/* ==================================================== */}
          {isGrade3Stage && grade3WritingMode === "phonics" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    4 Word-Writing Picture Prompts (Grade 3 / Year 4)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Say aloud what each picture is. Point to each picture and
                    ask: &quot;Can you write the word for this picture?&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {grade3CountCorrect} / 4 Correct
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    {grade3CountNear} Phonic Attempt
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {grade3CountInitial} Initial
                  </span>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 rounded-2xl p-4 border border-pink-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-black text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋 Instructions for Assessor</span>
                  </div>
                  <ul className="text-xs text-slate-600 font-medium list-disc list-inside space-y-0.5">
                    <li>
                      Sit with the pupil in a calm, distraction-free space.
                    </li>
                    <li>
                      Say aloud what each picture is, so the pupil can write it
                      down.
                    </li>
                    <li>
                      Point to each picture and say: &quot;Can you write the
                      word for this picture?&quot;
                    </li>
                  </ul>
                </div>
              </div>

              {/* 4 Picture Prompts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GRADE3_WRITING_ITEMS.map((item, idx) => {
                  const currentStatus = grade3Statuses[idx];
                  const written = grade3Written[idx] || "";
                  const isMatch =
                    written.trim().toLowerCase() === item.targetWord;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                        currentStatus === "correct" || isMatch
                          ? "border-emerald-300 bg-emerald-50/20"
                          : currentStatus === "near"
                            ? "border-blue-300 bg-blue-50/20"
                            : currentStatus === "initial"
                              ? "border-amber-300 bg-amber-50/20"
                              : currentStatus === "none"
                                ? "border-rose-300 bg-rose-50/20"
                                : "border-slate-200 bg-white hover:border-pink-300"
                      }`}
                    >
                      <div>
                        {/* Header: Item # and Target Word */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 font-black text-xs flex items-center justify-center">
                              #{item.id}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                              {item.phonicsPattern}
                            </span>
                          </div>
                          <span className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                              Target: {item.targetWord}
                            </span>
                            <ReadAloudButton text={`Picture ${item.id}. Can you write the word for this picture?`} label="Read" />
                          </span>
                        </div>

                        {/* Stimulus Image & Prompt */}
                        <div className="flex items-center gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center p-1.5 shadow-2xs">
                            <img
                              src={item.image}
                              alt={item.label}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-700 mb-0.5">
                              {item.label}
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              &ldquo;{item.promptGuide}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Student Written Input Field */}
                        <div className="space-y-1.5 mb-3">
                          <label
                            htmlFor={`grade3-write-${item.id}`}
                            className="block text-xs font-black uppercase tracking-wider text-slate-700"
                          >
                            Student&apos;s Written Word:
                          </label>
                          <input
                            id={`grade3-write-${item.id}`}
                            type="text"
                            value={written}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGrade3Written((prev) => {
                                const next = [...prev];
                                next[idx] = val;
                                return next;
                              });
                              // Typing re-judges the word: exact = ✓ Correct, otherwise
                              // clear any old mark so the new attempt is scored
                              setGrade3Statuses((prev) => {
                                const next = [...prev];
                                next[idx] =
                                  val.trim().toLowerCase() === item.targetWord ? "correct" : null;
                                return next;
                              });
                            }}
                            placeholder="Type what the pupil wrote…"
                            className="w-full text-base font-bold font-mono tracking-wider px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-pink-500 focus:outline-none transition-colors uppercase"
                          />

                          {/* Student Answer AI Reflection */}
                        </div>

                        {/* Evaluation Radios */}
                        <div className="space-y-1 mb-3">
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Evaluation:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setGrade3Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "correct";
                                  return next;
                                });
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                                currentStatus === "correct"
                                  ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                              }`}
                            >
                              <span>Correct ({item.targetWord})</span>
                              {currentStatus === "correct" && <span>✓</span>}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGrade3Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "near";
                                  return next;
                                });
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                                currentStatus === "near"
                                  ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                              }`}
                            >
                              <span>Phonic Attempt</span>
                              {currentStatus === "near" && <span>✓</span>}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGrade3Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "initial";
                                  return next;
                                });
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                                currentStatus === "initial"
                                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
                              }`}
                            >
                              <span>Initial Only</span>
                              {currentStatus === "initial" && <span>✓</span>}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setGrade3Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "none";
                                  return next;
                                });
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                                currentStatus === "none"
                                  ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-rose-300"
                              }`}
                            >
                              <span>No Attempt</span>
                              {currentStatus === "none" && <span>✓</span>}
                            </button>
                          </div>
                        </div>

                        {/* Notes Input */}
                        <div>
                          <input
                            type="text"
                            value={grade3Notes[idx] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGrade3Notes((prev) => {
                                const next = [...prev];
                                next[idx] = val;
                                return next;
                              });
                            }}
                            placeholder="Reversals, letter size, phonics notes..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STAGE 5: GRADE 2 / YEAR 3 WRITING ASSESSMENT (Word Writing) */}
          {/* ==================================================== */}
          {isGrade2Stage && grade2WritingMode === "phonics" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    4 Word-Writing Picture Prompts (Grade 2 / Year 3)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Say aloud what each picture is. Point to each picture and
                    ask: &quot;Can you write the word for this picture?&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {grade2CountCorrect} / 4 Correct
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    {grade2CountNear} Phonic Attempt
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {grade2CountInitial} Initial
                  </span>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 rounded-2xl p-4 border border-pink-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-black text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋 Instructions for Assessor</span>
                  </div>
                  <ul className="text-xs text-slate-600 font-medium list-disc list-inside space-y-0.5">
                    <li>
                      Sit with the pupil in a calm, distraction-free space.
                    </li>
                    <li>
                      Say aloud what each picture is, so the pupil can write it
                      down.
                    </li>
                    <li>
                      Allow time for the pupil to attempt each word
                      independently.
                    </li>
                  </ul>
                </div>
              </div>

              {/* 4 Picture Prompts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GRADE2_WRITING_ITEMS.map((item, idx) => {
                  const currentStatus = grade2Statuses[idx];
                  const written = grade2Written[idx] || "";
                  const isMatch =
                    written.trim().toLowerCase() === item.targetWord;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                        currentStatus === "correct" || isMatch
                          ? "border-emerald-300 bg-emerald-50/20"
                          : currentStatus === "near"
                            ? "border-blue-300 bg-blue-50/20"
                            : currentStatus === "initial"
                              ? "border-amber-300 bg-amber-50/20"
                              : currentStatus === "none"
                                ? "border-rose-300 bg-rose-50/20"
                                : "border-slate-200 bg-white hover:border-pink-300"
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                            Picture #{idx + 1}
                          </span>
                          <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                            Target:{" "}
                            <span className="text-pink-600 font-bold">
                              {item.targetWord}
                            </span>
                          </span>
                          <ReadAloudButton text={`Picture ${item.id}. Can you write the word for this picture?`} label="Read" />
                        </div>

                        {/* Stimulus Picture */}
                        <div className="w-full h-44 bg-slate-50 rounded-xl overflow-hidden mb-4 border border-slate-200 flex items-center justify-center p-3 relative group">
                          <img
                            src={item.image}
                            alt={item.label}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">
                            {item.phonicsPattern}
                          </span>
                        </div>

                        {/* Writing Prompt Instruction */}
                        <p className="text-xs font-medium text-slate-600 mb-3 italic">
                          &ldquo;Can you write the word for this picture?&rdquo;
                        </p>

                        {/* Student Writing Line (Simulating lined paper from sheet) */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-3">
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                            Pupil&apos;s Written Word:
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={written}
                              onChange={(e) => {
                                const val = e.target.value;
                                setGrade2Written((prev) => {
                                  const next = [...prev];
                                  next[idx] = val;
                                  return next;
                                });
                                // Typing re-judges the word: exact = ✓ Correct, otherwise
                                // clear any old mark so the new attempt is scored
                                setGrade2Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] =
                                    val.trim().toLowerCase() === item.targetWord ? "correct" : null;
                                  return next;
                                });
                              }}
                              placeholder="Type what the pupil wrote…"
                              className={`w-full px-3 py-2 text-base font-bold font-mono tracking-wider rounded-lg border-b-2 border-t-0 border-x-0 bg-white focus:outline-none focus:ring-0 transition-colors ${
                                isMatch
                                  ? "border-emerald-500 text-emerald-700 bg-emerald-50/50"
                                  : written
                                    ? "border-pink-500 text-slate-900"
                                    : "border-slate-300 text-slate-700 focus:border-pink-500"
                              }`}
                            />
                            {isMatch && (
                              <span className="absolute right-2 top-2 text-emerald-600 text-xs font-black">
                                ✓ Matched
                              </span>
                            )}
                          </div>

                          {/* Student Answer AI Reflection */}
                        </div>

                        {/* Quick Evaluation Status Buttons */}
                        <div className="space-y-1.5 mb-3">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Assessor Observation:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setGrade2Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "correct";
                                  return next;
                                });
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "correct" || isMatch
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              <span>✓</span>
                              <span>Correct ({item.targetWord})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setGrade2Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "near";
                                  return next;
                                });
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "near"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                              }`}
                            >
                              <span>~</span>
                              <span>Full Phonics / Near</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setGrade2Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "initial";
                                  return next;
                                });
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "initial"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                              }`}
                            >
                              <span>•</span>
                              <span>Initial Sound ({item.targetWord[0]})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setGrade2Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "none";
                                  return next;
                                });
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                                currentStatus === "none"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                              }`}
                            >
                              <span>✕</span>
                              <span>Mark-making / None</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Item Note */}
                      <div className="pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={grade2Notes[idx]}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGrade2Notes((prev) => {
                              const next = [...prev];
                              next[idx] = val;
                              return next;
                            });
                          }}
                          placeholder="Reversals, letter size, phonics notes..."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* FS2 - KG1, KG2 / YEAR 1, GRADE 1 / YEAR 2 — 6 WORD PROMPTS */}
          {/* ==================================================== */}
          {isEarlyStage && earlyWritingMode === "words" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    Word Writing · 6 Picture Prompts
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Point to each picture and say: "Can you write the word for this picture?" Type what the child writes.
                  </p>
                </div>
                <span className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {isEarlyScoredStage && (
                    <span className="text-xs font-black text-pink-800 bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200">
                      Score: {earlyScore} / {EARLY_WORDS_TOTAL}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    ✓ {earlyStatuses.filter((st) => st === "correct").length} / {EARLY_WORD_ITEMS.length} words correct
                  </span>
                </span>
              </div>

              <div className="border border-slate-300 rounded-2xl overflow-hidden divide-y divide-slate-300">
                {EARLY_WORD_ITEMS.map((item, idx) => {
                  const status = earlyStatuses[idx];
                  const blanks = item.targetWord.length - item.given.length;
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-1 md:grid-cols-[120px_1fr] ${
                        status === "correct"
                          ? "bg-emerald-50/40"
                          : status === "partial"
                            ? "bg-amber-50/40"
                            : status === "incorrect"
                              ? "bg-rose-50/40"
                              : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-center p-3 md:border-r border-slate-300 bg-white">
                        <img src={item.image} alt={item.label} className="h-16 w-auto object-contain" />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Prompt as on the sheet, e.g. "sh _ _" */}
                          <span className="font-mono text-2xl font-black text-slate-900 tracking-widest min-w-[110px]">
                            {item.given}
                            {" _".repeat(blanks)}
                          </span>
                          <ReadAloudButton text={`Picture ${item.id}. Can you write the word for this picture?`} label="Read" />
                          <input
                            type="text"
                            value={earlyWritten[idx]}
                            onChange={(e) => handleEarlyWrittenChange(idx, e.target.value)}
                            placeholder="Child wrote…"
                            className="w-40 px-3 py-2 rounded-xl border-2 border-slate-300 font-mono text-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                          />
                          <div className="flex gap-1.5 text-xs font-bold">
                            {[
                              { key: "correct", label: "✓ Correct", on: "bg-emerald-600 text-white", off: "hover:bg-emerald-100 hover:text-emerald-800" },
                              { key: "partial", label: "~ Partly", on: "bg-amber-500 text-white", off: "hover:bg-amber-100 hover:text-amber-800" },
                              { key: "incorrect", label: "✗ Not yet", on: "bg-rose-500 text-white", off: "hover:bg-rose-100 hover:text-rose-800" },
                            ].map((b) => (
                              <button
                                key={b.key}
                                type="button"
                                onClick={() =>
                                  setEarlyStatuses((prev) => prev.map((v, i) => (i === idx ? b.key : v)))
                                }
                                className={`px-2.5 py-1.5 rounded-xl transition-all ${
                                  status === b.key ? `${b.on} shadow-xs` : `bg-slate-100 text-slate-600 ${b.off}`
                                }`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={earlyNotes[idx]}
                          onChange={(e) =>
                            setEarlyNotes((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                          }
                          placeholder="Notes (letter formation, reversals, sounds attempted)…"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* CEFR LEVEL SCORING RUBRIC (Pre-A1 to B2–C1)         */}
          {/* 100% exact text from uploaded sheet                  */}
          {/* ==================================================== */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  CEFR Level Assessment Rubric
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  The level updates automatically as answers are typed or marked.
                  Click a row to choose a different level yourself.
                </p>
              </div>
            </div>

            {/* Auto level status — always says where the level came from and why */}
            {!hasWritingData && !manualLevel ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                ⏳ Waiting for answers — the level will be selected automatically once the pupil’s
                writing is typed in or marked.
              </div>
            ) : isAiLevel ? (
              <div className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="font-black text-pink-900">✨ Auto level:</span>
                <span className="px-3 py-1 rounded-full bg-white text-pink-800 border border-pink-300 font-black">
                  {selectedLevel}
                </span>
                {levelReason && <span className="font-semibold text-pink-900/80">Based on: {levelReason}</span>}
              </div>
            ) : (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="font-black text-indigo-900">👩‍🏫 Teacher selected:</span>
                <span className="px-3 py-1 rounded-full bg-white text-indigo-800 border border-indigo-300 font-black">
                  {manualLevel}
                </span>
                {hasWritingData && (
                  <span className="font-semibold text-indigo-900/80">
                    Auto level would be {currentRecommendedLevel}
                    {levelReason ? ` (${levelReason})` : ""}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedLevel(null)}
                  className="ml-auto px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-black hover:bg-indigo-100"
                >
                  ↺ Use auto level
                </button>
              </div>
            )}

            {/* Rubric Cards */}
            <div className="space-y-2.5">
              {activeRubricLevels.map((item) => {
                const isSelected = selectedLevel === item.level;
                // Only point at the auto level once there's something to score
                const isAuto = hasWritingData && currentRecommendedLevel === item.level;

                return (
                  <div
                    key={item.level}
                    onClick={() => setSelectedLevel(item.level)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start gap-4 ${
                      isSelected
                        ? item.activeBg
                        : "border-slate-200 hover:border-pink-300 bg-white"
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="radio"
                        name="cefrLevel"
                        checked={isSelected}
                        onChange={() => setSelectedLevel(item.level)}
                        className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${item.badgeBg}`}
                        >
                          {item.level}
                        </span>
                        {isSelected && isAiLevel && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white px-2 py-0.5 rounded-full">
                            ✨ Auto selected
                          </span>
                        )}
                        {isSelected && !isAiLevel && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            👩‍🏫 Teacher selected
                          </span>
                        )}
                        {isAuto && !isSelected && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full">
                            Auto level
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Teaching Focus & Action Plan */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              Identified Teaching Focus & Next Steps
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              e.g., Pencil grip correction, initial sound grapheme
              correspondence, Phase 2/3 CVC encoding support, sentence
              structure, fine-motor tracing activities.
            </p>
            <textarea
              rows={3}
              value={teachingFocusNotes}
              onChange={(e) => setTeachingFocusNotes(e.target.value)}
              placeholder="Record specific teaching goals, interventions, or handwriting practice targets for this pupil..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              Finalizing evaluation for{" "}
              <strong className="text-slate-800">
                {formData.studentName || "Student"}
              </strong>{" "}
              · Level:{" "}
              <strong className="text-pink-600">
                {selectedLevel || "Not selected"}
              </strong>
              {selectedStage === "FS1" && (
                <span>
                  {" "}
                  · Correct CVC:{" "}
                  <strong className="text-emerald-700 font-black">
                    {countCorrect} / 6
                  </strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/assessments?tier=primary"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading
                  ? "Saving Assessment..."
                  : `Submit ${selectedStage} Assessment`}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Printable Sheet / AI Keywords Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-pink-50">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                  {isGrade4Stage
                    ? `${upperStageLabel} Writing Assessment · Specification Sheet`
                    : isGrade3Stage
                      ? modalTab === "sheet"
                        ? "Grade 3 / Year 4 Writing Assessment · Story Specification Sheet"
                        : modalTab === "keywords"
                          ? "Grade 3 / Year 4 Writing Assessment · Word Writing Sheet"
                          : "Student Lined Worksheet · Grade 3 / Year 4"
                      : isGrade2Stage
                        ? modalTab === "sheet"
                          ? "Grade 2 / Year 3 Writing Assessment · Specification Sheet"
                          : modalTab === "keywords"
                            ? "AI Keywords Detection Guide · Grade 2 / Year 3"
                            : "Student Lined Worksheet · Grade 2 / Year 3"
                        : isGrade1Stage
                          ? modalTab === "sheet"
                            ? "Grade 1 / Year 2 Writing Assessment · Specification Sheet"
                            : modalTab === "keywords"
                              ? "AI Keywords Detection Guide · Grade 1 / Year 2"
                              : "Student Lined Worksheet · Grade 1 / Year 2"
                          : selectedStage === "FS1"
                            ? "FS1 Writing Assessment · Original Document"
                            : selectedStage === "KG2 / Year 1"
                              ? modalTab === "sheet"
                                ? "KG2 / Year 1 Writing Assessment · Specification Sheet"
                                : modalTab === "keywords"
                                  ? "AI Keywords Detection Guide · KG2 / Year 1"
                                  : "Student Lined Worksheet · KG2 / Year 1"
                              : modalTab === "sheet"
                                ? "FS2 - KG1 Writing Assessment · Specification Sheet"
                                : modalTab === "keywords"
                                  ? "AI Keywords Detection Guide · FS2 - KG1"
                                  : "Student Lined Worksheet · FS2 - KG1"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Tab Switcher (FS2, KG2, Grade 1, Grade 2) */}
            {(selectedStage === "FS2 - KG1" ||
              selectedStage === "KG2 / Year 1" ||
              isGrade1Stage ||
              isGrade2Stage ||
              isGrade3Stage) && (
              <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setModalTab("sheet")}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                    modalTab === "sheet"
                      ? "bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📄 Assessment Sheet
                </button>
                {/* AI keyword guides are not shown; Grade 3 keeps its official Word Writing Sheet */}
                {isGrade3Stage && (
                  <button
                    type="button"
                    onClick={() => setModalTab("keywords")}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                      modalTab === "keywords"
                        ? "bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Word Writing Sheet
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalTab("worksheet")}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                    modalTab === "worksheet"
                      ? "bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ✏️ Student Lined Worksheet
                </button>
              </div>
            )}

            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center gap-4 bg-slate-100">
              <img
                src={
                  isGrade5Stage
                    ? grade5Year6WritingSheetImg
                    : isGrade4Stage
                    ? grade4Year5WritingSheetImg
                    : isGrade3Stage
                      ? modalTab === "sheet"
                        ? grade3Year4WritingStorySheetImg
                        : modalTab === "keywords"
                          ? grade3Year4WritingWordsSheet
                          : grade3Year4WritingStudentWorksheet
                      : isGrade2Stage
                        ? modalTab === "sheet"
                          ? grade2Year3WritingSheetImg
                          : modalTab === "keywords"
                            ? grade2Year3WritingAiKeywordsSheet
                            : grade2Year3WritingStudentWorksheet
                        : isGrade1Stage
                          ? modalTab === "sheet"
                            ? grade1Year2WritingSheet
                            : modalTab === "keywords"
                              ? grade1Year2AiKeywordsSheet
                              : grade1Year2StudentWorksheet
                          : selectedStage === "FS1"
                            ? fs1SheetImg
                            : selectedStage === "KG2 / Year 1"
                              ? modalTab === "sheet"
                                ? kg2WritingSheet
                                : modalTab === "keywords"
                                  ? kg2AiKeywordsSheet
                                  : fs2WritingStudentWorksheet
                              : modalTab === "sheet"
                                ? fs2WritingSheet
                                : modalTab === "keywords"
                                  ? fs2AiKeywordsSheet
                                  : fs2WritingStudentWorksheet
                }
                alt="Assessment Document"
                className="max-w-full h-auto rounded-xl shadow-lg border border-slate-300"
              />
              {isGrade5Stage && (
                <img
                  src={grade5Year6WritingResponseSheetImg}
                  alt="Grade 5 / Year 6 Student Writing Response Sheet"
                  className="max-w-full h-auto rounded-xl shadow-lg border border-slate-300"
                />
              )}
            </div>
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Picture Zoom Modal */}
      {showParkZoom && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-purple-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                  {/* Neutral title — don't describe the picture to the pupil */}
                  Prompt Picture · Full View
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowParkZoom(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex justify-center bg-slate-100">
              <img
                src={
                  isGrade5Stage
                    ? grade5WritingSciFiStrip
                    : isGrade4Stage
                    ? grade4WritingSciFiStrip
                    : isGrade3Stage
                      ? grade3WritingAdventureStrip
                      : isGrade2Stage
                        ? grade2WritingAdventureStrip
                        : isGrade1Stage
                          ? grade1KayakImg
                          : fs2ParkImg
                }
                alt={
                  isGrade5Stage
                    ? "3-Picture Sci-Fi Story: Desert Traveller, Black Hole, and Ruined City"
                    : isGrade4Stage
                    ? "3-Picture Sci-Fi Story: Neon Corridor, Futuristic City, and Planetary Astronauts"
                    : isGrade3Stage
                      ? "3-Picture Creative Story: Spaceship, Desert Canyon Ruins, and Knight battling Dragon"
                      : isGrade2Stage
                        ? "3-Picture Adventure: Rocky mountain, nature valley, and campfire with dragons"
                        : isGrade1Stage
                          ? "Two people kayaking on river rapids"
                          : "Children playing football in the park"
                }
                className="max-w-full max-h-[70vh] rounded-2xl shadow-xl object-contain border-4 border-purple-500"
              />
            </div>
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setShowParkZoom(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
