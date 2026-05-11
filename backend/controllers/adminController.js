const User = require('../models/User');
const School = require('../models/School');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Get All Pending Teachers (filtered by school for school admins)
const getPendingTeachers = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    let filter = {
      role: 'teacher',
      status: 'pending'
    };

    // School admins can only see teachers from their school
    if (user.role === 'school_admin') {
      filter.school = user.school;
    }

    const pendingTeachers = await User.find(filter)
      .select('-password')
      .populate('school', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      teachers: pendingTeachers,
      count: pendingTeachers.length
    });
  } catch (error) {
    console.error('Error fetching pending teachers:', error);
    res.status(500).json({ message: 'Failed to fetch pending teachers', error: error.message });
  }
};

// Get All Teachers (with filters)
const getAllTeachers = async (req, res) => {
  try {
    const { status, school, page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.userId);
    
    const filter = { role: 'teacher' };
    if (status) filter.status = status;
    
    // Platform admin can filter by school, school admin only sees their school
    if (user.role === 'platform_admin') {
      if (school) filter.school = school;
    } else if (user.role === 'school_admin') {
      filter.school = user.school;
    }

    const skip = (page - 1) * limit;
    
    const teachers = await User.find(filter)
      .select('-password')
      .populate('school', 'name code')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      teachers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: teachers.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
  }
};

