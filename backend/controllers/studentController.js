const Student = require('../models/Student');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const ActivityLog = require('../models/ActivityLog');
const ExcelJS = require('exceljs');

// Create new student
const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      studentId,
      yearGroup,
      class: studentClass,
      academicYear,
      dateOfBirth,
      gender,
      nationality,
      nativeLanguage,
      otherLanguages,
      englishLearningStartDate,
      previousSchools,
      parentContact,
      notes,
      specialNeeds,
      learningSupport
    } = req.body;

    // Get user's school
    const user = await User.findById(req.userId);
    if (!user.school) {
      return res.status(400).json({ message: 'User is not associated with a school' });
    }

    // Check if student ID already exists in this school
    const existingStudent = await Student.findOne({ 
      school: user.school, 
      studentId 
    });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists in this school' });
    }

    const student = new Student({
      firstName,
      lastName,
      studentId,
      school: user.school,
      yearGroup,
      class: studentClass,
      academicYear,
      dateOfBirth,
      gender,
      nationality,
      nativeLanguage,
      otherLanguages,
      englishLearningStartDate,
      previousSchools,
      parentContact,
      notes,
      specialNeeds,
      learningSupport,
      createdBy: req.userId
    });

    await student.save();

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: user.school,
      action: 'student_created',
      targetType: 'student',
      targetId: student._id,
      targetName: student.fullName,
      description: `Created new student: ${student.fullName} (${student.studentId})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
};

// Get students (filtered by user's school)
const getStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      yearGroup, 
      class: studentClass, 
      status, 
      search 
    } = req.query;

    // Get user's school
    const user = await User.findById(req.userId);
    if (!user.school) {
      return res.status(400).json({ message: 'User is not associated with a school' });
    }

    const query = { school: user.school };
    if (yearGroup) query.yearGroup = yearGroup;
    if (studentClass) query.class = studentClass;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user's school
    const user = await User.findById(req.userId);
    
    const student = await Student.findOne({ 
      _id: id, 
      school: user.school 
    })
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName')
    .populate('school', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: user.school,
      action: 'student_viewed',
      targetType: 'student',
      targetId: student._id,
      targetName: student.fullName,
      description: `Viewed student profile: ${student.fullName}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Failed to fetch student', error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get user's school
    const user = await User.findById(req.userId);

    // Don't allow updating certain fields
    delete updates.school;
    delete updates.createdBy;
    delete updates.createdAt;
    updates.updatedBy = req.userId;

    const student = await Student.findOneAndUpdate(
      { _id: id, school: user.school },
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: user.school,
      action: 'student_updated',
      targetType: 'student',
      targetId: student._id,
      targetName: student.fullName,
      description: `Updated student: ${student.fullName}`,
      metadata: updates,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('Student update error:', error);
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user's school
    const user = await User.findById(req.userId);

    const student = await Student.findOne({ _id: id, school: user.school });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student has assessments
    const assessmentCount = await Assessment.countDocuments({ student: id });
    if (assessmentCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete student with existing assessments',
        assessmentCount 
      });
    }

    await Student.findByIdAndDelete(id);

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: user.school,
      action: 'student_deleted',
      targetType: 'student',
      targetId: id,
      targetName: student.fullName,
      description: `Deleted student: ${student.fullName} (${student.studentId})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Student deletion error:', error);
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
};

// Get student assessments
const getStudentAssessments = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user's school
    const user = await User.findById(req.userId);

    // Verify student belongs to user's school
    const student = await Student.findOne({ _id: id, school: user.school });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const assessments = await Assessment.find({ student: id })
      .populate('assessedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ assessments });
  } catch (error) {
    console.error('Get student assessments error:', error);
    res.status(500).json({ message: 'Failed to fetch student assessments', error: error.message });
  }
};

// Bulk import students
const bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    
    // Get user's school
    const user = await User.findById(req.userId);
    if (!user.school) {
      return res.status(400).json({ message: 'User is not associated with a school' });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const studentData of students) {
      try {
        // Check if student ID already exists
        const existingStudent = await Student.findOne({ 
          school: user.school, 
          studentId: studentData.studentId 
        });
        
        if (existingStudent) {
          results.failed++;
          results.errors.push({
            studentId: studentData.studentId,
            error: 'Student ID already exists'
          });
          continue;
        }

        const student = new Student({
          ...studentData,
          school: user.school,
          createdBy: req.userId
        });

        await student.save();
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          studentId: studentData.studentId,
          error: error.message
        });
      }
    }

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: user.school,
      action: 'student_created',
      targetType: 'student',
      description: `Bulk imported students: ${results.successful} successful, ${results.failed} failed`,
      metadata: results,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Bulk import completed',
      results
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: 'Failed to import students', error: error.message });
  }
};

// Export students to Excel with teaching recommendations
const exportStudentsToExcel = async (req, res) => {
  try {
    // Get user's school
    const user = await User.findById(req.userId).populate('school', 'name code');
    if (!user.school) {
      return res.status(400).json({ message: 'User is not associated with a school' });
    }

    // Get all students with their assessments
    const students = await Student.find({ school: user.school })
      .populate('school', 'name code')
      .sort({ yearGroup: 1, class: 1, lastName: 1, firstName: 1 });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Assessment Report');

    // Set up headers
    worksheet.columns = [
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Year Group', key: 'yearGroup', width: 12 },
      { header: 'Class', key: 'class', width: 10 },
      { header: 'Listening Level', key: 'listeningLevel', width: 15 },
      { header: 'Speaking Level', key: 'speakingLevel', width: 15 },
      { header: 'Reading Level', key: 'readingLevel', width: 15 },
      { header: 'Writing Level', key: 'writingLevel', width: 15 },
      { header: 'Overall Level', key: 'overallLevel', width: 15 },
      { header: 'Last Assessment', key: 'lastAssessment', width: 15 },
      { header: 'Teaching Recommendations', key: 'recommendations', width: 50 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };

    // Add data rows
    for (const student of students) {
      // Get latest assessments for each skill
      const assessments = await Assessment.find({ student: student._id })
        .sort({ createdAt: -1 });

      const latestAssessments = {
        listening: assessments.find(a => a.skillType === 'listening'),
        speaking: assessments.find(a => a.skillType === 'speaking'),
        reading: assessments.find(a => a.skillType === 'reading'),
        writing: assessments.find(a => a.skillType === 'writing')
      };

      // Generate teaching recommendations based on levels
      const recommendations = generateTeachingRecommendations(latestAssessments);

      worksheet.addRow({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        yearGroup: student.yearGroup,
        class: student.class,
        listeningLevel: latestAssessments.listening?.overallLevel || 'Not Assessed',
        speakingLevel: latestAssessments.speaking?.overallLevel || 'Not Assessed',
        readingLevel: latestAssessments.reading?.overallLevel || 'Not Assessed',
        writingLevel: latestAssessments.writing?.overallLevel || 'Not Assessed',
        overallLevel: student.assessmentSummary?.currentLevel?.overall || 'Not Assessed',
        lastAssessment: student.assessmentSummary?.lastAssessmentDate 
          ? new Date(student.assessmentSummary.lastAssessmentDate).toLocaleDateString()
          : 'Never',
        recommendations: recommendations
      });
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column.key !== 'recommendations') {
        column.width = Math.max(column.width, 12);
      }
    });

    // Add school information at the top
    worksheet.insertRow(1, []);
    worksheet.insertRow(1, [`School: ${user.school.name} (${user.school.code})`]);
    worksheet.insertRow(1, [`Student Assessment Report - Generated on ${new Date().toLocaleDateString()}`]);
    worksheet.insertRow(1, []);

    // Merge cells for title
    worksheet.mergeCells('A1:L1');
    worksheet.mergeCells('A2:L2');

    // Style title rows
    worksheet.getRow(1).font = { size: 16, bold: true };
    worksheet.getRow(2).font = { size: 12, bold: true };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="student-assessment-report-${user.school.code}-${Date.now()}.xlsx"`);

    // Write to response
    await workbook.xlsx.write(res);

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: user.school._id,
      action: 'data_exported',
      targetType: 'student',
      description: `Exported student assessment report (${students.length} students)`,
      metadata: { studentCount: students.length, format: 'excel' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Failed to export data', error: error.message });
  }
};

