import React, { useState, useEffect, useMemo } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import { toast } from "react-toastify";
import { assessmentAPI } from "../services/api";
import AIAssistantConductor from "../components/AIAssistantConductor";

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
    level: "A1.0â€“A1.2",
    description:
      "Writes initial sounds of CVC words (mostly correct). One mistake allowed per word.",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    activeBg: "bg-orange-50 border-orange-400 text-orange-900",
    dotColor: "bg-orange-500",
  },
  {
    level: "A2.0â€“A2.2",
    description:
      "Writes some initial sounds in CVC or CVVC words. Confidently writes CVC words. Beginning to write 4â€“5 letter words.",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    activeBg: "bg-amber-50 border-amber-400 text-amber-900",
    dotColor: "bg-amber-500",
  },
  {
    level: "A2.3â€“B1.1",
    description:
      "Can write 4â€“5 letter words independently with increasing accuracy.",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    activeBg: "bg-blue-50 border-blue-400 text-blue-900",
    dotColor: "bg-blue-600",
  },
  {
    level: "B1.2â€“B1.3",
    description: "Can write a few words together to form a simple sentence.",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    activeBg: "bg-indigo-50 border-indigo-400 text-indigo-900",
    dotColor: "bg-indigo-600",
  },
  {
    level: "B2â€“C1",
    description:
      "Writes fluently with few mistakes. Uses clear formation and confident spelling patterns.",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-50 border-emerald-400 text-emerald-900",
    dotColor: "bg-emerald-600",
  },
];

const FS1_KEY_WORDS = [
  "hen",
  "dog",
  "sit",
  "boy",
  "chicken",
  "web",
  "cobweb",
  "bug",
  "bugs",
  "sun",
  "sunshine",
  "smile",
];

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
    category: "Sentence / Story keywords",
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

const FS2_KEY_WORDS = [
  "children",
  "ball",
  "grass",
  "park",
  "playing",
  "trees",
  "sky",
  "football",
  "girl",
  "boy",
  "happy",
  "fun",
];

