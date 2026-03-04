import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, ArrowLeft } from "lucide-react";

interface OrderUpdate {
  id: number;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface OrderData {
  id: string;
  status: string;
  total: number;
  carrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updates: OrderUpdate[];
}

export function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) throw new Error("Order not found");
        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-32 px-6 text-center">
        <h1 className="font-display text-4xl gold-foil mb-6">ORDER NOT FOUND</h1>
        <p className="text-limestone/60 mb-8 tracking-widest uppercase">We couldn't find an order with that ID.</p>
        <Link to="/" className="text-gold hover:text-gold-light tracking-widest uppercase text-xs">Return to Home</Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={20} />;
      case 'shipped': return <Truck size={20} />;
      case 'delivered': return <CheckCircle2 size={20} />;
      default: return <Package size={20} />;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-limestone/40 hover:text-gold transition-colors mb-12 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.2em]">Back to Sanctuary</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gold/10 pb-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Order Tracking</p>
              <h1 className="font-display text-4xl md:text-5xl tracking-widest uppercase gold-foil">
                {order.id}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-limestone/40 mb-1">Status</p>
              <span className="text-xs tracking-[0.2em] uppercase text-gold px-4 py-1 border border-gold/20 rounded-full">
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gold/5 p-6 border border-gold/10 rounded-2xl">
              <p className="text-[10px] tracking-[0.2em] uppercase text-limestone/40 mb-4">Carrier</p>
              <p className="text-sm tracking-widest uppercase text-offwhite">{order.carrier || 'Processing...'}</p>
            </div>
            <div className="bg-gold/5 p-6 border border-gold/10 rounded-2xl">
              <p className="text-[10px] tracking-[0.2em] uppercase text-limestone/40 mb-4">Tracking Number</p>
              <p className="text-sm tracking-widest uppercase text-gold">{order.trackingNumber || 'Awaiting Shipment'}</p>
            </div>
            <div className="bg-gold/5 p-6 border border-gold/10 rounded-2xl">
              <p className="text-[10px] tracking-[0.2em] uppercase text-limestone/40 mb-4">Estimated Delivery</p>
              <p className="text-sm tracking-widest uppercase text-offwhite">3-5 Business Days</p>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-xs tracking-[0.4em] uppercase text-limestone/60 border-b border-gold/10 pb-4">Journey Timeline</h2>
            <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-gold/10">
              {order.updates.map((update, index) => (
                <div key={update.id} className="relative flex gap-8">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${index === 0 ? 'bg-gold text-charcoal' : 'bg-charcoal border border-gold/20 text-gold/40'}`}>
                    {getStatusIcon(update.status)}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h3 className={`text-sm tracking-widest uppercase ${index === 0 ? 'text-gold' : 'text-offwhite'}`}>
                        {update.description}
                      </h3>
                      <span className="text-[10px] tracking-widest uppercase text-limestone/40">
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-limestone/40">
                      <MapPin size={12} />
                      <span className="text-[10px] tracking-widest uppercase">{update.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
