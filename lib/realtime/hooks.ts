"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRealtime, LIMITS, type GuestComment, type Reaction } from "./index";
import { toAvatarBlob } from "../image";

const K_LAST_COMMENT = "porto.lastComment";
const K_REACTED = "porto.reacted";

// Tiny word filter. Real moderation happens in the Supabase dashboard (hidden flag).
const BLOCKED = /\b(fuck|shit|bitch|asshole|anjing|bangsat|kontol|memek|ngentot|babi)\b/gi;
const clean = (s: string) => s.replace(BLOCKED, (w) => w[0] + "*".repeat(w.length - 1));

const readSet = (key: string): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
};

export function useGuestbook() {
  const [comments, setComments] = useState<GuestComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0); // seconds left before the next comment
  const [reacted, setReacted] = useState<Set<string>>(new Set());
  const [freshId, setFreshId] = useState<string | null>(null);

  useEffect(() => {
    const rt = getRealtime();
    let alive = true;
    setReacted(readSet(K_REACTED));
    rt.listComments()
      .then((list) => alive && setComments(list))
      .catch(() => alive && setError("Could not load comments. Try again in a moment."))
      .finally(() => alive && setLoading(false));

    const off = rt.subscribe((e) => {
      if (e.type === "comment") {
        setComments((prev) => (prev.some((c) => c.id === e.comment.id) ? prev : [e.comment, ...prev]));
        setFreshId(e.comment.id);
      } else if (e.type === "reaction") {
        setComments((prev) =>
          prev.map((c) => (c.id === e.commentId ? { ...c, reactions: { ...c.reactions, [e.emoji]: e.count } } : c)),
        );
      }
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  // Cooldown ticker
  useEffect(() => {
    const tick = () => {
      const last = Number(localStorage.getItem(K_LAST_COMMENT) ?? 0);
      setCooldown(Math.max(0, Math.ceil((last + LIMITS.commentCooldownMs - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const post = useCallback(async (rawName: string, rawMessage: string, file: File | null): Promise<boolean> => {
    setError(null);
    const name = clean(rawName.trim()).slice(0, LIMITS.name);
    const message = clean(rawMessage.trim()).slice(0, LIMITS.message);
    if (!name) return setError("Add your name so I know who to thank."), false;
    if (!message) return setError("Write a message first."), false;
    const last = Number(localStorage.getItem(K_LAST_COMMENT) ?? 0);
    if (Date.now() - last < LIMITS.commentCooldownMs) return setError("Easy there. You can post again in a few seconds."), false;
    try {
      const avatar = file ? await toAvatarBlob(file) : null;
      const comment = await getRealtime().postComment({ name, message, avatar });
      setComments((prev) => (prev.some((c) => c.id === comment.id) ? prev : [comment, ...prev]));
      setFreshId(comment.id);
      localStorage.setItem(K_LAST_COMMENT, String(Date.now()));
      setCooldown(Math.ceil(LIMITS.commentCooldownMs / 1000));
      return true;
    } catch (err) {
      setError(err instanceof Error && err.message.includes("mage") ? err.message : "Could not send your comment. Please try again.");
      return false;
    }
  }, []);

  const react = useCallback((commentId: string, emoji: Reaction) => {
    const key = `${commentId}:${emoji}`;
    const seen = readSet(K_REACTED); // one reaction per emoji per comment per visitor
    const wasOn = seen.has(key); // clicking again takes the reaction back
    if (wasOn) seen.delete(key);
    else seen.add(key);
    try {
      localStorage.setItem(K_REACTED, JSON.stringify([...seen]));
    } catch {}
    setReacted(seen);
    getRealtime()
      .react(commentId, emoji, wasOn ? -1 : 1)
      .catch(() => {});
  }, []);

  return { comments, loading, error, cooldown, post, react, reacted, freshId };
}

export function useCoffee() {
  const [count, setCount] = useState<number | null>(null);
  // Kept in memory only, so a page refresh allows one more cup.
  const [poured, setPoured] = useState(false);
  const pouredRef = useRef(false);

  useEffect(() => {
    const rt = getRealtime();
    let alive = true;
    rt.getCoffee()
      .then((n) => alive && setCount(n))
      .catch(() => alive && setCount(0));
    const off = rt.subscribe((e) => {
      if (e.type === "coffee") setCount((prev) => Math.max(prev ?? 0, e.count));
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  /** Returns true when the click was counted. */
  const brew = useCallback((): boolean => {
    if (pouredRef.current) return false; // one cup per visit
    pouredRef.current = true;
    setPoured(true);
    setCount((prev) => (prev ?? 0) + 1); // optimistic
    getRealtime()
      .brewCoffee()
      .then((n) => setCount((prev) => Math.max(prev ?? 0, n)))
      .catch(() => {
        pouredRef.current = false;
        setPoured(false);
        setCount((prev) => Math.max(0, (prev ?? 1) - 1));
      });
    return true;
  }, []);

  return { count, brew, poured };
}
