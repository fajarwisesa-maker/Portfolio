// Project covers: product-poster style (logo, tagline, big gradient wordmark, tilted device, stat card),
// each in the project's own brand colours.
// usage: node scripts/covers.mjs            -> PNG previews in design/covers-preview
//        node scripts/covers.mjs --publish  -> also writes public/media/project-*.webp for the site
// Needs design/src screenshots (see README) and the Lido_Flow project folder for its screens and logo.
import sharp from "sharp";
import fs from "node:fs";

const OUT = "design/covers-preview";
const PUBLISH = process.argv.includes("--publish");
const SITE_NAME = { stratum: "project-stratum", siaga: "project-siaga", phishing: "project-phishing", cascade: "project-cascade", "lido-flow": "project-lido-flow", "escape-room": "project-escape-room" };
fs.mkdirSync(OUT, { recursive: true });
const W = 1600;
const H = 1100;
const FONT = "Poppins, Inter, Arial, sans-serif";
const MONO = "Consolas, monospace";
const SLATE = "#3b4b5e";
const TEXT = "#1f2937";
const GREY = "#6b7280";
const LIDO = "C:/Users/Fajar Ilham Surya W/Lido_Flow";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const t = (x, y, str, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.f ?? FONT}" font-size="${o.s}" font-weight="${o.w ?? 400}" fill="${o.c ?? TEXT}"` +
  `${o.ls != null ? ` letter-spacing="${o.ls}"` : ""}${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.op != null ? ` fill-opacity="${o.op}"` : ""}>${esc(str)}</text>`;

async function uri(path, opts = {}) {
  let img = sharp(path);
  if (opts.extract) img = img.extract(opts.extract);
  if (opts.width) img = img.resize({ width: opts.width });
  return `data:image/png;base64,${(await img.png().toBuffer()).toString("base64")}`;
}

let uid = 0;
const id = (p) => `${p}${++uid}`;

/* ---------- building blocks ---------- */
function dotGrid(x, y, cols, rows, gap = 22, color = "#9aa3ad") {
  let s = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<circle cx="${x + c * gap}" cy="${y + r * gap}" r="3" fill="${color}" fill-opacity="0.55"/>`;
  return s;
}

function background(b) {
  return `<rect width="${W}" height="${H}" fill="#ffffff"/>
  <circle cx="1240" cy="560" r="560" fill="url(#halo)"/>
  <circle cx="120" cy="80" r="260" fill="url(#halo2)"/>
  <rect x="-140" y="975" width="330" height="330" rx="70" fill="url(#corner)"/>
  ${dotGrid(22, 250, 3, 8)}
  ${dotGrid(800, 640, 4, 7)}`;
}

function defs(b) {
  return `<defs>
  <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${b.g1}"/><stop offset="1" stop-color="${b.g2}"/></linearGradient>
  <linearGradient id="brandv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b.g1}"/><stop offset="1" stop-color="${b.g2}"/></linearGradient>
  <radialGradient id="halo"><stop offset="0" stop-color="${b.tint}" stop-opacity="1"/><stop offset="1" stop-color="${b.tint}" stop-opacity="0"/></radialGradient>
  <radialGradient id="halo2"><stop offset="0" stop-color="${b.tint}" stop-opacity="0.8"/><stop offset="1" stop-color="${b.tint}" stop-opacity="0"/></radialGradient>
  <linearGradient id="corner" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b.g2}" stop-opacity="0.45"/><stop offset="1" stop-color="${b.g2}" stop-opacity="0.05"/></linearGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="34" stdDeviation="34" flood-color="#0f172a" flood-opacity="0.28"/></filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.18"/></filter>
