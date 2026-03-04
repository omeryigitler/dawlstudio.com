import fs from "node:fs";
import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY in env.");
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: "2025-01-27.acacia" });

async function main() {
  const map = {};
  let missingSku = 0;

  console.log("Fetching products from Stripe...");

  // Get all active products
  let starting_after = undefined;

  while (true) {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      ...(starting_after ? { starting_after } : {}),
    });

    for (const p of page.data) {
      const sku = p.metadata?.sku?.trim();
      if (!sku) {
        missingSku++;
        continue;
      }

      // Fetch one-time EUR price(s) for this product
      const prices = await stripe.prices.list({
        product: p.id,
        active: true,
        limit: 10,
      });

      const price = prices.data.find(
        (pr) => pr.type === "one_time" && pr.currency === "eur"
      );

      if (!price) {
        console.warn(`No EUR one-time price found for SKU ${sku} (product ${p.id})`);
        continue;
      }

      map[sku] = {
        productId: p.id,
        priceId: price.id,
        unitAmount: price.unit_amount, // in cents
        currency: price.currency,
        name: p.name,
        edition: p.metadata?.edition || null,
        color: p.metadata?.color || null,
        scent: p.metadata?.scent || null,
        size_g: p.metadata?.size_g || null,
        note_card: p.metadata?.note_card || null,
        lid: p.metadata?.lid || null,
      };
    }

    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  const out = {
    generatedAt: new Date().toISOString(),
    modeHint: secretKey.startsWith("sk_test_") ? "test" : "live",
    items: map,
    warnings: {
      productsMissingSkuMetadata: missingSku,
    },
  };

  if (!fs.existsSync("./stripe")) {
    fs.mkdirSync("./stripe", { recursive: true });
  }
  
  fs.writeFileSync("./stripe/price-map.json", JSON.stringify(out, null, 2));
  console.log("✅ Generated: stripe/price-map.json");
  console.log(`Items: ${Object.keys(map).length}, Missing SKU metadata: ${missingSku}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
