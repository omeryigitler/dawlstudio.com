import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { SocialAuth } from "../components/SocialAuth";

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      login(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
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
            CREATE ACCOUNT
          </h1>
          <p className="text-sm tracking-widest uppercase gold-foil drop-shadow-md">
            JOIN THE SANCTUARY
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          {error && (
            <div className="text-red-400 text-[10px] uppercase tracking-widest bg-red-400/10 p-4 border border-red-400/20">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">
                First Name
              </label>
              <input 
                type="text" 
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        <SocialAuth />

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
