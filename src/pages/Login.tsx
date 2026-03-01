import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export function Login() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate login processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl tracking-widest uppercase mb-4 gold-foil drop-shadow-2xl">
            WELCOME BACK
          </h1>
          <p className="text-sm tracking-widest uppercase gold-foil drop-shadow-md">
            ENTER YOUR SANCTUARY
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              required
              className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] uppercase tracking-widest text-limestone/60">
                Password
              </label>
              <button type="button" className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors">
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              required
              className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full py-5 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isProcessing ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gold/10 pt-8">
          <p className="text-xs text-limestone tracking-widest uppercase mb-4">
            Don't have an account?
          </p>
          <Link 
            to="/register"
            className="inline-block border-b border-gold text-gold hover:text-gold-light hover:border-gold-light pb-1 text-xs tracking-[0.2em] uppercase transition-colors"
          >
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