// Helper function to generate teaching recommendations
const generateTeachingRecommendations = (assessments) => {
  const recommendations = [];
  
  // Check each skill area
  Object.entries(assessments).forEach(([skill, assessment]) => {
    if (!assessment) {
      recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Needs initial assessment`);
      return;
    }

    const level = assessment.overallLevel;
    const scores = assessment.scores;

    switch (level) {
      case 'Pre-A1':
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Focus on basic vocabulary and simple phrases. Use visual aids and repetition.`);
        break;
      case 'A1':
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Build on basic skills with simple conversations and familiar topics.`);
        break;
      case 'A2':
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Expand vocabulary and introduce more complex sentence structures.`);
        break;
      case 'B1':
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Practice with authentic materials and real-world scenarios.`);
        break;
      case 'B2':
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Focus on fluency and accuracy in complex situations.`);
        break;
      case 'C1':
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Advanced practice with nuanced language and critical thinking.`);
        break;
      case 'C2':
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Maintain proficiency with challenging academic and professional materials.`);
        break;
      default:
        recommendations.push(`${skill.charAt(0).toUpperCase() + skill.slice(1)}: Review assessment results and provide targeted support.`);
    }
  });

  return recommendations.join(' | ');
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentAssessments,
  bulkImportStudents,
  exportStudentsToExcel
};