import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Menu, User, X, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function Navbar() {
  const { openCart, cartItems } = useCart();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 2.5, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 right-0 z-40 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-charcoal/80 to-transparent backdrop-blur-sm"
      >
        <div className="flex items-center gap-8">
          <button 
            className="text-limestone hover:text-gold transition-colors duration-500 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
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
            <Link to="/track" className="hover:text-gold transition-colors duration-500">Track</Link>
            <Link to="/contact" className="hover:text-gold transition-colors duration-500">Contact</Link>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link 
                    to="/admin"
                    className="text-gold hover:text-gold-light transition-colors duration-500"
                    title="Admin Panel"
                  >
                    <LayoutDashboard size={18} strokeWidth={1.5} />
                  </Link>
                )}
                <Link 
                  to="/orders"
                  className="text-limestone hover:text-gold transition-colors duration-500"
                  title="My Orders"
                >
                  <Package size={18} strokeWidth={1.5} />
                </Link>
                <span className="text-[10px] tracking-widest uppercase text-gold hidden lg:block">
                  {user.firstName}
                </span>
                <button 
                  onClick={() => {
                    logout();
                    showToast("Signed out successfully", "info");
                  }}
                  className="text-limestone hover:text-gold transition-colors duration-500"
                  title="Sign Out"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="text-limestone hover:text-gold transition-colors duration-500"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
            )}
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 bg-charcoal z-50 flex flex-col px-6 py-8 md:hidden overflow-hidden"
          >
            <div className="flex items-center justify-between relative">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-limestone hover:text-gold transition-colors duration-500"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
              <span className="font-display text-xl tracking-[0.2em] gold-foil absolute left-1/2 -translate-x-1/2">
                DAWL
              </span>
              <div className="w-5"></div>
            </div>

            <div className="flex flex-col gap-8 text-2xl font-display tracking-widest uppercase text-limestone items-center justify-center flex-1 mt-8">
              <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors duration-500">Shop</Link>
              <Link to="/studio" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors duration-500">Studio</Link>
              <Link to="/scents" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors duration-500">Scents</Link>
              <Link to="/gifting" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors duration-500">Gifting</Link>
              <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors duration-500">Track</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition-colors duration-500">Contact</Link>
            </div>

            <div className="mt-auto pt-8 border-t border-gold/10 flex flex-col items-center gap-6 text-xs tracking-widest uppercase text-limestone">
              {user ? (
                <div className="flex flex-col items-center gap-4">
                  <span className="text-gold">{user.firstName} {user.lastName}</span>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gold hover:text-gold-light transition-colors duration-500"
                    >
                      <LayoutDashboard size={16} strokeWidth={1.5} />
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    to="/orders" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 hover:text-gold transition-colors duration-500"
                  >
                    <Package size={16} strokeWidth={1.5} />
                    My Orders
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      showToast("Signed out successfully", "info");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 hover:text-gold transition-colors duration-500"
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 hover:text-gold transition-colors duration-500">
                  <User size={16} strokeWidth={1.5} />
                  Sign In / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
