"use client";

import { useEffect, useRef, useState } from "react";

const PAUSE = <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" />;
const PLAY = <path d="M2 1l7 4-7 4z" fill="currentColor" />;

type Props = { src: string; poster?: string; label?: string; className?: string; still?: React.ReactNode };

// Plays while at least half of it is on screen; the square button pauses it, and a pause sticks.
// The button hides 5s after the video starts or the pointer leaves; hovering, tapping or focusing brings it back.
export function AutoVideo({ src, poster, label, className, still }: Props) {
  const media = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [idle, setIdle] = useState(false);
  const [failed, setFailed] = useState(false);
  const userPaused = useRef(false);
  const hovering = useRef(false);
  const idleT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const wake = (isPlaying = !video.current?.paused) => {
    clearTimeout(idleT.current);
    setIdle(false);
    if (isPlaying && !hovering.current) idleT.current = setTimeout(() => setIdle(true), 5000);
  };

  const play = (on: boolean) => {
    const v = video.current;
    if (!v) return;
    if (on) v.play().catch(() => {}); else v.pause();
  };

  useEffect(() => {
    const el = media.current, v = video.current;
    if (!el || !v) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onPlay = () => { setPlaying(true); wake(true); };
    const onPause = () => { setPlaying(false); wake(false); };
    v.addEventListener("play", onPlay); v.addEventListener("pause", onPause);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) play(false);
      else if (!userPaused.current && !still) play(true);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); v.removeEventListener("play", onPlay); v.removeEventListener("pause", onPause); clearTimeout(idleT.current); };
  }, [src]);

  return (
    <div
      ref={media}
      className={[className, idle && "is-idle", failed && "is-fallback", playing && "is-playing"].filter(Boolean).join(" ")}
      onPointerEnter={() => { hovering.current = true; wake(); }}
      onPointerLeave={() => { hovering.current = false; wake(); }}
      onPointerDown={() => wake()}
    >
      {still}
      <video ref={video} muted loop playsInline preload="metadata" poster={poster} aria-label={label}>
        <source src={src} type="video/mp4" onError={() => setFailed(true)} />
      </video>
      <button
        type="button"
        className="vbtn"
        aria-label={playing ? "Pause video" : "Play video"}
        onFocus={() => wake()}
        onClick={() => { userPaused.current = playing; play(!playing); }}
      >
        <svg viewBox="0 0 10 10" aria-hidden="true">{playing ? PAUSE : PLAY}</svg>
      </button>
    </div>
  );
}
