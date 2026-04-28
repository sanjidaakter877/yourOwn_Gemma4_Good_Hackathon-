import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "yourOwn",
  description: "Voice-first cognitive support companion"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}