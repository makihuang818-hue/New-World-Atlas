"use client";

import { useEffect, useRef, useState } from "react";

// Shown once per page load of the home page (a reload starts over here); client-side visits to Home skip it.
let seen = false;

export function Cover() {
  // Server-rendered visible, so a fresh load never flashes the page underneath.
  const [gone, setGone] = useState(() => seen);
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const lockUntil = useRef(0);

  useEffect(() => {
    if (seen) return;
    seen = true;
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    root.current?.focus({ preventScroll: true });
  }, []);

  // The title spans the screen, less a gutter each side.
  useEffect(() => {
    const h1 = title.current!;
    const fit = () => {
      const gutter = Math.max(24, innerWidth * 0.04);
      const ink = () => { const r = document.createRange(); r.selectNodeContents(h1); return r.getBoundingClientRect(); };
      h1.style.fontSize = "100px"; h1.style.translate = "";
      const w = ink().width; if (!w) return;
      h1.style.fontSize = (100 * (innerWidth - gutter * 2)) / w + "px";
      // Italic glyphs sit off-centre; nudge the line so both gutters match.
      const r = ink(); h1.style.translate = `${(innerWidth - r.right - r.left) / 2}px 0`;
    };
    fit();
    document.fonts.ready.then(fit);
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);

  // Hold the page still while the cover is up and while it slides away (trackpad momentum included).
  useEffect(() => {
    const hold = (e: Event) => { if ((!gone || performance.now() < lockUntil.current) && e.cancelable) e.preventDefault(); };
    addEventListener("wheel", hold, { passive: false });
    addEventListener("touchmove", hold, { passive: false });
    const v = video.current;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (!gone) v?.play().catch(() => {});
    else t = setTimeout(() => v?.pause(), 1100); // let the slide finish first
    return () => { removeEventListener("wheel", hold); removeEventListener("touchmove", hold); clearTimeout(t); };
  }, [gone]);

  const leave = () => {
    if (gone) return;
    scrollTo(0, 0);
    lockUntil.current = performance.now() + 1300;
    setGone(true);
  };
  const touchY = useRef<number | null>(null);

  return (
    <div
      ref={root}
      className={`cover${gone ? " is-gone" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Enter New World Atlas"
      onClick={leave}
      onWheel={e => e.deltaY > 4 && leave()}
      onKeyDown={e => { if (["Enter", " ", "ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); leave(); } }}
      onTouchStart={e => (touchY.current = e.touches[0].clientY)}
      onTouchMove={e => { if (touchY.current !== null && touchY.current - e.touches[0].clientY > 30) { touchY.current = null; leave(); } }}
    >
      <div className="cover__img" />
      <video ref={video} className="cover__video" autoPlay muted loop playsInline preload="auto" poster="/media/cover.jpg" aria-hidden="true">
        <source src="/media/cover.mp4" type="video/mp4" />
      </video>
      <div className="cover__title">
        <h1 ref={title}>New World Atlas</h1>
        <p>Matt Black</p>
      </div>
      <div className="cover__hint">Enter<i /></div>
    </div>
  );
}
