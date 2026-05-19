import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";
import {
  getCarrierCustomerNote,
  getShipmentStatusLabel,
  type TrackingEvent,
  type TrackingProviderType,
} from "../utils/carriers";

interface LiveTrackingSnapshot {
  providerConnected: boolean;
  providerType: TrackingProviderType;
  provider?: string | null;
  status?: string | null;
  message: string;
  events: TrackingEvent[];
}

interface PublicTrackingData {
  id: string;
  orderNumber: string;
  orderStatus: string;
  shipmentStatus: string;
  shipmentStatusLabel: string;
  shippingCountry?: string | null;
  shippingMethod?: string | null;
  carrier?: string | null;
  carrierKey?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  trackingProviderType: TrackingProviderType;
  estimatedDelivery?: string | null;
  lastUpdated?: string | null;
  customerNote?: string | null;
  trackingEvents: TrackingEvent[];
  liveTracking?: LiveTrackingSnapshot;
}

const progressSteps = [
  "order_confirmed",
  "preparing_shipment",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const statusRank: Record<string, number> = {
  pending_payment: 0,
  paid: 1,
  order_confirmed: 1,
  preparing_shipment: 2,
  shipped: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
  delayed: 4,
  exception: 4,
};

function formatDate(value?: string | null) {
  if (!value) return "Not updated yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusIcon(status: string, isLatest: boolean) {
  const normalized = status.toLowerCase();
  if (normalized === "delivered") return <CheckCircle2 size={18} />;
  if (normalized === "in_transit" || normalized === "out_for_delivery" || normalized === "shipped") return <Truck size={18} />;
  if (isLatest) return <PackageCheck size={18} />;
  return <Package size={18} />;
}

function providerTitle(order: PublicTrackingData) {
  if (order.trackingProviderType === "external_link") return `${order.carrier || "Carrier"} Official Tracking`;
  if (order.trackingProviderType === "api") return "Live Tracking API Ready";
  return "Manual Tracking";
}

export function OrderTracking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedQuery = id || searchParams.get("query") || "";
  const [inputValue, setInputValue] = useState(requestedQuery);
  const [order, setOrder] = useState<PublicTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(requestedQuery));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeRank = statusRank[order?.shipmentStatus || ""] ?? 1;

  const timelineEvents = useMemo(() => {
    const liveEvents = order?.liveTracking?.providerConnected ? order.liveTracking.events : [];
    return [...(liveEvents || []), ...(order?.trackingEvents || [])];
  }, [order]);

  useEffect(() => {
    setInputValue(requestedQuery);
    setCopied(false);

    if (!requestedQuery) {
      setOrder(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchTracking = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/track?query=${encodeURIComponent(requestedQuery)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Order not found");
        setOrder(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setOrder(null);
          setError(err.message || "Tracking details could not be loaded.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchTracking();
    return () => controller.abort();
  }, [requestedQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = inputValue.trim();
    if (!nextQuery) return;
    navigate(`/track?query=${encodeURIComponent(nextQuery)}`);
  };

  const handleCopy = async () => {
    if (!order?.trackingNumber) return;
    await navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-limestone/50 hover:text-gold transition-colors mb-10 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase">Back to Sanctuary</span>
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border-b border-gold/10 pb-10 mb-10"
        >
          <p className="text-xs uppercase text-gold mb-3">Order Tracking</p>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:items-end">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-offwhite mb-4">Track Your Order</h1>
              <p className="text-limestone/70 leading-relaxed max-w-xl">
                Enter your DAWL order number or carrier tracking number to see the latest shipment details.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="bg-charcoal-light border border-gold/10 p-3 flex gap-3">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search size={18} className="text-gold/60" />
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="DWL-69S85DWR4 or RR123456789MT"
                  className="w-full bg-transparent outline-none text-offwhite placeholder:text-limestone/35 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 md:px-7 py-4 bg-gold text-charcoal text-xs font-bold uppercase hover:bg-gold-light transition-colors disabled:opacity-60"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
              </button>
            </form>
          </div>
        </motion.section>

        {isLoading && (
          <div className="min-h-[260px] flex items-center justify-center">
            <div className="flex items-center gap-3 text-gold">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs uppercase">Loading Tracking Details</span>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-400/10 border border-red-400/20 p-6 md:p-8 flex flex-col md:flex-row gap-4 md:items-center text-red-200">
            <AlertCircle size={22} className="text-red-300" />
            <div>
              <h2 className="font-display text-lg mb-2">Order Not Found</h2>
              <p className="text-sm text-red-100/75">{error}. Please check the order or tracking number and try again.</p>
            </div>
          </div>
        )}

        {!isLoading && !error && !order && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-limestone/70">
            <div className="bg-gold/5 border border-gold/10 p-6">
              <Package size={22} className="text-gold mb-5" />
              <h2 className="font-display text-sm text-offwhite mb-3">Order Number</h2>
              <p className="text-sm leading-relaxed">Use the DAWL order number shown after checkout or in your account order history.</p>
            </div>
            <div className="bg-gold/5 border border-gold/10 p-6">
              <Truck size={22} className="text-gold mb-5" />
              <h2 className="font-display text-sm text-offwhite mb-3">Carrier Ready</h2>
              <p className="text-sm leading-relaxed">MaltaPost uses official link tracking. DHL, UPS and FedEx are structured for API tracking.</p>
            </div>
            <div className="bg-gold/5 border border-gold/10 p-6">
              <Clock size={22} className="text-gold mb-5" />
              <h2 className="font-display text-sm text-offwhite mb-3">Updated Timeline</h2>
              <p className="text-sm leading-relaxed">Shipment milestones appear here as soon as the order is fulfilled or updated by the team.</p>
            </div>
          </div>
        )}

        {!isLoading && order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <section className="bg-charcoal-light border border-gold/10 p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gold/10 pb-8 mb-8">
                <div>
                  <p className="text-xs uppercase text-gold mb-3">Order {order.orderNumber}</p>
                  <h2 className="font-display text-3xl md:text-4xl text-offwhite">{order.shipmentStatusLabel}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs uppercase">
                    {order.carrier || "Preparing Carrier"}
                  </span>
                  <span className="px-4 py-2 rounded-full border border-limestone/10 text-limestone/70 text-xs uppercase">
                    {getShipmentStatusLabel(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-black/20 border border-gold/5 p-5">
                  <p className="text-xs uppercase text-limestone/45 mb-3">Carrier</p>
                  <p className="text-sm text-offwhite">{order.carrier || "Processing"}</p>
                </div>
                <div className="bg-black/20 border border-gold/5 p-5">
                  <p className="text-xs uppercase text-limestone/45 mb-3">Tracking Number</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gold break-all">{order.trackingNumber || "Awaiting shipment"}</p>
                    {order.trackingNumber && (
                      <button onClick={handleCopy} className="text-limestone/50 hover:text-gold transition-colors" title="Copy tracking number">
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-black/20 border border-gold/5 p-5">
                  <p className="text-xs uppercase text-limestone/45 mb-3">Estimated Delivery</p>
                  <p className="text-sm text-offwhite">{order.estimatedDelivery || "To be confirmed"}</p>
                </div>
                <div className="bg-black/20 border border-gold/5 p-5">
                  <p className="text-xs uppercase text-limestone/45 mb-3">Last Updated</p>
                  <p className="text-sm text-offwhite">{formatDate(order.lastUpdated)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {progressSteps.map((step) => {
                  const isActive = activeRank >= (statusRank[step] || 0);
                  return (
                    <div key={step} className="min-w-0">
                      <div className={`h-1 mb-3 ${isActive ? "bg-gold" : "bg-gold/10"}`} />
                      <p className={`text-[11px] uppercase leading-snug ${isActive ? "text-gold" : "text-limestone/35"}`}>
                        {getShipmentStatusLabel(step)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
              <div className="bg-gold/5 border border-gold/10 p-6 md:p-7 h-fit">
                <p className="text-xs uppercase text-gold mb-3">{providerTitle(order)}</p>
                <h3 className="font-display text-xl text-offwhite mb-4">
                  {order.trackingProviderType === "external_link"
                    ? `Your order has been shipped with ${order.carrier || "the carrier"}.`
                    : order.trackingProviderType === "api"
                      ? "Carrier API Layer"
                      : "Manual Updates"}
                </h3>
                <p className="text-sm text-limestone/70 leading-relaxed mb-6">
                  {order.customerNote || getCarrierCustomerNote(order.carrierKey || order.carrier)}
                </p>

                {order.trackingProviderType === "external_link" && order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gold text-charcoal px-5 py-4 text-xs font-bold uppercase hover:bg-gold-light transition-colors"
                  >
                    Track on {order.carrier || "Carrier"}
                    <ExternalLink size={15} />
                  </a>
                )}

                {order.trackingProviderType === "api" && (
                  <div className="border border-gold/10 bg-black/20 p-4">
                    <p className="text-xs uppercase text-gold mb-2">
                      {order.liveTracking?.providerConnected ? "Provider Connected" : "Provider Not Connected"}
                    </p>
                    <p className="text-sm text-limestone/70 leading-relaxed">{order.liveTracking?.message}</p>
                  </div>
                )}
              </div>

              <div className="bg-charcoal-light border border-gold/10 p-6 md:p-8">
                <h3 className="font-display text-xl text-offwhite mb-8">Shipment Timeline</h3>
                <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-gold/10">
                  {timelineEvents.map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="relative flex gap-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        index === 0 ? "bg-gold text-charcoal" : "bg-charcoal border border-gold/20 text-gold/50"
                      }`}>
                        {statusIcon(event.status, index === 0)}
                      </div>
                      <div className="flex-1 pt-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                          <div>
                            <p className={index === 0 ? "text-gold text-sm uppercase" : "text-offwhite text-sm uppercase"}>
                              {getShipmentStatusLabel(event.status)}
                            </p>
                            <p className="text-limestone/70 text-sm leading-relaxed mt-2">{event.description}</p>
                          </div>
                          <span className="text-xs text-limestone/40 shrink-0">{formatDate(event.timestamp)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-limestone/40">
                            <MapPin size={12} />
                            <span className="text-xs uppercase">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
}
