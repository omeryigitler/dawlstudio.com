import { motion } from "motion/react";

export function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <header className="mb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-display tracking-[0.1em] mb-6">
          <span className="gold-foil">GET IN TOUCH</span>
        </h1>
        <p className="text-limestone text-sm tracking-widest uppercase max-w-xl mx-auto">
          We are here to assist you.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <h2 className="font-display text-xl tracking-widest text-gold mb-8 uppercase">The Studio</h2>
          <div className="space-y-6 text-sm text-limestone leading-relaxed">
            <p>
              Dawl Studio<br />
              Valletta, Malta<br />
              (By appointment only)
            </p>
            <p>
              <a href="mailto:hello@dawlstudio.com" className="hover:text-gold transition-colors">hello@dawlstudio.com</a>
            </p>
            <div className="pt-8 border-t border-gold/10">
              <h3 className="font-display text-xs tracking-[0.2em] text-offwhite mb-4 uppercase">Shipping</h3>
              <p className="mb-2">Complimentary delivery across Malta & Gozo.</p>
              <p>EU shipping calculated at checkout.</p>
            </div>
            <div className="pt-8 border-t border-gold/10">
              <h3 className="font-display text-xs tracking-[0.2em] text-offwhite mb-4 uppercase">Social</h3>
              <div className="flex gap-6">
                <a href="#" className="hover:text-gold transition-colors uppercase tracking-widest">Instagram</a>
                <a href="#" className="hover:text-gold transition-colors uppercase tracking-widest">Pinterest</a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <form className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full bg-transparent border-b border-limestone/30 focus:border-gold outline-none py-2 text-offwhite transition-colors"
                required
              />
            </div>
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
              <label htmlFor="inquiry" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Inquiry Type</label>
              <select 
                id="inquiry" 
                className="w-full bg-charcoal border-b border-limestone/30 focus:border-gold outline-none py-2 text-offwhite transition-colors appearance-none"
              >
                <option value="general">General Inquiry</option>
                <option value="order">Order Support</option>
                <option value="corporate">Corporate Gifting</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-display tracking-[0.2em] text-limestone mb-2 uppercase">Message</label>
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
              <span className="relative z-10">Send Message</span>
              <div className="absolute inset-0 bg-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.76,0,0.24,1]" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
