import { NextResponse } from "next/server";
import { profile } from "@/lib/content";

export const runtime = "nodejs";

const TOPICS = ["Collaboration", "Job or internship", "Just saying hi"] as const;
const LIMIT = { name: 80, email: 120, message: 2000 };

// Best-effort rate limit (per server instance): 5 messages per IP per 10 minutes.
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Hidden field that only bots fill in: pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const name = oneLine(String(body.name ?? "")).slice(0, LIMIT.name);
  const email = oneLine(String(body.email ?? "")).slice(0, LIMIT.email);
  const message = String(body.message ?? "").trim().slice(0, LIMIT.message);
  const topic = (TOPICS as readonly string[]).includes(String(body.topic)) ? String(body.topic) : TOPICS[0];

  if (!name) return NextResponse.json({ ok: false, error: "Please add your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ ok: false, error: "Write a few words so I know how to help." }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (tooMany(ip)) return NextResponse.json({ ok: false, error: "Too many messages. Please try again later." }, { status: 429 });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Sending is not set up yet: the page falls back to the visitor's own email app.
    return NextResponse.json({ ok: false, mode: "mailto" }, { status: 501 });
  }

  const to = process.env.CONTACT_TO || profile.email;
  const from = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `[Portfolio] ${topic} from ${name}`,
      text: `${topic}\n\nFrom: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>${esc(topic)}</strong></p><p>From: ${esc(name)} &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ ok: false, error: "Could not send right now." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
