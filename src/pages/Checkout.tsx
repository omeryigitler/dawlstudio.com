import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { ChevronRight, Lock } from "lucide-react";

export function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      alert("Order placed successfully! Thank you for your purchase.");
      navigate("/");
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="font-display text-2xl tracking-widest uppercase text-gold mb-6">Your Sanctuary is Empty</h1>
        <p className="text-limestone text-sm tracking-widest uppercase mb-8 text-center max-w-md">
          Return to the collection to discover our signature scents and premium gifting options.
        </p>
        <Link 
          to="/collections"
          className="px-8 py-4 border border-gold/30 hover:border-gold text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors duration-500"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
      <div className="mb-12">
        <h1 className="font-display text-3xl md:text-4xl tracking-widest uppercase text-offwhite mb-4">Checkout</h1>
        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-limestone">
          <Link to="/collections" className="hover:text-gold transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-gold">Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePlaceOrder} className="space-y-12">
            {/* Contact Information */}
            <section>
              <h2 className="font-display text-lg tracking-widest uppercase text-gold mb-6 border-b border-gold/20 pb-4">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="font-display text-lg tracking-widest uppercase text-gold mb-6 border-b border-gold/20 pb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">First Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Address</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">City</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Postal Code</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Country</label>
                  <select 
                    required
                    className="w-full bg-charcoal border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light appearance-none"
                  >
                    <option value="TR">Turkey</option>
                    <option value="UK">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="EU">European Union</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section>
              <h2 className="font-display text-lg tracking-widest uppercase text-gold mb-6 border-b border-gold/20 pb-4 flex items-center justify-between">
                <span>Payment</span>
                <Lock size={14} className="text-limestone" />
              </h2>
              <div className="bg-charcoal-light p-6 border border-gold/10 space-y-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Card Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-mono tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Expiry Date</label>
                    <input 
                      type="text" 
                      required
                      placeholder="MM/YY"
                      className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-mono tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">CVC</label>
                    <input 
                      type="text" 
                      required
                      placeholder="123"
                      className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-mono tracking-widest"
                    />
                  </div>
                </div>
              </div>
            </section>

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-5 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Pay €${cartTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-charcoal-light border border-gold/10 p-8 sticky top-32">
            <h2 className="font-display text-lg tracking-widest uppercase text-gold mb-8">Order Summary</h2>
            
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 aspect-[3/4] bg-charcoal relative overflow-hidden border border-gold/5 shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-[8px] tracking-widest text-gold">
                          {item.product.scent}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-display text-xs tracking-widest text-offwhite">
                        {item.product.name}
                      </span>
                      <span className="text-xs text-limestone">{item.product.price}</span>
                    </div>
                    <p className="text-[9px] font-mono text-limestone/40 mb-1">
                      {item.product.id}
                    </p>
                    <p className="text-[9px] text-limestone/60 tracking-widest uppercase mb-1">
                      {item.product.edition} — {item.product.color}
                    </p>
                    <p className="text-[9px] text-limestone/60 tracking-widest uppercase">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-gold/10 pt-6 mb-6">
              <div className="flex justify-between items-center text-xs tracking-widest uppercase text-limestone">
                <span>Subtotal</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs tracking-widest uppercase text-limestone">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gold/20 pt-6">
              <span className="text-sm tracking-widest uppercase text-offwhite font-bold">Total</span>
              <span className="font-display text-xl text-gold">€{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
