// Converts any photo to a small WebP and puts it in public/media.
// usage: npm run photo -- "<path to photo>" <name> [width]
// example: npm run photo -- "C:\Users\me\Desktop\trophy.jpg" moment-trophy 1200
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const [src, name, width = "1400"] = process.argv.slice(2);
if (!src || !name) {
  console.log('usage: npm run photo -- "<path to photo>" <name> [width]');
  process.exit(1);
}
if (!fs.existsSync(src)) {
  console.error("File not found:", src);
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(name)) {
  console.error("Use only lowercase letters, numbers and dashes in the name, e.g. moment-trophy");
  process.exit(1);
}
const out = path.resolve("public/media", `${name}.webp`);
const info = await sharp(src).rotate().resize({ width: Number(width), withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
console.log(`Saved public/media/${name}.webp  (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
console.log(`In lib/content.ts use: media("${name}")   and for a moment: w: ${info.width}, h: ${info.height}`);
