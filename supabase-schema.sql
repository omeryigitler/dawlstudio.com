-- Supabase SQL Schema for Dawl Studio

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    role TEXT DEFAULT 'user'::text,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "userId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'eur'::text,
    items JSONB NOT NULL,
    "shippingAddress" JSONB,
    status TEXT DEFAULT 'pending_payment'::text,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "orderNumber" TEXT,
    "shippingCountry" TEXT,
    "shippingMethod" TEXT,
    carrier TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "orderStatus" TEXT DEFAULT 'pending_payment'::text,
    "shipmentStatus" TEXT DEFAULT 'preparing_shipment'::text,
    "estimatedDelivery" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur'::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_payment'::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shippingMethod" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "orderStatus" TEXT DEFAULT 'pending_payment'::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shipmentStatus" TEXT DEFAULT 'preparing_shipment'::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "estimatedDelivery" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending_payment'::text;
ALTER TABLE public.orders ALTER COLUMN "orderStatus" SET DEFAULT 'pending_payment'::text;
ALTER TABLE public.orders ALTER COLUMN "shipmentStatus" SET DEFAULT 'preparing_shipment'::text;

UPDATE public.orders
SET "orderNumber" = id
WHERE "orderNumber" IS NULL;

UPDATE public.orders
SET "shippingCountry" = COALESCE("shippingCountry", "shippingAddress"->>'country')
WHERE "shippingCountry" IS NULL;

UPDATE public.orders
SET "orderStatus" = COALESCE("orderStatus", status),
    "shipmentStatus" = COALESCE(
      "shipmentStatus",
      CASE
        WHEN status IN ('shipped', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'exception') THEN status
        WHEN status = 'paid' THEN 'preparing_shipment'
        ELSE 'order_confirmed'
      END
    )
WHERE "orderStatus" IS NULL OR "shipmentStatus" IS NULL;

UPDATE public.orders
SET "orderStatus" = status
WHERE status IS NOT NULL AND "orderStatus" = 'pending_payment' AND status <> 'pending_payment';

UPDATE public.orders
SET "shipmentStatus" = CASE
  WHEN status IN ('shipped', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'exception') THEN status
  WHEN status = 'paid' THEN 'preparing_shipment'
  ELSE "shipmentStatus"
END
WHERE status IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique_idx ON public.orders ("orderNumber") WHERE "orderNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_tracking_number_idx ON public.orders ("trackingNumber") WHERE "trackingNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_shipment_status_idx ON public.orders ("shipmentStatus");

-- 3. Create Order Updates Table
CREATE TABLE IF NOT EXISTS public.order_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "orderId" TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Canonical Admin User
UPDATE public.users SET role = 'user' WHERE lower(email) <> 'yigitleromer@gmail.com';
UPDATE public.users SET role = 'admin' WHERE lower(email) = 'yigitleromer@gmail.com';

-- Note: Enable Row Level Security (RLS) if you plan to query directly from the frontend.
-- Since this app uses a Node.js backend with the Service Role Key, RLS is not strictly required for the backend to function,
-- but it is highly recommended for security.
