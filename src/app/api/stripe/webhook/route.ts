import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription || !session.customer) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0]?.price.id;

      const plan = priceId === process.env.STRIPE_TEAM_PRICE_ID ? "TEAM" : "INDIE";

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription || !invoice.customer) break;

      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: invoice.customer as string },
      });
      if (!user) break;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!user) break;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: "FREE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
