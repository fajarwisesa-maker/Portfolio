// Ink & Paper cover images for projects without a screenshot, plus a cropped Stratum SHAP cover.
// usage: node scripts/covers.mjs
import sharp from "sharp";
import fs from "node:fs";

const OUT = "public/media";
const W = 1600;
const H = 1100;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

let seed = 9;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** A field of ink dots that thins out from right to left, like the site background. */
function dots() {
  let s = "";
  for (let i = 0; i < 1400; i++) {
    const x = W * (0.45 + 0.55 * Math.sqrt(rnd()));
    const y = rnd() * H;
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1.2 + rnd() * 2.4).toFixed(1)}" fill="#111" fill-opacity="${(0.08 + rnd() * 0.22).toFixed(2)}"/>`;
  }
  return s;
}

function cover({ file, label, title, metric, metricLabel, lines }) {
  seed = 9 + file.length;
  const t = (x, y, str, o) =>
    `<text x="${x}" y="${y}" font-family="${o.f ?? "Inter, Arial, sans-serif"}" font-size="${o.s}" font-weight="${o.w ?? 400}" fill="${o.c ?? "#111"}" letter-spacing="${o.ls ?? 0}">${esc(str)}</text>`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#efebe2"/>${dots()}
  <rect x="80" y="80" width="${W - 160}" height="${H - 160}" fill="none" stroke="#111" stroke-opacity="0.18" stroke-width="2"/>`;
  svg += t(140, 190, label, { s: 30, w: 600, c: "#d93a12", ls: 5, f: "Consolas, monospace" });
  title.forEach((ln, i) => (svg += t(136, 330 + i * 118, ln, { s: 112, w: 800, ls: -5 })));
  const my = 330 + title.length * 118 + 140;
  const ms = metric.length > 8 ? 132 : 190; // long phrases get a smaller size so they fit
  svg += t(136, my, metric, { s: ms, w: 800, c: "#ff4b1f", ls: -ms / 24 });
  svg += t(146, my + (ms > 150 ? 60 : 84), metricLabel, { s: 32, w: 600, c: "#5e5a52", ls: 3, f: "Consolas, monospace" });
  lines.forEach((ln, i) => (svg += t(146, H - 150 + i * 44, ln, { s: 30, c: "#5e5a52", f: "Consolas, monospace" })));
  return sharp(Buffer.from(svg + "</svg>")).webp({ quality: 82 }).toFile(`${OUT}/${file}.webp`);
}

await cover({
  file: "project-phishing",
  label: "RESEARCH PAPER · NLP · 2026",
  title: ["Indonesian", "phishing SMS"],
  metric: "98.90%",
  metricLabel: "ACCURACY · SVM-RBF · F1 0.9851",
  lines: ["TF-IDF · SVM vs Naive Bayes · 1,143 messages", "+ hard-negative test on 239 promo messages"],
});
await cover({
  file: "project-cascade",
  label: "KNOWLEDGE HUB · PYTHON + JS",
  title: ["Cascade"],
  metric: "467",
  metricLabel: "VERIFIED PARITY ANSWERS",
  lines: ["Every answer carries its evidence IDs", "LLM may only pick already-verified claims"],
});
await cover({
  file: "project-escape-room",
  label: "WORKSHOP · CYBERSECURITY · 2026",
  title: ["Escape the", "scam room"],
  metric: "+31.36%",
  metricLabel: "STUDENT UNDERSTANDING · 41 STUDENTS",
  lines: ["Pre-test 45.08 → post-test 59.22", "SMK Budi Perkasa"],
});

await cover({
  file: "project-siaga",
  label: "AGENTIC AI HACKATHON 2026 · FINALIST",
  title: ["SIAGA"],
  metric: "Signal → action",
  metricLabel: "SUPERVISED-AUTONOMY SUPPLY-CHAIN AGENT",
  lines: ["Informal disruption signals in, verified actions out", "SAP AI Core · AWS · Claude"],
});

// Stratum: the SHAP beeswarm from the repo, cropped to the chart.
if (fs.existsSync("design/src/stratum-shap.png")) {
  await sharp("design/src/stratum-shap.png").resize({ width: 1600 }).webp({ quality: 84 }).toFile(`${OUT}/project-stratum.webp`);
}

// Google AI course badges.
const SRC = "../CERTIFICATE";
const badges = {
  "AI for Brainstorming and Planning": "Google AI for Brainstorming and Planning.png",
  "AI for Research and Insights": "AI for Research and Insights.png",
  "AI for Writing and Communicating": "AI for Writing and Communicating.png",
  "AI for Content Creation": "AI for Content Creation.png",
  "AI for Data Analysis": "AI for Data Analysis.png",
  "AI for App Building": "AI for App Building.png",
  "AI for App Deployment": "AI for App Deployment.png",
};
for (const [name, file] of Object.entries(badges)) {
  const slug = "badge-" + name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "");
  await sharp(`${SRC}/${file}`).resize({ width: 320 }).webp({ quality: 86 }).toFile(`${OUT}/${slug}.webp`);
  console.log(slug);
}
console.log("covers ok");
