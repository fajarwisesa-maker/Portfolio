/** Shrinks a picked photo to a small square WebP so avatars stay light and safe to store. */
export async function toAvatarBlob(file: File, size = 256): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image is larger than 5 MB.");
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image."))), "image/webp", 0.82),
  );
}

const UNITS: [number, string][] = [
  [60, "s"],
  [60, "m"],
  [24, "h"],
  [7, "d"],
  [4.35, "w"],
  [12, "mo"],
  [Infinity, "y"],
];
export function timeAgo(ms: number, now = Date.now()): string {
  let v = Math.max(0, (now - ms) / 1000);
  if (v < 45) return "just now";
  for (const [step, unit] of UNITS) {
    if (v < step) return `${Math.floor(v)}${unit} ago`;
    v /= step;
  }
  return "";
}
