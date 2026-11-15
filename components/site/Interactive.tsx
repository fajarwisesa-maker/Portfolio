"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Moment } from "@/lib/content";
import CoffeeBubble from "@/components/shared/CoffeeBubble";

/* ---------------- Cursor line ---------------- */
/** A thin line that follows the mouse and fades out behind it. Colour comes from the canvas's CSS `color`. */
export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let m: string[] = ["255", "75", "31"];
    let tick = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    const pts: { x: number; y: number; t: number }[] = [];
    const LIFE = 560;
    let raf = 0;
    const frame = (now: number) => {
      raf = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      if (pts.length >= 3) {
        // the colour changes between the dark hero and the paper sections
        if (tick++ % 20 === 0) m = getComputedStyle(canvas).color.match(/\d+(\.\d+)?/g) ?? m;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < pts.length - 1; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const c = pts[i + 1];
          const life = 1 - (now - b.t) / LIFE;
          ctx.beginPath();
          ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
          ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
          ctx.strokeStyle = `rgba(${m[0]},${m[1]},${m[2]},${(life * 0.85).toFixed(3)})`;
          ctx.lineWidth = 0.6 + life * 2.2;
          ctx.stroke();
        }
      }
      if (pts.length) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > 90) pts.shift();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="trail" aria-hidden />;
}

/* ---------------- Cat ---------------- */
/** Bubu, the grey cat on the header. Eyes follow the cursor, says "Meoww!" on click and on coffee, dozes off after 20 s of no activity. */
export function Cat() {
  const ref = useRef<SVGSVGElement>(null);
  const [mood, setMood] = useState<"idle" | "happy" | "sleep">("idle");

  useEffect(() => {
    const svg = ref.current!;
    const pupils = svg.querySelectorAll<SVGElement>("[data-pupil]");
    let raf = 0;
    let sleepTimer = 0;
    let happyTimer = 0;
    const wake = () => {
      window.clearTimeout(sleepTimer);
      setMood((m) => (m === "sleep" ? "idle" : m));
      sleepTimer = window.setTimeout(() => setMood("sleep"), 20_000);
    };
    const onMove = (e: PointerEvent) => {
      wake();
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = svg.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.5);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 240);
        pupils.forEach((p) => (p.style.transform = `translate(${(dx / d) * 4.5 * k}px, ${(dy / d) * 3.5 * k}px)`));
      });
    };
    const cheer = () => {
      window.clearTimeout(happyTimer);
      wake();
      setMood("happy");
      happyTimer = window.setTimeout(() => setMood("idle"), 1500);
    };
    wake();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("keydown", wake);
    window.addEventListener("porto:coffee", cheer);
    return () => {
      window.clearTimeout(sleepTimer);
      window.clearTimeout(happyTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("porto:coffee", cheer);
    };
  }, []);

  return (
    <button
      type="button"
      className="cat"
      data-mood={mood}
      onClick={() => window.dispatchEvent(new Event("porto:coffee"))}
      aria-label="Pet Bubu the cat"
      title="Bubu"
    >
      <span className="cat-say" aria-hidden>
        Meoww!
      </span>
      <svg ref={ref} viewBox="0 0 120 96" width="58" height="46" aria-hidden>
        <path className="cat-tail" d="M96 84c14 2 20-8 16-18" fill="none" strokeWidth="7" strokeLinecap="round" />
        <path className="cat-body" d="M22 96V52c0-8 3-14 8-19L26 8l22 14c8-3 16-3 24 0L94 8l-4 25c5 5 8 11 8 19v44z" />
        <path className="cat-ear" d="M31 14l3 14 9-7zM89 14l-3 14-9-7z" />
        <g className="cat-open">
          <ellipse className="cat-eye" cx="44" cy="52" rx="9" ry="10" />
          <ellipse className="cat-eye" cx="76" cy="52" rx="9" ry="10" />
          <ellipse className="cat-pupil" data-pupil cx="44" cy="53" rx="4" ry="6" />
          <ellipse className="cat-pupil" data-pupil cx="76" cy="53" rx="4" ry="6" />
        </g>
        <path className="cat-line cat-smile" d="M36 54q8-9 16 0M68 54q8-9 16 0" />
        <path className="cat-line cat-shut" d="M36 52q8 6 16 0M68 52q8 6 16 0" />
        <path className="cat-ear" d="M57 64h6l-3 4z" />
        <g className="cat-z">
          <text x="102" y="24">z</text>
          <text x="112" y="10">z</text>
        </g>
      </svg>
    </button>
  );
}

/** Coffee bubble that also makes the cat cheer. */
export function Coffee() {
  return <CoffeeBubble onBrew={() => window.dispatchEvent(new Event("porto:coffee"))} />;
}

/* ---------------- Folders ---------------- */
export type FolderItem = { id: string; label: string; sub: string; peek: string[]; content: ReactNode };

/**
 * Frosted folders that open. With several folders they behave as tabs (one open at a time);
 * with one folder it opens and closes.
 */
