"use client";

import { useEffect, useState } from "react";
import { greetings } from "@/lib/content";

/**
 * Full-screen "hello" in several languages, then the page is revealed.
 * Plays on every page load, including refreshes, and always starts the visit from the top
 * so the dot portrait forms again too. Always skippable.
 * Theme with --intro-bg / --intro-fg / --intro-accent on a parent.
 */
export default function IntroGreeting(_props: { id?: string }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"play" | "leave" | "gone">("play");
  const last = greetings.length - 1;

  // A refresh would normally restore the old scroll position; start from the top instead.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce && step < last) return setStep(last);
    const delay = step === 0 ? 650 : step === last ? 1000 : 210;
    const t = window.setTimeout(() => (step === last ? setPhase("leave") : setStep(step + 1)), delay);
    return () => window.clearTimeout(t);
  }, [step, phase, last]);

  useEffect(() => {
    if (phase === "play") {
      document.documentElement.classList.add("intro-lock");
      return () => document.documentElement.classList.remove("intro-lock");
    }
    if (phase === "leave") {
      document.documentElement.classList.add("intro-done");
      const t = window.setTimeout(() => setPhase("gone"), 900);
      return () => window.clearTimeout(t);
    }
    document.documentElement.classList.add("intro-done");
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className="intro" data-phase={phase} inert={phase === "leave"}>
      <p className="intro-word" key={step} data-final={step === last || undefined}>
        <span className="intro-dot" />
        {greetings[step]}
      </p>
      <button className="intro-skip" type="button" onClick={() => setPhase("leave")}>
        Skip
      </button>
    </div>
  );
}
