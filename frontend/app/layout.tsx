import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "yourOwn",
  description: "Voice-first AI companion for Alzheimer's care, powered by Gemma 4",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
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