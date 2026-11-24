# New World Atlas

The production site for *New World Atlas* by Matt Black: Next.js 16 on Vercel, content in Sanity, payments through
Stripe Checkout. Built from the clickable prototype.

**Start here: [SETUP.md](SETUP.md)** — running locally, connecting Sanity and Stripe, and deploying.

## Structure

| Path | What it is |
|---|---|
| `src/app/(site)/` | The website: Home (`page.tsx`), `chapters/[slug]`, `publications`, `publications/[slug]`, `checkout/success` |
| `src/app/(studio)/studio/` | Sanity Studio, the content editor, at `/studio` |
| `src/app/api/checkout` | Creates the Stripe Checkout session (prices are read from Sanity, not the browser) |
| `src/app/api/revalidate` | Sanity webhook: refreshes cached content when an editor publishes |
| `src/sanity/schemaTypes/` | The content model: chapters, publications and chapter page blocks |
| `src/content/` | Data fetching, GROQ queries, and the sample content used until Sanity is connected |
| `src/components/` | Nav and chapter menu, cover, home map, climate map, cart, video player |
| `src/lib/shop.ts` | Shipping countries, shipping rates and tax settings |
| `scripts/seed.mjs` | Exports the sample content for `sanity dataset import` |

The climate map uses NOAA NCEI nClimGrid May data (1926–2026) in `public/climate/`; see the credit under the map.
