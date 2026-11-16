const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    assessmentType: {
      type: String,
      default: "EAL & ELL",
      required: true,
      trim: true,
    },
    schoolTier: {
      type: String,
      enum: ["primary", "secondary"],
      default: function () {
        const type = (this.assessmentType || "").toLowerCase();
        const yg = (this.yearGroupAndClass || "").toLowerCase();
        if (
          type.includes("fs") ||
          type.includes("kg") ||
          type.includes("phonic") ||
          type.startsWith("primary") ||
          type.includes("year 1") ||
          type.includes("year 2") ||
          type.includes("year 3") ||
          type.includes("year 4") ||
          type.includes("year 5") ||
          type.includes("year 6") ||
          type.includes("grade 1") ||
          type.includes("grade 2") ||
          type.includes("grade 3") ||
          type.includes("grade 4") ||
          type.includes("grade 5") ||
          type.includes("grade 6") ||
          yg.includes("fs") ||
          yg.includes("kg") ||
          yg.includes("year 1") ||
          yg.includes("year 2") ||
          yg.includes("year 3") ||
          yg.includes("year 4") ||
          yg.includes("year 5") ||
          yg.includes("year 6") ||
          yg.includes("grade 1") ||
          yg.includes("grade 2") ||
          yg.includes("grade 3") ||
          yg.includes("grade 4") ||
          yg.includes("grade 5") ||
          yg.includes("grade 6")
        ) {
          return "primary";
        }
        return "secondary";
      },
    },
    skillType: {
      type: String,
      enum: ["listening", "speaking", "reading", "writing", "phonic", "general"],
      default: function () {
        const t = (this.assessmentType || "").toLowerCase();
        if (t.includes("listen")) return "listening";
        if (t.includes("speak")) return "speaking";
        if (t.includes("read")) return "reading";
        if (t.includes("write") || t.includes("writing")) return "writing";
        if (t.includes("phonic")) return "phonic";
        return "general";
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
  // Listening Assessment fields (Secondary Part 1/2 & Primary FS1 to Grade 4)
  listeningAssessmentAnswers: [
    {
      questionId: mongoose.Schema.Types.Mixed,
      question: String,
      studentResponse: String,
      score: mongoose.Schema.Types.Mixed,
      acceptable: Boolean,
      notes: String,
    },
  ],
  cefrLevel: {
    type: String,
    trim: true,
  },
  // Speaking Assessment fields (Secondary Junior/Senior & Primary FS1 to Grade 4)
  speakingAssessmentAnswers: [
    {
      questionId: mongoose.Schema.Types.Mixed,
      question: String,
      studentResponse: String,
      score: mongoose.Schema.Types.Mixed,
      notes: String,
      acceptable: Boolean,
    },
  ],
  // Reading Assessment specific fields
  readingScore: {
    type: String,
  },
  readingNotes: {
    type: String,
    trim: true,
  },
  itemsEvaluated: [mongoose.Schema.Types.Mixed],
  // Writing Assessment specific fields
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
  formationQuality: {
    type: String,
    trim: true,
  },
  pencilGrip: {
    type: String,
    trim: true,
  },
  keyWordsUsed: [{ type: String, trim: true }],
  keywordsUsed: [{ type: String, trim: true }],
  detailedResponses: [mongoose.Schema.Types.Mixed],
  fs2WritingAnswers: [mongoose.Schema.Types.Mixed],
  writingAnswers: [mongoose.Schema.Types.Mixed],
  detectedKeywords: [{ type: String, trim: true }],
  aiKeywordsDetected: [{ type: String, trim: true }],
  // Phonics Assessment specific fields
  phase2Sets: [mongoose.Schema.Types.Mixed],
  phase3Sets: [mongoose.Schema.Types.Mixed],
  phase4Sets: [mongoose.Schema.Types.Mixed],
  phase5Sets: [mongoose.Schema.Types.Mixed],
  graphemesNeedingRevisit: [{ type: String, trim: true }],
  wordsNeedingRevisit: [{ type: String, trim: true }],
  // Common notes, recommendations, and scoring
  teachingFocus: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  comments: {
    type: String,
    trim: true,
  },
  teacherComments: {
    type: String,
    trim: true,
  },
  score: {
    type: mongoose.Schema.Types.Mixed,
  },
  recommendedLevel: {
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
}, { strict: false });

// Index for efficient teacher-scoped and tier-scoped queries
assessmentSchema.index({ createdBy: 1, createdAt: -1 });
assessmentSchema.index({ createdBy: 1, assessmentType: 1 });
assessmentSchema.index({ schoolTier: 1, createdAt: -1 });
assessmentSchema.index({ skillType: 1, createdAt: -1 });
assessmentSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("Assessment", assessmentSchema);
