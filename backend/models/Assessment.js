const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  assessmentType: {
    type: String,
    enum: ['EAL & ELL', 'Listening Part 1', 'Listening Part 2', 'Speaking Assessment', 'Reading Assessment', 'Writing Assessment'],
    default: 'EAL & ELL',
    required: true
  },
  yearGroupType: {
    type: String,
    enum: ['junior', 'senior'],
    comment: 'Used to distinguish between Year 7-9 (junior) and Year 10-13 (senior) for Listening Part 2, Speaking Assessment, and Reading Assessment'
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  yearGroupAndClass: {
    type: String,
    required: true,
    trim: true
  },
  teacherName: {
    type: String,
    trim: true
  },
  // EAL & ELL specific fields
  respondToGreeting: {
    type: String,
    enum: ['Yes', 'No', 'Partly']
  },
  followSimpleInstructions: {
    type: String,
    enum: ['Yes', 'No', 'Partly']
  },
  englishLanguageSupport: [
    {
      type: String,
      enum: [
        'New to English',
        'Basic English Speaker',
        'Basic Writing',
        'Reading Difficulties',
        'Discussion Contribution',
        'Writing Paragraphs'
      ]
    }
  ],
  listeningSkillsLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  // Reading & Reviewing (1-5 scale)
  readingSkillsLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  // Speaking (1-5 scale)
  speakingSkillsLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  // Writing (1-5 scale)
  writingSkillsLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  // Support Areas (checkboxes)
  supportNeeds: [
    {
      type: String,
      enum: [
        'Speaking English',
        'Reading English',
        'Writing English',
        'Understanding basic instructions',
        'Key vocabulary understanding'
      ]
    }
  ],
  // Text Fields
  readingAge: {
    type: String,
    trim: true
  },
  cat4Levels: {
    type: String,
    trim: true
  },
  bookBandLevel: {
    type: String,
    trim: true
  },
  phonicsLevel: {
    type: String,
    trim: true
  },
  // Long Text Areas
  developmentAreas: {
    type: String,
    trim: true
  },
  suggestionsForMaterials: {
    type: String,
    trim: true
  },
  classroomSupportIdeas: {
    type: String,
    trim: true
  },
  // Listening Assessment Part 1 specific fields (13 questions, 0-2 scoring)
  listeningAssessmentAnswers: [
    {
      questionId: Number,
      score: {
        type: Number,
        enum: [0, 1, 2]
      }
    }
  ],
  cefrLevel: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  // Speaking Assessment specific fields (6 questions, 0-2 scoring)
  speakingAssessmentAnswers: [
    {
      questionId: Number,
      score: {
        type: Number,
        enum: [0, 1, 2]
      }
    }
  ],
  // Reading Assessment specific field
  readingScore: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E']
  },
  readingNotes: {
    type: String,
    trim: true
  },
  // Writing Assessment specific field
  writingScore: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E']
  },
  writingNotes: {
    type: String,
    trim: true
  },
  studentWriting: {
    type: String,
    trim: true
  },
  teacherComments: {
    type: String,
    trim: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Developing', 'Competent', 'Advanced', 'A', 'B', 'C', 'D', 'E', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'Developing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
