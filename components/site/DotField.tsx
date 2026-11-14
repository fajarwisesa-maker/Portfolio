"use client";

import { useEffect, useRef } from "react";

/**
 * One cloud of dots that lives behind the whole page.
 * In the hero the ink dots start as noise and settle into a stippled portrait while scrolling
 * (darker parts and facial edges get more dots, like a pen-and-ink drawing).
 * After the hero they re-form into a new shape for every chapter: "same data, new shape".
 *
 * Markup contract:
 *   - every chapter is an element with [data-chapter]
 *   - inside it, one element with [data-shape="portrait|mic|chart|folder|cup|envelope"]
 *     marks the box the dots should fill while that chapter is in the middle of the screen
 *   - the hero section also has [data-hero]; optional [data-hud-stage] / [data-hud-pct] get live text
 * Dot colour is the CSS `color` of the canvas.
 */

/** Per-dot target: position inside the box (0..1) and radius as a fraction of the box side (0 = hidden). */
type Target = { x: Float32Array; y: Float32Array; s: Float32Array; a: Uint8Array; minPx: number };
const ALPHAS = [0.3, 0.62, 0.8, 0.97]; // darkness levels, picked per dot by Target.a
type Mode = "fill" | "stroke";
const NOISE_R = 0.9; // px, radius of a dot while it is still "raw data"
const LOOSE = 0.72; // dots with seed above this float free outside the hero

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------- shapes, drawn in a 200×200 box ---------- */
const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
};
const SHAPES: Record<string, (c: CanvasRenderingContext2D, m: Mode) => void> = {
  mic(c, m) {
    rr(c, 72, 16, 56, 98, 28);
    if (m === "fill") return c.fill();
    c.stroke();
    c.beginPath();
    c.arc(100, 90, 46, 0.05, Math.PI - 0.05);
    c.moveTo(100, 136);
    c.lineTo(100, 168);
    c.moveTo(64, 172);
    c.lineTo(136, 172);
    c.stroke();
    c.lineWidth = 5;
    c.beginPath();
    for (const y of [44, 62, 80]) {
      c.moveTo(86, y);
      c.lineTo(114, y);
    }
    c.stroke();
  },
  chart(c, m) {
    const bars = [
      [44, 124, 26, 48],
      [80, 96, 26, 76],
      [116, 64, 26, 108],
      [152, 36, 26, 136],
    ];
    if (m === "fill") {
      for (const [x, y, w, h] of bars) {
        rr(c, x, y, w, h, 4);
        c.fill();
      }
      return;
    }
    c.beginPath();
    c.moveTo(26, 20);
    c.lineTo(26, 176);
    c.lineTo(186, 176);
    c.stroke();
    for (const [x, y, w, h] of bars) {
      rr(c, x, y, w, h, 4);
      c.stroke();
    }
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(57, 106);
    c.lineTo(93, 80);
    c.lineTo(129, 48);
    c.lineTo(165, 20);
    c.stroke();
  },
  folder(c, m) {
    c.beginPath();
    c.moveTo(22, 46);
    c.lineTo(80, 46);
    c.lineTo(96, 64);
    c.lineTo(178, 64);
    c.lineTo(178, 166);
    c.lineTo(22, 166);
    c.closePath();
    if (m === "fill") return c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(22, 92);
    c.lineTo(178, 92);
    c.stroke();
  },
  cup(c, m) {
    c.beginPath();
    c.moveTo(40, 80);
    c.lineTo(140, 80);
    c.lineTo(132, 150);
    c.quadraticCurveTo(130, 166, 114, 166);
    c.lineTo(66, 166);
    c.quadraticCurveTo(50, 166, 48, 150);
    c.closePath();
    if (m === "fill") return c.fill();
    c.stroke();
    c.beginPath();
    c.arc(146, 112, 20, -Math.PI / 2, Math.PI / 2);
    c.stroke();
    c.beginPath();
    c.ellipse(90, 178, 72, 8, 0, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = 7;
    c.beginPath();
    for (const x of [66, 90, 114]) {
      c.moveTo(x, 66);
      c.bezierCurveTo(x - 12, 52, x + 12, 42, x, 22);
    }
    c.stroke();
  },
  hello(c, m) {
    if (m === "fill") return; // outline and letters only, a filled bubble reads as a blob
    rr(c, 18, 24, 164, 112, 30);
    c.stroke();
    c.beginPath();
    c.moveTo(60, 136);
    c.lineTo(46, 178);
    c.lineTo(100, 136);
    c.stroke();
    c.font = "800 74px system-ui, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("Hi", 100, 84);
  },
  envelope(c, m) {
    rr(c, 20, 48, 160, 108, 8);
    if (m === "fill") return c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(22, 52);
    c.lineTo(100, 112);
    c.lineTo(178, 52);
    c.moveTo(24, 152);
    c.lineTo(80, 100);
    c.moveTo(176, 152);
    c.lineTo(120, 100);
    c.stroke();
  },
};

/** Icon shapes: outline drawn with bold dots, the inside filled with sparse fine dots. */
function shapeTarget(name: string, N: number): Target {
  const S = 160;
  const layer = (mode: Mode) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = S;
    const c = cv.getContext("2d", { willReadFrequently: true })!;
    c.scale(S / 200, S / 200);
    c.lineCap = "round";
    c.lineJoin = "round";
    c.lineWidth = 10;
    SHAPES[name](c, mode);
    return c.getImageData(0, 0, S, S).data;
  };
  const fill = layer("fill");
  const line = layer("stroke");
  const cx: number[] = [];
  const cy: number[] = [];
  const cs: number[] = [];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const k = (y * S + x) * 4 + 3;
      const onLine = line[k] > 100;
      if (!onLine && !(fill[k] > 100 && Math.random() < 0.14)) continue;
      cx.push(x);
      cy.push(y);
      cs.push(onLine ? 0.0052 : 0.0028);
    }
  }
  const t: Target = { x: new Float32Array(N), y: new Float32Array(N), s: new Float32Array(N), a: new Uint8Array(N), minPx: 0.55 };
  const show = Math.min(1, 3400 / N);
  for (let i = 0; i < N; i++) {
    const k = Math.floor(Math.random() * cx.length);
    t.x[i] = (cx[k] + Math.random()) / S;
    t.y[i] = (cy[k] + Math.random()) / S;
    t.s[i] = Math.random() < show ? cs[k] : 0; // small icons need far fewer dots than the portrait
    t.a[i] = cs[k] > 0.004 ? 3 : 1;
  }
  return t;
}

