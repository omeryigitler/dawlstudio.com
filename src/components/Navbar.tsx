import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "../context/CartContext";

export function Navbar() {
  const { openCart, cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 2.5, ease: [0.76, 0, 0.24, 1] }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-charcoal/80 to-transparent backdrop-blur-sm"
    >
      <div className="flex items-center gap-8">
        <div className="flex flex-wrap gap-x-3 gap-y-1 md:gap-6 text-[9px] md:text-xs tracking-widest uppercase text-limestone max-w-[35vw] md:max-w-none">
          <Link to="/collections" className="hover:text-gold transition-colors duration-500">Shop</Link>
          <Link to="/studio" className="hover:text-gold transition-colors duration-500">Studio</Link>
          <Link to="/scents" className="hover:text-gold transition-colors duration-500">Scents</Link>
          <Link to="/gifting" className="hover:text-gold transition-colors duration-500">Gifting</Link>
          <Link to="/contact" className="hover:text-gold transition-colors duration-500">Contact</Link>
        </div>
      </div>

      <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
        <span className="font-display text-xl tracking-[0.2em] gold-foil">
          DAWL
        </span>
      </Link>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          <Link 
            to="/login"
            className="text-limestone hover:text-gold transition-colors duration-500"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>
          <button 
            onClick={openCart}
            className="text-limestone hover:text-gold transition-colors duration-500 relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-charcoal text-[9px] font-bold flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
