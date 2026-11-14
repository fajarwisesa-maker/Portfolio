// Generates the Figcraft preview frames (SVG) for the three looks of the merged site.
// Dots (portrait, folder shape) are rendered to PNG and placed in Figcraft separately.
import sharp from "sharp";
import fs from "node:fs";

fs.mkdirSync("design/svg", { recursive: true });

const LOOKS = {
  A: {
    name: "Ink & Paper",
    bg: "#EFEBE2", ink: "#111111", muted: "#5E5A52", line: "#11111124", accent: "#FF4B1F", onAccent: "#FFFFFF",
    glass: "#FFFFFF", glassOp: 0.62, glassStroke: "#FFFFFF", paper: "#FFFFFF", paperLine: "#1111111F",
    folders: ["#FF4B1F", "#111111", "#BDB6A6"], dots: "#111111", dotMode: "ink",
    head: "Inter", headW: 800, headLs: -3, body: "Inter", mono: "Ubuntu Sans Mono", h1: 68, h2: 72, accentItalic: false,
    cat: { body: "#111111", eye: "#FFF8EC", pupil: "#111111", ear: "#FF4B1F" },
  },
  B: {
    name: "Graphite & Amber",
    bg: "#141210", ink: "#F1E9DC", muted: "#A39A8B", line: "#F1E9DC24", accent: "#F5A23A", onAccent: "#1A1206",
    glass: "#FFFFFF", glassOp: 0.07, glassStroke: "#F5A23A73", paper: "#221D18", paperLine: "#F1E9DC26",
    folders: ["#F5A23A", "#9A6420", "#4A4037"], dots: "#F5A23A", dotMode: "light",
    head: "Playfair Display", headW: 500, headLs: -1.5, body: "Inter", mono: "Inter", h1: 76, h2: 84, accentItalic: true,
    cat: { body: "#F1E9DC", eye: "#141210", pupil: "#F5A23A", ear: "#F5A23A" },
  },
  C: {
    name: "Sand & Espresso",
    bg: "#DCCBAA", ink: "#2A1D14", muted: "#6B5846", line: "#2A1D1426", accent: "#C8501E", onAccent: "#FFFFFF",
    glass: "#FFF6E6", glassOp: 0.6, glassStroke: "#FFF6E6", paper: "#FFF9EE", paperLine: "#2A1D141F",
    folders: ["#C8501E", "#2A1D14", "#B08F5E"], dots: "#2A1D14", dotMode: "ink",
    head: "Poppins", headW: 700, headLs: -2.2, body: "Poppins", mono: "Consolas", h1: 60, h2: 64, accentItalic: false,
    cat: { body: "#2A1D14", eye: "#FFF8EC", pupil: "#2A1D14", ear: "#C8501E" },
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const t = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.family}" font-size="${o.size ?? 16}" font-weight="${o.weight ?? 400}"` +
  `${o.italic ? ' font-style="italic"' : ""}${o.ls ? ` letter-spacing="${o.ls}"` : ""}${o.anchor ? ` text-anchor="${o.anchor}"` : ""}` +
  ` fill="${o.fill}"${o.op ? ` fill-opacity="${o.op}"` : ""}>${esc(s)}</text>`;

function cat(L, x, y, k, happy) {
  const c = L.cat;
  const eyes = happy
    ? `<path d="M36 54q8-9 16 0M68 54q8-9 16 0" fill="none" stroke="${c.eye}" stroke-width="2.6" stroke-linecap="round"/>`
    : `<ellipse cx="44" cy="52" rx="9" ry="10" fill="${c.eye}"/><ellipse cx="76" cy="52" rx="9" ry="10" fill="${c.eye}"/>` +
      `<ellipse cx="46" cy="55" rx="4" ry="6" fill="${c.pupil}"/><ellipse cx="78" cy="55" rx="4" ry="6" fill="${c.pupil}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${k})">
    <path d="M96 84c14 2 20-8 16-18" fill="none" stroke="${c.body}" stroke-width="7" stroke-linecap="round"/>
    <path d="M22 96V52c0-8 3-14 8-19L26 8l22 14c8-3 16-3 24 0L94 8l-4 25c5 5 8 11 8 19v44z" fill="${c.body}"/>
    <path d="M31 14l3 14 9-7zM89 14l-3 14-9-7z" fill="${c.ear}"/>${eyes}
    <path d="M57 64h6l-3 4z" fill="${c.ear}"/></g>`;
}

function header(L, active, happy) {
  const y = 58;
  const links = [["Prologue", 474], ["Lead", 566], ["Data", 630], ["Work", 694], ["Guestbook", 762], ["Contact", 866]];
  let s = `<rect x="330" y="${y}" width="780" height="56" rx="28" fill="${L.glass}" fill-opacity="${L.glassOp}" stroke="${L.glassStroke}" stroke-width="1"/>`;
  s += t(360, y + 35, "Wisa", { family: L.head, size: 20, weight: 700, fill: L.ink });
  s += `<circle cx="${L.head === "Poppins" ? 426 : L.head === "Inter" ? 419 : 416}" cy="${y + 29}" r="3.5" fill="${L.accent}"/>`;
  for (const [label, x] of links) {
    if (label === active) s += `<rect x="${x - 14}" y="${y + 10}" width="${label.length * 8.6 + 28}" height="36" rx="18" fill="${L.ink}"/>`;
    s += t(x, y + 34, label, { family: L.body, size: 14.5, weight: 500, fill: label === active ? L.bg : L.muted });
  }
  s += `<rect x="966" y="${y + 9}" width="130" height="38" rx="19" fill="${L.accent}"/>`;
  s += t(1031, y + 33, "Download CV", { family: L.body, size: 13.5, weight: 600, fill: L.onAccent, anchor: "middle" });
  s += cat(L, 884, y - 58, 0.62, happy);
  if (happy) {
    s += `<rect x="806" y="6" width="74" height="30" rx="12" fill="${L.ink}"/>`;
    s += t(843, 26, "RORRR!", { family: L.head, size: 13, weight: 700, fill: L.bg, anchor: "middle" });
  }
  return s;
}

function coffee(L, poured) {
  const cx = 1360, cy = 826;
  let s = `<circle cx="${cx}" cy="${cy}" r="32" fill="${L.glass}" fill-opacity="${Math.max(L.glassOp, 0.12)}" stroke="${L.glassStroke}" stroke-width="1"/>`;
  s += `<g transform="translate(${cx - 15} ${cy - 17}) scale(0.62)" fill="none" stroke="${L.accent}" stroke-linecap="round">
    <path d="M17 13c-2-3 2-4 0-7M24 13c-2-3 2-4 0-7M31 13c-2-3 2-4 0-7" stroke-width="2"/>
    <path d="M10 19h28v10a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" fill="${L.accent}" stroke="none"/>
    <path d="M38 22h3a5 5 0 0 1 0 10h-4" stroke-width="3"/></g>`;
  s += `<rect x="${cx + 8}" y="${cy - 40}" width="34" height="24" rx="12" fill="${L.accent}"/>`;
  s += t(cx + 25, cy - 23, poured ? "28" : "27", { family: L.mono, size: 12, weight: 700, fill: L.onAccent, anchor: "middle" });
  if (poured) {
    s += `<rect x="1158" y="${cy - 16}" width="158" height="34" rx="12" fill="${L.ink}"/>`;
    s += t(1237, cy + 6, "Thanks for the coffee!", { family: L.body, size: 13, weight: 500, fill: L.bg, anchor: "middle" });
  }
  return s;
}

const frame = (L, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
  <defs>
    <radialGradient id="glow" cx="0.74" cy="0.5" r="0.6"><stop offset="0" stop-color="${L.accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${L.accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${L.accent}" stop-opacity="0"/><stop offset="1" stop-color="${L.accent}" stop-opacity="1"/></linearGradient>
  </defs>
  <rect width="1440" height="900" fill="${L.bg}"/>
  ${L.dotMode === "light" ? '<rect width="1440" height="900" fill="url(#glow)"/>' : ""}
  ${body}</svg>`;

function hero(L) {
  const s = L.h1, x = 96, lh = s * 1.06, y0 = 372;
  const mono = { family: L.mono, size: 12.5, weight: 500, fill: L.muted, ls: 1.4 };
  let b = header(L, null, false);
  b += `<rect x="${x}" y="212" width="296" height="36" rx="18" fill="${L.glass}" fill-opacity="${L.glassOp}" stroke="${L.glassStroke}"/>`;
  b += `<circle cx="${x + 20}" cy="230" r="4" fill="${L.accent}"/>`;
  b += t(x + 34, 235, "Open to data & AI internships", { family: L.body, size: 13.5, weight: 500, fill: L.ink });
  b += t(x, 296, "FAJAR ILHAM SURYA WISESA", { ...mono, fill: L.accent, size: 13.5, weight: 600, ls: 2 });
  const H = { family: L.head, size: s, weight: L.headW, fill: L.ink, ls: L.headLs };
  b += t(x, y0, "I turn messy data", H);
  b += t(x, y0 + lh, "into", H);
  b += t(x + s * (L.head === "Poppins" ? 2.1 : L.head === "Inter" ? 2.05 : 1.95), y0 + lh, "decisions", { ...H, fill: L.accent, italic: L.accentItalic });
  b += t(x, y0 + lh * 2, "people can act on.", H);
  const ys = y0 + lh * 2 + 52;
  b += t(x, ys, "Aspiring Data Scientist. Informatics, President University.", { family: L.body, size: 18, fill: L.muted });
  b += t(x, ys + 28, "Python, data analysis and machine learning.", { family: L.body, size: 18, fill: L.muted });
  const yb = ys + 62;
  b += `<rect x="${x}" y="${yb}" width="168" height="52" rx="26" fill="${L.ink}"/>`;
  b += t(x + 84, yb + 32, "View projects", { family: L.body, size: 15.5, weight: 600, fill: L.bg, anchor: "middle" });
  b += `<rect x="${x + 180}" y="${yb}" width="172" height="52" rx="26" fill="${L.glass}" fill-opacity="${L.glassOp}" stroke="${L.line}"/>`;
  b += t(x + 266, yb + 32, "Read the story", { family: L.body, size: 15.5, weight: 600, fill: L.ink, anchor: "middle" });
  // cursor line
  b += `<path d="M250 838 C 380 760, 470 870, 600 790 S 760 690, 838 742" fill="none" stroke="url(#trail)" stroke-width="2.6" stroke-linecap="round"/>`;
  b += `<path d="M838 742 l0 20 l5.5 -5 l4.5 9.5 l4 -2 l-4.5 -9 l7.5 -0.5 z" fill="${L.ink}" stroke="${L.bg}" stroke-width="1"/>`;
  b += t(x, 858, "SCROLL: THE DOTS SETTLE INTO THE PORTRAIT", mono);
  b += `<circle cx="1016" cy="853" r="4" fill="${L.accent}"/>`;
  b += t(1028, 858, "PATTERN FOUND / SIGNAL 100%", mono);
  // stray dots still drifting in
  let sd = 5;
  const r2 = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 230; i++) {
    const px = 640 + r2() * 780, py = 140 + r2() * 640;
    b += `<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${(1 + r2() * 1.2).toFixed(1)}" fill="${L.dots}" fill-opacity="${(0.15 + r2() * 0.4).toFixed(2)}"/>`;
  }
  b += coffee(L, false);
  return frame(L, b);
}

