// Renders the dot portrait (same sampling rules as ParticleField) to transparent PNGs, one per look.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "public/media/portrait-gils.webp";
const S = 190; // sample grid
const OUT = 1100; // output px
const meta = await sharp(SRC).metadata();
const crop = Math.round(meta.width * 0.76);
const { data } = await sharp(SRC)
  .extract({ left: Math.round(meta.width * 0.12), top: Math.round(meta.height * 0.17), width: crop, height: crop })
  .resize(S, S).removeAlpha().raw().toBuffer({ resolveWithObject: true });

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const pts = [];
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
  const k = (y * S + x) * 3;
  const [r, g, b] = [data[k], data[k + 1], data[k + 2]];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  if (lum > 190 && chroma < 26) continue;
  pts.push({ x: x + rnd(), y: y + rnd(), lum });
}

// mode "ink": dark areas get dense dots (print look). mode "light": bright areas glow (night look).
function svg(color, mode) {
  const k = OUT / S;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">`;
  for (const p of pts) {
    const t = p.lum / 235;
    const keep = mode === "ink" ? 0.2 + (1 - t) * 0.75 : 0.22 + t * 0.78;
    if (rnd() > keep) continue;
    const rad = mode === "ink" ? 1.3 + (1 - t) * 1.5 : 1.1 + t * 1.9;
    const op = mode === "ink" ? 0.55 + (1 - t) * 0.45 : 0.3 + t * 0.7;
    out += `<circle cx="${(p.x * k).toFixed(1)}" cy="${(p.y * k).toFixed(1)}" r="${rad.toFixed(2)}" fill="${color}" fill-opacity="${op.toFixed(2)}"/>`;
  }
  return out + "</svg>";
}
const looks = { ink: ["#111111", "ink"], amber: ["#F5A23A", "light"], espresso: ["#2A1D14", "ink"] };
for (const [name, [color, mode]] of Object.entries(looks)) {
  seed = 7;
  await sharp(Buffer.from(svg(color, mode))).png().toFile(`design/stipple-${name}.png`);
  console.log(name, fs.statSync(`design/stipple-${name}.png`).size);
}
