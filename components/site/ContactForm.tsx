"use client";

import { useId, useState } from "react";

const TOPICS = ["Collaboration", "Job or internship", "Just saying hi"] as const;
type Status = "idle" | "sending" | "sent" | "fallback" | "error";

/**
 * Contact form. Posts to /api/contact (real email through Resend once RESEND_API_KEY is set).
 * Until then, or if sending fails, it opens the visitor's own email app with the message filled in.
 */
export default function ContactForm({ email }: { email: string }) {
  const uid = useId();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0]);
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const openMailApp = () => {
    const subject = `${topic}: ${name}`;
    const body = `${message}\n\nFrom: ${name} <${from}>`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.trim())) return setError("That email address doesn't look right.");
    if (message.trim().length < 10) return setError("Write a few words so I know how to help.");

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: from, topic, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("sent");
        setMessage("");
        return;
      }
      if (res.status === 501 || res.status >= 500) {
        setStatus("fallback");
        openMailApp();
        return;
      }
      setStatus("error");
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("fallback");
      openMailApp();
    }
  };

  const sent = status === "sent";

  return (
    <form className="cform" onSubmit={submit} noValidate data-status={status}>
      <fieldset className="cform-topics">
        <legend>What would you like to talk about?</legend>
        {TOPICS.map((t) => (
          <label key={t} data-on={topic === t || undefined}>
            <input type="radio" name={`${uid}-topic`} value={t} checked={topic === t} onChange={() => setTopic(t)} />
            <span>{t}</span>
          </label>
        ))}
      </fieldset>

      <div className="cform-row">
        <label className="cform-field">
          <span>Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" placeholder="Elon Musk" />
        </label>
        <label className="cform-field">
          <span>Your email</span>
          <input type="email" value={from} onChange={(e) => setFrom(e.target.value)} maxLength={120} autoComplete="email" placeholder="spacex@company.com" />
        </label>
      </div>

      <label className="cform-field">
        <span>Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="Tell me about the project, the role, or the idea."
        />
      </label>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <input className="cform-hp" tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />

      <div className="cform-foot">
        <button className="send-btn" type="submit" disabled={status === "sending"} data-sent={sent || undefined} data-sending={status === "sending" || undefined}>
          <span className="send-label" aria-hidden>
            <span className="l-a">{sent ? "Sent! Talk soon" : status === "sending" ? "Sending…" : "Send message"}</span>
            <span className="l-b">{sent ? "Sent! Talk soon" : "Let's win together"}</span>
          </span>
          <span className="sr-only">{sent ? "Message sent" : "Send message"}</span>
          <span className="send-icon" aria-hidden>
            {sent ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : (
              <>
                <svg className="plane-trail" viewBox="0 0 42 42" width="42" height="42">
                  <path d="M3 37 C 13 33, 21 25, 33 9" pathLength="1" />
                </svg>
                <svg className="plane" viewBox="0 0 24 24" width="24" height="24">
                  <path className="p-wing" d="M2.2 10.4 21.8 2.2 14.6 21.8 11.2 13.6z" />
                  <path className="p-keel" d="M11.2 13.6 10.4 19.6 14 16.2z" />
                  <path className="p-fold" d="M11.2 13.6 21.8 2.2" />
                </svg>
              </>
            )}
          </span>
        </button>
        <p className="cform-note" role="status" aria-live="polite">
          {error && <span className="cform-err">{error}</span>}
          {sent && "Thanks! Your message is on its way to my inbox. I'll reply soon."}
          {status === "fallback" && "Your email app should open with the message filled in. Just press send there."}
          {status === "idle" && !error && "Goes straight to my inbox. No account needed."}
        </p>
      </div>
    </form>
  );
}
