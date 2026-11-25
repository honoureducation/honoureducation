import React, { useState, useEffect } from 'react';
import StudentPicker from '../components/StudentPicker';
import { studentLabel, studentYearClass } from '../utils/students';
import StageSelector, { PRIMARY_STAGES } from '../components/StageSelector';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import AIAssistantConductor from '../components/AIAssistantConductor';
import VoiceDictation from '../components/VoiceDictation';
import {
  aggregateReading,
  aggregateWordStatuses,
  judgeCvcWord,
  accuracyOutOf10,
  fluencyLabel,
  primaryPassageLevel,
  passageStatus,
  cvcLevel,
} from '../utils/readingAutoScore';

import henImg from '../assets/cvc/cvc-hen.jpg';
import dogImg from '../assets/cvc/cvc-dog.jpg';
import sitImg from '../assets/cvc/cvc-sit.jpg';
import webImg from '../assets/cvc/cvc-web.jpg';
import bugImg from '../assets/cvc/cvc-bug.jpg';
import sunImg from '../assets/cvc/cvc-sun.jpg';
import fs1ReadingSheet from '../assets/fs1-reading-sheet.jpg';
import fs2ReadingSheet from '../assets/fs2-reading-sheet.jpg';
import kg2ReadingSheet from '../assets/kg2-reading-sheet.png';
import grade1ReadingSheet from '../assets/grade1-year2-reading-sheet.jpg';
import kg2ReadingKids from '../assets/kg2-reading-kids.jpg';
import kg2ReadingCats from '../assets/kg2-reading-cats.jpg';
import kg2ReadingDog from '../assets/kg2-reading-dog.jpg';
import grade2ReadingSheet from '../assets/grade2-year3-reading-sheet.jpg';
import grade2ReadingKids from '../assets/grade2-reading-kids.png';
import grade2ReadingApples from '../assets/grade2-reading-apples.png';
import grade2ReadingWitch from '../assets/grade2-reading-witch.png';
import grade2ReadingSpoon from '../assets/grade2-reading-spoon.png';
import grade3ReadingSheet from '../assets/grade3-year4-reading-sheet.jpg';
import grade3ReadingStoryPanel from '../assets/grade3-reading-story-panel.jpg';
import grade3ReadingKids from '../assets/grade3-reading-kids.png';
import grade3ReadingBread from '../assets/grade3-reading-bread.png';
import grade3ReadingGlove from '../assets/grade3-reading-glove.png';
import grade3ReadingStone from '../assets/grade3-reading-stone.png';
import grade3ReadingMilk from '../assets/grade3-reading-milk.png';
import grade4ReadingSheet from '../assets/grade4-year5-reading-sheet.jpg';
import grade4ReadingKite from '../assets/grade4-reading-kite.png';
import grade4ReadingTape from '../assets/grade4-reading-tape.png';
import grade4ReadingWindsock from '../assets/grade4-reading-windsock.png';
import grade4ReadingHands from '../assets/grade4-reading-hands.png';
import grade4ReadingRibbon from '../assets/grade4-reading-ribbon.png';
import grade5ReadingSheet from '../assets/grade5-year6-reading-sheet.png';
import grade5ReadingMarket from '../assets/grade5-reading-market.png';
import grade5ReadingCheeseRoll from '../assets/grade5-reading-cheese-roll.png';
import grade5ReadingMapBook from '../assets/grade5-reading-map-book.png';

// ==========================================
// 6 CVC WORDS & PICTURES (FS1 & FS2 READING)
// ==========================================
const READING_ITEMS = [
  { id: 1, word: 'hen', letters: ['h', 'e', 'n'], image: henImg, label: 'Hen with chicks' },
  { id: 2, word: 'dog', letters: ['d', 'o', 'g'], image: dogImg, label: 'Dog in dugout' },
  { id: 3, word: 'sit', letters: ['s', 'i', 't'], image: sitImg, label: 'Boy sitting on chair' },
  { id: 4, word: 'web', letters: ['w', 'e', 'b'], image: webImg, label: 'Spider on cobweb' },
  { id: 5, word: 'bug', letters: ['b', 'u', 'g'], image: bugImg, label: 'Ladybug / beetle' },
  { id: 6, word: 'sun', letters: ['s', 'u', 'n'], image: sunImg, label: 'Smiling yellow sun' },
];

// ==========================================
// 5 READING PASSAGES (KG2 / YEAR 1 READING)
// ==========================================
const KG2_READING_PASSAGES = [
  {
    id: 1,
    box: 'Text 1',
    passage: 'Sit on the mat. Pat the big dog. A red cup in the bag.',
    hint: 'Short a, i, o, u · CVC decodable sentences',
    image: kg2ReadingKids,
    imageCaption: 'Sit on the mat',
    imageLabel: 'Children sitting on mat / playing in sun',
  },
  {
    id: 2,
    box: 'Text 2',
    passage: 'Ten cats on a log. A kid ran in the sun. The bug is in the mud.',
    hint: 'Short vowels · Initial and final consonant blending',
    image: kg2ReadingCats,
    imageCaption: 'Ten cats on a log',
    imageLabel: 'Cats on a log in the sunlit woods',
  },
  {
    id: 3,
    box: 'Text 3',
    passage: 'Get the pen and pad. A dog digs in the pit. The cat sat on the bed.',
    hint: 'Decodable phrasing · Basic sentence punctuation',
    image: kg2ReadingDog,
    imageCaption: 'A dog digs in the pit',
    imageLabel: 'Dog sitting in a dug-out dirt pit',
  },
  {
    id: 4,
    box: 'Text 4',
    passage: 'A hot pan of jam. Mum has a red hat. Sam is in the van.',
    hint: 'CVC words · Common sight words (has, the, of, is)',
  },
  {
    id: 5,
    box: 'Text 5',
    passage: 'Pick up the sock. Six frogs jump in. That pet can win.',
    hint: 'Digraph -ck · CCVC/CVCC blending (frogs, jump)',
  },
];

// 3 OFFICIAL STIMULUS PICTURES (FROM KG2 / YEAR 1 WORKSHEET)
const KG2_STIMULUS_PICTURES = [
  {
    id: 1,
    title: 'Picture 1: Children Sitting Together',
    passageRef: 'Text 1 & 2',
    caption: 'Sit on the mat · A kid ran in the sun',
    image: kg2ReadingKids,
    desc: 'Visual comprehension prompt for "Sit on the mat" and "A kid ran in the sun".',
  },
  {
    id: 2,
    title: 'Picture 2: Cats on a Fallen Log',
    passageRef: 'Text 2',
    caption: 'Ten cats on a log',
    image: kg2ReadingCats,
    desc: 'Visual comprehension prompt for "Ten cats on a log. A kid ran in the sun."',
  },
  {
    id: 3,
    title: 'Picture 3: Dog in a Dug Pit',
    passageRef: 'Text 3',
    caption: 'A dog digs in the pit',
    image: kg2ReadingDog,
    desc: 'Visual comprehension prompt for "Get the pen and pad. A dog digs in the pit."',
  },
];

// ==========================================
// 4 READING PASSAGES / LINES (GRADE 2 / YEAR 3 READING)
// Exact from uploaded sheet (Lina & Sami Story)
// ==========================================
const GRADE2_READING_PASSAGES = [
  {
    id: 1,
    box: 'Line 1',
    passage: 'Lina carried a basket of apples to the table. She washed them, sliced them, and sprinkled sugar on top. The old woman tied on her shawl and took the apples to the little shed, pushing it through the small wooden door.',
    hint: 'Narrative opening · Past tense verbs (carried, washed, sliced, sprinkled, tied, took, pushing)',
    image: grade2ReadingKids,
    imageCaption: 'Lina and Sami',
    imageLabel: 'Lina and Sami preparing the basket of apples',
    keywords: ['Lina', 'basket', 'apples', 'table', 'washed', 'sliced', 'sprinkled', 'sugar', 'shawl', 'shed', 'door'],
  },
  {
    id: 2,
    box: 'Line 2',
    passage: 'But Sami tricked the old woman. When she asked him to show his hand, to check if he was strong enough, he held out a wooden spoon. The old woman felt the spoon.',
    hint: 'Dialogue setup · Character cunning · Phonics (tricked, asked, check, strong, wooden spoon)',
    image: grade2ReadingApples,
    imageCaption: 'Apples garland',
    imageLabel: 'Apples and the clever trick with the wooden spoon',
    keywords: ['Sami', 'tricked', 'old woman', 'hand', 'strong', 'wooden spoon', 'felt'],
  },
  {
    id: 3,
    box: 'Line 3',
    passage: '“Too weak, too weak!” she cried. “But I will still take you away!” She pulled Sami towards the dark shed. She pointed at Lina, who was stirring the pot of soup.',
    hint: 'Expressive speech marks · Tension building · Digraphs and vowel combinations',
    image: grade2ReadingWitch,
    imageCaption: 'The old woman',
    imageLabel: 'The old woman with shawl pulling Sami towards shed',
    keywords: ['Too weak', 'take you away', 'pulled', 'dark shed', 'stirring', 'pot of soup'],
  },
  {
    id: 4,
    box: 'Line 4',
    passage: '“You too! You will come with me!” she shouted. The pot bubbled and steamed as Lina looked at her brother.',
    hint: 'Climax / dramatic dialogue · Exclamation and descriptive verbs (bubbled, steamed)',
    image: grade2ReadingSpoon,
    imageCaption: 'Wooden spoon & soup',
    imageLabel: 'Wooden spoon and bubbling pot of soup',
    keywords: ['come with me', 'shouted', 'bubbled', 'steamed', 'brother'],
  },
];

