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
    carrier TEXT,
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur'::text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending_payment'::text;

-- 3. Create Order Updates Table
CREATE TABLE IF NOT EXISTS public.order_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "orderId" TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Enable Row Level Security (RLS) if you plan to query directly from the frontend.
-- Since this app uses a Node.js backend with the Service Role Key, RLS is not strictly required for the backend to function,
-- but it is highly recommended for security.
