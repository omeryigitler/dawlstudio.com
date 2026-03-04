import { motion } from "motion/react";
import { Link } from "react-router-dom";

const SCENTS = [
  {
    id: "01",
    name: "Cedarwood — Amber",
    mood: "Grounding, Warm, Enveloping",
    notes: [
      "Top: Bergamot, Black Pepper",
      "Heart: Cedarwood, Amber",
      "Base: Vetiver, Musk"
    ],
    spaces: "Living Room, Study, Bedroom",
    description: "A grounding, warm scent evoking the quiet sanctuary of a Maltese palazzo at dusk. The rich, woody notes of cedar are softened by the golden warmth of amber."
  },
  {
    id: "02",
    name: "Limestone — Frankincense",
    mood: "Mineral, Airy, Ancient",
    notes: [
      "Top: Lemon, Sea Salt",
      "Heart: Frankincense, Limestone Accord",
      "Base: Sandalwood, Myrrh"
    ],
    spaces: "Bathroom, Entryway, Studio",
    description: "A mineral, airy scent capturing the essence of sun-baked limestone and ancient rituals. Crisp sea salt and bright lemon give way to the deep, resinous calm of frankincense."
  }
];

export function ScentLibrary() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <header className="mb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-display tracking-[0.1em] mb-6">
          <span className="gold-foil">SCENT LIBRARY</span>
        </h1>
        <p className="text-limestone text-sm tracking-widest uppercase max-w-xl mx-auto">
          Two distinct olfactory landscapes.
        </p>
      </header>

      <div className="space-y-48">
        {SCENTS.map((scent, idx) => (
          <motion.div 
            key={scent.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className={`order-2 ${idx % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
              <div className="mb-8">
                <span className="font-display text-4xl text-gold/20 block mb-4">{scent.id}</span>
                <h2 className="font-display text-3xl tracking-widest text-offwhite mb-4">{scent.name}</h2>
                <p className="text-sm text-gold tracking-widest uppercase">{scent.mood}</p>
              </div>
              
              <p className="text-limestone leading-relaxed mb-12 max-w-md">
                {scent.description}
              </p>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xs font-display tracking-[0.2em] text-offwhite mb-4 uppercase">Notes</h3>
                  <ul className="space-y-2 text-sm text-limestone">
                    {scent.notes.map(note => <li key={note}>{note}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-display tracking-[0.2em] text-offwhite mb-4 uppercase">Ideal Spaces</h3>
                  <p className="text-sm text-limestone">{scent.spaces}</p>
                </div>
              </div>

              <Link 
                to="/collections" 
                className="inline-block border-b border-gold/30 hover:border-gold pb-1 text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors"
              >
                Explore Scent {scent.id}
              </Link>
            </div>

            <div className={`order-1 ${idx % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} aspect-square bg-charcoal-light border border-gold/5 relative overflow-hidden flex items-center justify-center`}>
              <img 
                src={`https://picsum.photos/seed/scent${scent.id}/800/800`} 
                alt={scent.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-40 hover:opacity-80 transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-transparent to-gold/5 pointer-events-none" />
              <span className="absolute font-display text-8xl text-gold/10 mix-blend-overlay pointer-events-none">{scent.id}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
