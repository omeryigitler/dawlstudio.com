import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export function SlidingDoors({ onComplete }: { onComplete: () => void }) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Lock body scroll while animating
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 4500); // Total animation duration

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleAnimationComplete = () => {
    document.body.style.overflow = "auto";
    onComplete();
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isAnimating && (
        <motion.div 
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] flex"
        >
          {/* Left Door */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 2.5, ease: [0.76, 0, 0.24, 1], delay: 2 }}
            className="w-1/2 h-full bg-[#121212] border-r border-[#C5A059]/40 relative overflow-hidden flex justify-end items-center shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-20"
          >
          </motion.div>

          {/* Right Door */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 2.5, ease: [0.76, 0, 0.24, 1], delay: 2 }}
            className="w-1/2 h-full bg-[#121212] border-l border-[#C5A059]/40 relative overflow-hidden flex justify-start items-center shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-20"
          >
          </motion.div>

          {/* Center Logo Reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: [0, 1, 0], scale: [0.95, 1, 1.05] }}
            transition={{ duration: 2.5, ease: "easeInOut", times: [0, 0.4, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none"
          >
            <h1 className="text-4xl md:text-6xl font-display tracking-[0.2em] text-[#F5F5F0] gold-foil">
              DAWL
            </h1>
            <p className="text-xs tracking-[0.3em] mt-4 text-[#A9A5A0] uppercase">
              Studio
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
