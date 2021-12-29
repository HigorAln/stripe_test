import Stripe from "stripe";

export const stripe = new Stripe(process.env.SECRET_KEY_STIPE, {
  apiVersion: "2020-08-27",
  appInfo: {
    name: "test_stripe",
    version: "0.1.0",
  },
});
