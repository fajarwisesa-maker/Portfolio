import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fajar Ilham Surya Wisesa · Aspiring Data Scientist",
  description:
    "Portfolio of Fajar Ilham Surya Wisesa, Informatics student at President University focused on data science, analysis and machine learning.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