</defs>`;
}

/** Left column: logo row, tagline, giant gradient wordmark, description, tech chips. */
function column(p) {
  let s = "";
  s += p.mark;
  s += t(184, 146, p.name, { s: 42, w: 700, c: "url(#brand)", ls: -1 });
  p.tagline.forEach((ln, i) => (s += t(88, 310 + i * 84, ln, { s: 74, w: 800, c: SLATE, ls: -2.5 })));
  const ws = Math.min(168, 790 / (p.wordmark.length * 0.6));
  s += t(80, 610, p.wordmark, { s: ws, w: 800, c: "url(#brand)", ls: -ws / 30 });
  p.desc.forEach((ln, i) => (s += t(92, 712 + i * 46, ln, { s: 30, w: 500, c: TEXT })));
  let cx = 92;
  for (const c of p.chips) {
    const w = c.length * 12.6 + 46;
    s += `<rect x="${cx}" y="886" width="${w}" height="48" rx="24" fill="${p.g1}" fill-opacity="0.09"/>`;
    s += t(cx + w / 2, 918, c, { s: 21, w: 600, c: p.g1, anchor: "middle" });
    cx += w + 12;
  }
  return s;
}

/** Rounded logo tile with a gradient and a white glyph. */
const markTile = (glyph) =>
  `<g transform="translate(90 88)"><rect width="74" height="74" rx="20" fill="url(#brandv)"/>${glyph}</g>`;
const markImage = (href, round = false) =>
  `<g transform="translate(90 88)"><clipPath id="mk"><rect width="74" height="74" rx="${round ? 37 : 20}"/></clipPath><image href="${href}" width="74" height="74" clip-path="url(#mk)" preserveAspectRatio="xMidYMid slice"/></g>`;

/** Phone with an SVG screen. `screen(sw, sh)` returns markup in screen coordinates. */
function phone({ cx, cy, w, h, rot, screen, light = true }) {
  const b = 13;
  const sw = w - b * 2;
  const sh = h - b * 2;
  const clip = id("scr");
  return `<g filter="url(#shadow)" transform="translate(${cx} ${cy}) rotate(${rot}) translate(${-w / 2} ${-h / 2})">
    <rect width="${w}" height="${h}" rx="${w * 0.15}" fill="#0f1115"/>
    <rect x="-4" y="${h * 0.2}" width="5" height="60" rx="2" fill="#2a2d33"/><rect x="${w - 1}" y="${h * 0.24}" width="5" height="90" rx="2" fill="#2a2d33"/>
    <clipPath id="${clip}"><rect width="${sw}" height="${sh}" rx="${w * 0.125}"/></clipPath>
    <g transform="translate(${b} ${b})" clip-path="url(#${clip})">
      <rect width="${sw}" height="${sh}" fill="${light ? "#f6f7fb" : "#0f1115"}"/>${screen(sw, sh)}
    </g>
    <rect x="${w / 2 - 52}" y="${b + 12}" width="104" height="30" rx="15" fill="#0f1115"/>
  </g>`;
}

/** Browser window, optionally tilted, with an image or SVG content. */
function browser({ x, y, w, h, rot = 0, url, content, dark = true }) {
  const bar = 50;
  const clip = id("brw");
  return `<g filter="url(#shadow)" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
    <clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20"/></clipPath>
    <g clip-path="url(#${clip})">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${dark ? "#0f1115" : "#fff"}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${bar}" fill="${dark ? "#1c1f26" : "#f3f4f6"}"/>
      <circle cx="${x + 28}" cy="${y + 25}" r="7" fill="#ff5f57"/><circle cx="${x + 50}" cy="${y + 25}" r="7" fill="#febc2e"/><circle cx="${x + 72}" cy="${y + 25}" r="7" fill="#28c840"/>
      <rect x="${x + 104}" y="${y + 12}" width="${Math.min(440, w - 140)}" height="26" rx="13" fill="${dark ? "#2a2e37" : "#e5e7eb"}"/>
      ${t(x + 122, y + 31, url, { s: 16, c: dark ? "#9aa3b2" : GREY, f: MONO })}
      <g transform="translate(${x} ${y + bar})">${content(w, h - bar)}</g>
    </g>
  </g>`;
}

/** Floating white card with the key result. */
function stat({ x, y, w = 340, label, value, sub, vs = 58 }) {
  return `<g filter="url(#soft)"><rect x="${x}" y="${y}" width="${w}" height="${sub ? 168 : 138}" rx="26" fill="#ffffff"/></g>
    ${t(x + 28, y + 44, label, { s: 17, w: 700, c: GREY, ls: 1.5 })}
    ${t(x + 26, y + 44 + vs + 4, value, { s: vs, w: 800, c: "url(#brand)", ls: -1.5 })}
    ${sub ? t(x + 28, y + 150, sub, { s: 18, w: 500, c: GREY }) : ""}`;
}

async function render(name, brand, inner) {
  uid = 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs(brand)}${background(brand)}${inner}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${name}.png`);
  if (PUBLISH) await sharp(`${OUT}/${name}.png`).webp({ quality: 84 }).toFile(`public/media/${SITE_NAME[name]}.webp`);
  console.log("saved", name, PUBLISH ? "(published)" : "");
}

