const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  assessmentType: {
    type: String,
    enum: [
      "EAL & ELL",
      "Listening Part 1",
      "Listening Part 2",
      "Speaking Assessment",
      "Reading Assessment",
      "Writing Assessment",
      "FS1 Listening Assessment",
      "FS1 Speaking Assessment",
      "FS1 Reading Assessment",
      "FS1 Writing Assessment",
      "FS1 Phonic Assessment",
      "FS2 - KG1 Listening Assessment",
      "FS2 Listening Assessment",
      "FS2 - KG1 Speaking Assessment",
      "FS2 Speaking Assessment",
      "FS2 - KG1 Reading Assessment",
      "FS2 Reading Assessment",
      "FS2 - KG1 Writing Assessment",
      "FS2 Writing Assessment",
      "FS2 - KG1 Phonic Assessment",
      "FS2 Phonic Assessment",
      "KG2 / Year 1 Listening Assessment",
      "KG2 Listening Assessment",
      "Year 1 Listening Assessment",
      "KG2 / Year 1 Speaking Assessment",
      "KG2 Speaking Assessment",
      "Year 1 Speaking Assessment",
      "KG2 / Year 1 Reading Assessment",
      "KG2 Reading Assessment",
      "Year 1 Reading Assessment",
      "KG2 / Year 1 Writing Assessment",
      "KG2 Writing Assessment",
      "Year 1 Writing Assessment",
      "KG2 / Year 1 Phonic Assessment",
      "KG2 Phonic Assessment",
      "Year 1 Phonic Assessment",
      "Primary Listening Assessment",
      "Primary Speaking Assessment",
      "Primary Reading Assessment",
      "Primary Writing Assessment",
      "Primary Phonic Assessment",
    ],
    default: "EAL & ELL",
    required: true,
  },
  schoolTier: {
    type: String,
    enum: ["primary", "secondary"],
    default: function () {
      const type = (this.assessmentType || "").toLowerCase();
      if (
        type.includes("fs") ||
        type.includes("kg") ||
        type.includes("year 1") ||
        type.includes("phonic") ||
        type.startsWith("primary")
      ) {
        return "primary";
      }
      return "secondary";
    },
  },
  schoolTier: {
    type: String,
    enum: ["primary", "secondary"],
    default: function () {
      const type = (this.assessmentType || "").toLowerCase();
      if (
        type.includes("fs") ||
        type.includes("kg") ||
        type.includes("year 1") ||
        type.includes("phonic") ||
        type.startsWith("primary")
      ) {
        return "primary";
      }
      return "secondary";
    },
  },
  yearGroupType: {
    type: String,
    enum: ["junior", "senior"],
    comment:
      "Used to distinguish between Year 7-9 (junior) and Year 10-13 (senior) for Listening Part 2, Speaking Assessment, and Reading Assessment",
  },
  term: {
    type: String,
    enum: ["T1", "T2", "T3"],
    default: "T1",
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  yearGroupAndClass: {
    type: String,
    required: true,
    trim: true,
  },
  teacherName: {
    type: String,
    trim: true,
  },
  // EAL & ELL specific fields
  respondToGreeting: {
    type: String,
    enum: ["Yes", "No", "Partly"],
  },
  followSimpleInstructions: {
    type: String,
    enum: ["Yes", "No", "Partly"],
  },
  englishLanguageSupport: [
    {
      type: String,
      enum: [
        "New to English",
        "Basic English Speaker",
        "Basic Writing",
        "Reading Difficulties",
        "Discussion Contribution",
        "Writing Paragraphs",
      ],
    },
  ],
  listeningSkillsLevel: {
    type: Number,
    min: 1,
    max: 5,
  },
  // Reading & Reviewing (1-5 scale)
  readingSkillsLevel: {
    type: Number,
    min: 1,
    max: 5,
  },
  // Speaking (1-5 scale)
  speakingSkillsLevel: {
    type: Number,
    min: 1,
    max: 5,
  },
  // Writing (1-5 scale)
  writingSkillsLevel: {
    type: Number,
    min: 1,
    max: 5,
  },
  // Support Areas (checkboxes)
  supportNeeds: [
    {
      type: String,
      enum: [
        "Speaking English",
        "Reading English",
        "Writing English",
        "Understanding basic instructions",
        "Key vocabulary understanding",
      ],
    },
  ],
  // Text Fields
  readingAge: {
    type: String,
    trim: true,
  },
  cat4Levels: {
    type: String,
    trim: true,
  },
  bookBandLevel: {
    type: String,
    trim: true,
  },
  phonicsLevel: {
    type: String,
    trim: true,
  },
  // Long Text Areas
  developmentAreas: {
    type: String,
    trim: true,
  },
  suggestionsForMaterials: {
    type: String,
    trim: true,
  },
  classroomSupportIdeas: {
    type: String,
    trim: true,
  },
  // Listening Assessment Part 1 specific fields (13 questions, 0-2 scoring)
  listeningAssessmentAnswers: [
    {
      questionId: Number,
      score: {
        type: Number,
        enum: [0, 1, 2],
      },
    },
  ],
  cefrLevel: {
    type: String,
    enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
  },
  // Speaking Assessment specific fields (6 questions, 0-2 scoring)
  speakingAssessmentAnswers: [
    {
      questionId: Number,
      score: {
        type: Number,
        enum: [0, 1, 2],
      },
    },
  ],
  // Reading Assessment specific field
  readingScore: {
    type: String,
  },
  readingNotes: {
    type: String,
    trim: true,
  },
  // Writing Assessment specific field
  writingScore: {
    type: String,
  },
  writingNotes: {
    type: String,
    trim: true,
  },
  studentWriting: {
    type: String,
    trim: true,
  },
  teacherComments: {
    type: String,
    trim: true,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  level: {
    type: String,
    default: "Developing",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient teacher-scoped queries
assessmentSchema.index({ createdBy: 1, createdAt: -1 });
assessmentSchema.index({ createdBy: 1, assessmentType: 1 });
assessmentSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("Assessment", assessmentSchema);
