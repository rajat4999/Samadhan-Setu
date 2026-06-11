import { useState } from "react";
import toast from "react-hot-toast"; 
import api from "../../services/api";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email | 2: OTP | 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // --- STEP 1: REQUEST & RESEND OTP ---
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || "OTP sent to your email!");
      setStep(2); 
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
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

        {/* --- UI FOR STEP 1: EMAIL --- */}
        {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input 
                        type="email" required 
                        className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" 
                        placeholder="student@hostel.com"
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70">
                    {isLoading ? "Sending..." : "Send OTP"}
                </button>
            </form>
        )}

        {/* --- UI FOR STEP 2: VERIFY OTP --- */}
        {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">6-Digit OTP</label>
                    <input 
                        type="text" required maxLength="6"
                        className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-center tracking-[0.5em] font-mono text-lg" 
                        placeholder="------"
                        value={otp} onChange={(e) => setOtp(e.target.value)} 
                    />
                </div>
                
                <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70">
                    {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
                
                {/* --- NEW: RESEND & BACK BUTTONS --- */}
                <div className="flex justify-between items-center mt-4 px-1">
                    <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 hover:text-gray-700 transition">
                        Change Email
                    </button>
                    <button type="button" onClick={() => handleRequestOTP()} disabled={isLoading} className="text-xs font-bold text-blue-600 hover:underline transition">
                        Resend OTP
                    </button>
                </div>
            </form>
        )}

        {/* --- UI FOR STEP 3: NEW PASSWORD --- */}
        {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                    <input 
                        type="password" required minLength="6"
                        className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none transition" 
                        placeholder="Enter new password"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                    />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-70 mt-2">
                    {isLoading ? "Saving..." : "Save Password"}
                </button>
            </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordModal;