"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { src } from "@/content/format";
import type { ChapterSummary } from "@/content/types";

const LABELS: [string, number, number][] = [
  ["Washington", 341.75, 97.5], ["Oregon", 316, 205], ["California", 254.26, 413], ["Nevada", 367, 364],
  ["Idaho", 467, 241], ["Montana", 603, 148], ["Wyoming", 613, 288], ["Utah", 504, 397],
  ["Colorado", 648, 429], ["Arizona", 467.24, 561.47], ["New Mexico", 607, 577], ["North Dakota", 783, 154],
  ["South Dakota", 782, 257], ["Nebraska", 801, 355], ["Kansas", 833, 455], ["Oklahoma", 856, 559], ["Texas", 820, 701],
];
const CARD_Y = 33;      // Figma card position
const HIDE_DELAY = 150; // ms before the card hides after the pointer leaves a tag
const SWAP = 112;       // crossfade between tags: 40% of the 280ms card transition

type Pin = { key: string; x: number; y: number; chapter: ChapterSummary };

export function HomeMap({ chapters }: { chapters: ChapterSummary[] }) {
  const pins: Pin[] = chapters.flatMap(c => c.mapPins.map((p, i) => ({ key: `${c.slug}-${i}`, x: p.x, y: p.y, chapter: c })));
  const homeMap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const pillEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const [scale, setScale] = useState(1);
  const [active, setActiveKey] = useState<string | null>(null);
  const [shown, setShown] = useState<ChapterSummary | null>(null);
  const [cardOn, setCardOn] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [cardX, setCardX] = useState(1087);
  const t = useRef<{ hide?: ReturnType<typeof setTimeout>; swap?: ReturnType<typeof setTimeout> }>({});
  const state = useRef({ active: null as string | null, cardOn: false });

  // Fit the 1440 × 899 artboard to the page width.
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(1, (homeMap.current?.clientWidth || 1440) / 1440));
    fit();
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);

  // The card's right edge sits on the grid's right margin, whatever the window width.
  const placeCard = useCallback(() => {
    const hm = homeMap.current, st = stage.current, c = card.current;
    if (!hm || !st || !c) return;
    const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) || 30;
    const offset = st.getBoundingClientRect().left - hm.getBoundingClientRect().left;
    setCardX((hm.clientWidth - gutter - offset) / scale - c.offsetWidth);
  }, [scale]);
  useEffect(placeCard, [placeCard]);

  const setActive = useCallback((key: string | null) => {
    clearTimeout(t.current.hide);
    const s = state.current;
    if (key === s.active) return;
    s.active = key;
    setActiveKey(key);
    const pin = pins.find(p => p.key === key);
    if (!pin) { s.cardOn = false; setCardOn(false); setSwapping(false); return; }
    placeCard();
    if (s.cardOn) {
      setSwapping(true);
      clearTimeout(t.current.swap);
      t.current.swap = setTimeout(() => { setShown(pin.chapter); setSwapping(false); }, SWAP);
    } else {
      setShown(pin.chapter);
      s.cardOn = true;
      setCardOn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeCard, chapters]);

  const request = useCallback((key: string | null) => {
    clearTimeout(t.current.hide);
    if (key) setActive(key);
    else if (state.current.active) t.current.hide = setTimeout(() => setActive(null), HIDE_DELAY);
  }, [setActive]);

  useEffect(() => () => { clearTimeout(t.current.hide); clearTimeout(t.current.swap); }, []);

  return (
    <section ref={homeMap} className="home-map" aria-label="Chapters map" style={{ height: 899 * scale }}>
      <div
        ref={stage}
        className={`stage${active ? " is-active" : ""}`}
        style={{ transform: `scale(${scale})` }}
        onPointerMove={e => {
          const pill = (e.target as HTMLElement).closest<HTMLElement>(".pill");
          request(pill?.dataset.key ?? null);
        }}
        onPointerLeave={() => request(null)}
      >
        <div className="stage__tint" />
        <div className="stage__map">
          <img src="/map/state-borders.svg" alt="" />
          <img src="/map/coastline.svg" alt="" />
        </div>
        <div>
          {LABELS.map(([name, x, y]) => <p key={name} className="state-label" style={{ left: x, top: y, margin: 0 }}>{name}</p>)}
        </div>
        <div>
          {pins.map((p, i) => (
            <Link
              key={p.key}
              ref={el => { pillEls.current[i] = el; }}
              href={`/chapters/${p.chapter.slug}`}
              className={`pill${active === p.key ? " is-hover" : ""}`}
              data-key={p.key}
              style={{ left: p.x, top: p.y + 10 }}
              aria-label={`Chapter ${p.chapter.number}: ${p.chapter.title}, ${p.chapter.state}`}
              onFocus={() => setActive(p.key)}
              onBlur={() => request(null)}
              onKeyDown={e => {
                const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
                if (!step) return;
                e.preventDefault();
                pillEls.current[(i + step + pins.length) % pins.length]?.focus();
              }}
            >
              <span className="pill__num">{p.chapter.number}</span>
              <span className="pill__cta">
                {p.chapter.title}{" "}
                <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true"><path d="M0 3.5h7M4.5 1 7 3.5 4.5 6" fill="none" stroke="#eee" /></svg>
              </span>
            </Link>
          ))}
        </div>
        <div ref={card} className={`card${cardOn ? " is-on" : ""}${swapping ? " is-swapping" : ""}`} style={{ left: cardX, top: CARD_Y }} aria-live="polite">
          <div className="card__inner">
            <div className="card__img">{shown?.previewImage && <img src={src(shown.previewImage, 700)} alt="" />}</div>
            <div className="card__text">
              <div className="card__title">{shown && <>Chapter {shown.number} <span>{shown.title}</span></>}</div>
              <div className="card__body">{shown?.cardText}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
