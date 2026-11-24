import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuyBox, Carousel } from "@/components/bits";
import { ProductCard } from "@/components/cards";
import { getPublication, getPublications } from "@/content/data";
import { chapterLabel, money, src } from "@/content/format";

export async function generateStaticParams() {
  const pubs = await getPublications();
  return pubs.length ? pubs.map(p => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/publications/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublication(slug);
  return p ? { title: p.title, description: p.summary ?? undefined } : {};
}

export default function PublicationPage({ params }: PageProps<"/publications/[slug]">) {
  return (
    <main className="page page--publication">
      <Suspense fallback={null}><PublicationDetail params={params} /></Suspense>
    </main>
  );
}

async function PublicationDetail({ params }: Pick<PageProps<"/publications/[slug]">, "params">) {
  const { slug } = await params;
  const [p, all] = await Promise.all([getPublication(slug), getPublications()]);
  if (!p) notFound();
  const others = all.filter(o => o.id !== p.id).slice(0, 3);
  const label = chapterLabel(p.chapterNumber);

  return (
    <>
      <section className="detail">
        <Carousel images={p.images.map(im => ({ src: src(im, 1600) }))} />
        <div>
          <h1 className="detail__title">{label && <b>{label}</b>}{p.title}</h1>
          <p className="detail__price">{money(p.price)}</p>
          {p.summary && <div className="detail__body"><p>{p.summary}</p></div>}
          {p.soldOut ? (
            <p className="detail__sold">Sold out</p>
          ) : (
            <BuyBox item={{ id: p.id, slug: p.slug, title: p.title, chapter: label, price: p.price, image: src(p.image, 300) }} />
          )}
          {(p.details || p.specs?.length) && <h2 className="detail__h">DETAIL</h2>}
          <div className="detail__body">
            {p.details && <p>{p.details}</p>}
            {p.specs?.length ? <ul>{p.specs.map(s => <li key={s}>{s}</li>)}</ul> : null}
          </div>
        </div>
      </section>
      {others.length > 0 && (
        <section className="others">
          <div className="others__head"><span>Other Publications</span><Link href="/publications">View all</Link></div>
          <div className="grid3">{others.map(o => <ProductCard key={o.id} p={o} />)}</div>
        </section>
      )}
    </>
  );
}
