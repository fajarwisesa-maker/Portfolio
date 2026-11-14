/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` and `next build` use separate folders, so running a production build
  // while the dev server is up can't break the dev server's styles and modules.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};
export default nextConfig;
