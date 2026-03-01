import { motion } from "motion/react";

export function Stockists() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <header className="mb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-display tracking-[0.1em] mb-6">
          <span className="gold-foil">STOCKISTS</span>
        </h1>
        <p className="text-limestone text-sm tracking-widest uppercase max-w-xl mx-auto">
          Find Dawl Studio in select locations.
        </p>
      </header>

      <div className="space-y-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl tracking-widest text-gold mb-12 uppercase text-center">Malta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center md:text-left">
              <h3 className="font-display text-lg tracking-widest text-offwhite mb-4">The Phoenicia Malta</h3>
              <p className="text-limestone text-sm leading-relaxed">
                The Mall<br />
                Floriana FRN 1478<br />
                Malta
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-display text-lg tracking-widest text-offwhite mb-4">Iniala Harbour House</h3>
              <p className="text-limestone text-sm leading-relaxed">
                11 St. Barbara Bastion<br />
                Valletta VLT 1961<br />
                Malta
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-display text-lg tracking-widest text-offwhite mb-4">Cugo Gran Macina</h3>
              <p className="text-limestone text-sm leading-relaxed">
                Triq Il-31 ta' Marzu<br />
                Senglea ISL 1040<br />
                Malta
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-t border-gold/10 pt-32"
        >
          <h2 className="font-display text-2xl tracking-widest text-gold mb-8 uppercase text-center">Wholesale & Corporate</h2>
          <p className="text-limestone text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            We partner with select boutiques, luxury hotels, and corporate clients who share our appreciation for quiet luxury and considered design.
          </p>

          <form className="max-w-2xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="company" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Company Name</label>
                <input 
                  type="text" 
                  id="company" 
                  className="w-full bg-transparent border-b border-limestone/30 focus:border-gold outline-none py-2 text-offwhite transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="contactName" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Contact Name</label>
                <input 
                  type="text" 
                  id="contactName" 
                  className="w-full bg-transparent border-b border-limestone/30 focus:border-gold outline-none py-2 text-offwhite transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="email" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full bg-transparent border-b border-limestone/30 focus:border-gold outline-none py-2 text-offwhite transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="interest" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Interest</label>
                <select 
                  id="interest" 
                  className="w-full bg-charcoal border-b border-limestone/30 focus:border-gold outline-none py-2 text-offwhite transition-colors appearance-none"
                >
                  <option value="retail">Retail Stockist</option>
                  <option value="hotel">Hotel Amenities</option>
                  <option value="corporate">Corporate Gifting (with custom note cards)</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Message / Details</label>
              <textarea 
                id="message" 
                rows={4}
                className="w-full bg-transparent border-b border-limestone/30 focus:border-gold outline-none py-2 text-offwhite transition-colors resize-none"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 border border-gold/30 hover:border-gold text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors duration-500 relative overflow-hidden group"
            >
              <span className="relative z-10">Submit Inquiry</span>
              <div className="absolute inset-0 bg-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.76,0,0.24,1]" />
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
