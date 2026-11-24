# New World Atlas — setup guide

The site runs without any accounts: until Sanity is connected it shows the prototype's sample content, and checkout
says payments aren't set up. Each part below switches on one piece. Do them in order.

Run every command from the project folder.

---

## 1. Run it on your Mac

```bash
npm install
npm run dev
```

Open http://localhost:3000. The editor (Sanity Studio) lives at http://localhost:3000/studio.

`.env.local` holds your settings (it never goes to GitHub). `.env.example` lists every setting with a note.

---

## 2. Connect Sanity (the content editor)

**a. Sign in and create the project**

1. Go to https://www.sanity.io/manage and sign in (or create a free account).
2. Click **Create project**, name it *New World Atlas*, and keep the dataset name **production** (public).
3. Copy the **Project ID** shown at the top of the project page.

**b. Point the site at it**

1. In `.env.local`, set `NEXT_PUBLIC_SANITY_PROJECT_ID=` to that ID.
2. Restart `npm run dev`.

**c. Allow the Studio to talk to Sanity** — in sanity.io/manage → your project → **API** → **CORS origins**, add
`http://localhost:3000` and tick **Allow credentials**. (Later, add your live address the same way.)

**d. Import the prototype content** — this uploads all 30 chapters, the publication, and their images and videos.
It needs the sample media in `public/seed/`, which is kept out of the GitHub upload; run it from the original folder:

```bash
npx sanity login
npm run seed
npx sanity dataset import scripts/seed.ndjson production --replace
```

**e. Edit** — open http://localhost:3000/studio and sign in with the same Sanity account. Change a chapter title,
click **Publish**, and reload the page: the site updates within about a minute.

**f. Instant updates on the live site (after step 4)** — in sanity.io/manage → **API** → **Webhooks** → **Create webhook**:
- URL: `https://YOUR-SITE/api/revalidate`
- Trigger on: Create, Update, Delete · Filter: `_type in ["chapter", "publication"]`
- HTTP method: POST · Secret: the same value as `SANITY_REVALIDATE_SECRET`

**g. Invite the client** — sanity.io/manage → **Members** → **Invite**, role *Editor* (or *Administrator*).
To hand the project over completely, an Administrator can move it to the client's organization under **Settings**.

### How the content is organised

- **Chapters**: number, title, state, dates, and a list of page blocks (video, text, large text, image, two images,
  field journal, publication link) you can add, reorder and remove. The *Home map & menu* tab holds the preview
  image, the map card text, and where the numbered tag sits on the home map.
- **Publications**: title, linked chapter, price, *Sold out* switch, images, text and specs. Prices here are what
  Stripe charges.

Videos: upload MP4 (H.264), ideally under ~25 MB. They play muted on loop.

---

## 3. Connect Stripe (payments)

**a. Test mode (safe, no real money)**

1. Create an account at https://dashboard.stripe.com (no business details needed for test mode).
2. Make sure **Test mode** is on, then go to **Developers → API keys** and copy the **Secret key** (`sk_test_…`).
3. In `.env.local`, set `STRIPE_SECRET_KEY=` to it and restart `npm run dev`.
4. Add a publication to the cart and click **Check out**. On Stripe's page use card `4242 4242 4242 4242`, any
   future date, any CVC and any US address. You land on the thank-you page and the order shows under
   **Payments** in the Stripe dashboard (with the shipping address).

**b. Going live** — real payouts need the client's own Stripe account (Stripe accounts can't be transferred):

1. The client creates/activates their Stripe account with business and bank details.
2. Put their **live** secret key (`sk_live_…`) in Vercel's environment variables (step 4), not in `.env.local`.
3. In Stripe → **Settings → Customer emails**, turn on *Successful payments* so buyers get receipts.

**c. Shipping and tax** are set in `src/lib/shop.ts`:
- `SHIP_COUNTRIES`: where you ship (US only to start).
- `SHIPPING_RATES`: the options shown at checkout (Standard $8, Express $25 — placeholders, set real prices).
- Sales tax: register in Stripe → **Tax**, then set `STRIPE_AUTOMATIC_TAX=true`.

When an order comes in, Stripe emails the account owner and lists it under **Payments**; ship from the address
shown there. (A packing-list email or fulfilment integration can be added later.)

---

## 4. Put it online (GitHub + Vercel)

This project is a separate site from the prototype, so it gets its own repository and Vercel project.

**GitHub (in Chrome)**
1. On github.com click **New repository**. Name it `new-world-atlas-site`, choose **Private**, and don't add a README.
2. On the empty repository page, click **uploading an existing file**.
3. In Finder, open the project folder and press **Cmd + Shift + .** to show hidden files (`.gitignore`, `.env.example`).
   Select everything inside it (**Cmd + A**) and drag it onto the GitHub page. Dragging keeps the folders.
4. When all files have finished uploading, check the list shows folder paths (e.g. `src/app/...`), then click
   **Commit changes**.

(Or use GitHub Desktop: **File → Add local repository…**, create a repository there, then **Publish repository**.)

**Vercel**
1. On vercel.com → **Add New… → Project** → import `new-world-atlas-site`. If it isn't listed, click
   **Adjust GitHub App Permissions** and give Vercel access to it. Framework: Next.js (detected).
2. Before deploying, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = your Sanity project ID
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
   - `SANITY_REVALIDATE_SECRET` = any long random phrase (use the same one for the webhook in 2f)
   - later: `STRIPE_SECRET_KEY`, and `NEXT_PUBLIC_SITE_URL` = your live address
3. **Deploy.** Then add the live address to Sanity CORS (2c) and create the webhook (2f).

After that, every change committed to GitHub redeploys the site automatically.

---

## Notes

- The newsletter form shows a thank-you message but isn't connected to a mailing service yet.
- Footer links (Instagram, Privacy Policy, Site by) are placeholders in `src/app/(site)/layout.tsx`.
