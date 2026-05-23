const fs = require('fs');
let content = fs.readFileSync('controllers/authController.js', 'utf8');

const forgotPasswordCode = `
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
`;

content = content.replace('module.exports = {', forgotPasswordCode + '\nmodule.exports = {\n  forgotPassword,');
fs.writeFileSync('controllers/authController.js', content);
