const School = require('../models/School');
const User = require('../models/User');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const ActivityLog = require('../models/ActivityLog');

// Create new school
const createSchool = async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      address,
      contactInfo,
      principalName,
      adminContact,
      subscriptionPlan,
      maxTeachers,
      maxStudents,
      enabledFeatures,
      logo,
      primaryColor
    } = req.body;

    // Check if school code already exists
    const existingSchool = await School.findOne({ code: code.toUpperCase() });
    if (existingSchool) {
      return res.status(400).json({ message: 'School code already exists' });
    }

    const school = new School({
      name,
      code: code.toUpperCase(),
      type,
      address,
      contactInfo,
      principalName,
      adminContact,
      subscriptionPlan: subscriptionPlan || 'free',
      maxTeachers: maxTeachers || 5,
      maxStudents: maxStudents || 100,
      enabledFeatures: enabledFeatures || ['listening', 'speaking', 'reading', 'writing'],
      logo,
      primaryColor: primaryColor || '#3b82f6',
      createdBy: req.userId
    });

    await school.save();

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      action: 'school_created',
      targetType: 'school',
      targetId: school._id,
      targetName: school.name,
      description: `Created new school: ${school.name} (${school.code})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'School created successfully',
      school
    });
  } catch (error) {
    console.error('School creation error:', error);
    res.status(500).json({ message: 'Failed to create school', error: error.message });
  }
};

// Get all schools (Platform Admin only)
const getAllSchools = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const schools = await School.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await School.countDocuments(query);

    res.json({
      schools,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ message: 'Failed to fetch schools', error: error.message });
  }
};

// Get school by ID
const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const school = await School.findById(id)
      .populate('createdBy', 'firstName lastName email');

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if user has access to this school
    const user = await User.findById(req.userId);
    if (user.role !== 'platform_admin' && user.school.toString() !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ message: 'Failed to fetch school', error: error.message });
  }
};

// Update school
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.code;
    delete updates.createdBy;
    delete updates.createdAt;

    const school = await School.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: school._id,
      action: 'school_updated',
      targetType: 'school',
      targetId: school._id,
      targetName: school.name,
      description: `Updated school: ${school.name}`,
      metadata: updates,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'School updated successfully',
      school
    });
  } catch (error) {
    console.error('School update error:', error);
    res.status(500).json({ message: 'Failed to update school', error: error.message });
  }
};

// Delete school
const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if school has active users or students
    const userCount = await User.countDocuments({ school: id, status: 'approved' });
    const studentCount = await Student.countDocuments({ school: id, status: 'active' });

    if (userCount > 0 || studentCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete school with active users or students',
        details: { activeUsers: userCount, activeStudents: studentCount }
      });
    }

    await School.findByIdAndDelete(id);

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      action: 'school_deleted',
      targetType: 'school',
      targetId: id,
      targetName: school.name,
      description: `Deleted school: ${school.name} (${school.code})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('School deletion error:', error);
    res.status(500).json({ message: 'Failed to delete school', error: error.message });
  }
};

// Update school status
const updateSchoolStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const school = await School.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // If suspending school, also suspend all users
    if (status === 'suspended') {
      await User.updateMany(
        { school: id },
        { status: 'suspended' }
      );
    }

    // Log activity
    await ActivityLog.create({
      user: req.userId,
      school: school._id,
      action: 'school_updated',
      targetType: 'school',
      targetId: school._id,
      targetName: school.name,
      description: `Changed school status to: ${status}`,
      metadata: { oldStatus: school.status, newStatus: status },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'School status updated successfully',
      school
    });
  } catch (error) {
    console.error('School status update error:', error);
    res.status(500).json({ message: 'Failed to update school status', error: error.message });
  }
};

// Get school statistics
const getSchoolStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this school
    const user = await User.findById(req.userId);
    if (user.role !== 'platform_admin' && user.school.toString() !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Get statistics
    const totalTeachers = await User.countDocuments({ school: id, role: 'teacher' });
    const approvedTeachers = await User.countDocuments({ school: id, role: 'teacher', status: 'approved' });
    const pendingTeachers = await User.countDocuments({ school: id, role: 'teacher', status: 'pending' });
    
    const totalStudents = await Student.countDocuments({ school: id });
    const activeStudents = await Student.countDocuments({ school: id, status: 'active' });
    
    const totalAssessments = await Assessment.countDocuments({ school: id });
    const recentAssessments = await Assessment.countDocuments({ 
      school: id, 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    // Update school statistics
    await School.findByIdAndUpdate(id, {
      totalTeachers: approvedTeachers,
      totalStudents: activeStudents,
      totalAssessments,
      lastActivity: new Date()
    });

    res.json({
      school: {
        id: school._id,
        name: school.name,
        code: school.code,
        status: school.status
      },
      statistics: {
        teachers: {
          total: totalTeachers,
          approved: approvedTeachers,
          pending: pendingTeachers
        },
        students: {
          total: totalStudents,
          active: activeStudents
        },
        assessments: {
          total: totalAssessments,
          recent: recentAssessments
        }
      }
    });
  } catch (error) {
    console.error('School stats error:', error);
    res.status(500).json({ message: 'Failed to fetch school statistics', error: error.message });
  }
};

module.exports = {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  updateSchoolStatus,
  getSchoolStats
};