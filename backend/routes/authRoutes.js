const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const student= require('./../models/student');
const sendEmail=require('./../services/emailService');
const express=require('express');
const crypto=require('crypto');
const router=express.Router();
const AuthService = require('../services/authService');

// create account
router.post('/signup',async(req,res)=>{
  try{
    const userData=req.body;

    if (userData.role === 'Caretaker') {
        
      delete userData.room;
      delete userData.regNo;


        // Grab the key they typed into the frontend
        const providedKey = req.body.adminSecret; 
        
        // Check if it exactly matches your .env file
        if (providedKey !== process.env.CARETAKER_SECRET_KEY) {
            return res.status(403).json({ error: "Unauthorized: Invalid Admin Secret Key." });
        }
        
        
    }

    const user=new student(userData);
    const response=await user.save();

    // email notification
    
    const payload={
      email:user.email,
      role:user.role,
      id:user.id,
      hostel:user.hostel
    }
    
    const token=generateToken(payload);
    
    
    res.status(200).json({response,token});
    console.log("account created successfully");
    // res.send(`account created successfully`);

    try{
      const subject="welcome to hostel maintenance app";
      const to=user.email;
      const text=`Hi ${user.name},\n\nYour account has been successfully created.\n\nHostel: ${user.hostel}\nRoom: ${user.room}\n\nYou can now login and file complaints.\n\nRegards,\nHostel Admin`;

      await sendEmail(to,subject,text);

    } catch(err){
      console.log("Signup Email Error:", err);
    }

  }
  catch(err){
    console.log(err);
    res.status(500).json({error:err});
  }
});


// login

router.post('/login',async(req,res)=>{
  try{
    const {email,password}= req.body;
    const user=await student.findOne({email:email});
    if(!user || !user.comparePassword(password)) return res.status(404).json({error:"incorrect email or password"});

    const payload={
      email:user.email,
      role:user.role,
      id:user.id,
      hostel:user.hostel
    }

    const token=generateToken(payload);

    res.send({token});
    

  }
  catch(err){
    res.status(500).json({error:err});
    console.log(err);
  }
})



// reset password - forgot password

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Please provide your email" });

        await AuthService.forgotPassword(email);
        res.status(200).json({ message: "OTP sent successfully to your email." });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});



router.post('/reset-password',async (req, res) => {
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
});


router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Please provide your email" });

        await AuthService.resendOTP(email);
        res.status(200).json({ message: "A new OTP has been sent to your email." });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await student.findOne({ email }); // Update model if checking Caretakers too

        if (!user) return res.status(404).json({ error: "User not found." });

        // const cleanOtp = String(otp).trim();
        
        const hashedIncomingOtp = crypto.createHash('sha256').update(otp).digest('hex'); 

        console.log("DB SAVED HASH:", user.resetOtp);
        console.log("NEWLY HASHED:", hashedIncomingOtp);
        
        if (user.resetOtp !== hashedIncomingOtp) {
            return res.status(400).json({ error: "Incorrect OTP. Please try again." });
        }
        
        if (user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ error: "OTP has expired. Please resend." });
        }

        res.status(200).json({ message: "OTP Verified successfully." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to verify OTP." });
    }
});


module.exports=router;