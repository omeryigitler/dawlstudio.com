import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export function Register() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate registration processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/");
    }, 2000);
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
          <h1 className="font-display text-3xl md:text-4xl tracking-widest uppercase text-offwhite mb-4">
            Create Account
          </h1>
          <p className="text-limestone text-sm tracking-widest uppercase">
            Join the Sanctuary
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">
                First Name
              </label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">
                Last Name
              </label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                placeholder="Enter your last name"
              />
            </div>
          </div>

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
            <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">
              Password
            </label>
            <input 
              type="password" 
              required
              className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
              placeholder="Create a password"
            />
          </div>

          <div className="flex items-start gap-3 mt-6">
            <input 
              type="checkbox" 
              id="newsletter"
              className="mt-1 appearance-none w-4 h-4 border border-gold/50 bg-transparent checked:bg-gold checked:border-gold focus:outline-none transition-colors cursor-pointer"
            />
            <label htmlFor="newsletter" className="text-[10px] uppercase tracking-widest text-limestone/80 leading-relaxed cursor-pointer">
              Subscribe to our newsletter for exclusive access to new collections and private events.
            </label>
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full py-5 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {isProcessing ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gold/10 pt-8">
          <p className="text-xs text-limestone tracking-widest uppercase mb-4">
            Already have an account?
          </p>
          <Link 
            to="/login"
            className="inline-block border-b border-gold text-gold hover:text-gold-light hover:border-gold-light pb-1 text-xs tracking-[0.2em] uppercase transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
