-- DAWL STUDIO hybrid shipment tracking migration
-- Run once in Supabase SQL Editor before using the new admin tracking fields.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shippingMethod" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "orderStatus" TEXT DEFAULT 'pending_payment'::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shipmentStatus" TEXT DEFAULT 'preparing_shipment'::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "estimatedDelivery" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.orders ALTER COLUMN "orderStatus" SET DEFAULT 'pending_payment'::text;
ALTER TABLE public.orders ALTER COLUMN "shipmentStatus" SET DEFAULT 'preparing_shipment'::text;

UPDATE public.orders
SET "orderNumber" = id
WHERE "orderNumber" IS NULL;

UPDATE public.orders
SET "shippingCountry" = COALESCE("shippingCountry", "shippingAddress"->>'country')
WHERE "shippingCountry" IS NULL;

UPDATE public.orders
SET "orderStatus" = status
WHERE status IS NOT NULL AND ("orderStatus" IS NULL OR "orderStatus" = 'pending_payment');

UPDATE public.orders
SET "shipmentStatus" = CASE
  WHEN status IN ('shipped', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'exception') THEN status
  WHEN status = 'paid' THEN 'preparing_shipment'
  ELSE COALESCE("shipmentStatus", 'order_confirmed')
END
WHERE status IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique_idx ON public.orders ("orderNumber") WHERE "orderNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_tracking_number_idx ON public.orders ("trackingNumber") WHERE "trackingNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_shipment_status_idx ON public.orders ("shipmentStatus");
