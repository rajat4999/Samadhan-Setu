import { useState, useEffect } from "react";
import toast from "react-hot-toast"; 
import api from "../../services/api";



const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email | 2: OTP | 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  // --- STEP 1: REQUEST & RESEND OTP ---
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || "OTP sent to your email!");
      setStep(2);
      setTimeLeft(60);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success("A new verification code has been sent!");
      setTimeLeft(60); // Reset the timer
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  // --- STEP 2: VERIFY OTP ONLY ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success("OTP Verified!");
      setStep(3); // Unlocks the New Password screen
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP.");
      setOtp(""); // Clear the wrong OTP so they can re-enter
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 3: RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success(res.data.message || "Password reset successfully!");
      handleClose(); // Clean up and close
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setShowPassword(false);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col p-8 relative">
        
        <button onClick={handleClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700 transition">&times;</button>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h3>
        
        {/* Dynamic Subtitle */}
        <p className="text-sm text-gray-500 mb-6">
            {step === 1 && "Enter your registered email address to receive a 6-digit verification code."}
            {step === 2 && `We sent a code to ${email}`}
            {step === 3 && "Create a new, strong password."}
        </p>

        {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                    <input 
                        type="email" required 
                        className="w-full p-4 bg-white text-gray-800 border-2 border-gray-200 rounded-xl focus:border-[#3b5bdb] outline-none transition" 
                        placeholder="student@mnnit.ac.in"
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#3b5bdb] text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-2">
                    {isLoading ? "Sending..." : "Continue"}
                </button>
            </form>
        )}

        {/* --- UI FOR STEP 2: VERIFY OTP --- */}
        {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn flex flex-col">
                <div>
                    <input 
                        type="text" required maxLength="6"
                        className="w-full py-5 bg-white text-gray-800 border-2 border-gray-200 rounded-xl focus:border-[#3b5bdb] outline-none transition text-center tracking-[0.7em] font-medium text-3xl placeholder:tracking-[0.5em] placeholder:text-gray-300" 
                        placeholder="- - - - - -"
                        value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                    />
                </div>
                
                {/* Timer matches the image text perfectly */}
                <div className="text-center text-sm font-medium mt-2">
                    {timeLeft > 0 ? (
                    <span className="text-gray-500">
                        Resend code in <span className="text-[#3b5bdb]">{timeLeft}s</span>
                    </span>
                    ) : (
                    <button 
                        type="button" 
                        onClick={handleResendOTP} 
                        disabled={isResending}
                        className="text-[#3b5bdb] hover:underline disabled:text-gray-400"
                    >
                        {isResending ? "Sending..." : "Resend Code"}
                    </button>
                    )}
                </div>
                
                {/* Back and Verify Buttons styled like the image */}
                <div className="flex gap-4 w-full mt-4">
                    <button 
                        type="button" 
                        onClick={() => { setStep(1); setTimeLeft(60); }} 
                        className="flex-1 bg-[#e9ecef] text-[#495057] py-4 rounded-xl font-bold hover:bg-[#dee2e6] transition"
                    >
                        Back
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading || otp.length !== 6} 
                        className="flex-[2] bg-[#539b55] text-white py-4 rounded-xl font-bold hover:bg-[#407a42] transition shadow-md disabled:opacity-70"
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                </div>
            </form>
        )}

        {/* --- UI FOR STEP 3: NEW PASSWORD --- */}
        {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} required minLength="6"
                        className="w-full p-4 bg-white text-gray-800 border-2 border-gray-200 rounded-xl focus:border-[#539b55] outline-none transition pr-12" 
                        placeholder="Create new password"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                    />
                    {/* The Eye Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition focus:outline-none"
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#539b55] text-white font-bold py-4 rounded-xl hover:bg-[#407a42] transition disabled:opacity-70 mt-2 shadow-md">
                    {isLoading ? "Saving..." : "Save Password"}
                </button>
            </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordModal;