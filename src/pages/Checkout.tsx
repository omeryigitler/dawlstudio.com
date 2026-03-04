import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";
import { ChevronRight, Lock, CreditCard, Apple } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// We'll initialize this later once we have the key
let stripePromise: Promise<any> | null = null;
const getStripePromise = async () => {
  if (!stripePromise) {
    try {
      const res = await fetch("/api/config");
      const { publishableKey } = await res.json();
      if (publishableKey) {
        stripePromise = loadStripe(publishableKey);
      } else {
        console.error("[DAWL] Stripe publishable key not found in config");
      }
    } catch (err) {
      console.error("[DAWL] Failed to fetch Stripe config", err);
    }
  }
  return stripePromise;
};

function PaymentForm({ amount, cartItems, formData, onSuccess }: { amount: number; cartItems: any[]; formData: any; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        // Create order in database
        const token = localStorage.getItem("token");
        await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cartItems,
            total: amount,
            shippingAddress: formData,
          }),
        });
        onSuccess();
      } catch (err) {
        console.error("Order creation failed", err);
        // Still call onSuccess because payment was successful
        onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-charcoal-light p-6 border border-gold/10">
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="text-red-400 text-[10px] uppercase tracking-widest bg-red-400/10 p-4 border border-red-400/20">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-5 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
      >
        <span className="relative z-10">
          {isProcessing ? "Processing Transaction..." : `Complete Purchase — €${amount.toFixed(2)}`}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      </button>

      <div className="flex items-center justify-center gap-4 opacity-40">
        <CreditCard size={16} />
        <Apple size={16} />
        <div className="text-[8px] uppercase tracking-[0.2em]">Secure Encrypted Payment</div>
      </div>
    </form>
  );
}

export function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    country: "Ireland",
  });

  useEffect(() => {
    getStripePromise().then(promise => {
      if (promise) setStripeInstance(promise);
    });
  }, []);

  useEffect(() => {
    if (cartItems.length > 0 && !clientSecret) {
      // SECURITY: Send items to server so it can calculate the total itself
      // and prevent client-side price manipulation.
      const items = cartItems.map(item => ({
        id: item.product.id,
        price: parseFloat(item.product.price.replace('€', '')),
        quantity: item.quantity
      }));

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Payment initialization failed");
          return res.json();
        })
        .then((data) => setClientSecret(data.clientSecret))
        .catch(err => console.error("[DAWL] Failed to fetch payment intent", err));
    }
  }, [cartItems, clientSecret]);

  const handleSuccess = () => {
    clearCart();
    navigate("/checkout/success");
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

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#C5A059',
      colorBackground: '#1A1A1A',
      colorText: '#F5F5F0',
      colorDanger: '#df1b41',
      fontFamily: 'Manrope, sans-serif',
      spacingUnit: '4px',
      borderRadius: '0px',
    },
    rules: {
      '.Input': {
        border: 'none',
        borderBottom: '1px solid rgba(197, 160, 89, 0.3)',
        boxShadow: 'none',
        transition: 'border-color 0.2s ease',
      },
      '.Input:focus': {
        borderBottom: '1px solid #C5A059',
        boxShadow: 'none',
      },
      '.Label': {
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'rgba(169, 165, 160, 0.6)',
        marginBottom: '8px',
      },
      '.Tab': {
        border: '1px solid rgba(197, 160, 89, 0.1)',
        backgroundColor: 'transparent',
      },
      '.Tab--selected': {
        border: '1px solid #C5A059',
        backgroundColor: 'rgba(197, 160, 89, 0.05)',
      }
    }
  };

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
          <div className="space-y-12">
            {/* Contact & Shipping Information (Static for now, could be expanded) */}
            <section>
              <h2 className="font-display text-lg tracking-widest uppercase text-gold mb-6 border-b border-gold/20 pb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                    placeholder="John Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Shipping Address</label>
                  <input 
                    type="text" 
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                    placeholder="123 Sanctuary St"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">City</label>
                  <input 
                    type="text" 
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                    placeholder="Dublin"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-limestone/60 mb-2">Country</label>
                  <input 
                    type="text" 
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-transparent border-b border-gold/30 pb-2 text-offwhite focus:outline-none focus:border-gold transition-colors font-light"
                    placeholder="Ireland"
                  />
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section>
              <h2 className="font-display text-lg tracking-widest uppercase text-gold mb-6 border-b border-gold/20 pb-4 flex items-center justify-between">
                <span>Secure Payment</span>
                <Lock size={14} className="text-limestone" />
              </h2>
              
              {clientSecret && stripeInstance ? (
                <Elements stripe={stripeInstance} options={{ clientSecret, appearance }}>
                  <PaymentForm 
                    amount={cartTotal} 
                    cartItems={cartItems}
                    formData={formData}
                    onSuccess={handleSuccess} 
                  />
                </Elements>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-charcoal-light border border-gold/10 animate-pulse">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
                  <div className="text-[10px] uppercase tracking-widest text-gold/60">Initializing Secure Vault...</div>
                </div>
              )}
            </section>
          </div>
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
                        referrerPolicy="no-referrer"
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
