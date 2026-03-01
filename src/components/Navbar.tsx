import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShoppingBag, Menu } from "lucide-react";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 2.5, ease: [0.76, 0, 0.24, 1] }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-charcoal/80 to-transparent backdrop-blur-sm"
    >
      <div className="flex items-center gap-8">
        <button className="text-limestone hover:text-gold transition-colors duration-500">
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <div className="hidden md:flex gap-6 text-xs tracking-widest uppercase text-limestone">
          <Link to="/collections" className="hover:text-gold transition-colors duration-500">Shop</Link>
          <Link to="/studio" className="hover:text-gold transition-colors duration-500">Studio</Link>
          <Link to="/scents" className="hover:text-gold transition-colors duration-500">Scents</Link>
        </div>
      </div>

      <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
        <span className="font-display text-xl tracking-[0.2em] gold-foil">
          DAWL
        </span>
      </Link>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-6 text-xs tracking-widest uppercase text-limestone">
          <Link to="/gifting" className="hover:text-gold transition-colors duration-500">Gifting</Link>
          <Link to="/contact" className="hover:text-gold transition-colors duration-500">Contact</Link>
        </div>
        <button className="text-limestone hover:text-gold transition-colors duration-500 relative">
          <ShoppingBag size={20} strokeWidth={1.5} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full opacity-0"></span>
        </button>
      </div>
    </motion.nav>
  );
}
