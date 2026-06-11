import { useState } from "react";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { getRoleFromToken } from "../utils/auth"; // <--- IMPORT THIS

// Icons
const EyeIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EyeOffIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>;

const Login = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call the universal login endpoint
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.token;
      
      // 2. Save Token
      localStorage.setItem("token", token);
      
      // 3. Detect Role
      const role = getRoleFromToken(token);
      
      toast.success("Login Successful!");

      // 4. Redirect based on Role
      if (role === 'Caretaker') {
        navigate("/caretaker-dashboard");
      } else {
        navigate("/dashboard"); // Default for students
      }

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="glass-modal p-6 md:p-8 rounded-2xl shadow-2xl w-full text-gray-800 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-700">
        Welcome Back
      </h2>
      
      <form onSubmit={handleLogin} className="space-y-5">
        
        {/* NOTE: No Role Selector here anymore! */}

        <div>
          <label className="block text-gray-600 text-sm font-semibold mb-1">Email Address</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="relative">
          <label className="block text-gray-600 text-sm font-semibold mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-blue-600 focus:outline-none"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <button 
    type="button" 
    onClick={() => setShowForgotModal(true)}
    className="text-xs font-bold text-blue-600 hover:underline"
>
    Forgot Password?
</button>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition transform active:scale-95 shadow-lg disabled:bg-blue-300"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button onClick={switchToSignup} className="text-blue-600 font-bold hover:underline">
          Create New Account
        </button>
      </div>

    </div>
      <ForgotPasswordModal 
    isOpen={showForgotModal} 
    onClose={() => setShowForgotModal(false)} 
/>
</>
  );
};



export default Login;