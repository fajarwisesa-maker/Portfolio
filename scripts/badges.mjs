// Google AI course badges for the certificates panel.
// usage: node scripts/badges.mjs   (reads ../CERTIFICATE, writes public/media/badge-*.webp)
import sharp from "sharp";

const OUT = "public/media";
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
console.log("badges ok");
