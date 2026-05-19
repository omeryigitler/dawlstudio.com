import express, { type Request } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

// NOTE: For Stripe Webhooks in production, use: https://www.dawlstudio.com/api/webhook
// For Preview/Dev environments, use: <Shared App URL>/api/webhook
// For Google OAuth Redirect URI in production, use: https://www.dawlstudio.com/api/auth/google/callback
// For Preview/Dev environments, use: <Shared App URL>/api/auth/google/callback
// NOTE: DO NOT USE BROWSER ALERTS. USE useToast() FOR ALL NOTIFICATIONS.

import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

console.log("[DAWL] api/index.ts execution started");

// Load environment variables
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  console.warn("[DAWL] dotenv.config() error (this is normal if .env is missing):", dotenvResult.error.message);
} else {
  console.log("[DAWL] .env file loaded successfully.");
}

if (!process.env.JWT_SECRET) {
  console.warn("[DAWL] WARNING: JWT_SECRET is not set. Using a temporary secret for development. THIS IS INSECURE FOR PRODUCTION.");
}
const JWT_SECRET = process.env.JWT_SECRET || "dawl-secret-key-2026";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_VERCEL = process.env.VERCEL === "1";
const ALLOWED_ORIGINS = new Set(
  [
    process.env.APP_URL,
    process.env.SHARED_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    "https://dawlstudio.com",
    "https://www.dawlstudio.com",
  ].filter(Boolean)
);
const DEFAULT_ADMIN_EMAIL = "yigitleromer@gmail.com";
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL)
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
);
const PRIMARY_ADMIN_EMAIL = Array.from(ADMIN_EMAILS)[0] || DEFAULT_ADMIN_EMAIL;

const PRODUCT_CATALOG: Record<string, { unitAmount: number; currency: "eur"; name: string }> = {
  "DS-R-W-01-220": { unitAmount: 6500, currency: "eur", name: "Cedarwood — Amber / Retail White" },
  "DS-R-B-01-220": { unitAmount: 6500, currency: "eur", name: "Cedarwood — Amber / Retail Black" },
  "DS-R-W-02-220": { unitAmount: 6500, currency: "eur", name: "Limestone — Frankincense / Retail White" },
  "DS-R-B-02-220": { unitAmount: 6500, currency: "eur", name: "Limestone — Frankincense / Retail Black" },
  "DS-P-W-01-220": { unitAmount: 9500, currency: "eur", name: "Cedarwood — Amber / Premium White" },
  "DS-P-B-01-220": { unitAmount: 9500, currency: "eur", name: "Cedarwood — Amber / Premium Black" },
  "DS-P-W-02-220": { unitAmount: 9500, currency: "eur", name: "Limestone — Frankincense / Premium White" },
  "DS-P-B-02-220": { unitAmount: 9500, currency: "eur", name: "Limestone — Frankincense / Premium Black" },
};

function normalizeEmail(email: unknown) {
  return String(email || "").trim().toLowerCase();
}

function roleForEmail(email: unknown) {
  return ADMIN_EMAILS.has(normalizeEmail(email)) ? "admin" : "user";
}

function sanitizeUser(user: any) {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function applyCanonicalRole(user: any) {
  if (!user) return user;

  const expectedRole = roleForEmail(user.email);
  if (user.role === expectedRole) return user;

  const { data, error } = await supabase
    .from("users")
    .update({ role: expectedRole })
    .eq("id", user.id)
    .select("*");

  if (error) {
    console.warn(`[DAWL Auth] Could not sync role for ${normalizeEmail(user.email)}:`, error.message);
    return { ...user, role: expectedRole };
  }

  return data && data.length > 0 ? data[0] : { ...user, role: expectedRole };
}

function normalizeOrigin(origin: unknown) {
  try {
    const url = new URL(String(origin || ""));
    return url.origin;
  } catch {
    return "";
  }
}

function getAppOrigin() {
  return normalizeOrigin(process.env.APP_URL) || "https://www.dawlstudio.com";
}

function getTrustedClientOrigin(origin: unknown) {
  const normalizedOrigin = normalizeOrigin(origin);
  const fallbackOrigin = getAppOrigin();
  if (!normalizedOrigin) return fallbackOrigin;

  try {
    const { hostname } = new URL(normalizedOrigin);
    const isDawlDomain = hostname === "dawlstudio.com" || hostname.endsWith(".dawlstudio.com");
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const isPreview = hostname.endsWith(".vercel.app") || hostname.endsWith(".run.app");

    if (ALLOWED_ORIGINS.has(normalizedOrigin) || isDawlDomain || (!IS_PRODUCTION && (isLocal || isPreview))) {
      return normalizedOrigin;
    }
  } catch {
    return fallbackOrigin;
  }

  return fallbackOrigin;
}

function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `${getAppOrigin()}/api/auth/google/callback`;
}

function isGoogleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

async function getAuthenticatedUser(req: Request) {
  if (!supabase) throw Object.assign(new Error("Database not configured"), { statusCode: 500 });

  const authHeader = req.headers.authorization;
  if (!authHeader) throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });

  const token = authHeader.split(" ")[1];
  if (!token) throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });

  const decoded: any = jwt.verify(token, JWT_SECRET);
  if (!decoded?.id) throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });

  const { data: users, error } = await supabase.from("users").select("*").eq("id", decoded.id);
  if (error || !users || users.length === 0) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  return applyCanonicalRole(users[0]);
}

async function requireAdminUser(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (roleForEmail(user.email) !== "admin" || user.role !== "admin") {
    throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  }

  return user;
}

// Initialize Database (Supabase)
let supabase: any;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  } catch (err: any) {
    console.warn("[DAWL] WARNING: Invalid Supabase configuration. Database features will be disabled.", err.message);
    supabase = null;
  }
} else {
  console.warn("[DAWL] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Database features will be disabled.");
  supabase = null;
}

// Migration: We assume tables are created via Supabase SQL Editor.
// But we can add a check/create for the default admin here.

const createAdmin = async () => {
  if (!supabase) return;
  if (IS_PRODUCTION && process.env.CREATE_DEFAULT_ADMIN !== "true") return;

  try {
    const adminEmail = PRIMARY_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || (IS_PRODUCTION ? "" : "admin123");
    if (!adminPassword) {
      console.warn("[DAWL] Default admin creation skipped: DEFAULT_ADMIN_PASSWORD is missing.");
      return;
    }

    const { data: existingAdmin, error: fetchError } = await supabase.from('users').select('*').eq('email', adminEmail);
    
    if (fetchError) {
      console.error("[DAWL] Error checking admin:", fetchError);
      return;
    }

    if (!existingAdmin || existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const { error: insertError } = await supabase.from('users').insert([{
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }]);
      
      if (insertError) {
         console.error("[DAWL] Error creating admin:", insertError);
      } else {
         console.log(`[DAWL] Default admin created: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error("[DAWL] Error creating default admin:", err);
  }
};
createAdmin();

let stripe: Stripe | null = null;
let priceMap: any = null;

// Load price map if it exists
const priceMapPath = path.join(process.cwd(), "stripe", "price-map.json");
if (fs.existsSync(priceMapPath)) {
  try {
    priceMap = JSON.parse(fs.readFileSync(priceMapPath, "utf-8"));
    console.log("[DAWL] Price map loaded successfully.");
  } catch (err) {
    console.error("[DAWL] Failed to parse price-map.json", err);
  }
}

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY || 
                process.env.STRIPE_SECRET ||
                process.env.SECRET_KEY ||
                process.env.secret_key ||
                process.env.STRIPE_SEC_KEY ||
                process.env.STRIPE_API_KEY;
                
    if (!key) {
      console.error("[DAWL] CRITICAL: Stripe secret key is missing! Checked: STRIPE_SECRET_KEY, STRIPE_SECRET, SECRET_KEY, etc.");
      return null;
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

const app = express();

// Trust proxy for express-rate-limit to work correctly behind nginx
app.set('trust proxy', 1);

// Middleware
app.use((req, res, next) => {
  console.log(`[DAWL] Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1");
    const isPreview = origin.endsWith(".vercel.app") || origin.endsWith(".run.app");

    if (ALLOWED_ORIGINS.has(origin) || (!IS_PRODUCTION && (isLocal || isPreview))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true 
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: "Too many login/register attempts from this IP, please try again after 15 minutes" },
  validate: { xForwardedForHeader: false }, // Suppress validation errors as we've set trust proxy
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Health check for platform
app.get("/health", (req, res) => {
  console.log("[DAWL] /health check received");
  res.status(200).send("OK");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working", time: new Date().toISOString() });
});

// API Routes
app.get("/api/config", (req, res) => {
  const pubKey = process.env.VITE_STRIPE_PUBLIC_KEY || 
                 process.env.STRIPE_PUBLISHABLE_KEY || 
                 process.env.STRIPE_PUBLIC_KEY ||
                 process.env.publishable_key || 
                 process.env.public_key ||
                 process.env.STRIPE_PUB_KEY ||
                 process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  res.json({ 
    publishableKey: pubKey || null
  });
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const { password, firstName, lastName } = req.body;
    const email = normalizeEmail(req.body?.email);
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First and last name are required" });
    }
    
    // Check if user exists
    const { data: existingUser } = await supabase.from('users').select('*').eq('email', email);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: result, error } = await supabase.from('users').insert([{ 
      email, 
      password: hashedPassword, 
      firstName, 
      lastName,
      role: roleForEmail(email)
    }]).select('id, email, firstName, lastName, role');

    if (error || !result || result.length === 0) {
      throw new Error(error?.message || "Failed to insert user");
    }

    const user = result[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user });
  } catch (error: any) {
    console.error("[DAWL] Registration Error:", error.message);
    res.status(500).json({ error: "Failed to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const email = normalizeEmail(req.body?.email);
    const { password } = req.body;
    const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
    
    if (error || !users || users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    let user = users[0];

    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    user = await applyCanonicalRole(user);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const userWithoutPassword = sanitizeUser(user);

    res.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    console.error("[DAWL] Login Error:", error.message);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    res.json({ user: sanitizeUser(user) });
  } catch (error: any) {
    res.status(error.statusCode || 401).json({ error: error.message || "Unauthorized" });
  }
});

app.get("/api/auth/google/status", (req, res) => {
  res.json({ enabled: isGoogleAuthConfigured() });
});

// Google OAuth Routes
app.get("/api/auth/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const clientOrigin = getTrustedClientOrigin(req.query.origin);
  const redirectUri = getGoogleRedirectUri();
  
  console.log(`[DAWL Auth] Generating Google OAuth URL. ClientID: ${clientId ? 'Present' : 'MISSING'}, RedirectURI: ${redirectUri}`);

  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: "Google sign-in is not configured yet." });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state: clientOrigin
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url });
});

