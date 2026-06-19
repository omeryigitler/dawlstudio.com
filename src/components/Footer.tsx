import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-charcoal-light border-t border-gold/10 py-16 px-6 md:px-12 mt-32 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="font-display text-2xl tracking-widest gold-foil mb-4 inline-block">DAWL STUDIO</h2>
          <p className="text-limestone text-sm leading-relaxed max-w-sm">
            Hand-poured luxury candles made in Malta. Quiet rituals, architectural scents, and warm ambient light.
          </p>
          <div className="mt-8 flex gap-4">
            <input 
              type="email" 
              placeholder="Join the sanctuary" 
              className="bg-transparent border-b border-limestone/30 focus:border-gold outline-none text-sm py-2 px-1 w-64 text-offwhite placeholder:text-limestone/50 transition-colors"
            />
            <button className="text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-display tracking-[0.2em] text-limestone mb-6 uppercase">Explore</h3>
          <ul className="space-y-4 text-sm text-stone/80">
            <li><Link to="/collections" className="hover:text-gold transition-colors">Collections</Link></li>
            <li><Link to="/studio" className="hover:text-gold transition-colors">The Studio</Link></li>
            <li><Link to="/scents" className="hover:text-gold transition-colors">Scent Library</Link></li>
            <li><Link to="/gifting" className="hover:text-gold transition-colors">Gifting</Link></li>
            <li><Link to="/stockists" className="hover:text-gold transition-colors">Stockists & Wholesale</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-display tracking-[0.2em] text-limestone mb-6 uppercase">Support</h3>
          <ul className="space-y-4 text-sm text-stone/80">
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            <li><Link to="/track" className="hover:text-gold transition-colors">Track Order</Link></li>
            <li><Link to="/support" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/support" className="hover:text-gold transition-colors">Candle Care</Link></li>
            <li><Link to="/legal" className="hover:text-gold transition-colors">Privacy & Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-limestone/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-limestone/60 uppercase tracking-widest text-center md:text-left">
          &copy; {new Date().getFullYear()} DAWL STUDIO. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-limestone/60 uppercase tracking-widest">
          <a href="#" className="hover:text-gold transition-colors">Instagram</a>
          <a href="#" className="hover:text-gold transition-colors">Pinterest</a>
        </div>
      </div>

      <p className="max-w-7xl mx-auto mt-8 text-center text-xs text-limestone/50 tracking-widest">
        Designed &amp; Developed by{" "}
        <a
          href="https://omeryigitler.com"
          target="_blank"
          rel="noopener noreferrer"
          className="gold-foil inline-block text-[1.2em] hover:opacity-80 transition-opacity duration-300"
        >
          Ömer YİĞİTLER
        </a>
      </p>
    </footer>
  );
}