function folder(L, x, y, w, h, color, label, sub, open) {
  const py = open ? y - 22 : y + 22;
  let s = "";
  if (open) s += `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="22" fill="none" stroke="${L.accent}" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>`;
  s += `<rect x="${x}" y="${y}" width="${w * 0.42}" height="30" rx="10" fill="${color}"/>`;
  s += `<rect x="${x}" y="${y + 16}" width="${w}" height="${h - 16}" rx="14" fill="${color}"/>`;
  for (const [dx, rot] of [[18, -4], [44, 3]]) {
    const cx = x + dx + (w - 70) / 2, cy = py + 56;
    s += `<g transform="rotate(${open ? rot * 1.8 : rot} ${cx} ${cy})"><rect x="${x + dx}" y="${py}" width="${w - 70}" height="112" rx="7" fill="${L.paper === "#221D18" ? "#F1E9DC" : "#FFFFFF"}"/>` +
      `<rect x="${x + dx + 14}" y="${py + 16}" width="${w * 0.36}" height="7" rx="3.5" fill="#00000030"/>` +
      `<rect x="${x + dx + 14}" y="${py + 32}" width="${w * 0.5}" height="5" rx="2.5" fill="#00000018"/>` +
      `<rect x="${x + dx + 14}" y="${py + 44}" width="${w * 0.42}" height="5" rx="2.5" fill="#00000018"/></g>`;
  }
  const fy = y + (open ? 98 : 72);
  s += `<rect x="${x}" y="${fy}" width="${w}" height="${y + h - fy}" rx="14" fill="${L.dotMode === "light" ? "#2A241E" : L.glass}" fill-opacity="${L.dotMode === "light" ? 0.78 : 0.7}" stroke="${L.glassStroke}" stroke-width="1"/>`;
  s += t(x + 18, y + h - 40, label, { family: L.head, size: 21, weight: Math.max(L.headW, 600), fill: L.ink, ls: -0.4 });
  s += t(x + 18, y + h - 18, sub, { family: L.body, size: 12.5, fill: L.muted });
  return s;
}

