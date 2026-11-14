// Copies + converts the original portfolio media into public/media as WebP.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC = path.resolve(process.argv[2] ?? "../portfolioFajar");
const OUT = path.resolve("public/media");
fs.mkdirSync(OUT, { recursive: true });

const S = "EXPERIENCE/SENIOR HIGH SCHOOL";
const files = [
  ["UNFORMAL1.png", "portrait-casual", 1100],
  ["UNFORMAL.png", "portrait-casual-2", 1100],
  ["2FORMAL_PHOTO.png", "portrait-formal", 1100],
  ["FORMAL_PHOTO.jpg", "portrait-formal-2", 900],
  ["GILS.jpg", "portrait-gils", 1100],
  ["CERTIFICATE/Belajar Dasar AI_page-0001.jpg", "cert-dicoding-ai", 1400],
  ["CERTIFICATE/Belajar Dasar Data Science_page-0001.jpg", "cert-dicoding-ds", 1400],
  ["CERTIFICATE/Global Entrepreneurship & Innovation Bootcamp_page-0001.jpg", "cert-thunderbird", 1400],
  ["CERTIFICATE/Interactive Communication Training 2025.jpg", "cert-ict-2025", 1400],
  ["EXPERIENCE/COLLEGE/Member of Relations and Communications PUMA INFORMATICS.jpeg", "exp-puma", 1400],
  [`${S}/Chairperson of the Student Representative Council (MPK)/Chairperson of the Student Representative Council (MPK).jpg`, "exp-mpk", 1400],
  [`${S}/MC/MC — Graduation Ceremony.jpg`, "exp-mc-graduation", 1400],
  [`${S}/MC/MC — Isra Mi'raj Commemoration.jpg`, "exp-mc-isra-miraj", 1400],
  [`${S}/MC/MC — School Anniversary Event.jpg`, "exp-mc-anniversary", 1400],
  [`${S}/MC/MC — School Event.jpg`, "exp-mc-school-event", 1400],
  [`${S}/STUDENT COUNCIL/Head of Ethics and Moral Values Division of the Student Council.jpg`, "exp-osis-division", 1400],
  [`${S}/STUDENT COUNCIL/President of The Student Council.jpg`, "exp-osis-president", 1400],
  ["PROJECT/AI ASSISTANT FINANCE APP (1).png", "project-assistfinance", 1600],
  ["PROJECT/COMPANY VISIT 1 2026.jpeg", "project-company-visit", 1600],
  ["PROJECT/Personal Portfolio Website.png", "project-portfolio", 1600],
  ["logo/president university logo.png", "logo-presuniv", 320],
  ["logo/sman 2 gunung sahilan.png", "logo-sman2", 320],
];

const manifest = {};
for (const [rel, slug, width] of files) {
  const src = path.join(SRC, rel);
  if (!fs.existsSync(src)) { console.warn("missing:", rel); continue; }
  const img = sharp(src).rotate().resize({ width, withoutEnlargement: true });
  const info = await img.webp({ quality: 80 }).toFile(path.join(OUT, `${slug}.webp`));
  manifest[slug] = { w: info.width, h: info.height };
  console.log(slug, info.width + "x" + info.height, Math.round(info.size / 1024) + "KB");
}
fs.writeFileSync(path.resolve("lib/media-manifest.json"), JSON.stringify(manifest, null, 2));
