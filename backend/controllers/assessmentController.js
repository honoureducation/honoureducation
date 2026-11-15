const mongoose = require("mongoose");
const Assessment = require("../models/Assessment");
const User = require("../models/User");

const DEMO_ASSESSMENTS = [
  {
    _id: "demo-assessment-1",
    assessmentType: "Speaking Assessment",
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
    studentName: "Emma Watson",
    yearGroupAndClass: "Year 7C",
    teacherName: "Demo Teacher",
    totalScore: 12,
    cefrLevel: "B1",
    level: "B1",
    term: "T1",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
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
    const {
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
      term,
    } = req.body;

    // Validate required fields
    if (!email || !studentName || !yearGroupAndClass) {
      return res.status(400).json({
        error: "Missing required fields: email, studentName, yearGroupAndClass",
      });
    }

    // Get the authenticated teacher's ID for ownership tracking
    const createdBy = req.userId || null;

    // Handle Speaking Assessment (Secondary and Primary FS1, FS2 - KG1)
    if (
      assessmentType === "Speaking Assessment" ||
      assessmentType === "FS1 Speaking Assessment" ||
      assessmentType === "FS2 - KG1 Speaking Assessment" ||
      assessmentType === "FS2 Speaking Assessment"
    ) {
      if (!speakingAssessmentAnswers || !cefrLevel) {
        return res
          .status(400)
          .json({ error: "Missing speaking assessment data" });
      }

      const assessment = new Assessment({
        assessmentType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        speakingAssessmentAnswers,
        cefrLevel,
        level: cefrLevel,
        totalScore: totalScore || 0,
        term: term || "T1",
        createdBy,
      });

      const saved = await saveAssessmentRecord(assessment, {
        assessmentType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        speakingAssessmentAnswers,
        cefrLevel,
        level: cefrLevel,
        totalScore: totalScore || 0,
        term: term || "T1",
        createdBy,
      });
      return res.status(201).json({
        message: "Speaking Assessment saved successfully",
        assessment: saved,
      });
    }

    // Handle Reading Assessment (Secondary and Primary FS1, FS2 - KG1)
    if (
      assessmentType === "Reading Assessment" ||
      assessmentType === "FS1 Reading Assessment" ||
      assessmentType === "FS2 - KG1 Reading Assessment" ||
      assessmentType === "FS2 Reading Assessment"
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

      const assessment = new Assessment({
        assessmentType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        readingScore: finalReadingScore,
        cefrLevel: cefrLevel || finalReadingScore,
        level: finalReadingScore,
        totalScore: calculatedReadingTotal,
        term: term || "T1",
        createdBy,
      });

      const saved = await saveAssessmentRecord(assessment, {
        assessmentType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        readingScore: finalReadingScore,
        cefrLevel: cefrLevel || finalReadingScore,
        level: finalReadingScore,
        totalScore: calculatedReadingTotal,
        term: term || "T1",
        createdBy,
        itemsEvaluated: req.body.itemsEvaluated,
        teachingFocus: req.body.teachingFocus,
      });
      return res.status(201).json({
        message: "Reading Assessment saved successfully",
        assessment: saved,
      });
    }

    // Handle Writing Assessment (Secondary and Primary FS1, FS2 - KG1)
    if (
      assessmentType === "Writing Assessment" ||
      assessmentType === "FS1 Writing Assessment" ||
      assessmentType === "FS2 - KG1 Writing Assessment" ||
      assessmentType === "FS2 Writing Assessment"
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
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        level: finalWritingScore || "Developing",
        cefrLevel: cefrLevel || finalWritingScore || "Developing",
        totalScore: calculatedWritingTotal,
        term: term || "T1",
        createdBy,
      };

      // Only add writingScore if it exists
      if (finalWritingScore) {
        assessmentData.writingScore = finalWritingScore;
      }

      // Only add studentWriting if it exists
      if (studentWriting) {
        assessmentData.studentWriting = studentWriting;
      }

      // Add notes if provided
      if (writingNotes || req.body.teachingFocus || req.body.notes) {
        assessmentData.writingNotes =
          writingNotes || req.body.teachingFocus || req.body.notes;
      }

      const assessment = new Assessment(assessmentData);
      const saved = await saveAssessmentRecord(assessment, {
        ...assessmentData,
        detailedResponses: req.body.detailedResponses,
        keyWordsUsed: req.body.keyWordsUsed,
        formationQuality: req.body.formationQuality,
        pencilGrip: req.body.pencilGrip,
        fs2WritingAnswers: req.body.fs2WritingAnswers,
        detectedKeywords: req.body.detectedKeywords,
        aiKeywordsDetected: req.body.aiKeywordsDetected,
        teachingFocus: req.body.teachingFocus,
      });
      return res.status(201).json({
        message: "Writing Assessment saved successfully",
        assessment: saved,
      });
    }

    // Handle Listening Assessment (Part 1, Part 2, and Primary FS1, FS2, KG2/Year 1)
    if (
      assessmentType === "Listening Part 1" ||
      assessmentType === "Listening Part 2" ||
      assessmentType === "FS1 Listening Assessment" ||
      assessmentType === "FS2 - KG1 Listening Assessment" ||
      assessmentType === "FS2 Listening Assessment" ||
      assessmentType === "KG2 / Year 1 Listening Assessment" ||
      assessmentType === "KG2 Listening Assessment" ||
      assessmentType === "Year 1 Listening Assessment"
    ) {
      if (!listeningAssessmentAnswers || !cefrLevel) {
        return res
          .status(400)
          .json({ error: "Missing listening assessment data" });
      }

      const assessment = new Assessment({
        assessmentType,
        yearGroupType,
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        listeningAssessmentAnswers,
        cefrLevel,
        level: cefrLevel,
        totalScore: totalScore || 0,
        term: term || "T1",
        createdBy,
      });

      const saved = await saveAssessmentRecord(assessment, {
        assessmentType,
        yearGroupType,
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        listeningAssessmentAnswers,
        cefrLevel,
        level: cefrLevel,
        totalScore: totalScore || 0,
        term: term || "T1",
        createdBy,
      });
      return res.status(201).json({
        message: `${assessmentType} saved successfully`,
        assessment: saved,
      });
    }

    // Handle Phonic Assessment (Primary FS1, FS2 - KG1)
    if (
      assessmentType === "FS1 Phonic Assessment" ||
      assessmentType === "FS2 - KG1 Phonic Assessment" ||
      assessmentType === "FS2 Phonic Assessment"
    ) {
      if (!cefrLevel) {
        return res
          .status(400)
          .json({ error: "Missing CEFR Level for Phonic Assessment" });
      }

      const assessment = new Assessment({
        assessmentType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        cefrLevel,
        level: cefrLevel,
        totalScore: typeof totalScore === "number" ? totalScore : 0,
        term: term || "T1",
        createdBy,
      });

      const saved = await saveAssessmentRecord(assessment, {
        assessmentType,
        yearGroupType: yearGroupType || "junior",
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        cefrLevel,
        level: cefrLevel,
        totalScore: typeof totalScore === "number" ? totalScore : 0,
        term: term || "T1",
        createdBy,
        phase2Sets: req.body.phase2Sets,
        phase3Sets: req.body.phase3Sets,
        graphemesNeedingRevisit: req.body.graphemesNeedingRevisit,
        notes: req.body.notes,
      });
      return res.status(201).json({
        message: "FS1 Phonic Assessment saved successfully",
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

    const assessment = new Assessment({
      assessmentType,
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
      level: ealLevel,
      term: term || "T1",
      createdBy,
    });

    const saved = await saveAssessmentRecord(assessment, {
      assessmentType,
      email,
      studentName,
      yearGroupAndClass,
      teacherName,
      totalScore: ealTotalScore,
      level: ealLevel,
      term: term || "T1",
      createdBy,
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
