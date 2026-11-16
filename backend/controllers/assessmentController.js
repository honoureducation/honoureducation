const mongoose = require("mongoose");
const Assessment = require("../models/Assessment");
const User = require("../models/User");

const DEMO_ASSESSMENTS = [
  {
    _id: "demo-assessment-1",
    assessmentType: "Speaking Assessment",
    schoolTier: "secondary",
    skillType: "speaking",
    studentName: "Alex Johnson",
    yearGroupAndClass: "Year 8A",
    teacherName: "Demo Teacher",
    totalScore: 16,
    cefrLevel: "B2",
    level: "B2",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: "demo-assessment-2",
    assessmentType: "Reading Assessment",
    schoolTier: "secondary",
    skillType: "reading",
    studentName: "Sophia Lee",
    yearGroupAndClass: "Year 8A",
    teacherName: "Demo Teacher",
    totalScore: 14,
    cefrLevel: "B1",
    level: "B1",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: "demo-assessment-3",
    assessmentType: "Writing Assessment",
    schoolTier: "secondary",
    skillType: "writing",
    studentName: "Marcus Brown",
    yearGroupAndClass: "Year 9B",
    teacherName: "Demo Teacher",
    totalScore: 18,
    cefrLevel: "C1",
    level: "C1",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    _id: "demo-assessment-4",
    assessmentType: "Listening Part 1",
    schoolTier: "secondary",
    skillType: "listening",
    studentName: "Emma Watson",
    yearGroupAndClass: "Year 7C",
    teacherName: "Demo Teacher",
    totalScore: 12,
    cefrLevel: "B1",
    level: "B1",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  // Primary Demo Assessments
  {
    _id: "demo-prim-1",
    assessmentType: "Grade 4 / Year 5 Writing Assessment",
    schoolTier: "primary",
    skillType: "writing",
    studentName: "Liam Chen",
    yearGroupAndClass: "Grade 4 / Year 5",
    teacherName: "Demo Teacher",
    totalScore: 8,
    cefrLevel: "B2–C1",
    level: "B2–C1",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: "demo-prim-2",
    assessmentType: "Grade 3 / Year 4 Reading Assessment",
    schoolTier: "primary",
    skillType: "reading",
    studentName: "Maya Patel",
    yearGroupAndClass: "Grade 3 / Year 4",
    teacherName: "Demo Teacher",
    totalScore: 4,
    cefrLevel: "B1.2–B1.3",
    level: "B1.2–B1.3",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: "demo-prim-3",
    assessmentType: "Grade 2 / Year 3 Speaking Assessment",
    schoolTier: "primary",
    skillType: "speaking",
    studentName: "Noah Smith",
    yearGroupAndClass: "Grade 2 / Year 3",
    teacherName: "Demo Teacher",
    totalScore: 3,
    cefrLevel: "A2.3–B1.1",
    level: "A2.3–B1.1",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    _id: "demo-prim-4",
    assessmentType: "Grade 1 / Year 2 Listening Assessment",
    schoolTier: "primary",
    skillType: "listening",
    studentName: "Olivia Brown",
    yearGroupAndClass: "Grade 1 / Year 2",
    teacherName: "Demo Teacher",
    totalScore: 5,
    cefrLevel: "A2.0–A2.2",
    level: "A2.0–A2.2",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    _id: "demo-prim-5",
    assessmentType: "KG2 / Year 1 Phonics Assessment (Phase 4 & 5)",
    schoolTier: "primary",
    skillType: "phonic",
    studentName: "Ethan Wilson",
    yearGroupAndClass: "KG2 / Year 1",
    teacherName: "Demo Teacher",
    totalScore: 28,
    cefrLevel: "Secure",
    level: "Secure",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

// Function to calculate level based on overall skills
const calculateLevel = (skillsData) => {
  const skillLevels = [
    skillsData.listeningSkillsLevel,
    skillsData.readingSkillsLevel,
    skillsData.speakingSkillsLevel,
    skillsData.writingSkillsLevel,
  ].filter((level) => level); // Filter out empty values

  if (skillLevels.length === 0) return "Developing";

  const average = skillLevels.reduce((a, b) => a + b, 0) / skillLevels.length;

  if (average <= 1.5) return "Beginner";
  if (average <= 3.5) return "Developing";
  if (average <= 4) return "Competent";
  return "Advanced";
};

// Helper: Check if the current user is an admin
const isAdmin = (user) => {
  return (
    user && (user.role === "platform_admin" || user.role === "school_admin")
  );
};

// Helper: Save assessment to DB or memory demo store if MongoDB is offline
const saveAssessmentRecord = async (assessmentInstance, rawPayload) => {
  if (mongoose.connection.readyState !== 1) {
    const mockRecord = {
      _id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(assessmentInstance &&
      typeof assessmentInstance.toObject === "function"
        ? assessmentInstance.toObject()
        : rawPayload),
    };
    DEMO_ASSESSMENTS.unshift(mockRecord);
    return mockRecord;
  }
  await assessmentInstance.save();
  return assessmentInstance;
};

// Create new assessment
exports.createAssessment = async (req, res) => {
  try {
    let {
      schoolTier,
      skillType,
      assessmentType = "EAL & ELL",
      yearGroupType, // 'junior' or 'senior' for Listening Part 2
      email,
      studentName,
      yearGroupAndClass,
      teacherName,
      // EAL & ELL fields
      respondToGreeting,
      followSimpleInstructions,
      englishLanguageSupport,
      listeningSkillsLevel,
      readingSkillsLevel,
      speakingSkillsLevel,
      writingSkillsLevel,
      supportNeeds,
      readingAge,
      cat4Levels,
      bookBandLevel,
      phonicsLevel,
      developmentAreas,
      suggestionsForMaterials,
      classroomSupportIdeas,
      // Listening Assessment fields
      listeningAssessmentAnswers,
      // Speaking Assessment fields
      speakingAssessmentAnswers,
      // Reading Assessment fields
      readingScore,
      readingNotes,
      // Writing Assessment fields
      writingScore,
      writingNotes,
      studentWriting,
      cefrLevel,
      level,
      totalScore,
      score,
      term,
    } = req.body;

    // Validate required fields
    if (!email || !studentName || !yearGroupAndClass) {
      return res.status(400).json({
        error: "Missing required fields: email, studentName, yearGroupAndClass",
      });
    }

    // Auto-detect schoolTier if not provided
    if (!schoolTier) {
      const type = (assessmentType || "").toLowerCase();
      const yg = (yearGroupAndClass || "").toLowerCase();
      if (
        type.includes("fs") ||
        type.includes("kg") ||
        type.includes("primary") ||
        type.includes("phonic") ||
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
        schoolTier = "primary";
      } else {
        schoolTier = "secondary";
      }
    }

    // Auto-detect skillType if not provided
    if (!skillType) {
      const type = (assessmentType || "").toLowerCase();
      if (type.includes("listen")) skillType = "listening";
      else if (type.includes("speak")) skillType = "speaking";
      else if (type.includes("read")) skillType = "reading";
      else if (type.includes("write") || type.includes("writing")) skillType = "writing";
      else if (type.includes("phonic")) skillType = "phonic";
      else skillType = "general";
    }

    // Get the authenticated teacher's ID for ownership tracking
    const createdBy = req.userId || null;

    // Handle Speaking Assessment (Secondary and Primary FS1, FS2, KG2, Grade 1 to Grade 4)
    if (
      assessmentType === "Speaking Assessment" ||
      assessmentType.includes("Speaking")
    ) {
      if (!speakingAssessmentAnswers || !cefrLevel) {
        return res
          .status(400)
          .json({ error: "Missing speaking assessment data" });
      }

      const assessmentData = {
        assessmentType,
        schoolTier,
        skillType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        speakingAssessmentAnswers,
        cefrLevel,
        level: level || cefrLevel,
        totalScore: totalScore || 0,
        score: score || totalScore || 0,
        term: term || "T1",
        createdBy,
        keywordsUsed: req.body.keywordsUsed || req.body.keyWordsUsed || [],
        keyWordsUsed: req.body.keyWordsUsed || req.body.keywordsUsed || [],
        teacherComments: req.body.teacherComments || req.body.comments || "",
        comments: req.body.comments || req.body.teacherComments || "",
        notes: req.body.notes || req.body.teachingFocus || "",
        teachingFocus: req.body.teachingFocus || "",
      };

      const assessment = new Assessment(assessmentData);
      const saved = await saveAssessmentRecord(assessment, assessmentData);
      return res.status(201).json({
        message: "Speaking Assessment saved successfully",
        assessment: saved,
      });
    }

    // Handle Reading Assessment (Secondary and Primary FS1, FS2, KG2, Grade 1 to Grade 4)
    if (
      assessmentType === "Reading Assessment" ||
      assessmentType.includes("Reading")
    ) {
      const finalReadingScore = readingScore || cefrLevel;
      if (!finalReadingScore) {
        return res.status(400).json({ error: "Missing reading score" });
      }

      const calculatedReadingTotal =
        typeof totalScore === "number" && totalScore >= 0
          ? totalScore
          : ["A", "B", "C", "D", "E"].indexOf(finalReadingScore) !== -1
            ? ["A", "B", "C", "D", "E"].indexOf(finalReadingScore)
            : 0;

      const assessmentData = {
        assessmentType,
        schoolTier,
        skillType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        readingScore: finalReadingScore,
        cefrLevel: cefrLevel || finalReadingScore,
        level: finalReadingScore,
        totalScore: calculatedReadingTotal,
        score: score || calculatedReadingTotal,
        term: term || "T1",
        createdBy,
        readingNotes: readingNotes || req.body.notes || req.body.teachingFocus || "",
        notes: req.body.notes || req.body.teachingFocus || "",
        itemsEvaluated: req.body.itemsEvaluated || [],
        teachingFocus: req.body.teachingFocus || "",
        recommendedLevel: req.body.recommendedLevel || "",
      };

      const assessment = new Assessment(assessmentData);
      const saved = await saveAssessmentRecord(assessment, assessmentData);
      return res.status(201).json({
        message: "Reading Assessment saved successfully",
        assessment: saved,
      });
    }

    // Handle Writing Assessment (Secondary and Primary FS1, FS2, KG2, Grade 1 to Grade 4)
    if (
      assessmentType === "Writing Assessment" ||
      assessmentType.includes("Writing")
    ) {
      const finalWritingScore = writingScore || cefrLevel;
      // Accept either writingScore, studentWriting, or cefrLevel
      if (!finalWritingScore && !studentWriting) {
        return res
          .status(400)
          .json({ error: "Missing writing score or student writing" });
      }

      const calculatedWritingTotal =
        typeof totalScore === "number" && totalScore >= 0
          ? totalScore
          : finalWritingScore &&
              ["A", "B", "C", "D", "E"].indexOf(finalWritingScore) !== -1
            ? ["A", "B", "C", "D", "E"].indexOf(finalWritingScore)
            : 0;

      const assessmentData = {
        assessmentType,
        schoolTier,
        skillType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        level: finalWritingScore || "Developing",
        cefrLevel: cefrLevel || finalWritingScore || "Developing",
        totalScore: calculatedWritingTotal,
        score: score || calculatedWritingTotal,
        term: term || "T1",
        createdBy,
        writingScore: finalWritingScore,
        studentWriting: studentWriting || req.body.studentWriting || "",
        writingNotes: writingNotes || req.body.teachingFocus || req.body.notes || "",
        notes: req.body.notes || req.body.teachingFocus || "",
        detailedResponses: req.body.detailedResponses || [],
        keyWordsUsed: req.body.keyWordsUsed || req.body.keywordsUsed || [],
        keywordsUsed: req.body.keywordsUsed || req.body.keyWordsUsed || [],
        formationQuality: req.body.formationQuality || "",
        pencilGrip: req.body.pencilGrip || "",
        fs2WritingAnswers: req.body.fs2WritingAnswers || req.body.writingAnswers || [],
        writingAnswers: req.body.writingAnswers || req.body.fs2WritingAnswers || [],
        detectedKeywords: req.body.detectedKeywords || req.body.aiKeywordsDetected || [],
        aiKeywordsDetected: req.body.aiKeywordsDetected || req.body.detectedKeywords || [],
        teachingFocus: req.body.teachingFocus || "",
        recommendedLevel: req.body.recommendedLevel || "",
      };

      const assessment = new Assessment(assessmentData);
      const saved = await saveAssessmentRecord(assessment, assessmentData);
      return res.status(201).json({
        message: "Writing Assessment saved successfully",
        assessment: saved,
      });
    }

    // Handle Listening Assessment (Part 1, Part 2, and Primary FS1, FS2, KG2, Grade 1 to Grade 4)
    if (assessmentType.includes("Listening")) {
      if (!listeningAssessmentAnswers || !cefrLevel) {
        return res
          .status(400)
          .json({ error: "Missing listening assessment data" });
      }

      const assessmentData = {
        assessmentType,
        schoolTier,
        skillType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        listeningAssessmentAnswers,
        cefrLevel,
        level: level || cefrLevel,
        totalScore: totalScore || 0,
        score: score || totalScore || 0,
        term: term || "T1",
        createdBy,
        notes: req.body.notes || "",
        recommendedLevel: req.body.recommendedLevel || "",
      };

      const assessment = new Assessment(assessmentData);
      const saved = await saveAssessmentRecord(assessment, assessmentData);
      return res.status(201).json({
        message: `${assessmentType} saved successfully`,
        assessment: saved,
      });
    }

    // Handle Phonic Assessment (Primary FS1, FS2, KG2 / Year 1 Phase 2-5)
    if (assessmentType.includes("Phonic")) {
      if (!cefrLevel) {
        return res
          .status(400)
          .json({ error: "Missing CEFR Level for Phonic Assessment" });
      }

      const assessmentData = {
        assessmentType,
        schoolTier,
        skillType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        cefrLevel,
        level: level || cefrLevel,
        totalScore: typeof totalScore === "number" ? totalScore : 0,
        score: score || totalScore || 0,
        term: term || "T1",
        createdBy,
        phase2Sets: req.body.phase2Sets || [],
        phase3Sets: req.body.phase3Sets || [],
        phase4Sets: req.body.phase4Sets || [],
        phase5Sets: req.body.phase5Sets || [],
        graphemesNeedingRevisit: req.body.graphemesNeedingRevisit || [],
        wordsNeedingRevisit: req.body.wordsNeedingRevisit || [],
        notes: req.body.notes || "",
        recommendedLevel: req.body.recommendedLevel || "",
      };

      const assessment = new Assessment(assessmentData);
      const saved = await saveAssessmentRecord(assessment, assessmentData);
      return res.status(201).json({
        message: `${assessmentType} saved successfully`,
        assessment: saved,
      });
    }

    // Handle EAL & ELL Assessment
    const skillLevels = [
      listeningSkillsLevel,
      readingSkillsLevel,
      speakingSkillsLevel,
      writingSkillsLevel,
    ]
      .filter((level) => level)
      .map(Number);

    const ealTotalScore = skillLevels.reduce((a, b) => a + b, 0);

    const ealLevel = calculateLevel({
      listeningSkillsLevel: Number(listeningSkillsLevel),
      readingSkillsLevel: Number(readingSkillsLevel),
      speakingSkillsLevel: Number(speakingSkillsLevel),
      writingSkillsLevel: Number(writingSkillsLevel),
    });

    const assessmentData = {
      assessmentType,
      schoolTier,
      skillType: "general",
      email,
      studentName,
      yearGroupAndClass,
      teacherName,
      respondToGreeting,
      followSimpleInstructions,
      englishLanguageSupport,
      listeningSkillsLevel: listeningSkillsLevel
        ? Number(listeningSkillsLevel)
        : null,
      readingSkillsLevel: readingSkillsLevel
        ? Number(readingSkillsLevel)
        : null,
      speakingSkillsLevel: speakingSkillsLevel
        ? Number(speakingSkillsLevel)
        : null,
      writingSkillsLevel: writingSkillsLevel
        ? Number(writingSkillsLevel)
        : null,
      supportNeeds,
      readingAge,
      cat4Levels,
      bookBandLevel,
      phonicsLevel,
      developmentAreas,
      suggestionsForMaterials,
      classroomSupportIdeas,
      totalScore: ealTotalScore,
      score: ealTotalScore,
      level: ealLevel,
      term: term || "T1",
      createdBy,
    };

    const assessment = new Assessment(assessmentData);
    const saved = await saveAssessmentRecord(assessment, assessmentData);

    res.status(201).json({
      message: "EAL & ELL assessment saved successfully",
      assessment: saved,
    });

    res.status(201).json({
      message: "EAL & ELL assessment saved successfully",
      assessment: saved,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all assessments — TEACHERS only see their own, ADMINS see all
exports.getAllAssessments = async (req, res) => {
  try {
    const user = req.user;

    // Return demo assessments if database is not connected or using demo teacher account
    if (
      mongoose.connection.readyState !== 1 ||
      (user && user._id && user._id.toString() === "507f1f77bcf86cd799439011")
    ) {
      return res.status(200).json(DEMO_ASSESSMENTS);
    }

    let query = {};
    // Teachers can ONLY see assessments they created
    if (user.role === "teacher") {
      query.createdBy = req.userId;
    }
    // School admins see all assessments from teachers in their school
    else if (user.role === "school_admin") {
      const schoolTeachers = await User.find({
        school: user.school._id || user.school,
        role: "teacher",
      }).select("_id");
      const teacherIds = schoolTeachers.map((t) => t._id);
      teacherIds.push(req.userId); // Include admin's own assessments
      query.createdBy = { $in: teacherIds };
    }
    // Platform admins see everything (no filter)

    const assessments = await Assessment.find(query)
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single assessment by ID — with ownership verification
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName email",
    );

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const user = req.user;

    // Teachers can only view their own assessments
    if (user.role === "teacher") {
      if (
        !assessment.createdBy ||
        assessment.createdBy._id.toString() !== req.userId.toString()
      ) {
        return res.status(403).json({
          error: "Access denied. You can only view your own assessments.",
        });
      }
    }

    // School admins can view assessments from their school's teachers
    if (user.role === "school_admin" && assessment.createdBy) {
      const assessmentCreator = await User.findById(
        assessment.createdBy._id || assessment.createdBy,
      );
      if (
        assessmentCreator &&
        assessmentCreator.school &&
        assessmentCreator.school.toString() !==
          (user.school._id || user.school).toString()
      ) {
        return res.status(403).json({
          error: "Access denied. Assessment belongs to a different school.",
        });
      }
    }

    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete assessment — with ownership verification
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const user = req.user;

    // Teachers can only delete their own assessments
    if (user.role === "teacher") {
      if (
        !assessment.createdBy ||
        assessment.createdBy.toString() !== req.userId.toString()
      ) {
        return res.status(403).json({
          error: "Access denied. You can only delete your own assessments.",
        });
      }
    }

    // School admins can delete assessments from their school's teachers
    if (user.role === "school_admin" && assessment.createdBy) {
      const assessmentCreator = await User.findById(assessment.createdBy);
      if (
        assessmentCreator &&
        assessmentCreator.school &&
        assessmentCreator.school.toString() !==
          (user.school._id || user.school).toString()
      ) {
        return res.status(403).json({
          error: "Access denied. Assessment belongs to a different school.",
        });
      }
    }

    await Assessment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