app.get("/api/auth/google/callback", async (req, res) => {
  if (!supabase) return res.status(500).send("Database not configured");
  const { code, error: googleError, state } = req.query;
  if (googleError) {
    console.error(`[DAWL Auth] Google OAuth Error: ${googleError}`);
    return res.status(400).send(`Authentication failed: ${googleError}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const clientOrigin = getTrustedClientOrigin(state);
  const redirectUri = getGoogleRedirectUri();

  console.log(`[DAWL Auth] Callback received. Code: ${code ? 'Present' : 'MISSING'}`);

  if (!code || !clientId || !clientSecret) {
    console.error(`[DAWL Auth] Missing code or config. ClientID: ${clientId ? 'OK' : 'MISSING'}, ClientSecret: ${clientSecret ? 'OK' : 'MISSING'}`);
    return res.status(400).send("Missing OAuth configuration or code");
  }

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    if (!tokens.access_token) {
      console.error("[DAWL Auth] Google token exchange failed:", tokens);
      throw new Error("Failed to get access token");
    }

    // 2. Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();
    const googleEmail = normalizeEmail(googleUser.email);
    if (!googleEmail || googleUser.email_verified === false) {
      throw new Error("Google account email is not verified.");
    }

    // 3. Find or create user in DB
    const { data: users } = await supabase.from('users').select('*').eq('email', googleEmail);
    let user = users && users.length > 0 ? users[0] : null;
    
    if (!user) {
      const { data: result, error } = await supabase.from('users').insert([{
        email: googleEmail,
        firstName: googleUser.given_name || "Google",
        lastName: googleUser.family_name || "User",
        role: roleForEmail(googleEmail)
      }]).select('*');
      
      if (error || !result || result.length === 0) throw new Error("Failed to create user");
      user = result[0];
    } else {
      user = await applyCanonicalRole(user);
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const userWithoutPassword = sanitizeUser(user);

    // 5. Send success message to popup opener
    res.send(`
      <html>
        <body>
          <script>
            const data = ${JSON.stringify({ token, user: userWithoutPassword })};
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                ...data
              }, ${JSON.stringify(clientOrigin)});
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("[DAWL] Google OAuth Error:", error.message);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/admin/users", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    await requireAdminUser(req);

    const { data: users, error } = await supabase.from('users').select('id, email, firstName, lastName, role, createdAt').order('createdAt', { ascending: false });
    if (error) throw error;
    
    res.json(users);
  } catch (error: any) {
    res.status(error.statusCode || 401).json({ error: error.message || "Invalid token" });
  }
});

