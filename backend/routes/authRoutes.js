const {jwtAuthMiddleware,generateToken}=require('./../middleware/jwt');
const express=require('express');
const router=express.Router();
const AuthController = require('../controllers/authController');

//Account Creation
router.post('/send-signup-otp', AuthController.sendSignupOtp);
router.post('/signup', AuthController.signup);

// Login Flow
router.post('/login', AuthController.login);

// Password Reset Flow
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/reset-password', AuthController.resetPassword);
router.post('/resend-otp', AuthController.resendOtp);

module.exports=router;