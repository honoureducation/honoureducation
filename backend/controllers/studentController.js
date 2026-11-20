const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const ActivityLog = require('../models/ActivityLog');
const ExcelJS = require('exceljs');

// ------------------------------------------------------------------
// Students are owned by the teacher who registers them (createdBy).
// When MongoDB is offline (demo mode) an in-memory store is used so the
// register-then-assess flow still works.
// ------------------------------------------------------------------
const OFFLINE_STUDENTS = [];
const isDbOnline = () => mongoose.connection.readyState === 1;

const PRIMARY_YEAR_HINTS = ['fs1', 'fs2', 'kg', 'grade 1', 'grade 2', 'grade 3', 'grade 4', 'grade 5', 'year 1', 'year 2', 'year 3', 'year 4', 'year 5', 'year 6'];
const detectTier = (yearGroup = '') => {
  const yg = String(yearGroup).toLowerCase();
  // Secondary year groups are Year 7–13; check those first so "Year 1x" isn't read as Year 1
  if (/year\s*(7|8|9|10|11|12|13)\b/.test(yg)) return 'secondary';
  return PRIMARY_YEAR_HINTS.some((h) => yg.includes(h)) ? 'primary' : 'secondary';
};

const generateStudentId = () =>
  `STU-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

// Normalise one incoming student (from the form or a CSV row)
const normaliseStudent = (data = {}) => {
  let firstName = String(data.firstName || '').trim();
  let lastName = String(data.lastName || '').trim();
  // Accept a single "name" / "fullName" column too
  const full = String(data.fullName || data.name || '').trim();
  if (!firstName && full) {
    const parts = full.split(/\s+/);
    firstName = parts.shift();
    lastName = parts.join(' ');
  }
  const yearGroup = String(data.yearGroup || '').trim();
  return {
    firstName,
    lastName,
    studentId: String(data.studentId || '').trim() || generateStudentId(),
    yearGroup,
    class: String(data.class || data.className || '').trim(),
    email: String(data.email || '').trim().toLowerCase() || undefined,
    tier: data.tier === 'primary' || data.tier === 'secondary' ? data.tier : detectTier(yearGroup),
    notes: data.notes,
  };
};

const validateStudent = (s) => {
  if (!s.firstName) return 'Student name is required';
  if (!s.yearGroup) return 'Year group is required';
  return null;
};

// Shape returned to the frontend (works for Mongo docs and offline objects)
const toClient = (s) => {
  const o = typeof s.toJSON === 'function' ? s.toJSON() : { ...s };
  const fullName = `${o.firstName || ''} ${o.lastName || ''}`.trim();
  return {
    ...o,
    _id: String(o._id),
    fullName,
    yearGroupAndClass: o.class ? `${o.yearGroup} - ${o.class}` : o.yearGroup,
  };
};

const getUserSchool = async (userId) => {
  if (!isDbOnline() || !mongoose.Types.ObjectId.isValid(userId)) return undefined;
  const user = await User.findById(userId).select('school');
  return user ? user.school : undefined;
};

const logActivity = async (entry) => {
  if (!isDbOnline()) return;
  try {
    await ActivityLog.create(entry);
  } catch (e) {
    // Activity logging must never block the main action
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const data = normaliseStudent(req.body);
    const invalid = validateStudent(data);
    if (invalid) return res.status(400).json({ message: invalid });

    if (!isDbOnline()) {
      if (OFFLINE_STUDENTS.some((s) => s.createdBy === req.userId && s.studentId === data.studentId)) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
      const student = { ...data, _id: `offline-stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdBy: req.userId, status: 'active', createdAt: new Date().toISOString() };
      OFFLINE_STUDENTS.unshift(student);
      return res.status(201).json({ message: 'Student registered (offline mode)', student: toClient(student) });
    }

    const exists = await Student.findOne({ createdBy: req.userId, studentId: data.studentId });
    if (exists) return res.status(400).json({ message: 'Student ID already exists' });

    const student = new Student({ ...data, school: await getUserSchool(req.userId), createdBy: req.userId });
    await student.save();

    await logActivity({
      user: req.userId,
      action: 'student_created',
      targetType: 'student',
      targetId: student._id,
      targetName: student.fullName,
      description: `Registered student: ${student.fullName} (${student.studentId})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({ message: 'Student registered successfully', student: toClient(student) });
  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({ message: 'Failed to register student', error: error.message });
  }
};

// Get the teacher's students (optionally filtered)
const getStudents = async (req, res) => {
  try {
    const { tier, yearGroup, search, status = 'active' } = req.query;
    const matchesSearch = (s) => {
      if (!search) return true;
      const q = String(search).toLowerCase();
      return [s.firstName, s.lastName, s.studentId, s.yearGroup, s.class, s.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    };

    if (!isDbOnline()) {
      const students = OFFLINE_STUDENTS.filter(
        (s) =>
          s.createdBy === req.userId &&
          (!tier || s.tier === tier) &&
          (!yearGroup || s.yearGroup === yearGroup) &&
          matchesSearch(s),
      ).map(toClient);
      return res.json({ students, total: students.length });
    }

    const query = { createdBy: req.userId };
    if (status) query.status = status;
    if (tier) query.tier = tier;
    if (yearGroup) query.yearGroup = yearGroup;
    if (search) {
      const rx = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
      query.$or = [{ firstName: rx }, { lastName: rx }, { studentId: rx }, { class: rx }, { email: rx }];
    }

    const students = await Student.find(query).sort({ yearGroup: 1, firstName: 1, lastName: 1 }).limit(2000);
    res.json({ students: students.map(toClient), total: students.length });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isDbOnline()) {
      const s = OFFLINE_STUDENTS.find((x) => x._id === id && x.createdBy === req.userId);
      return s ? res.json({ student: toClient(s) }) : res.status(404).json({ message: 'Student not found' });
    }
    const student = await Student.findOne({ _id: id, createdBy: req.userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ student: toClient(student) });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Failed to fetch student', error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    ['school', 'createdBy', 'createdAt', '_id'].forEach((k) => delete updates[k]);
    if (updates.yearGroup && !updates.tier) updates.tier = detectTier(updates.yearGroup);

    if (!isDbOnline()) {
      const s = OFFLINE_STUDENTS.find((x) => x._id === id && x.createdBy === req.userId);
      if (!s) return res.status(404).json({ message: 'Student not found' });
      Object.assign(s, updates);
      return res.json({ message: 'Student updated', student: toClient(s) });
    }

    updates.updatedBy = req.userId;
    const student = await Student.findOneAndUpdate({ _id: id, createdBy: req.userId }, updates, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated successfully', student: toClient(student) });
  } catch (error) {
    console.error('Student update error:', error);
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isDbOnline()) {
      const idx = OFFLINE_STUDENTS.findIndex((x) => x._id === id && x.createdBy === req.userId);
      if (idx === -1) return res.status(404).json({ message: 'Student not found' });
      OFFLINE_STUDENTS.splice(idx, 1);
      return res.json({ message: 'Student removed' });
    }
    const student = await Student.findOneAndDelete({ _id: id, createdBy: req.userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Student deletion error:', error);
    res.status(500).json({ message: 'Failed to remove student', error: error.message });
  }
};

// Get student assessments
const getStudentAssessments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isDbOnline()) return res.json({ assessments: [] });
    const student = await Student.findOne({ _id: id, createdBy: req.userId });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const assessments = await Assessment.find({
      $or: [{ studentRef: String(student._id) }, { createdBy: req.userId, studentName: student.fullName }],
    }).sort({ createdAt: -1 });
    res.json({ assessments });
  } catch (error) {
    console.error('Get student assessments error:', error);
    res.status(500).json({ message: 'Failed to fetch student assessments', error: error.message });
  }
};

// Bulk import students (from a CSV parsed on the client)
const bulkImportStudents = async (req, res) => {
  try {
    const rows = Array.isArray(req.body.students) ? req.body.students : [];
    if (rows.length === 0) return res.status(400).json({ message: 'No students to import' });
    if (rows.length > 1000) return res.status(400).json({ message: 'Please import at most 1000 students at a time' });

    const results = { successful: 0, failed: 0, errors: [], students: [] };
    const school = await getUserSchool(req.userId);

    for (let i = 0; i < rows.length; i++) {
      const data = normaliseStudent(rows[i]);
      const invalid = validateStudent(data);
      if (invalid) {
        results.failed++;
        results.errors.push({ row: i + 2, name: data.firstName, error: invalid });
        continue;
      }
      try {
        if (!isDbOnline()) {
          if (OFFLINE_STUDENTS.some((s) => s.createdBy === req.userId && s.studentId === data.studentId)) {
            throw new Error('Student ID already exists');
          }
          const student = { ...data, _id: `offline-stu-${Date.now()}-${i}`, createdBy: req.userId, status: 'active', createdAt: new Date().toISOString() };
          OFFLINE_STUDENTS.unshift(student);
          results.students.push(toClient(student));
        } else {
          const exists = await Student.findOne({ createdBy: req.userId, studentId: data.studentId });
          if (exists) throw new Error('Student ID already exists');
          const student = await new Student({ ...data, school, createdBy: req.userId }).save();
          results.students.push(toClient(student));
        }
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row: i + 2, name: `${data.firstName} ${data.lastName}`.trim(), error: error.message });
      }
    }

    await logActivity({
      user: req.userId,
      action: 'student_created',
      targetType: 'student',
      description: `Bulk imported students: ${results.successful} successful, ${results.failed} failed`,
      metadata: { successful: results.successful, failed: results.failed },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({ message: 'Import completed', results });
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