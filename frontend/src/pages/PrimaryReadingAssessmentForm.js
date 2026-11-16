import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../services/api';
import AIAssistantConductor from '../components/AIAssistantConductor';

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

const KEY_WORDS = [
  'hen', 'dog', 'sit', 'web', 'bug', 'ladybird', 'cobweb', 'sun', 
  'chicken', 'boy', 'chair', 'spider', 'red', 'yellow'
];

export default function PrimaryReadingAssessmentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedTerm = searchParams.get('term') || 'T1';

  const isGrade4Initial =
    location.pathname.includes('grade4') ||
    location.pathname.includes('year5') ||
    searchParams.get('grade') === 'grade4' ||
    searchParams.get('grade') === 'year5' ||
    searchParams.get('stage') === 'grade4' ||
    searchParams.get('stage') === 'year5';

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

  const initialStage = isGrade4Initial
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

  const isGrade4Stage =
    selectedStage === 'Grade 4 / Year 5' ||
    selectedStage.includes('Grade 4') ||
    selectedStage.includes('Year 5');

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
    isGrade4Stage;

  const activePassages = isGrade4Stage
    ? GRADE4_READING_PASSAGES
    : isGrade3Stage
    ? GRADE3_READING_PASSAGES
    : isGrade2Stage
    ? GRADE2_READING_PASSAGES
    : KG2_READING_PASSAGES;

  const activeStimulusPictures = isGrade3Stage
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
        prev.yearGroupAndClass === 'Grade 4 / Year 5'
          ? newStage
          : prev.yearGroupAndClass,
    }));
  };

  // Observations per CVC word (FS1 & FS2)
  const [itemStatuses, setItemStatuses] = useState(Array(READING_ITEMS.length).fill(null));
  const [itemNotes, setItemNotes] = useState(Array(READING_ITEMS.length).fill(''));
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [teachingFocusNotes, setTeachingFocusNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Passages State (KG2 / Year 1, Grade 1 / Year 2, Grade 2 / Year 3, Grade 3 / Year 4, Grade 4 / Year 5)
  const [passageStatuses, setPassageStatuses] = useState(Array(8).fill(null));
  const [passageNotes, setPassageNotes] = useState(Array(8).fill(''));
  const [kg2Accuracy, setKg2Accuracy] = useState('10');
  const [kg2Fluency, setKg2Fluency] = useState('Smooth');
  const [kg2Comments, setKg2Comments] = useState('');
  const [aiAnswers, setAiAnswers] = useState([]);

  const conductorQuestions = isGrade4Stage
    ? GRADE4_READING_PASSAGES.map((p) => `${p.box}: ${p.passage}`)
    : isGrade3Stage
    ? GRADE3_READING_PASSAGES.map((p) => `${p.box}: ${p.passage}`)
    : isGrade2Stage
    ? GRADE2_READING_PASSAGES.map((p) => `${p.box}: ${p.passage}`)
    : isPassageStage
    ? KG2_READING_PASSAGES.map((p) => `${p.box}: ${p.passage}`)
    : READING_ITEMS.map((item) => `Read aloud the word: ${item.word}`);

  const conductorRubrics = isGrade4Stage
    ? GRADE4_READING_PASSAGES.map((p) => ({
        keyPhrases: p.keywords,
        relatablePhrases: [
          'Sami', 'Hana', 'Mrs Jones', 'younger boy', 'neighbour',
          'packed', 'checked', 'walked', 'launched', 'lifted', 'snagged', 'eased', 'fixed', 'showed',
          'face the wind', 'dipping', 'rising', 'invited', 'counted', 'clapped', 'wound the string',
          'blue kite', 'tape', 'ribbon tail', 'compass', 'windsock', 'reel', 'knots', 'bench', 'string',
          'red kite', 'hill', 'clouds', 'windy Saturday', 'park', 'football pitch', 'open hill',
          'no trees', 'gust', 'smooth arc', 'crowd', 'path', 'home',
          'windy', 'sharp gust', 'tiny tear', 'smooth arc', 'wide eyes', 'flicked tail', 'thicken clouds', 'star shapes',
          'forty-five',
        ],
      }))
    : isGrade3Stage
    ? GRADE3_READING_PASSAGES.map((p) => ({
        keyPhrases: p.keywords,
        relatablePhrases: ['Mina', 'Rafi', 'bread', 'bakery', 'stone', 'milk'],
      }))
    : isGrade2Stage
    ? GRADE2_READING_PASSAGES.map((p) => ({
        keyPhrases: p.keywords,
        relatablePhrases: ['Lina', 'Sami', 'story', 'apples', 'spoon'],
      }))
    : null;

  const activeRubric = isGrade4Stage
    ? GRADE4_READING_RUBRIC
    : isGrade3Stage
    ? GRADE3_READING_RUBRIC
    : isGrade2Stage
    ? GRADE2_READING_RUBRIC
    : isPassageStage
    ? KG2_READING_RUBRIC
    : READING_RUBRIC_LEVELS;

  const activeSheet =
    isGrade4Stage
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

  const handleStatusChange = (index, status) => {
    const nextStatuses = [...itemStatuses];
    nextStatuses[index] = status;
    setItemStatuses(nextStatuses);
  };

  const handleItemNoteChange = (index, value) => {
    const nextNotes = [...itemNotes];
    nextNotes[index] = value;
    setItemNotes(nextNotes);
  };

  const handlePassageStatusChange = (index, status) => {
    const next = [...passageStatuses];
    next[index] = status;
    setPassageStatuses(next);
  };

  const handlePassageNoteChange = (index, value) => {
    const next = [...passageNotes];
    next[index] = value;
    setPassageNotes(next);
  };

  const toggleKeyword = (word) => {
    setUsedKeywords(prev => 
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
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
      toast.error('Please select the evaluated CEFR Level from the rubric table.');
      return;
    }

    setLoading(true);
    const assessmentType =
      selectedStage === 'Grade 4 / Year 5'
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
                notes: passageNotes[idx] || p.passage,
              }))
            : READING_ITEMS.map((item, idx) => ({
                word: item.word,
                status: itemStatuses[idx] || 'unassessed',
                notes: itemNotes[idx] || '',
              })),
        teachingFocus:
          isPassageStage
            ? `Accuracy: ${kg2Accuracy}/10 | Fluency: ${kg2Fluency} | Comments: ${kg2Comments}`
            : teachingFocusNotes,
        keywordsIdentified: usedKeywords,
        notes:
          isPassageStage
            ? `${selectedRubric?.description || ''}. Accuracy: ${kg2Accuracy}/10, Fluency: ${kg2Fluency}. Comments: ${kg2Comments}`
            : selectedRubric?.description || '',
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/assessments?tier=primary"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Assessments
          </Link>

          {/* Stage Selector (FS1, FS2 - KG1, KG2 / Year 1) */}
          <div className="inline-flex bg-slate-200/90 p-1.5 rounded-2xl shadow-inner gap-1 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleStageSwitch('FS1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'FS1'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌸 FS1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'FS1' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Nursery
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('FS2 - KG1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'FS2 - KG1'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌼 FS2 - KG1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'FS2 - KG1' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Reception
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('KG2 / Year 1')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'KG2 / Year 1'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🎓 KG2 / Year 1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'KG2 / Year 1' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Year 1
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('Grade 1 / Year 2')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'Grade 1 / Year 2'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>⭐ Grade 1 / Year 2</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'Grade 1 / Year 2' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Year 2
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('Grade 2 / Year 3')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'Grade 2 / Year 3'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🎓 Grade 2 / Year 3</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'Grade 2 / Year 3' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Year 3
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('Grade 3 / Year 4')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'Grade 3 / Year 4'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🚀 Grade 3 / Year 4</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'Grade 3 / Year 4' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Year 4
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageSwitch('Grade 4 / Year 5')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selectedStage === 'Grade 4 / Year 5'
                  ? 'bg-white text-emerald-700 shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <span>🌟 Grade 4 / Year 5</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                selectedStage === 'Grade 4 / Year 5' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                Year 5
              </span>
            </button>
          </div>
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
                {selectedStage === 'Grade 3 / Year 4'
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
              <button
                type="button"
                onClick={() => setShowSheetModal(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                View Printable Sheet ↗
              </button>
            </div>
            {isGrade3Stage || isGrade2Stage ? (
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium list-disc list-inside">
                <li>Present the story and ask the pupil to read aloud.</li>
                <li>Allow 30-40 seconds per line.</li>
                <li>Stop if the child struggles to read and move to phonics assessments.</li>
                <li>Use Teacher Notes below to record accuracy (/10), fluency, and comments.</li>
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

          {/* AI Assessment Conductor */}
          <AIAssistantConductor
            questions={conductorQuestions}
            rubrics={conductorRubrics}
            title={`${selectedStage} Reading Conductor`}
            onAnswersArrayChange={setAiAnswers}
          />

          {isPassageStage ? (
            /* Reading Passages / Lines (KG2 / Year 1, Grade 1 / Year 2, Grade 2 / Year 3) */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">2</span>
                    {isGrade4Stage
                      ? "The Blue Kite — Wind Day (4 Paragraphs · 10–15s per line)"
                      : isGrade3Stage
                      ? "Mina & Rafi Bakery Story Lines (5 Lines · 30–40s per line)"
                      : isGrade2Stage
                      ? "Lina & Sami Narrative Story Lines (4 Lines · 30–40s per line)"
                      : "Reading Passages & Related Stimulus (5 Texts · 1 Minute per text)"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isGrade4Stage
                      ? "Present the story and ask the pupil to read aloud. Allow 10–15 seconds per line. Mark accuracy, fluency, and error rate."
                      : isGrade3Stage || isGrade2Stage
                      ? "Present the story and ask the pupil to read aloud. Allow 30–40 seconds per line. Stop if the child struggles and move to phonics."
                      : "Present one text box at a time. Show accompanying pictures to aid visual comprehension. Pupil reads aloud. Stop if the child struggles to read and move to phonics assessments."}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                  {isGrade4Stage
                    ? "4 Story Paragraphs · Official Sheet"
                    : isGrade3Stage
                    ? "5 Story Lines · 6 Illustrations"
                    : isGrade2Stage
                    ? "4 Story Lines · 4 Illustrations"
                    : "5 Texts · 3 Stimulus Pictures"}
                </div>
              </div>

              {/* Official Stimulus Pictures from Assessment Sheet */}
              {!isGrade4Stage && (
                <div className="bg-gradient-to-br from-emerald-50/60 to-slate-50 border-2 border-emerald-100 rounded-3xl p-5 mb-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Visual Stimulus Prompts (From Official Assessment Sheet)
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                      🔍 Click any picture to enlarge for student presentation
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 ${isGrade3Stage ? 'sm:grid-cols-3' : isGrade2Stage ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                    {activeStimulusPictures.map((pic) => (
                      <div
                        key={pic.id}
                        onClick={() => setPreviewImage(pic)}
                        className="group cursor-pointer bg-white rounded-2xl p-3 border-2 border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col items-center"
                      >
                        <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden mb-2.5 border border-slate-100 relative">
                          <img
                            src={pic.image}
                            alt={pic.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm transition-opacity">
                              🔍 View Full Image
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800 text-center line-clamp-1">
                          "{pic.caption}"
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200/60">
                          {pic.passageRef}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Passages List */}
              <div className="space-y-4">
                {activePassages.map((item, idx) => {
                  const status = passageStatuses[idx];

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 p-5 transition-all ${
                        status === 'accurate'
                          ? 'border-emerald-500 bg-emerald-50/30 shadow-xs'
                          : status === 'hesitant'
                          ? 'border-amber-400 bg-amber-50/30'
                          : status === 'struggled'
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase rounded-lg">
                            {item.box}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {item.hint}
                          </span>
                        </div>

                        {/* Quick Marking Buttons */}
                        <div className="flex items-center gap-2 text-xs font-bold self-start md:self-auto">
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

                      {/* The Reading Passage Text + Related Visual Stimulus */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        <div className={item.image ? "lg:col-span-9" : "lg:col-span-12"}>
                          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-inner">
                            <p className="font-serif text-lg md:text-xl font-bold text-slate-900 tracking-wide leading-relaxed">
                              {item.passage}
                            </p>
                            {aiAnswers && aiAnswers[idx] && aiAnswers[idx].trim().length > 0 && (
                              <div className="mt-3 text-sm text-indigo-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 shadow-inner">
                                <span className="font-bold mr-1">Student Answer (AI):</span> "{aiAnswers[idx]}"
                              </div>
                            )}
                          </div>
                        </div>

                        {item.image && (
                          <div className="lg:col-span-3 flex flex-row lg:flex-col items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                            <div
                              onClick={() =>
                                setPreviewImage({
                                  image: item.image,
                                  caption: item.imageCaption,
                                  title: `${item.box}: ${item.imageCaption}`,
                                  desc: item.imageLabel,
                                })
                              }
                              className="group cursor-pointer relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-emerald-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all bg-white shrink-0"
                              title="Click to view full image"
                            >
                              <img
                                src={item.image}
                                alt={item.imageCaption}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 flex items-center justify-center transition-colors">
                                <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded shadow-sm transition-opacity">
                                  🔍 View
                                </span>
                              </div>
                            </div>
                            <div className="text-left lg:text-center">
                              <span className="text-xs font-black text-slate-800 block">
                                "{item.imageCaption}"
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-600 block mt-0.5">
                                Stimulus Picture
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Passage Observation Input */}
                      <div className="mt-3">
                        <input
                          type="text"
                          value={passageNotes[idx]}
                          onChange={(e) => handlePassageNoteChange(idx, e.target.value)}
                          placeholder="Passage notes (e.g., mispronounced 'mud', paused at 'frogs')..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                        />
                      </div>
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
                    Point to each picture and ask the child to sound out and read each word.
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

              {/* Grid of 6 CVC Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {READING_ITEMS.map((item, idx) => {
                  const status = itemStatuses[idx];

                  return (
                    <div
                      key={item.id}
                      className={`rounded-3xl border-2 p-5 transition-all flex flex-col justify-between ${
                        status === 'fluent'
                          ? 'border-emerald-500 bg-emerald-50/30 shadow-md'
                          : status === 'support'
                          ? 'border-amber-400 bg-amber-50/30'
                          : status === 'error'
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Image Prompt */}
                        <div className="w-full h-36 bg-slate-100 rounded-2xl overflow-hidden mb-4 border border-slate-200 flex items-center justify-center p-2">
                          <img
                            src={item.image}
                            alt={item.word}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        {/* Spaced CVC word letters (e.g. h  e  n) */}
                        <div className="text-center mb-4">
                          <div className="flex items-center justify-center gap-3 font-mono text-3xl font-black text-slate-900 tracking-widest">
                            {item.letters.map((ltr, lIdx) => (
                              <span 
                                key={lIdx}
                                className="w-10 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
                              >
                                {ltr}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 mt-1.5 block">
                            Card {item.id}: {item.label}
                          </span>
                          {aiAnswers && aiAnswers[idx] && aiAnswers[idx].trim().length > 0 && (
                            <div className="mt-3 text-xs text-indigo-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 shadow-inner">
                              <span className="font-bold mr-1">Student Answer (AI):</span> "{aiAnswers[idx]}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assessor Observation Quick Buttons */}
                      <div className="space-y-2.5 pt-3 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(idx, 'fluent')}
                            className={`py-1.5 px-2 rounded-xl transition-all ${
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
                            className={`py-1.5 px-2 rounded-xl transition-all ${
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
                            className={`py-1.5 px-2 rounded-xl transition-all ${
                              status === 'error'
                                ? 'bg-rose-500 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                            }`}
                          >
                            ✗ Error
                          </button>
                        </div>

                        {/* Blending / Mis-sound notes */}
                        <input
                          type="text"
                          value={itemNotes[idx]}
                          onChange={(e) => handleItemNoteChange(idx, e.target.value)}
                          placeholder="Sound errors / blending note..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                        />
                      </div>
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
                  Click on the row that reflects the student's reading accuracy and CVC blending capability.
                </p>
              </div>

              {selectedLevel && (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700">Assigned:</span>
                  <span className="text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                    {selectedLevel}
                  </span>
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

                  {/* Key Words Row */}
                  <tr className="bg-slate-50/90 border-t-2 border-slate-300">
                    <td className="py-4 px-4 font-black text-slate-800 align-top">
                      Key words
                    </td>
                    <td colSpan={2} className="py-4 px-4">
                      <p className="text-[11px] text-slate-500 font-semibold mb-2">
                        Mark words identified by the student:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {KEY_WORDS.map((word, kIdx) => {
                          const isUsed = usedKeywords.includes(word);
                          return (
                            <button
                              key={kIdx}
                              type="button"
                              onClick={() => toggleKeyword(word)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                isUsed
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300'
                              }`}
                            >
                              {isUsed ? '✓ ' : ''}{word}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
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
                <span>Assigned Level: <strong className="text-emerald-700 font-black">{selectedLevel}</strong></span>
              ) : (
                <span className="text-rose-600 font-bold">Please select a CEFR level from the rubric table above</span>
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

