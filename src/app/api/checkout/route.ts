import { getPublicationsById } from "@/content/data";
import { chapterLabel } from "@/content/format";
import { AUTOMATIC_TAX, CURRENCY, SHIP_COUNTRIES, SHIPPING_RATES, stripe } from "@/lib/shop";

// Creates a Stripe Checkout session from the cart. Only ids and quantities come from the browser;
// titles, prices and stock are read fresh from the CMS so they can't be tampered with.
export async function POST(request: Request) {
  if (!stripe) return Response.json({ error: "Payments aren’t set up yet." }, { status: 503 });

  const body = await request.json().catch(() => null);
  const want = new Map<string, number>();
  for (const it of Array.isArray(body?.items) ? body.items : []) {
    if (typeof it?.id !== "string") continue;
    want.set(it.id, Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1))));
  }
  if (!want.size || want.size > 50) return Response.json({ error: "Your cart is empty." }, { status: 400 });

  const publications = await getPublicationsById([...want.keys()]);
  const available = publications.filter(p => !p.soldOut && p.price > 0);
  if (available.length !== want.size) {
    return Response.json({ error: "Something in your cart is no longer available. Please remove it and try again." }, { status: 409 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: available.map(p => {
        const label = chapterLabel(p.chapterNumber);
        const image = p.image?.url?.startsWith("https://") ? `${p.image.url}?w=800&auto=format` : undefined;
        return {
          quantity: want.get(p.id),
          price_data: {
            currency: CURRENCY,
            unit_amount: Math.round(p.price * 100),
            product_data: { name: label ? `${label} — ${p.title}` : p.title, images: image ? [image] : undefined, metadata: { publicationId: p.id } },
          },
        };
      }),
      shipping_address_collection: { allowed_countries: SHIP_COUNTRIES },
      shipping_options: SHIPPING_RATES.map(r => ({
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: r.label,
          fixed_amount: { amount: Math.round(r.amount * 100), currency: CURRENCY },
          delivery_estimate: { minimum: { unit: "business_day", value: r.days[0] }, maximum: { unit: "business_day", value: r.days[1] } },
        },
      })),
      automatic_tax: { enabled: AUTOMATIC_TAX },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/publications`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout failed", e);
    return Response.json({ error: "Checkout is unavailable right now. Please try again in a moment." }, { status: 502 });
  }
}
