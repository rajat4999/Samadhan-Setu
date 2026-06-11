import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const switchToSignup = () => { setShowLogin(false); setShowSignup(true); };
  const switchToLogin = () => { setShowSignup(false); setShowLogin(true); };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center relative text-white"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-2xl">
          Samadhan Setu
        </h1>
        <p className="text-xl md:text-2xl mb-10 opacity-90 font-light tracking-wide">
          Report. Track. Resolve.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button onClick={() => setShowLogin(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg">
            Login
          </button>
          <button onClick={() => setShowSignup(true)} className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white/20 transition shadow-lg">
            Sign Up
          </button>
        </div>
      </div>

      {/* --- POPUP CONTAINER --- */}
      {(showLogin || showSignup) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* RESPONSIVE SIZE FIX: 
             w-full (default) -> Mobile
             max-w-md (tablet) -> Keeps it small
             md:w-1/2 (desktop) -> Half screen or smaller
          */}
          <div className="relative w-full max-w-md md:w-1/2 lg:w-1/3">
            
            {/* Close Button */}
            <button 
              onClick={() => { setShowLogin(false); setShowSignup(false); }}
              className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300 transition"
            >
              &times;
            </button>

            {/* The Actual Forms */}
            {showLogin && <Login switchToSignup={switchToSignup} />}
            {showSignup && <Signup switchToLogin={switchToLogin} />}
          
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;