// Approve Teacher
const approveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const adminId = req.userId;
    const admin = await User.findById(adminId);

    const teacher = await User.findById(teacherId).populate('school', 'name code');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    if (teacher.status !== 'pending') {
      return res.status(400).json({ message: 'Teacher is not in pending status' });
    }

    // School admins can only approve teachers from their school
    if (admin.role === 'school_admin' && teacher.school._id.toString() !== admin.school.toString()) {
      return res.status(403).json({ message: 'Cannot approve teacher from different school' });
    }

    // Update teacher status
    teacher.status = 'approved';
    teacher.approvedBy = adminId;
    teacher.approvedAt = new Date();

    // Generate password setup token
    const setupToken = crypto.randomBytes(32).toString('hex');
    teacher.resetPasswordToken = setupToken;
    teacher.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await teacher.save();

    // Send "Your account is approved" email with password setup link
    await emailService.sendApprovalEmail(teacher, setupToken);

    // Log activity
    await ActivityLog.create({
      user: adminId,
      school: teacher.school._id,
      action: 'teacher_approved',
      targetType: 'teacher',
      targetId: teacher._id,
      targetName: teacher.fullName,
      description: `Approved teacher: ${teacher.fullName} (${teacher.email})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Populate admin info for response
    await teacher.populate('approvedBy', 'firstName lastName');

    res.json({
      message: 'Teacher approved successfully',
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        school: teacher.school,
        department: teacher.department,
        status: teacher.status,
        approvedBy: teacher.approvedBy,
        approvedAt: teacher.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving teacher:', error);
    res.status(500).json({ message: 'Failed to approve teacher', error: error.message });
  }
};

// Reject Teacher
const rejectTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;
    const admin = await User.findById(adminId);

    const teacher = await User.findById(teacherId).populate('school', 'name code');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    // School admins can only reject teachers from their school
    if (admin.role === 'school_admin' && teacher.school._id.toString() !== admin.school.toString()) {
      return res.status(403).json({ message: 'Cannot reject teacher from different school' });
    }

    // Update teacher status
    teacher.status = 'rejected';
    teacher.rejectionReason = reason || 'No reason provided';
    teacher.approvedBy = adminId;
    teacher.approvedAt = new Date();
    await teacher.save();

    // Log activity
    await ActivityLog.create({
      user: adminId,
      school: teacher.school._id,
      action: 'teacher_rejected',
      targetType: 'teacher',
      targetId: teacher._id,
      targetName: teacher.fullName,
      description: `Rejected teacher: ${teacher.fullName} - Reason: ${reason || 'No reason provided'}`,
      metadata: { reason },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Teacher rejected successfully',
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        status: teacher.status,
        rejectionReason: teacher.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error rejecting teacher:', error);
    res.status(500).json({ message: 'Failed to reject teacher', error: error.message });
  }
};

// Suspend/Unsuspend Teacher
const toggleTeacherSuspension = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { suspend, reason } = req.body;
    const adminId = req.userId;
    const admin = await User.findById(adminId);

    const teacher = await User.findById(teacherId).populate('school', 'name code');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    // School admins can only suspend teachers from their school
    if (admin.role === 'school_admin' && teacher.school._id.toString() !== admin.school.toString()) {
      return res.status(403).json({ message: 'Cannot modify teacher from different school' });
    }

    // Update status
    if (suspend) {
      teacher.status = 'suspended';
      teacher.rejectionReason = reason || 'Suspended by admin';
    } else {
      teacher.status = 'approved';
      teacher.rejectionReason = undefined;
    }

    await teacher.save();

    // Log activity
    await ActivityLog.create({
      user: adminId,
      school: teacher.school._id,
      action: suspend ? 'teacher_suspended' : 'teacher_approved',
      targetType: 'teacher',
      targetId: teacher._id,
      targetName: teacher.fullName,
      description: `${suspend ? 'Suspended' : 'Unsuspended'} teacher: ${teacher.fullName}`,
      metadata: { reason, action: suspend ? 'suspend' : 'unsuspend' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: `Teacher ${suspend ? 'suspended' : 'unsuspended'} successfully`,
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        status: teacher.status
      }
    });
  } catch (error) {
    console.error('Error toggling teacher suspension:', error);
    res.status(500).json({ message: 'Failed to update teacher status', error: error.message });
  }
};

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    let schoolFilter = {};
    
    // School admins only see their school's data
    if (user.role === 'school_admin') {
      schoolFilter = { school: user.school };
    }

    // Teacher statistics
    const teacherStats = await User.aggregate([
      { $match: { role: 'teacher', ...schoolFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Student statistics
    const studentStats = await Student.aggregate([
      { $match: schoolFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Assessment statistics
    const assessmentStats = await Assessment.aggregate([
      { $match: schoolFilter },
      { $group: { _id: '$assessmentType', count: { $sum: 1 } } }
    ]);

    // School statistics (Platform admin only)
    let schoolStats = null;
    if (user.role === 'platform_admin') {
      schoolStats = await School.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
    }

    // Term-based progress statistics (for grouped bar charts)
    const progressStats = await Assessment.aggregate([
      { $match: schoolFilter },
      { 
        $group: { 
          _id: { type: '$assessmentType', term: '$term' }, 
          avgScore: { $avg: '$totalScore' } 
        } 
      },
      {
        $group: {
          _id: '$_id.type',
          terms: {
            $push: {
              term: '$_id.term',
              score: { $round: ['$avgScore', 1] }
            }
          }
        }
      }
    ]);

    // Recent activity
    const recentTeachers = await User.find({ role: 'teacher', ...schoolFilter })
      .select('firstName lastName email status createdAt')
      .populate('school', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAssessments = await Assessment.find(schoolFilter)
      .select('studentName assessmentType level createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format teacher stats
    const formattedTeacherStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
      total: 0
    };

    teacherStats.forEach(stat => {
      formattedTeacherStats[stat._id] = stat.count;
      formattedTeacherStats.total += stat.count;
    });

    // Format student stats
    const formattedStudentStats = {
      active: 0,
      inactive: 0,
      graduated: 0,
      transferred: 0,
      total: 0
    };

    studentStats.forEach(stat => {
      formattedStudentStats[stat._id] = stat.count;
      formattedStudentStats.total += stat.count;
    });

    // Format assessment stats
    const formattedAssessmentStats = {};
    assessmentStats.forEach(stat => {
      formattedAssessmentStats[stat._id] = stat.count;
    });

    // Format school stats (Platform admin only)
    const formattedSchoolStats = schoolStats ? {
      active: 0,
      inactive: 0,
      suspended: 0,
      total: 0
    } : null;

    if (schoolStats) {
      schoolStats.forEach(stat => {
        formattedSchoolStats[stat._id] = stat.count;
        formattedSchoolStats.total += stat.count;
      });
    }

    const response = {
      teachers: formattedTeacherStats,
      students: formattedStudentStats,
      assessments: formattedAssessmentStats,
      recentActivity: {
        teachers: recentTeachers,
        assessments: recentAssessments
      }
    };

    if (formattedSchoolStats) {
      response.schools = formattedSchoolStats;
    }

    // Format progress stats for grouped bar chart
    response.termProgress = progressStats.map(stat => {
      const entry = { name: stat._id };
      stat.terms.forEach(t => {
        entry[t.term] = t.score;
      });
      return entry;
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics', error: error.message });
  }
};

// Get Teacher Details
const getTeacherDetails = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const user = await User.findById(req.userId);

    const teacher = await User.findById(teacherId)
      .select('-password')
      .populate('school', 'name code')
      .populate('approvedBy', 'firstName lastName');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    // School admins can only view teachers from their school
    if (user.role === 'school_admin' && teacher.school._id.toString() !== user.school.toString()) {
      return res.status(403).json({ message: 'Cannot view teacher from different school' });
    }

    // Get teacher's assessments
    const assessments = await Assessment.find({ email: teacher.email })
      .select('studentName assessmentType level totalScore createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        fullName: teacher.fullName,
        email: teacher.email,
        role: teacher.role,
        status: teacher.status,
        school: teacher.school,
        department: teacher.department,
        phoneNumber: teacher.phoneNumber,
        teachingExperience: teacher.teachingExperience,
        bio: teacher.bio,
        approvedBy: teacher.approvedBy,
        approvedAt: teacher.approvedAt,
        rejectionReason: teacher.rejectionReason,
        lastLogin: teacher.lastLogin,
        createdAt: teacher.createdAt
      },
      assessments: {
        recent: assessments,
        total: assessments.length
      }
    });
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    res.status(500).json({ message: 'Failed to fetch teacher details', error: error.message });
  }
};

// Update Teacher
const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updates = req.body;
    const adminId = req.userId;
    const admin = await User.findById(adminId);

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // School admins can only update teachers from their school
    if (admin.role === 'school_admin' && teacher.school.toString() !== admin.school.toString()) {
      return res.status(403).json({ message: 'Cannot modify teacher from different school' });
    }

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.email; // Email should be unique, handle separately if needed

    const updatedTeacher = await User.findByIdAndUpdate(
      teacherId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password').populate('school', 'name code');

    // Log activity
    await ActivityLog.create({
      user: adminId,
      school: admin.school || updatedTeacher.school._id,
      action: 'teacher_updated',
      targetType: 'teacher',
      targetId: teacherId,
      targetName: updatedTeacher.fullName,
      description: `Updated teacher profile: ${updatedTeacher.fullName}`,
      metadata: updates,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Failed to update teacher', error: error.message });
  }
};

// Delete Teacher
const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const adminId = req.userId;
    const admin = await User.findById(adminId);

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // School admins can only delete teachers from their school
    if (admin.role === 'school_admin' && teacher.school.toString() !== admin.school.toString()) {
      return res.status(403).json({ message: 'Cannot delete teacher from different school' });
    }

    // Check if teacher has assessments
    const assessmentCount = await Assessment.countDocuments({ email: teacher.email });
    if (assessmentCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete teacher with existing assessments. Suspend them instead.',
        assessmentCount 
      });
    }

    await User.findByIdAndDelete(teacherId);

    // Log activity
    await ActivityLog.create({
      user: adminId,
      school: admin.school || teacher.school,
      action: 'teacher_deleted',
      targetType: 'teacher',
      targetId: teacherId,
      targetName: teacher.fullName,
      description: `Deleted teacher: ${teacher.fullName} (${teacher.email})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Failed to delete teacher', error: error.message });
  }
};

module.exports = {
  getPendingTeachers,
  getAllTeachers,
  approveTeacher,
  rejectTeacher,
  toggleTeacherSuspension,
  getDashboardStats,
  getTeacherDetails,
  updateTeacher,
  deleteTeacher
};