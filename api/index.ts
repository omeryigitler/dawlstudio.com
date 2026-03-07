import express from "express";
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

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn("[DAWL] WARNING: JWT_SECRET is not set. Using a temporary secret for development. THIS IS INSECURE FOR PRODUCTION.");
}
const JWT_SECRET = process.env.JWT_SECRET || "dawl-secret-key-2026";

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
  try {
    const adminEmail = "admin@dawl.studio"; // Default admin email
    const { data: existingAdmin, error: fetchError } = await supabase.from('users').select('*').eq('email', adminEmail);
    
    if (fetchError) {
      console.error("[DAWL] Error checking admin:", fetchError);
      return;
    }

    if (!existingAdmin || existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
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
         console.log("[DAWL] Default admin created: admin@dawl.studio / admin123");
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
                process.env.secret_key || 
                process.env.STRIPE_SEC_KEY ||
                process.env.SECRET_KEY;
                
    if (!key) {
      console.warn("[DAWL] Stripe secret key is missing. Payment features will be disabled.");
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
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.APP_URL,
      process.env.SHARED_APP_URL,
      "https://ais-dev-hu45cucupborqfgzq5rwlj-83947013535.europe-west2.run.app",
      "https://ais-pre-hu45cucupborqfgzq5rwlj-83947013535.europe-west2.run.app"
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      // In development/preview environments, we're more permissive
      callback(null, true);
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
  res.status(200).send("OK");
});

// API Routes
app.get("/api/config", (req, res) => {
  const pubKey = process.env.VITE_STRIPE_PUBLIC_KEY || 
                 process.env.STRIPE_PUBLISHABLE_KEY || 
                 process.env.publishable_key || 
                 process.env.STRIPE_PUB_KEY ||
                 process.env.PUBLIC_KEY;
  
  console.log(`[DAWL] /api/config called. Publishable key present: ${!!pubKey}`);
  res.json({ publishableKey: pubKey });
});

app.get("/api/debug/env-keys", (req, res) => {
  const keys = Object.keys(process.env);
  res.json({ keys: keys.filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('PASSWORD') && !k.includes('TOKEN')) });
});

// Another one that specifically looks for Stripe-like keys but masks values
app.get("/api/debug/stripe-keys", (req, res) => {
  const stripeKeys = Object.keys(process.env).filter(k => 
    k.toLowerCase().includes('stripe') || 
    k.toLowerCase().includes('publishable') || 
    k.toLowerCase().includes('public')
  );
  
  const results = stripeKeys.map(k => ({
    key: k,
    present: !!process.env[k],
    length: process.env[k]?.length || 0,
    prefix: process.env[k]?.substring(0, 7) + "..."
  }));
  
  res.json({ results });
});

