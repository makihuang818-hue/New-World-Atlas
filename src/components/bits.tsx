"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart/Cart";

// Small interactive pieces shared across pages.

/** Fades `.reveal` blocks in as they scroll into view, including blocks that stream in after navigation. */
export function RevealOnScroll() {
  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll(".reveal:not(.is-in)").forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      // Hidden tabs don't run the observer, so show everything there instead of leaving blank blocks.
      if (document.visibilityState === "hidden") el.classList.add("is-in"); else io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
  return null;
}

const ARROW_L = <svg width="21" height="16" viewBox="0 0 21 16" aria-hidden="true"><path d="M21 8H1M6 3 1 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
const ARROW_R = <svg width="21" height="16" viewBox="0 0 21 16" aria-hidden="true"><path d="M0 8h20M15 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;

/** Field journal timeline with earlier/later arrows. */
export function JournalTrack({ date, place, children }: { date?: string; place?: string; children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const sync = () => {
    const t = track.current; if (!t) return;
    setEdge({ start: t.scrollLeft < 4, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 4 });
  };
  useEffect(sync, []);
  const go = (dir: number) => track.current?.scrollBy({ left: dir * 232 * 2 });
  return (
    <>
      <div className="journal__head">
        <div><p>{date}</p><p>{place}</p></div>
        <div className="journal__arrows">
          <button type="button" aria-label="Earlier" disabled={edge.start} onClick={() => go(-1)}>{ARROW_L}</button>
          <button type="button" aria-label="Later" disabled={edge.end} onClick={() => go(1)}>{ARROW_R}</button>
        </div>
      </div>
      <div ref={track} className="journal__track" onScroll={sync}><div className="journal__row">{children}</div></div>
    </>
  );
}

/** Home publications rail with previous/next arrows. */
export function PubRail({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const step = (dir: number) => {
    const t = track.current, first = t?.querySelector<HTMLElement>(".pub");
    if (t && first) t.scrollBy({ left: dir * (first.offsetWidth + 10) });
  };
  return (
    <>
      <div ref={track} className="pubs__track">{children}</div>
      <div className="pubs__nav">
        <button type="button" aria-label="Previous" onClick={() => step(-1)}><svg width="20" height="10" viewBox="0 0 20 10"><path d="M20 5H1M5 1 1 5l4 4" fill="none" stroke="currentColor" /></svg></button>
        <button type="button" aria-label="Next" onClick={() => step(1)}><svg width="20" height="10" viewBox="0 0 20 10"><path d="M0 5h19M15 1l4 4-4 4" fill="none" stroke="currentColor" /></svg></button>
      </div>
    </>
  );
}

const CHEVRON = (next: boolean) => <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true"><path d={next ? "M1.5 1l5 5-5 5" : "M6.5 1l-5 5 5 5"} fill="none" stroke="currentColor" /></svg>;

/** Product image carousel: arrows, dots and swipe. */
export function Carousel({ images }: { images: { src?: string; alt?: string }[] }) {
  const [idx, setIdx] = useState(0);
  const x0 = useRef<number | null>(null);
  const go = (i: number) => setIdx(Math.max(0, Math.min(images.length - 1, i)));
  return (
    <div>
      <div
        className="carousel"
        onPointerDown={e => (x0.current = e.clientX)}
        onPointerUp={e => { if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) go(idx + (e.clientX < x0.current ? 1 : -1)); x0.current = null; }}
      >
        <div className="carousel__track" style={{ transform: `translateX(${-idx * 100}%)` }}>
          {images.map((im, i) => <div key={i} className="carousel__slide">{im.src && <img src={im.src} alt={im.alt ?? ""} draggable={false} />}</div>)}
        </div>
        <button type="button" className="carousel__btn carousel__btn--prev" aria-label="Previous image" disabled={idx === 0} onClick={() => go(idx - 1)}>{CHEVRON(false)}</button>
        <button type="button" className="carousel__btn carousel__btn--next" aria-label="Next image" disabled={idx >= images.length - 1} onClick={() => go(idx + 1)}>{CHEVRON(true)}</button>
      </div>
      {images.length > 1 && <div className="carousel__dots">{images.map((_, i) => <i key={i} className={i === idx ? "is-on" : undefined} />)}</div>}
    </div>
  );
}

/** Quantity + Add to Cart on the publication page. */
export function BuyBox({ item }: { item: { id: string; slug: string; title: string; chapter: string; price: number; image?: string } }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  return (
    <div className="detail__buy">
      <div className="qty">
        <button type="button" aria-label="Decrease" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
        <output>{qty}</output>
        <button type="button" aria-label="Increase" onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
      </div>
      <button
        type="button"
        className={`btn${added ? " is-added" : ""}`}
        onClick={() => { add(item, qty); setAdded(true); setTimeout(() => setAdded(false), 1400); }}
      >
        {added ? "Added" : "Add to Cart"}
      </button>
    </div>
  );
}

/** Empties the cart once Stripe confirms the order. */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}

/** Newsletter sign-up. Not connected to a mailing service yet. */
export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="news">
      <div>
        <h2>Get the latest updates</h2>
        <p>We publish occasional email newsletters on new chapters and zines for New World Atlas. Add your name to receive the latest updates.</p>
      </div>
      {done ? <p className="news__thanks">Thanks — you’re on the list.</p> : (
        <form onSubmit={e => { e.preventDefault(); setDone(true); }}>
          <input type="email" placeholder="Email Address*" aria-label="Email address" required />
          <input type="text" placeholder="First Name*" aria-label="First name" required />
          <input type="text" placeholder="Last Name*" aria-label="Last name" required />
          <button className="submit" type="submit">Subscribe</button>
        </form>
      )}
    </section>
  );
}
