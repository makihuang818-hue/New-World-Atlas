import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "@/components/bits";
import { money } from "@/content/format";
import { stripe } from "@/lib/shop";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <main className="page">
      <section className="done">
        <Suspense fallback={<h1>Confirming your order…</h1>}>
          <Confirmation searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

async function Confirmation({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const { session_id } = await searchParams;
  const session = stripe && typeof session_id === "string" ? await stripe.checkout.sessions.retrieve(session_id).catch(() => null) : null;

  if (!session || session.payment_status !== "paid") {
    return (
      <>
        <h1>We couldn’t confirm this order</h1>
        <p>If you were charged, you’ll receive a receipt by email shortly. Otherwise, <Link href="/publications">return to the shop</Link> and try again.</p>
      </>
    );
  }

  return (
    <>
      <ClearCart />
      <h1>Thank you for your order</h1>
      <p>
        We’ve received your payment of {money((session.amount_total ?? 0) / 100)}
        {session.customer_details?.email ? <> and sent a receipt to {session.customer_details.email}</> : null}.
      </p>
      <p>You’ll get another email when your order ships.</p>
      <p><Link href="/">Back to the atlas</Link></p>
    </>
  );
}
