/**
 * TUF Stripe Routes
 * POST /api/stripe/create-checkout  — create a Stripe Checkout Session
 * POST /api/stripe/webhook          — handle Stripe webhook events
 */
import express, { Request, Response } from "express";
import Stripe from "stripe";
import { TUF_PRODUCTS } from "../products.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

// ─── Create Checkout Session ────────────────────────────────────────────────
router.post("/create-checkout", express.json(), async (req: Request, res: Response) => {
  try {
    const { tierId, interval, origin, userEmail, userName, userId } = req.body as {
      tierId: string;
      interval: "monthly" | "annual";
      origin: string;
      userEmail?: string;
      userName?: string;
      userId?: string;
    };

    const product = TUF_PRODUCTS.find((p) => p.id === tierId);
    if (!product) {
      return res.status(400).json({ error: "Invalid tier ID" });
    }

    const priceId = interval === "annual" ? product.annualPriceId : product.monthlyPriceId;

    // If we have a pre-created Stripe Price ID, use it directly.
    // Otherwise create a price on-the-fly (useful during initial setup).
    let stripePriceId = priceId;

    if (!stripePriceId) {
      // Create product + price dynamically on first use
      const stripeProduct = await stripe.products.create({
        name: `TUF ${product.name} — ${interval === "annual" ? "Annual" : "Monthly"}`,
        metadata: { tuf_tier: tierId, interval },
      });

      const price = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: interval === "annual" ? product.annualPrice : product.monthlyPrice,
        currency: "usd",
        recurring: {
          interval: interval === "annual" ? "year" : "month",
        },
      });

      stripePriceId = price.id;
      console.log(`[Stripe] Created price ${stripePriceId} for ${tierId}/${interval}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      customer_email: userEmail,
      allow_promotion_codes: true,
      client_reference_id: userId || undefined,
      metadata: {
        tuf_tier: tierId,
        interval,
        user_id: userId || "",
        customer_email: userEmail || "",
        customer_name: userName || "",
      },
      success_url: `${origin}/pricing?success=1&tier=${tierId}`,
      cancel_url: `${origin}/pricing?cancelled=1`,
    });

    return res.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[Stripe] Checkout error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ─── Webhook ────────────────────────────────────────────────────────────────
// NOTE: This route must receive raw body — registered with express.raw() in index.ts
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("[Stripe] Webhook signature error:", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe] Webhook event: ${event.type} (${event.id})`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `[Stripe] Checkout completed — customer: ${session.customer}, tier: ${session.metadata?.tuf_tier}`
      );
      // TODO: update user subscription status in DB when user table is extended
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[Stripe] Subscription cancelled: ${sub.id}`);
      break;
    }
    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
});

export default router;
