// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientUserNav from "@/components/ClientUserNav";
import Logo from "@/components/Logo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Add font-display: swap for better CLS
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Add font-display: swap for better CLS
});

// Define the URL for metadata base
// In production, this should be your deployed domain
// In development, it will use localhost:3000
const metadataBaseUrl = 
  process.env.NODE_ENV === 'production'
    ? 'https://documentary-credit-generator.vercel.app'
    : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "Documentary Credit Generator",
  description: "Generate UCP 600 compliant documentary credit drafts from PDF documents",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Documentary Credit Generator',
    description: 'Generate UCP 600 compliant documentary credit drafts from PDF documents',
    siteName: 'Documentary Credit Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentary Credit Generator',
    description: 'Generate UCP 600 compliant documentary credit drafts from PDF documents',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        {/* Preload critical assets to reduce CLS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <header className="py-4 px-6 border-b sticky top-0 bg-black z-50 h-[72px]">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Logo />
            <ClientUserNav />
          </div>
        </header>
        <main>{children}</main>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}