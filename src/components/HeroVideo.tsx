import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// You can replace this URL with your own video link later
const DEFAULT_VIDEO_URL = ""; 

export function HeroVideo() {
  const [videoUrl] = useState<string | null>(DEFAULT_VIDEO_URL || null);

  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
      {/* Background Layer (Video/Animation) */}
      <div className="absolute inset-0 -z-10 bg-black">
        <AnimatePresence>
          {!videoUrl && (
            <motion.div 
              exit={{ opacity: 0 }} 
              transition={{ duration: 2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Deep black base */}
              <div className="absolute inset-0 bg-black z-0" />
              
              {/* No more glow/flame effects as requested */}
            </motion.div>
          )}
        </AnimatePresence>

        {videoUrl && (
          <motion.video
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 3 }}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Heavy Vignette for Cinematic Contrast & Deep Blacks */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#000000_80%)] z-40 pointer-events-none" />
      </div>
    </div>
  );
}
