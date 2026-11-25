import Link from "next/link";
import { chapterLabel, money, src } from "@/content/format";
import type { PublicationSummary } from "@/content/types";

// Publication cards used on Home, the publications grid and "Other Publications".

export function PubRailCard({ p }: { p: PublicationSummary }) {
  return (
    <Link className="pub" href={`/publications/${p.slug}`}>
      <div className="pub__img">{p.image && <img src={src(p.image, 1400)} alt="" loading="lazy" />}</div>
      <div className="pub__meta"><b>{chapterLabel(p.chapterNumber)}</b>{p.title}<br />{p.soldOut ? "Sold out" : money(p.price)}</div>
    </Link>
  );
}

export function ProductCard({ p }: { p: PublicationSummary }) {
  return (
    <Link className="product" href={`/publications/${p.slug}`}>
      <div className="product__img">{p.image && <img src={src(p.image, 1000)} alt="" loading="lazy" />}</div>
      <div className="product__meta"><b>{chapterLabel(p.chapterNumber)}</b>{p.title}<br />{p.soldOut ? "Sold out" : money(p.price)}</div>
    </Link>
  );
}
