"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Smooth scrolling wired into GSAP ScrollTrigger. Off when the visitor prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ anchors: true, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}

/** Adds `.in` to every [data-rv] element when it scrolls into view. Styles in shared.css. */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-rv]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));

    // Safety net: when the page opens on a deep link (like /#contact) the observer can miss elements,
    // which would leave them invisible. Reveal anything that is on screen, or already scrolled past.
    let raf = 0;
    const sweep = () => {
      raf = 0;
      for (const el of els) {
        if (el.classList.contains("in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95) {
          el.classList.add("in");
          io.unobserve(el);
        }
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    const timers = [600, 1800, 3500].map((ms) => window.setTimeout(queue, ms));
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      timers.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

/** Scroll progress bar (0 → 1) written to --progress on <html>. */
export function ScrollProgress() {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