function chapter(L) {
  const x = 96;
  const mono = { family: L.mono, size: 12.5, weight: 600, fill: L.accent, ls: 2 };
  let b = header(L, "Work", true);
  b += t(x, 176, "CHAPTER 03", mono);
  b += `<rect x="${x + 100}" y="171" width="30" height="1.5" fill="${L.accent}"/>`;
  b += t(x + 144, 176, "THINGS I LED AND BUILT", mono);
  const H = { family: L.head, size: L.h2, weight: L.headW, fill: L.ink, ls: L.headLs };
  b += t(x, 176 + L.h2 * 1.08, "Where ideas became", H);
  b += t(x + L.h2 * (L.head === "Poppins" ? 10.6 : L.head === "Inter" ? 9.9 : 9.2), 176 + L.h2 * 1.08, "real.", { ...H, fill: L.accent, italic: L.accentItalic });
  // folders
  const fw = 284, fh = 196, fy = 322;
  b += folder(L, x, fy, fw, fh, L.folders[0], "AssistFinance", "Open · Project Manager · 2025", true);
  b += folder(L, x + fw + 26, fy, fw, fh, L.folders[1], "Company Visit 2026", "Event · Project Manager", false);
  b += folder(L, x + (fw + 26) * 2, fy, fw, fh, L.folders[2], "Personal Portfolio", "Website · Designer & Developer", false);
  // case-study sheet
  const sy = 560;
  b += `<rect x="${x}" y="${sy}" width="904" height="290" rx="22" fill="${L.paper}" stroke="${L.paperLine}"/>`;
  b += t(x + 28, sy + 40, "01 · MOBILE APP · AI ASSISTANT · 2025", { ...mono, fill: L.muted, size: 11.5, weight: 500 });
  b += t(x + 28, sy + 84, "AssistFinance", { family: L.head, size: 34, weight: L.headW, fill: L.ink, ls: -1 });
  b += `<rect x="${x + 742}" y="${sy + 24}" width="134" height="30" rx="15" fill="${L.accent}" fill-opacity="0.16"/>`;
  b += t(x + 809, sy + 44, "Project Manager", { family: L.body, size: 12.5, weight: 600, fill: L.accent, anchor: "middle" });
  b += `<rect x="${x + 28}" y="${sy + 108}" width="848" height="1" fill="${L.paperLine}"/>`;
  const cols = [
    ["Problem", ["Students lose track of small daily", "expenses and have no simple way", "to plan savings."]],
    ["What I did", ["Led product development and the", "business model, managed the team", "across UI/UX and technical work."]],
    ["Outcome", ["An app concept with expense", "tracking, savings goals and a", "budgeting chatbot."]],
  ];
  cols.forEach(([h, lines], i) => {
    const cx = x + 28 + i * 290;
    b += t(cx, sy + 146, h, { family: L.head, size: 18, weight: Math.max(L.headW, 600), fill: L.accent, italic: L.accentItalic });
    lines.forEach((ln, k) => (b += t(cx, sy + 176 + k * 23, ln, { family: L.body, size: 14.5, fill: L.muted })));
  });
  ["Mobile App", "Finance", "Chatbot", "Product"].reduce((cx, tag) => {
    const w = tag.length * 7.6 + 24;
    b += `<rect x="${cx}" y="${sy + 246}" width="${w}" height="26" rx="13" fill="none" stroke="${L.paperLine}"/>`;
    b += t(cx + w / 2, sy + 263, tag, { family: L.body, size: 12, fill: L.muted, anchor: "middle" });
    return cx + w + 8;
  }, x + 28);
  // right gutter: label + live comment
  b += t(1052, 556, "SAME DATA, NEW SHAPE", { ...mono, fill: L.muted, size: 11.5, weight: 500 });
  const cy = 598;
  b += `<circle cx="1056" cy="${cy - 9}" r="4" fill="${L.accent}"/>`;
  b += t(1068, cy - 4, "LIVE GUESTBOOK", { ...mono, fill: L.muted, size: 11.5, weight: 500 });
  b += `<rect x="1040" y="${cy + 10}" width="340" height="150" rx="18" fill="${L.glass}" fill-opacity="${L.glassOp}" stroke="${L.glassStroke}"/>`;
  b += `<circle cx="1078" cy="${cy + 46}" r="19" fill="${L.accent}" fill-opacity="0.2"/>`;
  b += t(1078, cy + 51, "TV", { family: L.body, size: 12.5, weight: 700, fill: L.accent, anchor: "middle" });
  b += t(1108, cy + 43, "Test Visitor", { family: L.body, size: 14.5, weight: 600, fill: L.ink });
  b += t(1108, cy + 62, "just now", { family: L.body, size: 12, fill: L.muted });
  b += t(1060, cy + 94, "Love the dots turning into a folder!", { family: L.body, size: 14.5, fill: L.ink });
  const chips = [["Like", 0, false], ["Love", 0, false], ["Fire", 2, true], ["Haha", 0, false], ["Coffee", 1, false]];
  chips.reduce((cx, [name, n, on]) => {
    const w = name.length * 7 + (n ? 34 : 20);
    b += `<rect x="${cx}" y="${cy + 114}" width="${w}" height="28" rx="14" fill="${on ? L.accent : "none"}" fill-opacity="${on ? 0.18 : 1}" stroke="${on ? L.accent : L.line}" stroke-width="${on ? 1.5 : 1}"/>`;
    b += t(cx + w / 2, cy + 132, n ? `${name} ${n}` : name, { family: L.body, size: 12, weight: on ? 700 : 500, fill: on ? L.accent : L.muted, anchor: "middle" });
    return cx + w + 6;
  }, 1060);
  b += coffee(L, true);
  return frame(L, b);
}