const GRADE2_STIMULUS_PICTURES = [
  {
    id: 1,
    title: 'Illustration 1: Lina & Sami',
    passageRef: 'Line 1',
    caption: 'Lina & Sami preparing apples',
    image: grade2ReadingKids,
    desc: 'Lina washed them, sliced them, and sprinkled sugar on top.',
  },
  {
    id: 2,
    title: 'Illustration 2: Apples Garland',
    passageRef: 'Line 2',
    caption: 'Apples & wooden spoon trick',
    image: grade2ReadingApples,
    desc: 'Sami tricked the old woman with a wooden spoon.',
  },
  {
    id: 3,
    title: 'Illustration 3: Old Woman with Shawl',
    passageRef: 'Line 3',
    caption: 'Old woman pulling Sami to shed',
    image: grade2ReadingWitch,
    desc: 'Too weak, too weak! She pulled Sami towards the dark shed.',
  },
  {
    id: 4,
    title: 'Illustration 4: Wooden Spoon & Soup Pot',
    passageRef: 'Line 4',
    caption: 'Steaming soup pot & spoon',
    image: grade2ReadingSpoon,
    desc: 'The pot bubbled and steamed as Lina looked at her brother.',
  },
];

const GRADE2_READING_RUBRIC = [
  {
    level: 'A1.0–A1.2',
    description: 'Majority mistakes. Missing initial sound recognition. Cannot blend Phase 2 CVC words securely.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Makes over 5 mistakes per line. Misses digraphs and Phase 2 sounds.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Makes 3–4 mistakes per line. Mis-sounds Phase 1/2 graphemes. Insecure blending.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Makes 1–2 mistakes per line. Recognises Phase 1, 2 and some Phase 3 sounds. Developing fluency.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'Makes no mistakes. Reads fluently and confidently with secure blending.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

// ==========================================
// 5 READING PASSAGES / LINES (GRADE 3 / YEAR 4 READING)
// Exact from uploaded sheet (Mina & Rafi Bakery Story)
// ==========================================
const GRADE3_READING_PASSAGES = [
  {
    id: 1,
    box: 'Line 1',
    passage: 'Mina stacked the loaves of bread on the wooden shelf. She brushed off the flour, cut the ends neatly, and wrapped them in paper.',
    hint: 'Narrative opening · Past tense regular and irregular verbs (stacked, brushed, cut, wrapped)',
    image: grade3ReadingBread,
    imageCaption: 'Loaf of Bread',
    imageLabel: 'Loaf of bread freshly baked and wrapped',
    keywords: ['Mina', 'stacked', 'loaves', 'bread', 'wooden shelf', 'brushed', 'flour', 'cut', 'neatly', 'wrapped', 'paper'],
  },
  {
    id: 2,
    box: 'Line 2',
    passage: 'The shop bell tinkled as a cold wind rushed inside. The tall man in the black coat stepped forward. He spoke softly, asking Mina to fetch the heaviest loaf. But when he reached out his hand, he held a stone hidden beneath his glove.',
    hint: 'Atmosphere · Phonics & dialogue cues (tinkled, cold wind, black coat, softly, heaviest, stone hidden beneath glove)',
    image: grade3ReadingGlove,
    imageCaption: 'Man’s Glove',
    imageLabel: 'The tall man in the black coat with a hidden stone beneath his glove',
    keywords: ['shop bell', 'tinkled', 'cold wind', 'tall man', 'black coat', 'softly', 'heaviest loaf', 'stone', 'hidden', 'glove'],
  },
  {
    id: 3,
    box: 'Line 3',
    passage: 'The baker’s wife frowned and tapped the stone. “Too hard, too hard!” she whispered. “But I will still take you with me!”',
    hint: 'Direct speech & conflict · Phonics (frowned, tapped, whispered, too hard, take you with me)',
    image: grade3ReadingStone,
    imageCaption: 'Stone',
    imageLabel: 'The stone tapped by the baker’s wife',
    keywords: ['baker’s wife', 'frowned', 'tapped', 'stone', 'too hard', 'whispered', 'take you with me'],
  },
  {
    id: 4,
    box: 'Line 4',
    passage: 'She pulled Mina by the wrist towards the back door. She pointed at Rafi, who was carrying a tray of milk. “You too! You will come with me!” she demanded.',
    hint: 'Action & urgency · Phonics & exclamations (pulled, wrist, back door, pointed, tray of milk, demanded)',
    image: grade3ReadingKids,
    imageCaption: 'Mina & Rafi',
    imageLabel: 'Mina and Rafi at the bakery',
    keywords: ['pulled', 'wrist', 'back door', 'pointed', 'Rafi', 'tray of milk', 'demanded'],
  },
  {
    id: 5,
    box: 'Line 5',
    passage: 'The milk sloshed in the cups as Rafi glanced at his sister, his eyes wide with fear.',
    hint: 'Emotional reaction · Descriptive verbs and imagery (sloshed, glanced, eyes wide with fear)',
    image: grade3ReadingMilk,
    imageCaption: 'Sloshed Milk',
    imageLabel: 'The milk sloshed in the cups as Rafi glanced at his sister',
    keywords: ['milk', 'sloshed', 'cups', 'glanced', 'sister', 'eyes wide', 'fear'],
  },
];

const GRADE3_STIMULUS_PICTURES = [
  {
    id: 1,
    title: 'Illustration 1: Mina & Rafi at Bakery',
    passageRef: 'Line 1 & Line 4',
    caption: 'Mina & Rafi at the bakery',
    image: grade3ReadingKids,
    desc: 'Mina stacked loaves of bread and Rafi carried a tray of milk.',
  },
  {
    id: 2,
    title: 'Illustration 2: Fresh Loaves of Bread',
    passageRef: 'Line 1',
    caption: 'Loaves on the wooden shelf',
    image: grade3ReadingBread,
    desc: 'Mina stacked the loaves of bread on the wooden shelf.',
  },
  {
    id: 3,
    title: 'Illustration 3: Tall Man’s Glove',
    passageRef: 'Line 2',
    caption: 'Glove with hidden stone',
    image: grade3ReadingGlove,
    desc: 'When he reached out his hand, he held a stone hidden beneath his glove.',
  },
  {
    id: 4,
    title: 'Illustration 4: Hidden Stone',
    passageRef: 'Line 2 & Line 3',
    caption: 'The hard stone',
    image: grade3ReadingStone,
    desc: '“Too hard, too hard!” the baker’s wife whispered.',
  },
  {
    id: 5,
    title: 'Illustration 5: Milk Sloshing in Cups',
    passageRef: 'Line 5',
    caption: 'Milk sloshing in cups',
    image: grade3ReadingMilk,
    desc: 'The milk sloshed in the cups as Rafi glanced at his sister, eyes wide with fear.',
  },
  {
    id: 6,
    title: 'Illustration 6: Full Story Sheet Panel',
    passageRef: 'Full Story',
    caption: 'Bakery story and illustrations',
    image: grade3ReadingStoryPanel,
    desc: 'Full story panel showing the bakery text alongside all story characters and props.',
    hideInStory: true,
  },
];

const GRADE3_READING_RUBRIC = [
  {
    level: 'A1.0–A1.2',
    description: 'Majority mistakes; cannot blend Phase 2 CVC words; missing initial sounds.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Over 5 mistakes per line; misses digraphs; insecure Phase 2 sounds.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: '3–4 mistakes per line; mis-sounds Phase 1/2 graphemes; insecure blending.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: '1–2 mistakes per line; recognises Phase 1, 2 and some Phase 3 sounds; developing fluency.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'No mistakes; fluent, confident reading with secure blending.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

// ==========================================
// 4 PARAGRAPHS FROM GRADE 4 / YEAR 5 READING ASSESSMENT
// Exact from uploaded sheet: "The Blue Kite — Wind Day"
// ==========================================
const GRADE4_READING_PASSAGES = [
  {
    id: 1,
    box: 'Paragraph 1',
    passage:
      'On a windy Saturday, Sami and his sister Hana took their blue kite to the park. They also packed tape, a spare ribbon tail, and a small compass from the nature kit at school. The windsock by the football pitch pointed east, so they chose the open hill with no trees or wires. Sami checked the reel and knots. Hana walked the line out in steady steps.',
    hint: 'Setting & Preparation · 10–15s/line · Key phonics: compass, windsock, knots, steady',
    image: null,
    imageCaption: 'Preparation on the Hill',
    imageLabel: 'Sami and Hana preparing the blue kite with tape and compass',
    keywords: [
      'windy', 'Saturday', 'Sami', 'Hana', 'blue kite', 'park', 'packed', 'tape',
      'ribbon tail', 'compass', 'nature kit', 'windsock', 'football pitch', 'pointed east',
      'open hill', 'no trees', 'wires', 'checked', 'reel', 'knots', 'steady steps',
    ],
  },
  {
    id: 2,
    box: 'Paragraph 2',
    passage:
      'The first launch worked well. A sharp gust lifted the kite and the string began to hum. Then a dog ran past and the line snagged on a bench. Sami gave slack to stop the pull. Hana kept the tail clear and they eased the string free, then used a strip of tape to fix a tiny tear.',
    hint: 'First Flight & Snag · 10–15s/line · Verbs: lifted, hum, snagged, slack, eased, tear',
    image: null,
    imageCaption: 'The Kite Snags on a Bench',
    imageLabel: 'The kite line snagging on a bench and fixing a tiny tear',
    keywords: [
      'first launch', 'sharp gust', 'lifted', 'string', 'hum', 'dog ran past',
      'line', 'snagged', 'bench', 'slack', 'stop the pull', 'tail clear', 'eased',
      'free', 'strip of tape', 'tiny tear',
    ],
  },
  {
    id: 3,
    box: 'Paragraph 3',
    passage:
      'Mrs Jones, their neighbour, was flying a red kite nearby. She showed them a simple trick with her hands. Face the wind, keep the line at about forty-five degrees, and make small steps rather than big pulls. Sami tried it. The kite moved in a smooth arc, dipping and rising like a slow bird.',
    hint: 'Neighbour Advice · 10–15s/line · Phonics & phrasing: forty-five degrees, smooth arc, dipping and rising',
    image: null,
    imageCaption: 'Mrs Jones & Red Kite',
    imageLabel: 'Mrs Jones demonstrating forty-five degree angle flying',
    keywords: [
      'Mrs Jones', 'neighbour', 'flying', 'red kite', 'simple trick', 'hands',
      'face the wind', 'forty-five degrees', 'small steps', 'big pulls', 'smooth arc',
      'dipping', 'rising', 'slow bird',
    ],
  },
  {
    id: 4,
    box: 'Paragraph 4',
    passage:
      'A younger boy was watching with wide eyes. Hana invited him to hold the reel for ten seconds while she counted aloud. The kite stayed high, the tail flicked, and the crowd by the path gave a quick clap. When the clouds began to thicken, they wound the string in and decided to go home. On the walk home they planned a new tail with star shapes, ready for the next wind day.',
    hint: 'Sharing & Resolution · 10–15s/line · Check younger, invited, counted, flicked, thicken, star shapes',
    image: null,
    imageCaption: 'Younger Boy & Crowd Clapping',
    imageLabel: 'The younger boy holding the reel and crowd clapping',
    keywords: [
      'younger boy', 'watching', 'wide eyes', 'invited', 'hold the reel', 'ten seconds',
      'counted aloud', 'kite stayed high', 'tail flicked', 'crowd by the path',
      'quick clap', 'clouds', 'thicken', 'wound the string', 'decided to go home',
      'walk home', 'planned', 'star shapes', 'wind day',
    ],
  },
];

// Pictures shown beside the story on the Grade 4 / Year 5 sheet
const GRADE4_STIMULUS_PICTURES = [
  { id: 1, title: 'Picture 1: The Blue Kite', passageRef: 'Paragraph 1', caption: 'Blue kite', image: grade4ReadingKite, desc: 'Sami and Hana took their blue kite to the park.', fit: 'contain' },
  { id: 2, title: 'Picture 2: Tape', passageRef: 'Paragraph 1 & 2', caption: 'Tape', image: grade4ReadingTape, desc: 'They packed tape and used a strip of tape to fix a tiny tear.', fit: 'contain' },
  { id: 3, title: 'Picture 3: Windsock', passageRef: 'Paragraph 1', caption: 'Windsock', image: grade4ReadingWindsock, desc: 'The windsock by the football pitch pointed east.', fit: 'contain' },
  { id: 4, title: 'Picture 4: Hands', passageRef: 'Paragraph 3 & 4', caption: 'Hands', image: grade4ReadingHands, desc: 'Mrs Jones showed them a simple trick with her hands; the crowd gave a quick clap.', fit: 'contain' },
  { id: 5, title: 'Picture 5: Ribbon Tail', passageRef: 'Paragraph 1 & 4', caption: 'Ribbon tail', image: grade4ReadingRibbon, desc: 'A spare ribbon tail — and a new tail with star shapes.', fit: 'contain' },
];

// ==========================================
// CEFR RUBRIC TABLE FOR GRADE 4 / YEAR 5 READING
// Exact from uploaded Grade 4 / Year 5 sheet
// ==========================================
const GRADE4_READING_RUBRIC = [
  {
    level: 'A1.0–A1.2',
    description: 'Very limited decoding and blending; frequent pauses; more than 15 errors per 100 words.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Choppy phrasing; 11–15 errors per 100 words; struggles with longer words and consistent blending.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Occasional mistakes on longer words; 6–10 errors per 100 words; developing fluency and accuracy.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Reads in phrases with steady pace; 1–5 errors per 100 words; confident decoding of familiar and some unfamiliar words.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'Accurate, fluent, expressive reading; handles unfamiliar words; 0–1 errors per 100 words.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

// ==========================================
// 4 PARAGRAPHS FROM GRADE 5 / YEAR 6 READING ASSESSMENT
// Exact from uploaded sheet: "The Moonlight Market"
// ==========================================
const GRADE5_READING_PASSAGES = [
  {
    id: 1,
    box: 'Paragraph 1',
    passage:
      'Asha and Rafi walked to the village green just before dusk. Stalls lined the path like bright little huts, each with a sign and a small lamp. A brass bell rang and a drum thumped a slow beat. Children played tag, parents sipped tea, and the air smelt of warm bread and sweet jam buns.',
    hint: 'Setting the Scene · 20–30s/line · Key phonics: dusk, stalls, brass, thumped, smelt',
    image: null,
    keywords: [
      'Asha', 'Rafi', 'walked', 'village green', 'dusk', 'stalls', 'lined the path',
      'bright little huts', 'sign', 'small lamp', 'brass bell', 'rang', 'drum', 'thumped',
      'slow beat', 'children', 'played tag', 'parents', 'sipped tea', 'smelt',
      'warm bread', 'sweet jam buns',
    ],
  },
  {
    id: 2,
    box: 'Paragraph 2',
    passage:
      'At the first stall a quiet chef stirred a fresh fish stew. Steam rose in soft swirls, and the splash from the ladle made Asha grin. Next came shells and chalk charms on a cloth. A friendly man let Rafi press a stamp into a thin strip of tin, and the sharp click echoed along the path of stalls.',
    hint: 'Stalls & Senses · 20–30s/line · Digraphs: chef, fresh, fish, shells, chalk, charms, thin',
    image: null,
    keywords: [
      'first stall', 'quiet chef', 'stirred', 'fresh fish stew', 'steam rose', 'soft swirls',
      'splash', 'ladle', 'grin', 'shells', 'chalk charms', 'cloth', 'friendly man',
      'press a stamp', 'thin strip', 'tin', 'sharp click', 'echoed', 'path of stalls',
    ],
  },
  {
    id: 3,
    box: 'Paragraph 3',
    passage:
      'Night slipped in, and strings of lights shone above the green. Asha tried a reading challenge at the library tent, tracing each line with care. She checked tricky digraphs and long vowel teams on a small chart, then read a short tale aloud. Rafi joined a word hunt, matching clues to signs on shops around the square.',
    hint: 'Reading Challenge · 20–30s/line · Long vowel teams: night, lights, shone, tracing, tale, clues',
    image: null,
    keywords: [
      'night slipped in', 'strings of lights', 'shone', 'green', 'reading challenge',
      'library tent', 'tracing', 'each line', 'care', 'checked', 'tricky digraphs',
      'long vowel teams', 'small chart', 'short tale', 'aloud', 'word hunt', 'matching',
      'clues', 'signs', 'shops', 'square',
    ],
  },
  {
    id: 4,
    box: 'Paragraph 4',
    passage:
      'When the moon crept high, the wind grew cool and the music slowed. Asha shared a roll with rich cheese, and Rafi spent his last coin on a book about maps. They crossed the stone bridge, listening to the hush of the stream. The market lights winked behind them, and both felt a steady glow of pride, knowing they had learned, tried, and made brave choices all evening.',
    hint: 'Resolution · 20–30s/line · Check crept, shared, crossed, listening, steady glow, choices',
    image: null,
    keywords: [
      'moon crept high', 'wind grew cool', 'music slowed', 'shared', 'roll', 'rich cheese',
      'last coin', 'book about maps', 'crossed', 'stone bridge', 'listening', 'hush',
      'stream', 'market lights', 'winked', 'steady glow', 'pride', 'learned', 'tried',
      'brave choices', 'evening',
    ],
  },
];

const GRADE5_STIMULUS_PICTURES = [
  {
    id: 1,
    title: 'Picture 1: The Moonlight Market',
    passageRef: 'Paragraph 1 & 2',
    caption: 'Stalls lining the path',
    image: grade5ReadingMarket,
    desc: 'Stalls lined the path like bright little huts, each with a sign and a small lamp.',
  },
  {
    id: 2,
    title: 'Picture 2: A Roll with Rich Cheese',
    passageRef: 'Paragraph 4',
    caption: 'A roll with rich cheese',
    image: grade5ReadingCheeseRoll,
    desc: 'Asha shared a roll with rich cheese.',
  },
  {
    id: 3,
    title: 'Picture 3: A Book about Maps',
    passageRef: 'Paragraph 4',
    caption: 'A book about maps',
    image: grade5ReadingMapBook,
    desc: 'Rafi spent his last coin on a book about maps.',
  },
];

// ==========================================
// CEFR RUBRIC TABLE FOR GRADE 5 / YEAR 6 READING
// Exact from uploaded Grade 5 / Year 6 sheet
// ==========================================
const GRADE5_READING_RUBRIC = [
  {
    level: 'A1.0–A1.2',
    description: 'Very limited decoding and blending; frequent pauses; more than 15 errors per 100 words.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Many errors; often misreads common digraphs; choppy phrasing; 11–15 errors per 100 words.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Some errors; blends most words; occasional mistakes on longer words; 6–10 errors per 100 words.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Few errors; reads in phrases with steady pace; self-corrects; 1–5 errors per 100 words.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'Accurate, fluent, expressive reading; handles unfamiliar words; 0–1 errors per 100 words.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

// ==========================================
// CEFR RUBRIC TABLE FOR FS1 & FS2 READING
// ==========================================
const READING_RUBRIC_LEVELS = [
  {
    level: 'Pre-A1',
    description: 'Recognises some sounds with support but cannot blend them into words. Relies on pictures or adult prompting. May repeat single sounds but does not read CVC words independently.',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    activeBg: 'bg-rose-50 border-rose-400 text-rose-900',
  },
  {
    level: 'A1.0–A1.2',
    description: 'Majority mistakes. Missing initial sound recognition. Cannot blend Phase 2 CVC words securely.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Makes over 5 mistakes per line. Misses digraphs ("special friends") and Phase 2 sounds.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Makes 3–4 mistakes per line. Mis-sounds Phase 1/2 graphemes. Insecure blending.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Makes 1–2 mistakes per line. Recognises Phase 1, 2, and some Phase 3 sounds. Developing fluency.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'Makes no mistakes. Reads fluently and confidently with secure blending.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

// ==========================================
// CEFR RUBRIC TABLE FOR KG2 / YEAR 1 READING
// ==========================================
const KG2_READING_RUBRIC = [
  {
    level: 'A1.0–A1.2',
    description: 'Majority mistakes. Missing initial sound recognition. Cannot blend Phase 2 CVC words securely.',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  {
    level: 'A2.0–A2.2',
    description: 'Makes over 5 mistakes per line. Misses digraphs and Phase 2 sounds.',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  {
    level: 'A2.3–B1.1',
    description: 'Makes 3–4 mistakes per line. Mis-sounds Phase 1/2 graphemes. Insecure blending.',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
  {
    level: 'B1.2–B1.3',
    description: 'Makes 1–2 mistakes per line. Recognises Phase 1, 2 and some Phase 3 sounds. Developing fluency.',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    activeBg: 'bg-indigo-50 border-indigo-400 text-indigo-900',
  },
  {
    level: 'B2–C1',
    description: 'Makes no mistakes. Reads fluently and confidently with secure blending.',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  },
];

export default function PrimaryReadingAssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  const isGrade5Initial =
    location.pathname.includes('grade5') ||
    location.pathname.includes('year6') ||
    searchParams.get('grade') === 'grade5' ||
    searchParams.get('grade') === 'year6' ||
    searchParams.get('stage') === 'grade5' ||
    searchParams.get('stage') === 'year6';

  const isGrade4Initial =
    !isGrade5Initial &&
    (location.pathname.includes('grade4') ||
    location.pathname.includes('year5') ||
    searchParams.get('grade') === 'grade4' ||
    searchParams.get('grade') === 'year5' ||
    searchParams.get('stage') === 'grade4' ||
    searchParams.get('stage') === 'year5');

  const isGrade3Initial =
    !isGrade4Initial &&
    (location.pathname.includes('grade3') ||
      location.pathname.includes('year4') ||
      searchParams.get('grade') === 'grade3' ||
      searchParams.get('grade') === 'year4' ||
      searchParams.get('stage') === 'grade3' ||
      searchParams.get('stage') === 'year4');

  const isGrade2Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    (location.pathname.includes('grade2') ||
      location.pathname.includes('year3') ||
      searchParams.get('grade') === 'grade2' ||
      searchParams.get('grade') === 'year3' ||
      searchParams.get('stage') === 'grade2' ||
      searchParams.get('stage') === 'year3');

  const isGrade1Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    !isGrade2Initial &&
    (location.pathname.includes('grade1') ||
      location.pathname.includes('year2') ||
      searchParams.get('grade') === 'grade1' ||
      searchParams.get('grade') === 'year2' ||
      searchParams.get('stage') === 'grade1' ||
      searchParams.get('stage') === 'year2');

  const isKG2Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    !isGrade2Initial &&
    !isGrade1Initial &&
    (location.pathname.includes('kg2') ||
      location.pathname.includes('year1') ||
      searchParams.get('grade') === 'kg2' ||
      searchParams.get('grade') === 'year1' ||
      searchParams.get('stage') === 'kg2' ||
      searchParams.get('stage') === 'year1');

  const isFS2Initial =
    !isGrade4Initial &&
    !isGrade3Initial &&
    !isGrade2Initial &&
    !isGrade1Initial &&
    !isKG2Initial &&
    (location.pathname.includes('fs2') ||
      searchParams.get('grade') === 'fs2' ||
      searchParams.get('stage') === 'fs2');

  const initialStage = isGrade5Initial
    ? 'Grade 5 / Year 6'
    : isGrade4Initial
    ? 'Grade 4 / Year 5'
    : isGrade3Initial
    ? 'Grade 3 / Year 4'
    : isGrade2Initial
    ? 'Grade 2 / Year 3'
    : isGrade1Initial
    ? 'Grade 1 / Year 2'
    : isKG2Initial
    ? 'KG2 / Year 1'
    : isFS2Initial
    ? 'FS2 - KG1'
    : 'FS1';

  const [selectedStage, setSelectedStage] = useState(initialStage);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const isGrade5Stage =
    selectedStage === 'Grade 5 / Year 6' ||
    selectedStage.includes('Grade 5') ||
    selectedStage.includes('Year 6');

  const isGrade4Stage =
    !isGrade5Stage &&
    (selectedStage === 'Grade 4 / Year 5' ||
      selectedStage.includes('Grade 4') ||
      selectedStage.includes('Year 5'));

  const isGrade3Stage =
    !isGrade4Stage &&
    (selectedStage === 'Grade 3 / Year 4' ||
      selectedStage.includes('Grade 3') ||
      selectedStage.includes('Year 4'));

  const isGrade2Stage =
    !isGrade4Stage &&
    !isGrade3Stage &&
    (selectedStage === 'Grade 2 / Year 3' ||
      selectedStage.includes('Grade 2') ||
      selectedStage.includes('Year 3'));

  const isGrade1Stage =
    !isGrade4Stage &&
    !isGrade3Stage &&
    (selectedStage === 'Grade 1 / Year 2' ||
      selectedStage.includes('Grade 1') ||
      selectedStage.includes('Year 2'));

  const isPassageStage =
    selectedStage === 'KG2 / Year 1' ||
    isGrade1Stage ||
    isGrade2Stage ||
    isGrade3Stage ||
    isGrade4Stage ||
    isGrade5Stage;

  const activePassages = isGrade5Stage
    ? GRADE5_READING_PASSAGES
    : isGrade4Stage
    ? GRADE4_READING_PASSAGES
    : isGrade3Stage
    ? GRADE3_READING_PASSAGES
    : isGrade2Stage
    ? GRADE2_READING_PASSAGES
    : KG2_READING_PASSAGES;

  const activeStimulusPictures = isGrade5Stage
    ? GRADE5_STIMULUS_PICTURES
    : isGrade4Stage
    ? GRADE4_STIMULUS_PICTURES
    : isGrade3Stage
    ? GRADE3_STIMULUS_PICTURES
    : isGrade2Stage
    ? GRADE2_STIMULUS_PICTURES
    : KG2_STIMULUS_PICTURES;

  useEffect(() => {
    localStorage.setItem('assessmentSchoolTier', 'primary');
  }, []);

  // Form Details
  const [formData, setFormData] = useState({
    email: '',
    studentName: '',
    yearGroupAndClass: initialStage,
    teacherName: '',
    term: preSelectedTerm,
  });

  const handleStageSwitch = (newStage) => {
    setSelectedStage(newStage);
    setFormData((prev) => ({
      ...prev,
      yearGroupAndClass:
        prev.yearGroupAndClass === 'FS1' ||
        prev.yearGroupAndClass === 'FS2 - KG1' ||
        prev.yearGroupAndClass === 'KG2 / Year 1' ||
        prev.yearGroupAndClass === 'Grade 1 / Year 2' ||
        prev.yearGroupAndClass === 'Grade 2 / Year 3' ||
        prev.yearGroupAndClass === 'Grade 3 / Year 4' ||
        prev.yearGroupAndClass === 'Grade 4 / Year 5' ||
        prev.yearGroupAndClass === 'Grade 5 / Year 6'
          ? newStage
          : prev.yearGroupAndClass,
    }));
  };

  // Observations per CVC word (FS1 & FS2)
  // Teacher overrides — null means "use the AI score"
  const [manualItemStatuses, setItemStatuses] = useState(Array(READING_ITEMS.length).fill(null));
  const [itemNotes, setItemNotes] = useState(Array(READING_ITEMS.length).fill(''));
  const [manualLevel, setSelectedLevel] = useState(null);
  const [usedKeywords] = useState([]);
  const [teachingFocusNotes, setTeachingFocusNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Passages State (KG2 / Year 1, Grade 1 / Year 2, Grade 2 / Year 3, Grade 3 / Year 4, Grade 4 / Year 5)
  const [manualPassageStatuses, setPassageStatuses] = useState(Array(8).fill(null));
  const [passageNotes, setPassageNotes] = useState(Array(8).fill(''));
  const [manualAccuracy, setKg2Accuracy] = useState(null);
  const [manualFluency, setKg2Fluency] = useState(null);
  const [kg2Comments, setKg2Comments] = useState('');
  const [, setAiAnswers] = useState([]);
  const [readingResults, setReadingResults] = useState([]);
  // FS1 / FS2: what the pupil said for each picture word (one mic per card)
  const [cvcHeard, setCvcHeard] = useState(Array(READING_ITEMS.length).fill(''));
  const setHeardFor = (idx, text) =>
    setCvcHeard((prev) => {
      const next = [...prev];
      next[idx] = text;
      return next;
    });

  // Auto-score from what the AI heard; the teacher only needs to submit.
  // FS1 / FS2 words: ✓ Fluent / ~ Support / ✗ Error from each answer
  const aiWordStatuses = READING_ITEMS.map((item, i) => judgeCvcWord(item.word, cvcHeard[i]));
  const itemStatuses = manualItemStatuses.map((s, i) => s || aiWordStatuses[i]);
  const readingAgg = isPassageStage
    ? aggregateReading(readingResults)
    : aggregateWordStatuses(itemStatuses);
  const autoLevel = isPassageStage ? primaryPassageLevel(readingAgg) : cvcLevel(readingAgg);
  const selectedLevel = manualLevel || autoLevel;
  const isAutoLevel = !manualLevel && !!autoLevel;
  const passageStatuses = manualPassageStatuses.map(
    (s, i) => s || (isPassageStage && readingAgg.perItem[i] ? passageStatus(readingAgg.perItem[i]) : null),
  );
  const kg2Accuracy = manualAccuracy ?? accuracyOutOf10(readingAgg) ?? '';
  const kg2Fluency = manualFluency || fluencyLabel(readingAgg) || 'Smooth';

  // A different stage is a fresh assessment — drop the previous overrides
  useEffect(() => {
    setItemStatuses(Array(READING_ITEMS.length).fill(null));
    setCvcHeard(Array(READING_ITEMS.length).fill(''));
    setPassageStatuses(Array(8).fill(null));
    setSelectedLevel(null);
    setKg2Accuracy(null);
    setKg2Fluency(null);
  }, [selectedStage]);

  // Reading conductor items: the AI only instructs the pupil to read — it never
  // reads the text (or the target word) aloud itself.
  // (FS1 / FS2 picture words are answered one by one on each card instead.)
  const conductorReadingItems = activePassages.map((p) => ({ label: p.box, text: p.passage }));

  // How the reading passage is laid out — mirrors each official sheet
  const passageLayout =
    isGrade2Stage || isGrade3Stage || isGrade4Stage ? 'side' : isGrade5Stage ? 'below' : 'table';
  const storyTitle = isGrade5Stage
    ? 'The Moonlight Market'
    : isGrade4Stage
    ? 'The Blue Kite — Wind Day'
    : null;
  const storyPictures = activeStimulusPictures.filter((p) => !p.hideInStory);

  const renderAiCheck = (idx) =>
    readingResults[idx]?.analysis?.hasReading ? (
      <div className="mt-2 text-xs text-indigo-700 bg-indigo-50/70 px-3 py-2 rounded-lg border border-indigo-100">
        <span className="font-bold mr-1">AI Reading Check:</span>
        {readingResults[idx].summary}
      </div>
    ) : null;

  const renderStoryPicture = (pic, sizeClass) => (
    <button
      type="button"
      key={pic.id}
      onClick={() => setPreviewImage(pic)}
      title={pic.title || pic.caption}
      className={`group relative rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all shrink-0 ${sizeClass}`}
    >
      <img
        src={pic.image}
        alt={pic.caption}
        className={`w-full h-full group-hover:scale-105 transition-transform ${
          pic.fit === 'contain' ? 'object-contain p-1.5' : 'object-cover'
        }`}
      />
    </button>
  );

  const activeRubric = isGrade5Stage
    ? GRADE5_READING_RUBRIC
    : isGrade4Stage
    ? GRADE4_READING_RUBRIC
    : isGrade3Stage
    ? GRADE3_READING_RUBRIC
    : isGrade2Stage
    ? GRADE2_READING_RUBRIC
    : isPassageStage
    ? KG2_READING_RUBRIC
    : READING_RUBRIC_LEVELS;

  const activeSheet =
    isGrade5Stage
      ? grade5ReadingSheet
      : isGrade4Stage
      ? grade4ReadingSheet
      : isGrade3Stage
      ? grade3ReadingSheet
      : isGrade2Stage
      ? grade2ReadingSheet
      : isGrade1Stage
      ? grade1ReadingSheet
      : selectedStage === 'KG2 / Year 1'
      ? kg2ReadingSheet
      : selectedStage === 'FS2 - KG1'
      ? fs2ReadingSheet
      : fs1ReadingSheet;

  useEffect(() => {
    if (preSelectedTerm) {
      setFormData(prev => ({ ...prev, term: preSelectedTerm }));
    }
    const savedTeacher =
      localStorage.getItem('teacherName') ||
      localStorage.getItem('userName') ||
      '';
    const savedEmail =
      localStorage.getItem('userEmail') ||
      localStorage.getItem('teacherEmail') ||
      '';
    if (savedTeacher || savedEmail) {
      setFormData(prev => ({
        ...prev,
        teacherName: prev.teacherName || savedTeacher,
        email: prev.email || savedEmail,
      }));
    }
  }, [preSelectedTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Teacher override for one word only — the other words keep their AI marks
  const handleStatusChange = (index, status) => {
    setItemStatuses((prev) => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  };

  const handleItemNoteChange = (index, value) => {
    const nextNotes = [...itemNotes];
    nextNotes[index] = value;
    setItemNotes(nextNotes);
  };

  const handlePassageStatusChange = (index, status) => {
    setPassageStatuses((prev) => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  };

  const handlePassageNoteChange = (index, value) => {
    const next = [...passageNotes];
    next[index] = value;
    setPassageNotes(next);
  };

  const fluentCount = itemStatuses.filter(s => s === 'fluent').length;
  const supportCount = itemStatuses.filter(s => s === 'support').length;
  const errorCount = itemStatuses.filter(s => s === 'error').length;
  const evaluatedCount = itemStatuses.filter(s => s !== null).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      toast.error('Please enter the student name.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter the assessor/student email.');
      return;
    }
    if (!selectedLevel) {
      toast.error('No score yet. Let the pupil read first, or select a CEFR level from the rubric table.');
      return;
    }

    setLoading(true);
    const assessmentType =
      selectedStage === 'Grade 5 / Year 6'
        ? 'Grade 5 / Year 6 Reading Assessment'
        : selectedStage === 'Grade 4 / Year 5'
        ? 'Grade 4 / Year 5 Reading Assessment'
        : selectedStage === 'Grade 3 / Year 4'
        ? 'Grade 3 / Year 4 Reading Assessment'
        : selectedStage === 'Grade 2 / Year 3'
        ? 'Grade 2 / Year 3 Reading Assessment'
        : selectedStage === 'Grade 1 / Year 2'
        ? 'Grade 1 / Year 2 Reading Assessment'
        : selectedStage === 'KG2 / Year 1'
        ? 'KG2 / Year 1 Reading Assessment'
        : selectedStage === 'FS2 - KG1'
        ? 'FS2 - KG1 Reading Assessment'
        : 'FS1 Reading Assessment';

    try {
      const selectedRubric = activeRubric.find(r => r.level === selectedLevel);
      const aiReadingCheck = (readingResults || [])
        .filter((r) => r.analysis && r.analysis.hasReading)
        .map((r) => r.summary)
        .join('\n');
      const aiNote = aiReadingCheck ? `\n\n[AI Reading Check]\n${aiReadingCheck}` : '';

      const payload = {
        assessmentType,
        schoolTier: 'primary',
        skillType: 'reading',
        yearGroupType: 'junior',
        email: formData.email,
        studentName: formData.studentName,
        yearGroupAndClass: formData.yearGroupAndClass,
        teacherName: formData.teacherName,
        term: formData.term,
        readingScore: selectedLevel,
        cefrLevel: selectedLevel,
        level: selectedLevel,
        totalScore:
          isPassageStage
            ? parseInt(kg2Accuracy, 10) || (activeRubric.findIndex(r => r.level === selectedLevel) + 1)
            : activeRubric.findIndex(r => r.level === selectedLevel) + 1,
        itemsEvaluated:
          isPassageStage
            ? activePassages.map((p, idx) => ({
                word: p.box,
                status: passageStatuses[idx] || 'evaluated',
                notes:
                  [passageNotes[idx], readingResults[idx]?.analysis?.hasReading ? readingResults[idx].summary : '']
                    .filter(Boolean)
                    .join(' | ') || p.passage,
              }))
            : READING_ITEMS.map((item, idx) => ({
                word: item.word,
                status: itemStatuses[idx] || 'unassessed',
                notes: [itemNotes[idx], cvcHeard[idx] ? `AI heard: "${cvcHeard[idx]}"` : '']
                  .filter(Boolean)
                  .join(' | '),
              })),
        teachingFocus:
          isPassageStage
            ? `Accuracy: ${kg2Accuracy}/10 | Fluency: ${kg2Fluency} | Comments: ${kg2Comments}`
            : teachingFocusNotes,
        keywordsIdentified: usedKeywords,
        notes:
          isPassageStage
            ? `${selectedRubric?.description || ''}. Accuracy: ${kg2Accuracy}/10, Fluency: ${kg2Fluency}. Comments: ${kg2Comments}${aiNote}`
            : `${selectedRubric?.description || ''}${aiNote}`,
      };

      await assessmentAPI.createAssessment(payload);
      toast.success(`${assessmentType} saved successfully! (${selectedLevel})`);
      
      setTimeout(() => {
        navigate('/assessments?tier=primary');
      }, 1500);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(`Failed to save: ${err.message || 'Error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Navigation Breadcrumb & Stage Switcher */}
        <div className="space-y-4">
          <Link
            to="/assessments?tier=primary"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Assessments
          </Link>

          <StageSelector
            stages={[...PRIMARY_STAGES, 'Grade 5 / Year 6']}
            value={selectedStage}
            onChange={handleStageSwitch}
            theme="emerald"
          />
        </div>

        {/* Title Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                  Primary Assessment · Reading
                </span>
                <span className="text-slate-300 font-bold">•</span>
                <span className="text-xs font-extrabold text-slate-500">
                  {selectedStage}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                {selectedStage} Reading Assessment
              </h1>
              <p className="text-slate-500 text-sm mt-2 max-w-2xl">
                {isGrade5Stage
                  ? 'The Moonlight Market story (4 paragraphs), 20-30s line timing, accuracy, fluency evaluation, and CEFR level scoring.'
                  : isGrade4Stage
                  ? 'The Blue Kite story (4 paragraphs), 10-15s line timing, accuracy, fluency evaluation, and CEFR level scoring.'
                  : selectedStage === 'Grade 3 / Year 4'
                  ? 'Mina & Rafi bakery story (5 lines/passages), 30-40s line timing, accuracy (/10), fluency evaluation, and CEFR level scoring.'
                  : selectedStage === 'Grade 2 / Year 3'
                  ? 'Lina & Sami narrative story (4 lines/passages), 30-40s line timing, accuracy (/10), fluency evaluation, and CEFR level scoring.'
                  : isGrade1Stage
                  ? 'Decodable reading passages, accuracy scoring (/10), fluency metrics, and CEFR level scoring for Grade 1 / Year 2 pupils.'
                  : selectedStage === 'KG2 / Year 1'
                  ? '5 decodable reading text boxes, accuracy scoring (/10), fluency metrics, and CEFR level scoring for KG2 / Year 1 pupils.'
                  : '6 CVC picture cards with sound blending, phonics decoding, and CEFR level scoring (Pre-A1 to B2–C1).'}
              </p>
            </div>

            {/* Evaluated Level Box */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-4 self-start md:self-auto shadow-xs">
              <div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                  Evaluated Level
                </span>
                <span className={`inline-block px-3 py-1 mt-1 rounded-xl text-sm font-black ${
                  selectedLevel ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}>
                  {selectedLevel || 'Not Selected'}
                </span>
                {isAutoLevel && (
                  <span className="block mt-1 text-[10px] font-bold text-emerald-700">
                    ✨ Auto-scored · {readingAgg.accuracy}% accuracy
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Instructions for assessor box */}
          <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Instructions for assessor:
              </h3>
            </div>
            {isGrade2Stage || isGrade3Stage || isGrade4Stage || isGrade5Stage ? (
              /* Story stages — exact wording from the Grade 2–5 sheets */
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium list-disc list-inside">
                <li>Present the story and ask the pupil to read aloud.</li>
                <li>
                  Allow{' '}
                  {isGrade5Stage ? '20-30' : isGrade4Stage ? '10-15' : '30-40'}{' '}
                  seconds per line.
                </li>
                <li>Use the Teacher Notes box to mark accuracy, fluency, and comments.</li>
              </ul>
            ) : isPassageStage ? (
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium list-disc list-inside">
                <li>Present one text box at a time.</li>
                <li>Say: <em>"Read this text out loud. Take your time."</em></li>
                <li>Allow 1 minute per text. Stop if the child struggles to read and move to phonics assessments.</li>
                <li>Use Teacher Notes below to record accuracy (/10), fluency, and comments.</li>
              </ul>
            ) : (
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium list-disc list-inside">
                <li>Point to each picture and ask the child to say the word and sound it out.</li>
                <li>Record the child’s errors and blending attempts.</li>
                <li>Use the results to identify teaching focus (e.g., extra support on Phase 2 CVC blending, Phase 3 digraphs, or fluency with tricky words)</li>
              </ul>
            )}
          </div>
        </div>

        {/* Printable Sheet Preview Modal */}
        {showSheetModal && (
          <div
            onClick={() => setShowSheetModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs cursor-pointer"
          >
            <div className="bg-white rounded-3xl p-4 max-w-2xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-black text-slate-800">{selectedStage} Reading Assessment Sheet</h3>
                <button
                  onClick={() => setShowSheetModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <img
                src={activeSheet}
                alt={`${selectedStage} Reading Assessment Sheet`}
                className="w-full max-h-[75vh] object-contain rounded-2xl border"
              />
            </div>
          </div>
        )}

        {/* Stimulus Picture Zoom Modal */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs cursor-pointer animate-fadeIn"
          >
            <div
              className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider block">
                    {selectedStage} Reading Stimulus
                  </span>
                  <h3 className="text-base font-black text-slate-800">
                    {previewImage.title || previewImage.caption}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 mb-3 flex items-center justify-center">
                <img
                  src={previewImage.image}
                  alt={previewImage.caption}
                  className="w-full max-h-[60vh] object-contain mx-auto"
                />
              </div>
              {previewImage.caption && (
                <p className="text-center font-serif text-lg font-bold text-slate-800">
                  "{previewImage.caption}"
                </p>
              )}
              {previewImage.desc && (
                <p className="text-center text-xs text-slate-500 mt-1">
                  {previewImage.desc}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Student & Assessor Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">1</span>
              Student & Assessment Details
            </h2>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="e.g. Liam Smith"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Assessor Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="assessor@school.edu"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Year Group / Class
                </label>
                <input
                  type="text"
                  name="yearGroupAndClass"
                  value={formData.yearGroupAndClass}
                  onChange={handleInputChange}
                  placeholder="e.g. FS1 - Dolphins"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Academic Term
                </label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="T1">Term 1 (T1)</option>
                  <option value="T2">Term 2 (T2)</option>
                  <option value="T3">Term 3 (T3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Assessment Conductor (passage stages; FS1/FS2 words have a mic on each card) */}
          {isPassageStage && (
            <AIAssistantConductor
              mode="reading"
              readingItems={conductorReadingItems}
              title={`${selectedStage} Reading Conductor`}
              onAnswersArrayChange={setAiAnswers}
              onReadingResultsChange={setReadingResults}
            />
          )}

          {isPassageStage ? (
            /* Reading Passages / Lines (KG2 / Year 1, Grade 1 / Year 2, Grade 2 / Year 3) */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">2</span>
                    {isGrade5Stage
                      ? "The Moonlight Market (4 Paragraphs · 20–30s per line)"
                      : isGrade4Stage
                      ? "The Blue Kite — Wind Day (4 Paragraphs · 10–15s per line)"
                      : isGrade3Stage
                      ? "Mina & Rafi Bakery Story Lines (5 Lines · 30–40s per line)"
                      : isGrade2Stage
                      ? "Lina & Sami Narrative Story Lines (4 Lines · 30–40s per line)"
                      : "Reading Passages & Related Stimulus (5 Texts · 1 Minute per text)"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isGrade5Stage
                      ? "Present the story and ask the pupil to read aloud. Allow 20–30 seconds per line. Use the Teacher Notes box to mark accuracy, fluency, and comments."
                      : isGrade4Stage
                      ? "Present the story and ask the pupil to read aloud. Allow 10–15 seconds per line. Use the Teacher Notes box to mark accuracy, fluency, and comments."
                      : isGrade3Stage || isGrade2Stage
                      ? "Present the story and ask the pupil to read aloud. Allow 30–40 seconds per line. Use the Teacher Notes box to mark accuracy, fluency, and comments."
                      : "Present one text box at a time. Show accompanying pictures to aid visual comprehension. Pupil reads aloud. Stop if the child struggles to read and move to phonics assessments."}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                  {isGrade5Stage
                    ? "4 Story Paragraphs · 3 Pictures"
                    : isGrade4Stage
                    ? "4 Story Paragraphs · 5 Pictures"
                    : isGrade3Stage
                    ? "5 Story Lines · 5 Pictures"
                    : isGrade2Stage
                    ? "4 Story Lines · 4 Illustrations"
                    : "5 Texts · 3 Stimulus Pictures"}
                </div>
              </div>

              {/* Reading Passage — presented like the official assessment sheet */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    Reading Passage
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Pupil reads aloud · click a picture to enlarge
                  </span>
                </div>

                <div className="p-4 sm:p-6 bg-white">
                  {passageLayout === 'table' ? (
                    /* KG2 / Year 1 & Grade 1 / Year 2 — Text Box table + pictures below */
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border border-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="py-2.5 px-4 text-sm font-black text-slate-800 w-28 border-b border-r border-slate-200">Text Box</th>
                              <th className="py-2.5 px-4 text-sm font-black text-slate-800 border-b border-slate-200">Reading Passage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activePassages.map((p, idx) => (
                              <tr key={p.id} className="border-b border-slate-200 last:border-b-0 align-top">
                                <td className="py-4 px-4 text-sm font-bold text-slate-800 border-r border-slate-200">{p.box}</td>
                                <td className="py-4 px-4">
                                  <p className="text-lg sm:text-xl text-slate-900 leading-relaxed">{p.passage}</p>
                                  {renderAiCheck(idx)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5">
                        {storyPictures.map((pic) => renderStoryPicture(pic, 'aspect-[4/3]'))}
                      </div>
                    </>
                  ) : passageLayout === 'side' ? (
                    /* Grade 2–4 — story text with pictures down the right, like the sheet */
                    <div className="bg-slate-100/80 rounded-2xl border border-slate-200 p-5 sm:p-6">
                      {storyTitle && (
                        <h4 className="text-lg font-black text-slate-900 mb-3">{storyTitle}</h4>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5">
                        <div className="space-y-5">
                          {activePassages.map((p, idx) => (
                            <div key={p.id}>
                              <p className="text-base sm:text-lg text-slate-800 leading-relaxed">{p.passage}</p>
                              {renderAiCheck(idx)}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-row flex-wrap sm:flex-col sm:flex-nowrap sm:justify-around gap-3">
                          {storyPictures.map((pic) => renderStoryPicture(pic, 'w-20 h-20 sm:w-24 sm:h-24'))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Grade 5 — story text with pictures below */
                    <>
                      <div className="bg-slate-100/80 rounded-2xl border border-slate-200 p-5 sm:p-6">
                        {storyTitle && (
                          <h4 className="text-lg font-black text-slate-900 mb-3">{storyTitle}</h4>
                        )}
                        <div className="space-y-5">
                          {activePassages.map((p, idx) => (
                            <div key={p.id}>
                              <p className="text-base sm:text-lg text-slate-800 leading-relaxed">{p.passage}</p>
                              {renderAiCheck(idx)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5">
                        {storyPictures.map((pic) => renderStoryPicture(pic, 'aspect-[4/3]'))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Teacher Marking — one compact row per text */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Teacher Marking
                </h3>
                {activePassages.map((item, idx) => {
                  const status = passageStatuses[idx];
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 p-4 transition-all ${
                        status === 'accurate'
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : status === 'hesitant'
                          ? 'border-amber-400 bg-amber-50/30'
                          : status === 'struggled'
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase rounded-lg shrink-0">
                              {item.box}
                            </span>
                            <span className="text-xs text-slate-500 truncate">
                              {item.passage.split(' ').slice(0, 8).join(' ')}…
                            </span>
                          </div>
                          {item.hint && (
                            <span className="text-[11px] font-semibold text-slate-400 block mt-1">{item.hint}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold self-start md:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePassageStatusChange(idx, 'accurate')}
                            className={`px-3 py-1.5 rounded-xl transition-all ${
                              status === 'accurate'
                                ? 'bg-emerald-600 text-white font-black shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          >
                            ✓ Accurate
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePassageStatusChange(idx, 'hesitant')}
                            className={`px-3 py-1.5 rounded-xl transition-all ${
                              status === 'hesitant'
                                ? 'bg-amber-500 text-white font-black shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800'
                            }`}
                          >
                            ~ Hesitation / Errors
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePassageStatusChange(idx, 'struggled')}
                            className={`px-3 py-1.5 rounded-xl transition-all ${
                              status === 'struggled'
                                ? 'bg-rose-500 text-white font-black shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-800'
                            }`}
                          >
                            ✗ Struggled / Stop
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={passageNotes[idx]}
                        onChange={(e) => handlePassageNoteChange(idx, e.target.value)}
                        placeholder="Notes (e.g., mispronounced 'mud', paused at 'frogs')..."
                        className="mt-3 w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Teacher Notes Box (Exact from official KG2 / Year 1 sheet) */}
              <div className="mt-6 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Teacher Notes (From Assessment Sheet)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Accuracy */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Accuracy Score <span className="text-slate-400 font-normal">(___ / 10)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={kg2Accuracy}
                        onChange={(e) => setKg2Accuracy(e.target.value)}
                        className="w-24 px-3.5 py-2 rounded-xl border border-slate-300 font-black text-base text-slate-900 text-center bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-500">out of 10</span>
                    </div>
                  </div>

                  {/* Fluency */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Fluency Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Smooth', 'Some hesitation', 'Many pauses'].map((fl) => (
                        <button
                          key={fl}
                          type="button"
                          onClick={() => setKg2Fluency(fl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            kg2Fluency === fl
                              ? 'bg-emerald-600 text-white shadow-xs font-black'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {fl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Teacher Comments
                  </label>
                  <textarea
                    rows={2}
                    value={kg2Comments}
                    onChange={(e) => setKg2Comments(e.target.value)}
                    placeholder="Enter observation notes, mis-sounded phonemes, or blending confidence..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 6 CVC Reading Word Cards (Image 1) */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">2</span>
                    Picture Prompt & CVC Reading Cards
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Point to each picture. The pupil presses 🎤 Read under the picture and reads that word.
                    The AI marks it ✓ Fluent, ~ Support (sounded out) or ✗ Error, and selects the CEFR level.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <span>Evaluated: <strong className="text-slate-900">{evaluatedCount}/6</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">✓ Fluent: {fluentCount}</span>
                  <span>•</span>
                  <span className="text-amber-700 font-bold">~ Support: {supportCount}</span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">✗ Errors: {errorCount}</span>
                </div>
              </div>

              {/* Reading Card — presented like the official FS1 / FS2 sheet */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Reading Card
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Point to each picture · pupil says the word and sounds it out
                  </span>
                </div>
                <div className="p-5 sm:p-8 bg-white grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
                  {READING_ITEMS.map((item, idx) => {
                    const status = itemStatuses[idx];
                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col items-center rounded-2xl p-3 border-2 transition-colors ${
                          status === 'fluent'
                            ? 'border-emerald-400 bg-emerald-50/40'
                            : status === 'support'
                            ? 'border-amber-400 bg-amber-50/40'
                            : status === 'error'
                            ? 'border-rose-400 bg-rose-50/40'
                            : 'border-transparent'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              image: item.image,
                              caption: item.word,
                              title: `Picture ${idx + 1}`,
                              desc: item.label,
                            })
                          }
                          className="h-28 sm:h-36 w-full flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors"
                          title="Click to enlarge"
                        >
                          <img src={item.image} alt={item.label} className="max-h-full max-w-full object-contain" />
                        </button>
                        <p
                          className={`mt-3 text-3xl sm:text-4xl font-medium tracking-[0.35em] pl-[0.35em] pr-1 rounded-lg ${
                            status === 'fluent'
                              ? 'bg-emerald-200 text-emerald-950'
                              : status === 'support'
                              ? 'bg-amber-200 text-amber-950'
                              : status === 'error'
                              ? 'bg-rose-200 text-rose-950'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.word}
                        </p>

                        {/* Pupil answers this word here — one mic per picture */}
                        <div className="mt-3 flex flex-col items-center gap-1.5">
                          <VoiceDictation
                            key={`${selectedStage}-${idx}`}
                            idleLabel={cvcHeard[idx] ? 'Read again' : 'Read'}
                            activeLabel="Listening…"
                            onStart={() => {
                              setHeardFor(idx, '');
                              // a fresh answer replaces any earlier teacher override
                              setItemStatuses((prev) => {
                                const next = [...prev];
                                next[idx] = null;
                                return next;
                              });
                            }}
                            onInterimResult={(text) => setHeardFor(idx, text)}
                            hasAnswer={!!cvcHeard[idx] || !!manualItemStatuses[idx]}
                            onClear={() => {
                              setHeardFor(idx, '');
                              setItemStatuses((prev) => {
                                const next = [...prev];
                                next[idx] = null;
                                return next;
                              });
                            }}
                            stopWhen={(text) => {
                              const r = judgeCvcWord(item.word, text);
                              return r === 'fluent' || r === 'support';
                            }}
                          />
                          {status && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                status === 'fluent'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : status === 'support'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {status === 'fluent' ? '✓ Fluent' : status === 'support' ? '~ Support' : '✗ Error'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Marking — one compact row per word */}
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Teacher Marking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {READING_ITEMS.map((item, idx) => {
                  const status = itemStatuses[idx];
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 p-3.5 transition-all ${
                        status === 'fluent'
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : status === 'support'
                          ? 'border-amber-400 bg-amber-50/30'
                          : status === 'error'
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-lg font-black text-slate-900 tracking-widest">
                          {item.word}
                        </span>
                        <div className="flex gap-1.5 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(idx, 'fluent')}
                            className={`py-1.5 px-2.5 rounded-xl transition-all ${
                              status === 'fluent'
                                ? 'bg-emerald-600 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                          >
                            ✓ Fluent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(idx, 'support')}
                            className={`py-1.5 px-2.5 rounded-xl transition-all ${
                              status === 'support'
                                ? 'bg-amber-500 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                            }`}
                          >
                            ~ Support
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(idx, 'error')}
                            className={`py-1.5 px-2.5 rounded-xl transition-all ${
                              status === 'error'
                                ? 'bg-rose-500 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                            }`}
                          >
                            ✗ Error
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={itemNotes[idx]}
                        onChange={(e) => handleItemNoteChange(idx, e.target.value)}
                        placeholder="Sound errors / blending note..."
                        className="mt-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CEFR Level Rubric Selection (Image 1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">3</span>
                  CEFR Reading Rubric & Level Assignment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  The level is selected automatically from the pupil's reading. Click a different row only if you disagree.
                </p>
              </div>

              {selectedLevel && (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700">
                    {isAutoLevel ? '✨ AI score:' : 'Assigned:'}
                  </span>
                  <span className="text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                    {selectedLevel}
                  </span>
                  {manualLevel && autoLevel && manualLevel !== autoLevel && (
                    <button
                      type="button"
                      onClick={() => setSelectedLevel(null)}
                      className="text-[11px] font-bold text-emerald-700 underline"
                    >
                      Use AI score ({autoLevel})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Exact CEFR Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 w-36">CEFR Level</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 w-28 text-center">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {activeRubric.map((item, i) => {
                    const isSelected = selectedLevel === item.level;

                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedLevel(item.level)}
                        className={`cursor-pointer transition-all duration-150 ${
                          isSelected 
                            ? 'bg-emerald-50/90 font-extrabold border-l-4 border-l-emerald-600 shadow-2xs' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-4 px-4 font-black">
                          <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            isSelected ? 'bg-emerald-600 text-white shadow-xs scale-105' : item.badgeBg
                          }`}>
                            {item.level}
                          </span>
                        </td>
                        <td className="py-4 px-4 leading-relaxed font-medium">
                          {item.description}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input
                            type="radio"
                            name="readingCefrRadio"
                            checked={isSelected}
                            onChange={() => setSelectedLevel(item.level)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>

            {/* Teaching Focus Notes */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Teaching Focus & Next Steps
              </label>
              <textarea
                value={teachingFocusNotes}
                onChange={(e) => setTeachingFocusNotes(e.target.value)}
                rows={2}
                placeholder="Identify teaching focus (e.g., extra support on Phase 2 CVC blending, Phase 3 digraphs, or tricky word fluency)..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Submission Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              {selectedLevel ? (
                <span>
                  {isAutoLevel ? '✨ Auto-scored level' : 'Assigned Level'}:{' '}
                  <strong className="text-emerald-700 font-black">{selectedLevel}</strong>
                  {readingAgg.hasReading && (
                    <span className="text-slate-400"> · {readingAgg.accuracy}% accuracy · ready to submit</span>
                  )}
                </span>
              ) : (
                <span className="text-slate-600 font-bold">The score fills in automatically once the pupil has read.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/assessments?tier=primary')}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedLevel}
                className="w-1/2 sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Submit {selectedStage} Reading</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

