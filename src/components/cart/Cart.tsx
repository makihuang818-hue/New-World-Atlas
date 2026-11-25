"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { money } from "@/content/format";

export type CartItem = { id: string; slug: string; title: string; chapter: string; price: number; image?: string; qty: number };

type CartApi = {
  items: CartItem[];
  count: number;
  open: boolean;
  bump: number;
  setOpen: (on: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);
export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
};

// The cart lives in localStorage, read through a tiny external store so every open tab stays in sync.
const KEY = "nwa-cart";
const EMPTY: CartItem[] = [];
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();
function read(): CartItem[] {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { cache = []; }
  return cache!;
}
function write(next: (items: CartItem[]) => CartItem[]) {
  cache = next(read());
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
  listeners.forEach(l => l());
}
function subscribe(listener: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; listener(); } };
  listeners.add(listener);
  addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); removeEventListener("storage", onStorage); };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  const add = useCallback((item: Omit<CartItem, "qty">, qty: number) => {
    write(list => {
      const hit = list.find(it => it.id === item.id);
      return hit ? list.map(it => (it.id === item.id ? { ...it, ...item, qty: Math.min(99, it.qty + qty) } : it)) : [...list, { ...item, qty }];
    });
    setBump(b => b + 1);
    setOpen(true);
  }, []);
  const setQty = useCallback((id: string, qty: number) => write(list => list.map(it => (it.id === id ? { ...it, qty: Math.max(1, Math.min(99, qty)) } : it))), []);
  const remove = useCallback((id: string) => write(list => list.filter(it => it.id !== id)), []);
  const clear = useCallback(() => write(() => []), []);

  const count = items.reduce((s, it) => s + it.qty, 0);
  return <CartContext value={{ items, count, open, bump, setOpen, add, setQty, remove, clear }}>{children}</CartContext>;
}

export function Qty({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="qty">
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <output>{value}</output>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(99, value + 1))}>+</button>
    </div>
  );
}

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove } = useCart();
  const [leaving, setLeaving] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => close.current?.focus(), 300);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => { clearTimeout(t); removeEventListener("keydown", onKey); };
  }, [open, setOpen]);

  const sub = items.reduce((s, it) => s + it.price * it.qty, 0);

  const drop = (id: string) => {
    setLeaving(id);
    setTimeout(() => { remove(id); setLeaving(null); }, 330);
  };

  // Stripe hosts the payment page; the server rebuilds the order from CMS prices.
  async function checkout() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(({ id, qty }) => ({ id, qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout is unavailable right now.");
      location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout is unavailable right now.");
      setBusy(false);
    }
  }

  return (
    <>
      <div className={`scrim${open ? " is-on" : ""}`} onClick={() => setOpen(false)} />
      <div className="cart-wrap">
        <aside className={`cart${open ? " is-on" : ""}`} aria-label="Cart" aria-hidden={!open} inert={!open}>
          <button ref={close} type="button" className="cart__close" aria-label="Close cart" onClick={() => setOpen(false)}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1 1 11" stroke="currentColor" /></svg>
          </button>
          <div className="cart__items">
            {items.length === 0 && <p className="cart__empty">Your cart is empty.</p>}
            {items.map(it => (
              <div key={it.id} className={`citem${leaving === it.id ? " is-leaving" : ""}`}>
                <div className="citem__img">{it.image && <img src={it.image} alt="" />}</div>
                <div className="citem__top"><span><b>{it.chapter}</b><span>{it.title}</span></span><span>{money(it.price * it.qty)}</span></div>
                <div className="citem__ctl">
                  <Qty value={it.qty} min={0} onChange={v => (v === 0 ? drop(it.id) : setQty(it.id, v))} />
                  <button type="button" className="citem__del" aria-label="Remove" onClick={() => drop(it.id)}>
                    <svg viewBox="0 0 16 16" width="16" height="16"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.5 6.5v5M9.5 6.5v5" fill="none" stroke="currentColor" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart__total">
            <div><span>Subtotal</span><span>{money(sub)}</span></div>
            <p className="cart__note">Shipping and tax are calculated at checkout.</p>
            <button type="button" className="btn btn--white" disabled={!items.length || busy} onClick={checkout}>{busy ? "Opening checkout…" : "Check out"}</button>
            {error && <p className="cart__error" role="alert">{error}</p>}
          </div>
        </aside>
      </div>
    </>
  );
}
