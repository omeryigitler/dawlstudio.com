export type TrackingProviderType = "external_link" | "api" | "manual";

export type ShipmentStatus =
  | "order_confirmed"
  | "preparing_shipment"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "delayed"
  | "pending_payment"
  | "paid"
  | "payment_failed";

export interface TrackingEvent {
  id?: string | number;
  status: string;
  description: string;
  location?: string | null;
  timestamp: string;
}

interface CarrierConfig {
  key: string;
  displayName: string;
  providerType: TrackingProviderType;
  aliases: string[];
  trackingUrl: (trackingNumber?: string | null) => string | null;
}

const compact = (value: unknown) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const encodeTrackingNumber = (trackingNumber?: string | null) => encodeURIComponent(String(trackingNumber || "").trim());

export const CARRIER_CONFIGS: Record<string, CarrierConfig> = {
  maltapost: {
    key: "maltapost",
    displayName: "MaltaPost",
    providerType: "external_link",
    aliases: ["maltapost", "malta post", "malta_post"],
    trackingUrl: () => "https://www.maltapost.com/tracking",
  },
  dhl: {
    key: "dhl",
    displayName: "DHL",
    providerType: "api",
    aliases: ["dhl", "dhl express", "dhlexpress"],
    trackingUrl: (trackingNumber) => {
      const number = encodeTrackingNumber(trackingNumber);
      return number ? `https://www.dhl.com/mt-en/home/tracking.html?tracking-id=${number}` : "https://www.dhl.com/mt-en/home/tracking.html";
    },
  },
  ups: {
    key: "ups",
    displayName: "UPS",
    providerType: "api",
    aliases: ["ups", "united parcel service"],
    trackingUrl: (trackingNumber) => {
      const number = encodeTrackingNumber(trackingNumber);
      return number ? `https://www.ups.com/track?tracknum=${number}` : "https://www.ups.com/track";
    },
  },
  fedex: {
    key: "fedex",
    displayName: "FedEx",
    providerType: "api",
    aliases: ["fedex", "fedex express"],
    trackingUrl: (trackingNumber) => {
      const number = encodeTrackingNumber(trackingNumber);
      return number ? `https://www.fedex.com/fedextrack/?trknbr=${number}` : "https://www.fedex.com/fedextrack/";
    },
  },
  easypost: {
    key: "easypost",
    displayName: "EasyPost",
    providerType: "api",
    aliases: ["easypost", "easy post"],
    trackingUrl: () => null,
  },
  aftership: {
    key: "aftership",
    displayName: "AfterShip",
    providerType: "api",
    aliases: ["aftership", "after ship"],
    trackingUrl: () => null,
  },
  trackingmore: {
    key: "trackingmore",
    displayName: "TrackingMore",
    providerType: "api",
    aliases: ["trackingmore", "tracking more"],
    trackingUrl: () => null,
  },
};

export const SHIPMENT_STATUS_OPTIONS: Array<{ value: ShipmentStatus; label: string }> = [
  { value: "order_confirmed", label: "Order Confirmed" },
  { value: "preparing_shipment", label: "Preparing Shipment" },
  { value: "shipped", label: "Shipped" },
  { value: "in_transit", label: "In Transit" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "delayed", label: "Delayed" },
  { value: "exception", label: "Exception" },
];

export function normalizeCarrierKey(carrier?: string | null) {
  const value = compact(carrier);
  if (!value) return "";

  const match = Object.values(CARRIER_CONFIGS).find((config) => {
    const names = [config.key, config.displayName, ...config.aliases].map(compact);
    return names.includes(value);
  });

  return match?.key || value;
}

export function getCarrierDisplayName(carrier?: string | null) {
  const key = normalizeCarrierKey(carrier);
  return CARRIER_CONFIGS[key]?.displayName || String(carrier || "Manual Carrier").trim();
}

export function getTrackingProviderType(carrier?: string | null): TrackingProviderType {
  const key = normalizeCarrierKey(carrier);
  return CARRIER_CONFIGS[key]?.providerType || "manual";
}

export function getCarrierTrackingUrl(carrier?: string | null, trackingNumber?: string | null) {
  const key = normalizeCarrierKey(carrier);
  return CARRIER_CONFIGS[key]?.trackingUrl(trackingNumber) || null;
}

export function isMaltaPostCarrier(carrier?: string | null) {
  return normalizeCarrierKey(carrier) === "maltapost";
}

export function getShipmentStatusLabel(status?: string | null) {
  const normalized = String(status || "").trim().toLowerCase();
  const option = SHIPMENT_STATUS_OPTIONS.find((item) => item.value === normalized);
  if (option) return option.label;

  const fallbackLabels: Record<string, string> = {
    pending_payment: "Payment Pending",
    paid: "Order Confirmed",
    fulfilled: "Fulfilled",
    payment_failed: "Payment Issue",
    pending: "Pending",
  };

  return fallbackLabels[normalized] || String(status || "Preparing Shipment").replace(/_/g, " ");
}

export function getCarrierCustomerNote(carrier?: string | null) {
  if (isMaltaPostCarrier(carrier)) {
    return "MaltaPost tracking updates are available through the official MaltaPost tracking page.";
  }

  if (getTrackingProviderType(carrier) === "api") {
    return "This carrier is ready for live API tracking once a provider such as EasyPost, AfterShip or TrackingMore is connected.";
  }

  return "Tracking updates are managed manually by the DAWL STUDIO team.";
}
