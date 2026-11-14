// Site icons and the link-preview image (Open Graph), in the Ink & Paper style.
// usage: node scripts/brand.mjs   -> writes app/icon.svg, app/apple-icon.png, app/opengraph-image.png, app/twitter-image.png
import sharp from "sharp";
import fs from "node:fs";

const INK = "#111111";
const PAPER = "#efebe2";
const ACCENT = "#ff4b1f";

// Favicon: ink tile, an orange dot and a trail of ink dots (the "same data, new shape" idea).
const dots = [
  [20, 44, 3.2],
  [31, 38, 3.6],
  [42, 31, 4.2],
  [52, 22, 4.8],
].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" fill-opacity="0.9"/>`).join("");
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="${INK}"/>${dots}<circle cx="46" cy="46" r="9.5" fill="${ACCENT}"/></svg>`;
fs.writeFileSync("app/icon.svg", icon);
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile("app/apple-icon.png");

// Link preview 1200x630: headline on the left, the dot portrait on the right.
const W = 1200;
const H = 630;
const portrait = await sharp("design/stipple-ink.png").resize({ height: 600 }).toBuffer();
const pm = await sharp(portrait).metadata();
const grain = (() => {
  let s = "";
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 700; i++) s += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(1 + rnd() * 1.6).toFixed(1)}" fill="${INK}" fill-opacity="${(0.05 + rnd() * 0.1).toFixed(2)}"/>`;
  return s;
})();
const t = (x, y, str, o) => `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${o.s}" font-weight="${o.w}" fill="${o.c ?? INK}" letter-spacing="${o.ls ?? 0}">${str}</text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/>${grain}
  ${t(72, 120, "FAJAR ILHAM SURYA WISESA", { s: 24, w: 700, c: "#d93a12", ls: 4 })}
  ${t(68, 250, "I turn messy data", { s: 78, w: 800, ls: -3.5 })}
  ${t(68, 335, "into <tspan fill=\"" + ACCENT + "\">decisions</tspan>", { s: 78, w: 800, ls: -3.5 })}
  ${t(68, 420, "people can act on.", { s: 78, w: 800, ls: -3.5 })}
  ${t(72, 500, "Aspiring Data Scientist · President University", { s: 28, w: 500, c: "#5e5a52" })}
  <rect x="72" y="540" width="150" height="8" rx="4" fill="${ACCENT}"/></svg>`;
const base = await sharp(Buffer.from(svg))
  .composite([{ input: portrait, left: W - pm.width + 60, top: H - pm.height + 10 }])
  .png()
  .toBuffer();
fs.writeFileSync("app/opengraph-image.png", base);
fs.writeFileSync("app/twitter-image.png", base);
console.log("brand assets written");