app.get("/api/debug/stripe", (req, res) => {
  const pubKey = process.env.VITE_STRIPE_PUBLIC_KEY || 
                 process.env.STRIPE_PUBLISHABLE_KEY || 
                 process.env.publishable_key || 
                 process.env.STRIPE_PUB_KEY ||
                 process.env.PUBLIC_KEY;
                 
  const secKey = process.env.STRIPE_SECRET_KEY || 
                 process.env.secret_key || 
                 process.env.STRIPE_SEC_KEY ||
                 process.env.SECRET_KEY;
                 
  res.json({
    publishableKeyPresent: !!pubKey,
    publishableKeyPrefix: pubKey ? pubKey.substring(0, 7) : null,
    secretKeyPresent: !!secKey,
    secretKeyPrefix: secKey ? secKey.substring(0, 7) : null,
    allEnvKeys: Object.keys(process.env).sort(),
    stripeRelatedKeys: Object.keys(process.env).filter(k => 
      k.toLowerCase().includes('stripe') || 
      k.toLowerCase().includes('key') || 
      k.toLowerCase().includes('secret') ||
      k.toLowerCase().includes('pub')
    )
  });
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const { email, password, firstName, lastName } = req.body;
    
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
      lastName 
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
    const { email, password } = req.body;
    const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
    
    if (error || !users || users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const user = users[0];

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    console.error("[DAWL] Login Error:", error.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Google OAuth Routes
app.get("/api/auth/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientOrigin = req.query.origin as string || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  
  let appUrl = clientOrigin;
  if (appUrl.endsWith('/')) appUrl = appUrl.slice(0, -1);
  
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;
  
  console.log(`[DAWL Auth] Generating Google OAuth URL. ClientID: ${clientId ? 'Present' : 'MISSING'}, RedirectURI: ${redirectUri}`);

  if (!clientId) {
    return res.status(500).json({ error: "Google Client ID not configured in Secrets (🔒)" });
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
  
  const clientOrigin = state as string || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  let appUrl = clientOrigin;
  if (appUrl.endsWith('/')) appUrl = appUrl.slice(0, -1);
  
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

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
    if (!tokens.access_token) throw new Error("Failed to get access token");

    // 2. Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();

    // 3. Find or create user in DB
    const { data: users } = await supabase.from('users').select('*').eq('email', googleUser.email);
    let user = users && users.length > 0 ? users[0] : null;
    
    if (!user) {
      const { data: result, error } = await supabase.from('users').insert([{
        email: googleUser.email,
        firstName: googleUser.given_name || "Google",
        lastName: googleUser.family_name || "User",
        role: 'user'
      }]).select('*');
      
      if (error || !result || result.length === 0) throw new Error("Failed to create user");
      user = result[0];
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userWithoutPassword } = user;

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
              }, '*');
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
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { data: admins } = await supabase.from('users').select('*').eq('id', decoded.id);
    const admin = admins && admins.length > 0 ? admins[0] : null;
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data: users, error } = await supabase.from('users').select('id, email, firstName, lastName, role, createdAt').order('createdAt', { ascending: false });
    if (error) throw error;
    
    res.json(users);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// --- ORDER & SHIPPING INFRASTRUCTURE ---

// 3. Admin: Simulate Shipping (WMS -> Carrier API)
app.post("/api/admin/orders/:id/ship", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { data: admins } = await supabase.from('users').select('*').eq('id', decoded.id);
    const admin = admins && admins.length > 0 ? admins[0] : null;
    if (!admin || admin.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// 6. Admin: Get All Orders
app.get("/api/admin/orders", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { data: admins } = await supabase.from('users').select('*').eq('id', decoded.id);
    const admin = admins && admins.length > 0 ? admins[0] : null;
    if (!admin || admin.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

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

app.post("/api/create-payment-intent", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Database not configured" });
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { items, shippingAddress, currency = "eur" } = req.body;
    const stripeClient = getStripe();

    if (!stripeClient) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    let amount = 0;

    // SECURITY: Calculate total on server using the price map
    if (priceMap && priceMap.items) {
      for (const item of items) {
        const mappedItem = priceMap.items[item.id];
        if (mappedItem) {
          amount += mappedItem.unitAmount * item.quantity;
        } else {
          console.warn(`[DAWL] SKU ${item.id} not found in price map.`);
          amount += (item.price * 100) * item.quantity;
        }
      }
    } else {
      amount = items.reduce((acc: number, item: any) => acc + (item.price * 100 * item.quantity), 0);
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    // 1. Create a 'pending' order first
    const orderId = `DWL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await supabase.from('orders').insert([{
      id: orderId,
      userId: decoded.id,
      total: amount / 100,
      items,
      shippingAddress,
      status: 'pending'
    }]);

    // 2. Add initial update
    await supabase.from('order_updates').insert([{
      orderId,
      status: 'pending',
      location: 'Warehouse',
      description: 'Order received and awaiting payment confirmation.'
    }]);

    // 3. Create Payment Intent with orderId in metadata
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_check: "accept_a_payment",
        order_id: orderId,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, orderId });
  } catch (error: any) {
    console.error("[DAWL] Stripe Error:", error.message);
    res.status(500).json({ error: "An error occurred while processing your payment." });
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
          await supabase.from('orders').update({ status: 'paid' }).eq('id', orderIdFromMetadata);
          await supabase.from('order_updates').insert([{
            orderId: orderIdFromMetadata,
            status: 'paid',
            location: 'System',
            description: 'Payment confirmed via Stripe. Order is now being processed.'
          }]);
          console.log(`[DAWL] Order ${orderIdFromMetadata} marked as paid via webhook.`);
        } else {
          console.error(`[DAWL] Webhook Error: Order ${orderIdFromMetadata} not found in database.`);
        }
      }
      break;
    case "payment_intent.payment_failed":
      console.log(`[DAWL] Payment failed for ${event.data.object.id}`);
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
    console.log(`[DAWL] Starting server in ${process.env.NODE_ENV} mode`);
    console.log(`[DAWL] APP_URL: ${process.env.APP_URL}`);
    console.log(`[DAWL] VERCEL: ${process.env.VERCEL}`);

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      console.log("[DAWL] Starting Vite server...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      console.log("[DAWL] Vite server started. Using middlewares...");
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      if (!fs.existsSync(distPath)) {
        console.error(`[DAWL] CRITICAL: dist/ folder not found at ${distPath}. Build might have failed or not run.`);
        app.get("*", (req, res) => {
          res.status(500).send("Frontend build (dist/) is missing. Please run 'npm run build' or check your deployment configuration.");
        });
      } else {
        console.log(`[DAWL] Serving static files from ${distPath}`);
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[DAWL] Server running on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
      console.error("[DAWL] Server error:", err);
    });
  } catch (err) {
    console.error("[DAWL] Critical error starting server:", err);
  }
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
