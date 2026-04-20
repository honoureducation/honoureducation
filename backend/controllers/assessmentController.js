const Assessment = require('../models/Assessment');

// Function to calculate level based on overall skills
const calculateLevel = (skillsData) => {
  const skillLevels = [
    skillsData.listeningSkillsLevel,
    skillsData.readingSkillsLevel,
    skillsData.speakingSkillsLevel,
    skillsData.writingSkillsLevel
  ].filter(level => level); // Filter out empty values

  if (skillLevels.length === 0) return 'Developing';

  const average = skillLevels.reduce((a, b) => a + b, 0) / skillLevels.length;

  if (average <= 1.5) return 'Beginner';
  if (average <= 3.5) return 'Developing';
  if (average <= 4) return 'Competent';
  return 'Advanced';
};

// Create new assessment
exports.createAssessment = async (req, res) => {
  try {
    const {
      assessmentType = 'EAL & ELL',
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
      // Writing Assessment fields
      writingScore,
      writingNotes,
      cefrLevel,
      level,
      totalScore
    } = req.body;

    // Validate required fields
    if (!email || !studentName || !yearGroupAndClass) {
      return res.status(400).json({ error: 'Missing required fields: email, studentName, yearGroupAndClass' });
    }

    // Handle Speaking Assessment
    if (assessmentType === 'Speaking Assessment') {
      if (!speakingAssessmentAnswers || !cefrLevel) {
        return res.status(400).json({ error: 'Missing speaking assessment data' });
      }

      const assessment = new Assessment({
        assessmentType,
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        speakingAssessmentAnswers,
        cefrLevel,
        level: cefrLevel,
        totalScore: totalScore || 0
      });

      await assessment.save();
      return res.status(201).json({
        message: 'Speaking Assessment saved successfully',
        assessment
      });
    }

    // Handle Reading Assessment
    if (assessmentType === 'Reading Assessment') {
      if (!readingScore) {
        return res.status(400).json({ error: 'Missing reading score' });
      }

      const assessment = new Assessment({
        assessmentType,
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        readingScore,
        level: readingScore,
        totalScore: ['A', 'B', 'C', 'D', 'E'].indexOf(readingScore)
      });

      await assessment.save();
      return res.status(201).json({
        message: 'Reading Assessment saved successfully',
        assessment
      });
    }

    // Handle Writing Assessment
    if (assessmentType === 'Writing Assessment') {
      if (!writingScore) {
        return res.status(400).json({ error: 'Missing writing score' });
      }

      const assessment = new Assessment({
        assessmentType,
        email,
        studentName,
        yearGroupAndClass,
        teacherName,
        writingScore,
        writingNotes,
        level: writingScore,
        totalScore: ['A', 'B', 'C', 'D', 'E'].indexOf(writingScore)
      });

      await assessment.save();
      return res.status(201).json({
        message: 'Writing Assessment saved successfully',
        assessment
      });
    }

    // Handle Listening Assessment (Part 1 and Part 2)
    if (assessmentType === 'Listening Part 1' || assessmentType === 'Listening Part 2') {
      if (!listeningAssessmentAnswers || !cefrLevel) {
        return res.status(400).json({ error: 'Missing listening assessment data' });
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
        totalScore: totalScore || 0
      });

      await assessment.save();
      return res.status(201).json({
        message: `${assessmentType} saved successfully`,
        assessment
      });
    }

    // Handle EAL & ELL Assessment
    const skillLevels = [
      listeningSkillsLevel,
      readingSkillsLevel,
      speakingSkillsLevel,
      writingSkillsLevel
    ].filter(level => level).map(Number);

    const ealTotalScore = skillLevels.reduce((a, b) => a + b, 0);

    const ealLevel = calculateLevel({
      listeningSkillsLevel: Number(listeningSkillsLevel),
      readingSkillsLevel: Number(readingSkillsLevel),
      speakingSkillsLevel: Number(speakingSkillsLevel),
      writingSkillsLevel: Number(writingSkillsLevel)
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
      listeningSkillsLevel: listeningSkillsLevel ? Number(listeningSkillsLevel) : null,
      readingSkillsLevel: readingSkillsLevel ? Number(readingSkillsLevel) : null,
      speakingSkillsLevel: speakingSkillsLevel ? Number(speakingSkillsLevel) : null,
      writingSkillsLevel: writingSkillsLevel ? Number(writingSkillsLevel) : null,
      supportNeeds,
      readingAge,
      cat4Levels,
      bookBandLevel,
      phonicsLevel,
      developmentAreas,
      suggestionsForMaterials,
      classroomSupportIdeas,
      totalScore: ealTotalScore,
      level: ealLevel
    });

    await assessment.save();

    res.status(201).json({
      message: 'EAL & ELL assessment saved successfully',
      assessment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all assessments
exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single assessment by ID
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
