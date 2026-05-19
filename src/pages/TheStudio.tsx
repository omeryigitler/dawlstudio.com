import { motion } from "motion/react";

export function TheStudio() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        className="text-center mb-32"
      >
        <h1 className="text-4xl md:text-6xl font-display tracking-[0.1em] mb-8">
          <span className="gold-foil">THE STUDIO</span>
        </h1>
        <p className="text-limestone text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
          Crafted in small batches in Malta. Quiet rituals. Architectural scents.
        </p>
      </motion.div>

      <div className="space-y-32">
        {/* Manifesto Block 1 */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <div className="aspect-square bg-charcoal-light border border-gold/5 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop" 
              alt="Studio Sanctuary" 
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-charcoal via-transparent to-gold/5 pointer-events-none" />
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-widest text-gold mb-6 uppercase">Sanctuary</h2>
            <p className="text-limestone leading-relaxed">
              We believe in the power of scent to transform a space into a sanctuary. Our candles are designed not just to fragrance a room, but to create an atmosphere of calm and considered luxury.
            </p>
          </div>
        </motion.div>

        {/* Manifesto Block 2 */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <div className="order-2 md:order-1">
            <h2 className="font-display text-2xl tracking-widest text-gold mb-6 uppercase">Materiality</h2>
            <p className="text-limestone leading-relaxed">
              Inspired by the sun-baked limestone of Malta, our vessels and packaging reflect a deep respect for natural materials. Matte finishes, heavy glass, and subtle gold foil details create a tactile experience before the candle is even lit.
            </p>
          </div>
          <div className="order-1 md:order-2 aspect-square bg-charcoal-light border border-gold/5 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop" 
              alt="Studio Materiality" 
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-charcoal via-transparent to-gold/5 pointer-events-none" />
          </div>
        </motion.div>

        {/* Manifesto Block 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-2xl tracking-widest text-gold mb-6 uppercase">Ritual</h2>
          <p className="text-limestone leading-relaxed">
            Lighting a Dawl Studio candle is a deliberate act. A moment to pause, to breathe, and to appreciate the warm glow of a carefully crafted object.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
