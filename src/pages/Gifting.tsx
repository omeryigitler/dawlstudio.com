import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "../utils/cn";

export function Gifting() {
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-24">
      <header className="mb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-display tracking-[0.1em] mb-6">
          <span className="gold-foil">PREMIUM GIFTING</span>
        </h1>
        <p className="text-limestone text-sm tracking-widest uppercase max-w-xl mx-auto">
          The art of considered giving.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-48">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="lg:col-span-1"
        >
          {/* Premium Note Card Customiser - Exactly matching ProductDetail */}
          <div className="border border-gold/20 p-6 md:p-8 relative overflow-hidden bg-charcoal-light/30">
            <div className="absolute top-0 left-0 w-full h-[1px] gold-line" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-display text-sm tracking-widest text-gold uppercase">Gift Card</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCardSide("front")}
                  className={cn("text-[10px] uppercase tracking-widest transition-colors", cardSide === "front" ? "text-gold" : "text-limestone hover:text-offwhite")}
                >
                  Front
                </button>
                <button 
                  onClick={() => setCardSide("back")}
                  className={cn("text-[10px] uppercase tracking-widest transition-colors", cardSide === "back" ? "text-gold" : "text-limestone hover:text-offwhite")}
                >
                  Back
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
              {/* Input Area */}
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-limestone/60">To</label>
                    <input 
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Recipient Name"
                      className="w-full bg-charcoal-light border border-limestone/10 focus:border-gold outline-none p-3 text-sm text-offwhite transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-limestone/60">Message</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 150))}
                      placeholder="Your message..."
                      className="w-full h-24 bg-charcoal-light border border-limestone/10 focus:border-gold outline-none p-3 text-sm text-offwhite resize-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-limestone/60">From</label>
                    <input 
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-charcoal-light border border-limestone/10 focus:border-gold outline-none p-3 text-sm text-offwhite transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Live Card Preview */}
              <div className="flex justify-center items-center">
                <motion.div 
                  animate={{ rotateY: cardSide === "back" ? 180 : 0 }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="w-56 aspect-[4/5] relative"
                >
                  {/* Front Side */}
                  <div 
                    className="absolute inset-0 paper-texture p-6 flex flex-col shadow-2xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="text-center mb-8">
                      <span className="text-[6px] uppercase tracking-[0.4em] text-charcoal/60 font-display">DAWL STUDIO</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center gap-6 text-left">
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase tracking-widest text-charcoal/40 block">To:</span>
                        <p className="text-[10px] text-charcoal font-serif italic break-words min-h-[1em]">{to || " "}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase tracking-widest text-charcoal/40 block">Message:</span>
                        <p className="text-[10px] text-charcoal font-serif italic leading-relaxed break-words min-h-[4em]">{message || " "}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase tracking-widest text-charcoal/40 block">From:</span>
                        <p className="text-[10px] text-charcoal font-serif italic break-words min-h-[1em]">{from || " "}</p>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 paper-texture p-6 flex flex-col shadow-2xl"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="text-center mb-8">
                      <span className="text-[7px] uppercase tracking-[0.3em] text-charcoal/80 font-display">CANDLE CARE</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-4 text-center">
                      <ul className="space-y-3 text-[8px] uppercase tracking-[0.15em] text-charcoal/70 list-none p-0">
                        <li>Trim wick to 5–7 mm</li>
                        <li>Allow full melt pool</li>
                        <li>Do not burn over 4 hours</li>
                        <li>Never leave unattended</li>
                      </ul>
                    </div>

                    <div className="mt-auto flex flex-col items-center gap-3">
                      <span className="text-[6px] tracking-[0.3em] text-charcoal/40">DAWLSTUDIO.COM</span>
                      <div className="w-6 h-6 border border-charcoal/10 p-1 opacity-40">
                        <div className="w-full h-full bg-charcoal/5 grid grid-cols-3 grid-rows-3 gap-0.5">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className={cn("bg-charcoal/20", i % 2 === 0 && "opacity-50")} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="lg:col-span-1"
        >
          <h2 className="font-display text-3xl tracking-widest text-offwhite mb-6">The Presentation</h2>
          <p className="text-limestone leading-relaxed mb-8">
            Our Premium Gift Edition elevates the unboxing experience. Each candle is presented in a matte black box with subtle gold foil detailing. Inside, the vessel is crowned with a heavy, matte gold metal lid that serves as both a snuffer and a base.
          </p>
          <p className="text-limestone leading-relaxed mb-12">
            Nestled beside the candle is our signature minimal note card, printed on heavy, textured stock. A quiet, luxurious gesture that speaks volumes.
          </p>
          <Link 
            to="/collections" 
            className="inline-block border border-gold/30 hover:border-gold px-10 py-5 text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors"
          >
            Shop Premium Gifts
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="order-2 lg:order-1"
        >
          <h2 className="font-display text-3xl tracking-widest text-offwhite mb-6 uppercase">Corporate</h2>
          <p className="text-limestone leading-relaxed mb-8">
            Bespoke gifting for partners and teams. Custom branding. EU-wide logistics.
          </p>
          <p className="text-limestone leading-relaxed mb-12 italic">
            Contact the studio for a tailored proposal.
          </p>
          <Link 
            to="/contact" 
            className="inline-block border-b border-gold/30 hover:border-gold pb-1 text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors"
          >
            Enquire for Corporate
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="order-1 lg:order-2 flex justify-center"
        >
          <div className="w-72 md:w-80 aspect-[4/5] paper-texture p-10 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="text-center mb-16">
              <span className="text-[8px] uppercase tracking-[0.5em] text-charcoal/60 font-display">DAWL STUDIO</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-10 text-left">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/40 block">To:</span>
                <p className="text-[13px] text-charcoal font-serif italic">Our Valued Partners</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/40 block">Message:</span>
                <p className="text-[13px] text-charcoal font-serif italic leading-relaxed">With gratitude for your continued partnership. A moment of quiet luxury from Malta.</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/40 block">From:</span>
                <p className="text-[13px] text-charcoal font-serif italic">The Studio Team</p>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-charcoal/5 rounded-full flex items-center justify-center opacity-20 pointer-events-none">
              <span className="text-[8px] uppercase tracking-widest text-charcoal">Corporate Logo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
