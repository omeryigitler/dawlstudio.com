import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Package, ChevronRight, Truck, Calendar, Box, ExternalLink } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  items: string;
  createdAt: string;
  trackingNumber: string | null;
}

export function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/user/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-12 border-b border-gold/10 pb-8">
            <h1 className="font-display text-4xl md:text-6xl tracking-widest uppercase mb-4 gold-foil">
              MY ORDERS
            </h1>
            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-limestone">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link>
              <ChevronRight size={10} />
              <span className="text-gold">Order History</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-400/10 border border-red-400/20 p-6 text-red-400 text-xs tracking-widest uppercase text-center">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-gold/5 border border-gold/10">
              <Package size={48} className="text-gold/20 mx-auto mb-6" />
              <h2 className="text-xl tracking-widest uppercase text-offwhite mb-4">No Orders Found</h2>
              <p className="text-limestone text-xs tracking-widest uppercase mb-8">
                You haven't placed any orders yet.
              </p>
              <Link 
                to="/collections"
                className="px-8 py-4 border border-gold/30 hover:border-gold text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors duration-500"
              >
                Start Your Journey
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-charcoal-light border border-gold/10 p-6 md:p-8 hover:border-gold/30 transition-colors group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gold/10 flex items-center justify-center text-gold">
                        <Box size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm tracking-widest uppercase text-offwhite font-medium">
                            Order {order.id}
                          </h3>
                          <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full ${
                            order.status === 'shipped' ? 'text-gold border-gold/20' : 
                            order.status === 'delivered' ? 'text-emerald-400 border-emerald-400/20' : 
                            'text-limestone/60 border-gold/10'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase text-limestone/40">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-offwhite">
                            €{order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Link 
                        to={`/track/${order.id}`}
                        className="flex items-center gap-2 px-6 py-3 bg-gold/5 border border-gold/20 text-[10px] uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
                      >
                        <Truck size={14} />
                        Track Order
                      </Link>
                      <Link 
                        to={`/track/${order.id}`}
                        className="flex items-center gap-2 px-6 py-3 border border-limestone/10 text-[10px] uppercase tracking-widest text-limestone/60 hover:text-gold hover:border-gold/30 transition-colors"
                      >
                        <ExternalLink size={14} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
