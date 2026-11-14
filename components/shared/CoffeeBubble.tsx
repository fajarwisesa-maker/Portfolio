"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCoffee } from "@/lib/realtime/hooks";

type Pop = { id: number; x: number };

/**
 * Floating coffee cup. Click = +1 on a counter every visitor sees live.
 * Drag it anywhere; it stays where you leave it.
 * Theme with CSS variables on a parent: --cf-bg, --cf-fg, --cf-accent, --cf-border.
 */
export default function CoffeeBubble({ onBrew }: { onBrew?: () => void }) {
  const { count, brew, poured } = useCoffee();
  const [pops, setPops] = useState<Pop[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const toastTimer = useRef<number>(0);
  const prevCount = useRef<number | null>(null);

  // Bump the badge whenever the number changes (including clicks from other visitors).
  useEffect(() => {
    if (count !== null && prevCount.current !== null && count !== prevCount.current) setBump((b) => b + 1);
    prevCount.current = count;
  }, [count]);

  const say = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const click = () => {
    if (!brew()) return say("One cup per visit. Refresh to pour another.");
    const id = Date.now() + Math.random();
    setPops((p) => [...p, { id, x: Math.round((Math.random() - 0.5) * 44) }]);
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900);
    say("Thanks for the coffee!");
    onBrew?.();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    drag.current = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setPos({
      x: Math.min(window.innerWidth - w - 8, Math.max(8, d.ox + dx)),
      y: Math.min(window.innerHeight - h - 8, Math.max(8, d.oy + dy)),
    });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) click();
  };

  return (
    <div
      ref={ref}
      className="cf"
      data-poured={poured || undefined}
      data-dragged={pos ? "" : undefined}
      style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
    >
      <div className="cf-toast" role="status" aria-live="polite" data-show={toast ? "" : undefined}>
        {toast}
      </div>
      <button
        type="button"
        className="cf-btn"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            click();
          }
        }}
        aria-label={poured ? `You gave Fajar a coffee. ${count ?? 0} given so far.` : `Give Fajar a virtual coffee. ${count ?? 0} given so far.`}
      >
        <svg className="cf-cup" viewBox="0 0 48 48" width="30" height="30" fill="none" aria-hidden>
          <g className="cf-steam" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 13c-2-3 2-4 0-7" />
            <path d="M24 13c-2-3 2-4 0-7" />
            <path d="M31 13c-2-3 2-4 0-7" />
          </g>
          <path d="M10 19h28v10a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" fill="currentColor" />
          <path d="M38 22h3a5 5 0 0 1 0 10h-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span key={bump} className="cf-count">
          {count === null ? "·" : count.toLocaleString("en-US")}
        </span>
        {pops.map((p) => (
          <span key={p.id} className="cf-pop" style={{ ["--x" as string]: `${p.x}px` }} aria-hidden>
            +1
          </span>
        ))}
      </button>
    </div>
  );
}
