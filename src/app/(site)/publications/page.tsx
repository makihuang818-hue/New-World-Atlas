import type { Metadata } from "next";
import { ProductCard } from "@/components/cards";
import { getPublications } from "@/content/data";

export const metadata: Metadata = { title: "Publications" };

export default async function PublicationsPage() {
  const publications = await getPublications();
  return (
    <main className="page">
      {publications.length ? (
        <section className="shop"><div className="grid3">{publications.map(p => <ProductCard key={p.id} p={p} />)}</div></section>
      ) : (
        <p className="empty-note">New publications are coming soon.</p>
      )}
    </main>
  );
}