export function Folders({ items, initial = null, label }: { items: FolderItem[]; initial?: string | null; label: string }) {
  const [open, setOpen] = useState<string | null>(initial);
  const panel = useRef<HTMLDivElement>(null);
  const tabs = items.length > 1;
  const current = items.find((f) => f.id === open);

  const toggle = (id: string) => {
    const next = tabs ? id : open === id ? null : id;
    setOpen(next);
    if (next && window.innerWidth < 760) {
      requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  };

  return (
    <div className="folders-wrap" data-single={!tabs || undefined}>
      <div className="folders" role={tabs ? "tablist" : undefined} aria-label={label}>
        {items.map((f, i) => (
          <button
            key={f.id}
            type="button"
            id={`folder-${f.id}`}
            role={tabs ? "tab" : undefined}
            aria-selected={tabs ? open === f.id : undefined}
            aria-expanded={tabs ? undefined : open === f.id}
            aria-controls={`panel-${items[0].id}`}
            className="folder"
            data-open={open === f.id || undefined}
            style={{ ["--n" as string]: i }}
            onClick={() => toggle(f.id)}
          >
            <span className="folder-back" />
            {f.peek.slice(0, 2).map((src, k) => (
              <span key={src + k} className="folder-paper" style={{ ["--k" as string]: k, backgroundImage: `url("${src}")` }} />
            ))}
            <span className="folder-front">
              <span className="folder-label">{f.label}</span>
              <span className="folder-sub">{f.sub}</span>
            </span>
          </button>
        ))}
      </div>
      <div
        className="folder-panel"
        id={`panel-${items[0].id}`}
        role={tabs ? "tabpanel" : "region"}
        aria-labelledby={current ? `folder-${current.id}` : undefined}
        ref={panel}
        hidden={!current}
        key={open ?? "closed"}
      >
        {current?.content}
      </div>
    </div>
  );
}

/* ---------------- Polaroids ---------------- */
/** Clamp into [min, max]. When the photo is wider than the grid, centre it instead of letting it jump. */
const clamp = (v: number, min: number, max: number) => (max < min ? (min + max) / 2 : Math.min(max, Math.max(min, v)));

/** Phones, tablets and touch screens: the places the drag needs a fence. */
const touchDevice = () => window.matchMedia("(pointer: coarse)").matches;
/** Only a finger gets fenced in. A mouse drag on any screen size stays free, like it was before. */
const staysInFolder = (pointerType: string) => pointerType === "touch";

function place(el: HTMLLIElement, x: number, y: number) {
  el.dataset.x = String(x);
  el.dataset.y = String(y);
  el.style.setProperty("--x", `${x}px`);
  el.style.setProperty("--y", `${y}px`);
}

export function Polaroids({ items }: { items: Moment[] }) {
  const top = useRef(10);
  const list = useRef<HTMLUListElement>(null);

  // Keep touch photos inside the grid after a resize or an orientation change.
  useEffect(() => {
    const fit = () => {
      if (!touchDevice()) return;
      for (const el of Array.from(list.current?.children ?? []) as HTMLLIElement[]) {
        const grid = list.current?.getBoundingClientRect();
        if (!grid) return;
        const x = Number(el.dataset.x ?? 0);
        const y = Number(el.dataset.y ?? 0);
        const r = el.getBoundingClientRect();
        const baseLeft = r.left - x;
        const baseTop = r.top - y;
        place(
          el,
          clamp(x, grid.left - baseLeft, grid.right - baseLeft - r.width),
          clamp(y, grid.top - baseTop, grid.bottom - baseTop - r.height),
        );
      }
    };
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const onDown = (e: React.PointerEvent<HTMLLIElement>) => {
    const el = e.currentTarget;
    const bounded = staysInFolder(e.pointerType);
    const grid = bounded ? el.parentElement?.getBoundingClientRect() : undefined;
    // Measured before the drag starts, so the 1.06 scale-up doesn't shift the limits.
    const rect = el.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = Number(el.dataset.x ?? 0);
    const oy = Number(el.dataset.y ?? 0);
    const baseLeft = rect.left - ox;
    const baseTop = rect.top - oy;
    const minX = grid ? grid.left - baseLeft : -Infinity;
    const maxX = grid ? grid.right - baseLeft - rect.width : Infinity;
    const minY = grid ? grid.top - baseTop : -Infinity;
    const maxY = grid ? grid.bottom - baseTop - rect.height : Infinity;
    el.setPointerCapture(e.pointerId);
    el.style.zIndex = String(++top.current);
    el.dataset.drag = "";
    const move = (ev: PointerEvent) => {
      place(el, clamp(ox + ev.clientX - sx, minX, maxX), clamp(oy + ev.clientY - sy, minY, maxY));
    };
    const up = () => {
      delete el.dataset.drag;
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  return (
    <>
      <p className="hint">Drag the photos around.</p>
      <ul className="polaroids" ref={list}>
        {items.map((m, i) => (
          <li key={m.id} onPointerDown={onDown} style={{ ["--r" as string]: `${((i * 37) % 11) - 5}deg`, ["--i" as string]: i }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.image} alt={m.caption} width={m.w} height={m.h} loading="lazy" draggable={false} />
            <p>{m.caption}</p>
            <small>{m.place}</small>
          </li>
        ))}
      </ul>
    </>
  );
}