/* ======================= 1. Stratum ======================= */
{
  const b = { g1: "#4f46e5", g2: "#14b8a6", tint: "#e9ecff" };
  const shot = await uri("design/src/stratum-dashboard.png", { width: 1500 });
  const logo = await uri("design/src/stratum-logo.png");
  const dash = (w, h) => `<image href="${shot}" width="${w}" height="${h}" preserveAspectRatio="xMinYMin slice"/>`;
  await render(
    "stratum",
    b,
    column({
      ...b,
      mark: markImage(logo),
      name: "Stratum",
      tagline: ["Quality verdicts", "you can explain."],
      wordmark: "Stratum",
      desc: ["AI quality intelligence for TÜV NORD.", "XGBoost predicts, SHAP explains why,", "and every verdict is audit-ready."],
      chips: ["XGBoost", "SHAP", "FastAPI", "React"],
    }) +
      browser({ x: 900, y: 210, w: 900, h: 640, rot: -4, url: "stratum-wine.vercel.app", content: dash }) +
      stat({ x: 930, y: 780, label: "F1-SCORE · 5-FOLD CV", value: "0.872", sub: "XGBoost + SHAP explainability" }),
  );
}

/* ======================= 2. SIAGA ======================= */
{
  const b = { g1: "#1d4ed8", g2: "#7c3aed", tint: "#ece9ff" };
  const photo = await uri("public/media/moment-siaga-team.webp", { width: 480 });
  const glyph = `<path d="M37 14 L58 22 V38 C58 51 49 59 37 63 C25 59 16 51 16 38 V22 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M24 40 h7 l4 -9 l6 16 l4 -7 h6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const screen = (sw) => {
    let s = `<rect width="${sw}" height="96" fill="#ffffff"/>`;
    s += `<circle cx="40" cy="70" r="20" fill="url(#brandv)"/>${t(40, 77, "S", { s: 20, w: 800, c: "#fff", anchor: "middle" })}`;
    s += t(72, 66, "SIAGA Agent", { s: 19, w: 700 }) + `<circle cx="78" cy="84" r="5" fill="#22c55e"/>` + t(90, 89, "monitoring", { s: 14, c: GREY });
    // incoming informal signal
    s += t(22, 130, "Dispatcher · WhatsApp", { s: 13, w: 600, c: GREY });
    s += `<rect x="18" y="140" width="270" height="78" rx="18" fill="#e7f8dc"/>`;
    s += t(34, 172, "banjir di Brebes, jalur", { s: 17, w: 500 }) + t(34, 198, "SMG-JKT macet total", { s: 17, w: 500 });
    // agent reasoning card
    s += `<rect x="40" y="240" width="${sw - 58}" height="232" rx="20" fill="#eef1ff"/>`;
    s += t(60, 274, "Disruption detected", { s: 18, w: 700, c: "#1d4ed8" });
    ["Message → structured event", "POs & SKUs traced", "Customers at risk found", "Constraints checked"].forEach((ln, i) => {
      const y = 312 + i * 40;
      s += `<circle cx="70" cy="${y - 6}" r="11" fill="#22c55e"/><path d="M65 ${y - 6} l4 4 l7 -8" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += t(90, y, ln, { s: 16, w: 500 });
    });
    // proposed action
    s += `<rect x="40" y="492" width="${sw - 58}" height="168" rx="20" fill="#ffffff" stroke="#c7d2fe" stroke-width="2"/>`;
    s += t(60, 528, "PROPOSED ACTION", { s: 13, w: 700, c: "#7c3aed", ls: 1.5 });
    s += t(60, 558, "Reroute affected shipments", { s: 18, w: 700 });
    s += t(60, 584, "Waiting for your approval", { s: 15, c: GREY });
    s += `<rect x="60" y="604" width="130" height="40" rx="20" fill="url(#brand)"/>${t(125, 630, "Approve", { s: 16, w: 700, c: "#fff", anchor: "middle" })}`;
    s += `<rect x="202" y="604" width="90" height="40" rx="20" fill="#eef1ff"/>${t(247, 630, "Edit", { s: 16, w: 600, c: "#1d4ed8", anchor: "middle" })}`;
    return s;
  };
  const card = `<g filter="url(#soft)" transform="rotate(4 1440 330)"><rect x="1280" y="200" width="300" height="250" rx="10" fill="#fff"/>
    <clipPath id="ph"><rect x="1294" y="214" width="272" height="180" rx="6"/></clipPath>
    <image href="${photo}" x="1294" y="214" width="272" height="180" clip-path="url(#ph)" preserveAspectRatio="xMidYMid slice"/>
    ${t(1296, 424, "Final Demo Day · Oct 2026", { s: 17, w: 600, c: GREY })}</g>`;
  await render(
    "siaga",
    b,
    column({
      ...b,
      mark: markTile(glyph),
      name: "SIAGA",
      tagline: ["From messy signal", "to verified action."],
      wordmark: "SIAGA",
      desc: ["A supervised AI agent that turns messy", "supply-chain signals into verified actions.", "Built with SAP AI Core, AWS and Claude."],
      chips: ["Agentic AI", "Claude", "SAP AI Core", "AWS"],
    }) +
      phone({ cx: 1150, cy: 560, w: 360, h: 760, rot: -6, screen }) +
      card +
      stat({ x: 1270, y: 760, w: 300, label: "AGENTIC AI HACKATHON", value: "Finalist", vs: 50, sub: "Intelligent Supply Chain" }),
  );
}

