import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../utils/cn";
import { PRODUCTS } from "../constants/products";

export function Collections() {
  const [filterEdition, setFilterEdition] = useState<"All" | "Retail" | "Premium">("All");
  const [filterColor, setFilterColor] = useState<"All" | "White" | "Black">("All");
  const [filterScent, setFilterScent] = useState<"All" | "01" | "02">("All");

  const filteredSkus = PRODUCTS.filter(sku => {
    if (filterEdition !== "All" && sku.edition !== filterEdition) return false;
    if (filterColor !== "All" && sku.color !== filterColor) return false;
    if (filterScent !== "All" && sku.scent !== filterScent) return false;
    return true;
  });

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-12">
      <header className="mb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-display tracking-[0.1em] mb-6">
          <span className="gold-foil">THE COLLECTION</span>
        </h1>
        <p className="text-limestone text-sm tracking-widest uppercase max-w-xl mx-auto">
          Hand-poured in Malta. 220g of quiet luxury.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col items-center mb-24">
        <div className="flex flex-wrap justify-center gap-12 text-sm tracking-[0.2em] uppercase border-y border-gold/10 py-8 w-full mb-8">
          <div className="flex gap-6 items-center">
            <span className="text-limestone/50 font-medium">Edition:</span>
            {["All", "Retail", "Premium"].map(ed => (
              <button 
                key={ed}
                onClick={() => setFilterEdition(ed as any)}
                className={cn(
                  "transition-colors duration-500 font-display text-base",
                  filterEdition === ed ? "text-gold" : "text-limestone hover:text-offwhite"
                )}
              >
                {ed}
              </button>
            ))}
          </div>
          <div className="flex gap-6 items-center">
            <span className="text-limestone/50 font-medium">Color:</span>
            {["All", "White", "Black"].map(c => (
              <button 
                key={c}
                onClick={() => setFilterColor(c as any)}
                className={cn(
                  "transition-colors duration-500 font-display text-base",
                  filterColor === c ? "text-gold" : "text-limestone hover:text-offwhite"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-6 items-center">
            <span className="text-limestone/50 font-medium">Scent:</span>
            {["All", "01", "02"].map(s => (
              <button 
                key={s}
                onClick={() => setFilterScent(s as any)}
                className={cn(
                  "transition-colors duration-500 font-display text-base",
                  filterScent === s ? "text-gold" : "text-limestone hover:text-offwhite"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Product Count Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={`${filteredSkus.length}-${PRODUCTS.length}`}
          className="flex items-center gap-3 text-limestone"
        >
          <span className="font-display text-2xl text-gold">{filteredSkus.length}</span>
          <span className="text-sm tracking-[0.2em] uppercase opacity-40">/</span>
          <span className="font-display text-xl opacity-60">{PRODUCTS.length}</span>
          <span className="text-[10px] tracking-[0.3em] uppercase ml-2 opacity-50">Products</span>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
        {filteredSkus.map((sku, idx) => (
          <motion.div 
            key={sku.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.76, 0, 0.24, 1] }}
            className="group flex flex-col"
          >
            <Link to={`/product/${sku.id}`} className="relative aspect-[3/2] mb-6 overflow-hidden border border-gold/5 group-hover:border-gold/30 transition-colors duration-700 flex items-center justify-center">
              {sku.image ? (
                <img 
                  src={sku.image} 
                  alt={sku.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                /* Placeholder for actual 3D render/photo */
                <div className={cn(
                  "w-32 h-40 rounded-sm shadow-2xl relative flex flex-col items-center justify-center transition-transform duration-1000 group-hover:scale-105 bg-charcoal-light",
                  sku.color === "White" ? "bg-stone" : "bg-charcoal border border-limestone/20"
                )}>
                  {sku.edition === "Premium" && (
                    <div className="absolute -top-1 w-[102%] h-4 bg-gradient-to-r from-gold via-gold-light to-gold rounded-t-sm shadow-[0_-2px_10px_rgba(223,185,114,0.3)]" />
                  )}
                  <div className="w-16 h-20 border border-gold/40 flex items-center justify-center">
                    <span className={cn(
                      "font-display text-xs tracking-widest",
                      sku.color === "White" ? "text-charcoal" : "text-gold"
                    )}>
                      {sku.scent}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end justify-center pb-8">
                <span className="text-xs tracking-[0.2em] uppercase text-gold">View Details</span>
              </div>
            </Link>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="font-display text-sm tracking-widest text-offwhite">{sku.name}</h3>
                <span className="text-sm text-limestone">{sku.price}</span>
              </div>
              <p className="text-xs text-limestone/60 tracking-widest uppercase">
                {sku.edition} Edition — {sku.color} — {sku.size}
              </p>
              <p className="text-[10px] font-mono text-limestone/40 mt-2">{sku.id}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
