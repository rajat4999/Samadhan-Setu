const crypto = require('crypto');
const Student = require('../models/student');
const sendEmail = require('./emailService');


const forgotPassword = async (email) => {
    const user = await Student.findOne({ email });
    if (!user) {
        const error = new Error("No account found with that email address.");
        error.statusCode = 404;
        throw error;
    }
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    const subject = `Your Password Reset OTP - Hostel App`;
    const message = `Hello ${user.name},\n\nYour One-Time Password (OTP) to reset your password is:\n\n${otp}\n\nThis code is valid for 10 minutes. Please do not share it with anyone.`;

    try {
        await sendEmail(user.email, subject, message);
    } catch (err) {
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
        const error = new Error("Email could not be sent");
        error.statusCode = 500;
        throw error;
    }
};

const resetPassword = async (email, otp, newPassword) => {
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await Student.findOne({
        email: email,
        resetOtp: hashedOtp,
        resetOtpExpire: { $gt: Date.now() }
    });
    if (!user) {
        const error = new Error("Invalid or expired OTP.");
        error.statusCode = 400;
        throw error;
    }
    user.password = newPassword;

    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    
    await user.save();
};


// resend otp
const resendOTP = async (email) => {
    const user = await Student.findOne({ email });
    if (!user) {
        const error = new Error("No account found with that email address.");
        error.statusCode = 404;
        throw error;
    }

    if (user.lastOtpSentAt) {
        const timeSinceLastOtp = Date.now() - user.lastOtpSentAt.getTime();
        const cooldownPeriod = 60 * 1000; // 60 seconds

        if (timeSinceLastOtp < cooldownPeriod) {
            const secondsLeft = Math.ceil((cooldownPeriod - timeSinceLastOtp) / 1000);
            const error = new Error(`Please wait ${secondsLeft} seconds before requesting a new OTP.`);
            error.statusCode = 429; 
            throw error;
        }
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    const subject = `Your NEW Password Reset OTP - Hostel App`;
    const message = `Hello ${user.name},\n\nYou requested a new One-Time Password (OTP). Your new code is:\n\n${otp}\n\nThis code is valid for 10 minutes.`;

    try {
        await sendEmail(user.email, subject, message);
    } catch (err) {
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        user.lastOtpSentAt = undefined;
        await user.save({ validateBeforeSave: false });
        
        const error = new Error("Email could not be sent");
        error.statusCode = 500;
        throw error;
    }
};


module.exports = { forgotPassword, resetPassword,resendOTP };