/* ======================= 3. Phishing SMS ======================= */
{
  const b = { g1: "#e11d48", g2: "#f97316", tint: "#ffe9ec" };
  const glyph = `<path d="M37 14 L58 22 V38 C58 51 49 59 37 63 C25 59 16 51 16 38 V22 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M37 27 v15" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="37" cy="51" r="3.2" fill="#fff"/>`;
  const msgs = [
    { lines: ["Selamat! Anda menang undian", "Rp 50 jt. Klaim: bit.ly/hd-klaim"], tag: "PHISHING", c: "#e11d48" },
    { lines: ["Kode OTP jangan diberikan.", "Kirim kodenya ke CS kami ya"], tag: "PHISHING", c: "#e11d48" },
    { lines: ["PROMO 50% hari ini saja!", "Belanja sekarang di aplikasi"], tag: "PROMO · tricky", c: "#d97706" },
    { lines: ["Kak, nanti kumpul kelompok", "jam 7 di perpus ya"], tag: "NORMAL", c: "#16a34a" },
  ];
  const screen = (sw) => {
    let s = `<rect width="${sw}" height="100" fill="#ffffff"/>` + t(sw / 2, 80, "Messages", { s: 21, w: 700, anchor: "middle" });
    msgs.forEach((m, i) => {
      const y = 122 + i * 152;
      s += `<rect x="18" y="${y}" width="${sw - 36}" height="86" rx="18" fill="#ffffff" stroke="#e5e7eb"/>`;
      m.lines.forEach((ln, k) => (s += t(34, y + 36 + k * 26, ln, { s: 15.5, w: 500 })));
      const tw = m.tag.length * 10 + 30;
      s += `<rect x="18" y="${y + 96}" width="${tw}" height="32" rx="16" fill="${m.c}" fill-opacity="0.12"/>`;
      s += t(18 + tw / 2, y + 117, m.tag, { s: 14, w: 700, c: m.c, anchor: "middle", ls: 1 });
    });
    s += t(sw / 2, 735, "illustrative messages", { s: 13, c: GREY, anchor: "middle" });
    return s;
  };
  await render(
    "phishing",
    b,
    column({
      ...b,
      mark: markTile(glyph),
      name: "NLP Research",
      tagline: ["Catch the scam", "before it lands."],
      wordmark: "Phishing SMS",
      desc: ["Detecting Indonesian phishing SMS with", "TF-IDF, SVM and Naive Bayes, then testing", "it on promo messages that look like scams."],
      chips: ["Python", "TF-IDF", "SVM", "Naive Bayes"],
    }) +
      phone({ cx: 1180, cy: 570, w: 360, h: 770, rot: 6, screen }) +
      stat({ x: 1300, y: 150, w: 290, label: "ACCURACY · SVM-RBF", value: "98.90%", vs: 52, sub: "F1-score 0.9851" }) +
      stat({ x: 1290, y: 790, w: 290, label: "PROMOS FLAGGED", value: "49%", vs: 52, sub: "→ needs a 2nd test" }),
  );
}

