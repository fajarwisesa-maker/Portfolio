"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, profile } from "@/lib/content";

/** Top navigation shared by all versions. Unstyled: each version skins .nav-* classes. */
export default function Nav({
  items = nav,
  cta,
  children,
}: {
  items?: { id: string; label: string }[];
  /** Replaces the "Versions" link with a call-to-action button. */
  cta?: { label: string; href: string };
  /** Extra decoration inside the header (e.g. the cat). */
  children?: React.ReactNode;
}) {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="nav" data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <a className="nav-logo" href="#top" aria-label={`${profile.nick}, ${profile.name}: back to top`}>
        {profile.nick}
        <i aria-hidden />
      </a>
      <nav className="nav-links" aria-label="Sections">
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} data-active={active === i.id || undefined} onClick={() => setOpen(false)}>
            {i.label}
          </a>
        ))}
      </nav>
      {cta ? (
        <a className="nav-cta" href={cta.href}>
          {cta.label}
        </a>
      ) : (
        <Link className="nav-versions" href="/" title="Home">
          Versions
        </Link>
      )}
      {children}
      <button
        className="nav-burger"
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