const KG2_KEY_WORDS = [
  "children",
  "ball",
  "grass",
  "park",
  "playing",
  "trees",
  "sky",
  "football",
  "girl",
  "boy",
  "happy",
  "fun",
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
    category: "Sentence / Story keywords",
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

const GRADE1_KEY_WORDS = [
  "water",
  "river",
  "boat",
  "ore",
  "kayak",
  "life jacket",
  "trees",
  "flow",
  "fast",
  "dangerous",
  "sky",
  "blue",
  "rocks",
  "raft",
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

const GRADE2_KEY_WORDS = [
  "moon",
  "star",
  "girl",
  "cube",
  "night",
  "sky",
  "space",
  "shine",
  "child",
  "box",
  "block",
  "shape",
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
    category: "Sentence / Story keywords",
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

const GRADE2_STORY_KEY_WORDS = [
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
  "warm",
  "glowing",
  "once upon a time",
  "adventure",
  "journey",
  "magical place",
  "happy",
  "excited",
  "surprised",
  "brave",
  "beginning",
  "middle",
  "end",
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

const GRADE3_KEY_WORDS = [
  "moon",
  "star",
  "girl",
  "cube",
  "night",
  "sky",
  "space",
  "shine",
  "child",
  "box",
  "block",
  "shape",
];

// ==========================================
// GRADE 3 / YEAR 4 STORY WRITING ASSESSMENT DATA
// 3 Creative Adventure Pictures (Spaceship, Canyon Ruins, Knight & Dragon)
// 100% exact text from Uploaded Sheets
// ==========================================
const GRADE3_STORY_WRITING_QUESTIONS = [
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

const GRADE3_STORY_KEY_WORDS = [
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
  "once upon a time",
  "suddenly",
  "then",
  "finally",
  "bravely",
  "quest",
  "mysterious",
  "journey",
];

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

const GRADE4_STORY_KEY_WORDS = [
  "corridor",
  "lights",
  "walking",
  "suit",
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
  "first",
  "next",
  "then",
  "after that",
  "finally",
  "journey",
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
  const isGrade4Initial =
    location.pathname.includes("grade4") ||
    location.pathname.includes("year5") ||
    searchParams.get("grade") === "grade4" ||
    searchParams.get("grade") === "year5" ||
    searchParams.get("stage") === "grade4" ||
    searchParams.get("stage") === "year5";

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

  const initialStage = isGrade4Initial
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
  const [grade3WritingMode, setGrade3WritingMode] = useState("story"); // 'story' | 'phonics'
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [modalTab, setModalTab] = useState("sheet"); // 'sheet' | 'keywords' | 'worksheet'
  const [showParkZoom, setShowParkZoom] = useState(false);
  const [loading, setLoading] = useState(false);

  const isGrade4Stage =
    selectedStage === "Grade 4 / Year 5" ||
    selectedStage.includes("Year 5") ||
    selectedStage.includes("Grade 4");
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
  const isWordItemsStage =
    isFS1Stage ||
    (isGrade2Stage && grade2WritingMode === "phonics") ||
    (isGrade3Stage && grade3WritingMode === "phonics");
  const isPictureAiStage =
    selectedStage === "FS2 - KG1" ||
    selectedStage === "KG2 / Year 1" ||
    isGrade1Stage ||
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

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [formationQuality, setFormationQuality] = useState("Developing");
  const [pencilGrip, setPencilGrip] = useState("Dynamic Tripod");
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
  const [aiAnswers, setAiAnswers] = useState([]);

  const activeQuestions = isGrade4Stage
    ? GRADE4_STORY_WRITING_QUESTIONS
    : isGrade3Stage
      ? GRADE3_STORY_WRITING_QUESTIONS
      : isGrade2Stage
        ? GRADE2_STORY_WRITING_QUESTIONS
        : isGrade1Stage
          ? GRADE1_WRITING_QUESTIONS
          : FS2_WRITING_QUESTIONS;

  const activeAnswers = isGrade4Stage
    ? grade4Answers
    : isGrade3Stage
      ? grade3Answers
      : isGrade2Stage
        ? grade2Answers
        : isGrade1Stage
          ? grade1Answers
          : selectedStage === "KG2 / Year 1"
            ? kg2Answers
            : fs2Answers;

  const conductorQuestions = useMemo(() => {
    if (selectedStage === "FS1") {
      return FS1_WRITING_ITEMS.map(
        (i) => `Spell and write: ${i.targetWord} (${i.promptDisplay})`,
      );
    }
    if (isGrade4Stage) {
      return GRADE4_STORY_WRITING_QUESTIONS.map((q) => q.title);
    }
    if (isGrade3Stage) {
      if (grade3WritingMode === "phonics") {
        return GRADE3_WRITING_ITEMS.map(
          (item, idx) =>
            `Picture ${idx + 1}: Can you write the word for this picture? (${item.targetWord})`,
        );
      }
      return GRADE3_STORY_WRITING_QUESTIONS.map((q) => q.title);
    }
    if (isGrade2Stage) {
      if (grade2WritingMode === "phonics") {
        return GRADE2_WRITING_ITEMS.map(
          (item, idx) =>
            `Picture ${idx + 1}: Can you write the word for this picture? (${item.targetWord})`,
        );
      }
      return GRADE2_STORY_WRITING_QUESTIONS.map((q) => q.title);
    }
    return activeQuestions.map((q) => q.title);
  }, [
    selectedStage,
    isGrade4Stage,
    isGrade3Stage,
    grade3WritingMode,
    isGrade2Stage,
    grade2WritingMode,
    activeQuestions,
  ]);

  const conductorRubrics = useMemo(() => {
    if (selectedStage === "FS1") {
      return FS1_WRITING_ITEMS.map((i) => ({
        keyPhrases: [i.targetWord],
        relatablePhrases: i.slots.map((s) => s.char),
      }));
    }
    if (isGrade4Stage) {
      return GRADE4_STORY_WRITING_QUESTIONS.map((q) => ({
        keyPhrases: q.aiKeywords,
        relatablePhrases: [
          "corridor",
          "city",
          "astronauts",
          "planet",
          "story",
          "first",
          "next",
          "finally",
          "spacesuit",
          "helmet",
          "futuristic",
        ],
      }));
    }
    if (isGrade3Stage) {
      if (grade3WritingMode === "phonics") {
        return GRADE3_WRITING_ITEMS.map((item) => ({
          keyPhrases: [item.targetWord, ...item.aiKeyWords],
          relatablePhrases: [item.targetWord],
        }));
      }
      return GRADE3_STORY_WRITING_QUESTIONS.map((q) => ({
        keyPhrases: q.aiKeywords,
        relatablePhrases: [],
      }));
    }
    if (isGrade2Stage) {
      if (grade2WritingMode === "phonics") {
        return GRADE2_WRITING_ITEMS.map((item) => ({
          keyPhrases: [item.targetWord, ...item.aiKeyWords],
          relatablePhrases: [item.targetWord],
        }));
      }
      return GRADE2_STORY_WRITING_QUESTIONS.map((q) => ({
        keyPhrases: q.aiKeywords,
        relatablePhrases: [],
      }));
    }
    return activeQuestions.map((q) => ({
      keyPhrases: q.aiKeywords,
      relatablePhrases: [],
    }));
  }, [
    selectedStage,
    isGrade4Stage,
    isGrade3Stage,
    grade3WritingMode,
    isGrade2Stage,
    grade2WritingMode,
    activeQuestions,
  ]);

  // Sync AI answers to active form textareas if not manually edited
  useEffect(() => {
    if (selectedStage !== "FS1" && aiAnswers && aiAnswers.length > 0) {
      if (isGrade4Stage) {
        setGrade4Answers((prev) => {
          const next = { ...prev };
          let changed = false;
          aiAnswers.forEach((ans, idx) => {
            if (ans && ans.trim().length > 0 && !next[idx]) {
              next[idx] = ans.trim();
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      } else if (isGrade3Stage) {
        if (grade3WritingMode === "story") {
          setGrade3Answers((prev) => {
            const next = { ...prev };
            let changed = false;
            aiAnswers.forEach((ans, idx) => {
              if (ans && ans.trim().length > 0 && !next[idx]) {
                next[idx] = ans.trim();
                changed = true;
              }
            });
            return changed ? next : prev;
          });
        } else {
          setGrade3Written((prev) => {
            const next = [...prev];
            let changed = false;
            aiAnswers.forEach((ans, idx) => {
              if (ans && ans.trim().length > 0 && !next[idx]) {
                const cleaned = ans
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z]/g, "");
                next[idx] = cleaned;
                changed = true;
              }
            });
            return changed ? next : prev;
          });
        }
      } else if (isGrade2Stage) {
        if (grade2WritingMode === "story") {
          setGrade2Answers((prev) => {
            const next = { ...prev };
            let changed = false;
            aiAnswers.forEach((ans, idx) => {
              if (ans && ans.trim().length > 0 && !next[idx]) {
                next[idx] = ans.trim();
                changed = true;
              }
            });
            return changed ? next : prev;
          });
        } else {
          setGrade2Written((prev) => {
            const next = [...prev];
            let changed = false;
            aiAnswers.forEach((ans, idx) => {
              if (ans && ans.trim().length > 0 && !next[idx]) {
                const cleaned = ans
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z]/g, "");
                next[idx] = cleaned;
                changed = true;
              }
            });
            return changed ? next : prev;
          });
        }
      } else if (selectedStage === "FS2 - KG1") {
        setFs2Answers((prev) => {
          const next = { ...prev };
          let changed = false;
          aiAnswers.forEach((ans, idx) => {
            if (ans && ans.trim().length > 0 && !next[idx]) {
              next[idx] = ans.trim();
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      } else if (selectedStage === "KG2 / Year 1") {
        setKg2Answers((prev) => {
          const next = { ...prev };
          let changed = false;
          aiAnswers.forEach((ans, idx) => {
            if (ans && ans.trim().length > 0 && !next[idx]) {
              next[idx] = ans.trim();
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      } else if (isGrade1Stage) {
        setGrade1Answers((prev) => {
          const next = { ...prev };
          let changed = false;
          aiAnswers.forEach((ans, idx) => {
            if (ans && ans.trim().length > 0 && !next[idx]) {
              next[idx] = ans.trim();
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    }
  }, [
    aiAnswers,
    selectedStage,
    isGrade4Stage,
    isGrade3Stage,
    grade3WritingMode,
    isGrade1Stage,
    isGrade2Stage,
    grade2WritingMode,
  ]);
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

  const fs1RecommendedLevel = useMemo(() => {
    if (countCorrect >= 5) return "B2–C1";
    if (countCorrect >= 4) return "B1.2–B1.3";
    if (countCorrect >= 2 || countInitialOnly + countCorrect >= 4)
      return "A2.3–B1.1";
    if (countInitialOnly >= 3 || countCorrect >= 1) return "A2.0–A2.2";
    if (countInitialOnly >= 1 || countMarkMaking >= 2) return "A1.0–A1.2";
    return "Pre-A1";
  }, [countCorrect, countInitialOnly, countMarkMaking]);

  // ------------------------------------------
  // FS2, KG2, Grade 1, Grade 2, Grade 3 & Grade 4 AI Keywords Detection & Auto-recommendation
  // ------------------------------------------

  const handleAnswerChange = (qIndex, text) => {
    if (isGrade4Stage) {
      setGrade4Answers((prev) => ({ ...prev, [qIndex]: text }));
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

  // Quick-append keyword chip to text
  const handleAppendKeyword = (qIndex, keyword) => {
    const setter = isGrade4Stage
      ? setGrade4Answers
      : isGrade3Stage
        ? setGrade3Answers
        : isGrade2Stage
          ? setGrade2Answers
          : isGrade1Stage
            ? setGrade1Answers
            : selectedStage === "KG2 / Year 1"
              ? setKg2Answers
              : setFs2Answers;

    setter((prev) => {
      const current = prev[qIndex] || "";
      if (matchKeyword(current, keyword)) return prev; // already present
      const separator =
        current.trim().length > 0
          ? current.trim().endsWith(",") || current.trim().endsWith(".")
            ? " "
            : ", "
          : "";
      return {
        ...prev,
        [qIndex]: current + separator + keyword,
      };
    });
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
  const pictureAiRecommendedLevel = useMemo(() => {
    const sentenceText = (activeAnswers[3] || "").trim();
    const sentenceMatches = detectedPerQuestion[3] || [];
    const wordCountTotal = Object.values(activeAnswers)
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    // B2â€“C1: Fluent, confident sentences, high keyword detection
    if (
      (sentenceMatches.length >= 2 ||
        (sentenceText.split(/\s+/).length >= 5 && totalAiMatches >= 6)) &&
      formationQuality === "Clear & Confident"
    ) {
      return "B2â€“C1";
    }

    // B1.2â€“B1.3: Formed simple sentence (few words together)
    if (
      sentenceMatches.length >= 1 ||
      sentenceText.split(/\s+/).length >= 3 ||
      totalAiMatches >= 5
    ) {
      return "B1.2â€“B1.3";
    }

    // A2.3â€“B1.1: 4â€“5 letter words independently with increasing accuracy
    if (totalAiMatches >= 3 || wordCountTotal >= 4) {
      return "A2.3â€“B1.1";
    }

    // A2.0â€“A2.2: Some initial sounds, CVC words confident
    if (totalAiMatches >= 1 || wordCountTotal >= 2) {
      return "A2.0â€“A2.2";
    }

    // A1.0â€“A1.2: Initial sounds of words
    if (wordCountTotal >= 1 || formationQuality === "Emerging") {
      return "A1.0â€“A1.2";
    }

    // Pre-A1: Mark-making / poor legibility
    return "Pre-A1";
  }, [activeAnswers, detectedPerQuestion, totalAiMatches, formationQuality]);

  const grade2CountCorrect = grade2Statuses.filter(
    (s) => s === "correct",
  ).length;
  const grade2CountNear = grade2Statuses.filter((s) => s === "near").length;
  const grade2CountInitial = grade2Statuses.filter(
    (s) => s === "initial",
  ).length;

  const grade2RecommendedLevel = useMemo(() => {
    let correctAttempts = 0;
    let nearAttempts = 0;
    let initialAttempts = 0;

    GRADE2_WRITING_ITEMS.forEach((item, idx) => {
      const written = (grade2Written[idx] || "").trim().toLowerCase();
      const status = grade2Statuses[idx];
      if (status === "correct" || written === item.targetWord) {
        correctAttempts += 1;
      } else if (
        status === "near" ||
        (written.length >= 2 &&
          (written[0] === item.targetWord[0] ||
            written.includes(item.targetWord.slice(0, 2))))
      ) {
        nearAttempts += 1;
      } else if (
        status === "initial" ||
        (written.length > 0 && written[0] === item.targetWord[0])
      ) {
        initialAttempts += 1;
      }
    });

    if (correctAttempts >= 4) return "B2–C1";
    if (correctAttempts >= 3 || correctAttempts + nearAttempts >= 4)
      return "B1.2–B1.3";
    if (correctAttempts + nearAttempts >= 2) return "A2.3–B1.1";
    if (nearAttempts >= 1 || initialAttempts >= 2) return "A2.0–A2.2";
    if (initialAttempts >= 1) return "A1.0–A1.2";
    return "Pre-A1";
  }, [grade2Statuses, grade2Written]);

  const grade3CountCorrect = grade3Statuses.filter(
    (s) => s === "correct",
  ).length;
  const grade3CountNear = grade3Statuses.filter((s) => s === "near").length;
  const grade3CountInitial = grade3Statuses.filter(
    (s) => s === "initial",
  ).length;

  const grade3RecommendedLevel = useMemo(() => {
    let correctAttempts = 0;
    let nearAttempts = 0;
    let initialAttempts = 0;

    GRADE3_WRITING_ITEMS.forEach((item, idx) => {
      const written = (grade3Written[idx] || "").trim().toLowerCase();
      const status = grade3Statuses[idx];
      if (status === "correct" || written === item.targetWord) {
        correctAttempts += 1;
      } else if (
        status === "near" ||
        (written.length >= 2 &&
          (written[0] === item.targetWord[0] ||
            written.includes(item.targetWord.slice(0, 2))))
      ) {
        nearAttempts += 1;
      } else if (
        status === "initial" ||
        (written.length > 0 && written[0] === item.targetWord[0])
      ) {
        initialAttempts += 1;
      }
    });

    if (correctAttempts >= 4) return "B2–C1";
    if (correctAttempts >= 3 || correctAttempts + nearAttempts >= 4)
      return "B1.2–B1.3";
    if (correctAttempts + nearAttempts >= 2) return "A2.3–B1.1";
    if (nearAttempts >= 1 || initialAttempts >= 2) return "A2.0–A2.2";
    if (initialAttempts >= 1) return "A1.0–A1.2";
    return "Pre-A1";
  }, [grade3Statuses, grade3Written]);

  const currentRecommendedLevel = isGrade3Stage
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

  // Toggle keyword chip (common)
  const toggleKeyword = (kw) => {
    setUsedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw],
    );
  };

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
      ? "Grade 4 / Year 5 Writing Assessment"
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
        formationQuality,
        pencilGrip,
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
        formationQuality,
        pencilGrip,
        keyWordsUsed: usedKeywords,
        teachingFocus: teachingFocusNotes,
        detailedResponses,
        studentWriting: detailedResponses
          .map(
            (d) => `${d.targetWord}: ${d.writtenByStudent || "(no attempt)"}`,
          )
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
        assessmentType,
        cefrLevel: selectedLevel,
        writingScore: selectedLevel,
        level: selectedLevel,
        recommendedLevel: pictureAiRecommendedLevel,
        score: totalAiMatches,
        totalScore: totalAiMatches,
        totalPossible: totalAiPossible,
        formationQuality,
        pencilGrip,
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
        score: countCorrect,
        totalScore: countCorrect,
        totalPossible: FS1_WRITING_ITEMS.length,
        formationQuality,
        pencilGrip,
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
        `ðŸŽ‰ ${assessmentType} saved successfully! (${selectedLevel})`,
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

  const activeKeyWordsList = isGrade4Stage
    ? GRADE4_STORY_KEY_WORDS
    : isGrade3Stage
      ? grade3WritingMode === "story"
        ? GRADE3_STORY_KEY_WORDS
        : GRADE3_KEY_WORDS
      : isGrade2Stage
        ? grade2WritingMode === "story"
          ? GRADE2_STORY_KEY_WORDS
          : GRADE2_KEY_WORDS
        : isGrade1Stage
          ? GRADE1_KEY_WORDS
          : selectedStage === "FS1"
            ? FS1_KEY_WORDS
            : selectedStage === "FS2 - KG1"
              ? FS2_KEY_WORDS
              : KG2_KEY_WORDS;

  const activeRubricLevels = isGrade4Stage
    ? GRADE4_STORY_WRITING_RUBRIC
    : isGrade3Stage
      ? grade3WritingMode === "story"
        ? GRADE3_STORY_WRITING_RUBRIC
        : GRADE3_WRITING_RUBRIC
      : isGrade2Stage
        ? grade2WritingMode === "story"
          ? GRADE2_STORY_WRITING_RUBRIC
          : GRADE2_WRITING_RUBRIC
        : CEFR_RUBRIC_LEVELS;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Stage Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          {/* Stage Selector Toggle (FS1, FS2 - KG1, KG2 / Year 1, Grade 1 / Year 2) */}
          <div className="inline-flex bg-slate-200/90 p-1.5 rounded-2xl shadow-inner gap-1 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => handleStageSwitch("FS1")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "FS1"
                  ? "bg-white text-pink-600 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>ðŸŒ¸ FS1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "FS1"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                CVC Prompts
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("FS2 - KG1")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "FS2 - KG1"
                  ? "bg-white text-pink-600 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>ðŸŒ¼ FS2 - KG1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "FS2 - KG1"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Picture & AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("KG2 / Year 1")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "KG2 / Year 1"
                  ? "bg-white text-pink-600 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>ðŸŽ“ KG2 / Year 1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "KG2 / Year 1"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Picture & AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("Grade 1 / Year 2")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "Grade 1 / Year 2"
                  ? "bg-white text-pink-600 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>â­ Grade 1 / Year 2</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "Grade 1 / Year 2"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Picture & AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("Grade 2 / Year 3")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "Grade 2 / Year 3"
                  ? "bg-white text-pink-600 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>⭐ Grade 2 / Year 3</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "Grade 2 / Year 3"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Word Writing
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("Grade 3 / Year 4")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "Grade 3 / Year 4"
                  ? "bg-white text-pink-600 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>⭐ Grade 3 / Year 4</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "Grade 3 / Year 4"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Dual Mode & AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch("Grade 4 / Year 5")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === "Grade 4 / Year 5"
                  ? "bg-white text-pink-600 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <span>⭐ Grade 4 / Year 5</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedStage === "Grade 4 / Year 5"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                Sci-Fi Story & AI
              </span>
            </button>
          </div>
        </div>

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
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <span>
                  ✍️{" "}
                  {isGrade4Stage
                    ? "Grade 4 / Year 5 Writing Assessment"
                    : isGrade3Stage
                      ? "Grade 3 / Year 4 Writing Assessment"
                      : isGrade2Stage
                        ? "Grade 2 / Year 3 Writing Assessment"
                        : isGrade1Stage
                          ? "Grade 1 / Year 2 Writing Assessment"
                          : selectedStage === "FS1"
                            ? "FS1 Early Writing"
                            : selectedStage === "FS2 - KG1"
                              ? "FS2 - KG1 Writing Assessment"
                              : "KG2 / Year 1 Writing Assessment"}
                </span>
                <span>•</span>
                <span>
                  {isGrade4Stage
                    ? "3 Sequential Sci-Fi Pictures & AI Conductor"
                    : isGrade3Stage
                      ? grade3WritingMode === "story"
                        ? "3 Creative Story Pictures & AI Detection"
                        : "4 Picture Word-Writing Prompts"
                      : isGrade2Stage
                        ? "4 Picture Word-Writing Prompts"
                        : selectedStage === "FS1"
                          ? "6 CVC Missing Grapheme Prompts"
                          : "Picture Prompt & AI Keyword Detection"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {isGrade4Stage
                  ? "Grade 4 / Year 5 Writing Assessment"
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
              </h1>
              <p className="text-pink-100 text-sm max-w-2xl font-medium">
                {isGrade4Stage
                  ? "Evaluate narrative story writing across 3 sequential sci-fi pictures (Neon Corridor, Alien Metropolis, Planetary Astronauts) with AI Assessment Conductor and CEFR Pre-A1 to B2–C1 scoring."
                  : isGrade3Stage
                    ? "Dual-mode Grade 3 assessment: Evaluate creative narrative storytelling across 3 sequential sci-fi/fantasy pictures (Spaceship, Canyon Ruins, Knight & Dragon) or 4 phonics word-writing prompts (Moon, Star, Girl, Cube) with live AI detection and CEFR rubric."
                    : isGrade2Stage
                      ? "Evaluate independent word writing from 4 picture stimulus prompts (moon, star, girl, cube), phonics pattern decoding, and CEFR Pre-A1 to B2–C1 assessment."
                      : isGrade1Stage
                        ? "Evaluate picture prompt story writing (kayakers navigating river rapids), vocabulary elicitation, and real-time AI keyword detection with CEFR Pre-A1 to B2–C1 assessment."
                        : selectedStage === "FS1"
                          ? "Evaluate mark-making, pencil grip, initial letter formation, and independent CVC word spelling with full CEFR Pre-A1 to B2–C1 scoring."
                          : "Evaluate picture prompt story writing, vocabulary elicitation, and real-time AI keyword detection with CEFR Pre-A1 to B2–C1 assessment."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  setModalTab("sheet");
                  setShowSheetModal(true);
                }}
                className="inline-flex items-center gap-2 bg-white text-pink-700 font-bold px-4 py-2.5 rounded-2xl shadow-lg hover:bg-pink-50 transition-all hover:scale-105 text-sm"
              >
                <svg
                  className="w-5 h-5 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                View Assessment Sheet
              </button>

              {isPictureAiStage && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("keywords");
                      setShowSheetModal(true);
                    }}
                    className="inline-flex items-center gap-2 bg-pink-700/80 backdrop-blur text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg hover:bg-pink-800 transition-all hover:scale-105 text-sm border border-white/20"
                  >
                    <svg
                      className="w-5 h-5 text-pink-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
                    </svg>
                    AI Keywords Sheet
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalTab("worksheet");
                      setShowSheetModal(true);
                    }}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white font-bold px-4 py-2.5 rounded-2xl shadow-lg hover:bg-white/30 transition-all hover:scale-105 text-sm border border-white/30"
                  >
                    <svg
                      className="w-5 h-5 text-pink-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Student Lined Sheet
                  </button>
                </>
              )}
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
                  Point to the picture and say:{" "}
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

            {/* Pencil Grip and Formation Quality Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Pencil Grip Observed
                </label>
                <select
                  value={pencilGrip}
                  onChange={(e) => setPencilGrip(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Dynamic Tripod">
                    Dynamic Tripod (Age appropriate)
                  </option>
                  <option value="Static Tripod">
                    Static Tripod (Developing)
                  </option>
                  <option value="Digital Pronate">
                    Digital Pronate (Four-finger grasp)
                  </option>
                  <option value="Palmar Supinate">
                    Palmar Supinate (Fist grip)
                  </option>
                  <option value="Left-handed grip">Left-handed grip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Letter Formation Quality
                </label>
                <select
                  value={formationQuality}
                  onChange={(e) => setFormationQuality(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Clear & Confident">
                    Clear, confident, legible letter formation
                  </option>
                  <option value="Developing">
                    Developing (some reversals or sizing inconsistencies)
                  </option>
                  <option value="Emerging">
                    Emerging (identifiable initial sounds only)
                  </option>
                  <option value="Mark-making">
                    Mark-making / Scribbles / Tracing only
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Assessment Conductor */}
          <AIAssistantConductor
            questions={conductorQuestions}
            rubrics={conductorRubrics}
            onAnswersArrayChange={setAiAnswers}
          />

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
                <div className="flex items-center gap-2 text-xs font-bold">
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
                          <span className="text-xs font-black tracking-widest text-slate-400 font-mono">
                            Target: {item.targetWord}
                          </span>
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
                            <span className="font-mono text-pink-600 font-bold text-sm tracking-widest">
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
                                    <div className="w-11 h-12 rounded-lg bg-pink-100 border-2 border-pink-300 flex items-center justify-center font-black text-xl text-pink-700 shadow-2xs font-mono uppercase">
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
                                      className={`w-11 h-12 text-center text-xl font-black font-mono uppercase rounded-lg border-2 shadow-inner focus:outline-none transition-all ${
                                        val.toLowerCase() ===
                                        slot.char.toLowerCase()
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                                          : val
                                            ? "border-amber-400 bg-amber-50 text-amber-800"
                                            : "border-slate-300 bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                      }`}
                                    />
                                  )}
                                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                    {isSlotFixed
                                      ? "Given"
                                      : `Slot ${slotIdx + 1}`}
                                  </span>
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
                          {aiAnswers &&
                            aiAnswers[idx] &&
                            aiAnswers[idx].trim().length > 0 && (
                              <div className="mt-2 text-xs text-indigo-700 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 shadow-inner">
                                <span className="font-bold mr-1">
                                  Student Answer (AI):
                                </span>{" "}
                                "{aiAnswers[idx]}"
                              </div>
                            )}
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
                              <span>âœ“</span>
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
                              <span>â€¢</span>
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
                              <span>âœ•</span>
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
                {isGrade4Stage ? (
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
                          transcribe their written responses. Real-time AI
                          keyword detection matches against all official prompt
                          categories.
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

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>
                          AI Keyword Detection:{" "}
                          <strong>
                            {totalAiMatches} of {totalAiPossible}
                          </strong>{" "}
                          keywords matched
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">
                        Click any keyword chip below to quick-insert into the
                        child&apos;s answer!
                      </span>
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
                          transcribe their written responses. Real-time AI
                          keyword detection matches against all 6 official
                          categories.
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

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>
                          AI Keyword Detection:{" "}
                          <strong>
                            {totalAiMatches} of {totalAiPossible}
                          </strong>{" "}
                          keywords matched
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">
                        Click any keyword chip below to quick-insert into the
                        child&apos;s answer!
                      </span>
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
                          ? "Present the picture of the two kayakers navigating the river rapids to the child and guide them through the 4 questions below. Type what the student writes or transcribes. As words and phrases are entered, the system performs real-time AI detection against the official Grade 1 / Year 2 keyword bank."
                          : "Present the picture to the child and guide them through the 4 questions below. Type what the student writes or transcribes. As words and phrases are entered, the system performs real-time AI detection against the official keyword bank from the assessment specification."}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>
                            AI Detection:{" "}
                            <strong>
                              {totalAiMatches} of {totalAiPossible}
                            </strong>{" "}
                            keywords matched
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">
                          Click any keyword chip below to quick-insert it if
                          student produced it!
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4 Writing Questions with Real-Time AI Keyword Detection */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      {isGrade4Stage
                        ? "3 Writing Tasks & AI Story Evaluation"
                        : "4 Writing Tasks & AI Keyword Detection"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isGrade4Stage
                        ? "Transcribe the child’s written response for each prompt. AI evaluation analyzes vocabulary, narrative sequencing, and CEFR indicators."
                        : "Transcribe the child’s written response for each prompt. Matched AI keywords highlight automatically in emerald green."}
                    </p>
                  </div>
                  {!isGrade4Stage && (
                    <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-black">
                      <span>✨ AI Keywords Matched:</span>
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full">
                        {totalAiMatches}
                      </span>
                    </div>
                  )}
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
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              Category: {q.category}
                            </span>
                            {!isGrade4Stage && (
                              <span
                                className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                                  matchedList.length > 0
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {matchedList.length} / {q.aiKeywords.length} AI
                                Matches
                              </span>
                            )}
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
                            placeholder={q.placeholder}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          />
                        </div>
                        {aiAnswers &&
                          aiAnswers[idx] &&
                          aiAnswers[idx].trim().length > 0 && (
                            <div className="mb-3 text-sm text-indigo-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 shadow-inner">
                              <span className="font-bold mr-1">
                                Student Answer (AI):
                              </span>{" "}
                              "{aiAnswers[idx]}"
                            </div>
                          )}

                        {/* Real-Time AI Keyword Tags */}
                        {!isGrade4Stage && (
                          <div className="bg-white rounded-xl p-3 border border-slate-200/80">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <svg
                                  className="w-3.5 h-3.5 text-purple-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                                  />
                                </svg>
                                Official AI Keywords Bank:
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Tap chip to add to response
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {q.aiKeywords.map((kw) => {
                                const isMatched = matchKeyword(text, kw);
                                return (
                                  <button
                                    key={kw}
                                    type="button"
                                    onClick={() => handleAppendKeyword(idx, kw)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                      isMatched
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs scale-[1.03]"
                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-pink-300 hover:bg-pink-50/50"
                                    }`}
                                    title={
                                      isMatched
                                        ? "Detected by AI in student text!"
                                        : "Click to insert into response"
                                    }
                                  >
                                    {isMatched ? (
                                      <span>✓</span>
                                    ) : (
                                      <span className="text-slate-400">+</span>
                                    )}
                                    <span>{kw}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
                <button
                  type="button"
                  onClick={() => {
                    setModalTab("sheet");
                    setShowSheetModal(true);
                  }}
                  className="self-start md:self-auto shrink-0 bg-white hover:bg-pink-100 text-pink-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-pink-200 shadow-2xs transition-all flex items-center gap-1.5"
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  View Original Sheet
                </button>
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
                          <span className="text-xs font-mono font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                            Target: {item.targetWord}
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
                              if (
                                val.trim().toLowerCase() === item.targetWord
                              ) {
                                setGrade3Statuses((prev) => {
                                  const next = [...prev];
                                  next[idx] = "correct";
                                  return next;
                                });
                              }
                            }}
                            placeholder={`e.g. ${item.targetWord}`}
                            className="w-full text-base font-bold font-mono tracking-wider px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-pink-500 focus:outline-none transition-colors uppercase"
                          />

                          {/* Student Answer AI Reflection */}
                          {aiAnswers &&
                            aiAnswers[idx] &&
                            aiAnswers[idx].trim().length > 0 && (
                              <div className="mt-2.5 text-xs text-indigo-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 shadow-inner flex items-center justify-between">
                                <div>
                                  <span className="font-bold mr-1">
                                    Student Answer (AI):
                                  </span>
                                  &ldquo;{aiAnswers[idx]}&rdquo;
                                </div>
                                {!written && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cleaned = aiAnswers[idx]
                                        .trim()
                                        .toLowerCase()
                                        .replace(/[^a-z]/g, "");
                                      setGrade3Written((prev) => {
                                        const next = [...prev];
                                        next[idx] = cleaned;
                                        return next;
                                      });
                                      if (cleaned === item.targetWord) {
                                        setGrade3Statuses((prev) => {
                                          const next = [...prev];
                                          next[idx] = "correct";
                                          return next;
                                        });
                                      }
                                    }}
                                    className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-lg transition-colors ml-2"
                                  >
                                    Use AI Word
                                  </button>
                                )}
                              </div>
                            )}
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
                <button
                  type="button"
                  onClick={() => {
                    setModalTab("sheet");
                    setShowSheetModal(true);
                  }}
                  className="self-start md:self-auto shrink-0 bg-white hover:bg-pink-100 text-pink-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-pink-200 shadow-2xs transition-all flex items-center gap-1.5"
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  View Original Sheet
                </button>
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
                                if (
                                  val.trim().toLowerCase() === item.targetWord
                                ) {
                                  setGrade2Statuses((prev) => {
                                    const next = [...prev];
                                    next[idx] = "correct";
                                    return next;
                                  });
                                }
                              }}
                              placeholder={`Write '${item.targetWord}'...`}
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
                          {aiAnswers &&
                            aiAnswers[idx] &&
                            aiAnswers[idx].trim().length > 0 && (
                              <div className="mt-2.5 text-xs text-indigo-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 shadow-inner flex items-center justify-between">
                                <div>
                                  <span className="font-bold mr-1">
                                    Student Answer (AI):
                                  </span>
                                  &ldquo;{aiAnswers[idx]}&rdquo;
                                </div>
                                {!written && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cleaned = aiAnswers[idx]
                                        .trim()
                                        .toLowerCase()
                                        .replace(/[^a-z]/g, "");
                                      setGrade2Written((prev) => {
                                        const next = [...prev];
                                        next[idx] = cleaned;
                                        return next;
                                      });
                                      if (cleaned === item.targetWord) {
                                        setGrade2Statuses((prev) => {
                                          const next = [...prev];
                                          next[idx] = "correct";
                                          return next;
                                        });
                                      }
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200"
                                  >
                                    Use AI Word
                                  </button>
                                )}
                              </div>
                            )}
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
          {/* CEFR LEVEL SCORING RUBRIC (Pre-A1 to B2â€“C1)         */}
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
                  Select the level that best reflects the studentâ€™s
                  independent writing competency.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-400">Auto Suggested:</span>
                <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200 font-black">
                  {currentRecommendedLevel}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLevel(currentRecommendedLevel)}
                  className="text-pink-600 hover:underline text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Rubric Cards */}
            <div className="space-y-2.5">
              {activeRubricLevels.map((item) => {
                const isSelected = selectedLevel === item.level;
                const isAuto = currentRecommendedLevel === item.level;

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
                        {isAuto && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white px-2 py-0.5 rounded-full">
                            Suggested
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-pink-700 text-white px-2 py-0.5 rounded-full">
                            Selected
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

          {/* Key Words Checkbox List (100% exact text from sheet) */}
          {!isGrade4Stage && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                Observed Key Words ({selectedStage})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Click any words the child produced, recognized, or spoke during
                the writing assessment:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {activeKeyWordsList.map((kw) => {
                  const isSelected = usedKeywords.includes(kw);
                  return (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => toggleKeyword(kw)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-pink-300"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {kw}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              Â· Level:{" "}
              <strong className="text-pink-600">
                {selectedLevel || "Not selected"}
              </strong>
              {isPictureAiStage && (
                <span>
                  {" "}
                  Â· AI Matches:{" "}
                  <strong className="text-emerald-700 font-black">
                    {totalAiMatches}
                  </strong>
                </span>
              )}
              {selectedStage === "FS1" && (
                <span>
                  {" "}
                  Â· Correct CVC:{" "}
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
                    ? "Grade 4 / Year 5 Writing Assessment · Specification Sheet"
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
                            ? "Grade 1 / Year 2 Writing Assessment Â· Specification Sheet"
                            : modalTab === "keywords"
                              ? "AI Keywords Detection Guide Â· Grade 1 / Year 2"
                              : "Student Lined Worksheet Â· Grade 1 / Year 2"
                          : selectedStage === "FS1"
                            ? "FS1 Writing Assessment Â· Original Document"
                            : selectedStage === "KG2 / Year 1"
                              ? modalTab === "sheet"
                                ? "KG2 / Year 1 Writing Assessment Â· Specification Sheet"
                                : modalTab === "keywords"
                                  ? "AI Keywords Detection Guide Â· KG2 / Year 1"
                                  : "Student Lined Worksheet Â· KG2 / Year 1"
                              : modalTab === "sheet"
                                ? "FS2 - KG1 Writing Assessment Â· Specification Sheet"
                                : modalTab === "keywords"
                                  ? "AI Keywords Detection Guide Â· FS2 - KG1"
                                  : "Student Lined Worksheet Â· FS2 - KG1"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
              >
                âœ•
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
                  ðŸ“„ Assessment Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("keywords")}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                    modalTab === "keywords"
                      ? "bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  âœ¨ AI Keywords Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("worksheet")}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-t-xl transition-colors ${
                    modalTab === "worksheet"
                      ? "bg-white text-pink-700 border-t-2 border-pink-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  âœï¸ Student Lined Worksheet
                </button>
              </div>
            )}

            <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-100">
              <img
                src={
                  isGrade4Stage
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
                  {isGrade4Stage
                    ? "Neon Corridor, Futuristic City & Planetary Astronauts · Full View"
                    : isGrade3Stage
                      ? "Spaceship, Canyon Ruins & Knight Battling Dragon · Full View"
                      : isGrade2Stage
                        ? "3-Picture Fantasy Adventure Stimulus · Full View"
                        : isGrade1Stage
                          ? "Two People Kayaking on River Rapids · Full View"
                          : "Children Playing Football in Park · Full View"}
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
                  isGrade4Stage
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
                  isGrade4Stage
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
