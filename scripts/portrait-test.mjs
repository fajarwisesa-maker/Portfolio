// Offline preview of the ink-stipple portrait used by DotField (tune here, then copy the numbers).
// usage: node scripts/portrait-test.mjs '{"N":12000}' design/portrait-test.png
import sharp from "sharp";
const P = JSON.parse(process.argv[2] ?? "{}");
const S = P.S ?? 200; // sampling grid
const N = P.N ?? 12000; // dots
const OUT = P.OUT ?? 620; // rendered size (≈ hero portrait box on desktop)
const SRC = "public/media/portrait-gils.webp";
const meta = await sharp(SRC).metadata();
const crop = Math.round(meta.width * (P.size ?? 0.76));
const { data: d } = await sharp(SRC)
  .extract({ left: Math.round(meta.width * (P.left ?? 0.12)), top: Math.round(meta.height * (P.top ?? 0.17)), width: crop, height: crop })
  .resize(S, S).removeAlpha().raw().toBuffer({ resolveWithObject: true });

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const dark = new Float32Array(S * S), wall = new Uint8Array(S * S);
for (let i = 0; i < S * S; i++) {
  const k = i * 3, lum = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
  const ch = Math.max(d[k], d[k + 1], d[k + 2]) - Math.min(d[k], d[k + 1], d[k + 2]);
  if (lum > 190 && ch < 26) wall[i] = 1;
  dark[i] = 1 - lum / 255;
}
const R = P.blur ?? 4, tmp = new Float32Array(S * S), blur = new Float32Array(S * S);
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let s = 0, n = 0; for (let k = -R; k <= R; k++) { const xx = x + k; if (xx >= 0 && xx < S) { s += dark[y * S + xx]; n++; } } tmp[y * S + x] = s / n; }
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let s = 0, n = 0; for (let k = -R; k <= R; k++) { const yy = y + k; if (yy >= 0 && yy < S) { s += tmp[yy * S + x]; n++; } } blur[y * S + x] = s / n; }

// weight per pixel
const w = new Float32Array(S * S);
let total = 0;
for (let i = 0; i < S * S; i++) {
  if (wall[i]) continue;
  let v = dark[i] + (P.sharp ?? 1.6) * (dark[i] - blur[i]);
  v = Math.min(1, Math.max(0, (v - (P.lo ?? 0.22)) / (P.range ?? 0.6)));
  const x = i % S, y = (i / S) | 0;
  const at = (xx, yy) => dark[Math.min(S - 1, Math.max(0, yy)) * S + Math.min(S - 1, Math.max(0, xx))];
  const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
  const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
  const edge = Math.min(1, Math.hypot(gx, gy) * (P.ek ?? 1.6));
  w[i] = (P.floor ?? 0.04) + (P.cap ?? 0.55) * Math.pow(v, P.gamma ?? 1.2) + (P.ew ?? 0.5) * edge;
  total += w[i];
}
// cumulative distribution -> exactly N dots, placed in proportion to weight
const cdf = new Float32Array(S * S);
let acc = 0;
for (let i = 0; i < S * S; i++) { acc += w[i]; cdf[i] = acc / total; }
const pick = (u) => { let lo = 0, hi = S * S - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < u) lo = m + 1; else hi = m; } return lo; };

const ALPHAS = [0.45, 0.65, 0.85, 1];
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}"><rect width="100%" height="100%" fill="#efebe2"/>`;
for (let n = 0; n < N; n++) {
  const i = pick(rnd());
  const x = (i % S) + rnd(), y = Math.floor(i / S) + rnd();
  const v = Math.min(1, w[i]);
  const r = ((P.r0 ?? 0.55) + (P.r1 ?? 0.9) * v) * (OUT / 620);
  const a = ALPHAS[Math.min(3, Math.floor(v * 4))];
  svg += `<circle cx="${((x / S) * OUT).toFixed(1)}" cy="${((y / S) * OUT).toFixed(1)}" r="${r.toFixed(2)}" fill="#111" fill-opacity="${a}"/>`;
}
await sharp(Buffer.from(svg + "</svg>")).png().toFile(process.argv[3] ?? "design/portrait-test.png");
console.log("ok");
