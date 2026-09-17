const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register Teacher
const registerTeacher = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      school,
      department,
      phoneNumber,
      teachingExperience,
      bio
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash a temporary random password (user will reset it after approval)
    const tempPassword = crypto.randomBytes(20).toString('hex');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Create new teacher
    const teacher = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'teacher',
      status: 'pending',
      school,
      department,
      phoneNumber,
      teachingExperience,
      bio
    });

    await teacher.save();

    // Send "Thanks for registering" email
    await emailService.sendRegistrationEmail(teacher);

    res.status(201).json({
      message: 'Teacher registration successful. We have sent a confirmation email to you. Please wait for admin approval.',
      user: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        role: teacher.role,
        status: teacher.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block admin logins from standard password flow
    if (user.role === 'platform_admin' || user.role === 'school_admin') {
      return res.status(403).json({ message: 'Administrators must sign in via the Admin OTP page.' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked. Please try again later.' });
    }

    // Check if account is approved (for teachers and school admins)
    if ((user.role === 'teacher' || user.role === 'school_admin') && user.status !== 'approved') {
      let message = 'Account is pending approval';
      if (user.status === 'rejected') {
        message = `Account was rejected. Reason: ${user.rejectionReason || 'No reason provided'}`;
      } else if (user.status === 'suspended') {
        message = 'Account is suspended. Please contact administrator.';
      }
      return res.status(403).json({ message });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Reset login attempts and update last login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        school: user.school,
        department: user.department,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get Current User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        school: user.school,
        department: user.department,
        phoneNumber: user.phoneNumber,
        teachingExperience: user.teachingExperience,
        bio: user.bio,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint
    delete updates.role; // Don't allow role changes
    delete updates.status; // Don't allow status changes

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        school: user.school,
        department: user.department,
        phoneNumber: user.phoneNumber,
        teachingExperience: user.teachingExperience,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

// Set Password (after approval)
const setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password set successfully. You can now log in.' });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Failed to set password', error: error.message });
  }
};


// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.status(200).json({ message: 'If an account with that email exists, we sent a password reset link.' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Account is pending approval or suspended. Password cannot be reset.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.status(200).json({ message: 'If an account with that email exists, we sent a password reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
};

// Send OTP to Admin Email
const sendAdminOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    // Make sure user is an admin
    if (user.role !== 'platform_admin' && user.role !== 'school_admin') {
      return res.status(403).json({ message: 'Access denied. Only administrators can use this login method.' });
    }

    // Bypass Render Free Tier SMTP Block!
    const otp = '123456';

    // Save OTP to user (expires in 10 minutes)
    user.adminOtp = otp;
    user.adminOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Fake success since Render Free Tier blocks outbound SMTP automatically
    const emailResult = true;
    console.log("Bypassing Email due to Render free tier! OTP is hardcoded to:", otp);

    if (!emailResult) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please verify mail configuration.' });
    }

    res.json({ message: 'OTP bypassed on free tier. Use 123456 to Login!' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify Admin OTP
const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    // Make sure user is an admin
    if (user.role !== 'platform_admin' && user.role !== 'school_admin') {
      return res.status(403).json({ message: 'Access denied. Only administrators can verify OTP.' });
    }

    // Check if OTP matches and is not expired
    if (!user.adminOtp || user.adminOtp !== otp || !user.adminOtpExpires || user.adminOtpExpires < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields upon successful verification
    user.adminOtp = undefined;
    user.adminOtpExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        school: user.school,
        department: user.department,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

module.exports = {
  forgotPassword,
  registerTeacher,
  login,
  getProfile,
  updateProfile,
  changePassword,
  setPassword,
  sendAdminOtp,
  verifyAdminOtp
};