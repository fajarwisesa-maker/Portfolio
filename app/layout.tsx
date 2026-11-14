import type { Metadata, Viewport } from "next";
import "./globals.css";

// Set NEXT_PUBLIC_SITE_URL to your live address (for example https://fajar.pages.dev) so shared links get an absolute preview image.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "Fajar Ilham Surya Wisesa · Aspiring Data Scientist";
const description =
  "Portfolio of Fajar Ilham Surya Wisesa, Informatics student at President University focused on data science, analysis and machine learning.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  authors: [{ name: "Fajar Ilham Surya Wisesa", url: "https://www.linkedin.com/in/fajar-wisesa" }],
  openGraph: { type: "website", title, description, siteName: "Fajar Ilham Surya Wisesa", locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
