import Stripe from "stripe";

// Shop settings. Prices and stock live in Sanity; shipping and tax are set here.

export const CURRENCY = "usd";

// Countries Stripe Checkout will ship to (ISO codes). Add more, e.g. "CA", "GB", with a matching rate below.
export const SHIP_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = ["US"];

// Options the buyer chooses from on the Stripe page. Amounts in dollars.
export const SHIPPING_RATES = [
  { label: "Standard shipping", amount: 8, days: [5, 8] },
  { label: "Express shipping", amount: 25, days: [2, 3] },
];

// Sales tax via Stripe Tax: turn on with STRIPE_AUTOMATIC_TAX=true after registering in the Stripe dashboard.
export const AUTOMATIC_TAX = process.env.STRIPE_AUTOMATIC_TAX === "true";

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
