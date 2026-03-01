import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../utils/cn";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { PRODUCTS } from "../constants/products";
import { useCart } from "../context/CartContext";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find(p => p.id === id);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gold tracking-widest uppercase text-xs">Product not found</p>
      </div>
    );
  }

  const isPremium = product.edition === "Premium";
  const color = product.color;
  const scent = product.scent;
  const name = product.name;
  const price = product.price;

  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [openAccordion, setOpenAccordion] = useState<string | null>("scent");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const giftCard = isPremium && (to || message || from) 
      ? { to, message, from } 
      : undefined;
      
    addToCart(product, quantity, giftCard);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16">
        
        {/* Left: Visuals */}
        <div className="relative aspect-[3/2] lg:aspect-auto lg:h-[80vh] flex items-center justify-center overflow-hidden border border-gold/10">
          {product.image ? (
            <motion.img 
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.05 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
              className={cn(
                "w-48 h-64 rounded-sm shadow-2xl relative flex flex-col items-center justify-center bg-charcoal-light",
                color === "White" ? "bg-stone" : "bg-charcoal border border-limestone/20"
              )}
            >
              {isPremium && (
                <div className="absolute -top-2 w-[104%] h-6 bg-gradient-to-r from-gold via-gold-light to-gold rounded-t-sm shadow-[0_-4px_20px_rgba(223,185,114,0.4)]" />
              )}
              <div className="w-24 h-32 border border-gold/40 flex items-center justify-center">
                <span className={cn(
                  "font-display text-xl tracking-widest",
                  color === "White" ? "text-charcoal" : "text-gold"
                )}>
                  {scent}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-display tracking-[0.1em] gold-foil mb-4 inline-block">
              {name}
            </h1>
            <div className="flex items-center gap-4 text-xs tracking-widest uppercase text-limestone mb-6">
              <span>{isPremium ? "Premium Gift Edition" : "Retail Edition"}</span>
              <span className="w-1 h-1 bg-gold rounded-full" />
              <span>{color}</span>
              <span className="w-1 h-1 bg-gold rounded-full" />
              <span>220g</span>
            </div>
            {isPremium && (
              <div className="mb-6 flex flex-col gap-2">
                <div className="inline-block px-3 py-1 border border-gold/30 bg-gold/5 rounded-sm w-fit">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                    Customizable Gift Card Included
                  </p>
                </div>
                <div className="inline-block px-3 py-1 border border-gold/30 bg-gold/5 rounded-sm w-fit">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
                    Signature Gold Lid Included
                  </p>
                </div>
              </div>
            )}
            <p className="text-xl text-offwhite font-light tracking-wide mb-2">{price}</p>
            <p className="text-[10px] font-mono text-limestone/40">{id}</p>
          </div>

          <div className="mb-12 flex gap-4">
            <div className="flex items-center justify-between border border-gold/30 px-4 py-3 w-32">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-limestone hover:text-gold transition-colors p-1"
              >
                <Minus size={14} />
              </button>
              <span className="text-xs text-offwhite font-mono">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="text-limestone hover:text-gold transition-colors p-1"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-4 border border-gold/30 hover:border-gold text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors duration-500 relative overflow-hidden group"
            >
              <span className="relative z-10">Add to Sanctuary</span>
              <div className="absolute inset-0 bg-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.76,0,0.24,1]" />
            </button>
          </div>

          {/* Premium Note Card Customiser */}
          {isPremium && (
            <div className="mb-16 border border-gold/20 p-8 relative overflow-hidden bg-charcoal-light/30">
              <div className="absolute top-0 left-0 w-full h-[1px] gold-line" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-display text-sm tracking-widest text-gold uppercase">Premium Gifting</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
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
                      <div className="text-[10px] text-limestone/40 text-right">{message.length}/150</div>
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

                  <div className="pt-4 border-t border-gold/10">
                    <p className="text-[10px] text-limestone/50 uppercase tracking-widest leading-relaxed">
                      Bespoke branding for corporate orders. 
                      <Link to="/contact" className="text-gold ml-1 hover:text-gold-light transition-colors">Enquire here.</Link>
                    </p>
                  </div>
                </div>

                {/* Live Card Preview */}
                <div className="flex justify-center items-center p-4">
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
          )}

          {/* Accordions */}
          <div className="border-t border-gold/10">
            {[
              { id: "scent", title: "Scent Profile", content: product.description || "" },
              { id: "craft", title: "Craft & Materials", content: "Hand-poured in small batches in our Malta studio. We use a proprietary blend of natural waxes and premium fragrance oils. The vessel is crafted to be repurposed." },
              { id: "care", title: "Candle Care", content: "For the first burn, allow the wax to melt to the edges of the vessel. Trim the wick to 5mm before each use. Do not burn for more than 4 hours at a time." },
              { id: "shipping", title: "Shipping & Returns", content: "Complimentary shipping within Malta and Gozo. EU shipping calculated at checkout. Returns accepted within 14 days for unused products in original packaging." }
            ].map((acc) => (
              <div key={acc.id} className="border-b border-gold/10">
                <button 
                  onClick={() => toggleAccordion(acc.id)}
                  className="w-full py-6 flex justify-between items-center text-left group"
                >
                  <span className="text-xs tracking-[0.2em] uppercase text-offwhite group-hover:text-gold transition-colors">
                    {acc.title}
                  </span>
                  {openAccordion === acc.id ? (
                    <ChevronUp size={16} className="text-gold" />
                  ) : (
                    <ChevronDown size={16} className="text-limestone group-hover:text-gold transition-colors" />
                  )}
                </button>
                <AnimatePresence>
                  {openAccordion === acc.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-sm text-limestone leading-relaxed whitespace-pre-line">
                        {acc.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
