import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { HeroVideo } from "../components/HeroVideo";

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative">
      <HeroVideo />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
        className="text-center max-w-3xl mx-auto relative z-50 mt-[-10vh]"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display tracking-tighter text-offwhite mb-8 drop-shadow-2xl">
          <span className="block mb-2 gold-foil">QUIET</span>
          <span className="block gold-foil">LUXURY</span>
        </h1>
        <p className="text-limestone text-lg md:text-xl font-light tracking-wide max-w-xl mx-auto leading-relaxed drop-shadow-md">
          Hand-poured in Malta. Architectural scents designed for the sanctuary of your space.
        </p>
        
        <div className="mt-16 flex flex-col sm:flex-row gap-8 justify-center items-center">
          <Link 
            to="/collections" 
            className="group relative px-8 py-4 overflow-hidden border border-gold/30 hover:border-gold transition-colors duration-700 bg-black/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.76,0,0.24,1]" />
            <span className="relative z-10 text-xs tracking-[0.2em] uppercase text-gold group-hover:text-gold-light transition-colors duration-700">
              Explore Collections
            </span>
          </Link>
          
          <Link 
            to="/gifting" 
            className="group relative px-8 py-4 overflow-hidden bg-black/20 backdrop-blur-sm"
          >
            <span className="relative z-10 text-xs tracking-[0.2em] uppercase text-limestone group-hover:text-gold transition-colors duration-700">
              Premium Gifting
            </span>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gold/30 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 ease-[0.76,0,0.24,1]" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
