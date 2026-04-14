/**
 * TUF Stripe Routes
 * POST /api/stripe/create-checkout  — create a Stripe Checkout Session
 * POST /api/stripe/webhook          — handle Stripe webhook events (tier sync to DB)
 * GET  /api/stripe/subscription     — get current user's subscription status
 */
import express, { Request, Response } from "express";
import Stripe from "stripe";
import { TUF_PRODUCTS } from "../products.js";
import { updateUserTier, getUserByStripeCustomer, upsertUser } from "../db.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

// ─── Tier mapping: Stripe product metadata → TUF tier ────────────────────────
type TufTier = "free" | "cub" | "stealth" | "controlled" | "apex";
const VALID_TIERS: TufTier[] = ["free", "cub", "stealth", "controlled", "apex"];

function normalizeTier(raw: string | undefined | null): TufTier {
  const t = (raw || "").toLowerCase() as TufTier;
  return VALID_TIERS.includes(t) ? t : "free";
}

// ─── Create Checkout Session ──────────────────────────────────────────────────
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
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&tier=${tierId}`,
      cancel_url: `${origin}/payment-cancelled`,
    });

    return res.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[Stripe] Checkout error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ─── Get subscription status for a user ──────────────────────────────────────
router.get("/subscription/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    // Try to find the user in DB
    const { getUser } = await import("../db.js");
    const user = await getUser(userId);
    if (!user) return res.json({ tier: "free", status: null });

    // If they have a Stripe subscription, fetch live status
    if (user.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
        return res.json({
          tier: user.tier || "free",
          status: sub.status,
          current_period_end: (sub as unknown as { current_period_end: number }).current_period_end,
          cancel_at_period_end: (sub as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end,
        });
      } catch {
        // Subscription may have been deleted in Stripe
      }
    }

    return res.json({
      tier: user.tier || "free",
      status: user.subscription_status || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ─── Create Customer Portal Session ──────────────────────────────────────────
router.post("/portal", express.json(), async (req: Request, res: Response) => {
  try {
    const { userId, origin } = req.body as { userId: string; origin: string };
    const { getUser } = await import("../db.js");
    const user = await getUser(userId);
    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: "No Stripe customer found for this user" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${origin}/billing`,
    });

    return res.json({ url: portalSession.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ─── Webhook ──────────────────────────────────────────────────────────────────
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

  // Handle test events (required for Stripe webhook verification)
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe] Webhook event: ${event.type} (${event.id})`);

  switch (event.type) {
    // ── New subscription created via checkout ──────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tierId = normalizeTier(session.metadata?.tuf_tier);
      const userId = session.metadata?.user_id || session.client_reference_id || "";
      const customerEmail = session.metadata?.customer_email || session.customer_email || "";
      const stripeCustomerId = typeof session.customer === "string" ? session.customer : "";

      console.log(`[Stripe] Checkout completed — tier: ${tierId}, user: ${userId}, email: ${customerEmail}`);

      // Resolve subscription ID from the session
      let subscriptionId = "";
      if (session.subscription) {
        subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      }

      // Update tier in DB — try by user_id first, then email
      const identifier = userId ? { user_id: userId } : { email: customerEmail };
      const updated = await updateUserTier(identifier, {
        tier: tierId,
        stripe_customer_id: stripeCustomerId || undefined,
        stripe_subscription_id: subscriptionId || undefined,
        subscription_status: "active",
      });

      if (!updated && customerEmail) {
        // User may not exist yet (guest checkout) — create a minimal record
        console.log(`[Stripe] User not found for ${customerEmail}, creating minimal record`);
        await upsertUser({
          user_id: userId || customerEmail,
          name: session.metadata?.customer_name || customerEmail,
          email: customerEmail,
          fitness_level: "beginner",
          goals: [],
          injuries: [],
          equipment: [],
          tier: tierId,
          stripe_customer_id: stripeCustomerId || undefined,
          stripe_subscription_id: subscriptionId || undefined,
          subscription_status: "active",
        });
      }
      break;
    }

    // ── Subscription updated (upgrade/downgrade) ───────────────────────────
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      // Determine tier from product metadata
      let tierId: TufTier = "free";
      if (sub.items?.data?.length) {
        const item = sub.items.data[0];
        const productId = typeof item.price.product === "string"
          ? item.price.product
          : item.price.product.id;
        try {
          const product = await stripe.products.retrieve(productId);
          tierId = normalizeTier(product.metadata?.tuf_tier);
        } catch {
          console.warn("[Stripe] Could not retrieve product for subscription update");
        }
      }

      const status = sub.status as "active" | "cancelled" | "past_due" | "trialing";
      const user = await getUserByStripeCustomer(customerId);
      if (user) {
        await updateUserTier(
          { user_id: user.user_id },
          {
            tier: tierId,
            stripe_subscription_id: sub.id,
            subscription_status: status,
          }
        );
        console.log(`[Stripe] Subscription updated — user ${user.user_id}: ${tierId} (${status})`);
      } else {
        console.warn(`[Stripe] No user found for customer ${customerId}`);
      }
      break;
    }

    // ── Subscription cancelled ─────────────────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const user = await getUserByStripeCustomer(customerId);
      if (user) {
        await updateUserTier(
          { user_id: user.user_id },
          {
            tier: "free",
            stripe_subscription_id: sub.id,
            subscription_status: "cancelled",
          }
        );
        console.log(`[Stripe] Subscription cancelled — user ${user.user_id} downgraded to free`);
      }
      break;
    }

    // ── Payment failed ─────────────────────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string"
        ? invoice.customer
        : (invoice.customer as Stripe.Customer).id;
      const user = await getUserByStripeCustomer(customerId);
      if (user) {
        await updateUserTier(
          { user_id: user.user_id },
          {
            tier: user.tier || "free",
            subscription_status: "past_due",
          }
        );
        console.log(`[Stripe] Payment failed — user ${user.user_id} marked past_due`);
      }
      break;
    }

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
});

export default router;
