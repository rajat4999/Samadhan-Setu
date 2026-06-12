const AuthService = require('../services/authService');

const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    await AuthService.generateSignupOtp(email);
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const signup = async (req, res) => {
  try {
    
    const { response, token } = await AuthService.registerUser(req.body);
        
    res.status(201).json({ message: "Account created successfully", response, token });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });    
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const token = await AuthService.authenticateUser(email, password);
    res.status(200).json({ token });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Please provide your email" });

    await AuthService.forgotPassword(email);
    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required." });

    await AuthService.verifyResetOtp(email, otp);
    res.status(200).json({ message: "OTP Verified successfully." });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Please provide email, OTP, and new password" });
    }

    await AuthService.resetPassword(email, otp, newPassword);
    res.status(200).json({ message: "Password has been updated successfully. You can now log in." });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Please provide your email" });

    await AuthService.resendOTP(email);
    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  sendSignupOtp,
  signup, login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp
};