// --- dot shapes as PNG (folder silhouette for the chapter frame) ---
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
async function folderDots(L, file) {
  const W = 680, Hh = 500;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}">`;
  const inside = (px, py) => (px > 90 && px < 590 && py > 150 && py < 440) || (px > 90 && px < 300 && py > 100 && py < 160);
  const edge = (px, py) => Math.min(Math.abs(px - 90), Math.abs(px - 590), Math.abs(py - 440), py < 160 ? Math.abs(py - 100) : Math.abs(py - 150));
  for (let i = 0; i < 5200; i++) {
    const px = rnd() * W, py = rnd() * Hh;
    const isIn = inside(px, py);
    if (!isIn && rnd() > 0.035) continue;
    const e = isIn ? edge(px, py) : 99;
    const dense = isIn ? (e < 14 ? 1 : 0.42) : 1;
    if (rnd() > dense) continue;
    const r = isIn ? (e < 14 ? 2.6 : 1.9) : 1.5;
    const op = isIn ? (e < 14 ? 0.95 : 0.6) : 0.35;
    s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="${L.dots}" fill-opacity="${op}"/>`;
  }
  await sharp(Buffer.from(s + "</svg>")).png().toFile(file);
}

for (const [k, L] of Object.entries(LOOKS)) {
  fs.writeFileSync(`design/svg/${k}-hero.svg`, hero(L));
  fs.writeFileSync(`design/svg/${k}-chapter.svg`, chapter(L));
  seed = 11;
  await folderDots(L, `design/dots-folder-${k}.png`);
  console.log(k, L.name, "ok");
}
