import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-charcoal-light border-l border-gold/10 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <h2 className="font-display text-lg tracking-widest uppercase text-offwhite flex items-center gap-3">
                <ShoppingBag size={18} className="text-gold" />
                Sanctuary
              </h2>
              <button
                onClick={closeCart}
                className="text-limestone hover:text-gold transition-colors p-2"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 opacity-50">
                  <ShoppingBag size={48} strokeWidth={1} className="text-limestone" />
                  <p className="text-sm tracking-widest uppercase text-limestone">Your sanctuary is empty.</p>
                  <button
                    onClick={closeCart}
                    className="border-b border-gold/30 hover:border-gold pb-1 text-xs tracking-widest uppercase text-gold transition-colors"
                  >
                    Continue Exploring
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 aspect-[3/4] bg-charcoal relative overflow-hidden border border-gold/5">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-[10px] tracking-widest text-gold">
                            {item.product.scent}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col py-1">
                      <div className="flex justify-between items-start mb-1">
                        <Link 
                          to={`/product/${item.product.id}`} 
                          onClick={closeCart}
                          className="font-display text-sm tracking-widest text-offwhite hover:text-gold transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-limestone/50 hover:text-gold transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      
                      <p className="text-[9px] font-mono text-limestone/40 mb-1">
                        {item.product.id}
                      </p>
                      
                      <p className="text-[10px] text-limestone/60 tracking-widest uppercase mb-4">
                        {item.product.edition} — {item.product.color}
                      </p>

                      {item.giftCard && (
                        <div className="mb-4 p-3 bg-charcoal border border-gold/10 text-[10px] text-limestone italic font-serif leading-relaxed">
                          <span className="block text-gold/60 not-italic uppercase tracking-widest text-[8px] mb-1">Premium Note</span>
                          "To {item.giftCard.to}, {item.giftCard.message} - {item.giftCard.from}"
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-4 border border-gold/20 px-3 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-limestone hover:text-gold transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs text-offwhite w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-limestone hover:text-gold transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm text-limestone">{item.product.price}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gold/10 bg-charcoal">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs tracking-widest uppercase text-limestone">Subtotal</span>
                  <span className="font-display text-lg text-offwhite">€{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-limestone/50 tracking-widest uppercase text-center mb-6">
                  Shipping & taxes calculated at checkout
                </p>
                <Link 
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full py-4 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 text-center block"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