/* ======================= 4. Cascade ======================= */
{
  const b = { g1: "#0b3b75", g2: "#0ea5e9", tint: "#e3f2ff" };
  const glyph = `<rect x="16" y="18" width="20" height="10" rx="5" fill="#fff"/><rect x="26" y="33" width="20" height="10" rx="5" fill="#fff" fill-opacity="0.85"/><rect x="38" y="48" width="20" height="10" rx="5" fill="#fff" fill-opacity="0.7"/>`;
  const app = (w) => {
    let s = `<rect width="${w}" height="900" fill="#0f1b2d"/><rect width="170" height="900" fill="#0b1524"/>`;
    s += t(26, 44, "CASCADE", { s: 18, w: 800, c: "#fff", ls: 2 }) + t(26, 66, "Knowledge Hub", { s: 13, c: "#7f93ad" });
    ["Ask", "Failure chains", "Equipment", "Evidence"].forEach((n, i) => {
      if (i === 0) s += `<rect x="14" y="${96 + i * 44}" width="142" height="34" rx="10" fill="#1d3557"/>`;
      s += t(28, 119 + i * 44, n, { s: 15, w: i === 0 ? 700 : 500, c: i === 0 ? "#fff" : "#7f93ad" });
    });
    const x0 = 200;
    s += `<rect x="${x0}" y="30" width="${w - x0 - 30}" height="64" rx="16" fill="#1c2b44"/>`;
    s += t(x0 + 22, 70, "GA-1201A tripped on high vibration. Can I restart?", { s: 18, w: 600, c: "#fff" });
    ["Symptom: high vibration", "Likely cause, from records", "Failure chain: trip"].forEach((n, i) => {
      const y = 124 + i * 96;
      s += `<rect x="${x0 + 20}" y="${y}" width="${w - x0 - 230}" height="66" rx="14" fill="#ffffff"/>`;
      s += t(x0 + 42, y + 41, n, { s: 18, w: 700 });
      s += `<rect x="${w - 190}" y="${y + 17}" width="120" height="32" rx="16" fill="#0ea5e9" fill-opacity="0.18"/>`;
      s += t(w - 130, y + 39, "✓ cited", { s: 15, w: 700, c: "#7dd3fc", anchor: "middle" });
      if (i < 2) s += `<path d="M${x0 + 200} ${y + 70} v18 m-8 -8 l8 8 l8 -8" stroke="#7f93ad" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    s += `<rect x="${x0}" y="424" width="${w - x0 - 30}" height="92" rx="16" fill="#1c2b44"/>`;
    s += t(x0 + 22, 460, "VERIFIED ANSWER", { s: 14, w: 700, c: "#7ee2a8", ls: 2 });
    s += t(x0 + 22, 492, "Built only from verified claims, each with its evidence ID", { s: 16, w: 500, c: "#fff" });
    return s;
  };
  await render(
    "cascade",
    b,
    column({
      ...b,
      mark: markTile(glyph),
      name: "Cascade",
      tagline: ["Plant answers", "backed by evidence."],
      wordmark: "Cascade",
      desc: ["A manufacturing knowledge hub where every", "answer keeps its evidence. An LLM may only", "pick verified claims, never invent them."],
      chips: ["Python", "JavaScript", "Retrieval", "LLM"],
    }) +
      browser({ x: 900, y: 230, w: 880, h: 600, rot: -4, url: "cascade · knowledge hub", content: app }) +
      stat({ x: 940, y: 790, label: "PARITY-CHECKED ANSWERS", value: "467", sub: "Python and JS engines agree" }),
  );
}

/* ======================= 5. Lido Flow ======================= */
{
  const b = { g1: "#1d6fe0", g2: "#22c5c0", tint: "#e2f2ff" };
  const SRC = `${LIDO}/docs/design/lido_overview_01_home_split.png`;
  const logo = await uri(`${LIDO}/assets/branding/lido_flow_logo.png`, { width: 200 });
  const lifo = await uri(`${LIDO}/assets/images/mascot/lifo_happy.png`, { width: 420 });
  const home = await uri(SRC, { extract: { left: 222, top: 342, width: 782, height: 1656 }, width: 520 });
  const split = await uri(SRC, { extract: { left: 1046, top: 342, width: 782, height: 1656 }, width: 520 });
  const shot = (href, cx, cy, rot) => {
    const w = 330;
    const h = Math.round((w * 1656) / 782);
    const clip = id("lp");
    return `<g filter="url(#shadow)" transform="translate(${cx} ${cy}) rotate(${rot}) translate(${-w / 2} ${-h / 2})">
      <clipPath id="${clip}"><rect width="${w}" height="${h}" rx="${w * 0.15}"/></clipPath>
      <image href="${href}" width="${w}" height="${h}" clip-path="url(#${clip})" preserveAspectRatio="xMidYMid slice"/></g>`;
  };
  await render(
    "lido-flow",
    b,
    column({
      ...b,
      mark: `<image href="${logo}" x="84" y="80" width="90" height="90"/>`,
      name: "Lido Flow",
      tagline: ["Calm like the sea,", "clear like glass."],
      wordmark: "Lido Flow",
      desc: ["A calm finance app for students: budgets,", "split bills and Lifo, the AI assistant.", "I led it end to end as Project Manager."],
      chips: ["Flutter", "Supabase", "AI Chatbot", "Product"],
    }) +
      shot(split, 1370, 520, 7) +
      shot(home, 1110, 590, -6) +
      `<image href="${lifo}" x="1330" y="770" width="250" height="250"/>` +
      stat({ x: 900, y: 860, w: 330, label: "MEET LIFO", value: "AI buddy", vs: 46, sub: "Budget advice in chat" }),
  );
}

/* ======================= 6. Cyber Escape ======================= */
{
  const b = { g1: "#ec4899", g2: "#06b6d4", tint: "#fde7f4" };
  const shot = await uri("design/src/edu-scam-home.png", { width: 1500 });
  const logo = await uri("design/src/cyber-logo.png");
  const site = (w, h) => `<image href="${shot}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
  await render(
    "escape-room",
    b,
    column({
      ...b,
      mark: markImage(logo, true),
      name: "Cyber Escape",
      tagline: ["Spot the trap.", "Escape the scam."],
      wordmark: "Cyber Escape",
      desc: ["An interactive game where students solve", "real scam cases on a simulated phone.", "Used in a workshop for 41 students."],
      chips: ["Web Game", "Cybersecurity", "Education"],
    }) +
      browser({ x: 880, y: 240, w: 900, h: 50 + Math.round((900 * 1800) / 2880), rot: -4, url: "edu-scam.vercel.app", content: site }) +
      stat({ x: 930, y: 790, w: 350, label: "STUDENT UNDERSTANDING", value: "+31.36%", vs: 54, sub: "Pre-test 45.08 → post 59.22" }),
  );
}