// --- ORDER & SHIPPING INFRASTRUCTURE ---

// 3. Admin: Simulate Shipping (WMS -> Carrier API)
app.post("/api/admin/orders/:id/ship", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    await requireAdminUser(req);

    const orderId = req.params.id;
    const carrier = "DHL Express";
    const trackingNumber = `TRK${Math.floor(Math.random() * 1000000000)}`;

    // Simulate Carrier API Call
    console.log(`[DAWL CARRIER] Requesting tracking for ${orderId} from ${carrier}...`);

    await supabase.from('orders').update({ 
      status: 'shipped', 
      carrier, 
      trackingNumber 
    }).eq('id', orderId);

    await supabase.from('order_updates').insert([{
      orderId,
      status: 'shipped',
      location: 'Distribution Center',
      description: `Package picked up by ${carrier}. Tracking: ${trackingNumber}`
    }]);

    res.json({ success: true, trackingNumber });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// 4. Shipping Webhook (Simulated Carrier Updates)
app.post("/api/webhooks/shipping", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  const { orderId, status, location, description } = req.body;
  
  try {
    await supabase.from('orders').update({ status }).eq('id', orderId);

    await supabase.from('order_updates').insert([{
      orderId,
      status,
      location,
      description
    }]);

    console.log(`[DAWL WEBHOOK] Shipping update for ${orderId}: ${status} at ${location}`);
    res.json({ received: true });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// 5. Get Order Status (Branded Tracking Page API)
app.get("/api/orders/:id", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const { data: orders } = await supabase.from('orders').select('*').eq('id', req.params.id);
    const order = orders && orders.length > 0 ? orders[0] : null;
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { data: updates } = await supabase.from('order_updates').select('*').eq('orderId', req.params.id).order('timestamp', { ascending: false });
    res.json({ ...order, updates: updates || [] });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// 5.1 Get User Orders
app.get("/api/user/orders", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { data: orders, error } = await supabase.from('orders').select('*').eq('userId', decoded.id).order('createdAt', { ascending: false });
    if (error) throw error;
    
    res.json(orders || []);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// 6. Admin: Get All Orders
app.get("/api/admin/orders", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    await requireAdminUser(req);

    const { data: orders, error } = await supabase.from('orders').select('*, users(email)').order('createdAt', { ascending: false });
    if (error) throw error;
    
    const formattedOrders = (orders || []).map((o: any) => ({
      ...o,
      userEmail: o.users?.email
    }));
    
    res.json(formattedOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getCatalogItem(id: string) {
  const mappedItem = priceMap?.items?.[id];
  if (
    mappedItem &&
    Number.isInteger(mappedItem.unitAmount) &&
    mappedItem.unitAmount > 0 &&
    String(mappedItem.currency || "").toLowerCase() === "eur"
  ) {
    return {
      unitAmount: mappedItem.unitAmount,
      currency: "eur" as const,
      name: mappedItem.name || PRODUCT_CATALOG[id]?.name || id,
    };
  }

  return PRODUCT_CATALOG[id] || null;
}

function normalizeCheckoutItems(items: any[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  if (items.length > 20) {
    throw new Error("Too many cart items.");
  }

  return items.map((item) => {
    const id = String(item?.id || "").trim();
    const quantity = Number(item?.quantity);
    const catalogItem = getCatalogItem(id);

    if (!catalogItem) {
      throw new Error(`Unknown product: ${id || "missing SKU"}`);
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error(`Invalid quantity for ${id}.`);
    }

    return {
      id,
      name: catalogItem.name,
      unitAmount: catalogItem.unitAmount,
      currency: catalogItem.currency,
      quantity,
      giftCard: item?.giftCard || null,
    };
  });
}

function validateShippingAddress(shippingAddress: any) {
  const fullName = String(shippingAddress?.fullName || "").trim();
  const address = String(shippingAddress?.address || "").trim();
  const city = String(shippingAddress?.city || "").trim();
  const country = String(shippingAddress?.country || "").trim();

  if (!fullName || !address || !city || !country) {
    throw new Error("Shipping details are incomplete.");
  }

  return {
    fullName: fullName.slice(0, 120),
    address: address.slice(0, 240),
    city: city.slice(0, 120),
    country: country.slice(0, 120),
  };
}

async function getAuthenticatedUserId(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("Unauthorized");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  const decoded: any = jwt.verify(token, JWT_SECRET);
  if (!decoded?.id) throw new Error("Unauthorized");

  return decoded.id;
}

app.post("/api/create-payment-intent", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const userId = await getAuthenticatedUserId(req);
    const { items, shippingAddress } = req.body;
    const stripeClient = getStripe();

    if (!stripeClient) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    const validatedShippingAddress = validateShippingAddress(shippingAddress);
    const normalizedItems = normalizeCheckoutItems(items);
    const amount = normalizedItems.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    // 1. Create a 'pending' order first
    const orderId = `DWL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const { error: orderInsertError } = await supabase.from('orders').insert([{
      id: orderId,
      userId,
      total: amount / 100,
      currency: 'eur',
      items: normalizedItems,
      shippingAddress: validatedShippingAddress,
      status: 'pending_payment'
    }]);
    if (orderInsertError) throw new Error(orderInsertError.message);

    // 2. Add initial update
    const { error: orderUpdateInsertError } = await supabase.from('order_updates').insert([{
      orderId,
      status: 'pending_payment',
      location: 'Warehouse',
      description: 'Order received and awaiting payment confirmation.'
    }]);
    if (orderUpdateInsertError) throw new Error(orderUpdateInsertError.message);

    // 3. Create Payment Intent with orderId in metadata
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount),
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_check: "accept_a_payment",
        order_id: orderId,
        user_id: String(userId),
      },
    });

    const { error: paymentIntentUpdateError } = await supabase.from('orders').update({
      stripePaymentIntentId: paymentIntent.id,
    }).eq('id', orderId);
    if (paymentIntentUpdateError) {
      console.warn("[DAWL] PaymentIntent ID could not be stored on order:", paymentIntentUpdateError.message);
    }

    res.json({ clientSecret: paymentIntent.client_secret, orderId, amount: amount / 100, currency: "eur" });
  } catch (error: any) {
    console.error("[DAWL] Stripe Error:", error.message);
    const status = error.message === "Unauthorized" ? 401 : 400;
    res.status(status).json({ error: error.message || "An error occurred while processing your payment." });
  }
});

app.post("/api/orders/:id/sync-payment", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });

  try {
    const userId = await getAuthenticatedUserId(req);
    const orderId = req.params.id;
    const paymentIntentId = String(req.body?.paymentIntentId || "").trim();
    const stripeClient = getStripe();

    if (!stripeClient) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    if (!paymentIntentId.startsWith("pi_")) {
      return res.status(400).json({ error: "Invalid payment intent." });
    }

    const { data: orders } = await supabase.from('orders').select('*').eq('id', orderId);
    const order = orders && orders.length > 0 ? orders[0] : null;
    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: "Order not found" });
    }

    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.metadata?.order_id !== orderId) {
      return res.status(400).json({ error: "Payment intent does not belong to this order." });
    }

    if (paymentIntent.status === "succeeded" && order.status !== "paid") {
      await supabase.from('orders').update({
        status: 'paid',
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date().toISOString(),
      }).eq('id', orderId);

      await supabase.from('order_updates').insert([{
        orderId,
        status: 'paid',
        location: 'System',
        description: 'Payment confirmed via Stripe. Order is now being processed.'
      }]);
    }

    res.json({ status: paymentIntent.status, orderId });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    res.status(status).json({ error: error.message || "Failed to sync payment status" });
  }
});

// Stripe Webhook Handler (The most secure way to handle payment success)
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeClient = getStripe();

  if (!webhookSecret || !stripeClient || !sig) {
    return res.status(400).send("Webhook Error: Missing configuration or signature");
  }

  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[DAWL] Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent: any = event.data.object;
      console.log(`[DAWL] PaymentIntent for ${paymentIntent.amount} was successful!`);
      
      // Fulfill the order in the database
      const orderIdFromMetadata = paymentIntent.metadata.order_id;
      if (orderIdFromMetadata && supabase) {
        const { data: orders } = await supabase.from('orders').select('*').eq('id', orderIdFromMetadata);
        const order = orders && orders.length > 0 ? orders[0] : null;
        if (order) {
          if (order.status !== 'paid') {
            await supabase.from('orders').update({
              status: 'paid',
              stripePaymentIntentId: paymentIntent.id,
              paidAt: new Date().toISOString(),
            }).eq('id', orderIdFromMetadata);
            await supabase.from('order_updates').insert([{
              orderId: orderIdFromMetadata,
              status: 'paid',
              location: 'System',
              description: 'Payment confirmed via Stripe. Order is now being processed.'
            }]);
          }
          console.log(`[DAWL] Order ${orderIdFromMetadata} marked as paid via webhook.`);
        } else {
          console.error(`[DAWL] Webhook Error: Order ${orderIdFromMetadata} not found in database.`);
        }
      }
      break;
    case "payment_intent.payment_failed":
      const failedPaymentIntent: any = event.data.object;
      console.log(`[DAWL] Payment failed for ${failedPaymentIntent.id}`);
      if (failedPaymentIntent.metadata?.order_id && supabase) {
        await supabase.from('orders').update({
          status: 'payment_failed',
          stripePaymentIntentId: failedPaymentIntent.id,
        }).eq('id', failedPaymentIntent.metadata.order_id);
        await supabase.from('order_updates').insert([{
          orderId: failedPaymentIntent.metadata.order_id,
          status: 'payment_failed',
          location: 'System',
          description: 'Payment failed or was declined by Stripe.'
        }]);
      }
      break;
    default:
      console.log(`[DAWL] Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Start Server
async function startServer() {
  try {
    const PORT = 3000;
    const isProd = process.env.NODE_ENV === "production";
    console.log(`[DAWL] Starting server in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
    console.log(`[DAWL] APP_URL: ${process.env.APP_URL}`);
    console.log(`[DAWL] SHARED_APP_URL: ${process.env.SHARED_APP_URL}`);

    // Vite middleware for development
    if (!isProd) {
      console.log("[DAWL] Starting Vite server as middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[DAWL] Vite middleware attached.");
    } else {
      const distPath = path.join(process.cwd(), "dist");
      if (!fs.existsSync(distPath)) {
        console.error(`[DAWL] CRITICAL: dist/ folder not found at ${distPath}.`);
        // In production mode, if dist is missing, we still want the API to work
        // but we'll show a helpful message for the frontend
        app.get("/", (req, res) => {
          res.status(500).send("Frontend build (dist/) is missing. Please run 'npm run build'.");
        });
      } else {
        console.log(`[DAWL] Serving static files from ${distPath}`);
        app.use(express.static(distPath));
        // SPA fallback
        app.get("*", (req, res, next) => {
          if (req.url.startsWith('/api')) return next();
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }

    // Final 404 handler for API
    app.use('/api/*', (req, res) => {
      console.log(`[DAWL] 404 API Not Found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ error: `API Route not found: ${req.originalUrl}` });
    });

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[DAWL] Server successfully started and listening on http://0.0.0.0:${PORT}`);
    });
    
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[DAWL] Port ${PORT} is already in use. This might happen during a quick restart.`);
      } else {
        console.error("[DAWL] Server error:", err);
      }
    });
  } catch (err) {
    console.error("[DAWL] Critical error starting server:", err);
  }
}

if (!IS_VERCEL) {
  startServer();
}

export default app;
