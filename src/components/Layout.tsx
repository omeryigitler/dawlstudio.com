import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SlidingDoors } from "./SlidingDoors";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Layout() {
  const [showIntro, setShowIntro] = useState(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !reduceMotion && sessionStorage.getItem("dawl_intro_seen") !== "true";
  });
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-charcoal text-offwhite flex flex-col relative overflow-x-hidden">
      {/* Global Effects */}
      <div className="vignette" />
      <div className="film-grain" />

      {showIntro && <SlidingDoors onComplete={() => {
        sessionStorage.setItem("dawl_intro_seen", "true");
        setShowIntro(false);
      }} />}

      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="flex-grow pt-32 relative z-10"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}
