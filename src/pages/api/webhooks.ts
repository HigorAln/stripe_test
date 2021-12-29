import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe-SSR";
import { PaymentSuccess } from "./_subscribe";

// Sistema de Stream
async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
// Fazendo com que a funcao receba um stream e nao um bodyParse
export const config = {
  api: {
    bodyParser: false,
  },
};

const relavantEvents = new Set([
  "checkout.session.completed",
  "payment_intent.succeeded",
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
  const buf = await buffer(req);
  const secret = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf, // passando a request do stream
      secret, // a secret key mandada pelo stripe
      process.env.STRIPE_WEBHOOK_SECRET // comparando para ver se a mesma
    );
  } catch (e) {
    return res.status(400).send("Webhook error: " + e.message);
  }

  const { type } = event;

  if (relavantEvents.has(type)) {
    try {
      switch (type) {
        case "checkout.session.completed":
          const subscription = event.data.object as Stripe.Subscription;
          console.log("entrou no hook");

          await PaymentSuccess({
            custumerId: subscription.customer.toString(),
            subscriptionId: subscription.id,
          });

          break;
        default:
          throw new Error("Unhandled event.");
      }
    } catch (e) {
      return res.json({ error: "webhook handler failed." });
    }
  }

  return res.json({ received: true });
}
