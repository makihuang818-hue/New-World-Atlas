"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { src } from "@/content/format";
import type { ChapterSummary } from "@/content/types";
import { useCart } from "./cart/Cart";

export function Nav({ chapters }: { chapters: ChapterSummary[] }) {
  const pathname = usePathname();
  const { count, bump, setOpen: openCart } = useCart();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (on: boolean) => setOpenOn(on ? pathname : null);
  const [shown, setShown] = useState<number | null>(null);
  const nav = useRef<HTMLElement>(null);
  const hideT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const badge = useRef<HTMLSpanElement>(null);

  const current = pathname.startsWith("/chapters/") ? pathname.split("/")[2] : null;
  const onPubs = pathname.startsWith("/publications");
  const rows = Math.max(1, Math.ceil(chapters.length / 2));

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!nav.current?.contains(e.target as Node)) setOpenOn(null); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  useEffect(() => {
    if (!bump || !badge.current) return;
    const b = badge.current;
    b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }, [bump]);

  // Nothing hovered, nothing shown; the short delay keeps the image from flickering between rows.
  const show = (n: number | null) => { clearTimeout(hideT.current); if (n !== null) setShown(n); else hideT.current = setTimeout(() => setShown(null), 80); };
  const shownChapter = chapters.find(c => c.number === shown);

  return (
    <header ref={nav} className={`nav${open ? " is-menu" : ""}`}>
      <div className="nav__left">
        <button type="button" className="nav__menu" aria-expanded={open} aria-controls="menu" onClick={() => { setShown(null); setOpen(!open); }}>
          <span className="nav__burger" aria-hidden="true"><i /><i /></span><span className="nav__label">Chapter</span>
        </button>
      </div>
      <Link className="nav__title" href="/">New World Atlas</Link>
      <div className="nav__right">
        <Link href="/publications" aria-current={onPubs ? "page" : undefined}>Publications</Link>
        <button type="button" className="nav__bag" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`} onClick={() => { setOpen(false); openCart(true); }}>
          <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 4h10v9H1zM3.5 4V3a2.5 2.5 0 0 1 5 0v1" fill="none" stroke="currentColor" /></svg>
          <span ref={badge} className={`nav__count${count > 0 ? " is-on" : ""}`}><span>{count}</span></span>
        </button>
      </div>
      <div className="menu" id="menu" inert={!open}>
        <ol
          className="menu__list"
          style={{ "--rows": rows } as React.CSSProperties}
          onPointerLeave={() => show(null)}
          onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) show(null); }}
        >
          {chapters.map((c, i) => (
            <li key={c.slug} style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={`/chapters/${c.slug}`}
                aria-current={current === c.slug ? "page" : undefined}
                onPointerEnter={() => show(c.number)}
                onFocus={() => show(c.number)}
                onClick={() => setOpen(false)}
              >
                <span>{c.number}</span><span>{c.title}</span>
              </Link>
            </li>
          ))}
        </ol>
        <figure className="menu__preview" style={{ margin: 0 }}>
          {chapters.map(c => c.previewImage && <img key={c.slug} src={src(c.previewImage, 500)} alt="" loading="lazy" className={c.number === shown ? "is-on" : undefined} />)}
          <figcaption>{shownChapter?.state ?? ""}</figcaption>
        </figure>
      </div>
    </header>
  );
}
