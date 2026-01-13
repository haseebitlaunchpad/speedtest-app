import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SpeedTest Pro | Ultimate Internet Speed Test",
    template: "%s | SpeedTest Pro",
  },
  description: "Test your internet connection bandwidth with precision. Accurately measure Ping, Jitter, Download, and Upload speeds. 100% free and optimized for mobile & desktop.",
  keywords: ["speed test", "internet speed", "bandwidth test", "wifi speed", "connection test", "ping test", "upload speed", "download speed", "5g speed test"],
  authors: [{ name: "SpeedTest Pro" }],
  creator: "SpeedTest Pro",
  publisher: "SpeedTest Pro",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://speedtest-pro.vercel.app",
    title: "SpeedTest Pro | Ultimate Internet Speed Test",
    description: "Test your internet connection bandwidth with precision. Measure Ping, Jitter, Download, and Upload speeds instantly.",
    siteName: "SpeedTest Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeedTest Pro | Ultimate Internet Speed Test",
    description: "Test your internet connection bandwidth with precision. Measure Ping, Jitter, Download, and Upload speeds instantly.",
    creator: "@speedtestpro",
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7722035183156465" crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