/**
 * Ink-stipple portrait, the same recipe as the A1 Ink & Paper preview (scripts/stipple.mjs):
 * head, torso and crossed arms; darker parts of the photo get more, bigger and darker dots.
 * The sampling grid is a bit finer than the preview, so there are slightly more dots.
 * A few grey stray dots drift around the figure.
 */
function portraitTarget(img: HTMLImageElement, N: number, S: number): Target {
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const c = cv.getContext("2d", { willReadFrequently: true })!;
  const crop = img.width * 0.76;
  c.fillStyle = "#fff";
  c.fillRect(0, 0, S, S);
  c.drawImage(img, img.width * 0.12, img.height * 0.17, crop, crop, 0, 0, S, S);
  const d = c.getImageData(0, 0, S, S).data;

  const pts: { x: number; y: number; s: number; a: number }[] = [];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const k = (y * S + x) * 4;
      const lum = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
      const chroma = Math.max(d[k], d[k + 1], d[k + 2]) - Math.min(d[k], d[k + 1], d[k + 2]);
      if (lum > 190 && chroma < 26) continue; // plain wall behind him
      const t = lum / 235;
      if (Math.random() > 0.2 + (1 - t) * 0.75) continue;
      const op = 0.55 + (1 - t) * 0.45;
      pts.push({
        x: (x + Math.random()) / S,
        y: (y + Math.random()) / S,
        s: (1.3 + (1 - t) * 1.5) / 1100, // radius as a share of the portrait box, as in the preview
        a: op < 0.66 ? 1 : op < 0.85 ? 2 : 3,
      });
    }
  }
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  const strays = Math.min(260, Math.floor(N * 0.02));
  if (pts.length > N - strays) pts.length = N - strays;

  const t: Target = { x: new Float32Array(N), y: new Float32Array(N), s: new Float32Array(N), a: new Uint8Array(N), minPx: 0.45 };
  for (let i = 0; i < N; i++) {
    const p = pts[i];
    if (p) {
      t.x[i] = p.x;
      t.y[i] = p.y;
      t.s[i] = p.s;
      t.a[i] = p.a;
    } else if (i < pts.length + strays) {
      t.x[i] = -0.27 + Math.random() * 1.32; // grey stray dots drifting around the figure
      t.y[i] = -0.05 + Math.random() * 1.08;
      t.s[i] = (1 + Math.random() * 1.2) / 590;
      t.a[i] = 0;
    } else {
      t.x[i] = Math.random();
      t.y[i] = Math.random();
      t.s[i] = 0; // spare dots hide once the picture has formed
    }
  }
  return t;
}

