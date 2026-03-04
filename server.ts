import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

console.log("[DAWL] server.ts execution started");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dawl-secret-key-2026";

// Initialize Database
const db = new Database("dawl.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    firstName TEXT,
    lastName TEXT,
    role TEXT DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add role column if it doesn't exist
try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasRole = tableInfo.some((col: any) => col.name === "role");
  if (!hasRole) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    console.log("[DAWL] Migration: Added 'role' column to 'users' table.");
  }
} catch (err) {
  console.error("[DAWL] Migration failed:", err);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId INTEGER,
    status TEXT DEFAULT 'pending',
    total REAL,
    items TEXT,
    shippingAddress TEXT,
    trackingNumber TEXT,
    carrier TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS order_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT,
    status TEXT,
    location TEXT,
    description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(orderId) REFERENCES orders(id)
  )
`);

// Create default admin if not exists
const createAdmin = async () => {
  const adminEmail = "admin@dawl.studio"; // Default admin email
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    db.prepare(
      "INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)"
    ).run(adminEmail, hashedPassword, "Admin", "User", "admin");
    console.log("[DAWL] Default admin created: admin@dawl.studio / admin123");
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
    const key = process.env.STRIPE_SECRET_KEY || process.env.secret_key;
    if (!key) {
      console.warn("[DAWL] Stripe secret key is missing. Payment features will be disabled.");
      return null;
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
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
    res.json({
      publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY || process.env.publishable_key || process.env.STRIPE_PUBLISHABLE_KEY
    });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user exists
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare(
        "INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)"
      ).run(email, hashedPassword, firstName, lastName);

      const user = { id: result.lastInsertRowid, email, firstName, lastName, role: 'user' };
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({ token, user });
    } catch (error: any) {
      console.error("[DAWL] Registration Error:", error.message);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
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
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "Google Client ID not configured" });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account"
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

    if (!code || !clientId || !clientSecret) {
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
      let user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(googleUser.email);
      
      if (!user) {
        const result = db.prepare(
          "INSERT INTO users (email, firstName, lastName, role) VALUES (?, ?, ?, ?)"
        ).run(googleUser.email, googleUser.given_name || "Google", googleUser.family_name || "User", "user");
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      }

      // 4. Generate JWT
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      const { password: _, ...userWithoutPassword } = user;

      // 5. Send success message to popup opener
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  token: '${token}', 
                  user: ${JSON.stringify(userWithoutPassword)} 
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
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const admin: any = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
      }

      const users = db.prepare("SELECT id, email, firstName, lastName, role, createdAt FROM users ORDER BY createdAt DESC").all();
      res.json(users);
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // --- ORDER & SHIPPING INFRASTRUCTURE ---

  // 1. Create Order (Simulated after payment)
  app.post("/api/orders", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);

      const { items, total, shippingAddress } = req.body;
      const orderId = `DWL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      db.prepare(
        "INSERT INTO orders (id, userId, total, items, shippingAddress) VALUES (?, ?, ?, ?, ?)"
      ).run(orderId, decoded.id, total, JSON.stringify(items), JSON.stringify(shippingAddress));

      // 2. Simulate ERP/WMS Integration: Notify Warehouse
      console.log(`[DAWL WMS] Order ${orderId} sent to warehouse for processing.`);
      
      // Add initial update
      db.prepare(
        "INSERT INTO order_updates (orderId, status, location, description) VALUES (?, ?, ?, ?)"
      ).run(orderId, 'pending', 'Warehouse', 'Order received and being processed.');

      res.status(201).json({ orderId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Admin: Simulate Shipping (WMS -> Carrier API)
  app.post("/api/admin/orders/:id/ship", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const admin: any = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
      if (!admin || admin.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

      const orderId = req.params.id;
      const carrier = "DHL Express";
      const trackingNumber = `TRK${Math.floor(Math.random() * 1000000000)}`;

      // Simulate Carrier API Call
      console.log(`[DAWL CARRIER] Requesting tracking for ${orderId} from ${carrier}...`);

      db.prepare(
        "UPDATE orders SET status = 'shipped', carrier = ?, trackingNumber = ? WHERE id = ?"
      ).run(carrier, trackingNumber, orderId);

      db.prepare(
        "INSERT INTO order_updates (orderId, status, location, description) VALUES (?, ?, ?, ?)"
      ).run(orderId, 'shipped', 'Distribution Center', `Package picked up by ${carrier}. Tracking: ${trackingNumber}`);

      res.json({ success: true, trackingNumber });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Shipping Webhook (Simulated Carrier Updates)
  app.post("/api/webhooks/shipping", async (req, res) => {
    const { orderId, status, location, description } = req.body;
    
    try {
      db.prepare(
        "UPDATE orders SET status = ? WHERE id = ?"
      ).run(status, orderId);

      db.prepare(
        "INSERT INTO order_updates (orderId, status, location, description) VALUES (?, ?, ?, ?)"
      ).run(orderId, status, location, description);

      console.log(`[DAWL WEBHOOK] Shipping update for ${orderId}: ${status} at ${location}`);
      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Get Order Status (Branded Tracking Page API)
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      const updates = db.prepare("SELECT * FROM order_updates WHERE orderId = ? ORDER BY timestamp DESC").all();
      res.json({ ...order, updates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Admin: Get All Orders
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const admin: any = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
      if (!admin || admin.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

      const orders = db.prepare("SELECT o.*, u.email as userEmail FROM orders o JOIN users u ON o.userId = u.id ORDER BY o.createdAt DESC").all();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { items, currency = "eur" } = req.body;
      const stripeClient = getStripe();

      if (!stripeClient) {
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }

      let amount = 0;

      // SECURITY: Calculate total on server using the price map
      if (priceMap && priceMap.items) {
        for (const item of items) {
          // item.id here should be the SKU
          const mappedItem = priceMap.items[item.id];
          if (mappedItem) {
            amount += mappedItem.unitAmount * item.quantity;
          } else {
            console.warn(`[DAWL] SKU ${item.id} not found in price map.`);
            // Fallback or error? For security, we should probably error or use a safe fallback
            // For now, let's use the price sent by client ONLY if not in map (less secure but flexible for dev)
            amount += (item.price * 100) * item.quantity;
          }
        }
      } else {
        // Fallback to client-provided prices if map doesn't exist yet
        amount = items.reduce((acc: number, item: any) => acc + (item.price * 100 * item.quantity), 0);
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount." });
      }

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount), // amount is already in cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          integration_check: "accept_a_payment",
          order_id: `order_${Date.now()}`,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
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
        const paymentIntent = event.data.object;
        console.log(`[DAWL] PaymentIntent for ${paymentIntent.amount} was successful!`);
        // Here you would fulfill the order (e.g., send email, update DB)
        break;
      default:
        console.log(`[DAWL] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("[DAWL] Creating Vite server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    console.log("[DAWL] Vite server created, mounting middleware.");
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DAWL] 🚀 Server is live!`);
    console.log(`[DAWL] URL: http://0.0.0.0:${PORT}`);
    console.log(`[DAWL] Mode: ${process.env.NODE_ENV || "development"}`);
    const hasSecretKey = !!(process.env.STRIPE_SECRET_KEY || process.env.secret_key);
    console.log(`[DAWL] Stripe Key: ${hasSecretKey ? "✅ Present" : "❌ Missing"}`);
    console.log(`[DAWL] Price Map: ${priceMap ? "✅ Loaded" : "❌ Not Found"}`);
  });
}

startServer();
