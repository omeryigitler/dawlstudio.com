import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart on successful return
    clearCart();

    // Fetch most recent order for the user
    const fetchRecentOrder = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("/api/user/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = await response.json();
        if (orders && orders.length > 0) {
          setOrderId(orders[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch recent order", err);
      }
    };

    fetchRecentOrder();
  }, [clearCart]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-12"
      >
        <CheckCircle2 size={64} className="text-gold mx-auto mb-6" />
        <h1 className="font-display text-3xl md:text-4xl tracking-[0.3em] uppercase text-offwhite mb-4">Payment Successful</h1>
        <p className="text-gold text-xs tracking-[0.2em] uppercase mb-8">Your sanctuary is being prepared.</p>
        <div className="max-w-md mx-auto text-limestone text-[10px] leading-relaxed tracking-widest uppercase mb-12">
          Thank you for your purchase. A confirmation email has been sent to your inbox. Your signature scents will be dispatched within 48 hours.
        </div>

        {orderId && (
          <div className="bg-gold/5 border border-gold/10 p-8 rounded-2xl max-w-sm mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 text-gold mb-4">
              <Package size={20} />
              <span className="text-xs uppercase tracking-widest font-bold">Order: {orderId}</span>
            </div>
            <Link 
              to={`/track/${orderId}`}
              className="flex items-center justify-center gap-2 text-gold hover:text-gold-light transition-colors text-[10px] uppercase tracking-widest font-bold"
            >
              Track Your Journey <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </motion.div>
      
      <Link 
        to="/"
        className="px-8 py-4 border border-gold/30 hover:border-gold text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors duration-500"
      >
        Return Home
      </Link>
    </div>
  );
}