export default function DotField({ portrait }: { portrait: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 760;
    const S = small ? 170 : 212; // sampling grid across the portrait (the A1 preview used 190)
    const N = small ? 6000 : 9000;

    // particle state
    const nx = new Float32Array(N);
    const ny = new Float32Array(N);
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const seed = new Float32Array(N);
    const speed = new Float32Array(N);
    const rad = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      nx[i] = Math.random();
      ny[i] = Math.random();
      seed[i] = Math.random();
      speed[i] = reduce ? 1 : 0.05 + Math.random() * 0.09;
    }
    const noise: Target = { x: nx, y: ny, s: new Float32Array(N), a: new Uint8Array(N), minPx: 0 };
    const targets: Record<string, Target> = {};
    // Chapter shapes are built one per tick after first paint, so the first load is not blocked.
    const shapeTimers = Object.keys(SHAPES).map((name, i) =>
      window.setTimeout(() => {
        targets[name] = shapeTarget(name, N);
      }, 1200 + i * 250),
    );
    const img = new Image();
    img.decoding = "async";
    img.src = portrait;
    img.onload = () => {
      targets.portrait = portraitTarget(img, N, S);
    };

    // colour
    const m = getComputedStyle(canvas).color.match(/\d+(\.\d+)?/g) ?? ["17", "17", "17"];
    const rgb = `${m[0]},${m[1]},${m[2]}`;

    // size
    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // which chapter is in the middle of the screen
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    let active: HTMLElement | null = hero?.querySelector<HTMLElement>("[data-shape]") ?? null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const slot = e.target.querySelector<HTMLElement>("[data-shape]");
          if (slot) active = slot;
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    document.querySelectorAll("[data-chapter]").forEach((el) => io.observe(el));

    const mouse = { x: 0, y: 0 };
    let hasPointer = false;
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      hasPointer = true;
    };
    const onLeave = () => {
      hasPointer = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const stageEl = document.querySelector<HTMLElement>("[data-hud-stage]");
    const pctEl = document.querySelector<HTMLElement>("[data-hud-pct]");
    let lastStage = "";
    let lastPct = -1;
    let introAt = 0;
    let placed = false;
    const t0 = performance.now();
    const TAU = Math.PI * 2;
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000;
      if (!introAt && document.documentElement.classList.contains("intro-done")) introAt = now;

      // target box
      const el = active;
      const shape = el?.dataset.shape ?? "portrait";
      const T = targets[shape] ?? noise;
      let bx = W * 0.6;
      let by = H * 0.2;
      let side = Math.min(W, H) * 0.5;
      if (el) {
        const r = el.getBoundingClientRect();
        side = Math.min(r.width, r.height);
        bx = r.left + (r.width - side) / 2;
        by = r.top + (r.height - side) / 2;
      }

      // in the hero, scrolling turns noise into the portrait
      let form = 1;
      const inHero = !!hero && !!el && hero.contains(el);
      if (inHero && !reduce) {
        const r = hero!.getBoundingClientRect();
        // Desktop: the hero is pinned and scrolling forms the portrait.
        // Phones: the hero is a normal section, so the portrait forms by itself over a few seconds.
        const span = r.height - H;
        const pinned = span > 40;
        const p = pinned ? Math.min(1, Math.max(0, -r.top / span)) : 1;
        const auto = introAt ? smooth(0.3, pinned ? 2.4 : 3.2, (now - introAt) / 1000) * (pinned ? 0.3 : 1) : 0;
        form = T === noise ? 0 : pinned ? Math.max(auto, 0.7 * smooth(0.02, 0.6, p) + (introAt ? 0.3 : 0)) : auto;
      }
      if (inHero) {
        const stage = form < 0.34 ? "raw data" : form < 0.97 ? "finding the pattern" : "pattern found";
        if (stage !== lastStage && stageEl) stageEl.textContent = lastStage = stage;
        const pct = Math.round(form * 100);
        if (pct !== lastPct && pctEl) pctEl.textContent = `${(lastPct = pct)}%`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const drift = reduce ? 0 : 1;
      const wobble = 0.5 * drift;

      // move every dot
      for (let i = 0; i < N; i++) {
        const s = seed[i];
        const loose = !inHero && s > LOOSE; // outside the hero some dots let go and float as faint "raw data"
        const f = loose ? 0 : form >= 1 ? 1 : smooth(0, 1, form * 1.7 - s * 0.7);
        const ox = nx[i] * W + Math.sin(t * 0.35 + s * 40) * 14 * drift;
        const oy = ny[i] * H + Math.cos(t * 0.28 + s * 55) * 14 * drift;
        let x = ox + (bx + T.x[i] * side - ox) * f + Math.sin(t * 1.3 + s * 90) * wobble * (1 - f * 0.7);
        let y = oy + (by + T.y[i] * side - oy) * f + Math.cos(t * 1.1 + s * 70) * wobble * (1 - f * 0.7);
        if (hasPointer) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 10000) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / 100) * 30;
            x += (dx / d) * push;
            y += (dy / d) * push;
          }
        }
        if (!placed) {
          px[i] = x;
          py[i] = y;
        } else {
          px[i] += (x - px[i]) * speed[i];
          py[i] += (y - py[i]) * speed[i];
        }
        rad[i] = loose ? 0 : NOISE_R + ((T.s[i] > 0 ? Math.max(T.s[i] * side, T.minPx) : 0) - NOISE_R) * f;
      }
      placed = true;

      // draw, one pass per brightness level
      for (let b = 0; b < ALPHAS.length; b++) {
        ctx.fillStyle = `rgba(${rgb},${(0.28 + (ALPHAS[b] - 0.28) * form).toFixed(2)})`; // raw-data noise stays light behind the text
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const r = rad[i];
          if (T.a[i] !== b || r < 0.3) continue;
          const X = px[i];
          const Y = py[i];
          if (X < -6 || Y < -6 || X > W + 6 || Y > H + 6) continue;
          if (r < 1.1) {
            ctx.rect(X - r, Y - r, r * 2, r * 2);
          } else {
            ctx.moveTo(X + r, Y);
            ctx.arc(X, Y, r, 0, TAU);
          }
        }
        ctx.fill();
      }

      // loose dots
      if (!inHero) {
        ctx.fillStyle = `rgba(${rgb},0.2)`;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          if (seed[i] > LOOSE) ctx.rect(px[i], py[i], 1.5, 1.5);
        }
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      shapeTimers.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [portrait]);

  return <canvas ref={ref} className="dots" aria-hidden />;
}
