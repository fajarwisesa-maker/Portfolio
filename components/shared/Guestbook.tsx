"use client";

import { useEffect, useRef, useState } from "react";
import { useGuestbook } from "@/lib/realtime/hooks";
import { LIMITS, REACTIONS } from "@/lib/realtime/types";
import { timeAgo } from "@/lib/image";

type Props = {
  /** Visual skin. Styles live in shared.css under [data-variant]. */
  variant: "log" | "sticky" | "postcard" | "card";
  submitLabel?: string;
  placeholder?: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => [...p][0] ?? "")
    .join("")
    .toUpperCase();

export default function Guestbook({ variant, submitLabel = "Post comment", placeholder = "Say hi, ask something, or leave feedback" }: Props) {
  const { comments, loading, error, cooldown, post, react, reacted, freshId } = useGuestbook();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const ok = await post(name, message, file);
    setSending(false);
    if (ok) {
      setMessage("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="gb" data-variant={variant}>
      <form className="gb-form" onSubmit={onSubmit} noValidate>
        <div className="gb-row">
          <button
            type="button"
            className="gb-avatar-pick"
            onClick={() => fileRef.current?.click()}
            aria-label={preview ? "Change profile photo" : "Add a profile photo (optional)"}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3.2" />
              </svg>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <label className="gb-field gb-name">
            <span className="gb-label">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={LIMITS.name}
              placeholder="Your name"
              autoComplete="nickname"
            />
          </label>
        </div>
        <label className="gb-field">
          <span className="gb-label">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={LIMITS.message}
            rows={3}
            placeholder={placeholder}
          />
        </label>
        <div className="gb-actions">
          <span className="gb-count" aria-hidden>
            {message.length}/{LIMITS.message}
          </span>
          <button className="gb-submit" type="submit" disabled={sending || cooldown > 0}>
            {sending ? "Sending…" : cooldown > 0 ? `Wait ${cooldown}s` : submitLabel}
          </button>
        </div>
        <p className="gb-error" role="alert" aria-live="polite">
          {error}
        </p>
      </form>

      <div className="gb-head">
        <span className="gb-live" aria-hidden />
        <span>
          {loading ? "Loading comments" : `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`} · live
        </span>
      </div>

      <ul className="gb-list" aria-live="polite">
        {!loading && comments.length === 0 && <li className="gb-empty">No comments yet. Be the first.</li>}
        {comments.map((c, i) => (
          <li key={c.id} className="gb-item" data-fresh={c.id === freshId || undefined} style={{ ["--i" as string]: i % 7 }}>
            <div className={`gb-avatar${c.owner ? " gb-avatar-owner" : ""}`} aria-hidden>
              {c.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar} alt="" loading="lazy" />
              ) : (
                <span>{initials(c.name) || "?"}</span>
              )}
            </div>
            <div className="gb-body">
              <div className="gb-meta">
                <strong className="gb-author">{c.name}</strong>
                {c.owner && <span className="gb-badge">owner</span>}
                <time dateTime={new Date(c.createdAt).toISOString()}>{timeAgo(c.createdAt, now)}</time>
              </div>
              <p className="gb-text">{c.message}</p>
              <div className="gb-reactions">
                {REACTIONS.map((emoji) => {
                  const n = c.reactions[emoji] ?? 0;
                  const mine = reacted.has(`${c.id}:${emoji}`);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      className="gb-react"
                      data-on={mine || undefined}
                      data-has={n > 0 || undefined}
                      onClick={() => react(c.id, emoji)}
                      aria-label={`React ${emoji}${n ? `, ${n} so far` : ""}`}
                      aria-pressed={mine}
                    >
                      <span>{emoji}</span>
                      {n > 0 && <b>{n}</b>}
                    </button>
                  );
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
