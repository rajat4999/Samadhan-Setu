import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

// Simple Eye Icons (SVG) so we don't need to install extra libraries
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const Signup = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", hostel: "Patel", room: "", 
    role: "Student", regNo: "",mobNo: "",
    adminSecret: ""
  });

  const [showPassword, setShowPassword] = useState(false); // Toggle State
  const [step, setStep] = useState(1); // Tracks which screen to show
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [isResending, setIsResending] = useState(false);

  // --- NEW: The Countdown Effect ---
  useEffect(() => {
    let timer;
    // Only run the timer if we are on step 2 AND time is greater than 0
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    // Cleanup the timer if the component unmounts
    return () => clearInterval(timer);
  }, [step, timeLeft]);
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validatePassword = (password) => {
    // Check 1: Length
    if (password.length < 8) return "Password must be at least 8 characters.";
    
    // Check 2: Mix of Letters and Numbers (Regex)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) return "Password must contain both letters and numbers.";
    
    return null; // No error
  };


  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await api.post("/auth/send-signup-otp", { email: formData.email });
      toast.success("A new verification code has been sent!");
      setTimeLeft(60); // Reset the timer back to 60 seconds
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };




  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(formData.password);
    if (passwordError) return toast.error(passwordError);

    setIsSending(true);
    try {
      // Call the new OTP route!
      await api.post("/auth/send-signup-otp", { email: formData.email });
      toast.success("Verification code sent to your email!");
      setStep(2); // Move to OTP input screen
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send verification code.");
    } finally {
      setIsSending(false);
    }
  };



  const handleSignup = async (e) => {
    e.preventDefault();

    // 1. Validate Password before sending
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      return; // Stop execution
    }



    try {
      if (!otp || otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP.");
      const payload = { ...formData , otp };

    if(payload.role === "Caretaker"){
      delete payload.regNo;
      delete payload.room;
    }

      const response = await api.post("/auth/signup", payload);

      console.log(response.data);

      toast.success("Account Created! Please Login.");

      if (typeof switchToLogin === "function") {
        switchToLogin();
      } else {
        console.warn("switchToLogin prop is missing!");
      }

      
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup Failed");
    }
  };

  return (
    <div className="glass-modal p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl text-gray-800 max-h-[90vh] overflow-y-auto">
      
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-700">
        {step === 1 ? "Create Account" : "Verify Your Email"}
      </h2>
      
      {/* ========================================= */}
      {/* STEP 1: THE MAIN FORM (Only shows if step is 1) */}
      {/* Notice onSubmit is now handleRequestOtp! */}
      {/* ========================================= */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column */}
              <div className="space-y-4">
                  <div>
                      <label className="text-sm font-semibold text-gray-600">Full Name</label>
                      <input name="name" type="text" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" required placeholder="Enter Full Name"/>
                  </div>
                  <div>
                      <label className="text-sm font-semibold text-gray-600">Mobile Number</label>
                      <input name="mobNo" type="tel" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" required placeholder="9876543210"/>
                  </div>
                  
                  {/* --- PASSWORD FIELD WITH TOGGLE --- */}
                  <div className="relative">
                      <label className="text-sm font-semibold text-gray-600">Password</label>
                      <input 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none pr-10" 
                        required 
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-blue-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                  </div>

                   <div>
                      <label className="text-sm font-semibold text-gray-600">Role</label>
                      <select name="role" onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                          <option value="Student">Student</option>
                          <option value="Caretaker">Caretaker</option>
                      </select>
                  </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                  <div>
                      <label className="text-sm font-semibold text-gray-600">Email</label>
                      <input name="email" type="email" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" required placeholder="student@mnnit.ac.in" />
                  </div>
                  
                  <div>
                      <label className="text-sm font-semibold text-gray-600">Hostel</label>
                      <select name="hostel" onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                          <option value="Patel">Patel</option>
                          <option value="Tilak">Tilak</option>
                          <option value="Malviya">Malviya</option>
                          <option value="SVBH">SVBH</option>
                          <option value="NBH Block-A">NBH Block-A</option>
                          <option value="NBH Block-B">NBH Block-B</option>
                      </select>
                  </div>

                  {formData.role === 'Student' ? (
                    <>
                      <div>
                            <label className="text-sm font-semibold text-gray-600">Registration No.</label>
                            <input name="regNo" type="text" onChange={handleChange} className="w-full p-2 border rounded-lg" required placeholder="202XXXXX"/>
                        </div>
                      <div>
                          <label className="text-sm font-semibold text-gray-600">Room No</label>
                          <input name="room" type="text" onChange={handleChange} className="w-full p-2 border rounded-lg" required placeholder="F-50"/>
                      </div>
                    </>
                  ) : (
                      <div>
                           <label className="text-sm font-semibold text-gray-600">Secret Key</label>
                          <input name="adminSecret" type="password" placeholder="Key" value={formData.adminSecret} onChange={handleChange} className="w-full p-2 border border-yellow-300 bg-yellow-50 rounded-lg" required />
                      </div>
                  )}
              </div>
          </div>

          <button type="submit" disabled={isSending} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg mt-4 disabled:bg-blue-400">
            {isSending ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      )}

      {/* ========================================= */}
      {/* STEP 2: THE OTP SCREEN (Only shows if step is 2) */}
      {/* Notice onSubmit is now your handleSignup function! */}
      {/* ========================================= */}
      {step === 2 && (
          <form onSubmit={handleSignup} className="space-y-6 flex flex-col items-center">
              <p className="text-center text-gray-600">
                  We sent a 6-digit verification code to <span className="font-bold">{formData.email}</span>
              </p>
              
              <input 
                  type="text" 
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Regex to only allow numbers
                  placeholder="------"
                  className="text-center text-3xl tracking-[0.5em] w-full max-w-xs p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
              />

              {/* --- NEW: Resend OTP UI --- */}
              <div className="text-sm font-semibold mt-2">
                {timeLeft > 0 ? (
                  <span className="text-gray-500">
                    Resend code in <span className="text-blue-600">{timeLeft}s</span>
                  </span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendOtp} 
                    disabled={isResending}
                    className="text-blue-600 hover:underline disabled:text-gray-400"
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
              {/* ------------------------- */}

              <div className="flex gap-4 w-full mt-4">
                  <button type="button" onClick={() => { setStep(1); setTimeLeft(60); }} className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
                      Back
                  </button>
                  <button type="submit" className="w-2/3 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg">
                      Verify & Register
                  </button>
              </div>
          </form>
      )}

      {/* Login Link only shows on Step 1 */}
      {step === 1 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Already a member?{" "}
          <button onClick={switchToLogin} className="text-blue-600 font-bold hover:underline">
            Login Here
          </button>
        </div>
      )}
    </div>
  );
};

export default Signup;